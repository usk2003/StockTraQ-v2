import joblib
import pandas as pd
import numpy as np
import os
from typing import Tuple, List, Optional

class PredictionService:
    def __init__(self, models_path: str):
        self.models_path = models_path
        self.model1 = None
        self.model3 = None
        self.model4 = None
        self.model5 = None
        self.metadata = None
        self.engine_v2 = None
        self.load_models()

    def load_models(self):
        try:
            self.model1 = joblib.load(os.path.join(self.models_path, 'model1_listing_gain.pkl'))
            self.model3 = joblib.load(os.path.join(self.models_path, 'model3_longterm_gain.pkl'))
            self.model4 = joblib.load(os.path.join(self.models_path, 'model4_pe_valuation.pkl'))
            self.model5 = joblib.load(os.path.join(self.models_path, 'model5_financial_rating.pkl'))
            self.metadata = joblib.load(os.path.join(self.models_path, 'metadata.pkl'))
            
            # Load v2 engine if exists (absolute project root)
            curr_dir = os.path.dirname(os.path.abspath(__file__))
            root_dir = os.path.abspath(os.path.join(curr_dir, '..', '..'))
            v2_path = os.path.join(root_dir, 'models_v2', 'engine_v2.pkl')
            
            if os.path.exists(v2_path):
                self.engine_v2 = joblib.load(v2_path)
                print(f"[OK] PredictionService: v2 Engine loaded from {v2_path}")
            else:
                # Try project root directly (if models_v2 is at same level as backend)
                v2_path_alt = os.path.join(root_dir, 'models_v2', 'engine_v2.pkl')
                print(f"[WARN] PredictionService: v2 Engine NOT FOUND at {v2_path}")
        except Exception as e:
            print(f"Error loading models: {e}")

    def get_pe_rating(self, pe: float) -> float:
        """Standardized PE Audit logic for both v2 and legacy."""
        if pe <= 0 or pd.isna(pe): return 1.0
        if pe < 15: return 9.5
        if pe < 30: return 8.5
        if pe < 50: return 6.0
        return 3.0

    def predict_listing_gain(self, qib, nii, retail, total_sub, issue_size) -> Tuple[float, int]:
        if self.model1 is None:
            return 0.0, 1
        
        features = pd.DataFrame([[qib, nii, retail, total_sub, issue_size]], 
                              columns=['QIB', 'NII', 'Retail', 'Total_Subscription', 'Issue_Size'])
        features_scaled = self.model1['scaler'].transform(features)
        
        p1 = self.model1['lr'].predict(features_scaled)
        p2 = self.model1['rf'].predict(features_scaled)
        p3 = self.model1['xgb'].predict(features_scaled)
        
        listing_gain = float((0.2 * p1 + 0.4 * p2 + 0.4 * p3)[0])
        
        if listing_gain < -10: rating = 1
        elif listing_gain < 0: rating = 3
        elif listing_gain < 10: rating = 5
        elif listing_gain < 30: rating = 7
        elif listing_gain < 60: rating = 9
        else: rating = 10
            
        return listing_gain, rating

    def tag_gain(self, gain: float) -> Tuple[str, str]:
        if gain < 0: return "🔴 Loss", "#ef4444"
        elif gain < 10: return "⚪ Flat", "#94a3b8"
        elif gain < 30: return "🟡 Mild Gain", "#f59e0b"
        elif gain < 60: return "🟢 Strong Gain", "#10b981"
        else: return "🔥 Blockbuster", "#8b5cf6"

    def classify_demand(self, subscription: float) -> Tuple[str, str]:
        if subscription >= 50: return "High", "#10b981"
        elif subscription >= 20: return "Medium", "#f59e0b"
        else: return "Low", "#ef4444"

    def predict_longterm_gain(self, qib, total_sub, issue_size, listing_gain) -> float:
        if self.model3 is None: return 0.0
        features = pd.DataFrame([[qib, total_sub, issue_size, listing_gain]], 
                              columns=['QIB', 'Total_Subscription', 'Issue_Size', 'Listing_Gain'])
        features_scaled = self.model3['scaler'].transform(features)
        p1 = self.model3['lr'].predict(features_scaled)
        p2 = self.model3['rf'].predict(features_scaled)
        p3 = self.model3['xgb'].predict(features_scaled)
        return float((0.2 * p1 + 0.4 * p2 + 0.4 * p3)[0])

    def predict_pe_impact(self, pe_ratio, revenue, profit_margin, roe) -> float:
        # Use standardized threshold-based audit for consistent UI feedback
        return self.get_pe_rating(pe_ratio)

    def predict_financial_rating(self, revenue, pat, roe, roce, profit_margin) -> float:
        if self.model5 is None: return 5.0
        features = pd.DataFrame([[revenue, pat, roe, roce, profit_margin]], 
                              columns=['Revenue', 'PAT', 'ROE', 'ROCE', 'Profit_Margin']).fillna(0)
        features_scaled = self.model5['scaler'].transform(features)
        p1 = self.model5['lr'].predict(features_scaled)
        p2 = self.model5['rf'].predict(features_scaled)
        p3 = self.model5['xgb'].predict(features_scaled)
        return float((0.2 * p1 + 0.4 * p2 + 0.4 * p3)[0])

    def calculate_unified_rating(self, listing_rating, total_sub, longterm_gain, pe_score, financial_rating) -> float:
        demand_score = min(10, total_sub / 10)
        longterm_score = min(10, max(1, (longterm_gain + 20) / 10))
        unified = (listing_rating * 0.25 + demand_score * 0.20 + longterm_score * 0.20 + pe_score * 0.15 + financial_rating * 0.20)
        return round(min(10, max(1, unified)), 1)

    def get_rating_label(self, rating: float):
        if rating < 4: return "❌ Avoid", "#ef4444" 
        elif rating < 6: return "⚠️ Risky", "#f59e0b" 
        elif rating < 8: return "✅ Subscribe", "#10b981"
        else: return "💎 Blockbuster", "#8b5cf6"

    def get_recommendation(self, rating, listing_gain, longterm_gain, financial_rating) -> str:
        rec = []
        if rating >= 8: rec.append("Strong buy recommendation based on holistic analysis.")
        elif rating >= 6: rec.append("Moderate buy opportunity with decent upside potential.")
        else: rec.append("Exercise caution. Risk metrics are elevated.")
        if listing_gain > 30: rec.append("High listing gain potential indicates strong market demand.")
        elif listing_gain < 0: rec.append("Listing gain outlook is weak.")
        if financial_rating > 8: rec.append("Company fundamentals are very strong.")
        elif financial_rating < 5: rec.append("Financial health requires careful scrutiny.")
        if longterm_gain > 50: rec.append("Excellent long-term growth prospects suggested by models.")
        return " ".join(rec)

    def map_actual_to_v2(self, actual_gain: float):
        """Map actual listing gain to v2 rating and sentiment for comparison"""
        # Logic matches train_v2.py thresholds
        if actual_gain < 0: 
            rating = 1.0
        elif actual_gain < 5: 
            rating = 2.5
        elif actual_gain < 10: 
            rating = 3.5
        elif actual_gain < 20: 
            rating = 4.5
        elif actual_gain < 30: 
            rating = 5.5
        elif actual_gain < 50: 
            rating = 6.5
        elif actual_gain < 75: 
            rating = 7.5
        elif actual_gain < 100: 
            rating = 8.5
        else: 
            rating = 9.5
            
        sentiment = self.get_sentiment_fallback(actual_gain)
        return rating, sentiment

    def get_gain_range_fallback(self, gain: float) -> str:
        if gain < 0: return "Negative"
        elif gain < 10: return "Flat (0-10%)"
        elif gain < 30: return "Mild (10-30%)"
        elif gain < 60: return "Strong (30-60%)"
        else: return "Blockbuster (>60%)"

    def get_sentiment_fallback(self, gain: float) -> str:
        if gain < 0: return "Negative"
        elif gain < 20: return "Mild"
        else: return "Positive"

    def predict_v2(self, ipo_data):
        """Multi-target v2 audit logic"""
        if not self.engine_v2:
            return None

        # Prepare features
        features = self.engine_v2['features']
        df_input = pd.DataFrame([{
            'QIB': ipo_data.get('qib', 0),
            'Total_Sub': ipo_data.get('total_sub', 0),
            'Issue_Size': ipo_data.get('issue_size', 0),
            'PE': ipo_data.get('pe_ratio', 0),
            'PAT_Margin': ipo_data.get('profit_margin', 0),
            'ROE': ipo_data.get('roe', 0),
            'Revenue': ipo_data.get('revenue', 0)
        }])
        
        X_scaled = self.engine_v2['scaler'].transform(df_input)
        
        # 1. Listing Gain (Actual %)
        listing_gain = float(self.engine_v2['model_gain'].predict(X_scaled)[0])
        
        # 2. Gain Rating (0-10)
        listing_rating = float(self.engine_v2['model_rating'].predict(X_scaled)[0])
        listing_rating = round(min(10, max(0, listing_rating)), 1)
        
        # 3. Gain Range
        range_idx = self.engine_v2['model_range'].predict(X_scaled)[0]
        listing_range = self.engine_v2['le_range'].inverse_transform([range_idx])[0]
        
        # 4. Sentiment
        sent_idx = self.engine_v2['model_sent'].predict(X_scaled)[0]
        listing_sentiment = self.engine_v2['le_sent'].inverse_transform([sent_idx])[0]
        
        # 5. Max Potential (52-Week High Outlook)
        potential_gain = float(self.engine_v2['model_potential'].predict(X_scaled)[0])
        
        # 6. Subscription Value (Demand X Size)
        sub_value_cr = ipo_data.get('total_sub', 0) * ipo_data.get('issue_size', 0)
        if sub_value_cr > 10000: sub_val_label, sub_val_color = "💎 Blockbuster Cashflow", "#8b5cf6"
        elif sub_value_cr > 5000: sub_val_label, sub_val_color = "🔥 Massive Interest", "#10b981"
        elif sub_value_cr > 1000: sub_val_label, sub_val_color = "✅ Healthy Liquidity", "#3b82f6"
        elif sub_value_cr > 0: sub_val_label, sub_val_color = "🟡 Moderate Interest", "#f59e0b"
        else: sub_val_label, sub_val_color = "❌ Low Market Interest", "#ef4444"

        # 7. PE Logic (Standardized Audit)
        pe_rating = self.get_pe_rating(ipo_data.get('pe_ratio', 0))
        
        # 7. Fundamental Rating
        roe = ipo_data.get('roe', 0)
        margin = ipo_data.get('profit_margin', 0)
        revenue = ipo_data.get('revenue', 0)
        
        roe_score = min(10, roe / 2)
        margin_score = min(10, margin / 2)
        rev_score = min(10, revenue / 500)
        
        fundamental_rating = round(roe_score * 0.4 + margin_score * 0.3 + rev_score * 0.3, 1)
        
        # 8. Unpack Range Bounds
        range_map = {
            "negative": (-25.0, 0.0),
            "flat (0-10%)": (0.0, 10.0),
            "mild (10-30%)": (10.0, 30.0),
            "strong (30-60%)": (30.0, 60.0),
            "blockbuster (>60%)": (60.0, 100.0)
        }
        # Case-insensitive lookup for robustness
        clean_range = str(listing_range).strip().lower()
        range_min, range_max = range_map.get(clean_range, (0.0, 0.0))

        # 9. Unified Score
        pot_score = min(10, max(1, (potential_gain + 20) / 10))
        unified_score = round(listing_rating * 0.3 + pe_rating * 0.2 + fundamental_rating * 0.2 + pot_score * 0.3, 1)
        
        return {
            'listing_gain': round(listing_gain, 2),
            'listing_rating': listing_rating,
            'listing_range': listing_range,
            'range_min': range_min,
            'range_max': range_max,
            'listing_sentiment': listing_sentiment,
            'potential_gain': round(potential_gain, 2),
            'pe_rating': pe_rating,
            'fundamental_rating': fundamental_rating,
            'unified_score': unified_score,
            'sub_value_cr': round(sub_value_cr, 2),
            'sub_val_label': sub_val_label,
            'sub_val_color': sub_val_color
        }

# Instance for use in routes
current_dir = os.path.dirname(os.path.abspath(__file__))
models_path = os.path.abspath(os.path.join(current_dir, "../../models"))
predictor = PredictionService(models_path=models_path)
