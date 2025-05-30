import React, { useState, useEffect } from 'react';
// Removed Link from react-router-dom as AgentCard handles its own linking for now
import agentService from '../services/agentService';
import AgentCard from './agents/AgentCard'; // Assuming AgentCard is in src/components/agents/
import './AgentListPage.css'; // Create this file for page-specific styles

// Mockup classes for reference:
// .layout-row: display: flex; gap: 2rem;
// .wf-sidebar: width: 250px; background: #f8fafc; padding: 1.5rem; border-radius: 0.5rem; border: 1px solid #e2e8f0;
// .wf-main-content: flex: 1;
// .wf-form-group: margin-bottom: 1rem;
// .wf-label: display: block; margin-bottom: 0.5rem; font-weight: 500; color: #475569;
// .wf-select, .wf-input: width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 0.25rem;
// .wf-button (for "Apply Filters"): background: #3b82f6; color: white; padding: 0.6rem 1rem; border: none; border-radius: 0.25rem;
// .agents-grid: display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;

const AgentListPage = () => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAgents, setTotalAgents] = useState(0);

  // Placeholder states for filters - functionality to be added later
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rating, setRating] = useState('');
  const [sortBy, setSortBy] = useState('popularity');

  useEffect(() => {
    const fetchAgents = async (page) => {
      setIsLoading(true);
      setError(null);
      try {
        // Pass filter/sort states to agentService.getAgents in the future
        // For now, it only takes page
        const response = await agentService.getAgents(page); 
        setAgents(response.data.results || []);
        setTotalPages(Math.ceil((response.data.count || 0) / 10)); // Assuming 10 per page
        setTotalAgents(response.data.count || 0);
        // setCurrentPage(page); // This is already handled by the fetchAgents call being dependent on currentPage
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to fetch agents.');
        console.error("Fetch agents error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents(currentPage);
  }, [currentPage, category, minPrice, maxPrice, rating, sortBy]); // Re-fetch if any of these change

  const handleApplyFilters = () => {
    setCurrentPage(1); // Reset to first page when filters change
    // Actual filtering logic will trigger useEffect due to state changes
    console.log("Applying filters:", { category, minPrice, maxPrice, rating });
  };
  
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
    <div className="agent-list-page-container"> {/* Similar to .container in MainLayout for consistency */}
      <h1>AI Agents Marketplace</h1>
      <div className="layout-row">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          <h3>Filters</h3>
          <div className="wf-form-group">
            <label htmlFor="category-filter" className="wf-label">Category</label>
            <select id="category-filter" className="wf-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              <option value="analytics">Analytics</option>
              <option value="support">Customer Support</option>
              <option value="generation">Text Generation</option>
              <option value="image">Image Analysis</option>
              {/* Add more categories as needed */}
            </select>
          </div>

          <div className="wf-form-group">
            <label className="wf-label">Price Range</label>
            <div className="price-range-inputs">
              <input type="number" className="wf-input" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
              <span>-</span>
              <input type="number" className="wf-input" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </div>
          </div>

          <div className="wf-form-group">
            <label htmlFor="rating-filter" className="wf-label">Rating</label>
            <select id="rating-filter" className="wf-select" value={rating} onChange={(e) => setRating(e.target.value)}>
              <option value="">All Ratings</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>
          </div>
          <button className="wf-button apply-filters-button" onClick={handleApplyFilters}>Apply Filters</button>
        </aside>

        {/* Main Content Area */}
        <main className="main-content-area">
          <div className="list-header">
            <p>{isLoading ? 'Loading...' : `Showing ${agents.length} of ${totalAgents} results`}</p>
            <div className="sort-by-container">
              <label htmlFor="sort-by" className="wf-label">Sort by:</label>
              <select id="sort-by" className="wf-select sort-by-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="popularity">Popularity</option>
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          {error && <p className="error-message">Error: {error}</p>}
          
          {!isLoading && agents.length === 0 && !error && (
            <p>No agents found matching your criteria.</p>
          )}

          <div className="agents-grid">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>

          {!isLoading && totalPages > 1 && (
            <div className="pagination-controls">
              <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                Previous
              </button>
              <span> Page {currentPage} of {totalPages} </span>
              <button onClick={handleNextPage} disabled={currentPage === totalPages || totalAgents === 0}>
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AgentListPage;
