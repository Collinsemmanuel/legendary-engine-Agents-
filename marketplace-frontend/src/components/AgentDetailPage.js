import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import agentService from '../services/agentService';
import './AgentDetailPage.css'; // Create this file for page-specific styles

// Helper for star ratings (can be moved to a utility file)
const renderStars = (ratingValue) => {
  const totalStars = 5;
  let stars = [];
  const numRating = parseFloat(ratingValue);
  for (let i = 1; i <= totalStars; i++) {
    if (i <= numRating) {
      stars.push(<span key={i} className="star filled">&#9733;</span>);
    } else if (i - 0.5 <= numRating) {
      stars.push(<span key={i} className="star half-filled">&#9733;</span>); // Simple half-star, could be improved
    } else {
      stars.push(<span key={i} className="star empty">&#9734;</span>);
    }
  }
  return stars;
};


function AgentDetailPage() {
  const { id: agentId } = useParams();
  const [agent, setAgent] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'reviews', 'documentation'

  useEffect(() => {
    if (!agentId) {
      setError("No Agent ID provided.");
      setIsLoading(false);
      return;
    }

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
  }, [agentId]);

  if (isLoading) {
    return <div className="loading-message">Loading agent details...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">Error: {error}</p>
        <Link to="/agents" className="back-link">Back to Agent List</Link>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="error-container">
        <p>Agent not found.</p>
        <Link to="/agents" className="back-link">Back to Agent List</Link>
      </div>
    );
  }
  
  // Mock data for display where not available from agent object yet
  const displayRating = agent.rating || 4.5; // Assume rating might not be on agent object yet
  const reviewCount = agent.reviewCount || Math.floor(Math.random() * 150) + 20; // Mock review count

  return (
    <div className="agent-detail-page-container">
      {/* Primary Details Section */}
      <section className="primary-details-section layout-row">
        <div className="agent-image-column">
          <div className="image-placeholder">
            {/* Placeholder for agent image/icon. Mockup uses a gradient and emoji. */}
            <span>🖼️</span> 
            {/* <img src={agent.imageUrl || "/default-agent-image.png"} alt={agent.name} /> */}
          </div>
        </div>

        <div className="agent-purchase-column">
          <h1>{agent.name}</h1>
          <div className="rating-reviews">
            {renderStars(displayRating)}
            <span className="review-count-text">({reviewCount} reviews)</span>
          </div>
          <div className="price-display">
            ${parseFloat(agent.price).toFixed(2)}
          </div>
          <div className="action-buttons">
            <button className="wf-button primary-action">Buy Now</button>
            <button className="wf-button secondary-action">Add to Cart</button>
          </div>
          <div className="whats-included">
            <h4>What's Included:</h4>
            <ul>
              <li>Agent Core Files ({agent.agent_file ? <a href={agent.agent_file} target="_blank" rel="noopener noreferrer">Download Link</a> : 'File link unavailable'})</li>
              <li>Standard Documentation</li>
              <li>Community Support Access</li>
              <li>Future Minor Updates (Version {agent.version})</li>
            </ul>
          </div>
           <div className="agent-meta-info">
            <p><strong>Version:</strong> {agent.version}</p>
            <p><strong>Uploaded by:</strong> {agent.uploaded_by_username || 'N/A'}</p>
            <p><strong>Last updated:</strong> {new Date(agent.updated_at).toLocaleDateString()}</p>
          </div>
        </div>
      </section>

      {/* Tabbed Interface Section */}
      <section className="tabbed-section">
        <nav className="wf-tabs">
          <button 
            className={`wf-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`wf-tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({reviewCount})
          </button>
          <button 
            className={`wf-tab ${activeTab === 'documentation' ? 'active' : ''}`}
            onClick={() => setActiveTab('documentation')}
          >
            Documentation
          </button>
        </nav>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-content">
              <h2>About This Agent</h2>
              <p>{agent.description || "No detailed description available."}</p>
              {/* Mockup shows "Key Features" blocks */}
              <h3>Key Features:</h3>
              <ul className="key-features-list">
                <li>Feature 1: High accuracy predictions.</li>
                <li>Feature 2: Scalable for enterprise use.</li>
                <li>Feature 3: Easy integration via API.</li>
                <li>Feature 4: Comprehensive documentation.</li>
              </ul>
            </div>
          )}
          {activeTab === 'reviews' && (
            <div className="reviews-content">
              <p>Reviews will be shown here. Users will be able to submit and view ratings and comments.</p>
              {/* Placeholder for review submission and list */}
            </div>
          )}
          {activeTab === 'documentation' && (
            <div className="documentation-content">
              <p>Documentation content will be loaded here. This might include Markdown rendering or embedded documents.</p>
              {/* Placeholder for documentation */}
            </div>
          )}
        </div>
      </section>
      <div style={{marginTop: '2rem', textAlign: 'center'}}>
        <Link to="/agents" className="back-link-styled">← Back to All Agents</Link>
      </div>
    </div>
  );
}

export default AgentDetailPage;
