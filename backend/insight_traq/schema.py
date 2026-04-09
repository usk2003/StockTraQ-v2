from pydantic import BaseModel, Field
from typing import List, Optional

class CompanyInfo(BaseModel):
    company_name: str = "Not Available"
    sector: str = "Not Available"
    industry: str = "Not Available"
    business_model: str = "Not Available"
    promoters: str = "Not Available"
    listing_at: str = "Not Available"
    bse_code: str = "Not Available"
    nse_code: str = "Not Available"

class IPODetails(BaseModel):
    ipo_type: str = "Not Available"
    open_date: str = "Not Available"
    close_date: str = "Not Available"
    listing_date: str = "Not Available"
    issue_size: str = "Not Available"
    fresh_issue: str = "Not Available"
    ofs: str = "Not Available"
    price_band: str = "Not Available"
    face_value: str = "Not Available"
    lot_size: str = "Not Available"

class ValuationMetrics(BaseModel):
    pre_pe: str = "Not Available"
    post_pe: str = "Not Available"
    eps_pre: str = "Not Available"
    eps_post: str = "Not Available"
    pb_value: str = "Not Available"
    market_cap: str = "Not Available"

class Financials(BaseModel):
    revenue: str = "Not Available"
    assets: str = "Not Available"
    net_worth: str = "Not Available"
    reserves: str = "Not Available"
    borrowings: str = "Not Available"
    ebitda: str = "Not Available"
    pat: str = "Not Available"
    pat_margin: str = "Not Available"
    roe: str = "Not Available"
    roce: str = "Not Available"
    ronw: str = "Not Available"
    cash_flow: str = "Not Available"
    debt_to_equity: str = "Not Available"

class MarketData(BaseModel):
    listing_price_am: str = "Not Available"
    listing_price_pm: str = "Not Available"
    listing_gain_pm: str = "Not Available"
    current_market_price: str = "Not Available"
    fifty_two_week_high: str = Field(default="Not Available", alias="52_week_high")
    fifty_two_week_low: str = Field(default="Not Available", alias="52_week_low")

class IssueAnalysis(BaseModel):
    use_of_funds: str = "Not Available"
    strengths: List[str] = []
    risks: List[str] = []
    red_flags: List[str] = []

class QualitativeInsights(BaseModel):
    industry_outlook: str = "Not Available"
    competitive_position: str = "Not Available"
    growth_strategy: str = "Not Available"

class InsightResponse(BaseModel):
    company_info: CompanyInfo = Field(default_factory=CompanyInfo)
    ipo_details: IPODetails = Field(default_factory=IPODetails)
    valuation_metrics: ValuationMetrics = Field(default_factory=ValuationMetrics)
    financials: Financials = Field(default_factory=Financials)
    market_data: MarketData = Field(default_factory=MarketData)
    issue_analysis: IssueAnalysis = Field(default_factory=IssueAnalysis)
    qualitative_insights: QualitativeInsights = Field(default_factory=QualitativeInsights)

    class Config:
        populate_by_name = True
