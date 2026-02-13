import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          {/* ✅ Logo + Text as ONE clickable brand unit */}
          <div className="nav-brand-container">
            <img src="/logo6.png" alt="CollegeReviewZ" className="nav-logo" />
            <span className="nav-brand-text">CRZ EMS</span>
          </div>

          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          <div className={`nav-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            {user && (
              <>
                <div className="nav-links">
                  {user.role === 'admin' && (
                    <>
                      <Link to="/admin/dashboard" className="nav-link" onClick={closeMobileMenu}>
                        Dashboard
                      </Link>
                      <Link to="/admin/employees" className="nav-link" onClick={closeMobileMenu}>
                        Employees
                      </Link>
                      <Link to="/admin/tasks" className="nav-link" onClick={closeMobileMenu}>
                        Tasks
                      </Link>
                      <Link to="/admin/leaves" className="nav-link" onClick={closeMobileMenu}>
                        Leaves
                      </Link>
                    </>
                  )}
                  {user.role === 'employee' && (
                    <>
                      <Link to="/employee/dashboard" className="nav-link" onClick={closeMobileMenu}>
                        Dashboard
                      </Link>
                      <Link to="/employee/tasks" className="nav-link" onClick={closeMobileMenu}>
                        My Tasks
                      </Link>

                      <Link to="/employee/leaves" className="nav-link" onClick={closeMobileMenu}>
                        Leaves
                      </Link>
                    </>
                  )}
                </div>

                <div className="nav-right">
                  <Link to="/me/change-password" className="nav-link" onClick={closeMobileMenu}>
                    Change Password
                  </Link>
                  <span className="nav-user">Welcome, {user.name}</span>
                  <button
                    onClick={(e) => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="btn-logout"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
