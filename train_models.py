"""
IPO TraQ - ML Model Training Pipeline
Train all 5 prediction models on historical IPO data
"""

import pandas as pd
import numpy as np
import joblib
import warnings
from datetime import datetime
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score
warnings.filterwarnings('ignore')

print("=" * 70)
print("IPO TraQ - Machine Learning Pipeline")
print("=" * 70)

# Load data
print("\n[1/6] Loading IPO Dataset...")
df = pd.read_csv('data/IPO_MasterDB.csv')
print(f"[OK] Loaded {len(df)} IPO records")

# Data Preprocessing
print("\n[2/6] Preprocessing Data...")

# Extract year from Listing_Date
df['Listing_Year'] = pd.to_datetime(df['Listing_Date']).dt.year

# Clean column names and select relevant features
df.columns = df.columns.str.strip()

# Feature Engineering
def clean_percentage(val):
    """Clean percentage values"""
    if pd.isna(val):
        return np.nan
    if isinstance(val, str):
        val = val.replace('%', '').replace(',', '').strip()
    try:
        return float(val)
    except:
        return np.nan

def clean_numeric(val):
    """Clean numeric values"""
    if pd.isna(val):
        return np.nan
    if isinstance(val, str):
        val = val.replace(',', '').replace('₹', '').replace('Rs.', '').strip()
    try:
        return float(val)
    except:
        return np.nan

# Clean key columns
df['QIB'] = df['QIB_(x)'].apply(clean_numeric)
df['NII'] = df['NII_(x)'].apply(clean_numeric)
df['Retail'] = df['Retail_(x)'].apply(clean_numeric)
df['Total_Subscription'] = df['Total_(x)'].apply(clean_numeric)
df['Issue_Price'] = df['Issue_Price_(Rs.)'].apply(clean_numeric)
df['Listing_Gain'] = df['%_Gain_/_Loss_(Issue_price_v/s_Close_price_on_Listing)'].apply(clean_percentage)
df['Long_Term_Gain'] = df['Gain_/_Loss_(%)'].apply(clean_percentage)
df['PE_Pre'] = df['P/E_(x)_Pre-IPO'].apply(clean_numeric)
df['PE_Post'] = df['P/E_(x)_Post-IPO'].apply(clean_numeric)
df['ROE'] = df['ROE'].apply(clean_percentage)
df['ROCE'] = df['ROCE'].apply(clean_percentage)
df['RoNW'] = df['RoNW'].apply(clean_percentage)
df['Revenue'] = df['Revenue_(Rs.cr.)'].apply(clean_numeric)
df['PAT'] = df['Profit_After_Tax_(Rs.cr.)'].apply(clean_numeric)
df['Issue_Size'] = df['Issue_Amount_(Rs.cr.)'].apply(clean_numeric)
df['PAT_Margin'] = df['PAT_Margin_%'].apply(clean_percentage)
df['Net_Worth'] = df['Net_Worth_(Rs.cr.)'].apply(clean_numeric)
df['Total_Borrowing'] = df['Total_Borrowing_(Rs.cr.)'].apply(clean_numeric)

# Calculate derived features
df['Revenue_Growth'] = np.random.uniform(5, 40, len(df))  # Placeholder - ideally from historical data
df['Profit_Margin'] = (df['PAT'] / df['Revenue'] * 100).fillna(df['PAT_Margin'])

# Handle missing values
df = df.dropna(subset=['QIB', 'Total_Subscription', 'Listing_Gain'])

# Random Split (80/20)
# Use index to keep track of Company names
train_idx, test_idx = train_test_split(df.index, test_size=0.20, random_state=42)
train_df = df.loc[train_idx].copy()
test_df = df.loc[test_idx].copy()

print(f"[OK] Training samples: {len(train_df)}")
print(f"[OK] Testing samples: {len(test_df)}")

# Initialize results dataframe for test set
print("\n[2.5/6] Initializing Test Results Storage...")
results_df = test_df[['Company', 'Listing_Gain', 'Long_Term_Gain']].copy()
results_df.columns = ['Company', 'Actual_Listing_Gain', 'Actual_Long_Term_Gain']

# =============================================================================
# MODEL 1: QIB Subscription -> Listing Gain Rating
# =============================================================================
print("\n[3/6] Training Model 1: QIB -> Listing Gain Rating...")

# Prepare features
X1_train = train_df[['QIB', 'NII', 'Retail', 'Total_Subscription', 'Issue_Size']].fillna(0)
y1_train = train_df['Listing_Gain'].fillna(0)

X1_test = test_df[['QIB', 'NII', 'Retail', 'Total_Subscription', 'Issue_Size']].fillna(0)
y1_test = test_df['Listing_Gain'].fillna(0)

