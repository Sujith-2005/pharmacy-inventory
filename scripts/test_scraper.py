import httpx
import re
import asyncio

async def test_1mg(query):
    print(f"\n--- Testing 1mg Search for '{query}' ---")
    url = f"https://www.1mg.com/search/all?name={query}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    try:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            resp = await client.get(url, headers=headers)
            print(f"Status: {resp.status_code}")
            
            if resp.status_code == 200:
                # Debug: Print title and part of body
                title = re.search(r'<title>(.*?)</title>', html)
                print(f"Page Title: {title.group(1) if title else 'No Title'}")
                print(f"HTML Snippet: {html[:500]}")
                
                # Check for common simple price formatting
                prices = re.findall(r'₹\s*([\d,]+)', html)
                if not prices:
                    # Try looking for "MRP" pattern
                    prices = re.findall(r'MRP\s*₹\s*([\d,]+)', html)
                    
                print(f"Found {len(prices)} prices: {prices[:5]}")

    except Exception as e:
        print(f"Error 1mg: {e}")

async def test_netmeds(query):
    print(f"\n--- Testing Netmeds Search for '{query}' ---")
    url = f"https://www.netmeds.com/catalogsearch/result/{query}/all"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    try:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            resp = await client.get(url, headers=headers)
            print(f"Status: {resp.status_code}")
            if resp.status_code == 200:
                html = resp.text
                print(f"HTML Snippet: {html[:200]}")
                # Netmeds often puts price in JSON data
                prices = re.findall(r'"price":\s*(\d+)', html)
                print(f"Found {len(prices)} prices: {prices[:5]}")
    except Exception as e:
        print(f"Error Netmeds: {e}")

if __name__ == "__main__":
    asyncio.run(test_1mg("Dolo 650"))
    asyncio.run(test_netmeds("Dolo 650"))
