import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import AgentListPage from './components/AgentListPage';
import AgentDetailPage from './components/AgentDetailPage';
import UploadAgentPage from './components/UploadAgentPage';
import LoginPage from './components/LoginPage';
import RegistrationPage from './components/RegistrationPage';
import authService from './services/authService';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // It's good practice to use a Navigate component or useNavigate hook for redirection
  // directly within the component rendering logic. This is a simple way to handle it
  // for the logout button.
  const navigate = useNavigate(); // Add this hook if not using AppWrapper

  const handleLogout = async () => {
    try {
      await authService.logoutUser();
    } catch (error) {
      console.error("Logout error", error.response?.data || error.message);
      // Even if logout API fails, clear client-side token to ensure user is logged out locally
    } finally {
      localStorage.removeItem('token');
      // localStorage.removeItem('user'); // Remove user info if stored
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  // This effect will run when the component mounts and whenever localStorage 'token' changes.
  // This is a simple way to keep auth state in sync.
  // For more complex apps, consider React Context or a state management library.
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange); // Listen for changes in other tabs
    // Check token on initial load
    setIsAuthenticated(!!localStorage.getItem('token'));
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  return (
    // If not using AppWrapper, Router should be here.
    // <Router> 
      <div>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/agents">Agents</Link></li>
            {isAuthenticated && <li><Link to="/upload">Upload Agent</Link></li>}
            {isAuthenticated ? (
              <li><button onClick={handleLogout}>Logout</button></li>
            ) : (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </nav>
        <hr />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/agents" element={<AgentListPage />} />
          {/* Example of a protected route pattern, actual protection needs a wrapper component */}
          <Route path="/agents/:id" element={isAuthenticated ? <AgentDetailPage /> : <LoginPage />} />
          <Route path="/upload" element={isAuthenticated ? <UploadAgentPage /> : <LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
        </Routes>
      </div>
    // </Router>
  );
}

// It's common to wrap App with Router if useNavigate is used within App itself.
// Create an AppWrapper component for this.
const AppWrapper = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

export default AppWrapper;
