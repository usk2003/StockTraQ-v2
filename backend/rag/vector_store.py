import os
import faiss
import json
import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Dict
from .config import rag_config

class RHPVectorStore:
    def __init__(self):
        # Load SentenceTransformer model
        self.model = SentenceTransformer(rag_config.EMBEDDING_MODEL)
        self.dimension = self.model.get_sentence_embedding_dimension()
        
        # Initialize FAISS index
        self.index = faiss.IndexFlatL2(self.dimension)
        self.metadata: List[Dict] = []  # Maps index_id to chunk data

    def add_chunks(self, chunks: List[Dict]):
        """
        Generates embeddings and adds to FAISS index.
        """
        if not chunks:
            return

        texts = [chunk["text"] for chunk in chunks]
        
        # Generate Embeddings (Normalize for Cosine Similarity mapping if needed, but L2 works)
        embeddings = self.model.encode(texts, convert_to_numpy=True)
        embeddings = embeddings.astype('float32')

        # Add to FAISS index
        self.index.add(embeddings)
        self.metadata.extend(chunks)

    def search(self, query: str, k: int = 5, section_filter: str = None, ipo_name: str = None) -> List[Dict]:
        """
        Searches the vector store for top-K matching chunks.
        Allows filtering by section and IPO name if specified.
        """
        if self.index.ntotal == 0:
            return []

        # Embed query
        query_vector = self.model.encode([query], convert_to_numpy=True)
        query_vector = query_vector.astype('float32')

        # Search index
        # We can increase k if section and company filter is present
        search_k = k * 5 if (section_filter or ipo_name) else k
        distances, indices = self.index.search(query_vector, search_k)

        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx == -1: continue
            chunk = self.metadata[int(idx)]
            
            # Apply IPO Name Filtering if requested
            if ipo_name and chunk.get("ipo_name", "").upper() != ipo_name.upper():
                continue

            # Apply Section Filtering if requested
            if section_filter and chunk.get("section", "").upper() != section_filter.upper():
                continue

            results.append({
                "text": chunk["text"],
                "metadata": {
                    "ipo_name": chunk["ipo_name"],
                    "section": chunk.get("section"),
                    "page_number": chunk.get("page_number"),
                    "chunk_id": chunk.get("chunk_id")
                },
                "score": float(dist)  # L2 distance (Lower is better)
            })

            if len(results) >= k:
                break

        return results

    def save(self):
        """Saves both FAISS index and metadata to disk."""
        faiss.write_index(self.index, rag_config.FAISS_INDEX_PATH)
        with open(rag_config.METADATA_PATH, 'w') as f:
            json.dump(self.metadata, f, indent=2)

    def load(self):
        """Loads index and metadata from disk."""
        if os.path.exists(rag_config.FAISS_INDEX_PATH) and os.path.exists(rag_config.METADATA_PATH):
            self.index = faiss.read_index(rag_config.FAISS_INDEX_PATH)
            with open(rag_config.METADATA_PATH, 'r') as f:
                self.metadata = json.load(f)
        else:
            print("[WARN] Vector store files not found for loading.")

# Example usage (can be run as a script):
if __name__ == "__main__":
    store = RHPVectorStore()
    sample_chunks = [
        {"ipo_name": "Test IPO", "section": "RISK FACTORS", "text": "This is a safety risk factor about the company."}
    ]
    store.add_chunks(sample_chunks)
    store.save()
    
    # Load and search
    new_store = RHPVectorStore()
    new_store.load()
    print("Loaded chunks:", len(new_store.metadata))
    res = new_store.search("safety risk", k=1)
    print("Search Result:", res)
