import os
from langchain_google_genai import ChatGoogleGenerativeAI
from typing import List, Dict
from .vector_store import RHPVectorStore

class RAGRetriever:
    def __init__(self, vector_store: RHPVectorStore):
        self.vector_store = vector_store
        
        from .config import rag_config
        
        # Explicitly load from Pydantic config that reads .env
        api_key = rag_config.GEMINI_API_KEY or rag_config.GOOGLE_API_KEY
        if api_key:
            os.environ["GOOGLE_API_KEY"] = api_key

        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash", 
            temperature=0.2,
            max_output_tokens=1000
        )

    def _build_context(self, chunks: List[Dict]) -> str:
        """Formates chunks into context text with page references."""
        context_parts = []
        for idx, item in enumerate(chunks):
            metadata = item["metadata"]
            page = metadata.get("page_number", "Unknown")
            section = metadata.get("section", "Unknown")
            text = item["text"]
            context_parts.append(f"Source {idx+1} [Section: {section}, Page: {page}]:\n{text}")
        
        return "\n\n".join(context_parts)

    def _build_prompt(self, query: str, context: str) -> str:
        """Generates Prompt Template to avoid hallucinations."""
        return f"""
You are an expert IPO Analyst and Financial Advisor assistant. Your job is to answer the user's question based ONLY on the provided RHP (Red Herring Prospectus) sections.

Context from RHP PDF:
----------------------
{context}
----------------------

Strict Guidelines:
1. Answer the user's question using the Context ABOVE accurately, concisely, and professionally.
2. Provide page numbers or section names for your assertions where available in the context.
3. If the answer cannot be found or deduced from the Context, state: "The provided Red Herring Prospectus does not contain information on this topic."
4. DO NOT use external knowledge or make up facts. No hallucinations.

User Question: {query}

Analytical Answer:
"""

    def answer_query(self, query: str, section_filter: str = None, ipo_name: str = None) -> Dict:
        """
        Retrieves top context and generates answer.
        Returns Dict with answer and source chunks.
        """
        # Retrieve top 4 relevant chunks
        chunks = self.vector_store.search(query, k=4, section_filter=section_filter, ipo_name=ipo_name)
        
        if not chunks:
            return {
                "answer": "No relevant sections found in the RHP index to answer this query.",
                "sources": []
            }

        context = self._build_context(chunks)
        prompt = self._build_prompt(query, context)

        # Generate Answer
        response = self.llm.invoke(prompt)
        answer = response.content

        return {
            "answer": answer,
            "sources": [
                {
                    "text": c["text"],
                    "section": c["metadata"].get("section"),
                    "page_number": c["metadata"].get("page_number")
                } for c in chunks
            ]
        }

# Example usage (can be run as a script):
if __name__ == "__main__":
    store = RHPVectorStore()
    store.load()  # Must be populated first
    
    retriever = RAGRetriever(store)
    if store.metadata:
        res = retriever.answer_query("What are the key risks?")
        print("Answer:\n", res["answer"])
        print("\nSources:\n", res["sources"])
    else:
         print("Store empty for testing.")
