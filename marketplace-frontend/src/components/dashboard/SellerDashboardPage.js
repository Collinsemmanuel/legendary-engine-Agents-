import React from 'react';
import { Link } from 'react-router-dom';
import AgentCard from '../agents/AgentCard'; // Reusing AgentCard for grid display
import './SellerDashboardPage.css'; // To be created

const SellerDashboardPage = () => {
  // Mock data for summary statistics
  const summaryStats = {
    totalEarnings: 1250.75,
    agentsSold: 350,
    listedAgents: 8,
    averageRating: 4.6,
  };

  // Mock data for "My Listed Agents"
  const listedAgents = [
    { 
      id: 'agent_seller_1', 
      name: 'My Custom Analyzer', 
      category: 'Data Science', 
      uploadDate: '2023-08-10', 
      price: 99.99, 
      sales: 150,
      status: 'Active',
      rating: 4.7, // Add rating to agent mock data for AgentCard
      description: 'A powerful analyzer for custom datasets.', // For AgentCard
      uploaded_by_username: 'CurrentSeller' // For AgentCard
    },
    { 
      id: 'agent_seller_2', 
      name: 'Creative Writing Helper', 
      category: 'NLP', 
      uploadDate: '2023-07-22', 
      price: 29.00, 
      sales: 120,
      status: 'Needs Review',
      rating: 4.5,
      description: 'Helps generate creative content and storylines.',
      uploaded_by_username: 'CurrentSeller'
    },
    { 
      id: 'agent_seller_3', 
      name: 'Secure File Encryptor', 
      category: 'Security', 
      uploadDate: '2023-05-01', 
      price: 49.50, 
      sales: 80,
      status: 'Disabled',
      rating: 4.2,
      description: 'Encrypts your files with industry-standard algorithms.',
      uploaded_by_username: 'CurrentSeller'
    },
  ];

  return (
    <div className="dashboard-page-container seller-dashboard">
      <header className="dashboard-header">
        <h1>Seller Dashboard</h1>
        <Link to="/upload" className="wf-button primary">
          + Upload New Agent
        </Link>
      </header>

      {/* Summary Statistic Cards */}
      <section className="dashboard-stats">
        <div className="stat-card">
          <h4>Total Earnings</h4>
          <p>${summaryStats.totalEarnings.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h4>Total Agents Sold</h4>
          <p>{summaryStats.agentsSold}</p>
        </div>
        <div className="stat-card">
          <h4>Active Listed Agents</h4>
          <p>{summaryStats.listedAgents}</p>
        </div>
        <div className="stat-card">
          <h4>Average Rating</h4>
          <p>{summaryStats.averageRating.toFixed(1)} ⭐</p>
        </div>
      </section>

      {/* My Listed Agents Section */}
      <section className="listed-agents-section">
        <div className="table-header"> {/* Reusing table-header for consistency */}
          <h2>My Listed Agents</h2>
          <div className="table-actions">
            <select className="wf-select filter-select" defaultValue="">
              <option value="" disabled>Filter by status...</option>
              <option value="active">Active</option>
              <option value="needs_review">Needs Review</option>
              <option value="disabled">Disabled</option>
            </select>
            {/* <input type="text" className="wf-input search-input" placeholder="Search my agents..." /> */}
          </div>
        </div>

        {/* Option 1: Grid of AgentCards */}
        <div className="agents-grid listed-agents-grid">
          {listedAgents.map((agent) => (
            // Modifying AgentCard invocation slightly if it needs more/different props from this context
            // Or, create a SellerAgentCard if modifications are significant
            <div key={agent.id} className="seller-agent-card-wrapper">
              <AgentCard agent={agent} /> 
              <div className="seller-agent-actions">
                <span className={`status-badge status-${agent.status.toLowerCase().replace(' ', '-')}`}>
                  Status: {agent.status}
                </span>
                <div className="action-buttons">
                  <button className="wf-button-link edit-button">Edit</button>
                  <button className="wf-button-link performance-button">Performance</button>
                </div>
              </div>
            </div>
          ))}
          {listedAgents.length === 0 && (
            <p className="no-agents-message">You haven't listed any agents yet.</p>
          )}
        </div>

        {/* Option 2: Table (Alternative, can be styled similarly to BuyerDashboard) */}
        {/* For now, sticking with AgentCard grid as it's more visual and reuses components well */}

      </section>
    </div>
  );
};

export default SellerDashboardPage;
