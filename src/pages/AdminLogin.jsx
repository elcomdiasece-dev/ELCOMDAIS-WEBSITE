import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dbService } from '../lib/dbService';
import { Lock, User, AlertCircle, Cpu } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // If already logged in, redirect directly to dashboard
  useEffect(() => {
    const token = localStorage.getItem('elcomdais_admin_token');
    if (token) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await dbService.login(username, password);
      // Save credentials in local state for prototype auth
      localStorage.setItem('elcomdais_admin_token', user.token);
      localStorage.setItem('elcomdais_admin_user', JSON.stringify(user));

      // Redirect to admin panel
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section" style={{
      background: 'var(--grad-light-hero)',
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="container" style={{ maxWidth: '450px' }}>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div className="hero-logo-container logo-animate" style={{
            width: '80px',
            height: '80px',
            marginBottom: '15px'
          }}>
            <img src="/logo.jpg" alt="ELCOMDAIS Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>Admin Portal</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Authorized access only for ELCOMDAIS committee members
          </p>
        </div>

        {/* Login Card */}
        <div className="card" style={{ padding: '30px' }}>

          {error && (
            <div style={{
              padding: '10px 15px',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-sm)',
              color: '#ef4444',
              fontSize: '0.85rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Username / Email</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="text"
                  required
                  placeholder="admin"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                Prototype user: <code>admin</code>
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: '25px' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                Prototype pass: <code>password123</code>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Back Links */}
        <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link to="/register-admin" style={{ fontSize: '0.85rem', color: 'var(--primary-cyan)', fontWeight: 600 }}>
            Create New Admin Account
          </Link>
          <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            ← Return to Homepage
          </Link>
        </div>

      </div>
    </section>
  );
}
