import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from services.prediction_service import PredictionService

def test():
    ps = PredictionService('models')
    
    # Mock engine_v2 to simulate a "Negative" prediction
    if ps.engine_v2:
        # We need to see what keys are in le_range to be sure
        le = ps.engine_v2['le_range']
        print(f"Inverse classes: {le.classes_}")
        
        # Test Negative range specifically
        data = {
            'qib': 0.1, 'total_sub': 0.5, 'issue_size': 1000, 
            'pe_ratio': 150, 'profit_margin': -5, 'roe': -2, 'revenue': 100
        }
        res = ps.predict_v2(data)
        print(f"Prediction: {res['listing_range']}")
        print(f"Min: {res['range_min']}, Max: {res['range_max']}")

if __name__ == "__main__":
    test()
