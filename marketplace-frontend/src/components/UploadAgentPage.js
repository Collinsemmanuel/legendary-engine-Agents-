import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import agentService from '../services/agentService';
import './UploadAgentPage.css'; // Create this file for page-specific styles

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

function UploadAgentPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('');
  const [price, setPrice] = useState('');
  const [agentFile, setAgentFile] = useState(null);
  const [error, setError] = useState(null);
  const [fileError, setFileError] = useState(null); // For file specific errors like type/size
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const fileInputRef = useRef(null); // To trigger file input click

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_EXTENSIONS = ['.zip', '.py', '.pkl', '.h5', '.pth', '.safetensors'];


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Basic client-side validation (can be enhanced)
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
        setFileError(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
        setAgentFile(null);
        if(fileInputRef.current) fileInputRef.current.value = ""; // Clear the input
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFileError(`File too large. Max size: ${formatFileSize(MAX_FILE_SIZE)}.`);
        setAgentFile(null);
        if(fileInputRef.current) fileInputRef.current.value = ""; // Clear the input
        return;
      }
      setAgentFile(file);
      setFileError(null); // Clear previous file error
    }
  };

  const handleRemoveFile = () => {
    setAgentFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Resets the file input
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');

    if (!agentFile) {
      setError("Agent file is required.");
      // setFileError("Please select an agent package file."); // More specific place for this error
      return;
    }
    if (fileError) { // If there's a client-side validated file error
        setError("Please fix the issues with the selected file.");
        return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('version', version);
    formData.append('price', price);
    formData.append('agent_file', agentFile);

    try {
      const response = await agentService.uploadAgent(formData);
      setSuccessMessage(`Agent "${response.data.name}" uploaded successfully! ID: ${response.data.id}`);
      setName('');
      setDescription('');
      setVersion('');
      setPrice('');
      handleRemoveFile(); // Clear the file input and state
      // navigate(`/agents/${response.data.id}`); // Or navigate to agent detail page
      setTimeout(() => navigate('/agents'), 2000); // Redirect after a short delay
    } catch (err) {
      let errorMessage = 'Upload failed. Please try again.';
      if (err.response && err.response.data) {
        const errors = err.response.data;
        if (typeof errors === 'string') {
          errorMessage = errors;
        } else if (errors.agent_file && Array.isArray(errors.agent_file)) {
          // Handle backend file validation errors specifically
          setFileError(errors.agent_file.join(' '));
          errorMessage = "Error with uploaded file. See details below file input.";
        } else {
          errorMessage = Object.entries(errors)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
        }
      }
      setError(errorMessage);
      console.error("Upload error:", err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="upload-page-container">
      <h1>Upload Your AI Agent</h1>
      <p className="upload-page-subtitle">Package your agent files and metadata to list it on the marketplace.</p>

      {isLoading && <div className="loading-indicator">Uploading... Please wait.</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message global-error">{error}</div>}

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-section metadata-section">
          <h2>Agent Details</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Agent Name</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="version">Version (e.g., 1.0.0)</label>
              <input type="text" id="version" value={version} onChange={(e) => setVersion(e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="4" required />
          </div>
          <div className="form-group">
            <label htmlFor="price">Price (USD)</label>
            <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} min="0" step="0.01" required />
          </div>
        </div>

        <div className="form-section file-upload-section">
          <h2>Agent Package File</h2>
          {/* Styled File Upload Zone */}
          <div
            className={`wf-upload-zone ${agentFile ? 'file-selected' : ''} ${fileError ? 'has-error' : ''}`}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <input
              type="file"
              id="agent_file_input"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }} // Hide the default input
              accept={ALLOWED_EXTENSIONS.join(',')}
            />
            {!agentFile && (
              <>
                <div className="upload-icon">📁</div>
                <p>Drag & drop your agent package here</p>
                <span className="browse-text">or click to browse</span>
                <button type="button" className="choose-files-button">Choose File</button>
              </>
            )}
            {agentFile && !fileError && ( // Show file details only if no error for this specific file
                 <div className="selected-file-info-in-zone">
                    <span className="file-icon">✔️</span>
                    <p>File Ready: {agentFile.name}</p>
                    <span>({formatFileSize(agentFile.size)})</span>
                 </div>
            )}
             {fileError && ( // Show file error directly in the zone
                 <div className="selected-file-info-in-zone error-state">
                    <span className="file-icon error-icon">⚠️</span>
                    <p>Error: {fileError}</p>
                    <span>Click to try again</span>
                 </div>
            )}
          </div>
          <p className="upload-guidelines">
            Supported formats: {ALLOWED_EXTENSIONS.join(', ')}. Max size: {formatFileSize(MAX_FILE_SIZE)}.
            <br/>Ensure your ZIP includes: `main.py`, `requirements.txt`, `config.json`, and a `README`.
          </p>

          {/* Display selected file details (mockup's file list style) */}
          {agentFile && (
            <div className="uploaded-files-list">
              <div className={`file-item ${fileError ? 'file-item-error' : ''}`}>
                <div className="file-icon">{agentFile.name.endsWith('.zip') ? '📦' : '📄'}</div>
                <div className="file-details">
                  <span className="file-name">{agentFile.name}</span>
                  <span className="file-size">{formatFileSize(agentFile.size)}</span>
                </div>
                <div className="file-status">
                  {fileError ? (
                    <span className="status-error">{fileError}</span>
                  ) : (
                    <span className="status-ready">Ready to upload</span>
                  )}
                </div>
                <div className="file-actions">
                  {/* <button type="button" className="preview-button">Preview</button> */}
                  <button type="button" onClick={handleRemoveFile} className="remove-button" aria-label="Remove file">
                    &times;
                  </button>
                </div>
              </div>
            </div>
          )}
           {/* Show backend file-specific error here if not shown in the zone */}
           {fileError && !agentFile && <div className="error-message file-specific-error">{fileError}</div>}


        </div>

        <div className="form-actions">
          <button type="submit" className="wf-button primary-upload-button" disabled={isLoading}>
            {isLoading ? 'Uploading Agent...' : 'Submit Agent'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UploadAgentPage;
