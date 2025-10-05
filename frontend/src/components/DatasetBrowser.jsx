import { useState, useEffect, useMemo } from "react";
import Fuse from 'fuse.js';

// Import images from assets folder
import cellImage from '../assets/cell.webp';
import spaceStationImage from '../assets/SpaceStation.jpg';
import seedlingImage from '../assets/SeedlingGrowth.jpg';
import animalImage from '../assets/AnimalResearch.png';
import molecularImage from '../assets/Molecular Structure.jpg';
import organImage from '../assets/Organ Samples.webp';
import equipmentImage from '../assets/Equipment.webp';
import earthImage from '../assets/Earth from Space.jpg';

function DatasetBrowser() {
  const [allDatasets, setAllDatasets] = useState([]);
  const [filteredDatasets, setFilteredDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [viewMode, setViewMode] = useState("box");

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        // Check if data exists in session storage
        const cachedData = sessionStorage.getItem('nasa_datasets');
        if (cachedData) {
          const datasets = JSON.parse(cachedData);
          setAllDatasets(datasets);
          setFilteredDatasets(datasets);
          setLoading(false);
          return;
        }

        // Fetch from API if not cached
        const res = await fetch("http://localhost:8000/api/datasets/bulk");
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const datasets = await res.json();
        const datasetArray = Array.isArray(datasets) ? datasets : [];
        
        // Store in session storage
        sessionStorage.setItem('nasa_datasets', JSON.stringify(datasetArray));
        
        setAllDatasets(datasetArray);
        setFilteredDatasets(datasetArray);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching datasets:", err);
        setAllDatasets([]);
        setFilteredDatasets([]);
        setLoading(false);
      }
    };

    fetchDatasets();
  }, []);

  const fuse = useMemo(() => {
    try {
      return new Fuse(allDatasets, {
        keys: ['title', 'accession', 'organism', 'description', 'material'],
        threshold: 0.3,
        includeScore: true
      });
    } catch (error) {
      console.error('Error creating Fuse instance:', error);
      return null;
    }
  }, [allDatasets]);

  useEffect(() => {
    try {
      if (!searchTerm) {
        setFilteredDatasets(allDatasets);
      } else if (fuse) {
        const results = fuse.search(searchTerm);
        setFilteredDatasets(results.map(result => result.item));
      } else {
        setFilteredDatasets(allDatasets);
      }
      setCurrentPage(1);
    } catch (error) {
      console.error('Error filtering datasets:', error);
      setFilteredDatasets(allDatasets);
    }
  }, [searchTerm, allDatasets, fuse]);

  const totalPages = Math.ceil(filteredDatasets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDatasets = filteredDatasets.slice(startIndex, startIndex + itemsPerPage);

  const getImage = (ds) => {
    try {
      const title = (typeof ds?.title === 'string' ? ds.title : '').toLowerCase();
      const desc = (typeof ds?.description === 'string' ? ds.description : '').toLowerCase();
      const material = (typeof ds?.material === 'string' ? ds.material : '').toLowerCase();
      const organism = (typeof ds?.organism === 'string' ? ds.organism : '').toLowerCase();

    // Animal Research - mice, drosophila, etc.
    if (organism.includes('mus musculus') || organism.includes('mouse') || organism.includes('mice') || 
        organism.includes('drosophila') || organism.includes('melanogaster') || 
        title.includes('mouse') || title.includes('mice') || title.includes('drosophila') ||
        desc.includes('mouse') || desc.includes('mice') || desc.includes('drosophila') ||
        desc.includes('fruit flies') || desc.includes('animal')) return animalImage;
    
    // Organ/Tissue Samples - liver, brain, etc.
    if (material.includes('liver') || material.includes('brain') || material.includes('heart') ||
        material.includes('kidney') || material.includes('tissue') || material.includes('organ') ||
        title.includes('liver') || title.includes('brain') || title.includes('tissue') ||
        desc.includes('liver') || desc.includes('tissue') || desc.includes('organ')) return organImage;
    
    // Cell/Molecular - expression, transcriptomics, etc.
    if (title.includes('expression') || title.includes('transcriptomics') || title.includes('cell') ||
        title.includes('gene') || title.includes('dna') || title.includes('rna') ||
        desc.includes('expression') || desc.includes('transcriptomics') || desc.includes('microarray') ||
        desc.includes('gene') || desc.includes('molecular') || material.includes('cell')) return molecularImage;
    
    // Space Station/ISS
    if (title.includes('sts-') || title.includes('iss') || title.includes('space station') ||
        desc.includes('sts-') || desc.includes('space shuttle') || desc.includes('discovery') ||
        desc.includes('aboard') || desc.includes('spaceflight') || desc.includes('microgravity')) return spaceStationImage;
    
    // Plant/Seedling
    if (organism.includes('plant') || organism.includes('arabidopsis') || organism.includes('thaliana') ||
        title.includes('plant') || title.includes('seed') || desc.includes('plant') ||
        desc.includes('seed') || material.includes('plant')) return seedlingImage;
    
    // Equipment/Instruments
    if (title.includes('equipment') || title.includes('instrument') || title.includes('facility') ||
        desc.includes('equipment') || desc.includes('instrument') || desc.includes('apparatus')) return equipmentImage;
    
    // Earth/Environment
    if (title.includes('earth') || title.includes('environment') || title.includes('climate') ||
        desc.includes('earth') || desc.includes('environment') || desc.includes('climate')) return earthImage;
    
      // Default to cell image for general biological studies
      return cellImage;
    } catch (error) {
      console.error('Error getting image:', error);
      return cellImage;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400 mb-4"></div>
          <p className="text-xl text-white font-light">Loading NASA Datasets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">NASA Data & Experiments</h2>
        </div>
        
        {/* Controls Section */}
        <div className="bg-gray-50 rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-black text-white px-6 py-3 rounded-xl font-semibold text-lg shadow-lg">
                {filteredDatasets.length} Datasets
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-blue-300 hover:text-white transition-colors text-sm underline"
                >
                  Clear search
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-4 w-full lg:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 lg:w-96">
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by title, ID, organism..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/90 border-2 border-transparent rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white transition-all shadow-lg"
                />
              </div>
              
              {/* View Toggle */}
              <div className="flex gap-2 bg-white/20 rounded-xl p-1.5 shadow-lg">
                <button
                  onClick={() => setViewMode("box")}
                  className={`p-3 rounded-lg transition-all ${
                    viewMode === "box"
                      ? "bg-white shadow-lg text-blue-600"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                  title="Grid View"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                    <rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 rounded-lg transition-all ${
                    viewMode === "list"
                      ? "bg-white shadow-lg text-blue-600"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                  title="List View"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="6" width="18" height="2" rx="1"/>
                    <rect x="3" y="12" width="18" height="2" rx="1"/>
                    <rect x="3" y="18" width="18" height="2" rx="1"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Container */}
        <div className="bg-gray-50 rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
            {currentDatasets.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-20 h-20 text-blue-300 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-white text-xl">No datasets found</p>
                <p className="text-blue-300 mt-2">Try adjusting your search terms</p>
              </div>
            ) : (
              <div className={viewMode === "box" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
                {currentDatasets.map((ds) => {
                  try {
                    const image = getImage(ds);
                    return (
                      <div 
                        key={ds?.accession || Math.random()} 
                        className={`group bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer overflow-hidden border border-gray-100 ${
                          viewMode === "box" ? "" : ""
                        }`}
                        onClick={() => {
                          try {
                            if (ds?.accession) {
                              window.location.href = `/experiment/${ds.accession}`;
                            }
                          } catch (error) {
                            console.error('Error navigating to experiment:', error);
                          }
                        }}
                      >
                      {viewMode === "box" ? (
                        <div>
                          {/* Image Header */}
                          <div className="relative h-48 bg-black overflow-hidden">
                            {image ? (
                              <img 
                                src={image} 
                                alt={ds.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-20 h-20 text-white/30" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                                </svg>
                              </div>
                            )}
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700">
                              {ds.accession}
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="p-5">
                            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-black transition-colors">
                              {ds?.title || 'Untitled Dataset'}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                              {ds?.description || 'No description available'}
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="bg-gray-100 text-black px-2 py-1 rounded-md font-medium">
                                  {ds?.organism || 'Unknown'}
                                </span>
                                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-medium">
                                  {ds?.material || 'Unknown'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-5 p-5">
                          {/* Thumbnail */}
                          <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-black">
                            {image ? (
                              <img 
                                src={image} 
                                alt={ds.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-12 h-12 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <h3 className="font-bold text-xl text-gray-900 group-hover:text-black transition-colors line-clamp-2">
                                {ds?.title || 'Untitled Dataset'}
                              </h3>
                              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                                {ds?.accession || 'N/A'}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                              {ds?.description || 'No description available'}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Organism:</span>
                                <span className="font-medium text-gray-900">{ds?.organism || 'Unknown'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Material:</span>
                                <span className="font-medium text-gray-900">{ds?.material || 'Unknown'}</span>
                              </div>
                              {ds?.factor && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500">Factor:</span>
                                  <span className="font-medium text-gray-900">{ds.factor}</span>
                                </div>
                              )}
                              {ds?.funding && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500">Funding:</span>
                                  <span className="font-medium text-gray-900">{ds.funding}</span>
                                </div>
                              )}
                            </div>
                            
                            {ds?.publication && ds.publication !== "N/A" && (
                              <p className="text-xs text-gray-500 italic">
                                📄 {ds.publication}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      </div>
                    );
                  } catch (error) {
                    console.error('Error rendering dataset:', error);
                    return null;
                  }
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg border border-gray-300"
            >
              ← Previous
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-12 h-12 rounded-xl font-semibold transition-all ${
                      currentPage === pageNum
                        ? "bg-black text-white shadow-lg"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg border border-gray-300"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </div>
  );
}

export default DatasetBrowser;