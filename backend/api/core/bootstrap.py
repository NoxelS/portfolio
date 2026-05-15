import json
import logging
from collections.abc import Iterable
from dataclasses import dataclass
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
    metadata: dict[str, object]


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
    for path in sorted(content_root.glob("**/*.md")):
        post = frontmatter.load(path)
        document_id = str(post.metadata.get("id") or path.stem)
        content_type = path.parent.name.rstrip("s")
        title = get_document_title(path, post.metadata)
        slug = str(post.metadata.get("slug") or path.stem)
        metadata = normalize_metadata(post.metadata)
        relative_path = path.relative_to(content_root).as_posix()
        body = normalize_body(post.content)
        text_chunks = split_text(body, chunk_size=chunk_size, chunk_overlap=chunk_overlap)

        for index, text_chunk in enumerate(text_chunks, start=1):
            chunk_id = f"{document_id}::{index}"
            chunk_metadata = {
                **metadata,
                "chunk_index": index,
                "content_type": content_type,
                "path": relative_path,
            }
            chunks.append(
                ContentChunk(
                    chunk_id=chunk_id,
                    document_id=document_id,
                    content_type=content_type,
                    path=relative_path,
                    title=title,
                    slug=slug,
                    content=text_chunk,
                    metadata=chunk_metadata,
                )
            )

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
        payload = build_redis_document(chunk, vector)
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


def build_redis_document(chunk: ContentChunk, vector: list[float]) -> dict[str, object]:
    """Build the JSON document stored for each content chunk."""

    payload: dict[str, object] = {
        "chunk_id": chunk.chunk_id,
        "document_id": chunk.document_id,
        "content_type": chunk.content_type,
        "title": chunk.title,
        "slug": chunk.slug,
        "path": chunk.path,
        "content": chunk.content,
        "embedding": vector,
    }
    payload.update(chunk.metadata)
    return payload


def build_embedding_text(chunk: ContentChunk) -> str:
    """Build the text sent to the embedding model for each chunk."""

    lines = [
        f"Title: {chunk.title}",
        f"Type: {chunk.content_type}",
        f"Slug: {chunk.slug}",
    ]
    category = stringify_scalar(chunk.metadata.get("category"))
    if category:
        lines.append(f"Category: {category}")

    tags = ", ".join(stringify_iterable(chunk.metadata.get("tags")))
    if tags:
        lines.append(f"Tags: {tags}")

    lines.append("")
    lines.append(chunk.content)
    return "\n".join(lines)


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

    chunks: list[str] = []
    for section in sections:
        section_text = section.page_content.strip()
        if not section_text:
            continue

        section_chunks = recursive_splitter.split_text(section_text)
        for section_chunk in section_chunks:
            normalized_chunk = section_chunk.strip()
            if normalized_chunk:
                chunks.append(normalized_chunk)

    return chunks or [text]


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
