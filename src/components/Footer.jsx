import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-logo-desc">
            <div className="logo-wrapper" style={{ marginBottom: '1rem' }}>
              <Cpu size={24} color="var(--primary-cyan)" />
              <span className="logo-text" style={{ fontSize: '1.25rem' }}>ELCOMDAIS</span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              The official Electronics & Communication Engineering association representing student-driven technology and innovation for the 2026–27 academic year.
            </p>
            <div className="footer-socials">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="GitHub">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/calendar">Events Calendar</Link></li>
              <li><Link to="/gallery">Photo Gallery</Link></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Event Types</h4>
            <ul className="footer-links" style={{ fontSize: '0.9rem' }}>
              <li style={{ color: 'var(--dark-text-muted)' }}>Workshops</li>
              <li style={{ color: 'var(--dark-text-muted)' }}>Guest Lectures</li>
              <li style={{ color: 'var(--dark-text-muted)' }}>Competitions</li>
              <li style={{ color: 'var(--dark-text-muted)' }}>Academic Symposiums</li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Contact Details</h4>
            <ul className="footer-links" style={{ gap: '0.75rem', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <MapPin size={18} color="var(--primary-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>SRC, Kumbakonam</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={18} color="var(--primary-cyan)" />
                <a href="mailto:elcomdaisece@gmail.com">elcomdaisece@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ELCOMDAIS Association. All rights reserved.</p>
          <p style={{ letterSpacing: '0.05em' }}>
            Motto: <span style={{ color: '#fff', fontWeight: 600 }}>LEARN • LEAD • LEAVE A LEGACY</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
