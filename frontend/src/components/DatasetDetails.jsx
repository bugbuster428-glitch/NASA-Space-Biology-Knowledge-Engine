import React, { useEffect, useState } from "react";
import { FileText, FlaskConical, Database, Users, Folder } from "lucide-react";

export default function DatasetDetails({ datasetId, showTitle = false }) {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!datasetId) return;
    const fetchDetails = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/dataset/${datasetId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        console.log("DatasetDetails: Received data:", data);
        console.log("Dataset structure:", data[Object.keys(data)[0]]);
        setDetails(data);
      } catch (err) {
        console.error("Error fetching dataset details:", err);
      }
    };
    fetchDetails();
  }, [datasetId]);

  if (!datasetId) return <p className="text-gray-500">Select a dataset.</p>;
  if (!details) return <p className="animate-pulse text-gray-600">Loading dataset details...</p>;

  const datasetKey = Object.keys(details)[0]; // e.g. "OSD-32"
  const dataset = details[datasetKey];
  const metadata = dataset.metadata || {};

  return (
    <div className="w-full bg-white">
      {/* Title Section - Only show if showTitle is true */}
      {showTitle && (
        <div className="bg-gray-50 py-12 border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-black mb-4 flex items-center justify-center gap-3">
                <div className="p-2 bg-black rounded-lg">
                  <Database className="w-8 h-8 text-white" />
                </div>
                {metadata["study title"] || datasetKey}
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto">
                {metadata["study description"]}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Content Sections */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Metadata Section */}
        <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-2xl flex items-center gap-3 text-black">
              <div className="p-2 bg-black rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              Metadata
            </h3>
            <div className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
              Research Data
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Organism</span>
              <p className="text-lg font-semibold text-black mt-1">{metadata.organism || "N/A"}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Material</span>
              <p className="text-lg font-semibold text-black mt-1">{metadata["material type"] || "N/A"}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Factor</span>
              <p className="text-lg font-semibold text-black mt-1">{metadata["study factor name"]} ({metadata["study factor type"]})</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Funding</span>
              <p className="text-lg font-semibold text-black mt-1">{metadata["study funding agency"] || "N/A"}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 md:col-span-2">
              <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Publication</span>
              <p className="text-lg font-semibold text-black mt-1">{metadata["study publication title"] || "N/A"}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 md:col-span-2">
              <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Authors</span>
              {metadata["study publication author list"] && metadata["study publication author list"].length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {metadata["study publication author list"].map((author, index) => (
                    <li key={index} className="text-base font-medium text-black flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0"></span>
                      {author}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-lg font-semibold text-black mt-1">N/A</p>
              )}
            </div>
          </div>
        </div>

        {/* Assays Section */}
        <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-2xl flex items-center gap-3 text-black">
              <div className="p-2 bg-black rounded-lg">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              Assays
            </h3>
            <div className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
              Laboratory Analysis
            </div>
          </div>
        {dataset.assays?.assays ? (
          <div className="space-y-2">
            {Object.entries(dataset.assays.assays).map(([assayName, assayData]) => (
              <div key={assayName} className="p-3 bg-gray-50 rounded border">
                <h4 className="font-medium text-gray-800 mb-1">{assayName}</h4>
                <p className="text-sm text-gray-600 mb-2">Type: {assayName.includes('transcription') ? 'Transcription Profiling' : assayName.includes('microarray') ? 'DNA Microarray' : 'Assay'}</p>
                {assayData.REST_URL && (
                  <a
                    className="text-green-600 text-sm underline hover:text-green-800 transition"
                    href={assayData.REST_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Assay Details →
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : dataset.assays?.REST_URL ? (
          <a
            className="text-green-600 font-medium underline hover:text-green-800 transition"
            href={dataset.assays.REST_URL}
            target="_blank"
            rel="noreferrer"
          >
            View Assays API →
          </a>
        ) : (
          <p className="text-gray-500 text-center py-8">No assays found</p>
        )}
        </div>

        {/* Files Section */}
        <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-2xl flex items-center gap-3 text-black">
              <div className="p-2 bg-black rounded-lg">
                <Folder className="w-6 h-6 text-white" />
              </div>
              Files
            </h3>
            <div className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
              {dataset.files ? Object.keys(dataset.files).length : 0} Files
            </div>
          </div>
        {dataset.files ? (
          <div className="max-h-60 overflow-y-auto space-y-2">
            {Object.entries(dataset.files).map(([fileName, fileData]) => {
              const fileType = fileName.split('.').pop()?.toUpperCase() || 'FILE';
              const isImage = ['PNG', 'JPG', 'JPEG'].includes(fileType);
              const isData = ['CSV', 'TSV', 'TXT'].includes(fileType);
              const isArchive = ['ZIP', 'GZ'].includes(fileType);
              
              return (
                <div key={fileName} className="p-3 bg-gray-50 rounded border flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 truncate">{fileName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded ${
                        isImage ? 'bg-green-100 text-green-700' :
                        isData ? 'bg-blue-100 text-blue-700' :
                        isArchive ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {fileType}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {fileData.URL && (
                      <a
                        href={fileData.URL}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition"
                      >
                        Download
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No files found</p>
        )}
        </div>
      </div>
    </div>
  );
}
