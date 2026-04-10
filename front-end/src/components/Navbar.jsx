import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';
import projectLogo from '../assets/project-logo.svg';

export const Navbar = ({ onMenuToggle, isMobile = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          {isMobile && (
            <button className="navbar-menu-btn" onClick={onMenuToggle} aria-label="Toggle Sidebar">
              <span />
              <span />
              <span />
            </button>
          )}

          <button className="navbar-brand" onClick={() => navigate('/dashboard')}>
            <div className="brand-icon">
              <img src={projectLogo} alt="Project logo" className="brand-logo" />
            </div>
            <div className="brand-text" style={{textAlign:"left",margin:0}}>
              <h3>Re-KYC portal</h3>
              <p>AI-Powered Identity Verification and KYC Automation Platform</p>
            </div>
          </button>

          <div className="navbar-quick-info">
            {/* <span className="info-pill">Secure KYC</span> */}
            {/* <span className="info-pill muted">Updated: {today}</span> */}
          </div>
        </div>

        <div className="navbar-right">
          <button className="nav-icon-btn" aria-label="Notifications" title="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>

          <div className="user-dropdown" ref={dropdownRef}>
            <button
              className={`user-button ${showDropdown ? 'open' : ''}`}
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              <div className="user-avatar">{(user?.name?.charAt(0) || 'U').toUpperCase()}</div>
              <span className="user-name">{user?.name || 'User'}</span>
              <span className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}>▼</span>
            </button>

            {showDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-user-info">
                  <p className="user-email">{user?.email || 'user@example.com'}</p>
                  <p className="user-fullname">{user?.name || 'User'}</p>
                </div>
                <button className="dropdown-item">Profile</button>
                <button className="dropdown-item">Settings</button>
                <hr />
                <button className="dropdown-item logout-btn" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
