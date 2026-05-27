import json
from collections.abc import Sequence
from urllib.parse import urljoin

import httpx
from langchain_core.messages import AIMessage, BaseMessage

from api.core.config import Settings, get_settings


class RemoteChatModel:
    """OpenAI-compatible chat client for the remote model API."""

    def __init__(
        self,
        *,
        base_url: str,
        path: str,
        model: str,
        max_tokens: int,
        timeout_seconds: float,
        headers: dict[str, str] | None = None,
        client: httpx.Client | None = None,
    ) -> None:
        self.model = model
        self.base_url = base_url
        self.path = path
        self.max_tokens = max_tokens
        self.headers = headers or {}
        self.url = urljoin(base_url.rstrip("/") + "/", path.lstrip("/"))
        self.client = client or httpx.Client(timeout=timeout_seconds)

    def invoke(self, messages: Sequence[BaseMessage]) -> AIMessage:
        """Send one chat completion request and return the assistant message."""

        response = self.client.post(
            self.url,
            headers=self.headers,
            json={
                "model": self.model,
                "messages": [serialize_message(message) for message in messages],
                "temperature": 0,
                "stream": False,
                "max_tokens": self.max_tokens,
            },
        )
        response.raise_for_status()
        return AIMessage(content=parse_chat_content(response.json()))

    def stream(self, messages: Sequence[BaseMessage]):
        """Stream chat completion deltas from the remote model API."""

        with self.client.stream(
            "POST",
            self.url,
            headers=self.headers,
            json={
                "model": self.model,
                "messages": [serialize_message(message) for message in messages],
                "temperature": 0,
                "stream": True,
                "max_tokens": self.max_tokens,
            },
        ) as response:
            response.raise_for_status()
            for chunk in response.iter_lines():
                if not chunk:
                    continue

                text = chunk.decode("utf-8") if isinstance(chunk, bytes) else str(chunk)
                if text.startswith("data:"):
                    text = text.removeprefix("data:").strip()

                if text == "[DONE]":
                    break

                payload = json.loads(text)
                yield parse_chat_delta(payload)


class RemoteEmbeddingModel:
    """OpenAI-compatible embedding client for the remote model API."""

    def __init__(
        self,
        *,
        base_url: str,
        path: str,
        model: str,
        prefix: str = "",
        passage_prefix: str = "",
        timeout_seconds: float,
        headers: dict[str, str] | None = None,
        client: httpx.Client | None = None,
    ) -> None:
        self.model = model
        self.base_url = base_url
        self.path = path
        self.prefix = prefix
        self.passage_prefix = passage_prefix
        self.headers = headers or {}
        self.url = urljoin(base_url.rstrip("/") + "/", path.lstrip("/"))
        self.client = client or httpx.Client(timeout=timeout_seconds)

    def embed(self, texts: Sequence[str], *, as_passage: bool = False) -> list[list[float]]:
        """Embed texts with the configured remote embedding model."""

        prefix = self.passage_prefix if as_passage else self.prefix
        prefixed = [f"{prefix}{text}" for text in texts]
        response = self.client.post(
            self.url,
            headers=self.headers,
            json={"model": self.model, "input": prefixed},
        )
        response.raise_for_status()
        return parse_embedding_vectors(response.json())


class RemoteRerankerModel:
    """Remote reranker model client compatible with llama.cpp /rerank."""

    def __init__(
        self,
        *,
        base_url: str,
        path: str,
        model: str,
        timeout_seconds: float,
        headers: dict[str, str] | None = None,
        client: httpx.Client | None = None,
    ) -> None:
        self.model = model
        self.base_url = base_url
        self.path = path
        self.headers = headers or {}
        self.url = urljoin(base_url.rstrip("/") + "/", path.lstrip("/"))
        self.client = client or httpx.Client(timeout=timeout_seconds)

    def rerank(
        self,
        query: str,
        documents: Sequence[str],
        *,
        top_n: int = 0,
    ) -> list[tuple[int, float]]:
        """Rerank documents against a query and return (index, score) pairs."""

        payload: dict[str, object] = {
            "model": self.model,
            "query": query,
            "documents": list(documents),
        }
        if top_n > 0:
            payload["top_n"] = top_n

        response = self.client.post(self.url, headers=self.headers, json=payload)
        response.raise_for_status()
        return parse_rerank_results(response.json())


def create_chat_model(settings: Settings | None = None) -> RemoteChatModel:
    """Create the configured remote chat model client."""

    settings = settings or get_settings()
    return RemoteChatModel(
        model=settings.llm_model,
        base_url=settings.llm_base_url,
        path=settings.chat_completions_path,
        max_tokens=settings.chat_max_tokens,
        timeout_seconds=settings.http_timeout_seconds,
        headers=get_headers(settings),
    )


