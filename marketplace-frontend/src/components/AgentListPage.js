import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import agentService from '../services/agentService';

function AgentListPage() {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAgents, setTotalAgents] = useState(0);


  useEffect(() => {
    const fetchAgents = async (page) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await agentService.getAgents(page);
        setAgents(response.data.results || []); // API returns paginated results in 'results'
        setTotalPages(Math.ceil((response.data.count || 0) / 10)); // Assuming 10 items per page (matches backend)
        setTotalAgents(response.data.count || 0);
        setCurrentPage(page);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to fetch agents.');
        console.error("Fetch agents error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents(currentPage);
  }, [currentPage]); // Refetch when currentPage changes

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoading) {
    return <p>Loading agents...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  return (
    <div>
      <h1>List of AI Agents</h1>
      <p>Total Agents: {totalAgents}</p>
      {agents.length === 0 ? (
        <p>No agents found.</p>
      ) : (
        <ul>
          {agents.map((agent) => (
            <li key={agent.id} style={{ borderBottom: '1px solid #ccc', marginBottom: '10px', paddingBottom: '10px' }}>
              <h2><Link to={`/agents/${agent.id}`}>{agent.name}</Link></h2>
              <p><strong>Description:</strong> {agent.description}</p>
              <p><strong>Price:</strong> ${agent.price}</p>
              <p><strong>Uploaded by:</strong> {agent.uploaded_by_username || 'N/A'}</p>
              <p><strong>Version:</strong> {agent.version}</p>
              {agent.agent_file && <p><a href={agent.agent_file} target="_blank" rel="noopener noreferrer">Download Agent File</a></p>}
            </li>
          ))}
        </ul>
      )}
      <div>
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span> Page {currentPage} of {totalPages} </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}

export default AgentListPage;
