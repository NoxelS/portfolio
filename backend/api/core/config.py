from functools import lru_cache
from pathlib import Path

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

backend_dir = Path(__file__).resolve().parents[2]
repo_root = backend_dir.parent
default_content_root = repo_root / "content"


class Settings(BaseSettings):
    """Runtime settings loaded from environment variables."""

    app_name: str = "Portfolio API"
    log_level: str = "DEBUG"
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:4321"])
    llm_base_url: str = "https://llm.noel.fyi"
    embeddings_base_url: str = "https://embeddings.noel.fyi"
    reranking_base_url: str = "https://reranking.noel.fyi"
    llm_bearer_token: SecretStr | None = None
    embedding_model: str = "llm-embedder.Q8_0"
    reranker_model: str = "bge-reranker-v2-m3-Q8_0"
    reranker_path: str = "/rerank"
    llm_model: str = "SmolLM2-360M-Instruct-Q8_0"
    chat_completions_path: str = "/v1/chat/completions"
    chat_max_tokens: int = 256
    embeddings_path: str = "/v1/embeddings"
    embedding_prefix: str = "query: "
    embedding_passage_prefix: str = "passage: "
    redis_url: str = "redis://localhost:6379"
    redis_index_name: str = "portfolio_content"
    content_root: Path = default_content_root
    bootstrap_chunk_size: int = 1200
    bootstrap_chunk_overlap: int = 200

    model_config = SettingsConfigDict(
        env_file=(repo_root / ".env", backend_dir / ".env"),
        env_prefix="API_",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings."""

    return Settings()
