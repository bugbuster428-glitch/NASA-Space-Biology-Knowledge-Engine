import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"


const API_BASE = "http://127.0.0.1:8000"

function AnalysisPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [article, setArticle] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        // Check cache first
        const cacheKey = `analysis_${id}`
        const cached = localStorage.getItem(cacheKey)
        
        if (cached) {
          const cachedData = JSON.parse(cached)
          console.log('✓ Using cached analysis')
          setData(cachedData.analysis)
          setArticle(cachedData.article)
          setLoading(false)
          
          // Scroll to hash section
          setTimeout(() => {
            if (window.location.hash) {
              document.getElementById(window.location.hash.substring(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          }, 100)
          return
        }
        
        const [articleRes, contentRes] = await Promise.all([
          fetch(`${API_BASE}/articles`),
          fetch(`${API_BASE}/articles/${id}`)
        ])
        
        const articles = await articleRes.json()
        const contentData = await contentRes.json()
        const foundArticle = articles.find(a => a.id === parseInt(id))
        
        setArticle(foundArticle)
        
        const cleanContent = contentData.content ? contentData.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : ''
        
        const res = await fetch(`${API_BASE}/ai/comprehensive-summary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: foundArticle.title,
            content: cleanContent
          })
        })
        
        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`)
        }
        
        const analysisData = await res.json()
        console.log('Analysis data received:', analysisData)
        
        // Cache the result
        localStorage.setItem(cacheKey, JSON.stringify({
          analysis: analysisData,
          article: foundArticle,
          timestamp: Date.now()
        }))
        console.log('✓ Analysis cached')
        
        setData(analysisData)
        setLoading(false)
        
        // Scroll to hash section after data loads
        setTimeout(() => {
          if (window.location.hash) {
            const element = document.getElementById(window.location.hash.substring(1))
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          }
        }, 100)
      } catch (err) {
        console.error('Analysis failed:', err)
        setData({ error: err.message })
        setLoading(false)
      }
    }
    
    fetchAnalysis()
  }, [id])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        `}</style>
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease-in' }}>
          <div style={{ width: '80px', height: '80px', border: '8px solid #333', borderTop: '8px solid #fff', borderRadius: '50%', margin: '0 auto 30px', animation: 'spin 1s linear infinite' }}></div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>Analyzing Article</h2>
          <p style={{ fontSize: '16px', color: '#999' }}>Please wait...</p>
        </div>
      </div>
    )
  }

  if (!data || !article || data.error) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>Analysis Error</h2>
          <p style={{ marginBottom: '10px' }}>Failed to generate analysis.</p>
          {data?.error && <p style={{ color: '#ff6b6b', marginBottom: '20px' }}>Error: {data.error}</p>}
          <button onClick={() => navigate(`/article/${id}`)} style={{ background: '#fff', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, marginTop: '20px' }}>
            Back to Article
          </button>
        </div>
      </div>
    )
  }

  const chartData = data.chartData?.data || []
  const maxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : 0
  const total = chartData.reduce((sum, d) => sum + d.value, 0)
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788']

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleChatSubmit = async (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMessage = chatInput.trim()
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setChatInput('')
    setChatLoading(true)

    try {
      // Get article content
      const contentRes = await fetch(`${API_BASE}/articles/${id}`)
      const contentData = await contentRes.json()
      const cleanContent = contentData.content ? contentData.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : ''
      
      // Call AI chat endpoint
      const response = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage,
          article_content: cleanContent,
          article_title: article.title
        })
      })
      
      const aiResponse = await response.json()
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiResponse.answer || 'Sorry, I could not generate a response.'
      }])
      setChatLoading(false)
    } catch (err) {
      console.error('Chat error:', err)
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
      setChatLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', lineHeight: 1.7, background: '#ffffff', minHeight: '100vh', color: '#000' }}>
      <style>{`
        .chart-bar:hover { transform: scaleY(1.05); filter: brightness(1.1); }
        .chart-bar { transition: all 0.3s ease; cursor: pointer; }
        .pie-segment { transition: all 0.3s ease; cursor: pointer; transform-origin: center; }
        .pie-segment:hover { filter: brightness(1.2); transform: scale(1.1); }
        .donut-segment { transition: all 0.3s ease; cursor: pointer; transform-origin: center; }
        .donut-segment:hover { filter: drop-shadow(0 0 8px rgba(0,0,0,0.5)); transform: scale(1.08); }
        .line-point { transition: all 0.3s ease; cursor: pointer; }
        .line-point:hover { r: 12; filter: drop-shadow(0 0 6px currentColor); }
        .area-point { transition: all 0.3s ease; cursor: pointer; }
        .area-point:hover { r: 10; filter: drop-shadow(0 0 6px currentColor); }
        .tooltip { position: fixed; background: rgba(0,0,0,0.9); color: white; padding: 10px 15px; border-radius: 8px; font-size: 15px; font-weight: 600; pointer-events: none; z-index: 10000; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .value-label { position: fixed; background: rgba(0,0,0,0.8); color: white; padding: 6px 10px; border-radius: 5px; font-size: 13px; font-weight: bold; pointer-events: none; z-index: 10000; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
        .nav-item { cursor: pointer; padding: 10px 16px; border-radius: 8px; transition: all 0.2s; }
        .nav-item:hover { opacity: 0.8; }
        .nav-subitem { cursor: pointer; padding: 8px 16px 8px 32px; border-radius: 6px; transition: all 0.2s; font-size: 14px; }
        .nav-subitem:hover { background: #f5f5f5; }
      `}</style>
      {/* Navbar */}
      <nav style={{ background: '#000', color: 'white', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 20px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '22px', fontWeight: 700 }}>
          <span>NASA Space Biology Research Platform</span>
        </div>
        <button onClick={() => navigate(`/article/${id}`)} style={{ background: '#fff', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '15px', transition: 'all 0.3s' }}>
          ← Back to Article
        </button>
      </nav>

      {/* Left Sidebar */}
      <aside style={{ position: 'fixed', left: 0, top: '90px', width: '280px', height: 'calc(100vh - 90px)', background: '#fff', borderRight: '2px solid #e0e0e0', padding: '30px 20px', overflowY: 'auto', zIndex: 50 }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', color: '#000' }}>📑 Contents</h3>
        
        {/* Content Section */}
        <div className="nav-item" style={{ fontWeight: 600, color: '#fff', background: '#000', marginBottom: '4px' }}>
          📄 Content
        </div>
        <div className="nav-subitem" onClick={() => scrollToSection('summary-section')}>📝 Summary</div>
        <div className="nav-subitem" onClick={() => scrollToSection('keywords-section')}>🔬 Keywords</div>
        
        {/* Visualizations Section */}
        {chartData.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            <div className="nav-item" style={{ fontWeight: 600, color: '#fff', background: '#000', marginBottom: '4px' }}>
              📊 Visualizations
            </div>
            <div className="nav-subitem" onClick={() => scrollToSection('table-section')}>📋 Data Table</div>
            <div className="nav-subitem" onClick={() => scrollToSection('pie-section')}>🥧 Pie Chart</div>
            <div className="nav-subitem" onClick={() => scrollToSection('donut-section')}>🍩 Donut Chart</div>
            <div className="nav-subitem" onClick={() => scrollToSection('hbar-section')}>📊 Horizontal Bar</div>
            <div className="nav-subitem" onClick={() => scrollToSection('vbar-section')}>📈 Vertical Bar</div>
            <div className="nav-subitem" onClick={() => scrollToSection('line-section')}>📉 Line Chart</div>
            <div className="nav-subitem" onClick={() => scrollToSection('area-section')}>📐 Area Chart</div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div style={{ marginLeft: '280px' }}>
        {/* Summary - Full Screen with Chatbot */}
        <div id="summary-section" style={{ background: '#000', color: '#fff', padding: '60px 40px 200px 40px', position: 'relative', display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
          {/* Summary Text */}
          <div style={{ flex: '0 0 55%', maxWidth: '55%' }}>
            <h2 style={{ fontSize: '42px', fontWeight: 900, marginBottom: '20px', color: '#fff' }}>Summary</h2>
            
            {/* Metadata Section - Gemini Style */}
            {data.metadata && (
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px', marginBottom: '25px', border: '1px solid rgba(255,255,255,0.15)' }}>
                {data.metadata.authors && (
                  <div style={{ marginBottom: '15px' }}>
                    <span style={{ fontWeight: 700, color: '#4ECDC4', fontSize: '14px' }}>Authors: </span>
                    <span style={{ color: '#e0e0e0', fontSize: '14px' }}>{data.metadata.authors}</span>
                  </div>
                )}
                {data.metadata.affiliations && (
                  <div style={{ marginBottom: '15px' }}>
                    <span style={{ fontWeight: 700, color: '#4ECDC4', fontSize: '14px' }}>Affiliations: </span>
                    <span style={{ color: '#e0e0e0', fontSize: '14px' }}>{data.metadata.affiliations}</span>
                  </div>
                )}
                {data.metadata.received && (
                  <div style={{ marginBottom: '15px' }}>
                    <span style={{ fontWeight: 700, color: '#4ECDC4', fontSize: '14px' }}>Received: </span>
                    <span style={{ color: '#e0e0e0', fontSize: '14px' }}>{data.metadata.received}</span>
                  </div>
                )}
                {data.metadata.accepted && (
                  <div style={{ marginBottom: '15px' }}>
                    <span style={{ fontWeight: 700, color: '#4ECDC4', fontSize: '14px' }}>Accepted: </span>
                    <span style={{ color: '#e0e0e0', fontSize: '14px' }}>{data.metadata.accepted}</span>
                  </div>
                )}
                {data.metadata.published && (
                  <div style={{ marginBottom: '15px' }}>
                    <span style={{ fontWeight: 700, color: '#4ECDC4', fontSize: '14px' }}>Published: </span>
                    <span style={{ color: '#e0e0e0', fontSize: '14px' }}>{data.metadata.published}</span>
                  </div>
                )}
                {data.metadata.competing_interests && (
                  <div style={{ marginBottom: '15px' }}>
                    <span style={{ fontWeight: 700, color: '#4ECDC4', fontSize: '14px' }}>Competing Interests: </span>
                    <span style={{ color: '#e0e0e0', fontSize: '14px' }}>{data.metadata.competing_interests}</span>
                  </div>
                )}
                {data.metadata.contributions && (
                  <div>
                    <span style={{ fontWeight: 700, color: '#4ECDC4', fontSize: '14px' }}>Author Contributions: </span>
                    <span style={{ color: '#e0e0e0', fontSize: '14px' }}>{data.metadata.contributions}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Keywords below metadata */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '30px' }}>
              {data.keywords.map((kw, idx) => (
                <span key={idx} style={{ background: '#fff', color: '#000', padding: '8px 18px', borderRadius: '20px', fontSize: '14px', fontWeight: 600, boxShadow: '0 2px 8px rgba(255,255,255,0.2)' }}>
                  {kw}
                </span>
              ))}
            </div>
            
            <p style={{ fontSize: '22px', lineHeight: 1.9, color: '#f0f0f0', textAlign: 'justify', fontWeight: 300 }}>{data.summary}</p>
          </div>

          {/* Chatbot */}
          <div style={{ flex: '0 0 45%', maxWidth: '45%', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '30px', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', boxShadow: '0 0 30px rgba(255,255,255,0.15)', position: 'sticky', top: '110px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: 0 }}>AI Assistant</h3>
            </div>
            <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '20px' }}>Ask questions about this research</p>
            
            {/* Chat Messages */}
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {chatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#666', padding: '40px 20px' }}>
                  <p style={{ fontSize: '16px', marginBottom: '10px' }}>💡 Start a conversation</p>
                  <p style={{ fontSize: '13px' }}>Ask about methodology, findings, or implications</p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} style={{ 
                    background: msg.role === 'user' ? '#fff' : 'rgba(255,255,255,0.1)', 
                    color: msg.role === 'user' ? '#000' : '#fff',
                    padding: '12px 16px', 
                    borderRadius: '12px',
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    fontSize: '14px',
                    lineHeight: 1.5
                  }}>
                    {msg.content}
                  </div>
                ))
              )}
              {chatLoading && (
                <div style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '12px 16px', borderRadius: '12px', alignSelf: 'flex-start', maxWidth: '85%' }}>
                  <span style={{ animation: 'pulse 1.5s infinite' }}>Thinking...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your question..."
                style={{ 
                  flex: 1, 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  border: '1px solid rgba(255,255,255,0.2)', 
                  background: 'rgba(255,255,255,0.1)', 
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button 
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                style={{ 
                  padding: '12px 24px', 
                  borderRadius: '8px', 
                  background: chatInput.trim() && !chatLoading ? '#fff' : 'rgba(255,255,255,0.3)', 
                  color: '#000',
                  border: 'none',
                  fontWeight: 700,
                  cursor: chatInput.trim() && !chatLoading ? 'pointer' : 'not-allowed',
                  fontSize: '14px'
                }}>
                Send
              </button>
            </form>
          </div>
        </div>



        <div style={{ padding: '40px' }}>

        {/* Visualizations Header */}
        {chartData.length > 0 && (
          <>
            <div style={{ padding: '60px 40px 40px 40px', margin: '30px 0 0 0', textAlign: 'center' }}>
              <h2 style={{ color: '#000', fontSize: '48px', fontWeight: 900, marginBottom: '15px' }}>Visualizations & Graphs</h2>
              <p style={{ color: '#666', fontSize: '16px', fontWeight: 400, lineHeight: 1.6 }}>Explore comprehensive data analysis through multiple interactive chart formats including pie charts, bar graphs, line plots, and statistical tables</p>
            </div>

            {/* Data Table */}
            <div id="table-section" style={{ background: '#fafafa', padding: '40px', margin: '30px 0', borderRadius: '16px', border: '1px solid #e0e0e0', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' }}>
              <h2 style={{ color: '#000', marginBottom: '25px', fontSize: '26px', fontWeight: 800, borderLeft: '5px solid #000', paddingLeft: '20px' }}>📋 Data Table</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ padding: '16px', textAlign: 'left', border: '1px solid #e0e0e0', fontWeight: 700 }}>Label</th>
                    <th style={{ padding: '16px', textAlign: 'right', border: '1px solid #e0e0e0', fontWeight: 700 }}>Value {data.chartData.unit && `(${data.chartData.unit})`}</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((d, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                      <td style={{ padding: '16px', border: '1px solid #e0e0e0' }}>{d.label}</td>
                      <td style={{ padding: '16px', textAlign: 'right', border: '1px solid #e0e0e0', fontWeight: 600 }}>{d.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', margin: '30px 0' }}>
              {/* Pie Chart */}
              <div id="pie-section" style={{ background: '#fafafa', padding: '40px', borderRadius: '16px', border: '1px solid #e0e0e0', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#000', marginBottom: '25px', fontSize: '22px', fontWeight: 800, borderLeft: '5px solid #FF6B6B', paddingLeft: '20px' }}>🥧 Pie Chart</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '50px', margin: '30px 0', position: 'relative' }}>
                <svg width="320" height="320" viewBox="0 0 320 320">
                  {chartData.map((d, i) => {
                    const angle = (d.value / total) * 360
                    const startAngle = chartData.slice(0, i).reduce((sum, item) => sum + (item.value / total) * 360, 0)
                    const endAngle = startAngle + angle
                    const midAngle = startAngle + angle / 2
                    const x1 = 160 + 130 * Math.cos((startAngle - 90) * Math.PI / 180)
                    const y1 = 160 + 130 * Math.sin((startAngle - 90) * Math.PI / 180)
                    const x2 = 160 + 130 * Math.cos((endAngle - 90) * Math.PI / 180)
                    const y2 = 160 + 130 * Math.sin((endAngle - 90) * Math.PI / 180)
                    const largeArc = angle > 180 ? 1 : 0
                    const labelX = 160 + 180 * Math.cos((midAngle - 90) * Math.PI / 180)
                    const labelY = 160 + 180 * Math.sin((midAngle - 90) * Math.PI / 180)
                    const lineX = 160 + 140 * Math.cos((midAngle - 90) * Math.PI / 180)
                    const lineY = 160 + 140 * Math.sin((midAngle - 90) * Math.PI / 180)
                    return (
                      <g key={i}>
                        <path 
                          className="pie-segment"
                          d={`M 160 160 L ${x1} ${y1} A 130 130 0 ${largeArc} 1 ${x2} ${y2} Z`} 
                          fill={colors[i % colors.length]} 
                          stroke="white" 
                          strokeWidth="3"
                          onMouseEnter={(e) => {
                            const label = document.getElementById(`pie-label-${i}`)
                            const line = document.getElementById(`pie-line-${i}`)
                            if (label) label.style.opacity = '1'
                            if (line) line.style.opacity = '1'
                          }}
                          onMouseLeave={() => {
                            const label = document.getElementById(`pie-label-${i}`)
                            const line = document.getElementById(`pie-line-${i}`)
                            if (label) label.style.opacity = '0'
                            if (line) line.style.opacity = '0'
                          }}
                        />
                        <line 
                          id={`pie-line-${i}`}
                          x1={lineX} 
                          y1={lineY} 
                          x2={labelX} 
                          y2={labelY} 
                          stroke={colors[i % colors.length]} 
                          strokeWidth="2" 
                          style={{ opacity: 0, transition: 'opacity 0.3s', pointerEvents: 'none' }}
                        />
                        <text 
                          id={`pie-label-${i}`}
                          x={labelX} 
                          y={labelY} 
                          textAnchor="middle" 
                          fontSize="14" 
                          fontWeight="bold" 
                          fill={colors[i % colors.length]}
                          style={{ opacity: 0, transition: 'opacity 0.3s', pointerEvents: 'none' }}
                        >
                          {d.value}
                        </text>
                      </g>
                    )
                  })}
                </svg>
                <div>
                  {chartData.map((d, i) => {
                    const pct = ((d.value / total) * 100).toFixed(1)
                    return <div key={i} style={{ margin: '12px 0', display: 'flex', alignItems: 'center' }}><span style={{ display:'inline-block', width:'24px', height:'24px', background:colors[i % colors.length], marginRight:'12px', borderRadius:'4px' }}></span><strong style={{ fontSize: '15px' }}>{d.label}:</strong><span style={{ marginLeft: '8px', color: '#666' }}>{d.value} ({pct}%)</span></div>
                  })}
                </div>
                </div>
                <p style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px', fontSize: '14px', color: '#555', lineHeight: 1.6 }}>
                  <strong>What this shows:</strong> This pie chart displays the proportional distribution of data across different categories. Each colored segment represents a category's percentage of the total, making it easy to compare relative sizes at a glance.
                </p>
              </div>

              {/* Donut Chart */}
              <div id="donut-section" style={{ background: '#fafafa', padding: '40px', borderRadius: '16px', border: '1px solid #e0e0e0', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#000', marginBottom: '25px', fontSize: '22px', fontWeight: 800, borderLeft: '5px solid #4ECDC4', paddingLeft: '20px' }}>🍩 Donut Chart</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '50px', margin: '30px 0', position: 'relative' }}>
                <svg width="320" height="320" viewBox="0 0 320 320">
                  <circle cx="160" cy="160" r="70" fill="white"/>
                  {chartData.map((d, i) => {
                    const angle = (d.value / total) * 360
                    const startAngle = chartData.slice(0, i).reduce((sum, item) => sum + (item.value / total) * 360, 0)
                    const endAngle = startAngle + angle
                    const midAngle = startAngle + angle / 2
                    const x1 = 160 + 130 * Math.cos((startAngle - 90) * Math.PI / 180)
                    const y1 = 160 + 130 * Math.sin((startAngle - 90) * Math.PI / 180)
                    const x2 = 160 + 130 * Math.cos((endAngle - 90) * Math.PI / 180)
                    const y2 = 160 + 130 * Math.sin((endAngle - 90) * Math.PI / 180)
                    const x3 = 160 + 70 * Math.cos((endAngle - 90) * Math.PI / 180)
                    const y3 = 160 + 70 * Math.sin((endAngle - 90) * Math.PI / 180)
                    const x4 = 160 + 70 * Math.cos((startAngle - 90) * Math.PI / 180)
                    const y4 = 160 + 70 * Math.sin((startAngle - 90) * Math.PI / 180)
                    const largeArc = angle > 180 ? 1 : 0
                    const pct = ((d.value / total) * 100).toFixed(1)
                    return (
                      <g key={i}>
                        <path 
                          className="donut-segment"
                          d={`M 160 160 L ${x1} ${y1} A 130 130 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A 70 70 0 ${largeArc} 0 ${x4} ${y4} Z`} 
                          fill={colors[i % colors.length]} 
                          stroke="white" 
                          strokeWidth="3"
                          onMouseEnter={(e) => {
                            const tooltip = document.createElement('div')
                            tooltip.className = 'tooltip'
                            tooltip.textContent = `${d.label}: ${d.value} (${pct}%)`
                            tooltip.style.left = e.clientX + 'px'
                            tooltip.style.top = (e.clientY - 40) + 'px'
                            tooltip.id = `donut-tooltip-${i}`
                            document.body.appendChild(tooltip)
                          }}
                          onMouseMove={(e) => {
                            const tooltip = document.getElementById(`donut-tooltip-${i}`)
                            if (tooltip) {
                              tooltip.style.left = e.clientX + 'px'
                              tooltip.style.top = (e.clientY - 40) + 'px'
                            }
                          }}
                          onMouseLeave={() => {
                            const tooltip = document.getElementById(`donut-tooltip-${i}`)
                            if (tooltip) tooltip.remove()
                          }}
                        />
                      </g>
                    )
                  })}
                  <text x="160" y="165" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#000">Total</text>
                  <text x="160" y="190" textAnchor="middle" fontSize="20" fill="#666">{total}</text>
                </svg>
                <div>
                  {chartData.map((d, i) => {
                    const pct = ((d.value / total) * 100).toFixed(1)
                    return <div key={i} style={{ margin: '12px 0', display: 'flex', alignItems: 'center' }}><span style={{ display:'inline-block', width:'24px', height:'24px', background:colors[i % colors.length], marginRight:'12px', borderRadius:'4px' }}></span><strong style={{ fontSize: '15px' }}>{d.label}:</strong><span style={{ marginLeft: '8px', color: '#666' }}>{d.value} ({pct}%)</span></div>
                  })}
                </div>
                </div>
                <p style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px', fontSize: '14px', color: '#555', lineHeight: 1.6 }}>
                  <strong>What this shows:</strong> This donut chart presents the same proportional data as the pie chart but with a hollow center displaying the total value. The ring format provides a cleaner visual while emphasizing both individual percentages and the overall sum.
                </p>
              </div>

              {/* Horizontal Bar Chart */}
              <div id="hbar-section" style={{ background: '#fafafa', padding: '40px', borderRadius: '16px', border: '1px solid #e0e0e0', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#000', marginBottom: '25px', fontSize: '22px', fontWeight: 800, borderLeft: '5px solid #45B7D1', paddingLeft: '20px' }}>📊 Horizontal Bar Chart</h2>
              <div style={{ margin: '30px 0' }}>
                {chartData.map((d, i) => {
                  const width = (d.value / maxValue) * 100
                  return (
                    <div key={i} style={{ margin: '20px 0', position: 'relative' }}>
                      <div style={{ fontWeight: 700, marginBottom: '8px', color: '#000', fontSize: '15px' }}>{d.label}</div>
                      <div style={{ background: '#f5f5f5', borderRadius: '10px', overflow: 'visible', position: 'relative' }}>
                        <div 
                          className="chart-bar"
                          style={{ background: colors[i % colors.length], color: 'white', padding: '14px 20px', width: `${width}%`, minWidth: '100px', borderRadius: '10px', fontWeight: 700, fontSize: '15px', position: 'relative' }}
                          onMouseEnter={(e) => {
                            const tooltip = document.createElement('div')
                            tooltip.className = 'tooltip'
                            tooltip.textContent = `${d.label}: ${d.value} ${data.chartData.unit || ''}`
                            tooltip.style.left = e.clientX + 'px'
                            tooltip.style.top = (e.clientY - 40) + 'px'
                            tooltip.id = `tooltip-${i}`
                            document.body.appendChild(tooltip)
                          }}
                          onMouseMove={(e) => {
                            const tooltip = document.getElementById(`tooltip-${i}`)
                            if (tooltip) {
                              tooltip.style.left = e.clientX + 'px'
                              tooltip.style.top = (e.clientY - 40) + 'px'
                            }
                          }}
                          onMouseLeave={() => {
                            const tooltip = document.getElementById(`tooltip-${i}`)
                            if (tooltip) tooltip.remove()
                          }}
                        >
                          {d.value} {data.chartData.unit || ''}
                        </div>
                      </div>
                    </div>
                  )
                })}
                </div>
                <p style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px', fontSize: '14px', color: '#555', lineHeight: 1.6 }}>
                  <strong>What this shows:</strong> This horizontal bar chart compares values across categories using bar length. Longer bars indicate higher values, making it ideal for ranking and comparing multiple items side-by-side.
                </p>
              </div>

              {/* Vertical Bar Chart */}
              <div id="vbar-section" style={{ background: '#fafafa', padding: '40px', borderRadius: '16px', border: '1px solid #e0e0e0', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#000', marginBottom: '25px', fontSize: '22px', fontWeight: 800, borderLeft: '5px solid #FFA07A', paddingLeft: '20px' }}>📈 Vertical Bar Chart</h2>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', minHeight: '300px', padding: '20px', background: '#fff', borderRadius: '12px', margin: '20px 0' }}>
                {chartData.map((d, i) => {
                  const height = (d.value / maxValue) * 220
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontWeight: 700, color: 'white', background: colors[i % colors.length], padding: '6px 10px', borderRadius: '5px', fontSize: '13px', opacity: 0, transition: 'opacity 0.3s' }} id={`vbar-label-${i}`}>{d.value}</div>
                      <div 
                        className="chart-bar"
                        style={{ width: '50px', height: `${height}px`, background: colors[i % colors.length], borderRadius: '8px 8px 0 0' }}
                        onMouseEnter={() => {
                          document.getElementById(`vbar-label-${i}`).style.opacity = '1'
                        }}
                        onMouseLeave={() => {
                          document.getElementById(`vbar-label-${i}`).style.opacity = '0'
                        }}
                      ></div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#000', textAlign: 'center', maxWidth: '70px', lineHeight: 1.2 }}>{d.label}</div>
                    </div>
                  )
                })}
                </div>
                <p style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px', fontSize: '14px', color: '#555', lineHeight: 1.6 }}>
                  <strong>What this shows:</strong> This vertical bar chart displays data using upward-extending bars. The height of each bar represents its value, making it easy to compare magnitudes and identify the highest and lowest values.
                </p>
              </div>

              {/* Line Chart */}
              <div id="line-section" style={{ background: '#fafafa', padding: '40px', borderRadius: '16px', border: '1px solid #e0e0e0', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#000', marginBottom: '25px', fontSize: '22px', fontWeight: 800, borderLeft: '5px solid #98D8C8', paddingLeft: '20px' }}>📉 Line Chart</h2>
              <svg width="100%" height="350" viewBox="0 0 900 350" style={{ background: '#fff', borderRadius: '12px', margin: '20px 0' }}>
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor:'#0088FE', stopOpacity:0.4 }} />
                    <stop offset="100%" style={{ stopColor:'#0088FE', stopOpacity:0 }} />
                  </linearGradient>
                </defs>
                {chartData.map((d, i) => {
                  const x = 100 + (i * (700 / (chartData.length - 1 || 1)))
                  const y = 280 - ((d.value / maxValue) * 230)
                  return (
                    <g key={i}>
                      <circle 
                        className="line-point"
                        cx={x} 
                        cy={y} 
                        r="8" 
                        fill="#0088FE" 
                        stroke="white" 
                        strokeWidth="3"
                        onMouseEnter={(e) => {
                          const tooltip = document.createElement('div')
                          tooltip.className = 'tooltip'
                          tooltip.textContent = `${d.label}: ${d.value}`
                          tooltip.style.left = e.clientX + 'px'
                          tooltip.style.top = (e.clientY - 40) + 'px'
                          tooltip.id = `line-tooltip-${i}`
                          document.body.appendChild(tooltip)
                        }}
                        onMouseMove={(e) => {
                          const tooltip = document.getElementById(`line-tooltip-${i}`)
                          if (tooltip) {
                            tooltip.style.left = e.clientX + 'px'
                            tooltip.style.top = (e.clientY - 40) + 'px'
                          }
                        }}
                        onMouseLeave={() => {
                          const tooltip = document.getElementById(`line-tooltip-${i}`)
                          if (tooltip) tooltip.remove()
                        }}
                      />
                    </g>
                  )
                })}
                <polyline points={chartData.map((d, i) => {
                  const x = 100 + (i * (700 / (chartData.length - 1 || 1)))
                  const y = 280 - ((d.value / maxValue) * 230)
                  return `${x},${y}`
                }).join(' ')} fill="none" stroke="#0088FE" strokeWidth="4"/>
                <polygon points={`100,280 ${chartData.map((d, i) => {
                  const x = 100 + (i * (700 / (chartData.length - 1 || 1)))
                  const y = 280 - ((d.value / maxValue) * 230)
                  return `${x},${y}`
                }).join(' ')} 800,280`} fill="url(#lineGradient)"/>
                {chartData.map((d, i) => {
                  const x = 100 + (i * (700 / (chartData.length - 1 || 1)))
                  return <text key={i} x={x} y="310" textAnchor="middle" fontSize="14" fill="#000" fontWeight="600">{d.label}</text>
                })}
                </svg>
                <p style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px', fontSize: '14px', color: '#555', lineHeight: 1.6 }}>
                  <strong>What this shows:</strong> This line chart tracks changes and trends across categories or time periods. The connected points reveal patterns, progressions, and relationships between data points, with the shaded area emphasizing the magnitude of values.
                </p>
              </div>

              {/* Area Chart */}
              <div id="area-section" style={{ background: '#fafafa', padding: '40px', borderRadius: '16px', border: '1px solid #e0e0e0', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#000', marginBottom: '25px', fontSize: '22px', fontWeight: 800, borderLeft: '5px solid #F7DC6F', paddingLeft: '20px' }}>📐 Area Chart</h2>
              <svg width="100%" height="350" viewBox="0 0 900 350" style={{ background: '#fff', borderRadius: '12px', margin: '20px 0' }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor:'#00C49F', stopOpacity:0.8 }} />
                    <stop offset="100%" style={{ stopColor:'#00C49F', stopOpacity:0.1 }} />
                  </linearGradient>
                </defs>
                <polygon points={`100,280 ${chartData.map((d, i) => {
                  const x = 100 + (i * (700 / (chartData.length - 1 || 1)))
                  const y = 280 - ((d.value / maxValue) * 230)
                  return `${x},${y}`
                }).join(' ')} 800,280`} fill="url(#areaGradient)" stroke="#00C49F" strokeWidth="4"/>
                {chartData.map((d, i) => {
                  const x = 100 + (i * (700 / (chartData.length - 1 || 1)))
                  const y = 280 - ((d.value / maxValue) * 230)
                  return (
                    <g key={i}>
                      <circle 
                        className="area-point"
                        cx={x} 
                        cy={y} 
                        r="7" 
                        fill="#00C49F" 
                        stroke="white" 
                        strokeWidth="3"
                        onMouseEnter={(e) => {
                          const tooltip = document.createElement('div')
                          tooltip.className = 'tooltip'
                          tooltip.textContent = `${d.label}: ${d.value}`
                          tooltip.style.left = e.clientX + 'px'
                          tooltip.style.top = (e.clientY - 40) + 'px'
                          tooltip.id = `area-tooltip-${i}`
                          document.body.appendChild(tooltip)
                        }}
                        onMouseMove={(e) => {
                          const tooltip = document.getElementById(`area-tooltip-${i}`)
                          if (tooltip) {
                            tooltip.style.left = e.clientX + 'px'
                            tooltip.style.top = (e.clientY - 40) + 'px'
                          }
                        }}
                        onMouseLeave={() => {
                          const tooltip = document.getElementById(`area-tooltip-${i}`)
                          if (tooltip) tooltip.remove()
                        }}
                      />
                    </g>
                  )
                })}
                {chartData.map((d, i) => {
                  const x = 100 + (i * (700 / (chartData.length - 1 || 1)))
                  return <text key={i} x={x} y="310" textAnchor="middle" fontSize="14" fill="#000" fontWeight="600">{d.label}</text>
                })}
                </svg>
                <p style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px', fontSize: '14px', color: '#555', lineHeight: 1.6 }}>
                  <strong>What this shows:</strong> This area chart combines line and filled regions to show cumulative values and trends. The filled area emphasizes the volume of data while the boundary line highlights the progression, making it ideal for visualizing growth or decline patterns.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '40px', color: '#666', fontSize: '15px', borderTop: '1px solid #e0e0e0', marginTop: '60px' }}>
          <p>Generated by NASA Space Biology Research Platform</p>
          <p style={{ marginTop: '12px' }}>Powered by AI</p>
        </div>
        </div>
      </div>
    </div>
  )
}

export default AnalysisPage
