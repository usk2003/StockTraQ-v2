import os
import shutil
import uuid
import asyncio
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, Form, BackgroundTasks
from pydantic import BaseModel
from database import get_database
from typing import List

from .extractor import HybridExtractor
from .validator import ValidationLayer
from .vector_store import InsightVectorStore

router = APIRouter(prefix="/insight", tags=["InsightTraQ"])

class ChatRequest(BaseModel):
    doc_id: str
    query: str

async def process_document_background(temp_path: str, doc_id: str, filename: str, custom_name: str, db):
    try:
        print(f"[{doc_id}] Starting Background Processing...")
        # 1. Structure extraction
        extractor = HybridExtractor(temp_path)
        raw_insight = await asyncio.to_thread(extractor.extract_all)
        validated_insight = ValidationLayer.validate_and_flag(raw_insight)
        
        # 2. Update DB with data and mark as active so UI can pull
        await db.insight_documents.update_one(
            {"doc_id": doc_id},
            {"$set": {
                "extracted_data": validated_insight.model_dump(by_alias=True)
            }}
        )
        
        # 3. Vector Ingestion
        print(f"[{doc_id}] Starting Vector Store Ingestion...")
        vector_store = InsightVectorStore(doc_id)
        # Assuming ingest_document handles the company_name internally or via hybrid 
        await asyncio.to_thread(vector_store.ingest_document, temp_path)
        
        # Mark fully completed
        await db.insight_documents.update_one(
            {"doc_id": doc_id},
            {"$set": {"status": "completed"}}
        )
        print(f"[{doc_id}] Processing Completed.")
        
    except Exception as e:
        print(f"[{doc_id}] Error in background processing: {str(e)}")
        await db.insight_documents.update_one(
            {"doc_id": doc_id},
            {"$set": {"status": "failed", "error": str(e)}}
        )
    finally:
        # On Windows, pdfplumber may hold a file lock briefly after processing.
        # We attempt cleanup and silently ignore if still locked.
        import time
        for _ in range(3):
            try:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                break
            except PermissionError:
                time.sleep(1)

@router.post("/upload")
async def upload_drhp(background_tasks: BackgroundTasks, file: UploadFile = File(...), custom_name: str = Form(None), db = Depends(get_database)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed.")

    doc_id = str(uuid.uuid4())
    temp_dir = ".temp_uploads/insight"
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, f"{doc_id}_{file.filename}")

    try:
        # Save file locally
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Create initial DB record
        doc_name = custom_name if custom_name else file.filename
        await db.insight_documents.insert_one({
            "doc_id": doc_id,
            "filename": doc_name,
            "status": "processing",
            "extracted_data": {}
        })

        # Spawn background task
        background_tasks.add_task(process_document_background, temp_path, doc_id, file.filename, custom_name, db)

        return {"message": "Processing started", "doc_id": doc_id, "status": "processing"}

    except Exception as e:
        print(f"InsightTraQ Pipeline Error: {str(e)}")
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{doc_id}")
async def get_document_status(doc_id: str, db = Depends(get_database)):
    doc = await db.insight_documents.find_one({"doc_id": doc_id}, {"_id": 0, "status": 1, "error": 1})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.get("/all-documents")
async def list_all_documents(db = Depends(get_database)):
    """Admin endpoint: returns ALL documents regardless of status."""
    try:
        docs = await db.insight_documents.find({}, {"_id": 0, "doc_id": 1, "filename": 1, "status": 1}).to_list(200)
        return docs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents")
async def list_documents(db = Depends(get_database)):
    try:
        docs = await db.insight_documents.find({"status": "completed"}, {"_id": 0, "doc_id": 1, "filename": 1}).to_list(100)
        return docs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents/{doc_id}")
async def get_document(doc_id: str, db = Depends(get_database)):
    doc = await db.insight_documents.find_one({"doc_id": doc_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str, db = Depends(get_database)):
    """Allows admin to delete a document record from MongoDB (e.g. failed/broken uploads)."""
    result = await db.insight_documents.delete_one({"doc_id": doc_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": f"Document {doc_id} deleted successfully"}

def is_structured_query(query: str) -> bool:
    structured_keywords = [
        "revenue", "profit", "roe", "roce", "eps", "pat", 
        "pe", "p/e", "assets", "listing", "issue size", "date", 
        "net worth", "ebitda", "margin", "promoter", "debt"
    ]
    lower_q = query.lower()
    return any(kw in lower_q for kw in structured_keywords)

def get_section_filter(query: str) -> str:
    lower_q = query.lower()
    if "risk" in lower_q:
        return "RISK FACTORS"
    elif "financial" in lower_q or "statement" in lower_q:
        return "FINANCIAL INFORMATION"
    elif "business" in lower_q or "industry" in lower_q:
        return "BUSINESS OVERVIEW"
    elif "object" in lower_q or "fund" in lower_q:
        return "OBJECTS OF THE ISSUE"
    return None

@router.post("/chat")
async def chat_with_document(request: ChatRequest, db = Depends(get_database)):
    try:
        # Check processing status
        doc = await db.insight_documents.find_one({"doc_id": request.doc_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        
        if doc.get("status") != "completed":
            return {"answer": "Document is still processing or failed. Please wait for completion."}

        # Hybrid routing
        if is_structured_query(request.query):
            # Use MongoDB extracted JSON
            extracted_data = doc.get("extracted_data", {})
            import json
            data_str = json.dumps(extracted_data, indent=2)
            
            from langchain_google_genai import ChatGoogleGenerativeAI
            from langchain_core.prompts import PromptTemplate
            
            llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash-latest", 
                google_api_key=os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY"), 
                temperature=0.0
            )
            
            prompt = PromptTemplate.from_template("Respond strictly using the following JSON data. Keep it factual and concise. If the value says 'Not Available', say 'Not available in document'.\nJSON Data:\n{data}\n\nQuestion: {question}")
            answer = llm.invoke(prompt.format(data=data_str, question=request.query)).content
            
            return {"answer": answer}
            
        else:
            # Unstructured RAG
            vStore = InsightVectorStore(request.doc_id)
            section = get_section_filter(request.query)
            try:
                answer = vStore.answer_rag(request.query, section=section)
                return {"answer": answer}
            except Exception as v_err:
                # If RAG fails (e.g. index not found), fallback safely
                return {"answer": f"RAG Search unavailable: {v_err}"}

    except Exception as e:
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
