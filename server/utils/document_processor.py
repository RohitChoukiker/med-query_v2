"""
Document processing utilities for text extraction, chunking, and vectorization
"""
import os
import uuid
import shutil
import warnings
import logging
from pathlib import Path
from typing import List
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
from pdfminer.high_level import extract_text as pdf_extract
import docx
from PIL import Image
import pytesseract
from tqdm.auto import tqdm

# Suppress FutureWarning from huggingface_hub about resume_download
warnings.filterwarnings("ignore", category=FutureWarning, module="huggingface_hub")

# Configure logger
logger = logging.getLogger(__name__)

# --- Config ---
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
FILES_DIR = DATA_DIR / "files"
VECTOR_DIR = DATA_DIR / "vectors"

os.makedirs(FILES_DIR, exist_ok=True)
os.makedirs(VECTOR_DIR, exist_ok=True)

# --- Embeddings & FAISS (single index) ---
EMBED_DIM = 384  # for all-MiniLM-L6-v2

# Lazy loading of model to avoid warnings at import time
_model = None

def get_model():
    """Get or initialize the sentence transformer model."""
    global _model
    if _model is None:
        # Suppress warnings during model loading
        with warnings.catch_warnings():
            warnings.filterwarnings("ignore", category=FutureWarning)
            _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model

index_path = VECTOR_DIR / "faiss.index"
meta_path = VECTOR_DIR / "meta.npy"  # store metadata list (dicts) as numpy object

# Initialize or load FAISS index
if index_path.exists():
    index = faiss.read_index(str(index_path))
    metas = list(np.load(str(meta_path), allow_pickle=True))
else:
    index = faiss.IndexFlatL2(EMBED_DIM)
    metas = []


def extract_text_from_file(path: Path) -> str:
    """Extract text from various file formats."""
    suffix = path.suffix.lower()
    
    if suffix == ".pdf":
        try:
            return pdf_extract(str(path))
        except Exception:
            # fallback: try OCR page-by-page (slow)
            try:
                from pdf2image import convert_from_path  # type: ignore
                text = ""
                pages = convert_from_path(str(path))
                for p in pages:
                    text += pytesseract.image_to_string(p)
                return text
            except Exception:
                return ""
    elif suffix in (".docx", ".doc"):
        try:
            doc = docx.Document(str(path))
            return "\n".join(p.text for p in doc.paragraphs)
        except Exception:
            return ""
    else:
        # plain text / unknown: try read
        try:
            return path.read_text(errors="ignore")
        except:
            return ""


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 200) -> List[str]:
    """Split text into overlapping chunks."""
    chunks = []
    start = 0
    length = len(text)
    
    while start < length:
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start = end - overlap
        if start < 0:
            start = 0
        if start >= length:
            break
    
    return chunks


def process_document(doc_id: str, filepath: str, filename: str, user_id: int, db_session=None):
    """Process document: extract text, chunk, embed, and add to FAISS index."""
    from models import Document
    from database import SessionLocal
    
    # Create a new session if one wasn't provided (for background tasks)
    if db_session is None:
        db = SessionLocal()
    else:
        db = db_session
    
    logger.info("Processing document %s (%s) for user %s", doc_id, filename, user_id)
    try:
        path = Path(filepath)
        text = extract_text_from_file(path)
        preview = text[:2000]
        logger.info("Extracted %s characters from %s", len(text), filename)
        
        # chunk & embed
        chunks = chunk_text(text)
        if len(chunks) == 0:
            # Delete document if no text extracted
            doc = db.query(Document).filter(Document.id == doc_id).first()
            if doc:
                db.delete(doc)
                db.commit()
            logger.warning("No text extracted for document %s. Entry removed.", doc_id)
            return False
        
        embeddings = get_model().encode(chunks, show_progress_bar=False)
        embeddings = np.array(embeddings).astype("float32")
        logger.info("Chunked document into %s chunks", len(chunks))
        
        # append to FAISS index and metas with progress bar
        global index, metas, index_path, meta_path
        
        progress = tqdm(
            total=len(chunks),
            desc=f"Indexing {filename}",
            unit="chunk",
            leave=False
        )
        for i, chunk in enumerate(chunks):
            metas.append({
                "doc_id": doc_id,
                "chunk_id": f"{doc_id}_{i}",
                "text": chunk,
                "filename": filename,
                "user_id": user_id
            })
            progress.update(1)
        progress.close()

        index.add(embeddings)
        
        # persist index & metas
        faiss.write_index(index, str(index_path))
        np.save(str(meta_path), np.array(metas, dtype=object))
        logger.info("Persisted FAISS index to %s (total vectors: %s)", index_path, index.ntotal)
        
        # update db
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if doc:
            doc.processed = True
            doc.text_preview = preview
            db.add(doc)
            db.commit()
            logger.info("Document %s marked as processed", doc_id)
        
        return True
    except Exception as exc:
        logger.exception("Failed to process document %s: %s", doc_id, exc)
        raise
    finally:
        # Only close if we created the session
        if db_session is None:
            db.close()


def search_documents(query: str, top_k: int = 5, user_id: int = None) -> List[dict]:
    """Search documents using FAISS vector search."""
    global index, metas
    
    # embed query
    q_emb = get_model().encode([query]).astype("float32")
    D, I = index.search(q_emb, top_k)
    
    results = []
    for idx in I[0]:
        if idx < 0 or idx >= len(metas):
            continue
        
        meta = metas[idx]
        
        # Only return docs the user owns (important)
        if user_id is not None and meta["user_id"] != user_id:
            continue
        
        results.append({
            "doc_id": meta["doc_id"],
            "text": meta["text"][:800],
            "filename": meta["filename"],
            "chunk_id": meta["chunk_id"]
        })
    
    return results