def create_embedding_model(settings: Settings | None = None) -> RemoteEmbeddingModel:
    """Create the configured remote embedding model client."""

    settings = settings or get_settings()
    return RemoteEmbeddingModel(
        model=settings.embedding_model,
        base_url=settings.embeddings_base_url,
        path=settings.embeddings_path,
        prefix=settings.embedding_prefix,
        passage_prefix=settings.embedding_passage_prefix,
        timeout_seconds=settings.http_timeout_seconds,
        headers=get_headers(settings),
    )


def create_reranker_model(settings: Settings | None = None) -> RemoteRerankerModel:
    """Create the configured remote reranker model client."""

    settings = settings or get_settings()
    return RemoteRerankerModel(
        model=settings.reranker_model,
        base_url=settings.reranking_base_url,
        path=settings.reranker_path,
        timeout_seconds=settings.http_timeout_seconds,
        headers=get_headers(settings),
    )


def get_available_model_ids(
    settings: Settings | None = None,
    *,
    base_url: str | None = None,
) -> list[str]:
    """Return model IDs exposed by a remote llama.cpp-compatible router.

    Parameters
    ----------
    settings:
        Application settings (defaults to cached settings).
    base_url:
        Override for the server to query.
        Defaults to ``settings.llm_base_url``.
    """

    settings = settings or get_settings()
    url = urljoin((base_url or settings.llm_base_url).rstrip("/") + "/", settings.models_path.lstrip("/"))
    response = httpx.get(
        url,
        headers=get_headers(settings),
        timeout=settings.http_timeout_seconds,
    )
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, dict) or not isinstance(payload.get("data"), list):
        raise ValueError("Unsupported models response format.")

    return [str(model["id"]) for model in payload["data"] if isinstance(model, dict) and "id" in model]


def serialize_message(message: BaseMessage) -> dict[str, str]:
    """Serialize a LangChain message to OpenAI-compatible chat format."""

    role = {"human": "user", "ai": "assistant"}.get(message.type, message.type)
    content = message.content if isinstance(message.content, str) else str(message.content)
    return {"role": role, "content": content}


def parse_chat_content(payload: object) -> str:
    """Parse common OpenAI-compatible chat completion response shapes."""

    if isinstance(payload, dict):
        choices = payload.get("choices")
        if isinstance(choices, list) and choices:
            first = choices[0]
            if isinstance(first, dict):
                message = first.get("message")
                if isinstance(message, dict) and isinstance(message.get("content"), str):
                    return message["content"]
                if isinstance(first.get("text"), str):
                    return first["text"]

        message = payload.get("message")
        if isinstance(message, dict) and isinstance(message.get("content"), str):
            return message["content"]
        if isinstance(payload.get("content"), str):
            return payload["content"]

    raise ValueError("Unsupported chat completion response format.")


def parse_chat_delta(payload: object) -> str:
    """Parse a streamed chat completion delta payload."""

    if isinstance(payload, dict):
        choices = payload.get("choices")
        if isinstance(choices, list) and choices:
            first = choices[0]
            if isinstance(first, dict):
                delta = first.get("delta")
                if isinstance(delta, dict) and isinstance(delta.get("content"), str):
                    return delta["content"]
                if isinstance(first.get("text"), str):
                    return first["text"]

        if isinstance(payload.get("content"), str):
            return payload["content"]

    return ""


def parse_embedding_vectors(payload: object) -> list[list[float]]:
    """Parse OpenAI-compatible embedding response payloads."""

    if not isinstance(payload, dict) or not isinstance(payload.get("data"), list):
        raise ValueError("Unsupported embeddings response format.")

    vectors: list[list[float]] = []
    for item in payload["data"]:
        if not isinstance(item, dict) or not isinstance(item.get("embedding"), list):
            raise ValueError("Unsupported embeddings response format.")
        vectors.append([0.0 if value is None else float(value) for value in item["embedding"]])

    return vectors


def parse_rerank_results(payload: object) -> list[tuple[int, float]]:
    """Parse llama.cpp rerank response into (index, score) pairs."""

    if not isinstance(payload, dict) or not isinstance(payload.get("results"), list):
        raise ValueError("Unsupported rerank response format.")

    pairs: list[tuple[int, float]] = []
    for item in payload["results"]:
        if not isinstance(item, dict):
            continue
        index = int(item.get("index", 0))
        score = float(item.get("relevance_score", item.get("score", 0.0)))
        pairs.append((index, score))

    return pairs


def get_client_kwargs(settings: Settings) -> dict[str, dict[str, str]]:
    """Return HTTP client kwargs for LangChain Ollama clients."""

    headers = get_headers(settings)
    if not headers:
        return {}

    return {"headers": headers}


def get_headers(settings: Settings) -> dict[str, str]:
    """Return HTTP headers for the remote model API."""

    if settings.openwebui_api_key is None:
        return {}

    token = settings.openwebui_api_key.get_secret_value()
    if not token:
        return {}

    return {"Authorization": f"Bearer {token}"}
