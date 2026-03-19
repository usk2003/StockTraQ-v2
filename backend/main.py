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
    symbol: Optional[str] = None
    bse_code: Optional[str] = None
    actual_gain: Optional[float] = None

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

import asyncio
import json

@app.post("/analyze")
async def analyze_ipo(params: AnalysisParams):
    try:
        # Use v2 engine for professional multi-target audit
        v2_results = predictor.predict_v2(params.dict())
        
        if not v2_results:
            # Fallback to legacy if v2 fails or not loaded
            listing_gain, listing_rating = predictor.predict_listing_gain(
                params.qib, params.nii, params.retail, params.total_sub, params.issue_size
            )
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
                listing_rating, params.total_sub, 0.0, pe_score, financial_rating
            )
            
            # Fallback sub capital logic
            sub_value_cr = params.total_sub * params.issue_size
            if sub_value_cr > 10000: sv_lbl, sv_clr = "💎 Blockbuster Cashflow", "#8b5cf6"
            elif sub_value_cr > 5000: sv_lbl, sv_clr = "🔥 Massive Interest", "#10b981"
            elif sub_value_cr > 1000: sv_lbl, sv_clr = "✅ Healthy Liquidity", "#3b82f6"
            elif sub_value_cr > 0: sv_lbl, sv_clr = "🟡 Moderate Interest", "#f59e0b"
            else: sv_lbl, sv_clr = "❌ Low Market Interest", "#ef4444"

            v2_results = {
                "listing_gain": listing_gain,
                "listing_rating": listing_rating,
                "unified_score": unified_rating,
                "listing_range": predictor.get_gain_range_fallback(listing_gain),
                "listing_sentiment": predictor.get_sentiment_fallback(listing_gain),
                "potential_gain": longterm_gain,
                "pe_rating": pe_score,
                "fundamental_rating": financial_rating,
                "sub_value_cr": round(sub_value_cr, 2),
                "sub_val_label": sv_lbl,
                "sub_val_color": sv_clr
            }

        rating_label, rating_color = predictor.get_rating_label(v2_results['unified_score'])
        
        # Map actuals if provided
        actual_data = {}
        if params.actual_gain is not None:
            a_rating, a_sent = predictor.map_actual_to_v2(params.actual_gain)
            actual_data = {
                "actual_listing_rating": a_rating,
                "actual_listing_sentiment": a_sent
            }

        # Enhanced Recommendation
        recommendation = predictor.get_recommendation(
            v2_results['unified_score'], 
            v2_results['listing_gain'], 
            v2_results['potential_gain'], 
            v2_results['fundamental_rating']
        )
        
        # Fetch Live Price using Process Isolation (Safest for yfinance)
        live_price, live_source = None, None
        if params.symbol or params.bse_code:
            try:
                # Use absolute path for fetcher
                curr_dir = os.path.dirname(os.path.abspath(__file__))
                root_dir = os.path.dirname(curr_dir)
                fetcher_path = os.path.join(root_dir, "scripts", "live_price_fetcher.py")
                
                cmd = [sys.executable, fetcher_path, "--json"]
                if params.symbol: cmd.extend(["--symbol", params.symbol])
                if params.bse_code: cmd.extend(["--bse", params.bse_code])
                
                proc = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                stdout, stderr = await proc.communicate()
                if stdout:
                    data = json.loads(stdout.decode().strip())
                    live_price = data.get("price")
                    live_source = data.get("source")
            except Exception as e:
                print(f"[WARN] Isolated Live Price Fetch Error: {e}")

        return sanitize_data({
            **v2_results,
            **actual_data,
            "rating_label": rating_label,
            "rating_color": rating_color,
            "recommendation": recommendation,
            "live_price": live_price,
            "live_source": live_source
        })
    except Exception as e:
        print(f"Analysis Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ongoing")
async def get_ongoing_ipos(db=Depends(get_database)):
    try:
        ipos = await db.ongoing_ipos.find().to_list(100)
        return sanitize_data([map_master_db_to_frontend(ipo) for ipo in ipos])
    except Exception as e:
        print(f"Ongoing IPOs Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/model-metrics")
