import re
from collections import Counter

def extract_numerical_data(text):
    """Extract real numerical data from article text using regex"""
    
    # Remove HTML tags
    clean_text = re.sub(r'<[^>]+>', ' ', text)
    
    # Pattern 1: Extract percentages (e.g., "45%", "23.5%")
    percentages = re.findall(r'(\w+[\w\s]*?):\s*(\d+\.?\d*)\s*%', clean_text)
    
    # Pattern 2: Extract measurements with units (e.g., "body weight: 25.5 g", "n=30")
    measurements = re.findall(r'(\w+[\w\s]*?):\s*(\d+\.?\d*)\s*([a-zA-Z]+)', clean_text)
    
    # Pattern 3: Extract sample sizes (n=X, N=X)
    sample_sizes = re.findall(r'[nN]\s*=\s*(\d+)', clean_text)
    
    # Pattern 4: Extract p-values
    p_values = re.findall(r'p\s*[<>=]\s*(\d+\.?\d*)', clean_text)
    
    # Pattern 5: Extract group comparisons (e.g., "Flight: 25, Control: 30")
    group_data = re.findall(r'(\w+[\w\s]*?)\s*(?:group|mice|subjects)?\s*[:\(]\s*(\d+\.?\d*)', clean_text, re.IGNORECASE)
    
    # Pattern 6: Extract table-like data (numbers in parentheses or with ±)
    table_data = re.findall(r'(\w+[\w\s]{0,30}?)\s+(\d+\.?\d*)\s*±\s*(\d+\.?\d*)', clean_text)
    
    # Determine best chart type and data
    chart_data = None
    chart_type = "bar"
    title = "Data Visualization"
    unit = ""
    
    # Priority 1: Percentages (use pie chart)
    if percentages and len(percentages) >= 2:
        chart_type = "pie"
        title = "Distribution"
        unit = "%"
        chart_data = [{"label": label.strip(), "value": float(val)} for label, val in percentages[:6]]
    
    # Priority 2: Group comparisons (use bar chart)
    elif group_data and len(group_data) >= 2:
        # Filter for meaningful groups
        filtered = [(label.strip(), float(val)) for label, val in group_data 
                   if len(label.strip()) > 2 and float(val) > 0]
        if filtered:
            chart_type = "bar"
            title = "Group Comparison"
            chart_data = [{"label": label, "value": val} for label, val in filtered[:8]]
    
    # Priority 3: Measurements with units
    elif measurements and len(measurements) >= 2:
        chart_type = "bar"
        title = "Measurements"
        unit = measurements[0][2] if measurements else ""
        chart_data = [{"label": label.strip(), "value": float(val)} 
                     for label, val, u in measurements[:6] if float(val) > 0]
    
    # Priority 4: Table data with error bars
    elif table_data and len(table_data) >= 2:
        chart_type = "bar"
        title = "Experimental Results"
        chart_data = [{"label": label.strip(), "value": float(mean)} 
                     for label, mean, std in table_data[:6]]
    
    # Priority 5: Sample sizes
    elif sample_sizes and len(sample_sizes) >= 2:
        chart_type = "bar"
        title = "Sample Sizes"
        unit = "count"
        chart_data = [{"label": f"Group {i+1}", "value": int(n)} 
                     for i, n in enumerate(sample_sizes[:6])]
    
    # Fallback: Extract any numbers with context
    if not chart_data:
        # Find sentences with numbers
        sentences_with_numbers = re.findall(r'([^.!?]*\d+\.?\d*[^.!?]*[.!?])', clean_text)
        if sentences_with_numbers:
            # Extract first few numbers as fallback
            numbers = re.findall(r'(\d+\.?\d+)', ' '.join(sentences_with_numbers[:10]))
            if len(numbers) >= 2:
                chart_data = [{"label": f"Value {i+1}", "value": float(n)} 
                             for i, n in enumerate(numbers[:6])]
                title = "Key Values"
    
    return {
        "chartType": chart_type,
        "title": title,
        "data": chart_data or [],
        "unit": unit
    }

def extract_keywords_from_text(text):
    """Extract keywords using frequency analysis"""
    # Remove HTML and special chars
    clean_text = re.sub(r'<[^>]+>', ' ', text)
    clean_text = re.sub(r'[^\w\s]', ' ', clean_text)
    
    # Common stop words
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'were', 'been', 'be',
                  'this', 'that', 'these', 'those', 'are', 'has', 'have', 'had'}
    
    # Extract words (2+ chars)
    words = [w.lower() for w in clean_text.split() if len(w) > 2 and w.lower() not in stop_words]
    
    # Get most common
    word_freq = Counter(words)
    keywords = [word for word, count in word_freq.most_common(10) if count > 2]
    
    return keywords[:6] if keywords else ["space", "biology", "research"]
