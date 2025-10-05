import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import cellImage from '../assets/cell.webp';
import spaceStationImage from '../assets/SpaceStation.jpg';
import seedlingImage from '../assets/SeedlingGrowth.jpg';
import animalImage from '../assets/AnimalResearch.png';
import molecularImage from '../assets/Molecular Structure.jpg';
import organImage from '../assets/Organ Samples.webp';
import equipmentImage from '../assets/Equipment.webp';
import earthImage from '../assets/Earth from Space.jpg';

export default function ExperimentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experiment, setExperiment] = useState(null);
  const [assays, setAssays] = useState([]);
  const [assayDetails, setAssayDetails] = useState({});
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedAssay, setExpandedAssay] = useState(null);
  const [loadingAssayDetails, setLoadingAssayDetails] = useState(false);

  useEffect(() => {
    fetchExperimentData();
  }, [id]);

  const fetchAssayDetails = async (assayUrl, idx) => {
    console.log('Clicked assay button, idx:', idx, 'current expanded:', expandedAssay);
    
    if (expandedAssay === idx) {
      setExpandedAssay(null);
      return;
    }
    
    setLoadingAssayDetails(true);
    setExpandedAssay(idx);
    
    try {
      const response = await axios.get(`http://localhost:8000/api/assay-details?url=${encodeURIComponent(assayUrl)}`);
      const details = response.data;
      setAssayDetails(prev => ({ ...prev, [idx]: details }));
    } catch (error) {
      console.error('Error fetching assay details:', error);
      setAssayDetails(prev => ({ ...prev, [idx]: { error: `Failed to load details: ${error.message}` } }));
    } finally {
      setLoadingAssayDetails(false);
    }
  };

  const fetchExperimentData = async () => {
    try {
      setLoading(true);
      
      const expResponse = await axios.get(`http://localhost:8000/api/dataset/${id}`);
      const datasetKey = Object.keys(expResponse.data)[0];
      setExperiment(expResponse.data[datasetKey]);
      
      try {
        const assaysResponse = await axios.get(`http://localhost:8000/api/dataset/${id}/assays`);
        const assaysData = assaysResponse.data;
        
        const assaysList = [];
        if (assaysData && typeof assaysData === 'object') {
          Object.keys(assaysData).forEach(datasetId => {
            if (assaysData[datasetId] && assaysData[datasetId].assays) {
              Object.entries(assaysData[datasetId].assays).forEach(([key, value]) => {
                assaysList.push({
                  name: key,
                  url: value.REST_URL
                });
              });
            }
          });
        }
        setAssays(assaysList);
      } catch (err) {
        console.error('Error fetching assays:', err);
        setAssays([]);
      }
      
      try {
        const filesResponse = await axios.get(`http://localhost:8000/api/dataset/${id}/files`);
        const filesData = filesResponse.data;
        
        let filesList = [];
        if (filesData && typeof filesData === 'object') {
          Object.keys(filesData).forEach(datasetKey => {
            if (filesData[datasetKey] && filesData[datasetKey].files) {
              Object.entries(filesData[datasetKey].files).forEach(([fileName, fileInfo]) => {
                filesList.push({
                  name: fileName,
                  url: fileInfo.URL || fileInfo.REST_URL,
                  restUrl: fileInfo.REST_URL
                });
              });
            }
          });
        }
        setFiles(filesList);
      } catch (err) {
        console.error('Error fetching files:', err);
        setFiles([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching experiment:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔬</div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>Loading Experiment Data...</div>
        </div>
      </div>
    );
  }

  if (!experiment) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>Experiment Not Found</div>
          <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '12px 24px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const metadata = experiment.metadata || {};

  const getHeaderImage = () => {
    const title = (metadata['study title'] || '').toLowerCase();
    const desc = (metadata['study description'] || '').toLowerCase();
    const material = (metadata['material type'] || '').toLowerCase();
    const organism = (metadata.organism || '').toLowerCase();

    if (organism.includes('mus musculus') || organism.includes('mouse') || organism.includes('mice') || 
        organism.includes('drosophila') || title.includes('mouse') || desc.includes('mouse')) return animalImage;
    if (material.includes('liver') || material.includes('brain') || material.includes('tissue') || 
        title.includes('tissue') || desc.includes('tissue')) return organImage;
    if (title.includes('expression') || title.includes('transcriptomics') || title.includes('cell') ||
        desc.includes('expression') || desc.includes('molecular')) return molecularImage;
    if (title.includes('sts-') || title.includes('iss') || desc.includes('space shuttle') || 
        desc.includes('spaceflight')) return spaceStationImage;
    if (organism.includes('plant') || organism.includes('arabidopsis') || title.includes('plant') || 
        desc.includes('plant')) return seedlingImage;
    if (title.includes('equipment') || title.includes('instrument')) return equipmentImage;
    if (title.includes('earth') || title.includes('environment')) return earthImage;
    return cellImage;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      <nav style={{ background: '#000', color: 'white', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 20px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '22px', fontWeight: 700 }}>
          <span>NASA OSDR Experiments</span>
        </div>
        <button onClick={() => navigate('/')} style={{ background: '#fff', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '15px' }}>
          ← Back to Home
        </button>
      </nav>

      <div style={{ position: 'relative', color: '#fff', padding: '60px 40px', borderBottom: '1px solid #333', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${getHeaderImage()})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.5 }}></div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.6))' }}></div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {metadata.accession || id}
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: 900, marginBottom: '20px', lineHeight: 1.2, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            {metadata['study title'] || 'Experiment Details'}
          </h1>
          <div style={{ fontSize: '18px', lineHeight: 1.6, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {metadata['study description']?.substring(0, 300)}...
          </div>
        </div>
      </div>

      <div style={{ background: '#000', borderBottom: '2px solid #333', position: 'sticky', top: '90px', zIndex: 50 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '40px', padding: '0 40px' }}>
          {['overview', 'assays', 'files', 'protocols'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                padding: '20px 0',
                fontSize: '16px',
                fontWeight: 700,
                color: activeTab === tab ? '#fff' : '#666',
                borderBottom: activeTab === tab ? '3px solid #fff' : '3px solid transparent',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 40px' }}>
        {activeTab === 'overview' && (
          <div>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '30px', marginBottom: '20px', border: '1px solid #ddd' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '20px', color: '#000' }}>Study Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <InfoItem label="Organism" value={metadata.organism} />
                <InfoItem label="Project Type" value={metadata['project type']} />
                <InfoItem label="Material Type" value={metadata['material type']} />
                <InfoItem label="Flight Program" value={metadata['flight program']} />
                <InfoItem label="Managing Center" value={metadata['managing nasa center']} />
                <InfoItem label="Space Program" value={metadata['space program']} />
              </div>
            </div>

            {metadata.mission && (
              <div style={{ background: '#fff', borderRadius: '12px', padding: '30px', marginBottom: '20px', border: '1px solid #ddd' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '20px', color: '#000' }}>Mission Details</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <InfoItem label="Mission Name" value={metadata.mission.name} />
                  <InfoItem label="Start Date" value={metadata.mission['start date']} />
                  <InfoItem label="End Date" value={metadata.mission['end date']} />
                </div>
              </div>
            )}

            <div style={{ background: '#fff', borderRadius: '12px', padding: '30px', border: '1px solid #ddd' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '20px', color: '#000' }}>Study Description</h2>
              <p style={{ fontSize: '16px', lineHeight: 1.8, color: '#333' }}>
                {metadata['study description']}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'assays' && (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '30px', border: '1px solid #ddd' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '20px', color: '#000' }}>Assays ({assays.length})</h2>
            {assays.length > 0 ? (
              <div style={{ display: 'grid', gap: '20px' }}>
                {assays.map((assay, idx) => {
                  const parts = assay.name.split('_');
                  const measurement = parts.find(p => p.includes('transcription') || p.includes('profiling')) || 'Unknown';
                  const technology = parts.find(p => p.includes('microarray') || p.includes('sequencing')) || 'Unknown';
                  const platform = parts[parts.length - 1] || 'Unknown';
                  
                  return (
                    <div key={idx} style={{ padding: '25px', background: '#f5f5f5', borderRadius: '12px', border: '1px solid #ddd' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ width: '50px', height: '50px', background: '#e0e0e0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                          🔬
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '20px', fontWeight: 800, color: '#000', marginBottom: '5px' }}>
                            Assay {idx + 1}
                          </div>
                          <div style={{ fontSize: '13px', color: '#666' }}>
                            {assay.name}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ddd' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                          <div>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Measurement</div>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#000' }}>{measurement.replace(/-/g, ' ')}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Technology</div>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#000' }}>{technology.replace(/-/g, ' ')}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Platform</div>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#000' }}>{platform}</div>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => fetchAssayDetails(assay.url, idx)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: '#000',
                          border: '1px solid #000',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#333'}
                        onMouseLeave={(e) => e.target.style.background = '#000'}
                      >
                        {expandedAssay === idx ? '▲ Hide Full Details' : '▼ View Full Assay Details'}
                      </button>
                      
                      {expandedAssay === idx && (
                        <div style={{ marginTop: '15px', padding: '20px', background: '#f9f9f9', borderRadius: '8px', color: '#000', border: '1px solid #ddd' }}>
                          {loadingAssayDetails ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                              <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
                              <div>Loading details...</div>
                            </div>
                          ) : assayDetails[idx]?.error ? (
                            <div style={{ color: '#e53e3e', textAlign: 'center' }}>{assayDetails[idx].error}</div>
                          ) : assayDetails[idx] ? (
                            <div>
                              <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '15px', color: '#000' }}>Full Assay Information</div>
                              {(() => {
                                const data = assayDetails[idx];
                                const assayKey = Object.keys(data)[0];
                                const assayData = data[assayKey]?.assays?.[Object.keys(data[assayKey]?.assays || {})[0]];
                                const metadata = assayData?.metadata || {};
                                const samples = assayData?.samples || {};
                                const sampleNames = Object.keys(samples).filter(k => k !== 'REST_URL');
                                
                                return (
                                  <div style={{ display: 'grid', gap: '20px' }}>
                                    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
                                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '15px' }}>📋 Assay Metadata</div>
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        {Object.entries(metadata).map(([key, value]) => (
                                          <div key={key} style={{ padding: '12px', background: '#f9f9f9', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
                                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#666', marginBottom: '5px', textTransform: 'uppercase' }}>{key.replace(/study assay /g, '').replace(/_/g, ' ')}</div>
                                            <div style={{ fontSize: '14px', color: '#000', fontWeight: 600 }}>{value || 'N/A'}</div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    {sampleNames.length > 0 && (
                                      <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
                                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '10px' }}>🧪 Samples ({sampleNames.length})</div>
                                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>Biological samples used in this assay</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                                          {sampleNames.map((sampleName, sidx) => {
                                            const sampleUrl = samples[sampleName]?.REST_URL;
                                            return (
                                              <div key={sidx} style={{ padding: '12px', background: '#f0f7ff', borderRadius: '6px', border: '1px solid #d0e7ff' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: sampleUrl ? '8px' : '0' }}>
                                                  <div style={{ width: '30px', height: '30px', background: '#000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>{sidx + 1}</div>
                                                  <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#000', wordBreak: 'break-word' }}>{sampleName}</div>
                                                  </div>
                                                </div>
                                                {sampleUrl && (
                                                  <a href={sampleUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '6px 12px', background: '#000', color: '#fff', borderRadius: '4px', textDecoration: 'none', fontSize: '11px', fontWeight: 600, marginLeft: '40px' }}>
                                                    View Sample API →
                                                  </a>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔬</div>
                <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '10px' }}>No assays available</div>
                <div style={{ fontSize: '14px' }}>This experiment does not have any assays data</div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'files' && (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '30px', border: '1px solid #ddd' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '20px', color: '#000' }}>Files ({files.length})</h2>
            
            {files.length > 0 ? (
              <div style={{ display: 'grid', gap: '10px', maxHeight: '600px', overflowY: 'auto' }}>
                {files.map((file, idx) => {
                  const fileExt = file.name.split('.').pop().toLowerCase();
                  const isImage = ['png', 'jpg', 'jpeg', 'gif'].includes(fileExt);
                  const isData = ['csv', 'tsv', 'txt'].includes(fileExt);
                  const isArchive = ['zip', 'gz', 'tar'].includes(fileExt);
                  
                  return (
                    <div key={idx} style={{ padding: '15px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '24px' }}>
                          {isImage ? '🖼️' : isData ? '📊' : isArchive ? '📦' : '📄'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#000', wordBreak: 'break-all' }}>
                            {file.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                            {fileExt.toUpperCase()} file
                          </div>
                        </div>
                      </div>
                      <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 16px', background: '#000', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: '12px' }}>
                        Download
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📁</div>
                <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '10px' }}>No files available</div>
                <div style={{ fontSize: '14px' }}>This experiment does not have any files</div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'protocols' && (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '30px', border: '1px solid #ddd' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '20px', color: '#000' }}>Study Protocols</h2>
            {metadata['study protocol name'] && metadata['study protocol description'] ? (
              <div style={{ display: 'grid', gap: '20px' }}>
                {metadata['study protocol name'].map((name, idx) => (
                  <div key={idx} style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: '#000' }}>
                      {name}
                    </div>
                    <div style={{ fontSize: '14px', color: '#333', lineHeight: 1.6 }}>
                      {metadata['study protocol description'][idx]}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                No protocols available for this experiment
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#000', marginBottom: '5px', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: '16px', color: '#333' }}>
        {value}
      </div>
    </div>
  );
}
