import { useState } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'

const API_BASE = "http://127.0.0.1:8000"

function SummaryPanel({ article, content }) {
  const [summary, setSummary] = useState('')
  const [keywords, setKeywords] = useState([])
  const [chartInfo, setChartInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const generateSummary = async () => {
    setIsOpen(true)
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/ai/comprehensive-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: article.title,
          content: content.replace(/<[^>]*>/g, '')
        })
      })
      const data = await res.json()
      setSummary(data.summary || '')
      setKeywords(data.keywords || [])
      setChartInfo(data.chartData || null)
    } catch (err) {
      console.error('Summary generation failed:', err)
    }
    setLoading(false)
  }

  if (!article) return null

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#a4de6c', '#d0ed57']

  const renderChart = () => {
    if (!chartInfo || !chartInfo.data || chartInfo.data.length === 0) return null

    const chartData = chartInfo.data
    const chartType = chartInfo.chartType || 'bar'
    const title = chartInfo.title || 'Data Visualization'
    const unit = chartInfo.unit || ''

    if (chartType === 'pie') {
      return (
        <div>
          <h4 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
            {title} {unit && `(${unit})`}
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie 
                data={chartData} 
                dataKey="value" 
                nameKey="label" 
                cx="50%" 
                cy="50%" 
                outerRadius={80}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )
    }

    if (chartType === 'line') {
      return (
        <div>
          <h4 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
            {title} {unit && `(${unit})`}
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} label={{ value: unit, angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )
    }

    // Default: bar chart
    return (
      <div>
        <h4 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
          {title} {unit && `(${unit})`}
        </h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <XAxis dataKey="label" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
            <YAxis tick={{ fontSize: 12 }} label={{ value: unit, angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <>
      {/* Trigger Button */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#1f2937', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>🤖 AI Analysis</h3>
          <button 
            onClick={generateSummary}
            disabled={loading}
            style={{
              background: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
          >
            {loading ? 'Analyzing...' : 'Generate Summary & Chart'}
          </button>
        </div>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: '10px 0 0 0' }}>Click to analyze this article and view results in sidebar</p>
      </div>

      {/* Sliding Sidebar */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: isOpen ? 0 : '-500px',
        width: '500px',
        height: '100vh',
        background: 'white',
        boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
        transition: 'right 0.3s ease',
        zIndex: 1000,
        overflowY: 'auto'
      }}>
        {/* Sidebar Header */}
        <div style={{
          position: 'sticky',
          top: 0,
          background: '#1f2937',
          color: 'white',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>🤖 AI Analysis</h2>
          <button 
            onClick={() => setIsOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0 10px'
            }}
          >
            ×
          </button>
        </div>

        {/* Sidebar Content */}
        <div style={{ padding: '20px' }}>

          {loading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '4px solid #e5e7eb', 
                borderTop: '4px solid #2563eb',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px'
              }} />
              <p style={{ color: '#6b7280' }}>Analyzing article...</p>
            </div>
          )}

          {!loading && summary && (
            <>
              <div style={{
                background: '#f9fafb',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '20px'
              }}>
                <h4 style={{ color: '#374151', fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>📄 Summary</h4>
                <p style={{ color: '#4b5563', lineHeight: '1.6', margin: 0 }}>{summary}</p>
              </div>

              {keywords.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#374151', fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>🏷️ Key Terms</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {keywords.map((kw, idx) => (
                      <span key={idx} style={{
                        background: '#dbeafe',
                        color: '#1e40af',
                        padding: '6px 14px',
                        borderRadius: '16px',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}>
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {renderChart()}
            </>
          )}

          {!loading && !summary && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              <p>Click "Generate Summary & Chart" to analyze this article</p>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
        />
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

export default SummaryPanel
