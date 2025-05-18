import urllib.error
import pandas as pd 
from bs4 import BeautifulSoup as bs 
import urllib.request


url = 'https://implicit.harvard.edu/implicit/Study?tid=1'
headers = {'User-Agent': 'Mozilla/5.0'}
req = urllib.request.Request(url, headers=headers) 

try: 
    page = urllib.request.urlopen(req,timeout=5) 
    content = page.read() 
    print(content)

except urllib.error.HTTPError as e: 
    print(f"HTTP error : {e.code} - {e.reason}") 
