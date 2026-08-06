import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ChevronRight } from 'lucide-react';

export default function EventCard({ event, registrationCount = 0 }) {
  const { id, title, slug, type, startDate, venue, capacity, coverImage } = event;

  const dateObj = new Date(startDate);
  const isPast = dateObj < new Date();

  // Helper to format date nicely
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Color mappings for badges
  const getBadgeStyle = (evtType) => {
    switch (evtType?.toLowerCase()) {
      case 'workshop':
        return { background: 'rgba(6, 182, 212, 0.15)', color: 'var(--primary-cyan)', border: '1px solid rgba(6, 182, 212, 0.3)' };
      case 'guest lecture':
        return { background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' };
      case 'competition':
        return { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' };
      case 'symposium':
        return { background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' };
      case 'inauguration':
        return { background: 'rgba(249, 115, 22, 0.15)', color: '#fb923c', border: '1px solid rgba(249, 115, 22, 0.3)' };
      case 'valediction':
        return { background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' };
      default:
        return { background: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8', border: '1px solid rgba(255, 255, 255, 0.1)' };
    }
  };

  const badgeStyle = getBadgeStyle(type);

  return (
    <div className={`card event-card ${isPast ? 'past-event' : ''}`} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: 'var(--space-md)' }}>
        <img
          src={coverImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80'}
          alt={title}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          className="event-card-img"
        />
        <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', ...badgeStyle }}>
            {type}
          </span>
        </div>
      </div>

      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--dark-text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '3.4rem', lineHeight: '1.7rem' }}>
          {title}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--dark-text-muted)', margin: '10px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={15} color="var(--primary-cyan)" />
            <span>{formattedDate} • {formattedTime}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={15} color="var(--primary-cyan)" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>{venue}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={15} color="var(--primary-cyan)" />
            <span>
              {isPast
                ? 'Concluded'
                : `${registrationCount} / ${capacity} Registered`}
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 'var(--space-md)' }}>
        {isPast ? (
          <Link to={`/events/${slug}`} className="btn btn-secondary" style={{ width: '100%', gap: '4px' }}>
            View Details
          </Link>
        ) : (
          <Link to={`/events/${slug}`} className="btn btn-primary" style={{ width: '100%', gap: '4px' }}>
            Register Now <ChevronRight size={16} />
          </Link>
        )}
      </div>
    </div>
  );
}
