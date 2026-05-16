import json
import logging
import re
from collections.abc import Iterable
from dataclasses import dataclass
from hashlib import sha256
from pathlib import Path
from time import perf_counter, sleep

import frontmatter
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter
from redis import Redis
from redis.exceptions import ResponseError

from api.core.config import Settings, get_settings
from api.core.model_client import create_embedding_model

logger = logging.getLogger(__name__)

CONTENT_KEY_PREFIX = "portfolio:content:"
CONTENT_SCHEMA_VERSION = "rag-content-v2"
DEFAULT_BOOST = 1.0
MIN_BOOST = 0.1
MAX_BOOST = 3.0


@dataclass(slots=True)
class ContentChunk:
    """One embedded content chunk ready for indexing."""

    chunk_id: str
    document_id: str
    content_type: str
    path: str
    title: str
    slug: str
    content: str
    embedding_text: str
    metadata: dict[str, object]


@dataclass(slots=True)
class RawMarkdownDocument:
    """Markdown source file with optional frontmatter."""

    path: Path
    relative_path: str
    metadata: dict[str, object]
    body: str


@dataclass(slots=True)
class NormalizedDocument:
    """Markdown document after frontmatter and generated metadata are merged."""

    path: Path
    relative_path: str
    document_id: str
    content_type: str
    title: str
    slug: str
    body: str
    metadata: dict[str, object]
    document_hash: str


@dataclass(slots=True)
class SplitChunk:
    """One split section of a normalized Markdown document."""

    content: str
    section_title: str
    heading_path: list[str]


def run_bootstrap(settings: Settings | None = None) -> None:
    """Rebuild the Redis content index from markdown files on startup."""
    settings = settings or get_settings()
    start = perf_counter()

    content_root = settings.content_root
    logger.info("Bootstrap starting for content root %s.", content_root)
    chunks = load_content_chunks(
        content_root,
        chunk_size=settings.bootstrap_chunk_size,
        chunk_overlap=settings.bootstrap_chunk_overlap,
    )
    logger.info("Loaded %s content chunks from markdown.", len(chunks))

    # Use asgard embedding model to compute vectors for all content chunks
    embedder = create_embedding_model(settings)
    vectors = embedder.embed([build_embedding_text(chunk) for chunk in chunks], as_passage=True)
    logger.info("Received %s embeddings from remote model.", len(vectors))

    # Rebuild the Redis Stack index with all content chunks and their embeddings
    rebuild_content_index(settings, chunks, vectors)

    duration = perf_counter() - start
    logger.info(
        "Bootstrap indexed %s content chunks from %s documents in %.2fs.",
        len(chunks),
        len({chunk.document_id for chunk in chunks}),
        duration,
    )


