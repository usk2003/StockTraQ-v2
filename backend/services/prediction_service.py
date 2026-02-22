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
        self.load_models()

    def load_models(self):
        try:
            self.model1 = joblib.load(os.path.join(self.models_path, 'model1_listing_gain.pkl'))
            self.model3 = joblib.load(os.path.join(self.models_path, 'model3_longterm_gain.pkl'))
            self.model4 = joblib.load(os.path.join(self.models_path, 'model4_pe_valuation.pkl'))
            self.model5 = joblib.load(os.path.join(self.models_path, 'model5_financial_rating.pkl'))
            self.metadata = joblib.load(os.path.join(self.models_path, 'metadata.pkl'))
        except Exception as e:
            print(f"Error loading models: {e}")

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
        if self.model4 is None: return 5.0
        features = pd.DataFrame([[pe_ratio, revenue, profit_margin, roe]], 
                              columns=['PE_Pre', 'Revenue', 'Profit_Margin', 'ROE']).fillna(0)
        features_scaled = self.model4['scaler'].transform(features)
        p1 = self.model4['lr'].predict(features_scaled)
        p2 = self.model4['rf'].predict(features_scaled)
        p3 = self.model4['xgb'].predict(features_scaled)
        expected_gain = (0.2 * p1 + 0.4 * p2 + 0.4 * p3)[0]
        return float(min(10, max(1, (expected_gain + 20) / 10)))

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
        if rating < 4: return "❌ Avoid", "#ef4444" # Red
        elif rating < 7: return "⚠️ Neutral", "#f59e0b" # Yellow
        else: return "✅ Subscribe", "#10b981" # Green

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

# Instance for use in routes
predictor = PredictionService(models_path="../models")
