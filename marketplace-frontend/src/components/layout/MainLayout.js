import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MainLayout.css';

const MainLayout = ({ children, isAuthenticated, user, handleLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const userDropdownRef = useRef(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const handleLogoutAndCloseDropdown = () => {
    handleLogout();
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false); // Also close mobile menu if open
  };

  const handleNavigateAndCloseMenus = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
  }

  // Close user dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userDropdownRef]);


  // Determine dashboard path (basic logic for now)
  // In a real app, user roles might come from the `user` object
  const dashboardPath = user?.is_seller ? "/dashboard/seller" : "/dashboard";
  // For "Sell Agent" link, we could also check is_seller if that becomes a strict requirement
  // const showSellAgentLink = isAuthenticated && user?.is_seller; (example)
  const showSellAgentLink = isAuthenticated; // Current logic: show if authenticated

  return (
    <>
      <header className="main-layout-header">
        <div className="main-layout-logo">
          <Link to="/">AI Marketplace</Link>
        </div>

        {/* Hamburger Menu Icon for Mobile */}
        <button className="mobile-menu-icon" onClick={toggleMobileMenu}>
          &#9776; {/* Hamburger icon */}
        </button>

        {/* Desktop Navigation */}
        <nav className={`main-layout-nav desktop-nav ${isMobileMenuOpen ? 'mobile-nav-open' : ''}`}>
          <Link to="/agents" className="main-layout-nav-item" onClick={() => handleNavigateAndCloseMenus('/agents')}>Browse</Link>
          {showSellAgentLink && (
            <Link to="/upload" className="main-layout-nav-item" onClick={() => handleNavigateAndCloseMenus('/upload')}>Sell Agent</Link>
          )}

          {isAuthenticated ? (
            <div className="authenticated-nav-items">
              <Link to={dashboardPath} className="main-layout-nav-item" onClick={() => handleNavigateAndCloseMenus(dashboardPath)}>Dashboard</Link>
              <div className="user-dropdown-container" ref={userDropdownRef}>
                <button onClick={toggleUserDropdown} className="main-layout-nav-item user-dropdown-toggle">
                  {user?.username || 'User'} &#9662; {/* Down arrow */}
                </button>
                {/* Apply 'open' class conditionally */}
                <div className={`user-dropdown-menu ${isUserDropdownOpen ? 'open' : ''}`}>
                  <Link to="/profile" className="user-dropdown-item" onClick={() => handleNavigateAndCloseMenus('/profile')}>My Profile</Link>
                  <Link to="/settings" className="user-dropdown-item" onClick={() => handleNavigateAndCloseMenus('/settings')}>Settings</Link>
                  <button onClick={handleLogoutAndCloseDropdown} className="user-dropdown-item logout-button">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="guest-nav-items">
              <Link to="/login" className="main-layout-nav-item" onClick={() => handleNavigateAndCloseMenus('/login')}>Login</Link>
              <Link to="/register" className="main-layout-nav-item" onClick={() => handleNavigateAndCloseMenus('/register')}>Register</Link>
            </div>
          )}
        </nav>
      </header>
      {/* Mobile Navigation Menu (conditionally rendered based on isMobileMenuOpen) */}
      {isMobileMenuOpen && (
         <nav className={`main-layout-nav mobile-only-nav ${isMobileMenuOpen ? 'mobile-nav-open' : ''}`}>
            <Link to="/agents" className="main-layout-nav-item" onClick={() => handleNavigateAndCloseMenus('/agents')}>Browse</Link>
            {showSellAgentLink && (
                <Link to="/upload" className="main-layout-nav-item" onClick={() => handleNavigateAndCloseMenus('/upload')}>Sell Agent</Link>
            )}
            {isAuthenticated ? (
                <>
                <Link to={dashboardPath} className="main-layout-nav-item" onClick={() => handleNavigateAndCloseMenus(dashboardPath)}>Dashboard</Link>
                <Link to="/profile" className="main-layout-nav-item" onClick={() => handleNavigateAndCloseMenus('/profile')}>My Profile</Link>
                <Link to="/settings" className="main-layout-nav-item" onClick={() => handleNavigateAndCloseMenus('/settings')}>Settings</Link>
                <button onClick={handleLogoutAndCloseDropdown} className="main-layout-nav-item main-layout-logout-button mobile-logout">
                    Logout ({user?.username || 'User'})
                </button>
                </>
            ) : (
                <>
                <Link to="/login" className="main-layout-nav-item" onClick={() => handleNavigateAndCloseMenus('/login')}>Login</Link>
                <Link to="/register" className="main-layout-nav-item" onClick={() => handleNavigateAndCloseMenus('/register')}>Register</Link>
                </>
            )}
        </nav>
      )}

      <main className="main-layout-container">
        {children}
      </main>
      <footer className="main-layout-footer">
        <p>&copy; {new Date().getFullYear()} AI Marketplace. All rights reserved.</p>
      </footer>
    </>
  );
};

export default MainLayout;