def load_content_chunks(content_root: Path, *, chunk_size: int, chunk_overlap: int) -> list[ContentChunk]:
    """Load markdown documents and expand them into indexable chunks."""

    chunks: list[ContentChunk] = []
    for raw_document in load_markdown_documents(content_root):
        document = normalize_document(raw_document, content_root=content_root)
        split_chunks = split_document(document, chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        chunks.extend(build_chunks(document, split_chunks, chunk_size=chunk_size, chunk_overlap=chunk_overlap))

    return chunks


def rebuild_content_index(
    settings: Settings,
    chunks: list[ContentChunk],
    vectors: list[list[float]],
) -> None:
    """Drop and recreate the RediSearch index, then load all content chunks."""

    redis = Redis.from_url(settings.redis_url, decode_responses=True)
    wait_for_redis(redis)
    drop_index(redis, settings.redis_index_name)
    vector_dimensions = len(vectors[0]) if vectors else 0
    create_index(redis, settings.redis_index_name, vector_dimensions)

    pipeline = redis.pipeline(transaction=False)
    for chunk, vector in zip(chunks, vectors, strict=True):
        key = f"{CONTENT_KEY_PREFIX}{chunk.chunk_id}"
        payload = build_redis_document(chunk, vector, settings=settings)
        pipeline.execute_command("JSON.SET", key, "$", json.dumps(payload))

    pipeline.execute()


def get_redis_client(settings: Settings | None = None) -> Redis:
    """Create the configured Redis client."""

    settings = settings or get_settings()
    return Redis.from_url(settings.redis_url, decode_responses=True)


def list_indexed_chunks(settings: Settings | None = None) -> list[dict[str, object]]:
    """Return the currently indexed content chunks from Redis."""

    redis = get_redis_client(settings)
    wait_for_redis(redis)

    documents: list[dict[str, object]] = []
    for key in sorted(redis.scan_iter(match=f"{CONTENT_KEY_PREFIX}*")):
        payload = redis.execute_command("JSON.GET", key, "$")
        if not payload:
            continue

        value = json.loads(payload)
        document = value[0] if isinstance(value, list) and value else value
        if isinstance(document, dict):
            documents.append({"redis_key": key, **document})

    return documents


def wait_for_redis(redis: Redis, *, attempts: int = 10, delay_seconds: float = 1.0) -> None:
    """Wait briefly for Redis Stack to accept commands during cold starts."""

    last_error: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            if redis.ping():
                return
        except Exception as error:
            last_error = error
            logger.info("Waiting for Redis Stack to become ready (attempt %s/%s).", attempt, attempts)
            sleep(delay_seconds)
        else:
            break

    if last_error is not None:
        raise last_error
    raise RuntimeError("Redis Stack did not become ready in time.")


def drop_index(redis: Redis, index_name: str) -> None:
    """Drop the RediSearch index and indexed keys when present."""

    try:
        redis.execute_command("FT.DROPINDEX", index_name, "DD")
    except ResponseError as error:
        if "Unknown Index name" not in str(error):
            raise


def create_index(redis: Redis, index_name: str, vector_dimensions: int) -> None:
    """Create the RediSearch JSON index for portfolio content chunks."""

    if vector_dimensions <= 0:
        raise ValueError("Vector dimension must be positive.")

    redis.execute_command(
        "FT.CREATE",
        index_name,
        "ON",
        "JSON",
        "PREFIX",
        "1",
        CONTENT_KEY_PREFIX,
        "SCHEMA",
        "$.chunk_id",
        "AS",
        "chunk_id",
        "TAG",
        "$.document_id",
        "AS",
        "document_id",
        "TAG",
        "$.content_type",
        "AS",
        "content_type",
        "TAG",
        "$.title",
        "AS",
        "title",
        "TEXT",
        "$.slug",
        "AS",
        "slug",
        "TAG",
        "$.path",
        "AS",
        "path",
        "TAG",
        "$.source_uri",
        "AS",
        "source_uri",
        "TEXT",
        "$.section_title",
        "AS",
        "section_title",
        "TEXT",
        "$.content",
        "AS",
        "content",
        "TEXT",
        "$.summary",
        "AS",
        "summary",
        "TEXT",
        "$.question",
        "AS",
        "question",
        "TEXT",
        "$.category",
        "AS",
        "category",
        "TAG",
        "$.visibility",
        "AS",
        "visibility",
        "TAG",
        "$.status",
        "AS",
        "status",
        "TAG",
        "$.audience",
        "AS",
        "audience",
        "TAG",
        "$.priority",
        "AS",
        "priority",
        "NUMERIC",
        "$.boost",
        "AS",
        "boost",
        "NUMERIC",
        "$.featured",
        "AS",
        "featured",
        "TAG",
        "$.current",
        "AS",
        "current",
        "TAG",
        "$.organization",
        "AS",
        "organization",
        "TEXT",
        "$.role",
        "AS",
        "role",
        "TEXT",
        "$.tags[*]",
        "AS",
        "tags",
        "TAG",
        "$.categories[*]",
        "AS",
        "categories",
        "TAG",
        "$.technologies[*]",
        "AS",
        "technologies",
        "TAG",
        "$.skills[*]",
        "AS",
        "skills",
        "TAG",
        "$.keywords[*]",
        "AS",
        "keywords",
        "TAG",
        "$.related_projects[*]",
        "AS",
        "related_projects",
        "TAG",
        "$.related_skills[*]",
        "AS",
        "related_skills",
        "TAG",
        "$.schema_version",
        "AS",
        "schema_version",
        "TAG",
        "$.chunk_index",
        "AS",
        "chunk_index",
        "NUMERIC",
        "$.chunk_count",
        "AS",
        "chunk_count",
        "NUMERIC",
        "$.embedding",
        "AS",
        "embedding",
        "VECTOR",
        "FLAT",
        "6",
        "TYPE",
        "FLOAT32",
        "DIM",
        str(vector_dimensions),
        "DISTANCE_METRIC",
        "COSINE",
    )


def build_redis_document(chunk: ContentChunk, vector: list[float], *, settings: Settings | None = None) -> dict[str, object]:
    """Build the JSON document stored for each content chunk."""

    settings = settings or get_settings()
    payload: dict[str, object] = {
        "chunk_id": chunk.chunk_id,
        "document_id": chunk.document_id,
        "content_type": chunk.content_type,
        "title": chunk.title,
        "slug": chunk.slug,
        "path": chunk.path,
        "content": chunk.content,
        "embedding_text": chunk.embedding_text,
        "embedding_model": settings.embedding_model,
        "embedding": vector,
    }
    payload.update(chunk.metadata)
    return payload


def build_embedding_text(chunk: ContentChunk) -> str:
    """Build the text sent to the embedding model for each chunk."""

    if chunk.embedding_text:
        return chunk.embedding_text

    lines = [
        f"Title: {chunk.title}",
        f"Type: {chunk.content_type}",
        f"Slug: {chunk.slug}",
    ]
    section_title = stringify_scalar(chunk.metadata.get("section_title"))
    if section_title:
        lines.append(f"Section: {section_title}")

    category = stringify_scalar(chunk.metadata.get("category"))
    if category:
        lines.append(f"Category: {category}")

    for label, key in (
        ("Tags", "tags"),
        ("Categories", "categories"),
        ("Technologies", "technologies"),
        ("Skills", "skills"),
        ("Keywords", "keywords"),
    ):
        values = ", ".join(stringify_iterable(chunk.metadata.get(key)))
        if values:
            lines.append(f"{label}: {values}")

    lines.append("")
    lines.append("Content:")
    lines.append(chunk.content)
    return "\n".join(lines)


def load_markdown_documents(content_root: Path) -> list[RawMarkdownDocument]:
    """Read Markdown files and parse optional frontmatter."""

    documents: list[RawMarkdownDocument] = []
    for path in sorted(content_root.glob("**/*.md")):
        post = frontmatter.load(path)
        documents.append(
            RawMarkdownDocument(
                path=path,
                relative_path=path.relative_to(content_root).as_posix(),
                metadata=dict(post.metadata),
                body=normalize_body(post.content),
            )
        )
    return documents


def normalize_document(raw_document: RawMarkdownDocument, *, content_root: Path) -> NormalizedDocument:
    """Merge frontmatter with generated fallback metadata for one document."""

    metadata = normalize_metadata(raw_document.metadata)
    body = raw_document.body
    document_id = build_document_id(raw_document.relative_path, metadata)
    content_type = build_content_type(raw_document.relative_path)
    title = build_title(raw_document.path, metadata, body)
    slug = build_slug(raw_document.path, metadata)
    document_hash = hash_text(body)

    generated_metadata: dict[str, object] = {
        "id": document_id,
        "content_type": content_type,
        "title": title,
        "slug": slug,
        "path": raw_document.relative_path,
        "source_uri": (content_root.name + "/" + raw_document.relative_path).strip("/"),
        "visibility": stringify_scalar(metadata.get("visibility")) or "public",
        "status": stringify_scalar(metadata.get("status")) or "published",
        "priority": normalize_number(metadata.get("priority"), default=0.0),
        "boost": normalize_boost(metadata.get("boost")),
        "document_hash": document_hash,
        "schema_version": CONTENT_SCHEMA_VERSION,
    }
    generated_metadata.update(metadata)
    generated_metadata.update(
        {
            "id": document_id,
            "content_type": content_type,
            "title": title,
            "slug": slug,
            "path": raw_document.relative_path,
            "source_uri": (content_root.name + "/" + raw_document.relative_path).strip("/"),
            "visibility": stringify_scalar(generated_metadata.get("visibility")) or "public",
            "status": stringify_scalar(generated_metadata.get("status")) or "published",
            "priority": normalize_number(generated_metadata.get("priority"), default=0.0),
            "boost": normalize_boost(generated_metadata.get("boost")),
            "document_hash": document_hash,
            "schema_version": CONTENT_SCHEMA_VERSION,
        }
    )

    return NormalizedDocument(
        path=raw_document.path,
        relative_path=raw_document.relative_path,
        document_id=document_id,
        content_type=content_type,
        title=title,
        slug=slug,
        body=body,
        metadata=generated_metadata,
        document_hash=document_hash,
    )


def split_document(document: NormalizedDocument, *, chunk_size: int, chunk_overlap: int) -> list[SplitChunk]:
    """Split a normalized document into heading-aware chunks with section metadata."""

    text_chunks = split_text_with_metadata(document.body, chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    if not text_chunks:
        return []

    return text_chunks


def build_chunks(
    document: NormalizedDocument,
    split_chunks: list[SplitChunk],
    *,
    chunk_size: int,
    chunk_overlap: int,
) -> list[ContentChunk]:
    """Build indexable chunks with generated chunk metadata and embedding text."""

    total_chunks = len(split_chunks)
    chunks: list[ContentChunk] = []
    for index, split_chunk in enumerate(split_chunks, start=1):
        content_hash = hash_text(split_chunk.content)
        chunk_id = build_chunk_id(document.document_id, index, content_hash)
        chunk_metadata = build_chunk_metadata(
            document,
            split_chunk,
            index=index,
            total_chunks=total_chunks,
            content_hash=content_hash,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )
        chunk = ContentChunk(
            chunk_id=chunk_id,
            document_id=document.document_id,
            content_type=document.content_type,
            path=document.relative_path,
            title=document.title,
            slug=document.slug,
            content=split_chunk.content,
            embedding_text="",
            metadata=chunk_metadata,
        )
        chunk.embedding_text = build_embedding_text(chunk)
        chunks.append(chunk)
    return chunks


def build_chunk_metadata(
    document: NormalizedDocument,
    split_chunk: SplitChunk,
    *,
    index: int,
    total_chunks: int,
    content_hash: str,
    chunk_size: int,
    chunk_overlap: int,
) -> dict[str, object]:
    """Combine document, frontmatter, and chunk-level metadata."""

    return {
        **document.metadata,
        "chunk_index": index,
        "chunk_count": total_chunks,
        "section_title": split_chunk.section_title,
        "heading_path": split_chunk.heading_path,
        "content_hash": content_hash,
        "document_hash": document.document_hash,
        "chunking_strategy": f"markdown-v2-chars-{chunk_size}-overlap-{chunk_overlap}",
    }


def build_document_id(relative_path: str, metadata: dict[str, object]) -> str:
    """Use frontmatter id when present, otherwise derive a stable id from relative path."""

    raw_id = stringify_scalar(metadata.get("id")).strip()
    if raw_id:
        return slugify(raw_id)
    return slugify(Path(relative_path).with_suffix("").as_posix())


def build_chunk_id(document_id: str, chunk_index: int, content_hash: str) -> str:
    """Build a stable chunk id suitable for Redis keys and citations."""

    short_hash = content_hash.removeprefix("sha256:")[:10]
    return f"{document_id}::{chunk_index:04d}::{short_hash}"


def build_content_type(relative_path: str) -> str:
    """Resolve a content type from the parent directory."""

    parent = Path(relative_path).parent.name or "content"
    return parent[:-1] if parent.endswith("s") and len(parent) > 1 else parent


def build_slug(path: Path, metadata: dict[str, object]) -> str:
    """Use frontmatter slug when present, otherwise filename stem."""

    raw_slug = stringify_scalar(metadata.get("slug")).strip()
    return slugify(raw_slug or path.stem)


def build_title(path: Path, metadata: dict[str, object], body: str) -> str:
    """Resolve a human-readable title from metadata, first heading, or filename."""

    for field in ("title", "name", "question"):
        value = stringify_scalar(metadata.get(field)).strip()
        if value:
            return value

    heading = first_markdown_heading(body)
    if heading:
        return heading

    return path.stem.replace("-", " ").title()


def normalize_boost(value: object) -> float:
    """Parse and clamp the manual retrieval boost."""

    return min(MAX_BOOST, max(MIN_BOOST, normalize_number(value, default=DEFAULT_BOOST)))


def normalize_number(value: object, *, default: float) -> float:
    """Parse numeric metadata with a default fallback."""

    if isinstance(value, bool):
        return default
    if isinstance(value, int | float):
        return float(value)
    if isinstance(value, str):
        try:
            return float(value.strip())
        except ValueError:
            return default
    return default


def hash_text(text: str) -> str:
    """Return a stable SHA-256 hash for content change detection."""

    return f"sha256:{sha256(text.encode('utf-8')).hexdigest()}"


def slugify(value: str) -> str:
    """Normalize ids and slugs for Redis-safe stable identifiers."""

    normalized = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip()).strip("-").lower()
    return normalized or "content"


def first_markdown_heading(text: str) -> str:
    """Return the first Markdown heading text from a document body."""

    for line in text.splitlines():
        match = re.match(r"^#{1,6}\s+(.+?)\s*#*$", line.strip())
        if match:
            return match.group(1).strip()
    return ""


def get_document_title(path: Path, metadata: dict[str, object]) -> str:
    """Resolve a human-readable title from document metadata."""

    for field in ("title", "name", "question"):
        value = metadata.get(field)
        if isinstance(value, str) and value.strip():
            return value.strip()

    return path.stem.replace("-", " ").title()


def normalize_metadata(metadata: dict[str, object]) -> dict[str, object]:
    """Convert frontmatter into Redis JSON-safe scalar and list values."""

    normalized: dict[str, object] = {}
    for key, value in metadata.items():
        normalized[key] = normalize_metadata_value(value)
    return normalized


def normalize_metadata_value(value: object) -> object:
    """Normalize metadata values to simple JSON-compatible types."""

    if value is None:
        return ""
    if isinstance(value, bool):
        return str(value).lower()
    if isinstance(value, (int, float, str)):
        return value
    if isinstance(value, Path):
        return str(value)
    if isinstance(value, dict):
        return json.dumps({str(key): normalize_metadata_value(item) for key, item in value.items()})
    if isinstance(value, Iterable) and not isinstance(value, (bytes, bytearray, str)):
        return [str(item) for item in value if item is not None]
    return str(value)


def normalize_body(content: str) -> str:
    """Normalize markdown body text for chunking and embedding."""

    lines = [line.strip() for line in content.splitlines()]
    return "\n".join(lines).strip()


def split_text(text: str, *, chunk_size: int, chunk_overlap: int) -> list[str]:
    """Split markdown into heading-aware overlapping chunks."""

    return [chunk.content for chunk in split_text_with_metadata(text, chunk_size=chunk_size, chunk_overlap=chunk_overlap)]


def split_text_with_metadata(text: str, *, chunk_size: int, chunk_overlap: int) -> list[SplitChunk]:
    """Split markdown into heading-aware chunks and preserve heading metadata."""

    if not text:
        return []
    if chunk_size <= 0:
        raise ValueError("Chunk size must be positive.")
    if chunk_overlap < 0:
        raise ValueError("Chunk overlap cannot be negative.")
    if chunk_overlap >= chunk_size:
        raise ValueError("Chunk overlap must be smaller than chunk size.")

    header_splitter = MarkdownHeaderTextSplitter(
        headers_to_split_on=[("#", "h1"), ("##", "h2")],
        strip_headers=False,
    )
    recursive_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n## ", "\n### ", "\n\n", "\n", ". ", " ", ""],
    )

    sections = header_splitter.split_text(text)
    if not sections:
        sections = recursive_splitter.create_documents([text])

    chunks: list[SplitChunk] = []
    for section in sections:
        section_text = section.page_content.strip()
        if not section_text:
            continue

        heading_path = build_heading_path(section.metadata)
        section_title = heading_path[-1] if heading_path else ""

        section_chunks = recursive_splitter.split_text(section_text)
        for section_chunk in section_chunks:
            normalized_chunk = section_chunk.strip()
            if normalized_chunk:
                chunks.append(
                    SplitChunk(
                        content=normalized_chunk,
                        section_title=section_title,
                        heading_path=heading_path,
                    )
                )

    return chunks or [SplitChunk(content=text, section_title="", heading_path=[])]


def build_heading_path(metadata: dict[str, object]) -> list[str]:
    """Extract an ordered heading path from LangChain markdown split metadata."""

    headings: list[str] = []
    for key in ("h1", "h2", "h3", "h4", "h5", "h6"):
        value = stringify_scalar(metadata.get(key)).strip()
        if value:
            headings.append(value)
    return headings


def stringify_iterable(value: object) -> list[str]:
    """Convert metadata collections into a list of strings."""

    if isinstance(value, Iterable) and not isinstance(value, (bytes, bytearray, str)):
        return [str(item) for item in value if item is not None]
    return []


def stringify_scalar(value: object) -> str:
    """Convert a scalar metadata value into a display string."""

    if value is None:
        return ""
    if isinstance(value, str):
        return value
    if isinstance(value, (int, float, bool)):
        return str(value)
    return ""
