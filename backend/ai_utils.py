from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import re

genai.configure(api_key="AIzaSyAWrtNjlgG2DKB4vR9sWiaFYO4nDPVTEZE")

router = APIRouter()

class ArticleText(BaseModel):
    text: str

class ArticleContent(BaseModel):
    title: str
    content: str

@router.post("/summarize")
async def summarize_article(article: ArticleText):
    try:
        model = genai.GenerativeModel('gemini-1.5-pro')
        prompt = f"Summarize this NASA space biology research article in 2-3 sentences:\n\n{article.text[:3000]}"
        response = model.generate_content(prompt)
        return {"summary": response.text}
    except Exception as e:
        print(f"Error: {e}")
        return {"summary": "AI summarization temporarily unavailable."}

@router.post("/structured-summary")
async def structured_summary(article: ArticleContent):
    try:
        model = genai.GenerativeModel('gemini-1.5-pro')
        prompt = f"""Analyze this NASA space biology research article and provide a structured summary:

Title: {article.title}

Content:
{article.content[:4000]}

Provide the following sections:
- Objective: (1-2 sentences)
- Methods: (2-3 sentences)
- Key Results: (3-4 bullet points)
- Conclusions: (1-2 sentences)
"""
        response = model.generate_content(prompt)
        return {"structured_summary": response.text}
    except Exception as e:
        print(f"Error: {e}")
        return {"structured_summary": "AI analysis temporarily unavailable."}

@router.post("/keywords")
async def extract_keywords(article: ArticleText):
    try:
        model = genai.GenerativeModel('gemini-1.5-pro')
        prompt = f"Extract 8 key scientific terms from this text, comma separated:\n\n{article.text[:3000]}"
        response = model.generate_content(prompt)
        keywords = [kw.strip() for kw in response.text.split(',')]
        return {"keywords": keywords[:8]}
    except Exception as e:
        print(f"Error: {e}")
        return {"keywords": ["space biology", "microgravity", "NASA research", "biological systems"]}

@router.post("/extract-data")
async def extract_numerical_data(article: ArticleContent):
    try:
        model = genai.GenerativeModel('gemini-1.5-pro')
        prompt = f"""Extract numerical data from this article that can be visualized in charts.
Return as JSON format with labels and values.

Title: {article.title}
Content: {article.content[:3000]}

Example format:
{{
  "datasets": [
    {{"label": "Gene Expression", "data": [1.2, 2.3, 3.4], "labels": ["Gene A", "Gene B", "Gene C"]}}
  ]
}}
"""
        response = model.generate_content(prompt)
        return {"chart_data": response.text}
    except Exception as e:
        print(f"Error: {e}")
        return {"chart_data": None}

@router.post("/test-gemini")
async def test_gemini():
    """Test if Gemini API is working"""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Say 'Hello, Gemini is working!' in one sentence.")
        return {"status": "success", "response": response.text}
    except Exception as e:
        return {"status": "error", "error": str(e)}

@router.post("/chat")
async def chat_with_article(request: dict):
    """Chat with AI about the article content using Gemini - RESTRICTED to article content only"""
    try:
        question = request.get('question', '')
        article_content = request.get('article_content', '')
        article_title = request.get('article_title', '')
        
        # Check if question is about summary/analysis - be very strict
        question_lower = question.lower().strip()
        summary_keywords = ['summar', 'summery', 'overview', 'brief', 'short form', 'key point', 'main finding', 'tldr', 'abstract']
        is_summary_question = any(keyword in question_lower for keyword in summary_keywords)
        
        # If asking for summary, return button message instead of generating summary
        if is_summary_question:
            print(f"SUMMARY QUESTION DETECTED: {question}")
            return {
                "answer": "I can provide you with a comprehensive AI-generated summary with visualizations and detailed analysis. Click the button below to view it.",
                "show_summary_button": True
            }
        
        print(f"REGULAR QUESTION: {question}")
        
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""You are an AI assistant that ONLY answers questions about the provided research article. You must follow these strict rules:

1. ONLY provide information that is explicitly mentioned in the article below
2. If the question is about topics NOT covered in this article, respond: "I can only answer questions about this specific article. Please ask about the research, methods, findings, or conclusions presented here."
3. Do NOT provide general knowledge, external information, or content from other sources
4. Do NOT answer questions unrelated to this article's content
5. Keep responses focused, accurate, and based solely on the article text

Article Title: {article_title}

Article Content:
{article_content[:8000]}

