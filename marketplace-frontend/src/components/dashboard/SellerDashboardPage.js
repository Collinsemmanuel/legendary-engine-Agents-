import React, { useState, useEffect } from 'react'; // Import useState, useEffect
import { Link } from 'react-router-dom';
import AgentCard from '../agents/AgentCard';
import userService from '../../services/userService'; // Import userService
import './SellerDashboardPage.css';

const SellerDashboardPage = () => {
  // State for summary statistics
  const [summaryData, setSummaryData] = useState({
    listed_agents_count: 0,
    total_agents_sold_count: 0,
    total_earnings: 0,
    average_rating: "N/A",
  });
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [errorSummary, setErrorSummary] = useState(null);

  // State for "My Listed Agents"
  const [listedAgents, setListedAgents] = useState([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [errorAgents, setErrorAgents] = useState(null);
  const [currentAgentsPage, setCurrentAgentsPage] = useState(1);
  const [totalAgentsPages, setTotalAgentsPages] = useState(1);
  const [totalAgentsCount, setTotalAgentsCount] = useState(0);

  useEffect(() => {
    // Fetch summary data
    setIsLoadingSummary(true);
    userService.getSellerDashboardSummary()
      .then(data => {
        setSummaryData(data);
        setErrorSummary(null);
      })
      .catch(error => {
        console.error("Error fetching seller summary:", error);
        setErrorSummary(error.message || "Failed to fetch seller summary data.");
      })
      .finally(() => {
        setIsLoadingSummary(false);
      });
  }, []); // Fetch summary once on mount

  useEffect(() => {
    // Fetch listed agents data based on current page
    setIsLoadingAgents(true);
    userService.getSellerAgents(currentAgentsPage)
      .then(data => {
        setListedAgents(data.results || []);
        setTotalAgentsPages(Math.ceil((data.count || 0) / 10)); // Assuming 10 per page
        setTotalAgentsCount(data.count || 0);
        setErrorAgents(null);
      })
      .catch(error => {
        console.error("Error fetching seller agents:", error);
        setErrorAgents(error.message || "Failed to fetch listed agents.");
      })
      .finally(() => {
        setIsLoadingAgents(false);
      });
  }, [currentAgentsPage]); // Refetch agents when currentAgentsPage changes

  const handleNextAgentsPage = () => {
    if (currentAgentsPage < totalAgentsPages) {
      setCurrentAgentsPage(currentAgentsPage + 1);
    }
  };

  const handlePreviousAgentsPage = () => {
    if (currentAgentsPage > 1) {
      setCurrentAgentsPage(currentAgentsPage - 1);
    }
  };


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
        {isLoadingSummary ? <p className="loading-text">Loading summary...</p> : errorSummary ? <p className="error-text">{errorSummary}</p> : (
          <>
            <div className="stat-card">
              <h4>Total Earnings</h4>
              <p>${summaryData.total_earnings?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="stat-card">
              <h4>Agents Sold</h4> {/* Changed from "Total Agents Sold" for brevity */}
              <p>{summaryData.total_agents_sold_count}</p>
            </div>
            <div className="stat-card">
              <h4>Listed Agents</h4> {/* Changed from "Active Listed Agents" */}
              <p>{summaryData.listed_agents_count}</p>
            </div>
            <div className="stat-card">
              <h4>Average Rating</h4>
              <p>{summaryData.average_rating === "N/A" ? "N/A" : `${parseFloat(summaryData.average_rating).toFixed(1)} ⭐`}</p>
            </div>
          </>
        )}
      </section>

      {/* My Listed Agents Section */}
      <section className="listed-agents-section">
        <div className="table-header">
          <h2>My Listed Agents ({totalAgentsCount})</h2>
          <div className="table-actions">
            <select className="wf-select filter-select" defaultValue="">
              <option value="" disabled>Filter by status...</option>
              <option value="active">Active</option>
              <option value="needs_review">Needs Review</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>

        {isLoadingAgents && <p className="loading-text">Loading your agents...</p>}
        {errorAgents && <p className="error-message full-width-error">{errorAgents}</p>}

        {!isLoadingAgents && !errorAgents && (
          <>
            <div className="agents-grid listed-agents-grid">
              {listedAgents.map((agent) => (
                <div key={agent.id} className="seller-agent-card-wrapper">
                  <AgentCard agent={agent} /> {/* Pass the whole agent object */}
                  <div className="seller-agent-info-footer">
                    <span className={`status-badge status-${agent.status?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}`}>
                      Status: {agent.status || 'N/A'}
                    </span>
                    <span className="sales-count">
                      Sales: {agent.sales_count !== undefined ? agent.sales_count : 'N/A'}
                    </span>
                  </div>
                  <div className="seller-agent-actions">
                    <button className="wf-button-link edit-button">Edit Details</button>
                    <button className="wf-button-link performance-button">View Performance</button>
                  </div>
                </div>
              ))}
              {listedAgents.length === 0 && (
                <p className="no-agents-message">You haven't listed any agents yet.</p>
              )}
            </div>

            {totalAgentsPages > 1 && (
              <div className="pagination-controls">
                <button onClick={handlePreviousAgentsPage} disabled={currentAgentsPage === 1 || isLoadingAgents}>
                  Previous
                </button>
                <span> Page {currentAgentsPage} of {totalAgentsPages} </span>
                <button onClick={handleNextAgentsPage} disabled={currentAgentsPage === totalAgentsPages || isLoadingAgents}>
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default SellerDashboardPage;
