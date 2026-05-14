import sys

from api.core.config import get_settings
from api.core.model_client import create_embedding_model


def _show_vector(vec: list[float]) -> None:
    dims = len(vec)
    nz = sum(1 for v in vec if v != 0.0 and v is not None)
    none_cnt = sum(1 for v in vec if v is None)

    print(f"\n  Dimensions: {dims}")
    print(f"  Non-zero:   {nz:,}")
    print(f"  None:       {none_cnt:,}")
    print(f"  Density:    {nz / dims * 100:.1f}%")
    print()

    print("  Vector preview (first 12 values):")
    preview = ", ".join(f"{v:.6f}" if v is not None else "None" for v in vec[:12])
    print(f"    [{preview}, ...]")

    if dims <= 64:
        full = ", ".join(f"{v:.6f}" if v is not None else "None" for v in vec)
        print("\n  Full vector:")
        print(f"    [{full}]")


def main() -> None:
    settings = get_settings()
    model = create_embedding_model(settings)

    print(f"Model:  {settings.embedding_model}")
    print(f"Server: {settings.llm_base_url}")
    print(f"Prefix: {settings.embedding_prefix!r}")
    print("Enter a sentence to embed (Ctrl+D to quit).\n")

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        print(f"\n--- Input: {line}")

        try:
            vectors = model.embed([line])
        except Exception as e:
            print(f"  ERROR: {e}")
            continue

        vec = vectors[0]
        _show_vector(vec)
        print()


if __name__ == "__main__":
    main()
