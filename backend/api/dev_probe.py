import argparse
import json

from api.core.rag_probe import create_rag_probe


def main() -> None:
    """Run the local hardcoded RAG connection probe."""

    parser = argparse.ArgumentParser(description="Run the portfolio RAG connection probe.")
    parser.add_argument(
        "question",
        nargs="?",
        default="How is the portfolio assistant connected to the local model server?",
    )
    args = parser.parse_args()

    result = create_rag_probe().run(args.question)
    print(
        json.dumps(
            {
                "question": result.question,
                "retrieved": [document.__dict__ for document in result.retrieved],
                "reranked": result.reranked,
                "answer": result.answer,
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
