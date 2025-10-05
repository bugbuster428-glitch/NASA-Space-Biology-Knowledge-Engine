import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"


const API_BASE = "http://127.0.0.1:8000"

function ArticlePage() {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [content, setContent] = useState("")
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const parseContent = (htmlContent) => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlContent
    const headings = tempDiv.querySelectorAll('h1, h2, h3')
    const parsedSections = []
    
    headings.forEach((heading, index) => {
      const headingText = heading.textContent.toLowerCase().trim()
      
      if (headingText.includes('author') || headingText.includes('correspondence')) {
        return
      }
      
      const nextHeading = headings[index + 1]
      let content = ''
      let current = heading.nextElementSibling
      
      while (current && current !== nextHeading) {
        content += current.outerHTML || current.textContent
        current = current.nextElementSibling
      }
      
      if (content.trim()) {
        parsedSections.push({
          id: `section-${index}`,
          title: heading.textContent,
          content: content
        })
      }
    })
    
    return parsedSections.length > 0 ? parsedSections : [
      { id: 'content', title: 'Article Content', content: htmlContent }
    ]
  }

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/articles`),
      fetch(`${API_BASE}/articles/${id}`),
    ])
      .then(([articlesRes, contentRes]) => {
        if (!articlesRes.ok || !contentRes.ok) {
          throw new Error("Failed to fetch article data")
        }
        return Promise.all([articlesRes.json(), contentRes.json()])
      })
      .then(([articles, contentData]) => {
        const foundArticle = articles.find((a) => a.id === parseInt(id))
        const articleContent = contentData.content || "<p>No content available</p>"
        setArticle(foundArticle)
        setContent(articleContent)
        setSections(parseContent(articleContent))
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The requested article could not be found."}</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
          >
            Back to Articles
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-black border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center text-white hover:text-gray-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Articles
            </button>
            <div className="flex items-center gap-4">
              <span className="text-white font-medium">NASA Space Biology Research</span>
            </div>
          </div>
        </div>
      </nav>

      <header className="bg-black text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-4 leading-tight">{article.title}</h1>
        </div>
      </header>

      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">Research Paper</span>
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
              Original Source →
            </a>
          </div>
        </div>
      </div>

      <aside className="fixed left-0 top-0 w-80 h-full bg-white border-r shadow-lg z-40 overflow-y-auto">
        <div className="pt-20 p-4 space-y-4">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 shadow-2xl">
            <h3 className="font-bold mb-3 text-white text-lg">🤖 AI Analysis</h3>
            <p className="text-white text-sm mb-4 opacity-90">
              Get instant AI-powered insights, summaries, and interactive visualizations
            </p>
            <button 
              onClick={() => window.location.href = `/analysis/${id}`}
              className="w-full px-4 py-3 bg-white text-purple-700 rounded-lg text-base hover:bg-gray-100 font-bold shadow-lg transition-all transform hover:scale-105"
            >
              View Summary →
            </button>
            <button 
              onClick={() => window.location.href = `/analysis/${id}#table-section`}
              className="w-full px-4 py-3 bg-white text-purple-700 rounded-lg text-base hover:bg-gray-100 font-bold shadow-lg transition-all transform hover:scale-105 mt-3"
            >
              View Graphs →
            </button>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold mb-3 text-gray-900 text-sm">📋 Table of Contents</h3>
            <ul className="space-y-1 text-xs">
              {sections.map((section) => (
                <li key={section.id}>
                  <a 
                    href={`#${section.id}`} 
                    className="text-blue-700 hover:text-blue-900 block py-1 px-2 rounded hover:bg-blue-100"
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      <main className="ml-80 px-6 py-8" style={{ marginRight: chatOpen ? '450px' : '0', transition: 'margin-right 0.3s ease' }}>
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.id} id={section.id} className="bg-white rounded-lg shadow-sm border p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
              <div 
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-blue-600 hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            </div>
          ))}
        </div>
      </main>

      {/* Floating AI Assistant Button */}
      <button
        onClick={() => setChatOpen(true)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #000 0%, #333 100%)',
          border: '3px solid #fff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.4)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'
        }}
      >
        <span style={{ fontSize: '32px' }}>🤖</span>
      </button>

      {/* AI Chat Sidebar */}
      {chatOpen && (
        <div style={{ position: 'fixed', right: 0, top: '64px', width: '450px', height: 'calc(100vh - 64px)', background: '#fff', boxShadow: '-4px 0 20px rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', flexDirection: 'column', animation: 'slideIn 0.3s ease' }}>
          <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
          <div style={{ padding: '20px', borderBottom: '2px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#000', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '32px' }}>🤖</span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>AI Assistant</h3>
            </div>
            <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#fff', lineHeight: 1 }}>×</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f9f9f9' }}>
            {chatMessages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>💡</div>
                <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#000' }}>Ask me anything</p>
                <p style={{ fontSize: '14px' }}>I can help explain this research article</p>
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', width: '100%' }}>
                  <div style={{ background: msg.role === 'user' ? '#000' : '#fff', color: msg.role === 'user' ? '#fff' : '#000', padding: '14px 18px', borderRadius: '12px', maxWidth: '85%', fontSize: '14px', lineHeight: 1.6, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    {msg.content}
                  </div>
                  {msg.showButton && (
                    <button
                      onClick={() => window.location.href = `/analysis/${id}`}
                      style={{ marginTop: '10px', padding: '10px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                    >
                      📊 View Summary
                    </button>
                  )}
                </div>
              ))
            )}
            {chatLoading && (
              <div style={{ display: 'flex', width: '100%' }}>
                <div style={{ background: '#fff', padding: '14px 18px', borderRadius: '12px', maxWidth: '85%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>
          <form onSubmit={async (e) => {
            e.preventDefault()
            if (!chatInput.trim() || chatLoading) return
            const userMsg = chatInput.trim()
            setChatMessages(prev => [...prev, { role: 'user', content: userMsg }])
            setChatInput('')
            setChatLoading(true)
            try {
              const res = await fetch(`${API_BASE}/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: userMsg, article_content: content, article_title: article.title })
              })
              const data = await res.json()
              setChatMessages(prev => [...prev, { role: 'assistant', content: data.answer || 'Sorry, I could not respond.', showButton: data.show_summary_button }])
            } catch (err) {
              setChatMessages(prev => [...prev, { role: 'assistant', content: 'Error occurred. Please try again.' }])
            }
            setChatLoading(false)
          }} style={{ padding: '20px', borderTop: '2px solid #e0e0e0', display: 'flex', gap: '10px', background: '#fff' }}>
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask a question..." style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '2px solid #ddd', fontSize: '14px', outline: 'none' }} />
            <button type="submit" disabled={!chatInput.trim() || chatLoading} style={{ padding: '14px 24px', borderRadius: '8px', background: chatInput.trim() && !chatLoading ? '#000' : '#ccc', color: '#fff', border: 'none', fontWeight: 700, cursor: chatInput.trim() && !chatLoading ? 'pointer' : 'not-allowed', fontSize: '14px' }}>Send</button>
          </form>
        </div>
      )}
    </div>
  )
}

export default ArticlePage
