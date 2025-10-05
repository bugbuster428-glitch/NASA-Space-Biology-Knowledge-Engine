from utils.data_extractor import extract_numerical_data, extract_keywords_from_text

# Test with sample text
sample_text = """
The study included 45 mice in the flight group and 38 mice in the control group.
Body weight increased by 8% in the flight group compared to 4% in controls.
Survival rate was 53% for flight mice and 84% for ground control.
Gene expression showed: Gene A: 2.5 fold, Gene B: 3.8 fold, Gene C: 1.2 fold.
Statistical significance was found with p=0.001.
"""

print("Testing data extraction...")
result = extract_numerical_data(sample_text)
print(f"\nChart Type: {result['chartType']}")
print(f"Title: {result['title']}")
print(f"Unit: {result['unit']}")
print(f"Data: {result['data']}")

print("\n\nTesting keyword extraction...")
keywords = extract_keywords_from_text(sample_text)
print(f"Keywords: {keywords}")
