from .schema import InsightResponse

class ValidationLayer:
    """
    Validates extracting constraints on structured data to flag red flags natively,
    or detect inconsistencies cross-referenced against multiple extracted sections.
    """
    
    @staticmethod
    def validate_and_flag(data: InsightResponse) -> InsightResponse:
        red_flags_appended = list(data.issue_analysis.red_flags)
        
        # 1. Check for negative cash flow or excessive borrowings natively
        net_worth = data.financials.net_worth.lower()
        borrowings = data.financials.borrowings.lower()
        
        # Primitive extraction for Cr/INR
        def extract_digits(val_str: str) -> float:
            try:
                numeric_str = "".join([c for c in val_str if c.isdigit() or c == "." or c == "-"])
                return float(numeric_str) if numeric_str else 0.0
            except:
                return 0.0
            
        b_val = extract_digits(borrowings)
        nw_val = extract_digits(net_worth)
        
        # Red Flag: High debt scenarios (Borrowings > Net Worth)
        if b_val > 0 and nw_val > 0 and b_val > (nw_val * 1.5):
            flag_str = f"High Debt Alert: Borrowings ({borrowings}) exceed 1.5x Net Worth ({net_worth})."
            if not any("debt" in rf.lower() or "borrowing" in rf.lower() for rf in red_flags_appended):
                red_flags_appended.append(flag_str)
        
        # Red Flag: OFS dominating
        try:
            ofs_str = data.ipo_details.ofs.lower()
            issue_str = data.ipo_details.issue_size.lower()
            
            ofs_val = extract_digits(ofs_str)
            iss_val = extract_digits(issue_str)
            
            if iss_val > 0 and ofs_val > (iss_val * 0.75):
                ofs_flag = f"Massive OFS Component: OFS represents >75% of the total issue size."
                if not any("ofs" in rf.lower() for rf in red_flags_appended):
                    red_flags_appended.append(ofs_flag)
        except Exception:
            pass
            
        data.issue_analysis.red_flags = red_flags_appended
        return data