User Question: {question}

Answer based ONLY on the article above:"""
        
        response = model.generate_content(prompt)
        return {"answer": response.text, "show_summary_button": False}
    except Exception as e:
        print(f"Chat error: {e}")
        return {"answer": "I'm having trouble processing your question right now. Please try again.", "show_summary_button": False}

@router.post("/comprehensive-summary")
async def comprehensive_summary(article: ArticleContent):
    """Generate AI summary using HYBRID approach (spaCy → Gemini) + extract data using regex"""
    print(f"\n=== COMPREHENSIVE SUMMARY REQUEST (HYBRID) ===")
    print(f"Title: {article.title[:50]}...")
    print(f"Content length: {len(article.content)}")
    
    try:
        from utils.data_extractor import extract_numerical_data, extract_keywords_from_text
        print("✓ Imports successful")
        
        # Step 1: Extract REAL numerical data using regex
        print("Step 1: Extracting numerical data...")
        chart_info = extract_numerical_data(article.content)
        print(f"✓ Found {len(chart_info.get('data', []))} data points")
        
        # Step 2: Clean text first
        print("Step 2: Cleaning article text...")
        import re
        
        # Aggressive cleaning - remove ALL metadata and junk
        clean_text = re.sub(r'<[^>]+>', ' ', article.content)
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
        
        # Remove everything before Introduction/Abstract
        intro_start = re.search(r'(?:Abstract|ABSTRACT|Introduction|INTRODUCTION|1\.\s+Introduction)', clean_text)
        if intro_start:
            clean_text = clean_text[intro_start.start():]
        
        # Remove metadata blocks
        clean_text = re.sub(r'View in NLM Catalog.*?(?=Abstract|Introduction|\d+\.)', '', clean_text, flags=re.DOTALL | re.IGNORECASE)
        clean_text = re.sub(r'Author information.*?(?=Abstract|Introduction|\d+\.)', '', clean_text, flags=re.DOTALL | re.IGNORECASE)
        clean_text = re.sub(r'Article notes.*?(?=Abstract|Introduction|\d+\.)', '', clean_text, flags=re.DOTALL | re.IGNORECASE)
        clean_text = re.sub(r'Received:?\s*\d{4}.*?Published:?\s*\d{4}', '', clean_text, flags=re.DOTALL)
        clean_text = re.sub(r'Competing Interests:.*?(?=\d+\.|[A-Z][a-z]+\s+[a-z])', '', clean_text, flags=re.DOTALL)
        clean_text = re.sub(r'\*\s*E-mail:.*?(?=\d+\.|[A-Z])', '', clean_text, flags=re.DOTALL)
        
        # Remove isolated keywords (single words on their own lines)
        clean_text = re.sub(r'\b(bone|pubmed|spaceflight|google|scholar|ground|doi|pmc|ncbi)\b(?!\s+\w+)', '', clean_text, flags=re.IGNORECASE)
        
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
        print(f"Cleaned text length: {len(clean_text)}")
        print(f"First 500 chars: {clean_text[:500]}")
        
        # Step 3: Extract keywords
        print("Step 3: Extracting keywords...")
        try:
            kw_model = genai.GenerativeModel('gemini-2.5-flash')
            kw_prompt = f"Extract 6 key scientific terms from this space biology article. Return only comma-separated terms: {article.title}\n{clean_text[:2000]}"
            kw_response = kw_model.generate_content(kw_prompt)
            if kw_response and hasattr(kw_response, 'text'):
                keywords = [k.strip() for k in kw_response.text.strip().split(',')][:8]
                print(f"✓ Keywords: {keywords}")
            else:
                raise Exception("Invalid response")
        except Exception as kw_error:
            print(f"⚠ Keyword AI failed: {kw_error}")
            keywords = extract_keywords_from_text(article.content)
            print(f"✓ Fallback keywords: {keywords}")
        
        # Step 4: Generate PROFESSIONAL summary using Gemini AI
        print("Step 4: Generating professional summary with Gemini AI...")
        summary = None
        
        # Try Gemini with simple, direct prompt
        try:
            print("Attempting Gemini summary generation...")
            model = genai.GenerativeModel('gemini-2.5-flash')
            
            prompt = f"""Summarize this NASA space biology research article in 5-6 detailed paragraphs for scientists:

Title: {article.title}

Article:
{clean_text[:10000]}

