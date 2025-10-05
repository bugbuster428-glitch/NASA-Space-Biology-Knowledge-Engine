import { useState, useEffect } from "react"

function ArticleViewer({ article }) {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (article && article.id !== undefined) {
      setLoading(true)
      setError(null)
      setContent("")

      fetch(`http://localhost:8000/articles/${article.id}`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json()
        })
        .then((data) => {
          setContent(data.content || "<p>No content available</p>")
          setLoading(false)
        })
        .catch((err) => {
          console.error("Error fetching article content:", err)
          setError(err.message)
          setContent(`<p>Error loading content: ${err.message}</p>`)
          setLoading(false)
        })
    }
  }, [article])

  if (!article) {
    return (
      <div className="bg-white rounded-lg shadow-md p-10 text-center text-gray-500">
        <svg
          className="w-12 h-12 mx-auto mb-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          No Article Selected
        </h2>
        <p className="text-sm">Choose an article from the list to start reading.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <h2 className="text-xl font-bold">{article.title}</h2>
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 transition text-sm"
        >
          🔗 View Original
        </a>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading article...</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            ❌ Failed to load content: {error}
          </div>
        )}
        {!loading && !error && (
          <div
            className="article-content prose max-w-none prose-blue prose-lg"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    </div>
  )
}

export default ArticleViewer
