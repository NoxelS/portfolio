from pathlib import Path

from tests.evaluations.run_evaluation import load_question_set, load_questions, resolve_output_path


def test_load_questions_supports_one_question_per_line(tmp_path: Path) -> None:
    path = tmp_path / "questions.csv"
    path.write_text("What projects use Redis?\nDo you use FastAPI?\n", encoding="utf-8")

    assert load_questions(path) == ["What projects use Redis?", "Do you use FastAPI?"]


def test_load_questions_skips_question_header(tmp_path: Path) -> None:
    path = tmp_path / "questions.csv"
    path.write_text("question\nWhat projects use Redis?\n", encoding="utf-8")

    assert load_questions(path) == ["What projects use Redis?"]


def test_load_question_set_reads_all_csv_files(tmp_path: Path) -> None:
    (tmp_path / "b.csv").write_text("question\nSecond question?\n", encoding="utf-8")
    (tmp_path / "a.csv").write_text("First question?\n", encoding="utf-8")
    (tmp_path / "ignored.txt").write_text("Ignored question?\n", encoding="utf-8")

    assert load_question_set(tmp_path) == [("a.csv", "First question?"), ("b.csv", "Second question?")]


def test_resolve_output_path_always_returns_json() -> None:
    assert resolve_output_path().suffix == ".json"
