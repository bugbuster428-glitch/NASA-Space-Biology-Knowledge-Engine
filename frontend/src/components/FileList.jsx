import { useState, useEffect } from "react";

function FileList({ datasetId }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!datasetId) return;
    fetch(`http://localhost:8000/api/dataset/${datasetId}/files`)
      .then(res => res.json())
      .then(data => {
        const fileList = Object.values(data || {});
        setFiles(fileList);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching files:", err);
        setLoading(false);
      });
  }, [datasetId]);

  if (!datasetId) return null;
  if (loading) return <p>Loading files...</p>;

  return (
    <div>
      <h3>Files ({files.length})</h3>
      <table>
        <thead>
          <tr>
            <th>File Name</th>
            <th>Category</th>
            <th>Size</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file, idx) => (
            <tr key={idx}>
              <td>{file.metadata?.file_name || "N/A"}</td>
              <td>{file.metadata?.category || "N/A"}</td>
              <td>{file.metadata?.file_size || "N/A"} bytes</td>
              <td>
                <a href={file.URL} target="_blank" rel="noopener noreferrer">
                  Download
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FileList;