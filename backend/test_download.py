
import requests
import sys

# Configuration
BASE_URL = "http://localhost:8002"
DOWNLOAD_URL = f"{BASE_URL}/api/inventory/download-template?format=excel"
HEADERS = {} # Add auth if needed, but download-template appears open or we can test auth failure separately.
# Wait, inventory.py usually requires auth for uploads, let's check downloads.
# @router.get("/download-template") -> no Depends(active_user) in signature shown in snippet?
# Let's check snippet.
# Step 672 snippet:
# @router.get("/download-template")
# async def download_template(format: str = "excel"):
# No Depends! So it's public. Good.

def test_download():
    print(f"Testing download from {DOWNLOAD_URL}...")
    try:
        resp = requests.get(DOWNLOAD_URL, timeout=10)
        print(f"Status Code: {resp.status_code}")
        if resp.status_code == 200:
            print(f"Content-Type: {resp.headers.get('Content-Type')}")
            print(f"Content Length: {len(resp.content)}")
            print("Download SUCCESS")
        else:
            print(f"Download FAILED: {resp.text}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_download()
