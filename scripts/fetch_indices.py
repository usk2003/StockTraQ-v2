import yfinance as yf
import requests
from bs4 import BeautifulSoup
import json
import sys
import re

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
}

def parse_price(text):
    """Extract numeric price from text like '₹9,234' or '9234.50'"""
    cleaned = re.sub(r'[^\d.]', '', text.replace(',', ''))
    try:
        return float(cleaned)
    except (ValueError, TypeError):
        return None


def fetch_gold_price_goodreturns():
    """Scrape live 1gm 24K gold price from GoodReturns.in"""
    try:
        url = 'https://www.goodreturns.in/gold-rates/'
        r = requests.get(url, headers=HEADERS, timeout=10)
        if r.status_code != 200:
            return None, None

        soup = BeautifulSoup(r.text, 'html.parser')

        # GoodReturns shows gold rates in a div with id or specific class
        # Look for the "22 Carat Gold" and "24 Carat Gold" sections
        # The page typically has a table with today's and yesterday's rates
        
        today_price = None
        yesterday_price = None

        # Strategy 1: Look for the gold rate summary section
        # The page shows "Today 24 Carat Gold Rate Per Gram in India" etc.
        rate_div = soup.find('div', class_='gold_silver_table')
        if rate_div:
            rows = rate_div.find_all('tr')
            for row in rows:
                cells = row.find_all('td')
                if len(cells) >= 2:
                    label = cells[0].get_text(strip=True).lower()
                    if '24' in label and ('1 gram' in label or '1gram' in label or 'gram' in label):
                        today_price = parse_price(cells[1].get_text(strip=True))
                        if len(cells) >= 3:
                            yesterday_price = parse_price(cells[2].get_text(strip=True))
                        break

        # Strategy 2: Look for specific data attributes or structured tables
        if not today_price:
            tables = soup.find_all('table')
            for table in tables:
                rows = table.find_all('tr')
                for row in rows:
                    cells = row.find_all(['td', 'th'])
                    cell_texts = [c.get_text(strip=True).lower() for c in cells]
                    text_joined = ' '.join(cell_texts)
                    # Look for "1 gram" row in the 24 carat table
                    if '1 gram' in text_joined or '1 gm' in text_joined or '1gram' in text_joined:
                        # Check if this is in a 24K context
                        # The prices are usually in the subsequent cells
                        for cell in cells[1:]:
                            price = parse_price(cell.get_text(strip=True))
                            if price and price > 5000:  # Gold per gram sanity check
                                if not today_price:
                                    today_price = price
                                elif not yesterday_price:
                                    yesterday_price = price
                                    break
                        if today_price:
                            break
                if today_price:
                    break

        # Strategy 3: Look for structured data / JSON-LD
        if not today_price:
            scripts = soup.find_all('script', type='application/ld+json')
            for script in scripts:
                try:
                    data = json.loads(script.string)
                    if isinstance(data, dict) and 'price' in str(data).lower():
                        # Try to extract price
                        pass
                except:
                    pass

        # Strategy 4: Look for price in meta tags or specific spans
        if not today_price:
            # Some sites put rate in spans with specific classes
            price_spans = soup.find_all('span', class_=re.compile(r'(price|rate|gold)', re.I))
            for span in price_spans:
                price = parse_price(span.get_text(strip=True))
                if price and 5000 < price < 100000:  # Reasonable 1gm gold range INR
                    today_price = price
                    break

        return today_price, yesterday_price

    except Exception:
        return None, None


