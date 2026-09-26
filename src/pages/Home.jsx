import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dbService } from '../lib/dbService';
import {
  Cpu,
  Calendar,
  Award,
  CheckCircle,
  ArrowRight,
  Users,
  Lightbulb,
  Trophy,
  Rocket,
  MapPin,
  Bot,
  Radio,
  ChevronRight,
  Share2
} from 'lucide-react';

export default function Home() {
  const [activeDot, setActiveDot] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Load live events from the calendar/database
  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await dbService.getEvents();
        const published = data.filter(e => e.isPublished !== false);
        // Sort by start date ascending, show the first 3
        const sorted = [...published].sort(
          (a, b) => new Date(a.startDate) - new Date(b.startDate)
        );
        setUpcomingEvents(sorted.slice(0, 3));
      } catch (err) {
        console.error('Error loading home events:', err);
      } finally {
        setEventsLoading(false);
      }
    }
    loadEvents();
  }, []);

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="section" style={{ background: 'var(--grad-hero)', paddingBottom: '7rem' }}>
        {/* Dotted Grid Decorations */}
        <div className="dotted-grid-bg dotted-grid-hero-left"></div>
        <div className="dotted-grid-bg dotted-grid-hero-right"></div>

        <div className="container hero-wrapper">
          {/* Left Column: Heading and CTAs */}
          <div>
            <span className="hero-subtitle">
              Electronics & Communication Engineering Association
            </span>
            
            <h1 className="hero-title-main">
              LEARN <span className="hero-lead-purple">LEAD</span><br />
              LEAVE A <span className="hero-legacy-underline"><span className="hero-legacy-blue">LEGACY</span></span>
            </h1>

            <p className="hero-desc">
              A student driven community that inspires innovation, collaboration and growth.
            </p>

            <div className="hero-buttons">
              <Link to="/about" className="btn btn-primary" style={{ gap: '12px' }}>
                Explore More
                <span className="btn-icon-wrapper">
                  <ArrowRight size={15} />
                </span>
              </Link>
              <Link to="/calendar" className="btn btn-secondary" style={{ gap: '8px' }}>
                <Calendar size={16} />
                View Calendar
              </Link>
            </div>
          </div>

          {/* Right Column: Circled Circuit Tree Orbit */}
          <div className="hero-graphic-container">
            <div className="hero-circuit-circle">
              <img
                src="/hero_circuit_tree.jpg"
                alt="ELCOMDAIS Circuit Tree"
                className="hero-circuit-tree-img"
              />
              {/* Floating Badges */}
              <div className="badge-orbit badge-orbit-1" title="Electronics">
                <Cpu size={20} />
              </div>
              <div className="badge-orbit badge-orbit-2" title="Robotics">
                <Bot size={20} />
              </div>
              <div className="badge-orbit badge-orbit-3" title="Innovation">
                <Lightbulb size={20} />
              </div>
              <div className="badge-orbit badge-orbit-4" title="Communication">
                <Radio size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Curve Wave Divider */}
        <div className="wave-divider">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" className="shape-fill" fill="var(--bg-section-alt)"></path>
          </svg>
        </div>
      </section>

      {/* 2. Capabilities Section */}
      <section className="capabilities-grid-container">
        <div className="container">
          <div className="grid-6">
            {/* Card 1: Student Driven */}
            <div className="capability-card">
              <div className="capability-icon-box blue">
                <Users size={22} />
              </div>
              <h3 className="capability-title">Student Driven</h3>
              <p className="capability-desc">Run by students, for students.</p>
            </div>

            {/* Card 2: Tech Excellence */}
            <div className="capability-card">
              <div className="capability-icon-box blue">
                <Cpu size={22} />
              </div>
              <h3 className="capability-title">Tech Excellence</h3>
              <p className="capability-desc">Explore, learn and excel in technology.</p>
            </div>

            {/* Card 3: Innovate */}
            <div className="capability-card">
              <div className="capability-icon-box blue">
                <Lightbulb size={22} />
              </div>
              <h3 className="capability-title">Innovate</h3>
              <p className="capability-desc">Turn ideas into real world impact.</p>
            </div>

            {/* Card 4: Compete */}
            <div className="capability-card">
              <div className="capability-icon-box purple">
                <Trophy size={22} />
              </div>
              <h3 className="capability-title">Compete</h3>
              <p className="capability-desc">Participate. Compete. Win. Grow.</p>
            </div>

            {/* Card 5: Collaborate */}
            <div className="capability-card">
              <div className="capability-icon-box cyan">
                <Share2 size={22} />
              </div>
              <h3 className="capability-title">Collaborate</h3>
              <p className="capability-desc">Connect. Share. Create together.</p>
            </div>

            {/* Card 6: Make an Impact */}
            <div className="capability-card">
              <div className="capability-icon-box sky">
                <Rocket size={22} />
              </div>
              <h3 className="capability-title">Make An Impact</h3>
              <p className="capability-desc">Leave a legacy that inspires.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Upcoming Activities Section */}
      <section className="section" style={{ backgroundColor: 'var(--bg-section-alt)' }}>
        <div className="container">
          <div className="activities-header-row">
            <div>
              <span className="section-tag">What's Next?</span>
              <h2 className="section-title">Upcoming <span>Activities</span></h2>
            </div>
            <Link to="/calendar" className="btn btn-secondary" style={{ gap: '8px', padding: '0.65rem 1.4rem' }}>
              <Calendar size={16} />
              View Full Calendar
            </Link>
          </div>

          <div className="grid-3">
            {eventsLoading ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                Loading events...
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No upcoming events scheduled yet.</p>
                <Link to="/calendar" className="btn btn-secondary">View Calendar</Link>
              </div>
            ) : (
              upcomingEvents.map((event) => {
                const dateObj = new Date(event.startDate);
                const isPast = dateObj < new Date();
                const formattedDate = dateObj.toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                }).toUpperCase() + ' ' + dateObj.toLocaleTimeString('en-US', {
                  hour: '2-digit', minute: '2-digit'
                });
                const fallbackImg = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80';

                return (
                  <div className="event-card" key={event.id}>
                    <div className="event-card-image-wrapper">
                      <img
                        src={event.coverImage || fallbackImg}
                        alt={event.title}
                        className="event-card-img"
                      />
                      <span className="event-card-tag">
                        {event.type}
                      </span>
                      <div className="event-card-date">
                        <Calendar size={13} />
                        <span>{formattedDate}</span>
                      </div>
                    </div>

                    <div className="event-card-content">
                      <h3 className="event-card-title">{event.title}</h3>
                      <p className="event-card-desc">{event.description}</p>

                      <div className="event-card-footer">
                        <div className="event-card-info-item">
                          <MapPin size={15} color="var(--primary-blue)" />
                          <span>{event.venue || 'TBD'}</span>
                        </div>
                        {isPast ? (
                          <span className="event-card-status-concluded">Concluded</span>
                        ) : (
                          <div className="event-card-info-item">
                            <Users size={15} color="var(--primary-blue)" />
                            <span>0 / {event.capacity || 50} Registered</span>
                          </div>
                        )}
                      </div>

                      {!isPast && (
                        <div style={{ marginTop: '1.2rem' }}>
                          <Link
                            to={`/events/${event.slug}`}
                            className="btn btn-primary"
                            style={{ width: '100%', gap: '8px', padding: '0.6rem' }}
                          >
                            Register Now
                            <span className="btn-icon-wrapper">
                              <ChevronRight size={14} />
                            </span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Carousel Pagination Dots */}
          <div className="pagination-dots">
            <span className={`pagination-dot ${activeDot === 0 ? 'active' : ''}`} onClick={() => setActiveDot(0)}></span>
            <span className={`pagination-dot ${activeDot === 1 ? 'active' : ''}`} onClick={() => setActiveDot(1)}></span>
            <span className={`pagination-dot ${activeDot === 2 ? 'active' : ''}`} onClick={() => setActiveDot(2)}></span>
          </div>
        </div>
      </section>

      {/* 4. Who We Are Section */}
      <section className="section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container whoweare-wrapper">
          {/* Left: Heading and List */}
          <div>
            <span className="section-tag">Who We Are</span>
            <h2 className="section-title whoweare-title">
              More Than Just a Club,<br />We're a <span>Movement</span>.
            </h2>
            <p className="whoweare-desc">
              ELCOMDAIS is the official student body of the Electronics and Communication Engineering Department. We bring together passionate minds to learn, build, innovate and lead.
            </p>

            <ul className="checkmark-list">
              <li className="checkmark-item">
                <span className="checkmark-icon"><CheckCircle size={18} /></span>
                Workshops & Hackathons
              </li>
              <li className="checkmark-item">
                <span className="checkmark-icon"><CheckCircle size={18} /></span>
                Technical & Non-Technical Events
              </li>
              <li className="checkmark-item">
                <span className="checkmark-icon"><CheckCircle size={18} /></span>
                Industry Interactions
              </li>
              <li className="checkmark-item">
                <span className="checkmark-icon"><CheckCircle size={18} /></span>
                Community & Peer Learning
              </li>
            </ul>

            <Link to="/about" className="btn btn-primary" style={{ gap: '12px' }}>
              Know More About Us
              <span className="btn-icon-wrapper">
                <ArrowRight size={15} />
              </span>
            </Link>
          </div>

          {/* Right: Round Robotics Image */}
          <div className="whoweare-graphic-container">
            <div className="dotted-grid-bg whoweare-dots"></div>
            <div className="whoweare-mask-wrapper">
              <img
                src="/students_collaborating.jpg"
                alt="Students collaborating on Robotics"
                className="whoweare-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Statistics Section */}
      <section className="section" style={{ backgroundColor: 'var(--bg-section-alt)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {/* Stat 1 */}
            <div className="stats-card">
              <div className="stats-icon-box purple">
                <Users size={22} />
              </div>
              <div className="stats-info">
                <span className="stats-number">500+</span>
                <span className="stats-label">Active Members</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="stats-card">
              <div className="stats-icon-box blue">
                <Calendar size={22} />
              </div>
              <div className="stats-info">
                <span className="stats-number">20+</span>
                <span className="stats-label">Events Every Year</span>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="stats-card">
              <div className="stats-icon-box green">
                <Award size={22} />
              </div>
              <div className="stats-info">
                <span className="stats-number">10+</span>
                <span className="stats-label">Workshops & Hackathons</span>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="stats-card">
              <div className="stats-icon-box yellow">
                <Trophy size={22} />
              </div>
              <div className="stats-info">
                <span className="stats-number">1</span>
                <span className="stats-label">Stronger Community</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call to Action Banner Section */}
      <section className="section cta-section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <div className="cta-banner">
            {/* Quote SVG Accent decoration */}
            <div className="cta-quote-icon">
              <svg width="80" height="80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>

            {/* Banner Left Details */}
            <div style={{ zIndex: 2 }}>
              <h2 className="cta-title">
                Be part of something<br /><span>bigger</span> than yourself.
              </h2>
              <p className="cta-desc">
                Collaborate. Innovate. Inspire. Together, let's create the future.
              </p>
              <a href="#stay-connected" onClick={(e) => {
                e.preventDefault();
                document.getElementById('stay-connected')?.scrollIntoView({ behavior: 'smooth' });
              }} className="btn btn-primary" style={{ gap: '12px' }}>
                Join Us Now
                <span className="btn-icon-wrapper">
                  <ArrowRight size={15} />
                </span>
              </a>
            </div>

            {/* Banner Right Image */}
            <div className="cta-graphic-side">
              <img
                src="/students_highfive.jpg"
                alt="Students High Five Illustration"
                className="cta-illustration"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
