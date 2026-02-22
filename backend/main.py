from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
from database import get_database
from services.prediction_service import predictor

app = FastAPI(title="StockTraQ API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisParams(BaseModel):
    qib: float
    nii: float
    retail: float
    total_sub: float
    issue_size: float
    pe_ratio: float
    revenue: float
    pat: float
    roe: float
    roce: float
    profit_margin: float
    revenue_growth: float

import math

def sanitize_data(data):
    if isinstance(data, list):
        return [sanitize_data(item) for item in data]
    if isinstance(data, dict):
        return {k: sanitize_data(v) for k, v in data.items()}
    if isinstance(data, float) and (math.isnan(data) or math.isinf(data)):
        return None
    return data

@app.get("/")
async def root():
    return {"message": "Welcome to StockTraQ API - Active"}

@app.post("/analyze")
async def analyze_ipo(params: AnalysisParams):
    try:
        listing_gain, listing_rating = predictor.predict_listing_gain(
            params.qib, params.nii, params.retail, params.total_sub, params.issue_size
        )
        
        gain_tag, gain_color = predictor.tag_gain(listing_gain)
        demand_tier, demand_color = predictor.classify_demand(params.total_sub)
        
        longterm_gain = predictor.predict_longterm_gain(
            params.qib, params.total_sub, params.issue_size, listing_gain
        )
        
        pe_score = predictor.predict_pe_impact(
            params.pe_ratio, params.revenue, params.profit_margin, params.roe
        )
        
        financial_rating = predictor.predict_financial_rating(
            params.revenue, params.pat, params.roe, params.roce, params.profit_margin
        )
        
        unified_rating = predictor.calculate_unified_rating(
            listing_rating, params.total_sub, longterm_gain, pe_score, financial_rating
        )
        
        rating_label, rating_color = predictor.get_rating_label(unified_rating)
        recommendation = predictor.get_recommendation(
            unified_rating, listing_gain, longterm_gain, financial_rating
        )
        
        return sanitize_data({
            "listing_gain": listing_gain,
            "gain_tag": gain_tag,
            "gain_color": gain_color,
            "demand_tier": demand_tier,
            "demand_color": demand_color,
            "longterm_gain": longterm_gain,
            "pe_score": pe_score,
            "financial_rating": financial_rating,
            "unified_rating": unified_rating,
            "rating_label": rating_label,
            "rating_color": rating_color,
            "recommendation": recommendation
        })
    except Exception as e:
        print(f"Analysis Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ongoing")
async def get_ongoing_ipos(db=Depends(get_database)):
    try:
        ipos = await db.ongoing_ipos.find().to_list(100)
        for ipo in ipos:
            ipo["_id"] = str(ipo["_id"])
        return sanitize_data(ipos)
    except Exception as e:
        print(f"Ongoing IPOs Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/closed")
async def get_closed_ipos(db=Depends(get_database)):
    try:
        ipos = await db.closed_ipos.find().to_list(100)
        for ipo in ipos:
            ipo["_id"] = str(ipo["_id"])
        return sanitize_data(ipos)
    except Exception as e:
        print(f"Closed IPOs Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def map_master_db_to_frontend(ipo):
    """Map flat CSV fields to nested frontend structure based on master_db_sample.json."""
    return {
        "_id": str(ipo.get("_id")),
        "name": ipo.get("Company"),
        "symbol": ipo.get("NSE_Symbol") or ipo.get("Symbol"),
        "date": ipo.get("Listing_Date") or ipo.get("Opening_Date"),
        "listing_date": ipo.get("Listing_Date"),
        "issue_size": ipo.get("Issue_Amount_(Rs.cr.)"),
        "price": ipo.get("Issue_Price_(Rs.)"),
        "gain": ipo.get("%_Gain_/_Loss_(Issue_price_v/s_Close_price_on_Listing)") or ipo.get("Gain_/_Loss_(%)"),
        "details": {
            "qib": ipo.get("QIB_(x)"),
            "nii": ipo.get("NII_(x)"),
            "retail": ipo.get("Retail_(x)"),
            "total": ipo.get("Total_(x)"),
            "pe": ipo.get("P/E_(x)_Pre-IPO") or ipo.get("PE"),
            "revenue": ipo.get("Revenue_(Rs.cr.)") or ipo.get("Revenue"),
            "pat": ipo.get("Profit_After_Tax_(Rs.cr.)") or ipo.get("PAT"),
            "roe": ipo.get("ROE"),
            "roce": ipo.get("ROCE"),
            "margin": ipo.get("PAT_Margin_%") or ipo.get("Margin"),
            "growth": ipo.get("Growth") or 15.0,
            "issue_size": ipo.get("Issue_Amount_(Rs.cr.)")
        }
    }

@app.get("/search")
async def search_ipos(q: str, db=Depends(get_database)):
    try:
        ipos = await db.master_db.find({"Company": {"$regex": q, "$options": "i"}}).to_list(10)
        mapped_ipos = [map_master_db_to_frontend(ipo) for ipo in ipos]
        return sanitize_data(mapped_ipos)
    except Exception as e:
        print(f"Search IPOs Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/best-listed")
async def get_best_listed_ipos(db=Depends(get_database)):
    try:
        # Sort by Actual_Listing_Gain_(%) descending
        ipos = await db.master_db.find().sort("Actual_Listing_Gain_(%)", -1).limit(6).to_list(6)
        mapped_ipos = [map_master_db_to_frontend(ipo) for ipo in ipos]
        return sanitize_data(mapped_ipos)
    except Exception as e:
        print(f"Best Listed Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
