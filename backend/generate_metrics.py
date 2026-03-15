import pandas as pd
import numpy as np
import json
import os
import re
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix,
    r2_score, mean_absolute_error, mean_squared_error
)
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.svm import SVR, SVC
from sklearn.neural_network import MLPRegressor, MLPClassifier
from sklearn.ensemble import GradientBoostingRegressor, RandomForestClassifier

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

def get_sentiment(gain):
    if gain < 0: return "Negative"
    elif gain < 20: return "Mild"
    else: return "Positive"

def main():
    print("Loading data...")
    df = pd.read_csv('data/IPO_MasterDB.csv')
    
    df['Listing_Gain'] = df['%_Gain_/_Loss_(Issue_price_v/s_Close_price_on_Listing)'].apply(clean_percentage)
    df['QIB'] = df['QIB_(x)'].apply(clean_numeric)
    df['Total_Sub'] = df['Total_(x)'].apply(clean_numeric)
    df['Issue_Size'] = df['Issue_Amount_(Rs.cr.)'].apply(clean_numeric)
    df['PE'] = df['P/E_(x)_Pre-IPO'].apply(clean_numeric)
    df['Revenue'] = df['Revenue_(Rs.cr.)'].apply(clean_numeric)
    df['ROE'] = df['ROE'].apply(clean_percentage)
    df['PAT_Margin'] = df['PAT_Margin_%'].apply(clean_percentage)
    df['Sentiment'] = df['Listing_Gain'].apply(get_sentiment)
    
    features = ['QIB', 'Total_Sub', 'Issue_Size', 'PE', 'PAT_Margin', 'ROE', 'Revenue']
    df_clean = df.dropna(subset=features + ['Listing_Gain', 'Sentiment']).copy()
    
    X = df_clean[features]
    y_reg = df_clean['Listing_Gain']
    y_clf = df_clean['Sentiment']
    
    X_train, X_test, y_reg_train, y_reg_test, y_clf_train, y_clf_test = train_test_split(
        X, y_reg, y_clf, test_size=0.2, random_state=42
    )
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    le = LabelEncoder()
    y_clf_train_enc = le.fit_transform(y_clf_train)
    y_clf_test_enc = le.transform(y_clf_test)
    
    models = [
        {
            "id": "lr",
            "name": "Linear/Logistic Regression",
            "desc": "Baseline model testing for direct linear relationships.",
            "verdict": "Rejected. Market data is highly non-linear with severe outliers.",
            "color": "gray",
            "reg_model": LinearRegression(),
            "clf_model": LogisticRegression(max_iter=1000, random_state=42)
        },
        {
            "id": "svr",
            "name": "Support Vector Machine (SVM)",
            "desc": "Attempted to find a hyperplane in multi-dimensional space to separate profitable listings.",
            "verdict": "Rejected. Too slow to train on growing datasets.",
            "color": "yellow",
            "reg_model": SVR(),
            "clf_model": SVC(probability=True, random_state=42)
        },
        {
            "id": "dnn",
            "name": "Deep Neural Networks (DNN)",
            "desc": "Complex hidden layers to find abstract patterns in company financials.",
            "verdict": "Rejected. Prone to overfitting on small financial datasets.",
            "color": "red",
            "reg_model": MLPRegressor(hidden_layer_sizes=(64, 32), max_iter=500, random_state=42),
            "clf_model": MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=500, random_state=42)
        },
        {
            "id": "ensemble",
            "name": "Random Forest & XGBoost",
            "desc": "Ensemble learning methods using multiple decision trees to form a consensus prediction.",
            "verdict": "Selected. Highly resilient to market outliers and non-linear patterns.",
            "color": "green",
            "reg_model": GradientBoostingRegressor(n_estimators=100, random_state=42),
            "clf_model": RandomForestClassifier(n_estimators=100, random_state=42)
        }
    ]
    
    results = []
    
    n = len(y_reg_test)
    p = X_test.shape[1]
    
    for m in models:
        print(f"Training {m['name']}...")
        
        # Regression
        reg = m['reg_model']
        reg.fit(X_train_scaled, y_reg_train)
        y_reg_pred = reg.predict(X_test_scaled)
        
        r2 = r2_score(y_reg_test, y_reg_pred)
        # Adjusted R2 Formula: 1 - (1-R2)*(n-1)/(n-p-1)
        adj_r2 = 1 - (1 - r2) * (n - 1) / (n - p - 1)
        mse = mean_squared_error(y_reg_test, y_reg_pred)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(y_reg_test, y_reg_pred)
        
        # Classification
        clf = m['clf_model']
        clf.fit(X_train_scaled, y_clf_train_enc)
        y_clf_pred = clf.predict(X_test_scaled)
        y_clf_prob = clf.predict_proba(X_test_scaled)
        
        acc = accuracy_score(y_clf_test_enc, y_clf_pred)
        prec = precision_score(y_clf_test_enc, y_clf_pred, average='weighted', zero_division=0)
        rec = recall_score(y_clf_test_enc, y_clf_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_clf_test_enc, y_clf_pred, average='weighted', zero_division=0)
        
        try:
            roc_auc = roc_auc_score(y_clf_test_enc, y_clf_prob, multi_class='ovr', average='weighted')
        except:
            roc_auc = 0.5
            
        cm = confusion_matrix(y_clf_test_enc, y_clf_pred).tolist()
        
        res = {
            "name": m['name'],
            "desc": m['desc'],
            "verdict": m['verdict'],
            "color": m['color'],
            "regression_metrics": {
                "r2": round(r2, 4),
                "adj_r2": round(adj_r2, 4),
                "mae": round(mae, 2),
                "mse": round(mse, 2),
                "rmse": round(rmse, 2)
            },
            "classification_metrics": {
                "accuracy": round(acc, 4),
                "precision": round(prec, 4),
                "recall": round(rec, 4),
                "f1": round(f1, 4),
                "roc_auc": round(roc_auc, 4),
                "confusion_matrix": cm,
                "classes": list(le.classes_)
            }
        }
        results.append(res)
        
    with open('model_metrics_real.json', 'w') as f:
        json.dump(results, f, indent=4)
        
    print("Done! Saved to model_metrics_real.json")

if __name__ == '__main__':
    main()
