import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, LogOut, Cpu, UserPlus } from 'lucide-react';

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

  const handleJoinUsClick = (e) => {
    e.preventDefault();
    setIsOpen(false);
    const footerElement = document.getElementById('stay-connected');
    if (footerElement) {
      footerElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/about');
    }
  };

  return (
    <nav className="header-nav">
      <div className="container navbar-container">
        <Link to="/" className="logo-wrapper" onClick={() => setIsOpen(false)}>
          <img src="/logo.jpg" alt="ELCOMDAIS Logo" className="logo-image" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="logo-text">
              <span className="logo-text-elcom">ELCOM</span>
              <span className="logo-text-dais">DAIS</span>
            </span>
            <span className="logo-tagline">
              LEARN • LEAD • LEAVE A LEGACY
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }} className="desktop-nav">
          <ul className="nav-links">
            {navItems.map((item) => {
              const hasHash = item.path.includes('#');
              const isActive = hasHash
                ? (location.pathname + location.hash) === item.path
                : (location.pathname === item.path && !location.hash);
              return (
                <li key={item.name}>
                  {item.path.includes('#') ? (
                    <a
                      href={item.path}
                      className={`nav-link ${isActive ? 'active' : ''}`}
                    >
                      {item.name}
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      className={`nav-link ${isActive ? 'active' : ''}`}
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          {isAdmin && (
            <Link to="/admin" className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', borderRadius: '8px' }}>
              <LayoutDashboard size={15} /> Admin
            </Link>
          )}

          <a href="#stay-connected" onClick={handleJoinUsClick} className="btn btn-primary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}>
            <UserPlus size={15} /> Join Us
          </a>

          {isAdmin && (
            <button
              onClick={handleLogout}
              className="btn btn-danger"
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', borderRadius: '8px' }}
            >
              <LogOut size={15} />
            </button>
          )}
        </div>

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
          {navItems.map((item) => {
            const hasHash = item.path.includes('#');
            const isActive = hasHash
              ? (location.pathname + location.hash) === item.path
              : (location.pathname === item.path && !location.hash);
            return (
              <li key={item.name} style={{ width: '100%', textAlign: 'center' }}>
                {item.path.includes('#') ? (
                  <a
                    href={item.path}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => setIsOpen(false)}
                    style={{ display: 'block', padding: '0.85rem 0' }}
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link
                    to={item.path}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => setIsOpen(false)}
                    style={{ display: 'block', padding: '0.85rem 0' }}
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
          
          <li style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
            <a
              href="#stay-connected"
              onClick={handleJoinUsClick}
              className="btn btn-primary"
              style={{ width: '80%', padding: '0.65rem' }}
            >
              <UserPlus size={16} /> Join Us
            </a>
          </li>

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
