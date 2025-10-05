import google.generativeai as genai

genai.configure(api_key="AIzaSyAWrtNjlgG2DKB4vR9sWiaFYO4nDPVTEZE")

print("Available models:")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(f"  - {m.name}")
