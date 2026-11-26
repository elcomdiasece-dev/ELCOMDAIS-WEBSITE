import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { dbService } from '../lib/dbService';
import { AlertCircle, CheckCircle } from 'lucide-react';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SECTIONS = ['A', 'B', 'C'];
const BRANCHES = ['B.Tech ECE', 'E&CS'];
const empty = { name: '', regno: '', year: '', section: '', branch: '' };

export default function JoinPage() {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.name.trim().length < 2) return setError('Please enter your full name.');
    if (!/^[A-Za-z0-9]{3,20}$/.test(form.regno.trim())) return setError('Please enter a valid register number.');
    setLoading(true);
    try {
      await dbService.joinClub(form);
      setDone(true);
      setForm(empty);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const select = (k, label, options) => (
    <div className="form-group" style={{ marginBottom: '18px' }}>
      <label className="form-label">{label}</label>
      <select required className="form-input" value={form[k]} onChange={set(k)}>
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <section className="section" style={{ background: 'var(--grad-light-hero)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>Join ELCOMDAIS</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Fill in your details to become a member.</p>
        </div>

        <div className="card" style={{ padding: '30px' }}>
          {done ? (
            <div style={{ textAlign: 'center' }}>
              <CheckCircle size={40} color="#10b981" />
              <h3 style={{ margin: '12px 0 6px' }}>You're in!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '18px' }}>Thanks for joining ELCOMDAIS.</p>
              <Link to="/" className="btn btn-primary">Back to Home</Link>
            </div>
          ) : (
            <form onSubmit={submit}>
              {error && (
                <div style={{ padding: '10px 15px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', color: '#ef4444', fontSize: '0.85rem', marginBottom: '18px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} /> <span>{error}</span>
                </div>
              )}
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label">Full Name</label>
                <input required maxLength={100} className="form-input" value={form.name} onChange={set('name')} />
              </div>
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label">Register No.</label>
                <input required maxLength={20} className="form-input" value={form.regno} onChange={set('regno')} />
              </div>
              {select('year', 'Year', YEARS)}
              {select('section', 'Section', SECTIONS)}
              {select('branch', 'Branch', BRANCHES)}
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
                {loading ? 'Submitting...' : 'Join Now'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