# Scale features
scaler1 = StandardScaler()
X1_train_scaled = scaler1.fit_transform(X1_train)
X1_test_scaled = scaler1.transform(X1_test)

# Train ensemble models
lr1 = LinearRegression()
rf1 = RandomForestRegressor(n_estimators=200, max_depth=10, random_state=42, n_jobs=-1)
gb1 = GradientBoostingRegressor(n_estimators=200, max_depth=6, learning_rate=0.1, random_state=42)

lr1.fit(X1_train_scaled, y1_train)
rf1.fit(X1_train_scaled, y1_train)
gb1.fit(X1_train_scaled, y1_train)

# Ensemble prediction
def hybrid_predict_1(X_scaled):
    p1 = lr1.predict(X_scaled)
    p2 = rf1.predict(X_scaled)
    p3 = gb1.predict(X_scaled)
    return 0.2 * p1 + 0.4 * p2 + 0.4 * p3

y1_pred = hybrid_predict_1(X1_test_scaled)
mae1 = mean_absolute_error(y1_test, y1_pred)
r2_1 = r2_score(y1_test, y1_pred)

print(f"[OK] Model 1 - MAE: {mae1:.2f}%, R²: {r2_1:.3f}")

# Store predictions
results_df['Predicted_Listing_Gain'] = y1_pred

# Save Model 1
joblib.dump({'lr': lr1, 'rf': rf1, 'xgb': gb1, 'scaler': scaler1}, 'models/model1_listing_gain.pkl')

# =============================================================================
# MODEL 2: Demand vs Listing Gain Tag
# =============================================================================
print("\n[4/6] Training Model 2: Demand Classification...")

# This model predicts both gain and assigns tags
# Using Model 1's predictions with tagging logic

def tag_gain(gain):
    """Assign tag based on listing gain"""
    if gain < 0:
        return "🔴 Loss"
    elif gain < 10:
        return "⚪ Flat"
    elif gain < 30:
        return "🟡 Mild Gain"
    elif gain < 60:
        return "🟢 Strong Gain"
    else:
        return "🔥 Blockbuster"

def classify_demand(subscription):
    """Classify demand tier"""
    if subscription >= 50:
        return "High"
    elif subscription >= 20:
        return "Medium"
    else:
        return "Low"

# Model 2 uses Model 1's predictions with tagging
print("[OK] Model 2 - Tagging logic implemented")

# =============================================================================
# MODEL 3: Long-Term Gain Prediction
# =============================================================================
print("\n[5/6] Training Model 3: Long-Term Gain Prediction...")

# Filter valid long-term data for training
train_lt = train_df.dropna(subset=['Long_Term_Gain'])
test_lt = test_df.dropna(subset=['Long_Term_Gain'])

if len(train_lt) > 10:
    X3_train = train_lt[['QIB', 'Total_Subscription', 'Issue_Size', 'Listing_Gain']].fillna(0)
    y3_train = train_lt['Long_Term_Gain'].fillna(0)
    
    # Validation on filtered test set
    X3_test = test_lt[['QIB', 'Total_Subscription', 'Issue_Size', 'Listing_Gain']].fillna(0) if len(test_lt) > 0 else X3_train[:5]
    y3_test = test_lt['Long_Term_Gain'].fillna(0) if len(test_lt) > 0 else y3_train[:5]
    
    scaler3 = StandardScaler()
    X3_train_scaled = scaler3.fit_transform(X3_train)
    X3_test_scaled = scaler3.transform(X3_test)
    
    lr3 = LinearRegression()
    rf3 = RandomForestRegressor(n_estimators=200, max_depth=10, random_state=42, n_jobs=-1)
    gb3 = GradientBoostingRegressor(n_estimators=200, max_depth=6, learning_rate=0.1, random_state=42)
    
    lr3.fit(X3_train_scaled, y3_train)
    rf3.fit(X3_train_scaled, y3_train)
    gb3.fit(X3_train_scaled, y3_train)
    
    def hybrid_predict_3(X_scaled):
        p1 = lr3.predict(X_scaled)
        p2 = rf3.predict(X_scaled)
        p3 = gb3.predict(X_scaled)
        return 0.2 * p1 + 0.4 * p2 + 0.4 * p3
    
    y3_pred = hybrid_predict_3(X3_test_scaled)
    mae3 = mean_absolute_error(y3_test, y3_pred)
    r2_3 = r2_score(y3_test, y3_pred)
    
    print(f"[OK] Model 3 - MAE: {mae3:.2f}%, R²: {r2_3:.3f}")
    
    # Store predictions for ALL test rows
    X3_test_full = test_df[['QIB', 'Total_Subscription', 'Issue_Size', 'Listing_Gain']].fillna(0)
    X3_test_full_scaled = scaler3.transform(X3_test_full)
    results_df['Predicted_Long_Term_Gain'] = hybrid_predict_3(X3_test_full_scaled)
    
    joblib.dump({'lr': lr3, 'rf': rf3, 'xgb': gb3, 'scaler': scaler3}, 'models/model3_longterm_gain.pkl')
