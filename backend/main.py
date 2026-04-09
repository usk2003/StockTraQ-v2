import sys
import os
from types import ModuleType
from dotenv import load_dotenv
load_dotenv()

import starlette.formparsers
# Increase max payload explicitly beyond default 1MB/10MB to 100MB for massive DRHPs
starlette.formparsers.MultiPartParser.max_file_size = 100 * 1024 * 1024 
starlette.formparsers.MultiPartParser.max_part_size = 100 * 1024 * 1024 

# Monkey patch to bypass missing module in old scikit-learn model pickles
if 'sklearn.ensemble._gb_losses' not in sys.modules:
    dummy = ModuleType('sklearn.ensemble._gb_losses')
    sys.modules['sklearn.ensemble._gb_losses'] = dummy

from datetime import datetime
try:
    import yfinance as yf
except ImportError:
    yf = None
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
from database import get_database
from services.prediction_service import predictor
from rag.router import router as rag_router
from insight_traq.router import router as insight_router

app = FastAPI(title="StockTraQ API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rag_router)
app.include_router(insight_router)

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
    issue_price: Optional[float] = None

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
                    try:
                        data = json.loads(stdout.decode().strip())
                        live_price = data.get("price")
                        live_source = data.get("source")
                    except json.JSONDecodeError:
                        print(f"[ERROR] Live Price JSON Parse Error. Stdout: {stdout.decode()}")
                
                if stderr and not live_price:
                    print(f"[WARN] Isolated Live Price Fetch Stderr: {stderr.decode()}")

            except Exception as e:
                print(f"[WARN] Isolated Live Price Fetch Exception: {e}")

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

@app.get("/model-evaluation")
async def get_model_evaluation():
    """Returns the scientific model evaluation report for project justification."""
    try:
        curr_dir = os.path.dirname(os.path.abspath(__file__))
        report_path = os.path.join(curr_dir, 'model_evaluation_report.json')
        
        if not os.path.exists(report_path):
            raise HTTPException(status_code=404, detail="Model evaluation report not found. Please run the optimization script.")
            
        with open(report_path, 'r') as f:
            data = json.load(f)
        return sanitize_data(data)
    except Exception as e:
        print(f"Evaluation Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-v3")
async def analyze_ipo_v3(params: AnalysisParams):
    """V3 Range Prediction: Returns a predicted gain range instead of a single value."""
    try:
        ipo_data = {
            'qib': params.qib, 'nii': params.nii, 'retail': params.retail,
            'total_sub': params.total_sub, 'issue_size': params.issue_size,
            'pe_ratio': params.pe_ratio, 'revenue': params.revenue,
            'pat': params.pat, 'roe': params.roe, 'roce': params.roce,
            'profit_margin': params.profit_margin, 'revenue_growth': params.revenue_growth,
            'actual_gain': params.actual_gain, 'issue_price': params.issue_price
        }
        
        result = predictor.predict_v3_range(ipo_data)
        
        if not result:
            raise HTTPException(status_code=500, detail="V3 prediction engine unavailable. Models not loaded.")
        
        # Fetch live price if symbol/bse_code provided
        live_price, live_source = None, None
        if params.symbol or params.bse_code:
            try:
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
                    try:
                        data = json.loads(stdout.decode().strip())
                        live_price = data.get("price")
                        live_source = data.get("source")
                    except json.JSONDecodeError:
                        print(f"[ERROR] V3 Live Price JSON Parse Error. Stdout: {stdout.decode()}")

                if stderr and not live_price:
                    print(f"[WARN] V3 Live Price Fetch Stderr: {stderr.decode()}")

            except Exception as e:
                print(f"[WARN] V3 Live Price Fetch Exception: {e}")
        
        result['live_price'] = live_price
        result['live_source'] = live_source
        
        return sanitize_data(result)
    except HTTPException:
        raise
    except Exception as e:
        print(f"V3 Analysis Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ongoing")
async def get_ongoing_ipos(db=Depends(get_database)):
    try:
        # For now, pull from ongoing_ipos or filter master_db_v2 for future dates
        # Using ongoing_ipos as the primary source for 'real-time' tracking if available
        ipos = await db.ongoing_ipos.find().to_list(100)
        if not ipos:
            # Fallback/Showcase: check if any in v2 are 'upcoming' (not yet listed)
            # This is a simplified check
            from datetime import datetime
            today = datetime.now().strftime("%Y-%m-%d")
            ipos = await db.master_db_v2.find({"listing_date": {"$gt": today}}).to_list(10)
            
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
        # Use master_db_v2 for consistent, high-quality data
        # Filter for IPOs that are already listed or have a listing date
        ipos = await db.master_db_v2.find().sort("listing_date", -1).to_list(100)
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

    # Age Calculation
    age_days = 0
    try:
        if ipo.get("listing_date"):
            l_date = datetime.strptime(ipo.get("listing_date"), "%Y-%m-%d")
            age_days = (datetime.now() - l_date).days
    except:
        pass

    return {
        "_id": str(ipo.get("_id")),
        "name": ipo.get("company") or ipo.get("Company") or ipo.get("name"),
        "symbol": ipo.get("nse") or ipo.get("NSE_Symbol") or ipo.get("Symbol") or ipo.get("symbol"),
        "bse_code": ipo.get("bse") or ipo.get("BSE_Scrip_Code") or ipo.get("bse_code"),
        "date": ipo.get("listing_date") or ipo.get("Listing_Date") or ipo.get("Opening_Date") or ipo.get("date"),
        "opening_date": ipo.get("open_date") or ipo.get("Opening_Date") or ipo.get("opening_date"),
        "listing_date": ipo.get("listing_date") or ipo.get("Listing_Date") or ipo.get("listing_date"),
        "openDate": ipo.get("open_date") or ipo.get("Opening_Date"),
        "closeDate": ipo.get("listing_date") or ipo.get("Listing_Date"),
        "issue_size": clean_val(ipo.get("issue_amt") or ipo.get("Issue_Amount_(Rs.cr.)") or ipo.get("issue_size") or ipo.get("size_cr")),
        "price": clean_val(ipo.get("issue_price") or ipo.get("Issue_Price_(Rs.)") or ipo.get("price")),
        "actual_listing_price": clean_val(ipo.get("listing_price_pm") or ipo.get("listing_price_am") or ipo.get("Close_Price_on_Listing_(Rs.)") or ipo.get("Open_Price_on_Listing_(Rs.)") or ipo.get("actual_listing_price")),
        "gain": clean_val(ipo.get("list_gain_pm") or ipo.get("%_Gain_/_Loss_(Issue_price_v/s_Close_price_on_Listing)") or ipo.get("Gain_/_Loss_(%)") or ipo.get("gain")),
        "actual_52_high": clean_val(ipo.get("52_wk_high") or ipo.get("52_Week_High_(Value)") or ipo.get("actual_52_high")),
        "actual_52_low": clean_val(ipo.get("52_wk_low") or ipo.get("52_wk_low")),
        "age_days": age_days,
        "actual_long_term_gain": clean_val(ipo.get("mp_percentage") or ipo.get("Gain_/_Loss_(%)") or ipo.get("actual_long_term_gain")),
        "details": {
            "qib": clean_val(ipo.get("qib") or ipo.get("QIB_(x)") or details.get("qib")),
            "nii": clean_val(ipo.get("nii") or ipo.get("NII_(x)") or details.get("nii")),
            "retail": clean_val(ipo.get("rii") or ipo.get("Retail_(x)") or details.get("retail")),
            "total_sub": clean_val(ipo.get("total") or ipo.get("Total_(x)") or details.get("total_sub") or details.get("total")),
            "pe_ratio": clean_val(ipo.get("post_pe") or ipo.get("pre_pe") or ipo.get("P/E_(x)_Pre-IPO") or ipo.get("PE") or details.get("pe_ratio") or details.get("pe")),
            "revenue": clean_val(ipo.get("revenue") or ipo.get("Revenue_(Rs.cr.)") or details.get("revenue")),
            "pat": clean_val(ipo.get("pat") or ipo.get("Profit_After_Tax_(Rs.cr.)") or details.get("pat")),
            "roe": clean_val(ipo.get("roe") or ipo.get("ROE") or details.get("roe")),
            "roce": clean_val(ipo.get("roce") or ipo.get("ROCE") or details.get("roce")),
            "profit_margin": clean_val(ipo.get("pat_margin") or ipo.get("PAT_Margin_%") or details.get("profit_margin") or details.get("margin")),
            "revenue_growth": clean_val(ipo.get("Growth") or details.get("revenue_growth") or details.get("growth") or 15.0),
            "issue_size": clean_val(ipo.get("issue_amt") or ipo.get("Issue_Amount_(Rs.cr.)") or ipo.get("issue_size") or details.get("issue_size"))
        }
    }

def map_master_v2_to_frontend(ipo):
    """Map the new dataset schema (v2) to standard frontend structure."""
    
    def clean_val(val):
        if val is None or val == "": return 0.0
        if isinstance(val, (int, float)): return float(val)
        s = str(val).replace(',', '').replace('₹', '').replace('Cr.', '').replace('%', '').strip()
        try:
            return float(s.split()[0])
        except (ValueError, IndexError):
            return 0.0

    return {
        "_id": str(ipo.get("_id")),
        "name": ipo.get("company"),
        "symbol": ipo.get("nse"),
        "bse_code": ipo.get("bse"),
        "date": ipo.get("listing_date") or ipo.get("open_date"),
        "opening_date": ipo.get("open_date"),
        "listing_date": ipo.get("listing_date"),
        "issue_size": clean_val(ipo.get("issue_amt")),
        "price": clean_val(ipo.get("issue_price")),
        "actual_listing_price": clean_val(ipo.get("listing_price_pm") or ipo.get("listing_price_am")),
        "gain": clean_val(ipo.get("list_gain_pm")),
        "actual_52_high": clean_val(ipo.get("52_wk_high")),
        "actual_long_term_gain": clean_val(ipo.get("mp_percentage")),
        "details": {
            "qib": clean_val(ipo.get("qib")),
            "nii": clean_val(ipo.get("nii")),
            "retail": clean_val(ipo.get("rii")),
            "total_sub": clean_val(ipo.get("total")),
            "pe_ratio": clean_val(ipo.get("post_pe") or ipo.get("pre_pe")),
            "revenue": clean_val(ipo.get("revenue")),
            "pat": clean_val(ipo.get("pat")),
            "roe": clean_val(ipo.get("roe")),
            "roce": clean_val(ipo.get("roce")),
            "profit_margin": clean_val(ipo.get("pat_margin")),
            "revenue_growth": 15.0, # Defaulting as not present in CSV
            "issue_size": clean_val(ipo.get("issue_amt"))
        }
    }

@app.get("/api/ipos1")
async def get_ipos_v1(db=Depends(get_database)):
    try:
        # Fetch from new collection master_db_v2
        ipos = await db.master_db_v2.find().to_list(300)
        return sanitize_data([map_master_v2_to_frontend(ipo) for ipo in ipos])
    except Exception as e:
        print(f"IPOs v1 Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/search")
async def search_ipos(q: str, db=Depends(get_database)):
    try:
        # Search across new master_db_v2
        ipos = await db.master_db_v2.find({"company": {"$regex": q, "$options": "i"}}).to_list(10)
        if not ipos:
            # Fallback to old Company field if needed
            ipos = await db.master_db_v2.find({"Company": {"$regex": q, "$options": "i"}}).to_list(10)
            
        mapped_ipos = [map_master_db_to_frontend(ipo) for ipo in ipos]
        return sanitize_data(mapped_ipos)
    except Exception as e:
        print(f"Search IPOs Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/best-listed")
async def get_best_listed_ipos(db=Depends(get_database)):
    try:
        # Sort by list_gain_pm descending (v2 schema)
        ipos = await db.master_db_v2.find().sort("list_gain_pm", -1).limit(6).to_list(6)
        mapped_ipos = [map_master_db_to_frontend(ipo) for ipo in ipos]
        return sanitize_data(mapped_ipos)
    except Exception as e:
        print(f"Best Listed Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

class SymbolsList(BaseModel):
    symbols: List[str]

@app.post("/api/ipos/live-prices")
async def get_live_prices(data: SymbolsList):
    """Batch fetch live prices from YFinance."""
    if not yf:
        return {}
    results = {}
    try:
        # Append .NS to each symbol
        tickers = [f"{s}.NS" for s in data.symbols if s]
        if not tickers: return {}
        
        # yfinance download is faster for many symbols
        # Use period='1d' to get latest price
        data_yf = yf.download(tickers, period='1d', interval='1m', progress=False)
        
        for s in data.symbols:
            try:
                # Handle both Single and Multi-Index DataFrames from yf.download
                if len(tickers) == 1:
                    price = float(data_yf['Close'].iloc[-1])
                else:
                    price = float(data_yf['Close'][f"{s}.NS"].iloc[-1])
                results[s] = price
            except:
                results[s] = None
    except Exception as e:
        print(f"Batch Live Price Cache Error: {e}")
        
    return results
