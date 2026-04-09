import os
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import ChatGoogleGenerativeAI
from .document_processor import DocumentProcessor
from langchain_core.documents import Document

class InsightVectorStore:
    def __init__(self, doc_id: str):
        self.doc_id = doc_id
        # Shared vector DB store location for all documents
        self.db_path = ".data/insight_vectors/shared_index"
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        # Local, Free Embeddings
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.vector_db = None

    def ingest_document(self, pdf_path: str):
        print(f"Ingesting document for doc_id {self.doc_id}")
        doc_processor = DocumentProcessor(pdf_path)
        
        parsed_pages = doc_processor.get_parsed_pages()
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, 
            chunk_overlap=200, 
            separators=["\n\n", "\n", ".", " ", ""]
        )
        
        docs = []
        for page in parsed_pages:
            chunks = text_splitter.split_text(page["text"])
            for i, chunk in enumerate(chunks):
                doc = Document(
                    page_content=chunk, 
                    metadata={
                        "doc_id": self.doc_id, 
                        "section": page["section"],
                        "chunk_id": f"{page['page_number']}_{i}"
                    }
                )
                docs.append(doc)
        
        if not docs:
            print(f"[{self.doc_id}] Warning: No extractable text found for FAISS.")
            return

        index_file = os.path.join(self.db_path, "index.faiss")
        if os.path.exists(index_file):
            self.vector_db = FAISS.load_local(self.db_path, self.embeddings, allow_dangerous_deserialization=True)
            self.vector_db.add_documents(docs)
        else:
            self.vector_db = FAISS.from_documents(docs, self.embeddings)
            
        self.vector_db.save_local(self.db_path)
        print(f"FAISS vector store updated at {self.db_path}")

    def load_db(self):
        index_file = os.path.join(self.db_path, "index.faiss")
        if os.path.exists(index_file):
            self.vector_db = FAISS.load_local(self.db_path, self.embeddings, allow_dangerous_deserialization=True)
        else:
            raise FileNotFoundError(f"Vector Database not found at {self.db_path}")

    def answer_rag(self, query: str, section: str = None) -> str:
        """Runs unstructured queries against RAG."""
        if not self.vector_db:
            self.load_db()

        # Build filters: strictly filter by doc_id
        search_kwargs = {"k": 4, "filter": {"doc_id": self.doc_id}}
        if section:
            search_kwargs["filter"]["section"] = section

        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash-latest",
            google_api_key=os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY"),
            temperature=0.0
        )
        
        retriever = self.vector_db.as_retriever(search_kwargs=search_kwargs)
        docs = retriever.invoke(query)
        context_str = "\n\n---\n\n".join([d.page_content for d in docs])

        prompt = f"""
You are an IPO analysis assistant.

Rules:
- Answer ONLY from the given context
- Do NOT assume or hallucinate
- If data is missing, say "Not available in document"
- Keep answers concise and factual

Context:
{context_str}

Question:
{query}
"""
        response = llm.invoke(prompt)
        return response.content
