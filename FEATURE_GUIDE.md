# 🚀 AI Analysis Feature - User Guide

## Where to Find It

### Step 1: Open an Article
1. Go to http://localhost:5173
2. Click on any article from the list

### Step 2: Find the AI Analysis Panel
- **Location**: At the TOP of the article content (right after the article header)
- **Look for**: A white box with "🤖 AI Analysis" heading
- **Button**: Blue "Generate Summary" button on the right

### Step 3: Generate Analysis
1. Click the **"Generate Summary"** button
2. Wait 2-4 seconds (button shows "Analyzing...")
3. Results appear:
   - ✅ **Summary**: 2-3 sentence overview
   - ✅ **Key Terms**: Blue tags with important keywords
   - ✅ **Chart**: Bar/Pie/Line chart with REAL data from the article

## What You'll See

```
┌─────────────────────────────────────────────────────┐
│ 🤖 AI Analysis          [Generate Summary] ←─ CLICK │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Summary                                             │
│ This study examined mice in spaceflight...          │
│                                                     │
│ Key Terms                                           │
│ [mice] [flight] [microgravity] [gene] [expression] │
│                                                     │
│ Group Comparison                                    │
│ ┌─────────────────────────────────────┐            │
│ │     ▓▓▓▓▓▓▓▓                        │            │
│ │     ▓▓▓▓▓▓▓▓▓▓▓▓                    │            │
│ │     ▓▓▓▓▓▓                          │            │
│ │   Gene A  Gene B  Gene C            │            │
│ └─────────────────────────────────────┘            │
└─────────────────────────────────────────────────────┘
```

## Features

### 1. Real Data Extraction
- Charts show **actual numbers** from the article
- Not AI-generated/hallucinated data
- Extracted using regex patterns

### 2. Smart Chart Selection
- **Pie Chart**: For percentages (survival rates, distributions)
- **Bar Chart**: For comparisons (groups, measurements)
- **Line Chart**: For time-series data

### 3. Fast Performance
- First time: ~2-4 seconds
- Uses optimized Gemini Flash model
- Regex extraction is instant

## Example Results

### Article about Mice Survival:
- **Chart Type**: Pie Chart
- **Data**: Flight: 53%, Control: 84%
- **Title**: "Survival Rate"

### Article about Gene Expression:
- **Chart Type**: Bar Chart
- **Data**: Gene A: 2.5, Gene B: 3.8, Gene C: 1.2
- **Title**: "Gene Expression Levels"

### Article about Body Weight:
- **Chart Type**: Bar Chart
- **Data**: Flight: 8%, Control: 4%
- **Title**: "Body Weight Change"

## Troubleshooting

### Button Not Appearing?
- Make sure you're viewing an article (not the home page)
- Scroll to the top of the article content
- Check browser console for errors (F12)

### "Analyzing..." Takes Too Long?
- First analysis: 2-4 seconds is normal
- Check backend is running: http://127.0.0.1:8000
- Check browser console for network errors

### No Chart Showing?
- Some articles may not have extractable numerical data
- AI will use fallback data in this case
- Check backend logs for "No data found by regex"

## Technical Details

### Backend Endpoint
- **URL**: `POST http://127.0.0.1:8000/ai/comprehensive-summary`
- **Input**: `{ "title": "...", "content": "..." }`
- **Output**: `{ "summary": "...", "keywords": [...], "chartData": {...} }`

### Data Extraction Patterns
1. Percentages: `label: 45%`
2. Measurements: `body weight: 25.5 g`
3. Sample sizes: `n=30`
4. Group data: `Flight: 25, Control: 30`
5. Table data: `Gene A 2.5 ± 0.3`

### Frontend Component
- **File**: `frontend/src/components/SummaryPanel.jsx`
- **Location**: Imported in `ArticlePage.jsx`
- **Charts**: Uses Recharts library
