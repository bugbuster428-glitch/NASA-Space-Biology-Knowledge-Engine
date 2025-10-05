import { useState } from "react"
import ArticleList from "./components/ArticleList.jsx"
import DatasetViewer from "./components/DatasetViewer.jsx"
import Footer from "./components/Footer.jsx"
import heroVideo from "./assets/856857-uhd_4096_2160_30fps.mp4"
import nasaLogo from "./assets/nasalogo.png"
import btn1 from "./assets/btn1.png"
import btn2 from "./assets/btn2.jpg"
import btn3 from "./assets/btn3.jpg"

function App() {
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [showArticles, setShowArticles] = useState(false)
  const [showDatasets, setShowDatasets] = useState(false)

  return (
    <div className="bg-gray-50 text-gray-900">
      {/* Navbar */}
      <nav className="bg-black border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={nasaLogo} alt="NASA" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="text-white font-bold text-lg m-0">
                  NASA Space Biology
                </h1>
                <p className="text-gray-400 text-xs m-0">Research Platform</p>
              </div>
            </div>
            <div className="flex gap-6">
              {["Home", "Research", "Data", "Analytics", "About"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-black text-white min-h-[90vh] flex items-center overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-left">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Explore the Universe of <br /> Space Biology
          </h1>
          <p className="text-lg text-gray-200 max-w-3xl leading-relaxed mb-8">
            The NASA Open Science Data Repository (OSDR) provides open access to
            biological and space science datasets from spaceflight and ground
            studies, enabling data reuse for discovery and innovation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => {
                document.querySelector('.bg-gray-100.py-8')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-6 py-3 bg-white text-black rounded-md font-semibold hover:bg-gray-200 transition"
            >
              Explore Research Data
            </button>
            <button className="px-6 py-3 border border-white text-white rounded-md font-semibold hover:bg-white hover:text-black transition">
              Explore Experiments
            </button>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Research Path</h2>
            <p className="text-xl text-gray-600">Select a category to explore NASA's space biology resources</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              onClick={() => {
                setShowArticles(true)
                setShowDatasets(false)
                setTimeout(() => {
                  document.querySelector('.articles-section')?.scrollIntoView({ behavior: 'smooth' })
                }, 100)
              }}
              className="rounded-lg p-16 text-left min-h-[280px] flex flex-col justify-center bg-cover bg-center relative hover:shadow-lg hover:-translate-y-2 transition-all"
              style={{ backgroundImage: `url(${btn1})` }}
            >
              <div className="absolute inset-0 bg-black/70 rounded-lg"></div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-white mb-4">NASA Articles & Publications</h3>
                <p className="text-gray-200 text-lg leading-relaxed">Shows open-access articles, publications, CSV links, etc.</p>
              </div>
            </button>
            
            <button 
              onClick={() => {
                setShowDatasets(true)
                setShowArticles(false)
                setTimeout(() => {
                  document.querySelector('.dataset-viewer')?.scrollIntoView({ behavior: 'smooth' })
                }, 100)
              }}
              className="rounded-lg p-16 text-left min-h-[280px] flex flex-col justify-center bg-cover bg-center relative hover:shadow-lg hover:-translate-y-2 transition-all"
              style={{ backgroundImage: `url(${btn2})` }}
            >
              <div className="absolute inset-0 bg-black/70 rounded-lg"></div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-white mb-4">NASA Data & Experiments</h3>
                <p className="text-gray-200 text-lg leading-relaxed">Browse datasets from OSDR, experiments, biospecimens, etc.</p>
              </div>
            </button>
            
            <button 
              onClick={() => window.location.href = '/taskbook'}
              className="rounded-lg p-16 text-left min-h-[280px] flex flex-col justify-center bg-cover bg-center relative hover:shadow-lg hover:-translate-y-2 transition-all"
              style={{ backgroundImage: `url(${btn3})` }}
            >
              <div className="absolute inset-0 bg-black/70 rounded-lg"></div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-white mb-4">Research Tools & Libraries</h3>
                <p className="text-gray-200 text-lg leading-relaxed">NASA Task Book, Space Life Sciences Library, APIs, external tools.</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Articles Layout */}
      {showArticles && (
        <div className="max-w-7xl mx-auto px-6 py-12 articles-section">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ArticleList onSelectArticle={setSelectedArticle} />
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-4">Research Publications</h3>
                <p className="text-sm text-gray-600">Browse NASA space biology research papers and publications.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Datasets Layout */}
      {showDatasets && (
        <div className="max-w-7xl mx-auto px-6 py-12 dataset-viewer">
          <DatasetViewer />
        </div>
      )}

    
      
      <Footer />
    </div>
  )
}

export default App