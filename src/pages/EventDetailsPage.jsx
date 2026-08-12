import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dbService } from '../lib/dbService';
import { Calendar, MapPin, Users, HelpCircle, User, Check, AlertCircle, Clock, ChevronDown, FileText, Download, ExternalLink } from 'lucide-react';

export default function EventDetailsPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // FAQ Accordion Active Indexes
  const [activeFaqIdx, setActiveFaqIdx] = useState(null);

  // Form State
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [formError, setFormError] = useState('');

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });

  useEffect(() => {
    async function loadEventDetails() {
      try {
        const evt = await dbService.getEventBySlug(slug);
        if (!evt) {
          setError('Event not found.');
          return;
        }
        setEvent(evt);

        // Load registrations count
        const regs = await dbService.getRegistrations(evt.id);
        setRegistrations(regs);

        // Prepopulate form fields state
        const fields = JSON.parse(evt.formFields || '[]');
        const initialForm = {};
        fields.forEach(f => {
          initialForm[f.id] = f.type === 'select' ? (f.options ? f.options[0] : '') : '';
        });
        setFormData(initialForm);

      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details.');
      } finally {
        setLoading(false);
      }
    }

    loadEventDetails();
  }, [slug]);

  // Countdown clock timer logic
  useEffect(() => {
    if (!event) return;

    const timer = setInterval(() => {
      const difference = +new Date(event.startDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        clearInterval(timer);
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          expired: false
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [event]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        Loading event details...
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
          <AlertCircle size={40} color="#ef4444" style={{ marginBottom: '15px' }} />
          <h2 style={{ marginBottom: '10px' }}>{error || 'Event Not Found'}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            The event you are looking for might have been removed or renamed.
          </p>
          <Link to="/calendar" className="btn btn-primary">
            Return to Calendar
          </Link>
        </div>
      </div>
    );
  }

  const fields = JSON.parse(event.formFields || '[]');
  const faqs = JSON.parse(event.faq || '[]');
  const isPast = new Date(event.startDate) < new Date();
  const isFull = registrations.length >= event.capacity;

  const handleInputChange = (fieldId, val) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: val
    }));
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    // Validation
    for (const f of fields) {
      if (f.required && (!formData[f.id] || formData[f.id].toString().trim() === '')) {
        setFormError(`Please fill in all required fields: ${f.label}`);
        setSubmitting(false);
        return;
      }
      if (f.type === 'email') {
        const emailValue = (formData[f.id] || '').toString().trim();
        const sastraEmailRegex = /^\d+@sastra\.ac\.in$/i;
        if (!sastraEmailRegex.test(emailValue)) {
          setFormError('Please enter a valid SASTRA email address (Format: Regno@sastra.ac.in).');
          setSubmitting(false);
          return;
        }
      }
    }

    try {
      const response = await dbService.registerUser(event.id, formData);
      setSuccessData(response);
      
      // Update registrations counter in local state
      const updatedRegs = await dbService.getRegistrations(event.id);
      setRegistrations(updatedRegs);
    } catch (err) {
      setFormError(err.message || 'An error occurred during registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Event Header Banner (Layered design: Blurred ambient background + Contained full face foreground) */}
      <div style={{
        position: 'relative',
        height: '40vh',
        minHeight: '300px',
        width: '100%',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border-color)'
      }}>
        {/* Layer 1: Blurred background cover */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${event.coverImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(20px) brightness(0.35)',
          transform: 'scale(1.1)',
          zIndex: 1
        }} />

        {/* Layer 2: Dark gradient overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.85))',
          zIndex: 2
        }} />

        {/* Layer 3: Contained sharp image focused on the face */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${event.coverImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: event.bannerPosition || 'center',
          zIndex: 3
        }} />

        {/* Layer 4: Content Overlay */}
        <div style={{
          position: 'relative',
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          paddingBottom: '30px',
          zIndex: 4
        }}>
          <div className="container">
            <Link to="/calendar" style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '0.85rem',
              color: '#38bdf8',
              marginBottom: '15px',
              fontWeight: 600,
              textShadow: '0 2px 4px rgba(0,0,0,0.6)'
            }}>
              ← Back to Events Calendar
            </Link>
            
            <div>
              <span style={{
                display: 'inline-block',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                padding: '4px 10px',
                borderRadius: '20px',
                backgroundColor: 'rgba(56, 189, 248, 0.25)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                marginBottom: '15px',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}>
                {event.type}
              </span>
              <h1 style={{
                fontSize: 'calc(1.8rem + 1.2vw)',
                fontWeight: 800,
                lineHeight: 1.2,
                color: '#fff',
                maxWidth: '850px',
                textShadow: '0 2px 8px rgba(0,0,0,0.8)'
              }}>
                {event.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Info Columns */}
      <section className="section">
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.8fr 1.2fr',
            gap: '50px',
            alignItems: 'start'
          }} className="grid-2">
            
            {/* LEFT COLUMN: Main Description & FAQs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              
              {/* Event Description Card */}
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '15px', color: 'var(--text-main)' }}>About the Event</h2>
                <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                  {event.description}
                </p>
              </div>

              {/* Speaker / Facilitator Info */}
              {event.speaker && (
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(2, 132, 199, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-cyan)',
                    flexShrink: 0
                  }}>
                    <User size={30} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary-cyan)', fontWeight: 700, letterSpacing: '0.05em' }}>
                      Speaker / Host
                    </span>
                    <h4 style={{ fontSize: '1.15rem', color: 'var(--text-main)', margin: '2px 0' }}>{event.speaker}</h4>
                  </div>
                </div>
              )}

              {/* Prerequisites Block */}
              {event.prerequisites && (
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '10px', color: 'var(--text-main)' }}>Bio</h3>
                  <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--primary-cyan)', backgroundColor: 'rgba(2, 132, 199, 0.02)' }}>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: 0 }}>
                      {event.prerequisites}
                    </p>
                  </div>
                </div>
              )}

              {/* PAPER PRESENTATION / EVENT GUIDELINES & TRACKS DOCUMENTS */}
              {(event.guidelinesDoc || event.tracksDoc || (event.title && event.title.toLowerCase().includes('paper presentation'))) && (
                <div style={{
                  padding: '24px',
                  borderRadius: 'var(--radius-lg, 12px)',
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.06) 0%, rgba(30, 58, 138, 0.03) 100%)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={20} color="var(--primary-cyan)" /> Event Guidelines & Presentation Tracks
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                    Please review the official guidelines document and topic tracks before preparing and submitting your paper presentation.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    {/* Guidelines Document Card */}
                    <div className="card" style={{
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '14px',
                      margin: 0
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FileText size={20} />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Document
                          </span>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', margin: '2px 0 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {event.guidelinesDocName || 'Guidelines Document'}
                          </h4>
                        </div>
                      </div>

                      {event.guidelinesDoc ? (
                        <a
                          href={event.guidelinesDoc}
                          download={event.guidelinesDocName || 'Paper_Presentation_Guidelines.pdf'}
                          className="btn btn-primary"
                          style={{ width: '100%', justifyContent: 'center', padding: '8px 14px', fontSize: '0.85rem', gap: '6px' }}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Download size={14} /> Download Guidelines
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Guidelines document will be attached shortly.
                        </span>
                      )}
                    </div>

                    {/* Tracks Document Card */}
                    <div className="card" style={{
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '14px',
                      margin: 0
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FileText size={20} />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Document
                          </span>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', margin: '2px 0 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {event.tracksDocName || 'Tracks Document'}
                          </h4>
                        </div>
                      </div>

                      {event.tracksDoc ? (
                        <a
                          href={event.tracksDoc}
                          download={event.tracksDocName || 'Paper_Presentation_Tracks.pdf'}
                          className="btn btn-primary"
                          style={{ width: '100%', justifyContent: 'center', padding: '8px 14px', fontSize: '0.85rem', gap: '6px' }}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Download size={14} /> Download Tracks
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Tracks document will be attached shortly.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* HIGH RESOLUTION POSTER PREVIEW CARD (FOR PAPER PRESENTATION) */}
              {event.coverImage && (event.title?.toLowerCase().includes('paper presentation') || event.slug?.includes('paper-presentation')) && (
                <div className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                        Official Event Poster
                      </h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>High-resolution flyer with full dates, rules, and track details</span>
                    </div>
                    <a
                      href={event.coverImage}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: '6px 14px', fontSize: '0.82rem', gap: '6px' }}
                    >
                      <ExternalLink size={14} /> Open Full Size
                    </a>
                  </div>
                  <div style={{
                    width: '100%',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
                  }}>
                    <img
                      src={event.coverImage}
                      alt="Paper Presentation Official Poster"
                      style={{
                        width: '100%',
                        maxWidth: '700px',
                        height: 'auto',
                        objectFit: 'contain',
                        display: 'block'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* FAQ Accordion Section */}
              {faqs.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '20px', color: 'var(--text-main)' }}>Frequently Asked Questions</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {faqs.map((faq, idx) => {
                      const isActive = activeFaqIdx === idx;
                      return (
                        <div key={idx} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                          {/* Accordion Trigger Header */}
                          <button
                            onClick={() => setActiveFaqIdx(isActive ? null : idx)}
                            style={{
                              width: '100%',
                              padding: '16px 20px',
                              background: 'transparent',
                              border: 'none',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              textAlign: 'left',
                              color: 'var(--text-main)',
                              fontFamily: 'var(--font-heading)',
                              fontWeight: 600,
                              fontSize: '1rem',
                              cursor: 'pointer'
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <HelpCircle size={18} color="var(--primary-cyan)" style={{ flexShrink: 0 }} />
                              {faq.q}
                            </span>
                            <ChevronDown
                              size={18}
                              style={{
                                transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'var(--transition-smooth)',
                                color: 'var(--text-muted)'
                              }}
                            />
                          </button>

                          {/* Accordion Content Block */}
                          <div style={{
                            maxHeight: isActive ? '300px' : '0px',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease-in-out'
                          }}>
                            <div style={{ padding: '0 20px 20px 48px', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7' }}>
                              {faq.a}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: Sticky Registration & Meta Sidebar */}
            <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
              
              {/* Event Metadata Card */}
              <div className="card" style={{ padding: '25px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-main)' }}>Event Details</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '0.95rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Calendar size={18} color="var(--primary-cyan)" />
                    <div>
                      <span style={{ display: 'block', fontWeight: 600, color: 'var(--text-main)' }}>Date & Time</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {new Date(event.startDate).toLocaleString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <MapPin size={18} color="var(--primary-cyan)" />
                    <div>
                      <span style={{ display: 'block', fontWeight: 600, color: 'var(--text-main)' }}>Venue</span>
                      <span style={{ color: 'var(--text-muted)' }}>{event.venue}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Users size={18} color="var(--primary-cyan)" />
                    <div>
                      <span style={{ display: 'block', fontWeight: 600, color: 'var(--text-main)' }}>Availability</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {registrations.length} of {event.capacity} seats registered
                      </span>
                    </div>
                  </div>
                </div>

                {/* Registration Countdown Timer */}
                {!isPast && !timeLeft.expired && (
                  <div style={{
                    marginTop: '25px',
                    paddingTop: '20px',
                    borderTop: '1px solid var(--border-color)',
                    textAlign: 'center'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--primary-cyan)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '10px' }}>
                      <Clock size={14} /> Time Left To Register
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                      <div style={{ background: 'rgba(0,0,0,0.03)', padding: '6px 10px', borderRadius: '6px', minWidth: '45px', border: '1px solid var(--border-color)' }}>
                        <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{timeLeft.days}</span>
                        <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)' }}>Days</span>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.03)', padding: '6px 10px', borderRadius: '6px', minWidth: '45px', border: '1px solid var(--border-color)' }}>
                        <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{timeLeft.hours}</span>
                        <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)' }}>Hrs</span>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.03)', padding: '6px 10px', borderRadius: '6px', minWidth: '45px', border: '1px solid var(--border-color)' }}>
                        <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{timeLeft.minutes}</span>
                        <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)' }}>Mins</span>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.03)', padding: '6px 10px', borderRadius: '6px', minWidth: '45px', border: '1px solid var(--border-color)' }}>
                        <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{timeLeft.seconds}</span>
                        <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)' }}>Secs</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Registration Form Box */}
              <div className="card" style={{ padding: '25px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-main)' }}>Event Registration</h3>

                {isPast ? (
                  <div style={{ textAlign: 'center', padding: '15px 0' }}>
                    <AlertCircle size={30} color="var(--text-muted)" style={{ marginBottom: '10px' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                      Registration closed. This event has already concluded.
                    </p>
                  </div>
                ) : isFull ? (
                  <div style={{ textAlign: 'center', padding: '15px 0' }}>
                    <AlertCircle size={30} color="#f59e0b" style={{ marginBottom: '10px' }} />
                    <p style={{ color: '#f59e0b', fontSize: '0.95rem', fontWeight: 600 }}>
                      Sold Out!
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '5px' }}>
                      Maximum seating capacity has been reached. Follow our calendar for future repeats.
                    </p>
                  </div>
                ) : successData ? (
                  /* Success Card */
                  <div style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                      color: '#10b981',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px'
                    }}>
                      <Check size={20} />
                    </div>
                    <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '8px' }}>Registration Success!</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                      Your seat is reserved. A confirmation email has been dispatched.
                    </p>
                    <div style={{
                      padding: '10px',
                      background: 'rgba(0,0,0,0.03)',
                      borderRadius: '6px',
                      border: '1px dashed var(--border-color)',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      color: 'var(--primary-cyan)'
                    }}>
                      ID: {successData.id}
                    </div>
                  </div>
                ) : (
                  /* Main Registration Form */
                  <form onSubmit={handleSubmitRegistration}>
                    {formError && (
                      <div style={{
                        padding: '10px 15px',
                        backgroundColor: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: 'var(--radius-sm)',
                        color: '#ef4444',
                        fontSize: '0.85rem',
                        marginBottom: '15px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}>
                        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{formError}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {fields.map(f => (
                        <div key={f.id} className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">
                            {f.label} {f.required && <span style={{ color: '#ef4444' }}>*</span>}
                          </label>

                          {f.type === 'select' ? (
                            <select
                              value={formData[f.id] || ''}
                              onChange={(e) => handleInputChange(f.id, e.target.value)}
                              className="form-input"
                              required={f.required}
                            >
                              {f.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={f.type}
                              value={formData[f.id] || ''}
                              onChange={(e) => handleInputChange(f.id, e.target.value)}
                              className="form-input"
                              placeholder={f.label}
                              required={f.required}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: '20px' }}
                    >
                      {submitting ? 'Registering...' : 'Submit Registration'}
                    </button>
                  </form>
                )}
              </div>

            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
