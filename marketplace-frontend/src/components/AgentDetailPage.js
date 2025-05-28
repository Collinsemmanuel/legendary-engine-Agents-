import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import agentService from '../services/agentService';

function AgentDetailPage() {
  const { id: agentId } = useParams(); // Get agentId from URL parameters
  const [agent, setAgent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!agentId) return;

    const fetchAgentDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await agentService.getAgentById(agentId);
        setAgent(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || `Failed to fetch agent ${agentId}.`);
        console.error(`Fetch agent ${agentId} error:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentDetails();
  }, [agentId]); // Refetch if agentId changes

  if (isLoading) {
    return <p>Loading agent details...</p>;
  }

  if (error) {
    return (
      <div>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <Link to="/agents">Back to Agent List</Link>
      </div>
    );
  }

  if (!agent) {
    return (
      <div>
        <p>Agent not found.</p>
        <Link to="/agents">Back to Agent List</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>{agent.name}</h1>
      <p><strong>Description:</strong> {agent.description}</p>
      <p><strong>Version:</strong> {agent.version}</p>
      <p><strong>Price:</strong> ${agent.price}</p>
      <p><strong>Uploaded by:</strong> {agent.uploaded_by_username || 'N/A'}</p>
      <p><strong>Uploaded at:</strong> {new Date(agent.created_at).toLocaleString()}</p>
      <p><strong>Last updated:</strong> {new Date(agent.updated_at).toLocaleString()}</p>
      {agent.agent_file ? (
        <p><a href={agent.agent_file} target="_blank" rel="noopener noreferrer">Download Agent File</a></p>
      ) : (
        <p>No file available for download.</p>
      )}
      <br />
      <Link to="/agents">Back to Agent List</Link>
    </div>
  );
}

export default AgentDetailPage;
