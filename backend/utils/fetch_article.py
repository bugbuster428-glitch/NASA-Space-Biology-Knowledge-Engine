import requests
from bs4 import BeautifulSoup
from .fetch_article_selenium import fetch_article_html
def fetch_article_content(url):
    """
    Fetch full article content from a given URL as HTML.
    """
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        # Grab all <p> tags as main content
        paragraphs = soup.find_all("p")
        if not paragraphs:
            return "<p>Full article content not found.</p>"

        content_html = "".join([f"<p>{p.get_text()}</p>" for p in paragraphs])
        return content_html

    except Exception as e:
        return f"<p>Error fetching article: {e}</p>"