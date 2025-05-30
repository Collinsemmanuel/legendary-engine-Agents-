import React from 'react';
import { Link } from 'react-router-dom';
import './BuyerDashboardPage.css'; // To be created

// Mockup classes for styling reference:
// .dashboard-header: display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;
// .dashboard-stats .stat-card: background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: ...;
// .purchases-section .table-header: display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;
// .wf-table, .wf-th, .wf-td, .wf-button, .wf-select
// .status-active: background: #dcfce7; color: #166534; padding: 0.25rem 0.5rem; border-radius: 0.25rem;

const BuyerDashboardPage = () => {
  // Mock data for summary statistics
  const summaryStats = {
    purchasedAgents: 12,
    totalSpent: 499.50,
    activeDeployments: 3,
  };

  // Mock data for "My Purchases" table
  const purchases = [
    { 
      id: 'agent1', 
      icon: '🤖', 
      name: 'Data Analyzer Pro', 
      category: 'Analytics', 
      purchaseDate: '2023-10-15', 
      price: 79.99, 
      status: 'Active' 
    },
    { 
      id: 'agent2', 
      icon: '🎨', 
      name: 'Image Upscaler AI', 
      category: 'Image Processing', 
      purchaseDate: '2023-09-01', 
      price: 49.00, 
      status: 'Inactive' 
    },
    { 
      id: 'agent3', 
      icon: '✍️', 
      name: 'Content Writer Bot', 
      category: 'Text Generation', 
      purchaseDate: '2023-11-20', 
      price: 120.00, 
      status: 'Active' 
    },
  ];

  return (
    <div className="dashboard-page-container">
      <header className="dashboard-header">
        <h1>My Dashboard</h1>
        <Link to="/agents" className="wf-button primary">
          Browse More Agents
        </Link>
      </header>

      {/* Summary Statistic Cards */}
      <section className="dashboard-stats">
        <div className="stat-card">
          <h4>Purchased Agents</h4>
          <p>{summaryStats.purchasedAgents}</p>
        </div>
        <div className="stat-card">
          <h4>Total Spent</h4>
          <p>${summaryStats.totalSpent.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h4>Active Deployments</h4>
          <p>{summaryStats.activeDeployments}</p>
        </div>
      </section>

      {/* My Purchases Table */}
      <section className="purchases-section">
        <div className="table-header">
          <h2>My Purchases</h2>
          <div className="table-actions">
            <select className="wf-select filter-select" defaultValue="">
              <option value="" disabled>Filter by...</option>
              <option value="all">All Purchases</option>
              <option value="this_month">This Month</option>
              <option value="last_3_months">Last 3 Months</option>
            </select>
            <button className="wf-button secondary export-button">Export CSV</button>
          </div>
        </div>
        <div className="table-responsive-wrapper">
          <table className="wf-table purchases-table">
            <thead>
              <tr>
                <th className="wf-th">Agent</th>
                <th className="wf-th">Purchase Date</th>
                <th className="wf-th">Price</th>
                <th className="wf-th">Status</th>
                <th className="wf-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="wf-tr">
                  <td className="wf-td agent-cell">
                    <span className="agent-icon">{purchase.icon}</span>
                    <div className="agent-info">
                      <Link to={`/agents/${purchase.id}`} className="agent-name-link">{purchase.name}</Link>
                      <span className="agent-category">{purchase.category}</span>
                    </div>
                  </td>
                  <td className="wf-td">{purchase.purchaseDate}</td>
                  <td className="wf-td">${purchase.price.toFixed(2)}</td>
                  <td className="wf-td">
                    <span className={`status-badge status-${purchase.status.toLowerCase()}`}>
                      {purchase.status}
                    </span>
                  </td>
                  <td className="wf-td actions-cell">
                    <Link to={`/agents/${purchase.id}`} className="wf-button-link view-details-button">View</Link>
                    <button className="wf-button-link deploy-button">Deploy</button> 
                    {/* Deploy functionality is UI only for now */}
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr className="wf-tr">
                  <td colSpan="5" className="wf-td text-center">No purchases yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default BuyerDashboardPage;