def fetch_silver_price_goodreturns():
    """Scrape live 1gm silver price from GoodReturns.in"""
    try:
        url = 'https://www.goodreturns.in/silver-rates/'
        r = requests.get(url, headers=HEADERS, timeout=10)
        if r.status_code != 200:
            return None, None

        soup = BeautifulSoup(r.text, 'html.parser')

        today_price = None
        yesterday_price = None

        # Strategy 1: Look for silver_rate table
        rate_div = soup.find('div', class_='gold_silver_table')
        if rate_div:
            rows = rate_div.find_all('tr')
            for row in rows:
                cells = row.find_all('td')
                if len(cells) >= 2:
                    label = cells[0].get_text(strip=True).lower()
                    if '1 gram' in label or '1gram' in label or 'gram' in label:
                        today_price = parse_price(cells[1].get_text(strip=True))
                        if len(cells) >= 3:
                            yesterday_price = parse_price(cells[2].get_text(strip=True))
                        break

        # Strategy 2: Tables
        if not today_price:
            tables = soup.find_all('table')
            for table in tables:
                rows = table.find_all('tr')
                for row in rows:
                    cells = row.find_all(['td', 'th'])
                    cell_texts = [c.get_text(strip=True).lower() for c in cells]
                    text_joined = ' '.join(cell_texts)
                    if '1 gram' in text_joined or '1 gm' in text_joined or '1gram' in text_joined:
                        for cell in cells[1:]:
                            price = parse_price(cell.get_text(strip=True))
                            if price and price > 50:  # Silver per gram sanity check
                                if not today_price:
                                    today_price = price
                                elif not yesterday_price:
                                    yesterday_price = price
                                    break
                        if today_price:
                            break
                if today_price:
                    break

        return today_price, yesterday_price

    except Exception:
        return None, None


def fetch_gold_silver_yfinance():
    """Fallback: Fetch gold/silver prices via yfinance COMEX futures + USD/INR conversion"""
    results = {}
    
    try:
        # Get USD/INR exchange rate
        usdinr = yf.Ticker("USDINR=X")
        usdinr_info = usdinr.info
        usd_inr_rate = usdinr_info.get('regularMarketPrice') or usdinr_info.get('previousClose')
        
        if not usd_inr_rate:
            hist = usdinr.history(period="1d")
            if not hist.empty:
                usd_inr_rate = hist['Close'].iloc[-1]
        
        if not usd_inr_rate:
            usd_inr_rate = 83.5  # Fallback rate
    except:
        usd_inr_rate = 83.5

    # Gold: COMEX Gold futures (GC=F) - price is per troy ounce in USD
    # 1 troy ounce = 31.1035 grams
    try:
        gold_ticker = yf.Ticker("GC=F")
        gold_info = gold_ticker.info
        gold_usd = gold_info.get('regularMarketPrice') or gold_info.get('previousClose')
        gold_prev_usd = gold_info.get('regularMarketPreviousClose') or gold_info.get('previousClose')
        
        if not gold_usd:
            hist = gold_ticker.history(period="2d")
            if len(hist) >= 2:
                gold_usd = hist['Close'].iloc[-1]
                gold_prev_usd = hist['Close'].iloc[-2]
            elif not hist.empty:
                gold_usd = hist['Close'].iloc[-1]
                gold_prev_usd = gold_usd

        if gold_usd and gold_prev_usd:
            # Convert per troy ounce USD -> per gram INR
            gold_per_gram = (gold_usd / 31.1035) * usd_inr_rate
            gold_prev_per_gram = (gold_prev_usd / 31.1035) * usd_inr_rate
            
            change = gold_per_gram - gold_prev_per_gram
            change_pct = (change / gold_prev_per_gram) * 100 if gold_prev_per_gram else 0
            
            results["Gold"] = {
                "value": f"₹{gold_per_gram:,.2f}",
                "change": f"{change:+,.2f}",
                "changePercent": f"{change_pct:+.2f}%",
                "isPositive": change >= 0
            }
    except:
        pass

    # Silver: COMEX Silver futures (SI=F) - price is per troy ounce in USD
    try:
        silver_ticker = yf.Ticker("SI=F")
        silver_info = silver_ticker.info
        silver_usd = silver_info.get('regularMarketPrice') or silver_info.get('previousClose')
        silver_prev_usd = silver_info.get('regularMarketPreviousClose') or silver_info.get('previousClose')
        
        if not silver_usd:
            hist = silver_ticker.history(period="2d")
            if len(hist) >= 2:
                silver_usd = hist['Close'].iloc[-1]
                silver_prev_usd = hist['Close'].iloc[-2]
            elif not hist.empty:
                silver_usd = hist['Close'].iloc[-1]
                silver_prev_usd = silver_usd

        if silver_usd and silver_prev_usd:
            # Convert per troy ounce USD -> per gram INR
            silver_per_gram = (silver_usd / 31.1035) * usd_inr_rate
            silver_prev_per_gram = (silver_prev_usd / 31.1035) * usd_inr_rate
            
            change = silver_per_gram - silver_prev_per_gram
            change_pct = (change / silver_prev_per_gram) * 100 if silver_prev_per_gram else 0
            
            results["Silver"] = {
                "value": f"₹{silver_per_gram:,.2f}",
                "change": f"{change:+,.2f}",
                "changePercent": f"{change_pct:+.2f}%",
                "isPositive": change >= 0
            }
    except:
        pass

    return results


