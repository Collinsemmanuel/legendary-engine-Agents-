import React, { useState, useEffect } from 'react'; // Import useState, useEffect
import { Link } from 'react-router-dom';
import userService from '../../services/userService'; // Import userService
import './BuyerDashboardPage.css';

const BuyerDashboardPage = () => {
  // State for summary statistics
  const [summaryData, setSummaryData] = useState({
    total_purchased_agents: 0,
    total_spent: 0,
    active_deployments: 0,
  });
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [errorSummary, setErrorSummary] = useState(null);

  // State for "My Purchases" table
  const [purchases, setPurchases] = useState([]);
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(true);
  const [errorPurchases, setErrorPurchases] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPurchasesCount, setTotalPurchasesCount] = useState(0);


  useEffect(() => {
    // Fetch summary data
    setIsLoadingSummary(true);
    userService.getBuyerDashboardSummary()
      .then(data => {
        setSummaryData(data);
        setErrorSummary(null);
      })
      .catch(error => {
        console.error("Error fetching buyer summary:", error);
        setErrorSummary(error.message || "Failed to fetch summary data.");
      })
      .finally(() => {
        setIsLoadingSummary(false);
      });
  }, []); // Fetch summary once on mount

  useEffect(() => {
    // Fetch purchases data based on current page
    setIsLoadingPurchases(true);
    userService.getBuyerPurchases(currentPage)
      .then(data => {
        setPurchases(data.results || []);
        setTotalPages(Math.ceil((data.count || 0) / 10)); // Assuming 10 items per page from backend pagination
        setTotalPurchasesCount(data.count || 0);
        setErrorPurchases(null);
      })
      .catch(error => {
        console.error("Error fetching buyer purchases:", error);
        setErrorPurchases(error.message || "Failed to fetch purchase history.");
      })
      .finally(() => {
        setIsLoadingPurchases(false);
      });
  }, [currentPage]); // Refetch purchases when currentPage changes

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
        {isLoadingSummary ? <p className="loading-text">Loading summary...</p> : errorSummary ? <p className="error-text">{errorSummary}</p> : (
          <>
            <div className="stat-card">
              <h4>Purchased Agents</h4>
              <p>{summaryData.total_purchased_agents}</p>
            </div>
            <div className="stat-card">
              <h4>Total Spent</h4>
              <p>${summaryData.total_spent?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="stat-card">
              <h4>Active Deployments</h4>
              <p>{summaryData.active_deployments}</p>
            </div>
          </>
        )}
      </section>

      {/* My Purchases Table */}
      <section className="purchases-section">
        <div className="table-header">
          <h2>My Purchases ({totalPurchasesCount})</h2>
          <div className="table-actions">
            <select className="wf-select filter-select" defaultValue="">
              <option value="" disabled>Filter by...</option>
              <option value="all">All Purchases</option>
              <option value="this_month">This Month</option>
              {/* Add more options as needed */}
            </select>
            <button className="wf-button secondary export-button">Export CSV</button>
          </div>
        </div>
        {isLoadingPurchases && <p className="loading-text">Loading purchases...</p>}
        {errorPurchases && <p className="error-message full-width-error">{errorPurchases}</p>}

        {!isLoadingPurchases && !errorPurchases && (
          <>
            <div className="table-responsive-wrapper">
              <table className="wf-table purchases-table">
                <thead>
                  <tr>
                    <th className="wf-th">Agent</th>
                    <th className="wf-th">Purchase Date</th>
                    <th className="wf-th">Price Paid</th>
                    <th className="wf-th">Status</th>
                    <th className="wf-th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => (
                    <tr key={purchase.id} className="wf-tr">
                      <td className="wf-td agent-cell">
                        <span className="agent-icon">{purchase.agent?.icon || '🤖'}</span> {/* Use agent's icon or default */}
                        <div className="agent-info">
                          <Link to={`/agents/${purchase.agent?.id}`} className="agent-name-link">
                            {purchase.agent?.name || 'N/A'}
                          </Link>
                          <span className="agent-category">{purchase.agent?.category || 'Uncategorized'}</span>
                        </div>
                      </td>
                      <td className="wf-td">{new Date(purchase.timestamp).toLocaleDateString()}</td>
                      <td className="wf-td">${parseFloat(purchase.amount).toFixed(2)}</td>
                      <td className="wf-td">
                        <span className={`status-badge status-${purchase.status?.toLowerCase() || 'unknown'}`}>
                          {purchase.status || 'N/A'}
                        </span>
                      </td>
                      <td className="wf-td actions-cell">
                        <Link to={`/agents/${purchase.agent?.id}`} className="wf-button-link view-details-button">View</Link>
                        <button className="wf-button-link deploy-button">Deploy</button>
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
            {totalPages > 1 && (
              <div className="pagination-controls">
                <button onClick={handlePreviousPage} disabled={currentPage === 1 || isLoadingPurchases}>
                  Previous
                </button>
                <span> Page {currentPage} of {totalPages} </span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages || isLoadingPurchases}>
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

export default BuyerDashboardPage;
