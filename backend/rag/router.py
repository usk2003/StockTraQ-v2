import shutil
import os
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from pydantic import BaseModel
from typing import Optional, List, Dict

from .parser import RHPParser
from .chunker import RHPChunker
from .vector_store import RHPVectorStore
from .retriever import RAGRetriever

router = APIRouter(prefix="/rag", tags=["RAG"])

# Lazy Initialization to prevent blocking FastAPI Startup
_vector_store = None
_retriever = None

def get_vector_store():
    global _vector_store
    if _vector_store is None:
        _vector_store = RHPVectorStore()
        _vector_store.load()
    return _vector_store

def get_retriever():
    global _retriever
    if _retriever is None:
        _retriever = RAGRetriever(get_vector_store())
    return _retriever

class QueryRequest(BaseModel):
    query: str
    ipo_name: Optional[str] = None  # e.g., "Zomato IPO"
    section_filter: Optional[str] = None  # e.g., "RISK FACTORS"

class QueryResponse(BaseModel):
    answer: str
    sources: List[Dict]

@router.post("/ingest", summary="Ingest RHP PDF")
async def ingest_pdf(ipo_name: str = Form(...), file: UploadFile = File(...)):
    """
    Uploads a Red Herring Prospectus PDF, parses sections, chunks texts, 
    generates embeddings, and stores in FAISS.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed.")

    # Save to temp directory
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, file.filename)

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 1. Parse PDF
        parser = RHPParser(temp_path, ipo_name)
        parsed_pages = parser.parse_pages()
        parser.close()

        if not parsed_pages:
             raise HTTPException(status_code=400, detail="Could not extract text from any page.")

        # 2. Chunk Text
        chunker = RHPChunker()
        chunks = chunker.chunk_pages(parsed_pages)

        if not chunks:
             raise HTTPException(status_code=400, detail="Text extraction yielded zero valid text chunks.")

        # 3. Add to Vector Store
        store = get_vector_store()
        store.add_chunks(chunks)
        store.save()

        return {
            "message": f"Successfully ingested {ipo_name} RHP PDF.",
            "pages_parsed": len(parsed_pages),
            "chunks_created": len(chunks),
            "total_knowledge_chunks": len(store.metadata)
        }

    except Exception as e:
        print(f"Ingestion Error for {ipo_name}: {e}")
        raise HTTPException(status_code=500, detail=f"Pipeline Error: {str(e)}")
    finally:
        # Cleanup file
        if os.path.exists(temp_path):
            os.remove(temp_path)

@router.post("/query", response_model=QueryResponse, summary="Query RHP Knowledge Base")
async def query_bot(request: QueryRequest):
    """
    Search RAG Knowledge Base and return grounded LLM answer using context.
    """
    try:
        result = get_retriever().answer_query(
            request.query, 
            section_filter=request.section_filter,
            ipo_name=request.ipo_name
        )
        return QueryResponse(
            answer=result["answer"],
            sources=result["sources"]
        )
    except Exception as e:
        print(f"Query Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
