import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AgentCard from './agents/AgentCard'; // Import AgentCard
import './HomePage.css';

// Mockup classes to reference for styling:
// .wf-hero: background: #e0f2fe (light blue); padding: 4rem 2rem; text-align: center;
// .wf-hero h1: font-size: 3rem; color: #0c4a6e (dark blue); margin-bottom: 1rem;
// .wf-hero p: font-size: 1.25rem; color: #075985; margin-bottom: 2rem;
// .wf-search-bar: padding: 0.75rem 1rem; border: 1px solid #38bdf8; border-radius: 0.25rem; width: 50%; max-width: 600px; font-size: 1rem;
// .wf-hero-buttons .wf-button: margin: 0 0.5rem; background: #0ea5e9; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.25rem; text-decoration: none;
// .wf-button-secondary: background: #38bdf8;

const HomePage = () => {
  const navigate = useNavigate();
  // In a real app, get isAuthenticated from context or props
  const isAuthenticated = !!localStorage.getItem('token');

  const handleStartSelling = () => {
    if (isAuthenticated) {
      navigate('/upload');
    } else {
      navigate('/login'); // Or a specific "please login to sell" page
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Discover AI Agents for Every Need</h1>
          <p>
            Browse, buy, and deploy cutting-edge AI agents from a vibrant community of developers.
            Or, showcase and monetize your own creations.
          </p>
          <div className="hero-search-container">
            <input
              type="text"
              className="hero-search-bar"
              placeholder="Search for agents (e.g., image generation, text analysis...)"
            />
            {/* Search button can be added if desired, or search on type */}
          </div>
          <div className="hero-buttons">
            <Link to="/agents" className="hero-button primary">
              Browse Agents
            </Link>
            <button onClick={handleStartSelling} className="hero-button secondary">
              Start Selling
            </button>
          </div>
        </div>
      </section>

      {/* Featured AI Agents Section - Placeholder for now */}
      <section className="featured-agents-section">
        <h2>Featured AI Agents</h2>
        <div className="featured-agents-grid">
          {/* Static AgentCard components with mock data */}
          <AgentCard agent={{
            id: '1',
            name: "Image Enhancer Pro",
            description: "Upscale and enhance your images with state-of-the-art AI. Perfect for photographers and designers.",
            price: "29.99",
            rating: 4.8, // Example rating
            reviewCount: 150, // Example review count
            uploaded_by_username: "PixelPerfect Co."
            // imageUrl: "path/to/image1.jpg" // Optional image
          }} />
          <AgentCard agent={{
            id: '2',
            name: "Text Summarizer GPT",
            description: "Condense long articles and documents into concise summaries without losing key information.",
            price: "19.00",
            rating: 4.5,
            reviewCount: 95,
            uploaded_by_username: "ReaderDigest AI"
          }} />
          <AgentCard agent={{
            id: '3',
            name: "Code Assistant Bot",
            description: "Your AI pair programmer. Get suggestions, find bugs, and generate boilerplate code.",
            price: "79.50",
            rating: 4.9,
            reviewCount: 210,
            uploaded_by_username: "DevTools Inc."
          }} />
           <AgentCard agent={{
            id: '4',
            name: "Audio Transcription Service",
            description: "Highly accurate speech-to-text conversion for various audio formats. Supports multiple languages.",
            price: "5.00", // per hour or similar, just for display
            rating: 4.2,
            reviewCount: 75,
             uploaded_by_username: "SoundScribe"
          }} />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
