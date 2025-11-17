import os
import uuid
import shutil
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session
from repository.auth import get_current_user
from models import User, Document
from database import UserRole, get_db
from utils.document_processor import process_document, search_documents
from schemas import DocumentUploadResponse, DocumentListResponse, DocumentSearchResponse

router = APIRouter(prefix="/documents", tags=["documents"])

# Directory setup
DATA_DIR = Path("./data")
FILES_DIR = DATA_DIR / "files"
os.makedirs(FILES_DIR, exist_ok=True)


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a document for processing and vectorization."""
    # Check if the user is a doctor or researcher
    if current_user.role not in [UserRole.doctor, UserRole.researcher]:
        raise HTTPException(
            status_code=403,
            detail="Access forbidden: Only doctors and researchers can upload documents."
        )
    
    uid = str(uuid.uuid4())
    user_id = current_user.id
    
    user_dir = FILES_DIR / str(user_id)
    os.makedirs(user_dir, exist_ok=True)
    
    dest = user_dir / f"{uid}_{file.filename}"
    
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    # create DB record
    doc = Document(
        id=uid,
        user_id=user_id,
        filename=file.filename,
        filepath=str(dest),
        processed=False
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    # background processing (don't pass db session, it will create its own)
    background_tasks.add_task(process_document, uid, str(dest), file.filename, user_id)
    
    return {
        "id": uid,
        "filename": file.filename,
        "processed": False
    }


@router.get("", response_model=List[DocumentListResponse])
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all documents for the current user."""
    docs = db.query(Document).filter(Document.user_id == current_user.id).all()
    
    res = [
        {
            "id": d.id,
            "filename": d.filename,
            "processed": d.processed,
            "preview": d.text_preview[:500] if d.text_preview else "",
            "created_at": d.created_at
        }
        for d in docs
    ]
    
    return res


@router.get("/download/{doc_id}")
def download(
    doc_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download a document by ID."""
    doc = db.query(Document).filter(
        Document.id == doc_id,
        Document.user_id == current_user.id
    ).first()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not os.path.exists(doc.filepath):
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    return FileResponse(path=doc.filepath, filename=doc.filename)


@router.get("/search", response_model=DocumentSearchResponse)
def search(
    q: str,
    top_k: int = 5,
    current_user: User = Depends(get_current_user)
):
    """Search documents using vector similarity."""
    results = search_documents(q, top_k=top_k, user_id=current_user.id)
    
    return {
        "query": q,
        "results": results
    }