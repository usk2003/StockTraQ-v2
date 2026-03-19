import pandas as pd
import numpy as np
import joblib
import os
import warnings
from datetime import datetime
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, GradientBoostingRegressor, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_absolute_error, accuracy_score

warnings.filterwarnings('ignore')

# Create models_v2 directory
if not os.path.exists('models_v2'):
    os.makedirs('models_v2')

print("=" * 70)
print("Stock TraQ - ML v2 Training Pipeline")
print("=" * 70)

# 1. Load data
print("\n[1/7] Loading IPO Dataset...")
df = pd.read_csv('data/IPO_MasterDB.csv')
print(f"[OK] Loaded {len(df)} records")

# 2. Preprocessing
print("\n[2/7] Preprocessing Data...")

def clean_percentage(val):
    if pd.isna(val) or val == '': return 0.0
    if isinstance(val, str):
        val = val.replace('%', '').replace(',', '').strip()
    try: return float(val)
    except: return 0.0

def clean_numeric(val):
    if pd.isna(val) or val == '': return 0.0
    if isinstance(val, str):
        val = val.replace(',', '').replace('₹', '').replace('Rs.', '').strip()
    try: return float(val)
    except: return 0.0

# Core features
df['Listing_Gain'] = df['%_Gain_/_Loss_(Issue_price_v/s_Close_price_on_Listing)'].apply(clean_percentage)
df['Long_Term_Gain'] = df['Gain_/_Loss_(%)'].apply(clean_percentage)
df['QIB'] = df['QIB_(x)'].apply(clean_numeric)
df['NII'] = df['NII_(x)'].apply(clean_numeric)
df['Retail'] = df['Retail_(x)'].apply(clean_numeric)
df['Total_Sub'] = df['Total_(x)'].apply(clean_numeric)
df['Issue_Size'] = df['Issue_Amount_(Rs.cr.)'].apply(clean_numeric)
df['Price'] = df['Issue_Price_(Rs.)'].apply(clean_numeric)
df['PE'] = df['P/E_(x)_Pre-IPO'].apply(clean_numeric)
df['Revenue'] = df['Revenue_(Rs.cr.)'].apply(clean_numeric)
df['PAT'] = df['Profit_After_Tax_(Rs.cr.)'].apply(clean_numeric)
df['ROE'] = df['ROE'].apply(clean_percentage)
df['ROCE'] = df['ROCE'].apply(clean_percentage)
df['PAT_Margin'] = df['PAT_Margin_%'].apply(clean_percentage)
df['52_High'] = df['52_Week_High_(Value)'].apply(clean_numeric)

# Derived: Max Potential (Issue price to 52-Week High)
# (52_High - Issue_Price) / Issue_Price * 100
df['Max_Potential'] = ((df['52_High'] - df['Price']) / df['Price'] * 100).fillna(df['Long_Term_Gain'])

# 3. Create v2 Target Labels
print("\n[3/7] Engineering v2 Target Labels...")

def get_gain_rating(gain):
    if gain < 0: return np.random.uniform(0, 2)
    elif gain < 5: return np.random.uniform(2, 3)
    elif gain < 10: return np.random.uniform(3, 4)
    elif gain < 20: return np.random.uniform(4, 5)
    elif gain < 30: return np.random.uniform(5, 6)
    elif gain < 50: return np.random.uniform(6, 7)
    elif gain < 75: return np.random.uniform(7, 8)
    elif gain < 100: return np.random.uniform(8, 9)
    else: return np.random.uniform(9, 10)

df['Gain_Rating'] = df['Listing_Gain'].apply(get_gain_rating)

def get_gain_range(gain):
    if gain < 0: return "Negative"
    elif gain < 10: return "Flat (0-10%)"
    elif gain < 30: return "Mild (10-30%)"
    elif gain < 60: return "Strong (30-60%)"
    else: return "Blockbuster (>60%)"

df['Gain_Range'] = df['Listing_Gain'].apply(get_gain_range)

def get_sentiment(gain):
    if gain < 0: return "Negative"
    elif gain < 20: return "Mild"
    else: return "Positive"

df['Sentiment'] = df['Listing_Gain'].apply(get_sentiment)

# CORRELATION FEATURING: We use Financials alongside Subscription for Listing Gain
features_v2 = ['QIB', 'Total_Sub', 'Issue_Size', 'PE', 'PAT_Margin', 'ROE', 'Revenue']
df_clean = df.dropna(subset=features_v2 + ['Listing_Gain']).copy()

X = df_clean[features_v2]
y_gain = df_clean['Listing_Gain']
y_rating = df_clean['Gain_Rating']
y_range = df_clean['Gain_Range']
y_sentiment = df_clean['Sentiment']
y_potential = df_clean['Max_Potential']

X_train, X_test, y_gain_train, y_gain_test = train_test_split(X, y_gain, test_size=0.2, random_state=42)
_, _, y_rating_train, y_rating_test = train_test_split(X, y_rating, test_size=0.2, random_state=42)
_, _, y_range_train, y_range_test = train_test_split(X, y_range, test_size=0.2, random_state=42)
_, _, y_sentiment_train, y_sentiment_test = train_test_split(X, y_sentiment, test_size=0.2, random_state=42)
_, _, y_potential_train, y_potential_test = train_test_split(X, y_potential, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 4. Train Listing Gain & Rating (Regressor)
print("\n[4/7] Training Correlated Listing Models...")
# We train both to predict the actual gain and the rating (0-10)
model_gain = GradientBoostingRegressor(n_estimators=100, random_state=42).fit(X_train_scaled, y_gain_train)
model_rating = GradientBoostingRegressor(n_estimators=100, random_state=42).fit(X_train_scaled, y_rating_train)

# 5. Train Range & Sentiment (Classifier)
print("\n[5/7] Training Range & Sentiment Classifiers...")
le_range = LabelEncoder()
y_range_train_enc = le_range.fit_transform(y_range_train)

le_sent = LabelEncoder()
y_sent_train_enc = le_sent.fit_transform(y_sentiment_train)

model_range = RandomForestClassifier(n_estimators=100, random_state=42).fit(X_train_scaled, y_range_train_enc)
model_sent = RandomForestClassifier(n_estimators=100, random_state=42).fit(X_train_scaled, y_sent_train_enc)

# 6. Train Max Potential Audit (Long-term)
print("\n[6/7] Training Max Potential (52-W High) Model...")
model_potential = RandomForestRegressor(n_estimators=100, random_state=42).fit(X_train_scaled, y_potential_train)

# 7. Save Models
print("\n[7/7] Saving v2 models...")
joblib.dump({
    'model_gain': model_gain,
    'model_rating': model_rating,
    'model_range': model_range,
    'le_range': le_range,
    'model_sent': model_sent,
    'le_sent': le_sent,
    'model_potential': model_potential,
    'scaler': scaler,
    'features': features_v2
}, 'models_v2/engine_v2.pkl')

print("\n" + "=" * 70)
print("[OK] ML v2 Engine trained successfully!")
print("=" * 70)
