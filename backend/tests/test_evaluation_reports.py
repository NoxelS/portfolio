import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from api.core.evaluation_reports import is_safe_evaluation_filename, list_evaluation_reports, load_evaluation_report
from api.main import app


def write_report(path: Path) -> None:
    path.write_text(
        json.dumps(
            {
                "created_at": "2026-05-16T08:18:31+00:00",
                "summary": {"question_count": 1},
                "benchmark": {"total_ms": 123},
                "results": [],
            }
        ),
        encoding="utf-8",
    )


def test_safe_evaluation_filename_validation() -> None:
    assert is_safe_evaluation_filename("rag-evaluation-20260516-081631.json")
    assert not is_safe_evaluation_filename("../rag-evaluation-20260516-081631.json")
    assert not is_safe_evaluation_filename("other.json")


def test_list_and_load_evaluation_reports(tmp_path: Path) -> None:
    report = tmp_path / "rag-evaluation-20260516-081631.json"
    write_report(report)
    (tmp_path / "ignored.json").write_text("{}", encoding="utf-8")

    reports = list_evaluation_reports(tmp_path)

    assert reports == [
        {
            "filename": report.name,
            "created_at": "2026-05-16T08:18:31+00:00",
            "summary": {"question_count": 1},
            "benchmark": {"total_ms": 123},
        }
    ]
    assert load_evaluation_report(report.name, output_dir=tmp_path)["summary"] == {"question_count": 1}


def test_load_evaluation_report_rejects_unsafe_filename(tmp_path: Path) -> None:
    with pytest.raises(FileNotFoundError):
        load_evaluation_report("../rag-evaluation-20260516-081631.json", output_dir=tmp_path)


def test_rag_evaluations_endpoint_returns_list() -> None:
    response = TestClient(app).get("/rag-evaluations")

    assert response.status_code == 200
    assert "evaluations" in response.json()
