from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from bs4 import BeautifulSoup
import time
import random
import re

def fetch_article_html(url):
    """
    Fetch main article content with images using Selenium
    """
    try:
        # Setup Chrome options - OPTIMIZED FOR SPEED
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--disable-images")  # Faster loading
        chrome_options.add_argument("--disable-javascript")  # Faster for static content
        chrome_options.add_argument("--blink-settings=imagesEnabled=false")  # No images
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        # Disable loading of images, CSS, and other resources
        prefs = {"profile.managed_default_content_settings.images": 2}
        chrome_options.add_experimental_option("prefs", prefs)
        
        # Create WebDriver
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        
        # Hide webdriver property
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        try:
            # Navigate to URL
            driver.get(url)
            
            # Shorter wait for faster loading
            WebDriverWait(driver, 8).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Minimal wait
            time.sleep(1)
            
            # Remove unwanted elements using JavaScript (minimal cleanup)
            driver.execute_script("""
                // Remove only specific unwanted elements
                var unwantedSelectors = [
                    '.advertisement', '.ads', '.social-share', '.comments'
                ];
                
                unwantedSelectors.forEach(function(selector) {
                    var elements = document.querySelectorAll(selector);
                    elements.forEach(function(el) { el.remove(); });
                });
            """)
            
            # Get page source after cleanup
            page_source = driver.page_source
            
            # Parse with BeautifulSoup
            soup = BeautifulSoup(page_source, 'html.parser')
            
            # Extract main content
            content_html = extract_main_content_selenium(soup, url)
            
            return {"content": content_html, "tables": []}
            
        finally:
            driver.quit()
            
    except Exception as e:
        return {"content": f"<p>Error with Selenium: {str(e)}</p>", "tables": []}

def extract_main_content_selenium(soup, base_url):
    """
    Extract main content with images from Selenium-processed HTML
    """
    # PMC and general article selectors
    main_selectors = [
        'article',
        'div.article',
        'div.pmc-articlecontent',
        'div.article-body',
        'div.tsec',
        'div.sec', 
        'div.article-content',
        'main',
        'div.content',
        'div.main-content',
        'div.entry-content',
        '[role="main"]'
    ]
    
    main_content = None
    for selector in main_selectors:
        main_content = soup.select_one(selector)
        if main_content and len(main_content.find_all('p')) > 2:
            break
    
    # Fallback: find div with most content
    if not main_content:
        content_divs = soup.find_all('div')
        if content_divs:
            main_content = max(content_divs, key=lambda div: len(div.get_text()))
    
    if not main_content:
        return "<p>Could not identify main content area.</p>"
    
    # Process content elements
    content_html = ""
    processed_elements = set()
    
    # Get all relevant elements in document order
    for element in main_content.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'img', 'figure', 'ul', 'ol', 'table', 'blockquote', 'div']):
        
        # Skip if already processed (avoid duplicates)
        element_id = id(element)
        if element_id in processed_elements:
            continue
        processed_elements.add(element_id)
        
        # Process different element types
        if element.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            text = element.get_text().strip()
            if text and len(text) > 2 and not is_unwanted_text(text):
                content_html += f"<{element.name} style='color: #333; margin: 20px 0 10px 0;'>{text}</{element.name}>"
        
        elif element.name == 'p':
            text = element.get_text().strip()
            if text and len(text) > 20 and not is_unwanted_text(text):
                content_html += f"<p style='line-height: 1.6; margin: 15px 0;'>{text}</p>"
        
        elif element.name == 'img':
            img_html = process_image_selenium(element, base_url)
            if img_html:
                content_html += img_html
        
        elif element.name == 'figure':
            figure_html = process_figure_selenium(element, base_url)
            if figure_html:
                content_html += figure_html
        
        elif element.name == 'table':
            table_html = process_table_selenium(element)
            if table_html:
                content_html += table_html
        
        elif element.name in ['ul', 'ol']:
            list_items = element.find_all('li')
            if list_items:
                content_html += f"<{element.name} style='margin: 15px 0; padding-left: 30px;'>"
                for li in list_items:
                    text = li.get_text().strip()
                    if text and not is_unwanted_text(text):
                        content_html += f"<li style='margin: 5px 0;'>{text}</li>"
                content_html += f"</{element.name}>"
        
        elif element.name == 'blockquote':
            text = element.get_text().strip()
            if text and len(text) > 20:
                content_html += f"<blockquote style='border-left: 4px solid #ccc; padding-left: 20px; margin: 20px 0; font-style: italic;'>{text}</blockquote>"
        
        elif element.name == 'div':
            # Check for PMC figure containers
            if 'fig' in element.get('class', []) or 'table-wrap' in element.get('class', []):
                img = element.find('img')
                if img:
                    img_html = process_image_selenium(img, base_url)
                    if img_html:
                        caption = element.find(['figcaption', 'caption', 'div'], class_=['caption', 'fig-caption'])
                        caption_text = caption.get_text().strip() if caption else ""
                        if caption_text:
                            content_html += f'<figure style="margin: 25px 0;">{img_html}<figcaption style="font-size: 0.9em; color: #555; margin-top: 10px;">{caption_text}</figcaption></figure>'
                        else:
                            content_html += img_html
                
                table = element.find('table')
                if table:
                    table_html = process_table_selenium(table)
                    if table_html:
                        content_html += table_html
    
    return content_html if content_html else "<p>No readable content found.</p>"

