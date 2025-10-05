from .fetch_article_selenium import fetch_article_html
from .fetch_article_requests import fetch_article_with_requests

def fetch_article_content(url):
    """
    Smart fetching: Use Selenium for PMC articles to get images/tables
    """
    # PMC articles need Selenium for proper image/table extraction
    if 'ncbi.nlm.nih.gov/pmc' in url:
        try:
            return fetch_article_html(url)
        except Exception as e:
            return {"content": f"<p>Error fetching article: {e}</p>", "tables": []}
    
    # For other sites, try requests first
    try:
        result = fetch_article_with_requests(url)
        if isinstance(result, dict):
            content = result.get("content", "")
            if content and "could not be extracted" not in content.lower() and "error fetching" not in content.lower() and len(content) > 500:
                return result
    except:
        pass

    # Fallback to Selenium
    try:
        return fetch_article_html(url)
    except Exception as e:
        return {"content": f"<p>Error fetching article: {e}</p>", "tables": []}
