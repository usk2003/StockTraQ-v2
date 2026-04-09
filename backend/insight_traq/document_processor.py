import pymupdf
import pdfplumber
import re
from typing import List, Dict, Optional

SECTION_KEYWORDS = {
    "RISK FACTORS": ["RISK FACTORS", "KEY RISK FACTORS"],
    "BUSINESS OVERVIEW": ["BUSINESS OVERVIEW", "OUR BUSINESS", "OUR INDUSTRY", "INDUSTRY OVERVIEW"],
    "FINANCIAL INFORMATION": ["FINANCIAL INFORMATION", "FINANCIAL STATEMENTS", "SUMMARY OF FINANCIAL", "FINANCIAL INDEBTEDNESS"],
    "OBJECTS OF THE ISSUE": ["OBJECTS OF THE ISSUE", "OBJECTS OF THE OFFER", "REQUIREMENTS OF THE FUNDS"]
}

class DocumentProcessor:
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.doc = None

    def open(self):
        self.doc = pymupdf.open(self.pdf_path)
        return self

    def close(self):
        if self.doc:
            self.doc.close()

    def _clean_text(self, text: str) -> str:
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def _detect_section(self, text: str) -> Optional[str]:
        cleaned_text = text.upper()
        for section, keywords in SECTION_KEYWORDS.items():
            for kw in keywords:
                if kw in cleaned_text:
                    return section
        return None

    def get_parsed_pages(self, max_pages: int = None) -> List[Dict]:
        """
        Parses pages, detects sections, and yields structured page data.
        """
        if not self.doc:
            self.open()

        parsed_data = []
        current_section = "GENERAL"
        start_page = 15 if len(self.doc) > 30 else 0
        limit = min(len(self.doc), start_page + max_pages) if max_pages else len(self.doc)

        for page_num in range(start_page, limit):
            page = self.doc[page_num]
            text = page.get_text("text") or ""
            
            top_text = text[:300]
            detected = self._detect_section(top_text)
            
            if detected:
                current_section = detected

            cleaned_text = self._clean_text(text)
            
            if not cleaned_text or len(cleaned_text) < 50:
                continue

            parsed_data.append({
                "page_number": page_num + 1,
                "section": current_section,
                "text": cleaned_text
            })

        return parsed_data

    def get_filtered_context(self) -> str:
        """
        Filters out redundant pages and keeps only 'finance', 'summary', 
        or other critical keyword pages, to save token limits.
        Extracts up to ~50-100 pages of highly dense context.
        """
        parsed_pages = self.get_parsed_pages()
        filtered_text = []
        pages_kept = 0
        
        keywords = ["financial", "summary", "revenue", "profit", "issue", "risk", "business", "promoter"]
        
        for page in parsed_pages:
            lower_text = page["text"].lower()
            # Always keep pages explicitly labeled by our section detector
            if page["section"] != "GENERAL" or any(kw in lower_text for kw in keywords):
                filtered_text.append(f"--- SECTION: {page['section']} (PAGE {page['page_number']}) ---\n{page['text']}")
                pages_kept += 1
                
            if pages_kept >= 100:  # Hard limit to avoid file size limits
                break
                
        return "\n\n".join(filtered_text)

    def extract_financial_tables(self) -> list:
        tables_data = []
        try:
            with pdfplumber.open(self.pdf_path) as pdf:
                start = max(0, len(pdf.pages) // 10)
                end = min(len(pdf.pages), start + 80)
                
                for i in range(start, end):
                    page = pdf.pages[i]
                    tables = page.extract_tables()
                    for t in tables:
                        t_clean = [[str(cell).strip().replace('\n', ' ') if cell else "" for cell in row] for row in t]
                        flat = " ".join([" ".join(row).lower() for row in t_clean])
                        if any(kw in flat for kw in ["revenue", "profit", "assets", "ebitda", "equity", "liability"]):
                            tables_data.append(t_clean)
        except Exception as e:
            print(f"pdfplumber table extraction failed: {e}")
            
        return tables_data
