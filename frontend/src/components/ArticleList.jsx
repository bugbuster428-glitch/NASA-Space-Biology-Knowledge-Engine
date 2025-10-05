import { useState, useEffect, useMemo } from "react";
import Fuse from "fuse.js";

function ArticleList({ onSelectArticle }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    // Check if articles exist in session storage
    const cachedArticles = sessionStorage.getItem('nasa_articles');
    if (cachedArticles) {
      setArticles(JSON.parse(cachedArticles));
      setLoading(false);
      return;
    }

    // Fetch from API if not cached
    fetch("http://localhost:8000/articles")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // Store in session storage
        sessionStorage.setItem('nasa_articles', JSON.stringify(data));
        setArticles(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching articles:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // 🔍 Setup Fuse.js
  const fuse = useMemo(() => {
    return new Fuse(articles, {
      keys: ["title", "author", "abstract"], // fields to search
      threshold: 0.3,
    });
  }, [articles]);

  // 🔄 Apply Search + Filters
  const filteredArticles = useMemo(() => {
    let results = searchTerm ? fuse.search(searchTerm).map((r) => r.item) : articles;

    if (yearFilter !== "all") {
      results = results.filter((a) => String(a.year) === yearFilter);
    }

    if (typeFilter !== "all") {
      results = results.filter((a) => a.type === typeFilter);
    }

    return results;
  }, [searchTerm, yearFilter, typeFilter, fuse, articles]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-800 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="bg-black px-6 py-4">
        <h2 className="text-xl font-bold text-white">
          NASA Space Biology Publications
        </h2>
        <p className="text-gray-300 text-sm">
          {filteredArticles.length} articles available
        </p>
      </div>

      {/* Search + Filters */}
      <div className="p-6 border-b space-y-3">
        {/* Search Input */}
        <input
          type="text"
          placeholder="🔍 Search publications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
        />

        {/* Filters */}
        <div className="flex gap-4">
          {/* Year Filter */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Years</option>
            {[...new Set(articles.map((a) => a.year))].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Types</option>
            {[...new Set(articles.map((a) => a.type))].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles List */}
      <div className="h-80 overflow-y-auto">
        {filteredArticles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No articles found
          </div>
        ) : (
          <div className="space-y-1">
            {filteredArticles.map((article, index) => (
              <div
                key={article.id}
                className="group p-4 hover:bg-gray-100 cursor-pointer border-l-4 border-transparent hover:border-gray-600 transition-all"
                onClick={() => window.location.href = `/article/${article.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-black">
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {article.type} • {article.year}
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ArticleList;
