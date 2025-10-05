from utils.fetch_article_selenium import fetch_article_html

url = "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4136787/"
print(f"Testing URL: {url}")
result = fetch_article_html(url)
content = result.get("content", "")
print(f"\nContent length: {len(content)}")
print(f"Has <img: {'<img' in content}")
print(f"Has <table: {'<table' in content}")
print(f"Has <figure: {'<figure' in content}")
print(f"\nFull content:\n{content}")
