import React from 'react';
import { Link } from 'react-router-dom';
import './AgentCard.css'; // Create this file for AgentCard specific styles

// Mockup classes for styling reference:
// .wf-card: background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.05);
// .wf-card-image: height: 150px; background: #f1f5f9; border-radius: 0.25rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; color: #9ca3af;
// .wf-card h3: font-size: 1.25rem; margin-bottom: 0.5rem; color: #1e293b;
// .wf-card p: font-size: 0.9rem; color: #475569; margin-bottom: 1rem;
// .wf-card-price: font-size: 1.1rem; font-weight: bold; color: #0f766e; margin-bottom: 0.5rem;
// .wf-card-rating: color: #f59e0b;

const AgentCard = ({ agent }) => {
  const {
    id,
    name = "Sample Agent",
    description = "This is a brief description of the AI agent and its capabilities.",
    price = "49.99",
    // rating = 4.5, // Can be a number
    // reviewCount = 120, // Example
    imageUrl, // Optional: if you have actual images later
    uploaded_by_username = "DeveloperX"
  } = agent || {}; // Destructure with defaults if agent prop is not provided or incomplete

  // Simple star rating display
  const renderStars = (ratingValue) => {
    const totalStars = 5;
    let stars = [];
    const numRating = parseFloat(ratingValue); // Ensure rating is a number
    for (let i = 1; i <= totalStars; i++) {
      if (i <= numRating) {
        stars.push(<span key={i} className="star filled">&#9733;</span>);
      } else if (i - 0.5 <= numRating) {
        stars.push(<span key={i} className="star half-filled">&#9733;</span>); // Or use a specific half-star icon/character
      } else {
        stars.push(<span key={i} className="star empty">&#9734;</span>);
      }
    }
    return stars;
  };
  // Use a mock rating if not provided
  const displayRating = agent?.rating || 4.5;
  const displayReviewCount = agent?.reviewCount || Math.floor(Math.random() * 200) + 10;


  return (
    <div className="agent-card">
      <Link to={`/agents/${id || 'sample'}`} className="card-link-wrapper">
        <div className="card-image-placeholder">
          {imageUrl ? <img src={imageUrl} alt={name} /> : <span>Agent Image</span>}
        </div>
        <div className="card-content">
          <h3>{name}</h3>
          <p className="card-description">{description.substring(0, 100)}{description.length > 100 ? '...' : ''}</p>
          <div className="card-footer">
            <p className="card-price">${price}</p>
            <div className="card-rating">
              {renderStars(displayRating)}
              <span className="review-count">({displayReviewCount} reviews)</span>
            </div>
          </div>
           <p className="card-developer">By: {uploaded_by_username}</p>
        </div>
      </Link>
    </div>
  );
};

export default AgentCard;
