import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, LogOut, Cpu } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Watch for admin status changes in localStorage
  useEffect(() => {
    const token = localStorage.getItem('elcomdais_admin_token');
    setIsAdmin(!!token);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('elcomdais_admin_token');
    localStorage.removeItem('elcomdais_admin_user');
    setIsAdmin(false);
    navigate('/');
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Calendar', path: '/calendar' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About', path: '/about' }
  ];

  return (
    <nav className="header-nav">
      <div className="container navbar-container">
        <Link to="/" className="logo-wrapper" onClick={() => setIsOpen(false)}>
          <img src="/logo.jpg" alt="ELCOMDAIS Logo" style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'contain' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="logo-text">ELCOMDAIS</span>
            <span style={{ fontSize: '0.62rem', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              LEARN • LEAD • LEAVE A LEGACY
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <ul className="nav-links desktop-nav">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.name}
              </Link>
            </li>
          ))}
          {isAdmin ? (
            <>
              <li>
                <Link to="/admin" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  <LayoutDashboard size={16} /> Admin Panel
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="btn btn-danger"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </li>
            </>
          ) : null}
        </ul>

        {/* Mobile menu button */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Navigation Drawer */}
        <ul className={`nav-links mobile-nav ${isOpen ? 'open' : ''}`}>
          {navItems.map((item) => (
            <li key={item.name} style={{ width: '100%', textAlign: 'center' }}>
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
                style={{ display: 'block', padding: '1rem 0' }}
              >
                {item.name}
              </Link>
            </li>
          ))}
          {isAdmin ? (
            <>
              <li style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
                <Link
                  to="/admin"
                  className="btn btn-secondary"
                  onClick={() => setIsOpen(false)}
                  style={{ width: '80%', padding: '0.65rem' }}
                >
                  <LayoutDashboard size={16} /> Admin Panel
                </Link>
              </li>
              <li style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="btn btn-danger"
                  style={{ width: '80%', padding: '0.65rem' }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </li>
            </>
          ) : null}
        </ul>
      </div>
    </nav>
  );
}