# ── Main Script ──────────────────────────────────────────────────

results = {}

# 1. Fetch Nifty 50 and Sensex via yfinance (these work well)
index_tickers = {
    "Nifty 50": "^NSEI",
    "Sensex": "^BSESN",
}

for name, symbol in index_tickers.items():
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info

        price = info.get('currentPrice') or info.get('regularMarketPrice')
        prev_close = info.get('regularMarketPreviousClose')

        if not price or not prev_close:
            hist = ticker.history(period="2d")
            if len(hist) >= 2:
                price = hist['Close'].iloc[-1]
                prev_close = hist['Close'].iloc[-2]
            elif not hist.empty:
                price = hist['Close'].iloc[-1]
                prev_close = price

        if price and prev_close:
            change = price - prev_close
            change_percent = (change / prev_close) * 100 if prev_close != 0 else 0

            results[name] = {
                "value": f"{price:,.2f}",
                "change": f"{change:+,.2f}",
                "changePercent": f"{change_percent:+.2f}%",
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


# 2. Fetch Gold (1 gram, 24K) - Try web scraping first, then yfinance fallback
gold_today, gold_yesterday = fetch_gold_price_goodreturns()

if gold_today:
    if gold_yesterday:
        change = gold_today - gold_yesterday
        change_pct = (change / gold_yesterday) * 100 if gold_yesterday else 0
    else:
        change = 0
        change_pct = 0

    results["Gold"] = {
        "value": f"₹{gold_today:,.2f}",
        "change": f"{change:+,.2f}",
        "changePercent": f"{change_pct:+.2f}%",
        "isPositive": change >= 0
    }


# 3. Fetch Silver (1 gram) - Try web scraping first, then yfinance fallback
silver_today, silver_yesterday = fetch_silver_price_goodreturns()

if silver_today:
    if silver_yesterday:
        change = silver_today - silver_yesterday
        change_pct = (change / silver_yesterday) * 100 if silver_yesterday else 0
    else:
        change = 0
        change_pct = 0

    results["Silver"] = {
        "value": f"₹{silver_today:,.2f}",
        "change": f"{change:+,.2f}",
        "changePercent": f"{change_pct:+.2f}%",
        "isPositive": change >= 0
    }


# 4. If scraping didn't get gold/silver, use yfinance COMEX fallback
if "Gold" not in results or "Silver" not in results:
    yf_commodities = fetch_gold_silver_yfinance()
    
    if "Gold" not in results and "Gold" in yf_commodities:
        results["Gold"] = yf_commodities["Gold"]
    
    if "Silver" not in results and "Silver" in yf_commodities:
        results["Silver"] = yf_commodities["Silver"]


# 5. Final fallback - ensure both Gold and Silver exist
for commodity in ["Gold", "Silver"]:
    if commodity not in results:
        results[commodity] = {
            "value": "N/A",
            "change": "0.00",
            "changePercent": "0.00%",
            "isPositive": True
        }


print(json.dumps(results, indent=2))
sys.exit(0)
