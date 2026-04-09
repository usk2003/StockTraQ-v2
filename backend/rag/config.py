import os
from pydantic_settings import BaseSettings

class RagConfig(BaseSettings):
    # Embedding Model
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    
    # Chunking
    CHUNK_SIZE: int = 500  # Target words per chunk
    CHUNK_OVERLAP: int = 100  # Words overlap
    
    # Paths
    FAISS_INDEX_PATH: str = os.path.join(os.path.dirname(__file__), "data", "faiss_index")
    METADATA_PATH: str = os.path.join(os.path.dirname(__file__), "data", "metadata.json")
    
    # Section Detection Keywords (Smart Case Matching)
    SECTION_KEYWORDS: dict = {
        "RISK FACTORS": ["RISK FACTORS", "KEY RISK FACTORS"],
        "BUSINESS OVERVIEW": ["BUSINESS OVERVIEW", "OUR BUSINESS", "OUR INDUSTRY"],
        "FINANCIAL INFORMATION": ["FINANCIAL INFORMATION", "FINANCIAL STATEMENTS"],
        "OBJECTS OF THE ISSUE": ["OBJECTS OF THE ISSUE", "OBJECTS OF THE OFFER", "REQUIREMENTS OF THE FUNDS"]
    }

    class Config:
        env_file = ".env"
        extra = "ignore"

rag_config = RagConfig()

# Ensure data directory exists
os.makedirs(os.path.dirname(rag_config.FAISS_INDEX_PATH), exist_ok=True)
