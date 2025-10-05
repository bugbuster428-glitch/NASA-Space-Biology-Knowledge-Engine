# NASA Space Biology Research Platform

An AI-powered web application for analyzing and visualizing NASA space biology research articles with intelligent summarization, interactive charts, and conversational AI assistance.

## 🚀 Project Overview

This platform provides researchers and enthusiasts with an intuitive interface to explore NASA's space biology research. It features:

- **AI-Powered Summarization**: Hybrid approach using spaCy (extractive) + Google Gemini (abstractive) for accurate, human-readable summaries
- **Interactive Visualizations**: 7 chart types (pie, donut, horizontal/vertical bar, line, area, data table)
- **AI Chatbot**: Context-aware assistant powered by Google Gemini for answering questions about articles
- **Responsive Design**: Modern UI with smooth animations and loading screens
- **Smart Navigation**: Fixed sidebar with hash-based navigation to all sections

## 📁 Project Structure

```
nasa-spacebio-site/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnalysisPage.jsx    # AI analysis page with charts & chatbot
│   │   │   ├── ArticlePage.jsx     # Individual article view
│   │   │   └── FrontPage.jsx       # Homepage with article grid
│   │   ├── App.jsx                 # Main app with routing & loading animation
│   │   └── main.jsx                # React entry point
│   └── package.json
│
├── backend/                     # FastAPI backend server
│   ├── app.py                      # Main FastAPI application
│   ├── ai_utils.py                 # Gemini AI endpoints (chat, summary)
│   ├── hybrid_summarizer.py        # Hybrid summarization (spaCy + Gemini)
│   ├── utils/
│   │   └── data_extractor.py       # Regex-based data extraction
│   ├── requirements.txt            # Python dependencies
│   └── requirements_hybrid.txt     # spaCy dependencies
│
└── README.md                    # This file
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Vite** - Build tool and dev server

### Backend
- **FastAPI** - Modern Python web framework
- **Google Gemini AI** - Text generation and chat
- **spaCy** - Natural language processing
- **PyTextRank** - Extractive summarization
- **Uvicorn** - ASGI server

### AI/ML Pipeline
1. **Preprocessing**: Remove duplicates, figure references, clean text
2. **Extractive Summarization**: spaCy + PyTextRank extract key sentences
3. **Abstractive Summarization**: Gemini polishes into human-readable text
4. **Data Extraction**: Regex patterns extract numerical data (no AI hallucinations)

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- Google Gemini API key

### Backend Setup

1. Navigate to backend directory:
```bash
cd nasa-spacebio-site/backend
```

2. Create virtual environment:
```bash
python -m venv .venv
```

3. Activate virtual environment:
```bash
# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
pip install -r requirements_hybrid.txt
```

5. Download spaCy model:
```bash
python -m spacy download en_core_web_sm
```

6. Configure API key in `ai_utils.py`:
```python
genai.configure(api_key="YOUR_GEMINI_API_KEY")
```

7. Start backend server:
```bash
python app.py
```
Backend runs on `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd nasa-spacebio-site/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`

## 🎯 Key Features

### 1. AI-Powered Analysis Page
- **Summary Section**: Black background with auto-adjusting height, 200px bottom padding
- **Keywords**: White pills displayed below summary heading
- **Metadata**: Gemini-style info cards (authors, affiliations, dates)
- **AI Chatbot**: Sticky chatbot (only within summary section) with white glow effect
- **Left Sidebar**: Fixed navigation with Contents and Visualizations sections

### 2. Interactive Visualizations
All charts feature:
- Hover effects with tooltips
- Smooth animations
- Responsive design
- Descriptive text explaining the data

Chart types:
- 📋 Data Table
- 🥧 Pie Chart
- 🍩 Donut Chart
- 📊 Horizontal Bar Chart
- 📈 Vertical Bar Chart
- 📉 Line Chart
- 📐 Area Chart

### 3. Hybrid Summarization System

**Step 1: Preprocessing**
```python
- Remove ALL figure/table references
- Remove duplicate sentences
- Clean whitespace
- Filter short sentences
```

**Step 2: Extractive (spaCy + PyTextRank)**
```python
- Extract 5-6 most important sentences
- Rank by importance using TextRank algorithm
- Fallback to simple extraction if spaCy unavailable
```

**Step 3: Abstractive (Gemini)**
```python
- Polish extracted text
- Remove awkward phrasing
- Make human-readable (3-5 sentences)
- Keep scientific accuracy
```

### 4. Loading Animations
- **Front Page**: Solar system with orbiting planets (2.5s)
- **Analysis Page**: Solar system animation while loading data

## 🔧 API Endpoints

### Backend Routes

#### Article Management
- `GET /articles` - List all articles
- `GET /articles/{id}` - Get article by ID
- `GET /articles/{id}/content` - Get full article content

#### AI Features
- `POST /ai/comprehensive-summary` - Generate hybrid summary + extract data
- `POST /ai/chat` - Chat with AI about article
- `POST /ai/test-gemini` - Test Gemini API connection

#### Request/Response Examples

**Comprehensive Summary**
```json
// Request
{
  "title": "Article Title",
  "content": "Full article text..."
}

