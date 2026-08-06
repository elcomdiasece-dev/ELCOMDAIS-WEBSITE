import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

export default function Lightbox({ images, currentIndex, onClose, onNavigate }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const slideTimer = useRef(null);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (slideTimer.current) clearInterval(slideTimer.current);
    };
  }, []);

  // Control autoplay slideshow
  useEffect(() => {
    if (isPlaying) {
      slideTimer.current = setInterval(() => {
        handleNext();
      }, 3000); // 3 seconds per slide
    } else {
      if (slideTimer.current) {
        clearInterval(slideTimer.current);
        slideTimer.current = null;
      }
    }

    return () => {
      if (slideTimer.current) clearInterval(slideTimer.current);
    };
  }, [isPlaying, currentIndex]);

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + images.length) % images.length;
    onNavigate(prevIdx);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % images.length;
    onNavigate(nextIdx);
  };

  if (!images || images.length === 0 || currentIndex === -1) return null;
  const currentImage = images[currentIndex];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(5, 7, 12, 0.95)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backdropFilter: 'blur(8px)',
      padding: '20px'
    }}>
      {/* Top Bar Controls */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        zIndex: 1010
      }}>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="btn btn-secondary"
          style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          <span style={{ fontSize: '0.85rem' }}>{isPlaying ? 'Pause' : 'Slideshow'}</span>
        </button>

        <button
          onClick={onClose}
          className="social-icon-btn"
          style={{ width: '40px', height: '40px', backgroundColor: 'rgba(255,255,255,0.1)' }}
          aria-label="Close photo viewer"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Image Container */}
      <div style={{
        position: 'relative',
        maxWidth: '90%',
        maxHeight: '75vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Prev Arrow */}
        <button
          onClick={handlePrev}
          style={{
            position: 'absolute',
            left: '-60px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
            transition: 'var(--transition-smooth)'
          }}
          className="nav-arrow-left"
          aria-label="Previous photo"
        >
          <ChevronLeft size={24} />
        </button>

        <img
          src={currentImage.url}
          alt={currentImage.caption || 'Gallery photo'}
          style={{
            maxWidth: '100%',
            maxHeight: '75vh',
            objectFit: 'contain',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
          }}
        />

        {/* Next Arrow */}
        <button
          onClick={handleNext}
          style={{
            position: 'absolute',
            right: '-60px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
            transition: 'var(--transition-smooth)'
          }}
          className="nav-arrow-right"
          aria-label="Next photo"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Info Bar at Bottom */}
      <div style={{
        marginTop: '25px',
        textAlign: 'center',
        maxWidth: '600px',
        color: '#fff'
      }}>
        <p style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '5px' }}>
          {currentImage.caption || `Photo from Album`}
        </p>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-text-muted)' }}>
          {currentIndex + 1} of {images.length}
        </span>
      </div>

      {/* Thumbnails Strip */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '20px',
        overflowX: 'auto',
        maxWidth: '80%',
        paddingBottom: '10px'
      }}>
        {images.map((img, idx) => (
          <img
            key={img.id || idx}
            src={img.url}
            alt=""
            onClick={() => {
              setIsPlaying(false);
              onNavigate(idx);
            }}
            style={{
              width: '50px',
              height: '50px',
              objectFit: 'cover',
              borderRadius: '4px',
              cursor: 'pointer',
              border: idx === currentIndex ? '2px solid var(--primary-cyan)' : '2px solid transparent',
              opacity: idx === currentIndex ? 1 : 0.5,
              transition: 'var(--transition-smooth)'
            }}
          />
        ))}
      </div>
    </div>
  );
}
