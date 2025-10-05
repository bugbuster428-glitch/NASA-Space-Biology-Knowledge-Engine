import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DatasetDetails from "./DatasetDetails";
import Footer from "./Footer";


// Import images from assets folder
import cellImage from '../assets/cell.webp';
import spaceStationImage from '../assets/SpaceStation.jpg';
import seedlingImage from '../assets/SeedlingGrowth.jpg';
import animalImage from '../assets/AnimalResearch.png';
import molecularImage from '../assets/Molecular Structure.jpg';
import organImage from '../assets/Organ Samples.webp';
import equipmentImage from '../assets/Equipment.webp';
import earthImage from '../assets/Earth from Space.jpg';

function DatasetPage() {
  const { datasetId } = useParams();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState(null);

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

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/dataset/${datasetId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const datasetKey = Object.keys(data)[0];
        const datasetInfo = data[datasetKey];
        setDataset({
          title: datasetInfo?.metadata?.["study title"] || datasetId,
          description: datasetInfo?.metadata?.["study description"] || '',
          organism: datasetInfo?.metadata?.organism || '',
          material: datasetInfo?.metadata?.["material type"] || ''
        });
      } catch (error) {
        console.error('Error fetching dataset:', error);
      }
    };
    
    if (datasetId) {
      fetchDataset();
    }
  }, [datasetId]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-white font-bold text-lg m-0">
                  NASA Space Biology
                </h1>
                <p className="text-gray-400 text-xs m-0">Dataset Details</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Image - Full Width */}
      {dataset && (
        <div className="relative h-80 bg-black overflow-hidden">
          <img 
            src={getImage(dataset)} 
            alt={dataset.title}
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-black/80"></div>
          
          <div className="absolute bottom-8 left-8 text-white max-w-5xl">
            <h1 className="text-5xl font-bold mb-4">{dataset.title}</h1>
            <div className="flex items-center gap-4">
              <span className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg text-white font-semibold text-xl">
                {datasetId}
              </span>
              <div className="flex items-center gap-3 text-gray-200">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className="font-medium text-lg">NASA Verified</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dataset Details - Full Width */}
      <div className="w-full">
        <DatasetDetails datasetId={datasetId} showTitle={true} />
      </div>


      {/* Footer */}
      <Footer />
    </div>
  );
}

export default DatasetPage;