import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Award, BookOpen, Compass, CheckCircle2, User, ChevronDown, ChevronUp, Cpu } from 'lucide-react';
import { dbService } from '../lib/dbService';

const DEFAULT_TEAM = {
  faculty: [
    { name: '', role: 'Faculty Coordinator', bio: '', image: '' },
    { name: '', role: 'Faculty Coordinator', bio: '', image: '' }
  ],
  presidents: [
    { name: '', role: 'Student President', bio: '', image: '' },
    { name: '', role: 'Vice-President', bio: '', image: '' }
  ],
  core: [
    {
      id: 'secretary',
      name: '', role: 'Secretary', bio: '', image: '',
      members: null // Secretary operates alone with no sub-members
    },
    {
      id: 'jsec1',
      name: '', role: 'Joint Secretary', bio: '', image: '',
      members: null // Joint Secretary operates alone with no sub-members
    },
    {
      id: 'jsec2',
      name: '', role: 'Joint Secretary', bio: '', image: '',
      members: null // Joint Secretary operates alone with no sub-members
    },
    {
      id: 'treasurer',
      name: '', role: 'Treasurer', bio: '', image: '',
      members: [
        { name: '', role: 'Sub-team Member', image: '' },
        { name: '', role: 'Sub-team Member', image: '' }
      ]
    },
    {
      id: 'tech',
      name: '', role: 'Technical Lead', bio: '', image: '',
      members: [
        { name: '', role: 'Sub-team Member', image: '' },
        { name: '', role: 'Sub-team Member', image: '' },
        { name: '', role: 'Sub-team Member', image: '' },
        { name: '', role: 'Sub-team Member', image: '' },
        { name: '', role: 'Sub-team Member', image: '' }
      ]
    },
    {
      id: 'creative',
      name: '', role: 'Creative & Design Head', bio: '', image: '',
      members: [
        { name: '', role: 'Sub-team Member', image: '' },
        { name: '', role: 'Sub-team Member', image: '' },
        { name: '', role: 'Sub-team Member', image: '' },
        { name: '', role: 'Sub-team Member', image: '' }
      ]
    },
    { 
      id: 'event',
      name: '', role: 'Event Coordinator', bio: '', image: '', 
      members: [
        { name: '', role: 'Sub-team Member', image: '' },
        { name: '', role: 'Sub-team Member', image: '' },
        { name: '', role: 'Sub-team Member', image: '' },
        { name: '', role: 'Sub-team Member', image: '' },
        { name: '', role: 'Sub-team Member', image: '' },
        { name: '', role: 'Sub-team Member', image: '' },
        { name: '', role: 'Sub-team Member', image: '' },
        { name: '', role: 'Sub-team Member', image: '' }
      ]
    },
    { 
      id: 'social',
      name: '', role: 'Social Media & Public Relation', bio: '', image: '', 
      members: [
        { name: '', role: 'Sub-team Member', image: '' },
        { name: '', role: 'Sub-team Member', image: '' }
      ]
    },
    { 
      id: 'magazine',
      name: '', role: 'Magazine Team', bio: '', image: '', 
      members: [
        { name: '', role: 'Sub-team Member', image: '' },
        { name: '', role: 'Sub-team Member', image: '' }
      ]
    },
    { 
      id: 'hospitality',
      name: '', role: 'Hospitality', bio: '', image: '', 
      members: [
        { name: '', role: 'Sub-team Member', image: '' },
        { name: '', role: 'Sub-team Member', image: '' },
        { name: '', role: 'Sub-team Member', image: '' },
        { name: '', role: 'Sub-team Member', image: '' }
      ]
    },
    { 
      id: 'executives',
      name: '', role: 'Executive Members Head', bio: '', image: '', 
      members: [
        { name: '', role: 'Executive Member', image: '' },
        { name: '', role: 'Executive Member', image: '' },
        { name: '', role: 'Executive Member', image: '' },
        { name: '', role: 'Executive Member', image: '' }
      ]
    }
  ]
};

