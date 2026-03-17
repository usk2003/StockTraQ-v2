import yfinance as yf
import json
import sys

tickers = {
    "Nifty 50": "^NSEI",
    "Sensex": "^BSESN",
    "Gold": "GOLDBEES.NS",
    "Silver": "SILVERBEES.NS"
}

results = {}

for name, symbol in tickers.items():
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        # Get Price
        price = info.get('currentPrice') or info.get('regularMarketPrice')
        prev_close = info.get('regularMarketPreviousClose')

        if not price or not prev_close:
            # Fallback to history
            hist = ticker.history(period="2d")
            if len(hist) >= 2:
                price = hist['Close'].iloc[-1]
                prev_close = hist['Close'].iloc[-2]
            elif not hist.empty:
                price = hist['Close'].iloc[-1]
                prev_close = price # Fake prev close if not enough data
                
        if price and prev_close:
            change = price - prev_close
            change_percent = (change / prev_close) * 100 if prev_close != 0 else 0
            
            # Format numbers
            price_formatted = f"{price:,.2f}"
            change_formatted = f"{change:+,.2f}"
            change_percent_formatted = f"{change_percent:+.2f}%"
            
            results[name] = {
                "value": price_formatted,
                "change": change_formatted,
                "changePercent": change_percent_formatted,
                "isPositive": change >= 0
            }
        else:
            results[name] = {
                "value": "N/A",
                "change": "0.00",
                "changePercent": "0.00%",
                "isPositive": True
            }
            
    except Exception as e:
        results[name] = {
            "value": "Error",
            "change": str(e),
            "changePercent": "",
            "isPositive": False
        }

print(json.dumps(results, indent=2))
sys.exit(0)
