import yfinance as yf
import json

tickers = [
    "GOLDBEES.NS",   # Nippon India ETF Gold BeES
    "SETFGOLD.NS",   # SBI ETF Gold
    "SILVERBEES.NS", # Nippon India ETF Silver BeES
    "^BSEIPO",       # Testing again just in case
    "^BSESN",        # Sensex
    "^NSEI"          # Nifty 50
]

results = {}

for ticker_symbol in tickers:
    try:
        ticker = yf.Ticker(ticker_symbol)
        info = ticker.info
        price = info.get('currentPrice') or info.get('regularMarketPrice') or info.get('ask') or info.get('bid')
        if not price:
             hist = ticker.history(period="1d")
             if not hist.empty:
                 price = hist['Close'].iloc[-1]
        
        results[ticker_symbol] = {
            "price": price,
            "name": info.get('shortName', 'N/A'),
            "currency": info.get('currency', 'N/A')
        }
    except Exception as e:
        results[ticker_symbol] = {"error": str(e)}

print(json.dumps(results, indent=2))