Include:
1. Research objective and why it matters for space missions
2. Experimental methods and subjects used
3. Key findings with specific data and measurements
4. Biological mechanisms discovered
5. Implications for astronaut health
6. Conclusions and future research needs

Write clearly and professionally."""
            
            response = model.generate_content(prompt)
            
            if response and hasattr(response, 'text'):
                summary = response.text.strip()
                summary = re.sub(r'\*\*([^*]+)\*\*', r'\1', summary)
                summary = re.sub(r'\*([^*]+)\*', r'\1', summary)
                print(f"✓ Gemini generated {len(summary)} chars")
                print(f"Preview: {summary[:200]}...")
            else:
                print("⚠ Gemini response invalid")
                summary = None
                
        except Exception as ai_error:
            print(f"⚠ Gemini failed: {ai_error}")
            import traceback
            traceback.print_exc()
            summary = None
        
        # If Gemini failed, use text extraction
        if not summary or len(summary) < 200:
            print("⚠ Using text extraction fallback")
            abstract_match = re.search(r'(?:Abstract|ABSTRACT)[:\s]+(.*?)(?=Introduction|INTRODUCTION|Keywords|1\.)', clean_text, re.DOTALL | re.IGNORECASE)
            if abstract_match:
                summary = abstract_match.group(1).strip()
            else:
                sentences = [s.strip() + '.' for s in clean_text.split('.') if len(s.strip()) > 80]
                summary = ' '.join(sentences[:10]) if sentences else "This article presents research findings from NASA's Space Biology program."
            
            if len(summary) > 2500:
                summary = summary[:2500] + "..."
            print(f"Fallback summary: {len(summary)} chars")
        
        # Step 5: Extract metadata using Gemini AI from ORIGINAL content
        print("Step 5: Extracting metadata with Gemini AI...")
        metadata = extract_metadata_with_ai(article.content[:5000], article.title)
        print(f"✓ Metadata extracted: {list(metadata.keys())}")
        
        result = {
            "summary": summary,
            "keywords": keywords,
            "chartData": chart_info,
            "metadata": metadata
        }
        print(f"✓ SUCCESS - Returning result")
        print(f"Summary length: {len(result['summary'])} chars")
        print(f"Keywords: {result['keywords']}")
        print(f"Metadata fields: {list(result['metadata'].keys())}")
        print(f"=== END ===")
        return result
        
    except Exception as e:
        print(f"\n✗ OUTER ERROR: {e}")
        import traceback
        traceback.print_exc()
        print(f"=== END (ERROR) ===\n")
        
        # Try to at least extract first paragraph as fallback
        try:
            import re
            clean_text = re.sub(r'<[^>]+>', ' ', article.content)
            clean_text = re.sub(r'\s+', ' ', clean_text).strip()
            paragraphs = [p.strip() for p in clean_text.split('.') if len(p.strip()) > 100]
            fallback_summary = (paragraphs[0] + "." if paragraphs else clean_text[:500]) if clean_text else "This article presents research findings from NASA's Space Biology program."
        except:
            fallback_summary = "This article presents research findings from NASA's Space Biology program."
            
        return {
            "summary": fallback_summary,
            "keywords": ["space", "biology", "research"],
            "chartData": {
                "chartType": "bar",
                "title": "No Data Found",
                "data": [],
                "unit": ""
            },
            "metadata": {}
        }

def extract_metadata_with_ai(text, title):
    """Extract structured metadata - use regex only for reliability"""
    print("Extracting metadata with regex...")
    return extract_metadata_regex(text)

def extract_metadata_regex(text):
    """Fallback regex-based metadata extraction"""
    metadata = {}
    
    received_match = re.search(r'Received:?\s*(\d{4}\s+[A-Za-z]+\s+\d{1,2})', text, re.IGNORECASE)
    if received_match:
        metadata['received'] = received_match.group(1).strip()
    
    accepted_match = re.search(r'Accepted:?\s*(\d{4}\s+[A-Za-z]+\s+\d{1,2})', text, re.IGNORECASE)
    if accepted_match:
        metadata['accepted'] = accepted_match.group(1).strip()
    
    published_match = re.search(r'(?:Published|Collection date):?\s*(\d{4})', text, re.IGNORECASE)
    if published_match:
        metadata['published'] = published_match.group(1).strip()
    
    competing_match = re.search(r'Competing Interests:?\s*([^.]+)', text, re.IGNORECASE)
    if competing_match:
        metadata['competing_interests'] = competing_match.group(1).strip()
    
    return metadata
