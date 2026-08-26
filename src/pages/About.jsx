import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Award, BookOpen, Compass, CheckCircle2, User, ChevronDown, ChevronUp, Cpu } from 'lucide-react';
import { dbService } from '../lib/dbService';
import Lightbox from '../components/Lightbox';

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
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [zoomedMember, setZoomedMember] = useState(null);

  // Lightbox State for Committee Photos
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [lightboxPhotos, setLightboxPhotos] = useState([]);

  // Extract all zoomable committee photos
  const getCommitteePhotosList = () => {
    const list = [];
    if (team.faculty && Array.isArray(team.faculty)) {
      team.faculty.forEach(f => {
        if (f.image && !f.image.startsWith('db:')) {
          list.push({ url: f.image, caption: `${f.name} - ${f.role} (Faculty Coordinator)` });
        }
      });
    }
    if (team.presidents && Array.isArray(team.presidents)) {
      team.presidents.forEach(p => {
        if (p.image && !p.image.startsWith('db:')) {
          list.push({ url: p.image, caption: `${p.name} - ${p.role}` });
        }
      });
    }
    if (team.core && Array.isArray(team.core)) {
      team.core.forEach(c => {
        if (c.image && !c.image.startsWith('db:')) {
          list.push({ url: c.image, caption: `${c.name} - ${c.role}` });
        }
        if (c.members && Array.isArray(c.members)) {
          c.members.forEach(sub => {
            if (sub.image && !sub.image.startsWith('db:')) {
              list.push({ url: sub.image, caption: `${sub.name} - ${sub.role} (Sub-team Member)` });
            }
          });
        }
      });
    }
    return list;
  };

  const openZoom = (member) => {
    if (!member || !member.image || member.image.startsWith('db:')) return;
    const photos = getCommitteePhotosList();
    const index = photos.findIndex(p => p.url === member.image);
    if (index !== -1) {
      setLightboxPhotos(photos);
      setLightboxIndex(index);
    } else {
      setLightboxPhotos([{ url: member.image, caption: `${member.name} - ${member.role}` }]);
      setLightboxIndex(0);
    }
  };

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

  const renderSvgNode = (member, x, y, size = 70, hasTeam = false, isExpanded = false, onToggle = null, labelPosition = 'bottom') => {
    const radius = size / 2;
    const randomSuffix = Math.floor(Math.random() * 1000000);
    const clipId = `clip-${member.role.replace(/[^a-zA-Z0-9]/g, '-')}-${randomSuffix}`;
    const labelY = labelPosition === 'top' ? y - radius - 55 : y + radius + 6;

    const hasPhoto = member.image && !member.image.startsWith('db:');
    const handleClick = onToggle ? () => onToggle() : (hasPhoto ? () => openZoom(member) : null);
    const cursorStyle = onToggle || hasPhoto ? 'pointer' : 'default';

    return (
      <g 
        key={member.role + '-' + (member.name || 'pending')} 
        className="organic-tree-node-group"
        style={{ cursor: cursorStyle, transformOrigin: `${x}px ${y}px` }} 
        onClick={handleClick}
      >
        {/* Hover ring glow / background foliage */}
        {hasTeam && (
          <circle
            cx={x}
            cy={y}
            r={radius + 8}
            fill="none"
            stroke={isExpanded ? 'var(--accent-purple)' : 'var(--primary-blue)'}
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.6"
            className="node-orbit-glow"
          />
        )}
        
        {/* Leaf cluster behind node */}
        <circle cx={x - 10} cy={y - 10} r={radius - 5} fill="#4ade80" opacity="0.15" />
        <circle cx={x + 10} cy={y - 5} r={radius - 8} fill="#22c55e" opacity="0.12" />

        {/* Circular Avatar Container */}
        <g 
          className="svg-avatar-interactive"
          onClick={(e) => {
            if (member.image && !member.image.startsWith('db:')) {
              e.stopPropagation();
              setZoomedMember(member);
            }
          }}
          style={{ cursor: member.image && !member.image.startsWith('db:') ? 'pointer' : 'default' }}
        >
          <defs>
            <clipPath id={clipId}>
              <circle cx={x} cy={y} r={radius} />
            </clipPath>
          </defs>
          <circle cx={x} cy={y} r={radius + 3} fill="none" stroke="#8b5a2b" strokeWidth="2.5" className="avatar-border" />
          <circle cx={x} cy={y} r={radius} fill="#f1f5f9" />
          
          {member.image && !member.image.startsWith('db:') ? (
            <image
              href={member.image}
              x={x - radius}
              y={y - radius}
              width={size}
              height={size}
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#${clipId})`}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : null}

          {/* Fallback Icon */}
          {(!member.image || member.image.startsWith('db:')) && (
            <g clipPath={`url(#${clipId})`}>
              <circle cx={x} cy={y} r={radius} fill="#e2e8f0" />
              <circle cx={x} cy={y - radius * 0.25} r={radius * 0.35} fill="#64748b" opacity="0.5" />
              <path d={`M ${x - radius * 0.6},${y + radius * 0.7} A ${radius * 0.6},${radius * 0.6} 0 0 1 ${x + radius * 0.6},${y + radius * 0.7} Z`} fill="#64748b" opacity="0.5" />
            </g>
          )}
        </g>

        {/* Expand / Collapse Indicator Badge */}
        {hasTeam && (
          <g transform={`translate(${x + radius * 0.6}, ${y + radius * 0.6})`}>
            <circle cx="0" cy="0" r="10" fill={isExpanded ? 'var(--accent-purple)' : 'var(--primary-blue)'} />
            <path 
              d={isExpanded ? "M -4,0 L 4,0" : "M -4,0 L 4,0 M 0,-4 L 0,4"} 
              stroke="#ffffff" 
              strokeWidth="2" 
              strokeLinecap="round" 
            />
          </g>
        )}

        {/* Readability label inside foreignObject */}
        <foreignObject x={x - 90} y={labelY} width="180" height="52" style={{ pointerEvents: 'none' }}>
          <div style={{
            textAlign: 'center',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.78rem',
            lineHeight: '1.15',
            textShadow: '0 1.5px 3px #ffffff, 0 -1.5px 3px #ffffff, 1.5px 0 3px #ffffff, -1.5px 0 3px #ffffff',
            padding: '1.5px'
          }}>
            <strong style={{ display: 'block', fontSize: '0.82rem', color: '#0f172a' }}>
              {member.name || 'Profile Pending'}
            </strong>
            <span style={{ fontSize: '0.64rem', color: '#166534', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.01em' }}>
              {member.role}
            </span>
          </div>
        </foreignObject>
      </g>
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
      <section className="section" style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: '#faf8f5', overflow: 'hidden' }}>
        <div className="container">
          <div className="section-title-wrapper" style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h2 className="section-title" style={{ color: '#3d2514' }}>The Committee Tree</h2>
            <p className="section-subtitle" style={{ color: '#7c5e43' }}>
              Enclosed entirely within a circular canopy, our coordinates split like organic branches representing levels of student coordination.
            </p>
          </div>

          {/* Perfect circular container boundary */}
          <div style={{
            width: '100%',
            maxWidth: '920px',
            margin: '0 auto',
            aspectRatio: '1',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #fdfcf7 0%, #fcfaf2 70%, #f5f0e3 100%)',
            border: '10px double #8b5a2b',
            boxShadow: 'var(--shadow-premium), inset 0 0 60px rgba(139, 90, 43, 0.15)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* The SVG Org Tree */}
            <svg viewBox="0 0 1000 1000" width="100%" height="100%" style={{ display: 'block' }}>
              {/* Outer Canopy Foliage frame (overlapping translucent green leaf circles) */}
              <circle cx="200" cy="180" r="140" fill="#1b4332" opacity="0.06" className="canopy-foliage-leaf" />
              <circle cx="350" cy="120" r="160" fill="#2d6a4f" opacity="0.05" className="canopy-foliage-leaf" />
              <circle cx="500" cy="100" r="150" fill="#40916c" opacity="0.06" className="canopy-foliage-leaf" />
              <circle cx="650" cy="120" r="160" fill="#2d6a4f" opacity="0.05" className="canopy-foliage-leaf" />
              <circle cx="800" cy="180" r="140" fill="#1b4332" opacity="0.06" className="canopy-foliage-leaf" />
              <circle cx="150" cy="300" r="120" fill="#52b788" opacity="0.05" className="canopy-foliage-leaf" />
              <circle cx="850" cy="300" r="120" fill="#52b788" opacity="0.05" className="canopy-foliage-leaf" />

              {/* TREE STRUCTURE PATHS */}
              {/* Roots at base */}
              <path d="M 500,950 Q 420,970 380,985" stroke="#4d2f1d" strokeWidth="18" fill="none" strokeLinecap="round" opacity="0.9" />
              <path d="M 500,950 Q 580,970 620,985" stroke="#4d2f1d" strokeWidth="18" fill="none" strokeLinecap="round" opacity="0.9" />
              
              {/* Main Trunk */}
              <path d="M 500,960 C 495,840 505,740 500,680" stroke="#4d2f1d" strokeWidth="46" fill="none" strokeLinecap="round" />
              {/* Bark Textures */}
              <path d="M 490,955 Q 492,835 496,690" stroke="#331e12" strokeWidth="4" fill="none" opacity="0.5" />
              <path d="M 508,945 Q 506,825 503,695" stroke="#331e12" strokeWidth="4" fill="none" opacity="0.5" />

              {/* Presidents branches */}
              <path d="M 500,680 C 420,685 370,640 310,600" stroke="#4d2f1d" strokeWidth="22" fill="none" strokeLinecap="round" />
              <path d="M 500,680 C 580,685 630,640 690,600" stroke="#4d2f1d" strokeWidth="22" fill="none" strokeLinecap="round" />
              
              {/* Main crown trunk */}
              <path d="M 500,680 C 495,570 505,520 500,450" stroke="#4d2f1d" strokeWidth="24" fill="none" strokeLinecap="round" />

              {/* Core Chairs coordinates calculations */}
              {(() => {
                const totalCore = team.core.length;
                const startAngle = 195 * Math.PI / 180;
                const endAngle = 345 * Math.PI / 180;
                
                const coreNodes = team.core.map((member, i) => {
                  const angle = totalCore > 1 
                    ? startAngle + (i / (totalCore - 1)) * (endAngle - startAngle)
                    : (startAngle + endAngle) / 2;
                  return {
                    member,
                    x: 500 + 350 * Math.cos(angle),
                    y: 440 + 260 * Math.sin(angle),
                    size: 70
                  };
                });

                // Calculate sub-members coordinates dynamically
                const expandedSubNodes = [];
                const subTwigPaths = [];
                coreNodes.forEach((node) => {
                  const isExpanded = !!expandedCards[node.member.id];
                  if (isExpanded && node.member.members && Array.isArray(node.member.members)) {
                    const cx = node.x;
                    const cy = node.y;
                    const M = node.member.members.length;
                    const centerAngle = Math.atan2(cy - 480, cx - 500);
                    const spreadAngle = 65 * Math.PI / 180;
                    
                    node.member.members.forEach((sub, j) => {
                      const angleOffset = M > 1 ? -spreadAngle/2 + (j / (M - 1)) * spreadAngle : 0;
                      const subAngle = centerAngle + angleOffset;
                      const sx = cx + 115 * Math.cos(subAngle);
                      const sy = cy + 115 * Math.sin(subAngle);
                      
                      expandedSubNodes.push({
                        member: sub,
                        x: sx,
                        y: sy,
                        size: 50
                      });
                      
                      subTwigPaths.push({
                        cx,
                        cy,
                        sx,
                        sy,
                        id: `${node.member.id}-${j}`
                      });
                    });
                  }
                });

                return (
                  <>
                    {/* Core Chairs branch paths */}
                    {coreNodes.map((node) => {
                      const cx = node.x;
                      const cy = node.y;
                      // Curve branch lines beautifully
                      return (
                        <path 
                          key={`branch-${node.member.id}`}
                          d={`M 500,450 Q ${(500 + cx) / 2},${(450 + cy) / 2 - 30} ${cx},${cy}`} 
                          stroke="#5c3a21" 
                          strokeWidth="12" 
                          fill="none" 
                          strokeLinecap="round" 
                        />
                      );
                    })}

                    {/* Twig paths to expanded sub-members */}
                    {subTwigPaths.map((twig) => (
                      <path 
                        key={`twig-${twig.id}`}
                        d={`M ${twig.cx},${twig.cy} Q ${(twig.cx + twig.sx) / 2},${(twig.cy + twig.sy) / 2} ${twig.sx},${twig.sy}`} 
                        stroke="#7c5539" 
                        strokeWidth="5" 
                        fill="none" 
                        strokeLinecap="round" 
                        className="organic-twig-path"
                      />
                    ))}

                    {/* RENDER MEMBER NODES */}
                    {/* Faculty Nodes */}
                    {team.faculty[0] && renderSvgNode(team.faculty[0], 380, 830, 95)}
                    {team.faculty[1] && renderSvgNode(team.faculty[1], 620, 830, 95)}

                    {/* Presidents Nodes */}
                    {team.presidents[0] && renderSvgNode(team.presidents[0], 310, 600, 85)}
                    {team.presidents[1] && renderSvgNode(team.presidents[1], 690, 600, 85)}

                    {/* Core Chairs Nodes */}
                    {coreNodes.map((node) => 
                      renderSvgNode(
                        node.member,
                        node.x,
                        node.y,
                        node.size,
                        node.member.members !== null,
                        selectedTeam && selectedTeam.id === node.member.id,
                        () => setSelectedTeam(node.member)
                      )
                    )}

                    {/* Sub-members Nodes */}
                    {expandedSubNodes.map((node) => 
                      renderSvgNode(
                        node.member,
                        node.x,
                        node.y,
                        node.size,
                        false,
                        false,
                        null
                      )
                    )}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>
      </section>

      {selectedTeam && (
        <div 
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setSelectedTeam(null)}
        >
          {/* Modal Container: Perfect Circle */}
          <div 
            className="modal-container"
            style={{
              width: '90vw',
              height: '90vw',
              maxWidth: '680px',
              maxHeight: '680px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #fdfcf7 0%, #fcfaf2 70%, #f5f0e3 100%)',
              border: '10px double #8b5a2b',
              boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5), inset 0 0 50px rgba(139, 90, 43, 0.15)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              onClick={() => setSelectedTeam(null)}
              style={{
                position: 'absolute',
                top: '35px',
                right: '35px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#ffffff',
                border: '1px solid rgba(139, 90, 43, 0.2)',
                color: '#8b5a2b',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
                zIndex: 10,
                transition: 'var(--transition-smooth)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#8b5a2b';
                e.target.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#ffffff';
                e.target.style.color = '#8b5a2b';
              }}
            >
              ✕
            </button>

            {/* SVG radial structure */}
            <svg viewBox="0 0 600 600" width="100%" height="100%" style={{ display: 'block' }}>
              {/* Soft decorative background circles */}
              <circle cx="300" cy="300" r="175" fill="none" stroke="#e6dfd1" strokeWidth="1.5" strokeDasharray="6 6" />
              <circle cx="300" cy="300" r="240" fill="none" stroke="#e6dfd1" strokeWidth="1.5" opacity="0.5" />
              
              {/* Leaf silhouettes for natural decoration */}
              <circle cx="300" cy="300" r="100" fill="#22c55e" opacity="0.04" />
              
              {/* BRANCH LINES connecting focal center to surrounding sub-members */}
              {selectedTeam.members && Array.isArray(selectedTeam.members) && selectedTeam.members.map((sub, idx) => {
                const M = selectedTeam.members.length;
                const angle = (idx / M) * 2 * Math.PI - Math.PI / 2;
                const sx = 300 + 175 * Math.cos(angle);
                const sy = 300 + 175 * Math.sin(angle);
                return (
                  <path 
                    key={`modal-twig-${idx}`}
                    d={`M 300,300 Q ${(300 + sx) / 2 + 25 * Math.sin(angle)}, ${(300 + sy) / 2 - 25 * Math.cos(angle)} ${sx},${sy}`}
                    stroke="#8b5a2b"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    className="organic-twig-path"
                  />
                );
              })}

              {/* RENDER NODES */}
              {/* Center Focal Leader Node */}
              {renderSvgNode(selectedTeam, 300, 300, 110, false, false, null, 'bottom')}

              {/* Surrounding Sub-team Nodes */}
              {selectedTeam.members && Array.isArray(selectedTeam.members) && selectedTeam.members.map((sub, idx) => {
                const M = selectedTeam.members.length;
                const angle = (idx / M) * 2 * Math.PI - Math.PI / 2;
                const sx = 300 + 175 * Math.cos(angle);
                const sy = 300 + 175 * Math.sin(angle);
                const labelPos = sy < 280 ? 'top' : 'bottom';
                return renderSvgNode(sub, sx, sy, 60, false, false, null, labelPos);
              })}

              {/* Decorative Banner/Text inside the circular view */}
              <foreignObject x="100" y="30" width="400" height="70" style={{ pointerEvents: 'none' }}>
                <div style={{
                  textAlign: 'center',
                  fontFamily: 'var(--font-heading)',
                  color: '#2d1e12',
                  textShadow: '0 2px 4px #ffffff, 0 -2px 4px #ffffff, 2px 0 4px #ffffff, -2px 0 4px #ffffff',
                  lineHeight: '1.2'
                }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: '#166534',
                    letterSpacing: '0.1em',
                    display: 'block'
                  }}>
                    Detailed Team View
                  </span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '2px 0 0 0', color: '#3d2514' }}>
                    {selectedTeam.role}
                  </h3>
                </div>
              </foreignObject>

              {/* Note for empty sub-team coordinate */}
              {(!selectedTeam.members || selectedTeam.members.length === 0) && (
                <foreignObject x="150" y="440" width="300" height="80" style={{ pointerEvents: 'none' }}>
                  <div style={{
                    textAlign: 'center',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.8rem',
                    color: '#7c5e43',
                    textShadow: '0 1px 3px #ffffff',
                    padding: '8px',
                    lineHeight: '1.4',
                    border: '1px dashed rgba(139, 90, 43, 0.2)',
                    borderRadius: '8px',
                    background: 'rgba(253, 252, 247, 0.8)'
                  }}>
                    This role operates independently as a core representative with no subordinate sub-team coordinators.
                  </div>
                </foreignObject>
              )}
            </svg>
          </div>
        </div>
      )}

      {lightboxIndex !== -1 && (
        <Lightbox
          images={lightboxPhotos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(-1)}
          onNavigate={(nextIdx) => setLightboxIndex(nextIdx)}
        />
      )}

      {zoomedMember && (
        <div 
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 30000,
            padding: '20px'
          }}
          onClick={() => setZoomedMember(null)}
        >
          {/* Modal Container: Perfect Circle/Square hybrid with elegant borders */}
          <div 
            className="modal-container"
            style={{
              width: '90vw',
              maxWidth: '440px',
              borderRadius: '24px',
              background: 'radial-gradient(circle, #fdfcf7 0%, #fcfaf2 70%, #f5f0e3 100%)',
              border: '6px double #8b5a2b',
              boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5), inset 0 0 50px rgba(139, 90, 43, 0.15)',
              position: 'relative',
              padding: '40px 24px 35px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setZoomedMember(null)}
              aria-label="Close profile zoom"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#ffffff',
                border: '1px solid rgba(139, 90, 43, 0.2)',
                color: '#8b5a2b',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
                transition: 'var(--transition-smooth)',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#8b5a2b';
                e.target.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#ffffff';
                e.target.style.color = '#8b5a2b';
              }}
            >
              ✕
            </button>

            {/* Circular Image Frame: Same style as original diagram */}
            <div 
              style={{
                width: '240px',
                height: '240px',
                borderRadius: '50%',
                border: '8px double #8b5a2b',
                background: '#ffffff',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15), inset 0 0 20px rgba(139, 90, 43, 0.1)',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              <img
                src={zoomedMember.image}
                alt={zoomedMember.name}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            </div>

            {/* Name & Role Text Block */}
            <div>
              <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.65rem',
                fontWeight: 800,
                color: '#2d1e12',
                margin: '0 0 8px 0',
                lineHeight: '1.2'
              }}>
                {zoomedMember.name || 'Position Open'}
              </h3>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#166534',
                letterSpacing: '0.1em',
                background: 'rgba(22, 101, 52, 0.08)',
                padding: '6px 14px',
                borderRadius: '20px',
                display: 'inline-block'
              }}>
                {zoomedMember.role}
              </span>
              {zoomedMember.bio && (
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.88rem',
                  color: '#7c5e43',
                  lineHeight: '1.5',
                  margin: '16px 0 0 0',
                  maxWidth: '320px'
                }}>
                  {zoomedMember.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
