import pymupdf
import re
from typing import List, Dict, Optional
from .config import rag_config

class RHPParser:
    def __init__(self, pdf_path: str, ipo_name: str):
        self.pdf_path = pdf_path
        self.ipo_name = ipo_name
        self.doc = None

    def open(self):
        """Opens the PDF document."""
        self.doc = pymupdf.open(self.pdf_path)
        return self

    def close(self):
        """Closes the PDF document."""
        if self.doc:
            self.doc.close()

    def _clean_text(self, text: str) -> str:
        """Cleans text by removing excessive whitespaces and headers/footers placeholders if manageable."""
        # Replace multiple spaces/newlines with single space
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def _detect_section(self, text: str) -> Optional[str]:
        """Detects if a line matches any known section header."""
        cleaned_text = text.upper()
        
        for section, keywords in rag_config.SECTION_KEYWORDS.items():
            for kw in keywords:
                # Look for keyword on its own line or start of line
                if kw in cleaned_text:
                    return section
        return None

    def parse_pages(self) -> List[Dict]:
        """
        Parses pages, detects sections, and yields structured page data.
        Returns: List of Dict containing page_no, section, text, and metadata.
        """
        if not self.doc:
            self.open()

        parsed_data = []
        current_section = "GENERAL"  # Default fallback section
        
        # Heuristic: Skip first 10-15 pages to avoid Index page false positives for sections
        start_page = 15 if len(self.doc) > 30 else 0

        for page_num in range(start_page, len(self.doc)):
            page = self.doc[page_num]
            text = page.get_text("text") or ""
            
            # Simple header detection from page top
            # Usually headings are near the top of the page if it's a new section
            top_text = text[:300]  # Just check first 300 chars for header
            detected = self._detect_section(top_text)
            
            if detected:
                current_section = detected

            cleaned_text = self._clean_text(text)
            
            # Skip empty pages
            if not cleaned_text or len(cleaned_text) < 50:
                continue

            parsed_data.append({
                "ipo_name": self.ipo_name,
                "section": current_section,
                "page_number": page_num + 1,  # 1-indexed
                "text": cleaned_text
            })

        return parsed_data

# Example usage (can be run as a script to verify):
if __name__ == "__main__":
    parser = RHPParser("path_to_rhp.pdf", "Example IPO")
    try:
        pages = parser.parse_pages()
        print(f"Parsed {len(pages)} pages.")
        if pages:
            print("First page sample:", pages[0])
    except Exception as e:
        print(f"Error parsing: {e}")
