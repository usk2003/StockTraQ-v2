import joblib
import pandas as pd
import numpy as np
import os

def load_v2_engine():
    """Load the Version 2 prediction engine"""
    try:
        engine = joblib.load('models_v2/engine_v2.pkl')
        return engine
    except Exception as e:
        print(f"Error loading v2 engine: {e}")
        return None

def predict_v2(input_data, engine):
    """
    Comprehensive v2 prediction logic
    Correlates financials with listing gains and provides multi-target output.
    """
    if not engine:
        return None

    # Prepare input for ML
    features = engine['features']
    # Map raw input to feature names used in training
    # ['QIB', 'Total_Sub', 'Issue_Size', 'PE', 'PAT_Margin', 'ROE', 'Revenue']
    df_input = pd.DataFrame([{
        'QIB': input_data.get('qib', 0),
        'Total_Sub': input_data.get('total_sub', 0),
        'Issue_Size': input_data.get('issue_size', 0),
        'PE': input_data.get('pe_ratio', 0),
        'PAT_Margin': input_data.get('profit_margin', 0),
        'ROE': input_data.get('roe', 0),
        'Revenue': input_data.get('revenue', 0)
    }])
    
    X_scaled = engine['scaler'].transform(df_input)
    
    # 1. Listing Gain (Actual %)
    listing_gain = engine['model_gain'].predict(X_scaled)[0]
    
    # 2. Gain Rating (0-10)
    listing_rating = engine['model_rating'].predict(X_scaled)[0]
    listing_rating = round(min(10, max(0, listing_rating)), 1)
    
    # 3. Gain Range
    range_idx = engine['model_range'].predict(X_scaled)[0]
    listing_range = engine['le_range'].inverse_transform([range_idx])[0]
    
    # 4. Sentiment
    sent_idx = engine['model_sent'].predict(X_scaled)[0]
    listing_sentiment = engine['le_sent'].inverse_transform([sent_idx])[0]
    
    # 5. Max Potential (52-Week High Outlook)
    potential_gain = engine['model_potential'].predict(X_scaled)[0]
    
    # 6. New: Subscription Value (Demand X Issue Size)
    sub_value_cr = input_data.get('total_sub', 0) * input_data.get('issue_size', 0)
    if sub_value_cr > 10000: sub_val_label, sub_val_color = "💎 Blockbuster Cashflow", "#8b5cf6"
    elif sub_value_cr > 5000: sub_val_label, sub_val_color = "🔥 Massive Interest", "#10b981"
    elif sub_value_cr > 1000: sub_val_label, sub_val_color = "✅ Healthy Liquidity", "#3b82f6"
    elif sub_value_cr > 0: sub_val_label, sub_val_color = "🟡 Moderate Interest", "#f59e0b"
    else: sub_val_label, sub_val_color = "❌ Low Market Interest", "#ef4444"

    # 7. Custom PE Rating Logic (PE < 30 is good)
    pe = input_data.get('pe_ratio', 0)
    if pe == 0: pe_rating = 1.0 # Unknown/High PE
    elif pe < 15: pe_rating = 9.5
    elif pe < 30: pe_rating = 8.5
    elif pe < 50: pe_rating = 6.0
    else: pe_rating = 3.0
    
    # 8. Standard Fundamental Rating logic
    roe = input_data.get('roe', 0)
    margin = input_data.get('profit_margin', 0)
    revenue = input_data.get('revenue', 0)
    
    roe_score = min(10, roe / 2)
    margin_score = min(10, margin / 2)
    rev_score = min(10, revenue / 500)
    
    fundamental_rating = (roe_score * 0.4 + margin_score * 0.3 + rev_score * 0.3)
    fundamental_rating = round(min(10, max(1, fundamental_rating)), 1)
    
    # 9. Unified Rating v2 (weighted)
    pot_score = min(10, max(1, (potential_gain + 20) / 10))
    unified_score = (
        listing_rating * 0.3 +
        pe_rating * 0.2 +
        fundamental_rating * 0.2 +
        pot_score * 0.3
    )
    
    return {
        'listing_gain': round(listing_gain, 2),
        'listing_rating': listing_rating,
        'listing_range': listing_range,
        'listing_sentiment': listing_sentiment,
        'potential_gain': round(potential_gain, 2),
        'pe_rating': round(pe_rating, 1),
        'fundamental_rating': fundamental_rating,
        'unified_score': round(min(10, max(1, unified_score)), 1),
        'sub_value_cr': round(sub_value_cr, 2),
        'sub_val_label': sub_val_label,
        'sub_val_color': sub_val_color
    }

def get_v2_rating_label(rating):
    if rating < 4: return "❌ Avoid", "#ef4444"
    elif rating < 6: return "⚠️ Risky", "#f59e0b"
    elif rating < 8: return "✓ Decent", "#3b82f6"
    elif rating < 9.5: return "⭐ Strong", "#10b981"
    else: return "💎 Blockbuster", "#8b5cf6"
