import yfinance as yf
import sys

def search_ticker(query):
    try:
        # yfinance doesn't have a direct search API in the main package easily
        # but we can try making a query or reading Tickers
        print(f"Searching for {query}...")
        ticker = yf.Ticker(query)
        info = ticker.info
        if info:
            print(f"FOUND: {query} - {info.get('longName')}")
            return True
    except Exception as e:
        print(f"FAILED: {query} - {e}")
    return False

# Test potential tickers
tickers = [
    "^BSEIPO", "BSEIPO", "BSEIPO.BO", "^BSEDII", "^BSEDII.BO",
    "NIFTYIPO.NS", "NIFTY_IPO.NS", "^NSEIPO", "^NSEIPO.NS"
]

for t in tickers:
    search_ticker(t)

# Also check GOLDBEES and SILVERBEES info to see if NAV/Multiplier is there
gold = yf.Ticker("GOLDBEES.NS")
print("\nGOLDBEES Info:")
try:
    print(gold.info)
except:
    print("No info")

sys.exit(0)
