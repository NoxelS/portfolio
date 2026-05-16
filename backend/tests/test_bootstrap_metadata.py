from pathlib import Path

from api.core.bootstrap import load_content_chunks, normalize_boost


def test_load_content_chunks_generates_metadata_without_frontmatter(tmp_path: Path) -> None:
    notes_dir = tmp_path / "notes"
    notes_dir.mkdir()
    (notes_dir / "redis-rag-notes.md").write_text(
        "# Redis RAG Notes\n\nThis project uses Redis Stack for vector search.",
        encoding="utf-8",
    )

    chunks = load_content_chunks(tmp_path, chunk_size=500, chunk_overlap=100)

    assert len(chunks) == 1
    chunk = chunks[0]
    assert chunk.document_id == "notes-redis-rag-notes"
    assert chunk.slug == "redis-rag-notes"
    assert chunk.title == "Redis RAG Notes"
    assert chunk.content_type == "note"
    assert chunk.metadata["visibility"] == "public"
    assert chunk.metadata["status"] == "published"
    assert chunk.metadata["boost"] == 1.0
    assert chunk.metadata["source_uri"] == f"{tmp_path.name}/notes/redis-rag-notes.md"
    assert str(chunk.metadata["content_hash"]).startswith("sha256:")
    assert "Title: Redis RAG Notes" in chunk.embedding_text


def test_load_content_chunks_uses_frontmatter_boost(tmp_path: Path) -> None:
    projects_dir = tmp_path / "projects"
    projects_dir.mkdir()
    (projects_dir / "boosted.md").write_text(
        "---\n"
        "id: custom-id\n"
        "title: Boosted Note\n"
        "slug: boosted-note\n"
        "boost: 2.5\n"
        "priority: 80\n"
        "visibility: public\n"
        "tags:\n"
        "  - rag\n"
        "---\n"
        "Useful boosted content.",
        encoding="utf-8",
    )

    chunk = load_content_chunks(tmp_path, chunk_size=500, chunk_overlap=100)[0]

    assert chunk.document_id == "custom-id"
    assert chunk.metadata["boost"] == 2.5
    assert chunk.metadata["priority"] == 80.0
    assert "Tags: rag" in chunk.embedding_text


def test_normalize_boost_clamps_values() -> None:
    assert normalize_boost("not-a-number") == 1.0
    assert normalize_boost(0) == 0.1
    assert normalize_boost(10) == 3.0