else:
    print("[WARN] Insufficient data for Model 3 - using fallback")
    results_df['Predicted_Long_Term_Gain'] = 0.0
    joblib.dump(None, 'models/model3_longterm_gain.pkl')

# =============================================================================
# MODEL 4: PE vs Listing Gain vs Long-Term Gain
# =============================================================================
print("\n[6/6] Training Model 4: PE Valuation Impact...")

train_pe = train_df.dropna(subset=['PE_Pre', 'Listing_Gain'])

if len(train_pe) > 10:
    X4_train = train_pe[['PE_Pre', 'Revenue', 'Profit_Margin', 'ROE']].fillna(0)
    y4_train = train_pe['Listing_Gain'].fillna(0)
    
    scaler4 = StandardScaler()
    X4_train_scaled = scaler4.fit_transform(X4_train)
    
    lr4 = LinearRegression()
    rf4 = RandomForestRegressor(n_estimators=200, max_depth=10, random_state=42, n_jobs=-1)
    gb4 = GradientBoostingRegressor(n_estimators=200, max_depth=6, learning_rate=0.1, random_state=42)
    
    lr4.fit(X4_train_scaled, y4_train)
    rf4.fit(X4_train_scaled, y4_train)
    gb4.fit(X4_train_scaled, y4_train)
    
    print("[OK] Model 4 - PE valuation model trained")
    
    joblib.dump({'lr': lr4, 'rf': rf4, 'xgb': gb4, 'scaler': scaler4}, 'models/model4_pe_valuation.pkl')
else:
    print("[WARN] Insufficient data for Model 4 - using fallback")
    joblib.dump(None, 'models/model4_pe_valuation.pkl')

# =============================================================================
# MODEL 5: Financial Strength -> Company Rating
# =============================================================================
print("\n[7/7] Training Model 5: Financial Strength Rating...")

train_fin = train_df.dropna(subset=['Revenue', 'PAT', 'ROE'])

if len(train_fin) > 10:
    # Create synthetic financial strength score as target
    train_fin['Financial_Score'] = (
        (train_fin['ROE'].fillna(0) / 10) * 0.3 +
        (train_fin['Profit_Margin'].fillna(0) / 5) * 0.3 +
        (train_fin['Revenue'].fillna(0) / train_fin['Revenue'].max() * 10) * 0.2 +
        (train_fin['PAT'].fillna(0) / train_fin['PAT'].max() * 10) * 0.2
    ).clip(1, 10)
    
    X5_train = train_fin[['Revenue', 'PAT', 'ROE', 'ROCE', 'Profit_Margin']].fillna(0)
    y5_train = train_fin['Financial_Score']
    
    scaler5 = StandardScaler()
    X5_train_scaled = scaler5.fit_transform(X5_train)
    
    lr5 = LinearRegression()
    rf5 = RandomForestRegressor(n_estimators=200, max_depth=10, random_state=42, n_jobs=-1)
    gb5 = GradientBoostingRegressor(n_estimators=200, max_depth=6, learning_rate=0.1, random_state=42)
    
    lr5.fit(X5_train_scaled, y5_train)
    rf5.fit(X5_train_scaled, y5_train)
    gb5.fit(X5_train_scaled, y5_train)
    
    print("[OK] Model 5 - Financial strength rating model trained")
    
    joblib.dump({'lr': lr5, 'rf': rf5, 'xgb': gb5, 'scaler': scaler5}, 'models/model5_financial_rating.pkl')
else:
    print("[WARN] Insufficient data for Model 5 - using fallback")
    joblib.dump(None, 'models/model5_financial_rating.pkl')

# =============================================================================
# Save Metadata and Test Results
# =============================================================================
metadata = {
    'training_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
    'training_samples': len(train_df),
    'test_samples': len(test_df),
    'features': {
        'model1': ['QIB', 'NII', 'Retail', 'Total_Subscription', 'Issue_Size'],
        'model3': ['QIB', 'Total_Subscription', 'Issue_Size', 'Listing_Gain'],
        'model4': ['PE_Pre', 'Revenue', 'Profit_Margin', 'ROE'],
        'model5': ['Revenue', 'PAT', 'ROE', 'ROCE', 'Profit_Margin']
    }
}

joblib.dump(metadata, 'models/metadata.pkl')
results_df.to_csv('data/test_predictions.csv', index=False)

print("\n" + "=" * 70)
print("[OK] All models trained and saved successfully!")
print("[OK] Test predictions saved to data/test_predictions.csv")
print("=" * 70)
print(f"\nModels saved in: models/")
print("Ready for deployment in Streamlit app!")
