import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      alert(`Thank you for subscribing, ${email}!`);
      setEmail('');
    }
  };

  return (
    <footer className="footer" id="stay-connected">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: Logo & Description */}
          <div className="footer-logo-desc">
            <div className="logo-wrapper" style={{ marginBottom: '1.2rem' }}>
              <img src="/logo.jpg" alt="ELCOMDAIS Logo" className="logo-image" style={{ width: '40px', height: '40px' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="logo-text" style={{ fontSize: '1.25rem', color: '#ffffff' }}>
                  <span className="logo-text-elcom" style={{ color: '#3b82f6' }}>ELCOM</span>
                  <span className="logo-text-dais" style={{ color: '#ffffff' }}>DAIS</span>
                </span>
                <span className="logo-tagline" style={{ fontSize: '0.52rem', color: '#94a3b8' }}>
                  LEARN • LEAD • LEAVE A LEGACY
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.6' }}>
              Electronics & Communication Engineering Association<br />
              SASTRA Deemed University
            </p>
            <div className="footer-socials">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="YouTube">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="GitHub">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/calendar">Calendar</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
              <li><Link to="/about">About</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="footer-heading">Resources</h4>
            <ul className="footer-links">
              <li><Link to="/calendar">Events</Link></li>
              <li><Link to="/calendar">Past Events</Link></li>
              <li><Link to="/about">Achievements</Link></li>
              <li><Link to="/calendar">Downloads</Link></li>
              <li><Link to="/about">FAQs</Link></li>
            </ul>
          </div>

          {/* Column 4: Stay Connected */}
          <div>
            <h4 className="footer-heading">Stay Connected</h4>
            <p className="newsletter-desc">Subscribe to our newsletter and never miss an update!</p>
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <div className="newsletter-input-container">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="newsletter-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="newsletter-submit-btn" aria-label="Subscribe">
                  <Send size={14} />
                </button>
              </div>
            </form>
          </div>

          {/* Column 5: Contact Us */}
          <div>
            <h4 className="footer-heading">Contact Us</h4>
            <ul className="footer-contact-list">
              <li className="footer-contact-item">
                <Mail size={16} />
                <a href="mailto:elcomdais@sastra.edu">elcomdais@sastra.edu</a>
              </li>
              <li className="footer-contact-item">
                <MapPin size={16} />
                <span>Thanjavur, Tamil Nadu, India</span>
              </li>
              <li className="footer-contact-item">
                <Phone size={16} />
                <a href="tel:+911234567890">+91 12345 67890</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ELCOMDAIS. All Rights Reserved.</p>
          <p className="footer-bottom-designed-by">
            Designed with <span>❤️</span> by ELCOMDAIS Web Team
          </p>
          <div className="footer-motto-links">
            <span style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>
              Lead • Innovate • Inspire
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
