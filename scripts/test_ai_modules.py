import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_endpoint(name, url):
    print(f"\n--- Testing {name} ({url}) ---")
    try:
        response = requests.get(url)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            # Look for keys like 'insight', 'analysis'
            content = data.get("insight") or data.get("analysis")
            print(f"Response Head: {content[:100]}..." if content else "No content key found")
            
            if "(AI Generated)" in content:
                 print("⚠️  WARNING: Response looks like the fallback simulation.")
            else:
                 print("✅ SUCCESS: Response looks like real AI.")
        else:
            print(f"❌ Failed: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_endpoint("Dashboard Insights", f"{BASE_URL}/dashboard/ai-insights")
    test_endpoint("Forecasting Analysis", f"{BASE_URL}/forecasting/ai-analysis")
    test_endpoint("Alerts Analysis", f"{BASE_URL}/alerts/ai-analysis")
