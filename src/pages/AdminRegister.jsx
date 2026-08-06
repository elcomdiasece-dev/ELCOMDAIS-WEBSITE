import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dbService } from '../lib/dbService';
import { Lock, User, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';

export default function AdminRegister() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secretCode, setSecretCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  // If already logged in, redirect directly to dashboard
  useEffect(() => {
    const token = localStorage.getItem('elcomdais_admin_token');
    if (token) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Security passcode validation
    if (secretCode !== 'elcomdias2026') {
      setError('Invalid authorization secret code.');
      setLoading(false);
      return;
    }

    try {
      await dbService.registerAdmin(username, password, name);
      setSuccess(true);
      setName('');
      setUsername('');
      setPassword('');
      setSecretCode('');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed.');
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
            <img src="/logo.jpg" alt="ELCOMDIAS Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>Register Administrator</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Create a new authorized account to access the workspace
          </p>
        </div>

        {/* Register Card */}
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

          {success && (
            <div style={{
              padding: '10px 15px',
              backgroundColor: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 'var(--radius-sm)',
              color: '#10b981',
              fontSize: '0.85rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle size={16} style={{ flexShrink: 0 }} />
              <span>Admin registered! Redirecting to login...</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label className="form-label">Username / Email</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. john@gmail.com"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '15px' }}>
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
            </div>

            <div className="form-group" style={{ marginBottom: '25px' }}>
              <label className="form-label">Authorization Secret Code</label>
              <div style={{ position: 'relative' }}>
                <ShieldCheck size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="password"
                  required
                  placeholder="elcomdias2026"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                Coordinators code: <code>elcomdias2026</code>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link to="/login" style={{ fontSize: '0.85rem', color: 'var(--primary-cyan)', fontWeight: 600 }}>
            ← Back to Login
          </Link>
        </div>

      </div>
    </section>
  );
}