def process_image_selenium(img_element, base_url):
    """
    Process image with proper URL handling
    """
    src = img_element.get('src') or img_element.get('data-src')
    if not src:
        return ""
    
    # Handle relative URLs
    if src.startswith('//'):
        src = 'https:' + src
    elif src.startswith('/'):
        from urllib.parse import urljoin
        src = urljoin(base_url, src)
    
    # Skip tiny images (likely icons/decorations)
    width = img_element.get('width')
    height = img_element.get('height')
    if width and height:
        try:
            if int(width) < 50 or int(height) < 50:
                return ""
        except:
            pass
    
    alt = img_element.get('alt', '')
    title = img_element.get('title', alt)
    
    return f'''
    <div style="text-align: center; margin: 20px 0;">
        <img src="{src}" alt="{alt}" title="{title}" 
             style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        {f'<p style="font-size: 0.9em; color: #666; margin-top: 8px; font-style: italic;">{alt}</p>' if alt else ''}
    </div>
    '''

def process_figure_selenium(figure_element, base_url):
    """
    Process figure element with caption
    """
    img = figure_element.find('img')
    if not img:
        return ""
    
    img_html = process_image_selenium(img, base_url)
    if not img_html:
        return ""
    
    # Look for caption
    caption = figure_element.find(['figcaption', 'caption', '.caption'])
    caption_text = caption.get_text().strip() if caption else ""
    
    if caption_text:
        return f'''
        <figure style="margin: 25px 0; text-align: center;">
            {img_html}
            <figcaption style="font-size: 0.9em; color: #555; margin-top: 10px; font-style: italic; max-width: 80%; margin-left: auto; margin-right: auto;">
                {caption_text}
            </figcaption>
        </figure>
        '''
    else:
        return f'<figure style="margin: 25px 0;">{img_html}</figure>'

def process_table_selenium(table_element):
    """
    Process table element
    """
    try:
        html = "<div style='overflow-x: auto; margin: 20px 0;'><table style='border-collapse: collapse; width: 100%; border: 1px solid #ddd;'>"
        
        # Process headers
        headers = table_element.find_all('th')
        if headers:
            html += "<thead style='background-color: #f3f4f6;'><tr>"
            for th in headers:
                text = th.get_text().strip()
                html += f"<th style='border: 1px solid #ddd; padding: 12px; text-align: left;'>{text}</th>"
            html += "</tr></thead>"
        
        # Process rows
        html += "<tbody>"
        rows = table_element.find_all('tr')
        for row in rows:
            cells = row.find_all('td')
            if cells:
                html += "<tr>"
                for td in cells:
                    text = td.get_text().strip()
                    html += f"<td style='border: 1px solid #ddd; padding: 12px;'>{text}</td>"
                html += "</tr>"
        html += "</tbody></table></div>"
        
        return html
    except:
        return ""

def is_unwanted_text(text):
    """
    Check if text is likely navigation, ads, or other unwanted content
    """
    unwanted_patterns = [
        r'cookie', r'privacy policy', r'terms of service', r'subscribe', 
        r'newsletter', r'advertisement', r'sponsored', r'related articles',
        r'share this', r'follow us', r'social media', r'navigation',
        r'menu', r'search', r'login', r'register', r'copyright',
        r'all rights reserved', r'contact us', r'about us'
    ]
    
    text_lower = text.lower()
    return any(re.search(pattern, text_lower) for pattern in unwanted_patterns) or len(text) < 10