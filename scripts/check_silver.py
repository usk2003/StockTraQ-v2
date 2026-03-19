import yfinance as yf
ticker = yf.Ticker("SILVERBEES.NS")
print(ticker.info.get('longName'))
print("Price:", ticker.info.get('regularMarketPrice') or ticker.info.get('currentPrice'))
print("Previous Close:", ticker.info.get('regularMarketPreviousClose'))
