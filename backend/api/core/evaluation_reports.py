import json
import re
from pathlib import Path

from api.core.config import backend_dir

EVALUATION_OUTPUT_DIR = backend_dir / "tests" / "evaluations" / "outputs"
EVALUATION_FILENAME_PATTERN = re.compile(r"^rag-evaluation-[0-9]{8}-[0-9]{6}\.json$")


def list_evaluation_reports(output_dir: Path = EVALUATION_OUTPUT_DIR) -> list[dict[str, object]]:
    """Return metadata for available RAG evaluation reports."""

    reports: list[dict[str, object]] = []
    if not output_dir.exists():
        return reports

    for path in sorted(output_dir.glob("rag-evaluation-*.json"), reverse=True):
        if not is_safe_evaluation_filename(path.name):
            continue

        payload = load_evaluation_report(path.name, output_dir=output_dir)
        reports.append(
            {
                "filename": path.name,
                "created_at": payload.get("created_at", ""),
                "summary": payload.get("summary", {}),
                "benchmark": payload.get("benchmark", {}),
            }
        )
    return reports


def load_evaluation_report(filename: str, output_dir: Path = EVALUATION_OUTPUT_DIR) -> dict[str, object]:
    """Load one validated evaluation report JSON file."""

    if not is_safe_evaluation_filename(filename):
        raise FileNotFoundError(filename)

    path = (output_dir / filename).resolve()
    root = output_dir.resolve()
    if root not in path.parents:
        raise FileNotFoundError(filename)
    if not path.exists():
        raise FileNotFoundError(filename)

    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError("Evaluation report must be a JSON object.")
    return payload


def is_safe_evaluation_filename(filename: str) -> bool:
    """Allow only generated evaluation report filenames."""

    return bool(EVALUATION_FILENAME_PATTERN.fullmatch(filename))
