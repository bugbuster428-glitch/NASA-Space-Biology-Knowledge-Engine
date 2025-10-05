import re
import google.generativeai as genai

# Configure Gemini
genai.configure(api_key="AIzaSyAWrtNjlgG2DKB4vR9sWiaFYO4nDPVTEZE")

# Try to load spaCy, but don't fail if not available
try:
    import spacy
    import pytextrank
    nlp = spacy.load("en_core_web_sm")
    nlp.add_pipe("textrank")
    print("✓ spaCy + PyTextRank loaded")
except:
    nlp = None
    print("⚠ spaCy not available - using simple extractive")

def preprocess_text(text):
    """Clean and preprocess scientific text"""
    # Remove repeated figure/table captions
    text = re.sub(r'(Figure \d+[^.]*\.?)\s*\1+', r'\1', text, flags=re.IGNORECASE)
    text = re.sub(r'(Table \d+[^.]*\.?)\s*\1+', r'\1', text, flags=re.IGNORECASE)
    
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove very short sentences (likely captions/headers)
    sentences = text.split('.')
    sentences = [s.strip() for s in sentences if len(s.strip()) > 30]
    
    return '. '.join(sentences) + '.'

def simple_extractive_summary(text, num_sentences=5):
    """Simple extractive: pick first meaningful sentences"""
    sentences = [s.strip() for s in text.split('.') if len(s.strip()) > 50]
    # Skip first sentence if it's too short (likely title)
    start_idx = 1 if len(sentences) > 0 and len(sentences[0]) < 100 else 0
    selected = sentences[start_idx:start_idx + num_sentences]
    return '. '.join(selected) + '.'

def extractive_summary(text, num_sentences=5):
    """Extract most important sentences"""
    if not nlp:
        return simple_extractive_summary(text, num_sentences)
    
    try:
        # Limit to 15000 chars for performance
        doc = nlp(text[:15000])
        summary = []
        for sent in doc._.textrank.summary(limit_sentences=num_sentences):
            summary.append(sent.text)
        result = " ".join(summary)
        return result if len(result) > 100 else simple_extractive_summary(text, num_sentences)
    except:
        return simple_extractive_summary(text, num_sentences)

def chunk_text(text, chunk_size=2500):
    """Split text into chunks for processing"""
    sentences = text.split('.')
    chunks = []
    current_chunk = ""
    
    for sentence in sentences:
        if len(current_chunk) + len(sentence) < chunk_size:
            current_chunk += sentence + "."
        else:
            if current_chunk:
                chunks.append(current_chunk)
            current_chunk = sentence + "."
    
    if current_chunk:
        chunks.append(current_chunk)
    
    return chunks[:3]  # Max 3 chunks

def abstractive_summary(extracted_text):
    """Generate human-friendly summary using Gemini with strict prompt"""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Chunk if too long
        if len(extracted_text) > 3000:
            chunks = chunk_text(extracted_text, 2500)
            summaries = []
            
            for i, chunk in enumerate(chunks):
                prompt = f"""You are an expert scientific assistant specializing in space biology research.
Summarize the following NASA research article excerpt in a clear, concise, and human-readable way.

Instructions:
1. Remove repeated sentences and irrelevant figure references (e.g., "Figure 1").
2. Keep scientific terms (like SF, SFV, GC) accurate.
3. Summarize key points only.
4. Limit the summary to 2-3 sentences.
5. Avoid adding any information that is not in the article.

Article excerpt:
{chunk}

Provide the final summary below:"""
                response = model.generate_content(prompt)
                if response and response.text:
                    summaries.append(response.text.strip())
            
            # Combine chunk summaries
            combined = " ".join(summaries)
            
            # Final pass to smooth it out
            final_prompt = f"""You are an expert scientific assistant specializing in space biology research.
Combine these summaries into one cohesive summary.

Instructions:
1. Keep all scientific facts accurate.
2. Remove any redundancy.
3. Limit to 3-5 sentences total.
4. Do NOT add new information.

Summaries:
{combined}

Provide the final combined summary below:"""
            final_response = model.generate_content(final_prompt)
            return final_response.text.strip() if final_response else combined
        
        else:
            # Single pass for shorter text
            prompt = f"""You are an expert scientific assistant specializing in space biology research.
Summarize the following NASA research article in a clear, concise, and human-readable way.

Instructions:
1. Remove repeated sentences and irrelevant figure references (e.g., "Figure 1").
2. Keep scientific terms (like SF, SFV, GC) accurate.
3. Summarize key points only.
4. Limit the summary to 3-5 sentences.
5. Avoid adding any information that is not in the article.

Article:
{extracted_text}

Provide the final summary below:"""
            
            response = model.generate_content(prompt)
            return response.text.strip() if response else extracted_text
            
    except Exception as e:
        print(f"Abstractive summary error: {e}")
        return extracted_text

def hybrid_summary(article_text):
    """Full hybrid pipeline with preprocessing"""
    print("🔹 Preprocessing text...")
    clean_text = preprocess_text(article_text)
    print(f"✓ Cleaned: {len(clean_text)} chars")
    
    print("🔹 Step 1: Extractive summarization...")
    extracted = extractive_summary(clean_text, num_sentences=6)
    print(f"✓ Extracted: {len(extracted)} chars")
    
    print("🔹 Step 2: Abstractive with Gemini...")
    final = abstractive_summary(extracted)
    print(f"✓ Final: {len(final)} chars")
    
    return {
        "extractive": extracted,
        "abstractive": final,
        "final": final
    }
