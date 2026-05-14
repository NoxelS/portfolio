from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

backend_dir = Path(__file__).resolve().parents[2]
repo_root = backend_dir.parent


class Settings(BaseSettings):
    """Runtime settings loaded from environment variables."""

    app_name: str = "Portfolio API"
    environment: Literal["development", "test", "production"] = "development"
    log_level: str = "INFO"
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:4321"])
    llm_dev_base_url: str = "https://llm.noel.fyi"
    llm_prod_base_url: str = "http://ollama:8080"
    embeddings_dev_base_url: str = "https://embeddings.noel.fyi"
    embeddings_prod_base_url: str = "http://ollama:8080"
    reranking_dev_base_url: str = "https://reranking.noel.fyi"
    reranking_prod_base_url: str = "http://ollama:8080"
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

    @property
    def llm_base_url(self) -> str:
        """Return the LLM base URL for the current environment."""

        if self.environment == "production":
            return self.llm_prod_base_url

        return self.llm_dev_base_url

    @property
    def embeddings_base_url(self) -> str:
        """Return the embeddings base URL for the current environment."""

        if self.environment == "production":
            return self.embeddings_prod_base_url

        return self.embeddings_dev_base_url

    @property
    def reranking_base_url(self) -> str:
        """Return the reranking base URL for the current environment."""

        if self.environment == "production":
            return self.reranking_prod_base_url

        return self.reranking_dev_base_url

    model_config = SettingsConfigDict(
        env_file=(repo_root / ".env", backend_dir / ".env"),
        env_prefix="API_",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings."""

    return Settings()
