import httpx

from api.core.config import get_settings
from api.core.model_client import create_reranker_model, get_available_model_ids

probe_query = "What does Noel use for his portfolio?"
probe_documents = [
    (
        "Noel builds self-hosted portfolio systems with Astro, FastAPI, Docker, "
        "and privacy-conscious analytics."
    ),
    (
        "The planned assistant uses retrieval augmented generation to answer questions "
        "from portfolio content."
    ),
    (
        "The local model server is reachable through llm.noel.fyi in development "
        "and ollama:8080 in production containers."
    ),
    "Bananas are yellow and unrelated to the portfolio assistant architecture.",
]


def main() -> None:
    """Run a field test against the configured remote reranker model."""

    settings = get_settings()
    reranker_model = create_reranker_model(settings)

    print(f"Reranker model: {settings.reranker_model}")
    print(f"Base URL: {settings.llm_base_url}")
    print(f"Endpoint: {settings.reranker_path}")
    print(f"Query: {probe_query}")

    try:
        model_ids = get_available_model_ids(settings)
    except Exception as error:
        print(f"Could not fetch /v1/models: {error}")
        model_ids = []

    if model_ids:
        print("Available models:")
        for model_id in model_ids:
            marker = "*" if model_id == settings.reranker_model else "-"
            print(f"  {marker} {model_id}")
        if settings.reranker_model not in model_ids:
            print("Configured reranker model is not listed by /v1/models.")

    print("\nReranker probe documents:")
    for index, document in enumerate(probe_documents, start=1):
        print(f"  {index}. {document}")

    try:
        results = reranker_model.rerank(probe_query, probe_documents)
    except httpx.HTTPStatusError as error:
        print(f"\nError: {error}")
        try:
            payload = error.response.json()
        except ValueError:
            payload = None
        if isinstance(payload, dict):
            print(f"Response: {payload}")
        return
    except Exception as error:
        print(f"\nError: {error}")
        return

    print(f"\nRerank scores ({len(results)} results):")
    for index, score in sorted(results, key=lambda pair: pair[1], reverse=True):
        document = probe_documents[index]
        print(f"  index={index}  score={score:+.4f}  [{document}]")


if __name__ == "__main__":
    main()