export default function About() {
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [team, setTeam] = useState(DEFAULT_TEAM);
  const [loading, setLoading] = useState(true);

  // Track expanded sub-teams
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    async function loadCommitteeData() {
      try {
        const stored = await dbService.getCommittee();
        if (stored) {
          setTeam(stored);
        }
      } catch (err) {
        console.error('Error fetching committee details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCommitteeData();
  }, []);

  const toggleCard = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleInputChange = (field, val) => {
    setFormState(prev => ({ ...prev, [field]: val }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormState({ name: '', email: '', subject: '', message: '' });
    }, 1200);
  };

  const renderNodeCard = (member, hasTeam = false, isExpanded = false, onToggle = null) => {
    return (
      <div className="card" style={{
        width: '260px',
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        textAlign: 'center',
        border: isExpanded ? '1px solid var(--primary-cyan)' : '1px solid var(--border-color)',
        boxShadow: isExpanded ? '0 10px 25px rgba(2, 132, 199, 0.15)' : 'var(--shadow-md)',
        background: '#ffffff',
        zIndex: 2,
        transition: 'var(--transition-smooth)',
        borderRadius: 'var(--radius-lg)'
      }}>
        {/* Photo Container with rounded frame */}
        <div style={{
          position: 'relative',
          width: '100%',
          paddingTop: '80%',
          backgroundColor: 'var(--bg-app)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border-color)'
        }}>
          {member.image && !member.image.startsWith('db:') ? (
            <img
              src={member.image}
              alt={member.name || member.role}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            }}>
              <User size={48} style={{ opacity: 0.2 }} />
            </div>
          )}
        </div>

        {/* Member Details */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)', margin: 0, fontWeight: 700, minHeight: '1.2rem' }}>
            {member.name || 'Profile Pending'}
          </h4>
          <span style={{
            fontSize: '0.72rem',
            color: 'var(--primary-cyan)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {member.role}
          </span>
          {member.bio && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: '6px 0 0 0' }}>
              {member.bio}
            </p>
          )}

          {/* Interactive Expand button */}
          {hasTeam && onToggle && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggle();
              }}
              className="btn btn-secondary"
              style={{
                marginTop: '12px',
                padding: '6px 12px',
                fontSize: '0.72rem',
                width: '100%',
                justifyContent: 'center',
                gap: '6px',
                borderRadius: '20px',
                border: '1px solid rgba(2, 132, 199, 0.2)',
                background: isExpanded ? 'rgba(2, 132, 199, 0.05)' : '#ffffff',
                color: 'var(--primary-cyan)',
                fontWeight: 600
              }}
            >
              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {isExpanded ? 'Hide Sub-team' : `View Sub-team (${member.members.length})`}
            </button>
          )}
        </div>

        {/* Dynamic Sub-Team lists with picture cards */}
        {hasTeam && isExpanded && (
          <div style={{
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-app)',
            padding: '16px',
            textAlign: 'left'
          }}>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              display: 'block',
              marginBottom: '12px',
              letterSpacing: '0.05em'
            }}>
              Sub-team Coordinators:
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {member.members.map((sub, sIdx) => (
                <div key={sIdx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#ffffff',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}>
                  {/* Sub-member photo sphere */}
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {sub.image && !sub.image.startsWith('db:') ? (
                      <img src={sub.image} alt={sub.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={16} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 600 }}>
                      {sub.name || 'Slot Pending'}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>
                      {sub.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        Loading committee tree...
      </div>
    );
  }

  return (
    <div>
      {/* Intro Hero Section */}
      <section className="section" style={{ background: 'var(--grad-light-hero)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '850px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--primary-cyan)', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
            Who We Are
          </span>
          <h1 style={{ fontSize: 'calc(2rem + 1.5vw)', fontWeight: 800, marginBottom: '20px', color: 'var(--text-main)' }}>
            About ELCOMDAIS Association
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
            ELCOMDAIS is the official representative student body of the Electronics and Communication Engineering Department. We bring together developers, researchers, designers, and hobbyists to collaborate on tech.
          </p>
        </div>
      </section>

      {/* The 3 Pillars Section */}
      <section className="section" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div className="section-title-wrapper">
            <h2 className="section-title">The Three Pillars</h2>
            <p className="section-subtitle">Our guiding philosophy shaping every workshop, lecture, and hackathon we launch.</p>
          </div>

          <div className="grid-3">
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'rgba(2, 132, 199, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-cyan)'
              }}>
                <BookOpen size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>1. LEARN</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                Acquiring hands-on industry expertise in VLSI, IoT, Embedded Coding, and Signal Processing. Bridging coursework limitations through practical implementation.
              </p>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'rgba(2, 132, 199, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-cyan)'
              }}>
                <Compass size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>2. LEAD</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                Fostering leadership, engineering teamwork, project management, and collaborative ownership by organising inter-college hackathons and symposia.
              </p>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'rgba(2, 132, 199, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-cyan)'
              }}>
                <Award size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>3. LEAVE A LEGACY</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                Creating a lasting repository of open-source projects, training curriculums, and peer-to-peer mentoring channels that guide future student generations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Team / Committee Section */}
      <section className="section" style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(241, 245, 249, 0.4)', overflow: 'hidden' }}>
        <div className="container">
          <div className="section-title-wrapper" style={{ marginBottom: '50px' }}>
            <h2 className="section-title">The Committee (2026-27)</h2>
            <p className="section-subtitle">Structured as an organic technology tree representing coordinates of student leadership.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>

            {/* LEVEL 1: Root - Faculty Coordinators */}
            <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

              {/* Horizontal bridge connecting the two coordinators */}
              <div style={{
                position: 'absolute',
                bottom: '30px',
                left: '25%',
                right: '25%',
                height: '2px',
                backgroundColor: 'var(--primary-cyan)',
                opacity: 0.4,
                zIndex: 1
              }} className="tree-bridge-desktop-top"></div>

              {/* Pulsing junction point at center of Faculty Bridge */}
              <div style={{
                position: 'absolute',
                bottom: '27px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-cyan)',
                boxShadow: '0 0 10px var(--primary-cyan)',
                zIndex: 3
              }} className="tree-junction-desktop"></div>

              <div style={{ display: 'flex', gap: '60px', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
                {team.faculty.map((f, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {renderNodeCard(f)}
                    <div style={{ width: '2px', height: '30px', backgroundColor: 'var(--primary-cyan)', opacity: 0.4 }} className="tree-connector-down"></div>
                  </div>
                ))}
              </div>

              {/* Single connector dropping from bottom center of bridge down to Level 2 */}
              <div style={{ width: '2px', height: '30px', backgroundColor: 'var(--primary-cyan)', opacity: 0.4 }} className="tree-connector-down"></div>
            </div>

            {/* LEVEL 2: Branches - Presidents & Vice Presidents */}
            <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>

              {/* Horizontal connecting bridge on desktop */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '25%',
                right: '25%',
                height: '2px',
                backgroundColor: 'var(--primary-cyan)',
                opacity: 0.4,
                zIndex: 1
              }} className="tree-bridge-desktop"></div>

              {/* Pulsing junction point at center of Presidents Bridge */}
              <div style={{
                position: 'absolute',
                top: '-3px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-cyan)',
                boxShadow: '0 0 10px var(--primary-cyan)',
                zIndex: 3
              }} className="tree-junction-desktop"></div>

              {/* Vertical connector drops */}
              <div style={{ display: 'flex', justifyContent: 'space-around', width: '50%', minWidth: '300px' }} className="tree-connectors-desktop">
                <div style={{ width: '2px', height: '30px', backgroundColor: 'var(--primary-cyan)', opacity: 0.4 }}></div>
                <div style={{ width: '2px', height: '30px', backgroundColor: 'var(--primary-cyan)', opacity: 0.4 }}></div>
              </div>

              <div style={{ display: 'flex', gap: '60px', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
                {team.presidents.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {renderNodeCard(p)}
                    <div style={{ width: '2px', height: '40px', backgroundColor: 'var(--primary-cyan)', opacity: 0.3 }} className="tree-connector-down"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* LEVEL 3: Department Canopy & Dynamic Teams */}
            <div style={{ width: '100%', borderTop: '1px dashed var(--border-color)', paddingTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--primary-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '35px'
              }}>
                <Cpu size={16} /> Department Chairs & Sub-Teams
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '35px',
                width: '100%',
                justifyItems: 'center'
              }}>
                {team.core.map((member) => (
                  <div key={member.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {renderNodeCard(
                      member,
                      member.members !== null,
                      !!expandedCards[member.id],
                      () => toggleCard(member.id)
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="section">
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1.9fr',
            gap: '50px',
            alignItems: 'center'
          }} className="grid-2">

            {/* Contact coordinates info */}
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '15px', color: 'var(--text-main)' }}>Get in Touch</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '30px' }}>
                Have questions regarding event registrations, collaborations, or wish to present a seminar? Drop us a line and our committee will respond within 24 hours.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'rgba(2, 132, 199, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-cyan)'
                  }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>Location</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>SRC, Kumbakonam</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'rgba(2, 132, 199, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-cyan)'
                  }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>Email</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>elcomdaisece@gmail.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form Card */}
            <div className="card" style={{ padding: '30px' }}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '15px'
                  }}>
                    <CheckCircle2 size={30} />
                  </div>
                  <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem', marginBottom: '8px' }}>Message Transmitted!</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Thank you for reaching out. We will get back to you shortly.
                  </p>
                  <button onClick={() => setSubmitted(false)} className="btn btn-secondary" style={{ marginTop: '20px' }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }} className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        value={formState.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Your Name"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-input"
                        required
                        value={formState.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={formState.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Topic of interest"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea
                      className="form-input"
                      rows={5}
                      required
                      value={formState.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Write your details here..."
                      style={{ resize: 'vertical', minHeight: '100px' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '10px' }}
                    disabled={submitting}
                  >
                    {submitting ? 'Transmitting...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
