import joblib
import pandas as pd
import numpy as np
import os

def load_models():
    """Load trained models from disk"""
    try:
        model1 = joblib.load('models/model1_listing_gain.pkl')
        model3 = joblib.load('models/model3_longterm_gain.pkl')
        model4 = joblib.load('models/model4_pe_valuation.pkl')
        model5 = joblib.load('models/model5_financial_rating.pkl')
        metadata = joblib.load('models/metadata.pkl')
        return model1, model3, model4, model5, metadata
    except Exception as e:
        print(f"Error loading models: {e}")
        return None, None, None, None, None

def predict_listing_gain(qib, nii, retail, total_sub, issue_size, model1):
    """Predict listing gain using Model 1"""
    if model1 is None:
        return 0.0, 1
    
    # Prepare input features
    features = pd.DataFrame([[qib, nii, retail, total_sub, issue_size]], 
                          columns=['QIB', 'NII', 'Retail', 'Total_Subscription', 'Issue_Size'])
    
    # Scale features
    features_scaled = model1['scaler'].transform(features)
    
    # Ensemble prediction
    p1 = model1['lr'].predict(features_scaled)
    p2 = model1['rf'].predict(features_scaled)
    p3 = model1['xgb'].predict(features_scaled)
    
    listing_gain = (0.2 * p1 + 0.4 * p2 + 0.4 * p3)[0]
    
    # Calculate rating based on gain
    if listing_gain < -10:
        rating = 1
    elif listing_gain < 0:
        rating = 3
    elif listing_gain < 10:
        rating = 5
    elif listing_gain < 30:
        rating = 7
    elif listing_gain < 60:
        rating = 9
    else:
        rating = 10
        
    return listing_gain, rating

def tag_gain(gain):
    """Tag listing gain performance"""
    if gain < 0:
        return "🔴 Loss", "#ef4444"
    elif gain < 10:
        return "⚪ Flat", "#94a3b8"
    elif gain < 30:
        return "🟡 Mild Gain", "#f59e0b"
    elif gain < 60:
        return "🟢 Strong Gain", "#10b981"
    else:
        return "🔥 Blockbuster", "#8b5cf6"

def classify_demand(subscription):
    """Classify demand based on subscription"""
    if subscription >= 50:
        return "High", "#10b981"
    elif subscription >= 20:
        return "Medium", "#f59e0b"
    else:
        return "Low", "#ef4444"

def predict_longterm_gain(qib, total_sub, issue_size, listing_gain, model3):
    """Predict long-term gain using Model 3"""
    if model3 is None:
        return 0.0
        
    features = pd.DataFrame([[qib, total_sub, issue_size, listing_gain]], 
                          columns=['QIB', 'Total_Subscription', 'Issue_Size', 'Listing_Gain'])
    
    features_scaled = model3['scaler'].transform(features)
    
    p1 = model3['lr'].predict(features_scaled)
    p2 = model3['rf'].predict(features_scaled)
    p3 = model3['xgb'].predict(features_scaled)
    
    return (0.2 * p1 + 0.4 * p2 + 0.4 * p3)[0]

def predict_pe_impact(pe_ratio, revenue, profit_margin, roe, model4):
    """Predict PE valuation impact score using Model 4"""
    if model4 is None:
        return 5.0
        
    features = pd.DataFrame([[pe_ratio, revenue, profit_margin, roe]], 
                          columns=['PE_Pre', 'Revenue', 'Profit_Margin', 'ROE'])
    
    # Handle NaN values by filling with 0
    features = features.fillna(0)
    
    features_scaled = model4['scaler'].transform(features)
    
    # Predict expected listing gain based on valuation
    p1 = model4['lr'].predict(features_scaled)
    p2 = model4['rf'].predict(features_scaled)
    p3 = model4['xgb'].predict(features_scaled)
    expected_gain = (0.2 * p1 + 0.4 * p2 + 0.4 * p3)[0]
    
    # Convert to 1-10 score
    # Higher expected gain = better valuation
    score = min(10, max(1, (expected_gain + 20) / 10))
    return score

def predict_financial_rating(revenue, pat, roe, roce, profit_margin, model5):
    """Predict financial strength rating using Model 5"""
    if model5 is None:
        return 5.0
        
    features = pd.DataFrame([[revenue, pat, roe, roce, profit_margin]], 
                          columns=['Revenue', 'PAT', 'ROE', 'ROCE', 'Profit_Margin'])
    
    # Handle NaN values by filling with 0
    features = features.fillna(0)
    
    features_scaled = model5['scaler'].transform(features)
    
    p1 = model5['lr'].predict(features_scaled)
    p2 = model5['rf'].predict(features_scaled)
    p3 = model5['xgb'].predict(features_scaled)
    
    return float((0.2 * p1 + 0.4 * p2 + 0.4 * p3)[0])

def calculate_unified_rating(listing_rating, total_sub, longterm_gain, pe_score, financial_rating):
    """Calculate unified 1-10 rating"""
    # Helper to coerce possible sequences or numpy scalars to Python float
    def _to_scalar(x):
        try:
            # Handle pandas Series / numpy arrays / lists by taking first element
            if hasattr(x, "__len__") and not isinstance(x, (str, bytes)):
                # convert to list-like and take first element if length == 1
                try:
                    if len(x) == 1:
                        x = list(x)[0]
                except Exception:
                    pass
            return float(x)
        except Exception:
            return 0.0

    # Coerce inputs to numeric scalars
    listing_rating = _to_scalar(listing_rating)
    total_sub = _to_scalar(total_sub)
    longterm_gain = _to_scalar(longterm_gain)
    pe_score = _to_scalar(pe_score)
    financial_rating = _to_scalar(financial_rating)

    # Normalize inputs to 0-10 scale
    demand_score = min(10, total_sub / 10)
    longterm_score = min(10, max(1, (longterm_gain + 20) / 10))

    # Weighted average
    # Listing: 25%, Demand: 20%, LongTerm: 20%, PE: 15%, Financial: 20%
    unified = (
        listing_rating * 0.25 +
        demand_score * 0.20 +
        longterm_score * 0.20 +
        pe_score * 0.15 +
        financial_rating * 0.20
    )

    return round(min(10, max(1, unified)), 1)

def get_rating_label(rating):
    """Get label for unified rating"""
    if rating < 4:
        return "❌ Avoid", "#ef4444"
    elif rating < 6:
        return "⚠️ Risky", "#f59e0b"
    elif rating < 8:
        return "✓ Decent", "#3b82f6"
    elif rating < 9.5:
        return "⭐ Strong", "#10b981"
    else:
        return "💎 Blockbuster", "#8b5cf6"

def get_recommendation(rating, listing_gain, longterm_gain, financial_rating):
    """Generate investment recommendation text"""
    rec = []
    
    if rating >= 8:
        rec.append("Strong buy recommendation based on holistic analysis.")
    elif rating >= 6:
        rec.append("Moderate buy opportunity with decent upside potential.")
    else:
        rec.append("Exercise caution. Risk metrics are elevated.")
        
    if listing_gain > 30:
        rec.append("High listing gain potential indicates strong market demand.")
    elif listing_gain < 0:
        rec.append("Listing gain outlook is weak.")
        
    if financial_rating > 8:
        rec.append("Company fundamentals are very strong.")
    elif financial_rating < 5:
        rec.append("Financial health requires careful scrutiny.")
        
    if longterm_gain > 50:
        rec.append("Excellent long-term growth prospects suggested by models.")
        
    return " ".join(rec)
