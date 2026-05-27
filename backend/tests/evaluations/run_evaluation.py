import csv
import json
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from time import perf_counter

from api.core.bootstrap import run_bootstrap
from api.core.config import default_instructions_root, get_settings
from api.core.sales_assistant import RagAnswer, answer_rag_question

DEFAULT_OUTPUT_DIR = Path(__file__).resolve().parent / "outputs"
QUESTIONS_DIR = default_instructions_root / "tests"
__test__ = False


@dataclass(slots=True)
class EvaluationResult:
    """One evaluated question with timing data."""

    question_file: str
    answer: RagAnswer
    duration_ms: int


def main() -> None:
    """Run a batch of questions through the core RAG pipeline."""

    total_started_at = perf_counter()

    settings_started_at = perf_counter()
    settings = get_settings()
    settings_ms = elapsed_ms(settings_started_at)

    bootstrap_started_at = perf_counter()
    run_bootstrap(settings)
    bootstrap_ms = elapsed_ms(bootstrap_started_at)

    load_started_at = perf_counter()
    questions = load_question_set(QUESTIONS_DIR)
    load_ms = elapsed_ms(load_started_at)

    output_path = resolve_output_path()
    evaluation_results = evaluate_questions(questions, top_n=settings.assistant_top_n, settings=settings)

    answer_ms = sum(result.duration_ms for result in evaluation_results)
    average_ms = round(answer_ms / len(evaluation_results), 2) if evaluation_results else 0.0
    slowest = max(evaluation_results, key=lambda result: result.duration_ms, default=None)
    benchmark = {
        "settings_ms": settings_ms,
        "bootstrap_ms": bootstrap_ms,
        "load_questions_ms": load_ms,
        "answer_questions_total_ms": answer_ms,
        "answer_questions_avg_ms": average_ms,
        "write_results_ms": 0,
        "total_ms": 0,
    }
    summary = {
        "question_count": len(evaluation_results),
        "question_files": sorted({result.question_file for result in evaluation_results}),
        "slowest_question": slowest.answer.question if slowest else "",
        "slowest_question_ms": slowest.duration_ms if slowest else 0,
    }

    write_started_at = perf_counter()
    write_json_results(output_path, evaluation_results, benchmark=benchmark, summary=summary)
    write_ms = elapsed_ms(write_started_at)

    total_ms = elapsed_ms(total_started_at)
    benchmark["write_results_ms"] = write_ms
    benchmark["total_ms"] = total_ms
    write_json_results(output_path, evaluation_results, benchmark=benchmark, summary=summary)
    print_benchmark_summary(
        output_path=output_path,
        question_count=len(evaluation_results),
        settings_ms=settings_ms,
        bootstrap_ms=bootstrap_ms,
        load_ms=load_ms,
        write_ms=write_ms,
        total_ms=total_ms,
        results=evaluation_results,
    )


def load_questions(path: Path) -> list[str]:
    """Load one-question-per-line CSV files with or without a question header."""

    if not path.exists():
        raise FileNotFoundError(f"Question file does not exist: {path}")

    with path.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.reader(handle))

    questions: list[str] = []
    for index, row in enumerate(rows):
        if not row:
            continue
        question = row[0].strip()
        if not question:
            continue
        if index == 0 and question.lower() == "question":
            continue
        questions.append(question)
    return questions


def load_question_set(path: Path) -> list[tuple[str, str]]:
    """Load all CSV question files from a directory."""

    if not path.exists():
        raise FileNotFoundError(f"Question directory does not exist: {path}")

    questions: list[tuple[str, str]] = []
    for question_file in sorted(path.glob("*.csv")):
        questions.extend((question_file.name, question) for question in load_questions(question_file))
    if not questions:
        raise ValueError(f"No questions found in CSV files under {path}")
    return questions


def evaluate_questions(questions: list[tuple[str, str]], *, top_n: int, settings: object) -> list[EvaluationResult]:
    """Run each question through RAG and capture per-question timing."""

    results: list[EvaluationResult] = []
    for question_file, question in questions:
        started_at = perf_counter()
        answer = answer_rag_question(question, top_n=top_n, settings=settings)
        results.append(EvaluationResult(question_file=question_file, answer=answer, duration_ms=elapsed_ms(started_at)))
    return results


