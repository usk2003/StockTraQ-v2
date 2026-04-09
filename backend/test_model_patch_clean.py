import sys
import os
import joblib
from types import ModuleType

# Monkey patch to bypass missing module
dummy = ModuleType('sklearn.ensemble._gb_losses')
sys.modules['sklearn.ensemble._gb_losses'] = dummy

models_path = r"c:\Users\usk20\Downloads\StockTraQ\models"

def test_load(f):
    try:
        model = joblib.load(os.path.join(models_path, f))
        print(f"Loaded {f}")
        return True
    except Exception as e:
        print(f"Failed {f}: {e}")
        return False

test_load('model1_listing_gain.pkl')
test_load('model3_longterm_gain.pkl')
test_load('model4_pe_valuation.pkl')
test_load('model5_financial_rating.pkl')
test_load('metadata.pkl')
