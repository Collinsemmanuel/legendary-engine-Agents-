import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import agentService from '../services/agentService';

function UploadAgentPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('');
  const [price, setPrice] = useState('');
  const [agentFile, setAgentFile] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setAgentFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');
    setIsLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('version', version);
    formData.append('price', price);
    if (agentFile) {
      formData.append('agent_file', agentFile);
    } else {
      setError("Agent file is required.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await agentService.uploadAgent(formData);
      setSuccessMessage(`Agent "${response.data.name}" uploaded successfully!`);
      // Optionally clear form or redirect
      setName('');
      setDescription('');
      setVersion('');
      setPrice('');
      setAgentFile(null);
      // document.getElementById('agent_file_input').value = null; // Reset file input
      // navigate(`/agents/${response.data.id}`); // Navigate to agent detail page
      navigate('/agents'); // Or navigate to agent list page
    } catch (err) {
      let errorMessage = 'Upload failed. Please try again.';
      if (err.response && err.response.data) {
        // Try to parse and display backend errors
        const errors = err.response.data;
        if (typeof errors === 'string') {
          errorMessage = errors;
        } else {
          errorMessage = Object.keys(errors)
            .map(key => `${key}: ${errors[key].join ? errors[key].join(', ') : errors[key]}`)
            .join('\n');
        }
      }
      setError(errorMessage);
      console.error("Upload error:", err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Upload Your AI Agent</h1>
      {isLoading && <p>Uploading...</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {error && <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>{error}</pre>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="version">Version:</label>
          <input
            type="text"
            id="version"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="price">Price:</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            step="0.01"
            required
          />
        </div>
        <div>
          <label htmlFor="agent_file">Agent File:</label>
          <input
            type="file"
            id="agent_file_input" // Added id for potential reset
            onChange={handleFileChange}
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Uploading...' : 'Upload Agent'}
        </button>
      </form>
    </div>
  );
}

export default UploadAgentPage;
