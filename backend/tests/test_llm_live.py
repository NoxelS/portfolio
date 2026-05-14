#!/usr/bin/env python3
"""Live probe that tests all three remote LLM services: chat, embed, rerank."""

from langchain_core.messages import HumanMessage

from api.core.config import get_settings
from api.core.model_client import (
    create_chat_model,
    create_embedding_model,
    create_reranker_model,
)

PROBE_QUERY = "What is the capital of France?"
PROBE_DOCUMENTS = [
    "Paris is the capital and largest city of France.",
    "Berlin is the capital of Germany.",
    "London is the capital of the United Kingdom.",
]


def test_chat() -> None:
    settings = get_settings()
    model = create_chat_model(settings)
    msg = model.invoke([HumanMessage(content=PROBE_QUERY)])
    content = msg.content
    assert isinstance(content, str) and len(content) > 0, (
        f"Empty or non-string response: {content!r}"
    )
    print(f"  chat     | model={settings.llm_model}")
    print(f"            | response={content[:120]!r}...")


def test_embed() -> None:
    settings = get_settings()
    model = create_embedding_model(settings)
    vectors = model.embed([PROBE_QUERY])
    vec = vectors[0]
    dims = len(vec)
    nz = sum(1 for v in vec if v != 0.0 and v is not None)
    assert dims > 0, "Zero-dimensional vector"
    assert nz > 0, "All-zero embedding vector"
    print(f"  embed    | model={settings.embedding_model}")
    print(f"            | dims={dims}, non-zero={nz}/{dims} ({nz / dims * 100:.1f}%)")


def test_rerank() -> None:
    settings = get_settings()
    model = create_reranker_model(settings)
    results = model.rerank(PROBE_QUERY, PROBE_DOCUMENTS)
    expected = len(PROBE_DOCUMENTS)
    assert len(results) == expected, f"Expected {expected} results, got {len(results)}"
    scores = [score for _, score in results]
    print(f"  rerank   | model={settings.reranker_model}")
    print(f"            | scores={[f'{s:.4f}' for s in scores]}")
    assert any(s > 0 for _, s in results), "All scores are zero or negative"


def main() -> None:
    settings = get_settings()
    print(f"LLM:    {settings.llm_base_url}")
    print(f"Embed:  {settings.embeddings_base_url}")
    print(f"Rerank: {settings.reranking_base_url}")
    print()

    for label, fn in [("CHAT", test_chat), ("EMBED", test_embed), ("RERANK", test_rerank)]:
        try:
            fn()
            print(f"  [{label}] PASS")
        except Exception as e:
            print(f"  [{label}] FAIL: {e}")
        print()

    print("=== done ===")


if __name__ == "__main__":
    main()
