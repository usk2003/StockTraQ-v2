import yfinance as yf
import sys
import json
import argparse

def fetch_live_price(symbol=None, bse_code=None):
    """
    Fetch live price using NSE symbol or BSE scrip code.
    NSE symbol suffix: .NS
    BSE code suffix: .BO
    """
    price = None
    source = None
    
    # Try NSE first if symbol provided
    if symbol:
        nse_ticker = f"{symbol}.NS"
        try:
            ticker = yf.Ticker(nse_ticker)
            # Use 'regularMarketPrice' or 'currentPrice'
            info = ticker.info
            price = info.get('currentPrice') or info.get('regularMarketPrice')
            if price:
                source = "NSE"
                # print(f"[OK] Fetched {symbol} from NSE: ₹{price}")
                return price, source
        except Exception as e:
            # print(f"[WARN] Failed to fetch {symbol} from NSE: {e}")
            pass

    # Fallback to BSE if code provided or if NSE failed
    if bse_code:
        bse_ticker = f"{bse_code}.BO"
        try:
            ticker = yf.Ticker(bse_ticker)
            info = ticker.info
            price = info.get('currentPrice') or info.get('regularMarketPrice')
            if price:
                source = "BSE"
                # print(f"[OK] Fetched {bse_code} from BSE: ₹{price}")
                return price, source
        except Exception as e:
            # print(f"[WARN] Failed to fetch {bse_code} from BSE: {e}")
            pass

    return None, None

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--symbol", type=str)
    parser.add_argument("--bse", type=str)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    if args.json:
        p, src = fetch_live_price(args.symbol, args.bse)
        print(json.dumps({"price": p, "source": src}))
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