def resolve_output_path() -> Path:
    """Return a timestamped JSON output path and ensure its parent exists."""

    DEFAULT_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(UTC).strftime("%Y%m%d-%H%M%S")
    return DEFAULT_OUTPUT_DIR / f"rag-evaluation-{timestamp}.json"


def write_json_results(
    path: Path,
    results: list[EvaluationResult],
    *,
    benchmark: dict[str, object] | None = None,
    summary: dict[str, object] | None = None,
) -> None:
    """Write a structured JSON report that preserves Markdown answers."""

    payload = {
        "created_at": datetime.now(UTC).isoformat(),
        "summary": summary or build_summary(results),
        "benchmark": benchmark or build_benchmark(results),
        "results": [build_json_result(result) for result in results],
    }
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def build_summary(results: list[EvaluationResult]) -> dict[str, object]:
    """Build run-level summary metadata for an evaluation report."""

    slowest = max(results, key=lambda result: result.duration_ms, default=None)
    return {
        "question_count": len(results),
        "question_files": sorted({result.question_file for result in results}),
        "slowest_question": slowest.answer.question if slowest else "",
        "slowest_question_ms": slowest.duration_ms if slowest else 0,
    }


def build_benchmark(results: list[EvaluationResult]) -> dict[str, object]:
    """Build fallback benchmark metadata from per-question timings."""

    answer_ms = sum(result.duration_ms for result in results)
    return {
        "answer_questions_total_ms": answer_ms,
        "answer_questions_avg_ms": round(answer_ms / len(results), 2) if results else 0.0,
    }


def build_json_result(result: EvaluationResult) -> dict[str, object]:
    """Convert one structured RAG answer into JSON output."""

    answer = result.answer
    chunks = answer.selected_chunks
    return {
        "question": answer.question,
        "question_file": result.question_file,
        "answer": answer.answer,
        "sources": answer.sources,
        "rewritten_query": answer.rewritten_query or "",
        "top_chunks": [build_json_chunk(chunk) for chunk in chunks],
        "metadata": answer.metadata,
        "duration_ms": result.duration_ms,
        "created_at": datetime.now(UTC).isoformat(),
    }


def build_json_chunk(chunk: dict[str, object]) -> dict[str, object]:
    """Extract readable chunk fields for JSON evaluation output."""

    return {
        "title": chunk.get("title", ""),
        "path": chunk.get("path", ""),
        "source_uri": chunk.get("source_uri", chunk.get("path", "")),
        "content_type": chunk.get("content_type", ""),
        "section_title": chunk.get("section_title", ""),
        "rerank_score": chunk.get("rerank_score", 0.0),
        "relevance": chunk.get("relevance", 0.0),
        "boost": chunk.get("boost", 1.0),
        "boosted_score": chunk.get("boosted_score", chunk.get("rerank_score", 0.0)),
    }


def print_benchmark_summary(
    *,
    output_path: Path,
    question_count: int,
    settings_ms: int,
    bootstrap_ms: int,
    load_ms: int,
    write_ms: int,
    total_ms: int,
    results: list[EvaluationResult],
) -> None:
    """Print evaluation timing details to stdout."""

    answer_ms = sum(result.duration_ms for result in results)
    average_ms = round(answer_ms / question_count, 2) if question_count else 0.0
    slowest = max(results, key=lambda result: result.duration_ms, default=None)

    print(f"Wrote {question_count} RAG evaluation results to {output_path}")
    print("Benchmark:")
    print(f"  settings: {settings_ms} ms")
    print(f"  bootstrap: {bootstrap_ms} ms")
    print(f"  load_questions: {load_ms} ms")
    print(f"  answer_questions_total: {answer_ms} ms")
    print(f"  answer_questions_avg: {average_ms} ms")
    if slowest is not None:
        print(f"  slowest_question: {slowest.duration_ms} ms - {slowest.answer.question}")
    print(f"  write_results: {write_ms} ms")
    print(f"  total: {total_ms} ms")


def elapsed_ms(started_at: float) -> int:
    """Convert elapsed perf_counter seconds to milliseconds."""

    return max(0, int((perf_counter() - started_at) * 1000))


if __name__ == "__main__":
    main()
