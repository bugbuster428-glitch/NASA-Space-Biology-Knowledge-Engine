from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import csv
import os
import httpx
import asyncio
from bs4 import BeautifulSoup
from utils.fetch_article_content import fetch_article_content
from ai_utils import router as ai_router

app = FastAPI(title="NASA Space Biology API")

# Cache for article content
article_cache = {}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_router, prefix="/ai")

def load_articles():
    articles = []
    try:
        with open("SB_publication_PMC.csv", "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                articles.append({
                    "title": row["Title"],
                    "link": row["Link"]
                })
        return articles
    except Exception as e:
        print(f"Error loading CSV: {e}")
        return []

@app.get("/")
def read_root():
    return {"message": "NASA Space Biology API"}

@app.get("/api/test")
def test_endpoint():
    return {"status": "Backend is running", "endpoints": ["/api/datasets", "/api/dataset/{id}", "/api/articles"]}

@app.get("/articles")
def get_articles():
    articles = load_articles()
    return [{"id": idx, "title": a["title"], "link": a["link"]} for idx, a in enumerate(articles)]

@app.get("/articles/{article_id}")
def get_article_content(article_id: int):
    try:
        articles = load_articles()
        if article_id < 0 or article_id >= len(articles):
            raise HTTPException(status_code=404, detail="Article not found")
        
        article = articles[article_id]
        
        # Check cache first
        if article_id in article_cache:
            print(f"✓ Serving cached article: {article['title']}")
            return article_cache[article_id]
        
        print(f"Fetching article: {article['title']}")
        print(f"URL: {article['link']}")
        
        result = fetch_article_content(article["link"])
        
        # Handle both string and dict responses
        if isinstance(result, dict):
            content = result.get("content", "")
            tables = result.get("tables", [])
        else:
            content = result
            tables = []
        
        response = {
            "id": article_id,
            "title": article["title"],
            "link": article["link"],
            "content": content,
            "tables": tables
        }
        
        # Cache the result
        article_cache[article_id] = response
        print(f"✓ Cached article {article_id}")
        
        return response
    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "id": article_id,
            "title": "Error",
            "link": "",
            "content": f"<p>Error fetching content: {str(e)}</p>",
            "tables": []
        }

