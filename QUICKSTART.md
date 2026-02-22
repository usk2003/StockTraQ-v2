# IPO TraQ - Quick Start Guide 🚀

## What is IPO TraQ?

IPO TraQ is an AI-powered system that predicts IPO performance using 5 machine learning models:
1. Listing gain prediction
2. Demand classification
3. Long-term growth forecast
4. PE valuation analysis
5. Financial strength rating

It generates a unified 1-10 rating to help evaluate IPO opportunities.

---

## Getting Started in 3 Steps

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Train Models
```bash
python train_models.py
```
⏱️ Takes ~1-2 minutes to train all 5 models

### Step 3: Launch App
```bash
streamlit run app.py
```
**Note:** If the above command fails with "command not found", try:
```bash
python -m streamlit run app.py
```
```
🌐 App opens at: http://localhost:8501

**OR** use the quick launcher:
```bash
./run.sh
```

---

## How to Use the App

### 1. Enter IPO Details

**Subscription Data:**
- QIB Subscription (x) - e.g., 34.5
- NII Subscription (x) - e.g., 25.0
- Retail Subscription (x) - e.g., 15.0
- Total Subscription (x) - e.g., 52.2

**Financial Metrics:**
- Issue Size (₹ Cr) - e.g., 1200
- PE Ratio - e.g., 32
- Revenue (₹ Cr) - e.g., 500
- PAT (₹ Cr) - e.g., 50
- ROE (%) - e.g., 18
- ROCE (%) - e.g., 15
- Profit Margin (%) - e.g., 12
- Revenue Growth (%) - e.g., 18

### 2. Click "Analyze IPO Performance"

The app will:
- Run all 5 ML models
- Calculate predictions
- Generate unified rating
- Show detailed metrics

### 3. Interpret Results

**Unified Rating:**
- 1-3: ❌ Avoid
- 4-5: ⚠️ Risky
- 6-7: ✓ Decent
- 8-9: ⭐ Strong
- 10: 💎 Blockbuster

**Key Metrics:**
- **Listing Gain:** Expected gain/loss on listing day
- **Long-Term Gain:** Projected 6-12 month return
- **Demand Tier:** Subscription strength (Low/Medium/High)
- **Financial Strength:** Company fundamentals (1-10)
- **PE Valuation:** Pricing efficiency (1-10)

---

## Example Analysis

**Input:**
```
QIB: 45.5x
Total Subscription: 62.3x
Issue Size: ₹850 Cr
PE Ratio: 28
Revenue: ₹420 Cr
PAT: ₹55 Cr
ROE: 22%
Profit Margin: 13%
```

**Output:**
```
Unified Rating: 8.5/10 ⭐ Strong
Listing Gain: +42.3% 🟢 Strong Gain
Long-Term Gain: +68.5%
Demand Tier: High
Financial Strength: 8.2/10
PE Valuation: 7.5/10

Recommendation: This IPO shows strong potential with 
excellent short-term and long-term potential. 
The company has strong fundamentals.
```

---

## Understanding the Predictions

### Listing Gain Tags
- 🔴 **Loss:** < 0%
- ⚪ **Flat:** 0-10%
- 🟡 **Mild Gain:** 10-30%
- 🟢 **Strong Gain:** 30-60%
- 🔥 **Blockbuster:** 60%+

### Demand Classification
- **Low:** < 20x subscription
- **Medium:** 20-50x subscription
- **High:** > 50x subscription

### Financial Strength Factors
- Revenue growth
- Profit margins
- Return on Equity (ROE)
- Return on Capital Employed (ROCE)
- Overall financial health

---

## Tips for Best Results

1. **Accurate Data:** Use official IPO prospectus data
2. **Multiple Metrics:** Consider all 5 predictions, not just one
3. **Context Matters:** Market conditions affect performance
4. **Risk Management:** Never invest based solely on predictions
5. **Professional Advice:** Consult financial advisors

---

## Troubleshooting

**Models not found?**
```bash
python train_models.py
```

**Streamlit won't start?**
```bash
pip install streamlit
streamlit run app.py
```

**Import errors?**
```bash
pip install -r requirements.txt
```

**Data file missing?**
Ensure `data/IPO_MasterDB.csv` exists in the project directory

---

## Advanced Usage

### Batch Predictions

Create a Python script:

```python
from utils.prediction_utils import *

# Load models
model1, model3, model4, model5, _ = load_models()

# Analyze multiple IPOs
ipos = [
    {"qib": 34.5, "total": 52.2, "size": 1200, ...},
    {"qib": 45.2, "total": 68.5, "size": 850, ...},
]

for ipo in ipos:
    rating = calculate_unified_rating(...)
    print(f"Rating: {rating}/10")
```

### Export Results

Save predictions to CSV or database for tracking and analysis.

---

## Need Help?

1. Check the full README.md for detailed documentation
2. Review the code comments in `app.py` and `train_models.py`
3. Examine sample predictions in the app
4. Review model architecture details in README

---

## ⚠️ Important Disclaimer

This tool provides AI-based predictions for educational purposes. 
IPO investments carry significant risks. Always:
- Do your own research
- Consult financial advisors
- Understand the risks
- Never invest more than you can afford to lose

Past performance does not guarantee future results.

---

**Happy Investing! 📈💰**
