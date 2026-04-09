import sys
import os
import joblib
from types import ModuleType

# Monkey patch to bypass missing module
dummy = ModuleType('sklearn.ensemble._gb_losses')
sys.modules['sklearn.ensemble._gb_losses'] = dummy

# Define dummy classes if joblib expects them
class DummyLoss: pass
setattr(dummy, 'LeastSquaresError', DummyLoss)
setattr(dummy, 'LossFunction', DummyLoss)

models_path = r"c:\Users\usk20\Downloads\StockTraQ\models"

print("Trying to load model1_listing_gain.pkl...")
try:
    model = joblib.load(os.path.join(models_path, 'model1_listing_gain.pkl'))
    print("✅ Model 1 Loaded Successfully!")
    print(f"Keys: {model.keys()}")
except Exception as e:
    print(f"❌ Error Loading Model 1: {e}")

try:
    model3 = joblib.load(os.path.join(models_path, 'model3_longterm_gain.pkl'))
    print("✅ Model 3 Loaded Successfully!")
except Exception as e:
    print(f"❌ Error Loading Model 3: {e}")