// Response
{
  "summary": "AI-generated summary...",
  "keywords": ["keyword1", "keyword2", ...],
  "chartData": {
    "chartType": "bar",
    "title": "Chart Title",
    "data": [{"label": "A", "value": 10}, ...],
    "unit": "mg/kg"
  }
}
```

**Chat**
```json
// Request
{
  "question": "What were the main findings?",
  "article_content": "Article text...",
  "article_title": "Article Title"
}

// Response
{
  "answer": "The main findings were..."
}
```

## 🎨 Design Specifications

### Color Scheme
- **Primary Background**: Black (#000)
- **Text**: White (#fff), Light Gray (#f0f0f0)
- **Accent**: Cyan (#4ECDC4)
- **Keywords**: White pills with shadow
- **Chatbot**: White glow (boxShadow: '0 0 30px rgba(255,255,255,0.15)')

### Layout
- **Summary Section**: Auto-height, 200px bottom padding, flex layout (55% text, 45% chatbot)
- **Chatbot**: Sticky (top: 110px), only within summary section
- **Sidebar**: Fixed, 280px width, white background
- **Charts**: Full-width sections with descriptions

## 🚨 Troubleshooting

### Backend Issues

**Module not found errors**
```bash
pip install -r requirements.txt
pip install -r requirements_hybrid.txt
```

**spaCy model missing**
```bash
python -m spacy download en_core_web_sm
```

**Gemini API errors**
- Check API key is valid
- Verify internet connection
- Check rate limits

### Frontend Issues

**CORS errors**
- Ensure backend is running on port 8000
- Check CORS middleware in `app.py`

**Charts not displaying**
- Verify data extraction in backend logs
- Check console for JavaScript errors

## 📊 Performance

- **Summary Generation**: 3-5 seconds (hybrid approach)
- **Data Extraction**: <1 second (regex-based)
- **Chat Response**: 1-2 seconds (Gemini API)
- **Page Load**: 2.5 seconds (with animation)

## 🔐 Security

- API keys stored in backend only (never exposed to frontend)
- Input sanitization for all user queries
- Rate limiting on AI endpoints (recommended for production)

## 🚀 Deployment

### Backend (Production)
```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend (Build)
```bash
npm run build
# Deploy dist/ folder to hosting service
```

## 📝 Configuration

### Gemini API Key
Update in `backend/ai_utils.py` and `backend/hybrid_summarizer.py`:
```python
genai.configure(api_key="YOUR_API_KEY_HERE")
```

### Text Limits
In `hybrid_summarizer.py`:
- Max article length: 15,000 chars
- Chunk size: 2,500 chars
- Max chunks: 3

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is for educational and research purposes.

## 👥 Authors

- **Frontend**: React, Vite, Interactive UI
- **Backend**: FastAPI, AI Integration
- **AI Pipeline**: Hybrid Summarization System

## 🙏 Acknowledgments

- NASA for space biology research data
- Google Gemini AI for text generation
- spaCy and PyTextRank for NLP capabilities

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review backend logs for errors
3. Verify API key configuration
4. Check browser console for frontend errors

---

**Built with ❤️ for NASA Space Biology Research**
