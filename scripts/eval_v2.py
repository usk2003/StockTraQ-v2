import joblib
import pandas as pd
import numpy as np
import os
import re
from sklearn.metrics import accuracy_score

def clean_numeric(val):
    if pd.isna(val): return 0.0
    s = str(val).replace(',', '').replace('₹', '').replace('Cr.', '').strip()
    match = re.search(r"[-+]?\d*\.?\d+", s)
    return float(match.group()) if match else 0.0

def clean_percentage(val):
    if pd.isna(val): return 0.0
    s = str(val).replace('%', '').replace(',', '').strip()
    match = re.search(r"[-+]?\d*\.?\d+", s)
    return float(match.group()) if match else 0.0

def evaluate():
    try:
        base_path = os.path.dirname(os.path.abspath(__file__))
        v2_path = os.path.join(base_path, 'models_v2', 'engine_v2.pkl')
        csv_path = os.path.join(base_path, 'data', 'IPO_MasterDB.csv')
        
        if not os.path.exists(v2_path):
            print("Model not found")
            return

        engine = joblib.load(v2_path)
        df = pd.read_csv(csv_path)
        
        # Preprocessing as per train_v2.py
        df['QIB'] = df['QIB_(x)'].apply(clean_numeric)
        df['Total_Sub'] = df['Total_(x)'].apply(clean_numeric)
        df['Issue_Size'] = df['Issue_Amount_(Rs.cr.)'].apply(clean_numeric)
        df['PE'] = df['P/E_(x)_Pre-IPO'].apply(clean_numeric)
        df['Revenue'] = df['Revenue_(Rs.cr.)'].apply(clean_numeric)
        df['ROE'] = df['ROE'].apply(clean_percentage)
        df['PAT_Margin'] = df['PAT_Margin_%'].apply(clean_percentage)
        
        # Mapping Listings Gain to Sentiment
        df['Listing_Gain'] = df['%_Gain_/_Loss_(Issue_price_v/s_Close_price_on_Listing)'].apply(clean_percentage)
        
        def get_sentiment(gain):
            if gain < 0: return "Negative"
            elif gain < 20: return "Mild"
            else: return "Positive"
        
        df['Sentiment'] = df['Listing_Gain'].apply(get_sentiment)
        
        features_v2 = ['QIB', 'Total_Sub', 'Issue_Size', 'PE', 'PAT_Margin', 'ROE', 'Revenue']
        df_eval = df.dropna(subset=features_v2 + ['Sentiment']).copy()
        
        X = df_eval[features_v2]
        y_sent = df_eval['Sentiment']
        
        X_scaled = engine['scaler'].transform(X)
        le_sent = engine['le_sent']
        y_sent_enc = le_sent.transform(y_sent)
        
        y_pred = engine['model_sent'].predict(X_scaled)
        
        acc = accuracy_score(y_sent_enc, y_pred)
        print(f"SENTIMENT_ACCURACY:{acc*100:.1f}")
        
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    evaluate()
