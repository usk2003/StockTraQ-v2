import os
import json
import re
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from .schema import InsightResponse, CompanyInfo, IPODetails, ValuationMetrics, Financials, MarketData, IssueAnalysis, QualitativeInsights
from .document_processor import DocumentProcessor

class HybridExtractor:
    def __init__(self, pdf_path: str):
        self.doc_processor = DocumentProcessor(pdf_path)
        
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("Google GenAI API Key is missing in .env")

        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash-latest", 
            google_api_key=api_key,
            temperature=0.0,
            max_output_tokens=2048,
        )

    def extract_with_retry(self, schema_cls, text_chunk: str, table_str: str, prompt_concept: str):
        structured_llm = self.llm.with_structured_output(schema_cls)
        
        template = """
        You are an expert financial analyst analyzing a DRHP/RHP (Red Herring Prospectus) document.
        Extract the required {concept} details accurately based ONLY on the provided text and tables.
        
        RULES:
        1. If a value is missing, strictly output "Not Available".
        2. Normalize all monetary values to "INR Crores".
        3. Do NOT hallucinate or guess.
        
        --- RELEVANT IPO TEXT ---
        {text}
        
        --- FINANCIAL TABLES ---
        {tables}
        """
        
        prompt = PromptTemplate.from_template(template)
        chain = prompt | structured_llm
        
        try:
            return chain.invoke({"concept": prompt_concept, "text": text_chunk, "tables": table_str})
        except Exception as e:
            print(f"Extraction failed for {prompt_concept}: {e}")
            # Fallback
            return schema_cls()

    def extract_all(self) -> InsightResponse:
        """
        Iteratively extracts components to bypass token limits.
        """
        # 1. Get filtered text mapping from DocumentProcessor
        filtered_text = self.doc_processor.get_filtered_context()
        
        # 2. Extract tables
        tables = self.doc_processor.extract_financial_tables()
        table_str = ""
        for t in tables:
            for row in t:
                table_str += " | ".join(row) + "\n"
            table_str += "\n---\n"
            
        # We split the extraction into logical parts to avoid overwhelming the schema
        
        # Part 1: Company & IPO Details
        company_info = self.extract_with_retry(CompanyInfo, filtered_text, "", "Company Information")
        ipo_details = self.extract_with_retry(IPODetails, filtered_text, "", "IPO specifics and dates")
        
        # Part 2: Financials & Valuations (Give it access to tables heavily)
        financials = self.extract_with_retry(Financials, filtered_text, table_str, "Financial statements and margins")
        valuations = self.extract_with_retry(ValuationMetrics, filtered_text, table_str, "Valuation multiples and EPS")
        
        # Part 3: Qualitative & Market (Optional)
        issue_analysis = self.extract_with_retry(IssueAnalysis, filtered_text, "", "Risks, Strengths, Objects of the offer")
        qualitative = self.extract_with_retry(QualitativeInsights, filtered_text, "", "Industry overview")
        market_data = self.extract_with_retry(MarketData, filtered_text, "", "Market Data")

        result = InsightResponse(
            company_info=company_info,
            ipo_details=ipo_details,
            valuation_metrics=valuations,
            financials=financials,
            market_data=market_data,
            issue_analysis=issue_analysis,
            qualitative_insights=qualitative
        )
        return result
