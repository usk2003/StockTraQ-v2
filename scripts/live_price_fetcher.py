import yfinance as yf
import sys
import json
import argparse
import os

# Suppress all yfinance logging and progress bars
os.environ['YF_NO_PRINTOUT'] = '1'

def fetch_live_price(symbol=None, bse_code=None):
    """
    Fetch live price using NSE symbol or BSE scrip code.
    Uses yf.download for batch performance and reliability.
    """
    price = None
    source = None
    
    # Prepare tickers list
    tickers = []
    if symbol: tickers.append(f"{symbol}.NS")
    if bse_code: tickers.append(f"{bse_code}.BO")
    
    if not tickers:
        return None, None
    
    try:
        # yf.download is significantly more reliable and faster than .info
        # We use interval='1m' to get the absolute latest minute-level price
        data = yf.download(tickers, period='1d', interval='1m', progress=False)
        
        if data.empty:
            return None, None

        # Helper to extract latest price safely
        def get_price(ticker_name):
            try:
                # Handle single vs multi-index dataframes
                if len(tickers) == 1:
                    val = data['Close'].iloc[-1]
                else:
                    val = data['Close'][ticker_name].iloc[-1]
                
                import math
                if val and not math.isnan(val):
                    return float(val)
            except:
                return None
            return None

        # Try NSE (Prioritize NSE)
        if symbol:
            price = get_price(f"{symbol}.NS")
            if price:
                return price, "NSE"

        # Try BSE (Fallback)
        if bse_code:
            price = get_price(f"{bse_code}.BO")
            if price:
                return price, "BSE"

    except Exception:
        # Final safety catch to prevent console pollution
        pass

    return None, None

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--symbol", type=str)
    parser.add_argument("--bse", type=str)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    if args.json:
        # Ensure only the JSON is printed to stdout
        try:
            p, src = fetch_live_price(args.symbol, args.bse)
            print(json.dumps({"price": p, "source": src}))
        except:
            print(json.dumps({"price": None, "source": None}))
        sys.exit(0)

    # Manual Test cases if no args
    if not args.symbol and not args.bse:
        test_symbols = [
            {"symbol": "RELIANCE", "bse": "500325"}, 
            {"symbol": "ZOMATO", "bse": "543320"}
        ]
        print("*" * 40)
        print("LIVE MARKET DATA FEED TEST")
        print("*" * 40)
        for item in test_symbols:
            p, src = fetch_live_price(item["symbol"], item["bse"])
            if p: print(f"SUCCESS: {item['symbol']} -> ₹{p} ({src})")
            else: print(f"FAILURE: {item['symbol']} not found")
            print("-" * 40)
