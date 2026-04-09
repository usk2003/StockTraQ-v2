from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List, Dict
from .config import rag_config

class RHPChunker:
    def __init__(self):
        # LangChain text splitter for robust chunking
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=rag_config.CHUNK_SIZE * 5,  # Chars approx 5x words
            chunk_overlap=rag_config.CHUNK_OVERLAP * 5,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )

    def chunk_pages(self, parsed_pages: List[Dict]) -> List[Dict]:
        """
        Splits parsed pages into chunks and adds metadata.
        Returns: List of Dict containing text, metadata, and chunk_id.
        """
        all_chunks = []
        chunk_id_counter = 0

        for page in parsed_pages:
            text = page["text"]
            text_size = len(text)
            
            # Skip page if too small to chunk meaningfully
            if text_size < 100:
                continue

            # Split text using LangChain splitter
            chunks = self.text_splitter.split_text(text)

            for idx, chunk_text in enumerate(chunks):
                if len(chunk_text.split()) < 50:  # Skip too small chunks
                    continue

                all_chunks.append({
                    "ipo_name": page["ipo_name"],
                    "section": page["section"],
                    "page_number": page["page_number"],
                    "chunk_id": f"{page['ipo_name']}_{page['page_number']}_{idx+1}",
                    "text": chunk_text
                })
                chunk_id_counter += 1

        return all_chunks

# Example usage (can be run as a script):
if __name__ == "__main__":
    sample_pages = [
        {"ipo_name": "Test IPO", "section": "RISK FACTORS", "page_number": 1, "text": "This is a risk factor. " * 100}
    ]
    chunker = RHPChunker()
    chunks = chunker.chunk_pages(sample_pages)
    print(f"Generated {len(chunks)} chunks.")
    if chunks:
        print("First chunk:", chunks[0])
