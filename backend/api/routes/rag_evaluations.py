from fastapi import APIRouter, HTTPException

from api.core.evaluation_reports import list_evaluation_reports, load_evaluation_report

router = APIRouter(prefix="/rag-evaluations", tags=["rag-evaluations"])


@router.get("")
def rag_evaluations() -> dict[str, object]:
    """List available offline RAG evaluation reports."""

    return {"evaluations": list_evaluation_reports()}


@router.get("/{filename}")
def rag_evaluation(filename: str) -> dict[str, object]:
    """Return one offline RAG evaluation report."""

    try:
        return load_evaluation_report(filename)
    except (FileNotFoundError, ValueError) as error:
        raise HTTPException(status_code=404, detail="Evaluation report not found.") from error
