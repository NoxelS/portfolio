from copy import deepcopy

from api.core.config import get_settings
from api.core.model_client import create_embedding_model, get_available_model_ids

probe_queries = [
    "Noel builds a fast static Astro portfolio.",
    "The assistant will answer questions with retrieval augmented generation.",
    "Bananas are yellow and unrelated to this test.",
]

H = (  # noqa: E501
    "Model                           Dims   "
    "q1:nz q1:%0 q1:%N q1:nn   "
    "q2:nz q2:%0 q2:%N q2:nn   "
    "q3:nz q3:%0 q3:%N q3:nn   Status"
)
R = "-" * len(H)

# Legend for column names:
#   nz   = number of non-zero entries
#   %0   = percentage of entries exactly 0.0
#   %N   = percentage of entries that are None
#   nn   = number of entries that are non-zero AND non-None (useful dims)


def _compute_stats(
    vectors: list[list[float]],
) -> list[tuple[int, float, float, int]]:
    stats: list[tuple[int, float, float, int]] = []
    for vec in vectors:
        total = len(vec)
        zero_cnt = sum(1 for v in vec if v == 0.0)
        none_cnt = sum(1 for v in vec if v is None)
        nz_cnt = total - zero_cnt - none_cnt
        nz_nn_cnt = sum(1 for v in vec if v != 0.0 and v is not None)
        stats.append((nz_cnt, zero_cnt / total * 100, none_cnt / total * 100, nz_nn_cnt))
    return stats


def _fmt_row(
    model_id: str,
    dims: int | str,
    cells: list[tuple],
    status: str,
) -> str:
    parts = [f"{model_id:35s} {str(dims):>5s}  "]
    for nz, p0, pN, nn in cells:
        parts.append(f"{nz:5d} {p0:5.1f}% {pN:5.1f}% {nn:5d}   ")
    parts.append(status)
    return "".join(parts)


def main() -> None:
    settings = get_settings()
    model_ids = get_available_model_ids(settings)

    print(f"Base URL: {settings.llm_base_url}")
    print()
    print(H)
    print(R)

    for model_id in model_ids:
        cfg = deepcopy(settings)
        cfg.embedding_model = model_id
        model = create_embedding_model(cfg)

        try:
            vectors = model.embed(probe_queries)
        except Exception as e:
            err_str = str(e).replace("\n", " ")
            err = err_str[:60] if len(err_str) > 60 else err_str
            dummy = [(0, 0.0, 0.0, 0)] * len(probe_queries)
            print(_fmt_row(model_id, "\u2014", dummy, f"ERROR: {err}"))
            continue

        dims = len(vectors[0]) if vectors else 0
        stats = _compute_stats(vectors)
        ok = all(nz == dims for nz, _, _, _ in stats)
        status = "OK" if ok else "PARTIAL"

        print(_fmt_row(model_id, dims, stats, status))


if __name__ == "__main__":
    main()
