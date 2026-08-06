import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dbService } from '../lib/dbService';
import EventCard from '../components/EventCard';
import { Cpu, Calendar, Award, CheckCircle, ArrowRight } from 'lucide-react';

export default function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentPhotos, setRecentPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const events = await dbService.getEvents();
        // Filter out past events, sort by upcoming date, take first 3
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const upcoming = events
          .filter(e => e.isPublished !== false && (!e.startDate || new Date(e.startDate) >= startOfToday))
          .slice(0, 3);
        setUpcomingEvents(upcoming);

        // Get images from the first couple of albums
        const albums = await dbService.getAlbums();
        let photos = [];
        for (const album of albums.slice(0, 2)) {
          const imgs = await dbService.getAlbumImages(album.id);
          photos = [...photos, ...imgs];
        }
        setRecentPhotos(photos.slice(0, 4));
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="section" style={{
        backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.85)), url(/home-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-xxl) 0',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div className="hero-logo-container logo-animate" style={{
            width: '180px',
            height: '180px',
            marginBottom: 'var(--space-lg)'
          }}>
            <img src="/logo.jpg" alt="ELCOMDAIS Tech Tree Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          <span style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: '#00f0ff',
            textTransform: 'uppercase',
            marginBottom: 'var(--space-xs)',
            textShadow: '0 0 10px rgba(0, 240, 255, 0.4)'
          }}>
            Electronics & Communication Engineering Association
          </span>

          <h1 style={{
            fontSize: 'calc(2.2rem + 1.8vw)',
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: 'var(--space-md)',
            background: 'linear-gradient(to right, #ffffff, #00f0ff, #0284c7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 20px rgba(0, 240, 255, 0.15)'
          }}>
            LEARN • LEAD • LEAVE A LEGACY
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: '#cbd5e1',
            lineHeight: 1.8,
            marginBottom: 'var(--space-xl)',
            maxWidth: '700px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Join ELCOMDAIS for the 2026–27 academic year. We bridge the gap between classroom theory and industry practice through high-impact workshops, hackathons, and symposiums.
          </p>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/calendar" className="btn btn-primary" style={{ gap: '8px' }}>
              Explore Events Calendar <ArrowRight size={18} />
            </Link>
            <Link to="/about" className="btn btn-secondary" style={{
              color: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              background: 'rgba(255, 255, 255, 0.05)'
            }}>
              Discover Our Philosophy
            </Link>
          </div>
        </div>
      </section>



      {/* Featured Events Section */}
      <section className="section" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div className="section-title-wrapper">
            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--primary-cyan)', textTransform: 'uppercase' }}>
              What's Next?
            </span>
            <h2 className="section-title">Upcoming Activities</h2>
            <p className="section-subtitle">Reserve your spot in our upcoming hands-on training sessions and hackathons.</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0', color: 'var(--text-muted)' }}>
              Loading upcoming events...
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div>
              <div className="grid-3">
                {upcomingEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
                <Link to="/calendar" className="btn btn-secondary" style={{ gap: '8px' }}>
                  View All Scheduled Events <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
                No upcoming events scheduled at this moment. Explore our full academic calendar.
              </p>
              <Link to="/calendar" className="btn btn-secondary">
                Go to Events Calendar
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Image Gallery Highlight Grid */}
      <section className="section" style={{ backgroundColor: 'rgba(241, 245, 249, 0.4)' }}>
        <div className="container">
          <div className="section-title-wrapper">
            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--primary-cyan)', textTransform: 'uppercase' }}>
              Glimpses of ELCOMDAIS
            </span>
            <h2 className="section-title">Recent Event Gallery</h2>
            <p className="section-subtitle">Visual highlights of our latest campus activities, hackathons, and ceremonies.</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0', color: 'var(--text-muted)' }}>
              Loading images...
            </div>
          ) : recentPhotos.length > 0 ? (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '20px',
                marginBottom: 'var(--space-xl)'
              }}>
                {recentPhotos.map(photo => (
                  <div key={photo.id} style={{
                    position: 'relative',
                    paddingTop: '66%',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)'
                  }} className="card">
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      className="event-card-img"
                    />
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center' }}>
                <Link to="/gallery" className="btn btn-secondary">
                  Explore Full Photo Gallery
                </Link>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
                No photos uploaded yet. Check back soon for updates!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
