import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import ArticlePage from './components/ArticlePage.jsx'
import DatasetPage from './components/DatasetPage.jsx'
import AnalysisPage from './components/AnalysisPage.jsx'
import ExperimentPage from './components/ExperimentPage.jsx'
import TaskBook from './components/TaskBook.jsx'
import TaskBookResults from './components/TaskBookResults.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/article/:id" element={<ArticlePage />} />
        <Route path="/dataset/:datasetId" element={<DatasetPage />} />
        <Route path="/analysis/:id" element={<AnalysisPage />} />
        <Route path="/experiment/:id" element={<ExperimentPage />} />
        <Route path="/taskbook" element={<TaskBook />} />
        <Route path="/taskbook/results" element={<TaskBookResults />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)