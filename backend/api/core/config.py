from functools import lru_cache
from pathlib import Path

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

backend_dir = Path(__file__).resolve().parents[2]
repo_root = backend_dir.parent
default_content_root = repo_root / "content"
default_instructions_root = repo_root / "instructions"


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
    reranker_minimum_relevance_percent: float = 0.1
    llm_model: str = "SmolLM2-360M-Instruct-Q8_0"
    chat_completions_path: str = "/v1/chat/completions"
    chat_max_tokens: int = 256
    chat_model_context_tokens: int = 8192
    chat_context_reserved_tokens: int = 768
    embeddings_path: str = "/v1/embeddings"
    embedding_prefix: str = "query: "
    embedding_passage_prefix: str = "passage: "
    redis_url: str = "redis://localhost:6379"
    redis_index_name: str = "portfolio_content"
    assistant_top_n: int = 8
    retrieval_max_top_n: int = 25
    retrieval_multiplier: int = 3
    retrieval_max_k: int = 75
    content_root: Path = default_content_root
    instructions_root: Path = default_instructions_root
    bootstrap_enabled: bool = True
    bootstrap_chunk_size: int = 500
    bootstrap_chunk_overlap: int = 100
    ntfy_enabled: bool = False
    ntfy_topic: str = "portfolio-users"
    ntfy_host: str = "https://ntfy.noel.fyi"
    ntfy_user: str = ""
    ntfy_password: SecretStr | None = None
    ntfy_title: str = "Portfolio Sales Assistant"

    model_config = SettingsConfigDict(
        env_file=(repo_root / ".env", backend_dir / ".env"),
        env_prefix="API_",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings."""

    return Settings()
