import json
import logging
import os
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from repository.auth import get_current_user
from database import UserRole, get_db
from models import User, UserQuery
from schemas import (
    AIQueryRequest,
    QueryAnswerResponse,
    QueryHistoryResponse,
    QuerySource,
)
from utils.document_processor import search_documents

import google.generativeai as genai

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["ai"])

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = "models/gemini-2.5-pro-preview-03-25"

_gemini_model = None


def _init_gemini():
    global _gemini_model
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GEMINI_API_KEY is not configured on the server",
        )
    if _gemini_model is None:
        genai.configure(api_key=GEMINI_API_KEY)
        _gemini_model = genai.GenerativeModel(GEMINI_MODEL)
    return _gemini_model


def _validate_role(user: User):
    if user.role not in (UserRole.doctor, UserRole.researcher, UserRole.patient):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors, researchers, and patients can access the AI assistant.",
        )


def _serialize_sources(raw_results: List[dict]) -> List[QuerySource]:
    return [
        QuerySource(
            doc_id=match["doc_id"],
            filename=match["filename"],
            chunk_id=match["chunk_id"],
            snippet=match["text"],
        )
        for match in raw_results
    ]


def _build_prompt(question: str, sources: List[QuerySource]) -> str:
    context_blocks = "\n\n".join(
        [
            f"Document: {source.filename}\nChunk ID: {source.chunk_id}\nExcerpt:\n{source.snippet}"
            for source in sources
        ]
    )
    instructions = (
        "You are a clinical copilot that must strictly answer using ONLY the provided document excerpts. "
        "If the context does not contain enough information to answer safely, clearly say that no relevant "
        "information was found and recommend uploading or referencing additional clinical documents. "
        "Whenever possible, cite the document names you used."
    )
    return (
        f"{instructions}\n\nContext:\n{context_blocks}\n\n"
        f"Question: {question}\n\nAnswer:"
    )


def _build_fallback_prompt(question: str) -> str:
    instructions = (
        "You are a clinical copilot that must provide careful, evidence-aware insights. "
        "You currently do not have user-uploaded context, so answer using general medical knowledge "
        "from reputable sources. Clearly mention that no user documents were matched."
    )
    return f"{instructions}\n\nQuestion: {question}\n\nAnswer:"


def _generate_answer_from_model(prompt: str) -> str:
    try:
        model = _init_gemini()
        response = model.generate_content(prompt)
        answer_text = (response.text or "").strip()
        return answer_text
    except Exception as exc:
        logger.exception("Gemini generation failed: %s", exc)
        raise HTTPException(
            status_code=500,
            detail="Failed to generate an answer from the AI model.",
        )


def _store_query(
    db: Session,
    user: User,
    question: str,
    answer: str,
    sources: List[QuerySource],
):
    record = UserQuery(
        user_id=user.id,
        role=user.role,
        question=question,
        answer=answer,
        sources=json.dumps([source.model_dump() for source in sources]),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def _deserialize_sources(record: UserQuery) -> List[QuerySource]:
    if not record.sources:
        return []
    try:
        data = json.loads(record.sources)
        return [QuerySource(**item) for item in data]
    except (json.JSONDecodeError, TypeError) as exc:
        logger.warning("Failed to parse sources for query %s: %s", record.id, exc)
        return []


@router.post("/query", response_model=QueryAnswerResponse)
def ask_ai(
    payload: AIQueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Answer a medical query strictly using FAISS vector matches."""
    _validate_role(current_user)
    question = payload.question.strip()
    if not question:
        raise HTTPException(status_code=422, detail="Question cannot be empty.")

    matches = search_documents(question, top_k=5, user_id=current_user.id)
    sources = _serialize_sources(matches)

    if not sources:
        prompt = _build_fallback_prompt(question)
        answer_text = _generate_answer_from_model(prompt)
        if not answer_text:
            answer_text = (
                "No uploaded documents matched your query, and the AI could not synthesize an answer. "
                "Please upload relevant research files and try again."
            )
        record = _store_query(db, current_user, question, answer_text, [])
        return QueryAnswerResponse(
            question=question,
            answer=answer_text,
            sources=[],
            created_at=record.created_at,
        )

    prompt = _build_prompt(question, sources)
    answer_text = _generate_answer_from_model(prompt)

    if not answer_text:
        answer_text = (
            "The AI model could not produce an answer based on the available context."
        )

    record = _store_query(db, current_user, question, answer_text, sources)
    return QueryAnswerResponse(
        question=question,
        answer=answer_text,
        sources=sources,
        created_at=record.created_at,
    )


@router.get("/history", response_model=QueryHistoryResponse)
def get_query_history(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the most recent queries for the authenticated user."""
    _validate_role(current_user)

    records = (
        db.query(UserQuery)
        .filter(UserQuery.user_id == current_user.id)
        .order_by(UserQuery.created_at.desc())
        .limit(limit)
        .all()
    )

    queries = [
        QueryAnswerResponse(
            question=record.question,
            answer=record.answer,
            sources=_deserialize_sources(record),
            created_at=record.created_at,
        )
        for record in records
    ]

    return QueryHistoryResponse(queries=queries)

