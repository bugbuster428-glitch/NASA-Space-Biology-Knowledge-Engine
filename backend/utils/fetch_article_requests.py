import requests
from bs4 import BeautifulSoup
import time
import random

def fetch_article_with_requests(url):
    """
    Alternative method using requests with proper headers
    """
    try:
        # Headers to mimic a real browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
        
        # Add random delay
        time.sleep(random.uniform(1, 3))
        
        # Make request
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove unwanted elements
        for element in soup(['script', 'style', 'nav', 'header', 'footer', 'aside']):
            element.decompose()
        
        content_html = ""
        
        # PMC-specific extraction
        content_selectors = [
            'div.tsec',
            'div.sec', 
            'div.article-content',
            'div.pmc-articlecontent',
            'div.article-body',
            'div.main-content',
            'article',
            'div.content'
        ]
        
        for selector in content_selectors:
            elements = soup.select(selector)
            if elements:
                for element in elements:
                    paragraphs = element.find_all('p')
                    for p in paragraphs:
                        text = p.get_text().strip()
                        if text and len(text) > 30:
                            content_html += f"<p>{text}</p>"
                if content_html:
                    break
        
        # Fallback: get all paragraphs
        if not content_html:
            paragraphs = soup.find_all('p')
            for p in paragraphs:
                text = p.get_text().strip()
                if text and len(text) > 30:
                    content_html += f"<p>{text}</p>"
        
        if not content_html:
            content_html = "<p>Article content could not be extracted. Please visit the original link.</p>"
        
        return {"content": content_html, "tables": []}
        
    except Exception as e:
        return {"content": f"<p>Error fetching article: {str(e)}</p>", "tables": []}