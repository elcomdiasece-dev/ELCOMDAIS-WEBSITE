import React, { useState, useEffect } from 'react';
import { dbService } from '../lib/dbService';
import Lightbox from '../components/Lightbox';
import { Image as ImageIcon, Calendar, ChevronRight, ArrowLeft } from 'lucide-react';

export default function GalleryPage() {
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState(false);

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  // Load initial albums list
  useEffect(() => {
    async function loadAlbums() {
      try {
        const data = await dbService.getAlbums();
        setAlbums(data);
      } catch (err) {
        console.error('Error fetching albums:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAlbums();
  }, []);

  // Fetch images when album changes
  const handleSelectAlbum = async (album) => {
    setSelectedAlbum(album);
    setImagesLoading(true);
    try {
      const data = await dbService.getAlbumImages(album.id);
      setImages(data);
    } catch (err) {
      console.error('Error fetching album images:', err);
    } finally {
      setImagesLoading(false);
    }
  };

  const handleBackToAlbums = () => {
    setSelectedAlbum(null);
    setImages([]);
    setLightboxIndex(-1);
  };

  return (
    <section className="section" style={{ background: 'var(--grad-light-hero)', minHeight: '85vh' }}>
      <div className="container">
        
        {/* Header Title Area */}
        <div className="section-title-wrapper" style={{ marginBottom: selectedAlbum ? '30px' : '60px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--primary-cyan)', textTransform: 'uppercase' }}>
            ELCOMDAIS Media Archive
          </span>
          <h2 className="section-title">Photo Gallery</h2>
          <p className="section-subtitle">A collection of memories, milestones, and achievements throughout the academic year.</p>
        </div>

        {/* Breadcrumbs or Back Action */}
        {selectedAlbum && (
          <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleBackToAlbums}
              className="btn btn-secondary"
              style={{ padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
            >
              <ArrowLeft size={16} /> Back to Albums
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>Albums</span>
              <ChevronRight size={14} />
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{selectedAlbum.title}</span>
            </div>
          </div>
        )}

        {/* LOADING MAIN ALBUMS */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            Loading gallery albums...
          </div>
        ) : !selectedAlbum ? (
          
          /* ALBUMS FOLDERS GRID VIEW */
          albums.length > 0 ? (
            <div className="grid-3">
              {albums.map(album => (
                <div
                  key={album.id}
                  className="card"
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    padding: 0,
                    overflow: 'hidden'
                  }}
                  onClick={() => handleSelectAlbum(album)}
                >
                  {/* Album Cover Thumbnail */}
                  <div style={{ position: 'relative', width: '100%', paddingTop: '60%', overflow: 'hidden' }}>
                    <img
                      src={album.coverImage || 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80'}
                      alt={album.title}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                      className="event-card-img"
                    />
                  </div>

                  {/* Album Info */}
                  <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Calendar size={12} color="var(--primary-cyan)" />
                        <span>{new Date(album.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ImageIcon size={12} color="var(--primary-cyan)" />
                        <span>View Album</span>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)' }}>{album.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', flexGrow: 1 }}>
                      {album.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
              <p style={{ color: 'var(--text-muted)' }}>No albums uploaded to the media database yet.</p>
            </div>
          )
        ) : (
          
          /* ALBUM IMAGES GRID VIEW */
          <div>
            {imagesLoading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                Fetching photos...
              </div>
            ) : images.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '20px'
              }}>
                {images.map((img, idx) => (
                  <div
                    key={img.id || idx}
                    className="card"
                    style={{
                      padding: 0,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      position: 'relative',
                      paddingTop: '66%',
                      borderRadius: 'var(--radius-md)'
                    }}
                    onClick={() => setLightboxIndex(idx)}
                  >
                    <img
                      src={img.url}
                      alt={img.caption || 'Gallery photo'}
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
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
                <p style={{ color: 'var(--text-muted)' }}>This album does not contain any images yet.</p>
              </div>
            )}
          </div>
        )}

        {/* LIGHTBOX SLIDESHOW COMPONENT */}
        {lightboxIndex !== -1 && (
          <Lightbox
            images={images}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(-1)}
            onNavigate={(nextIdx) => setLightboxIndex(nextIdx)}
          />
        )}
      </div>
    </section>
  );
}
