import requests
from bs4 import BeautifulSoup

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

# Try GoodReturns
try:
    r = requests.get('https://www.goodreturns.in/gold-rates/', headers=headers, timeout=10)
    print(f'GoodReturns Gold status: {r.status_code}')
    if r.status_code == 200:
        soup = BeautifulSoup(r.text, 'html.parser')
        tables = soup.find_all('table')
        print(f'Found {len(tables)} tables')
        for i, t in enumerate(tables[:3]):
            print(f'\nTable {i}:')
            rows = t.find_all('tr')
            for row in rows[:5]:
                cells = row.find_all(['td', 'th'])
                print(' | '.join(c.get_text(strip=True) for c in cells))
except Exception as e:
    print(f'GoodReturns error: {e}')

print('\n---\n')

# Try silver
try:
    r = requests.get('https://www.goodreturns.in/silver-rates/', headers=headers, timeout=10)
    print(f'GoodReturns Silver status: {r.status_code}')
    if r.status_code == 200:
        soup = BeautifulSoup(r.text, 'html.parser')
        tables = soup.find_all('table')
        print(f'Found {len(tables)} tables')
        for i, t in enumerate(tables[:3]):
            print(f'\nTable {i}:')
            rows = t.find_all('tr')
            for row in rows[:5]:
                cells = row.find_all(['td', 'th'])
                print(' | '.join(c.get_text(strip=True) for c in cells))
except Exception as e:
    print(f'GoodReturns error: {e}')
