import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import AgentListPage from './components/AgentListPage';
import AgentDetailPage from './components/AgentDetailPage';
import UploadAgentPage from './components/UploadAgentPage';
import LoginPage from './components/LoginPage';
import RegistrationPage from './components/RegistrationPage';
import CheckoutPage from './components/checkout/CheckoutPage';
import BuyerDashboardPage from './components/dashboard/BuyerDashboardPage';
import SellerDashboardPage from './components/dashboard/SellerDashboardPage';
import ProfilePage from './components/user/ProfilePage'; // Import ProfilePage
import SettingsPage from './components/user/SettingsPage'; // Import SettingsPage
import authService from './services/authService';
import MainLayout from './components/layout/MainLayout';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState(null); // Added state for user

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
      localStorage.removeItem('username'); // Also remove username
      setIsAuthenticated(false);
      setCurrentUser(null); // Clear current user
      navigate('/login');
    }
  };

  useEffect(() => {
    const updateAuthState = () => {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      setIsAuthenticated(!!token);
      if (token && username) {
        setCurrentUser({ username }); // Set user if token and username exist
      } else {
        setCurrentUser(null);
      }
    };

    updateAuthState(); // Initial check
    window.addEventListener('storage', updateAuthState); // Listen for changes in other tabs

    return () => {
      window.removeEventListener('storage', updateAuthState);
    };
  }, []);


  return (
    <MainLayout isAuthenticated={isAuthenticated} user={currentUser} handleLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/agents" element={<AgentListPage />} />
        {/*
          For protected routes, a more robust solution would involve a wrapper component.
          This inline check is basic. If user is not authenticated, they'll see LoginPage
          instead of AgentDetailPage or UploadAgentPage.
        */}
        <Route
          path="/agents/:id"
          element={isAuthenticated ? <AgentDetailPage /> : <LoginPage />}
        />
        <Route
          path="/upload"
          element={isAuthenticated ? <UploadAgentPage /> : <LoginPage />}
        />
        {/* Dashboard route - updated */}
        <Route
          path="/dashboard"
          element={isAuthenticated ? <BuyerDashboardPage /> : <LoginPage />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route
          path="/checkout"
          element={isAuthenticated ? <CheckoutPage /> : <LoginPage />}
        />
        <Route
          path="/dashboard/seller"
          element={isAuthenticated ? <SellerDashboardPage /> : <LoginPage />}
        />
        <Route
          path="/profile"
          element={isAuthenticated ? <ProfilePage /> : <LoginPage />}
        />
        <Route
          path="/settings"
          element={isAuthenticated ? <SettingsPage /> : <LoginPage />}
        />
      </Routes>
    </MainLayout>
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