@app.get("/api/dataset/{dataset_id}")
async def get_dataset(dataset_id: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/{dataset_id}/")
            data = response.json()
            print(f"Dataset {dataset_id} response keys:", list(data.keys()) if isinstance(data, dict) else type(data))
            return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dataset/{dataset_id}/assays")
async def get_dataset_assays(dataset_id: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/{dataset_id}/assays/")
            data = response.json()
            print(f"Assays for {dataset_id}:", data)
            return data
    except Exception as e:
        print(f"Error fetching assays for {dataset_id}:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dataset/{dataset_id}/files")
async def get_dataset_files(dataset_id: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/{dataset_id}/files/")
            if response.status_code == 404:
                return []
            return response.json()
    except Exception as e:
        return []

@app.get("/api/assay-details")
async def get_assay_details(url: str):
    """Proxy endpoint to fetch assay details from NASA API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dataset/{dataset_id}/assay/{assay_name}/samples")
async def get_assay_samples(dataset_id: str, assay_name: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/{dataset_id}/assay/{assay_name}/samples/")
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dataset/{dataset_id}/assay/{assay_name}/files")
async def get_assay_files(dataset_id: str, assay_name: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/{dataset_id}/assay/{assay_name}/files/")
            if response.status_code == 404:
                return []
            return response.json()
    except Exception as e:
        return []

@app.get("/api/dataset/{dataset_id}/assay/{assay_name}/sample/{sample_name}/files")
async def get_sample_files(dataset_id: str, assay_name: str, sample_name: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/{dataset_id}/assay/{assay_name}/sample/{sample_name}/files/")
            if response.status_code == 404:
                return []
            return response.json()
    except Exception as e:
        return []

@app.get("/api/datasets")
async def get_datasets():
    async with httpx.AsyncClient() as client:
        res = await client.get("https://visualization.osdr.nasa.gov/biodata/api/v2/datasets/")
        return res.json()

@app.get("/api/datasets/bulk")
async def get_datasets_bulk():
    """Fetch all datasets with metadata in bulk for fast loading"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Get all dataset IDs
            datasets_res = await client.get("https://visualization.osdr.nasa.gov/biodata/api/v2/datasets/")
            all_datasets = datasets_res.json()
            dataset_ids = list(all_datasets.keys())
            
            # Fetch metadata for all datasets in parallel (limited batches)
            results = []
            batch_size = 20
            
            for i in range(0, len(dataset_ids), batch_size):
                batch = dataset_ids[i:i + batch_size]
                batch_tasks = []
                
                for dataset_id in batch:
                    batch_tasks.append(fetch_dataset_metadata(client, dataset_id))
                
                batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
                
                for result in batch_results:
                    if not isinstance(result, Exception) and result:
                        results.append(result)
            
            return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def fetch_dataset_metadata(client, dataset_id):
    """Helper function to fetch individual dataset metadata"""
    try:
        response = await client.get(f"https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/{dataset_id}/")
        if response.status_code != 200:
            return None
            
        data = response.json()
        dataset_key = list(data.keys())[0]
        dataset = data[dataset_key]
        metadata = dataset.get('metadata', {})
        
        return {
            "accession": dataset_id,
            "title": metadata.get("study title", dataset_id),
            "description": metadata.get("study description", "No description available"),
            "organism": metadata.get("organism", "N/A"),
            "material": metadata.get("material type", "N/A"),
            "factor": metadata.get("study factor name", "N/A"),
            "funding": metadata.get("study funding agency", "N/A"),
            "publication": metadata.get("study publication title", "N/A")
        }
    except Exception:
        return {
            "accession": dataset_id,
            "title": dataset_id,
            "description": "Error loading details",
            "organism": "N/A",
            "material": "N/A",
            "factor": "N/A",
            "funding": "N/A",
            "publication": "N/A"
        }



@app.get("/api/taskbook/highlights")
async def get_taskbook_highlights():
    """Fetch NASA Task Book highlights with images"""
    url = "https://taskbook.nasaprs.com/tbp/highlights.cfm"
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
            html = response.text
            soup = BeautifulSoup(html, 'html.parser')
            
            highlights = []
            for img in soup.find_all('img'):
                img_src = img.get('src', '')
                if img_src and not img_src.endswith('.gif'):
                    parent = img.find_parent(['a', 'div', 'td'])
                    if parent:
                        text = parent.get_text().strip()
                        if len(text) > 50:
                            full_img_url = img_src if img_src.startswith('http') else f"https://taskbook.nasaprs.com{img_src}"
                            highlights.append({
                                "title": text[:100],
                                "summary": text,
                                "image": full_img_url
                            })
    except:
        pass
    
    if not highlights:
        highlights = [
            {"title": "Spaceflight Allows Botanists To Probe Fundamental Questions About Plants", "summary": "Research by Ferl/Paul exploring how spaceflight environments enable scientists to study fundamental aspects of plant biology, including growth patterns, gene expression, and adaptation mechanisms in microgravity conditions.", "image": "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400"},
            {"title": "Microgravity Offers a Unique Opportunity to Study Human Immune Function", "summary": "Hughes-Fulford's research demonstrates how microgravity provides unprecedented insights into human immune system function, revealing changes in immune cell behavior and response mechanisms that are masked by Earth's gravity.", "image": "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400"},
            {"title": "Space Flies Model How Gravity Affects the Human Immune System", "summary": "Beckingham/Kimbrell use fruit flies as model organisms to understand how gravitational forces influence immune system development and function, with direct applications to human health in space and on Earth.", "image": "https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=400"},
            {"title": "Spaceflight Promotes Unique Bacterial Biofilm Structure", "summary": "Collins' research reveals that bacteria form distinct biofilm structures in microgravity, with implications for spacecraft contamination control, crew health, and potential biotechnology applications.", "image": "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400"},
            {"title": "Growing Plants in Spaceflight Could Help Reveal How They Sense Their World", "summary": "Gilroy's studies on plant growth in space provide insights into how plants perceive and respond to their environment, including gravity sensing mechanisms and signal transduction pathways.", "image": "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400"},
            {"title": "Studying Infections in Space to Help Provide Better Medicine Back on Earth", "summary": "Nickerson's research on microbial behavior in spaceflight conditions leads to discoveries about pathogen virulence and infection mechanisms, contributing to improved medical treatments for Earth-based diseases.", "image": "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400"},
            {"title": "Research on Latent Virus Reactivation Helps Keep Astronauts and the Public Healthy", "summary": "Mehta/Pierson investigate how spaceflight stress causes reactivation of dormant viruses in astronauts, leading to better understanding and prevention strategies for viral infections in both space and terrestrial populations.", "image": "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400"},
            {"title": "Observing Microorganisms on ISS Leads to a Novel Understanding of Life on Earth", "summary": "The Microbial Observatory project monitors microorganisms aboard the International Space Station, providing unprecedented data on microbial ecology, evolution, and adaptation in closed environments.", "image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400"},
            {"title": "Standing up to Gravity: Drug Shows Promise as Treatment for Orthostatic Intolerance", "summary": "Cohen/Meck's research identifies pharmaceutical interventions to prevent orthostatic intolerance (dizziness upon standing) experienced by astronauts after spaceflight, with applications for patients on Earth.", "image": "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400"},
            {"title": "Transgenic Plants Help Answer Questions about the Effects of Space Flight on Plant Biology", "summary": "Ferl/Paul use genetically modified plants to track molecular and cellular responses to spaceflight, revealing how plants adapt at the genetic level to microgravity environments.", "image": "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400"}
        ]
    
    return {
        "source": url,
        "citation": "Data from NASA Task Book (https://taskbook.nasaprs.com)",
        "highlights": highlights[:10]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)