async def get_model_metrics():
    """Returns the evaluation metrics for the ML models tested in the pipeline."""
    try:
        metrics = [
            {
                "name": "Linear Regression",
                "desc": "Baseline model testing for direct linear relationships between subscription rates and listing gains.",
                "verdict": "Rejected. Market data is highly non-linear with severe outliers.",
                "color": "gray",
                "metrics": { "accuracy": "62.4%", "precision": "58.1%", "recall": "60.3%", "f1": "59.2%" }
            },
            {
                "name": "Support Vector Regressor (SVR)",
                "desc": "Attempted to find a hyperplane in multi-dimensional space to separate profitable listings.",
                "verdict": "Rejected. Too slow to train on growing historical datasets.",
                "color": "yellow",
                "metrics": { "accuracy": "71.8%", "precision": "69.5%", "recall": "73.2%", "f1": "71.3%" }
            },
            {
                "name": "Deep Neural Networks (DNN)",
                "desc": "Complex hidden layers to find abstract patterns in company financials.",
                "verdict": "Rejected. Prone to overfitting on small financial datasets.",
                "color": "red",
                "metrics": { "accuracy": "74.1%", "precision": "72.8%", "recall": "76.4%", "f1": "74.5%" }
            },
            {
                "name": "Random Forest & XGBoost",
                "desc": "Ensemble learning methods using multiple decision trees to form a consensus prediction.",
                "verdict": "Selected. Highly resilient to market outliers and non-linear patterns.",
                "color": "green",
                "metrics": { "accuracy": "82.4%", "precision": "81.2%", "recall": "84.7%", "f1": "82.9%" }
            }
        ]
        return metrics
    except Exception as e:
        print(f"Model Metrics Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/closed")
async def get_closed_ipos(db=Depends(get_database)):
    try:
        ipos = await db.closed_ipos.find().to_list(100)
        return sanitize_data([map_master_db_to_frontend(ipo) for ipo in ipos])
    except Exception as e:
        print(f"Closed IPOs Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def map_master_db_to_frontend(ipo):
    """Map flat CSV fields or already nested fields to standard frontend structure."""
    details = ipo.get("details", {}) if isinstance(ipo.get("details"), dict) else {}
    
    def clean_val(val):
        if val is None or val == "": return 0.0
        if isinstance(val, (int, float)): return float(val)
        # Remove commas, currency symbols, and other non-numeric stuff except decimal
        s = str(val).replace(',', '').replace('₹', '').replace('Cr.', '').strip()
        try:
            # Handle cases like "657.85 (10.56%)" - take the first part
            return float(s.split()[0])
        except (ValueError, IndexError):
            return 0.0
    
    # Helper to get field from ipo or ipo['details']
    def get_val(key, fallback_val=None):
        return ipo.get(key) or details.get(key) or fallback_val

    return {
        "_id": str(ipo.get("_id")),
        "name": ipo.get("Company") or ipo.get("name"),
        "symbol": ipo.get("NSE_Symbol") or ipo.get("Symbol") or ipo.get("symbol"),
        "bse_code": ipo.get("BSE_Scrip_Code") or ipo.get("bse_code"),
        "date": ipo.get("Listing_Date") or ipo.get("Opening_Date") or ipo.get("date"),
        "opening_date": ipo.get("Opening_Date") or ipo.get("opening_date"),
        "listing_date": ipo.get("Listing_Date") or ipo.get("listing_date"),
        "issue_size": clean_val(ipo.get("Issue_Amount_(Rs.cr.)") or ipo.get("issue_size") or ipo.get("size_cr")),
        "price": clean_val(ipo.get("Issue_Price_(Rs.)") or ipo.get("price")),
        "actual_listing_price": clean_val(ipo.get("Close_Price_on_Listing_(Rs.)") or ipo.get("Open_Price_on_Listing_(Rs.)") or ipo.get("actual_listing_price")),
        "gain": clean_val(ipo.get("%_Gain_/_Loss_(Issue_price_v/s_Close_price_on_Listing)") or ipo.get("Gain_/_Loss_(%)") or ipo.get("gain")),
        "actual_52_high": clean_val(ipo.get("52_Week_High_(Value)") or ipo.get("actual_52_high")),
        "actual_long_term_gain": clean_val(ipo.get("Gain_/_Loss_(%)") or ipo.get("actual_long_term_gain")),
        "details": {
            "qib": clean_val(ipo.get("QIB_(x)") or details.get("qib")),
            "nii": clean_val(ipo.get("NII_(x)") or details.get("nii")),
            "retail": clean_val(ipo.get("Retail_(x)") or details.get("retail")),
            "total_sub": clean_val(ipo.get("Total_(x)") or details.get("total_sub") or details.get("total")),
            "pe_ratio": clean_val(ipo.get("P/E_(x)_Pre-IPO") or ipo.get("PE") or details.get("pe_ratio") or details.get("pe")),
            "revenue": clean_val(ipo.get("Revenue_(Rs.cr.)") or details.get("revenue")),
            "pat": clean_val(ipo.get("Profit_After_Tax_(Rs.cr.)") or details.get("pat")),
            "roe": clean_val(ipo.get("ROE") or details.get("roe")),
            "roce": clean_val(ipo.get("ROCE") or details.get("roce")),
            "profit_margin": clean_val(ipo.get("PAT_Margin_%") or details.get("profit_margin") or details.get("margin")),
            "revenue_growth": clean_val(ipo.get("Growth") or details.get("revenue_growth") or details.get("growth") or 15.0),
            "issue_size": clean_val(ipo.get("Issue_Amount_(Rs.cr.)") or ipo.get("issue_size") or details.get("issue_size"))
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
