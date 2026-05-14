from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from api.core.config import get_settings
from api.core.model_client import create_chat_model, get_available_model_ids


def main() -> None:
    """Start an interactive chat loop against the configured remote chat model."""

    settings = get_settings()
    chat_model = create_chat_model(settings)
    messages = [SystemMessage(content="You are a concise, helpful assistant.")]

    try:
        model_ids = get_available_model_ids(settings)
    except Exception as error:  # noqa: BLE001 - CLI should show raw connection errors.
        print(f"Could not fetch /v1/models: {error}")
        model_ids = []

    print(f"Chat model: {settings.llm_model}")
    print(f"Base URL: {settings.llm_base_url}")
    if model_ids:
        print("Available models:")
        for model_id in model_ids:
            marker = "*" if model_id == settings.llm_model else "-"
            print(f"  {marker} {model_id}")
        if settings.llm_model not in model_ids:
            print("Configured chat model is not listed by /v1/models.")
    print("Type 'exit', 'quit', or press Ctrl-D to stop.")

    while True:
        try:
            question = input("\nYou: ").strip()
        except EOFError:
            print()
            break

        if question.lower() in {"exit", "quit"}:
            break
        if not question:
            continue

        messages.append(HumanMessage(content=question))
        try:
            response = chat_model.invoke(messages)
        except Exception as error:  # noqa: BLE001 - CLI should show raw connection errors.
            print(f"Error: {error}")
            continue

        answer = response.content if isinstance(response.content, str) else str(response.content)
        print(f"Assistant: {answer}")
        messages.append(AIMessage(content=answer))


if __name__ == "__main__":
    main()
