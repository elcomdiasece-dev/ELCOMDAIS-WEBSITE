import React, { useState, useEffect } from 'react';
import { dbService } from '../lib/dbService';
import { LayoutDashboard, Calendar, Users, Image as ImageIcon, Download, Trash2, Plus, Edit3, CheckCircle, Info, Cpu, ExternalLink, Award } from 'lucide-react';

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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'events', 'registrations', 'gallery', 'committee'
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [committee, setCommittee] = useState(null);
  const [loading, setLoading] = useState(true);

  // Selected node path to edit (e.g. 'faculty.0', 'core.4')
  const [selectedNodePath, setSelectedNodePath] = useState('faculty.0');

  // Event editing state
  const [editingEvent, setEditingEvent] = useState(null); // null means list view, 'new' means create form, event object means editing
  const [eventForm, setEventForm] = useState({
    title: '',
    type: 'Workshop',
    startDate: '',
    endDate: '',
    venue: '',
    capacity: 50,
    coverImage: '',
    speaker: '',
    description: '',
    prerequisites: '',
    bannerPosition: 'center',
    faq: [],
    formFields: []
  });

  // Selected event for registration view
  const [selectedRegEventId, setSelectedRegEventId] = useState('');

  // Album creation/editing state
  const [editingAlbum, setEditingAlbum] = useState(null); // null = list view, 'new' = create form, object = edit form
  const [albumForm, setAlbumForm] = useState({ 
    title: '', 
    description: '', 
    date: new Date().toISOString().split('T')[0] 
  });
  const [albumSuccess, setAlbumSuccess] = useState(false);
  const [albumImages, setAlbumImages] = useState([]);

  // Registration editing state
  const [editingReg, setEditingReg] = useState(null);
  const [editingRegData, setEditingRegData] = useState({});

  // Status flags
  const [eventSuccess, setEventSuccess] = useState(false);
  const [commSuccess, setCommSuccess] = useState(false);

  // Migration states
  const [migrating, setMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState('');

  const checkHasLocalData = () => {
    try {
      const localEvts = JSON.parse(localStorage.getItem('elcomdais_events') || '[]');
      const localAlbs = JSON.parse(localStorage.getItem('elcomdais_albums') || '[]');
      const localRegs = JSON.parse(localStorage.getItem('elcomdais_registrations') || '[]');
      const localComm = JSON.parse(localStorage.getItem('elcomdais_committee') || 'null');
      return localEvts.length > 0 || localAlbs.length > 0 || localRegs.length > 0 || localComm !== null;
    } catch (e) {
      return false;
    }
  };

  const getLocalAdminsList = () => {
    try {
      const admins1 = JSON.parse(localStorage.getItem('elcomdais_admins') || '[]');
      const admins2 = JSON.parse(localStorage.getItem('elcomdias_admins') || '[]');
      const combined = [...admins1, ...admins2];
      const unique = [];
      const seen = new Set();
      for (const a of combined) {
        if (a && a.username && !seen.has(a.username.toLowerCase())) {
          seen.add(a.username.toLowerCase());
          unique.push(a);
        }
      }
      return unique;
    } catch (e) {
      return [];
    }
  };

  const handleMigrateLocalToSupabase = async () => {
    if (!window.confirm("This will copy all events, registrations, photo albums, and committee details from your browser's local storage to the Supabase database. Do you want to proceed?")) {
      return;
    }
    setMigrating(true);
    setMigrationStatus('Starting migration...');
    try {
      // 1. Migrate Committee
      const localComm = JSON.parse(localStorage.getItem('elcomdais_committee') || 'null');
      if (localComm) {
        setMigrationStatus('Migrating committee details...');
        await dbService.saveCommittee(localComm);
      }

      // 2. Migrate Events
      const localEvts = JSON.parse(localStorage.getItem('elcomdais_events') || '[]');
      if (localEvts.length > 0) {
        setMigrationStatus(`Migrating ${localEvts.length} events...`);
        for (const evt of localEvts) {
          if (evt.coverImage && evt.coverImage.startsWith('db:')) {
            const key = evt.coverImage.replace('db:', '');
            const rawBase64 = await new Promise((resolve) => {
              const request = indexedDB.open('elcomdais_blob_db', 2);
              request.onsuccess = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('committee_images')) {
                  resolve('');
                  return;
                }
                const transaction = db.transaction('committee_images', 'readonly');
                const store = transaction.objectStore('committee_images');
                const req = store.get(key);
                req.onsuccess = () => resolve(req.result || '');
                req.onerror = () => resolve('');
              };
              request.onerror = () => resolve('');
            });
            if (rawBase64) {
              evt.coverImage = rawBase64;
            }
          }
          await dbService.saveEvent(evt);
        }
      }

      // 3. Migrate Registrations
      const localRegs = JSON.parse(localStorage.getItem('elcomdais_registrations') || '[]');
      if (localRegs.length > 0) {
        setMigrationStatus(`Migrating ${localRegs.length} registrations...`);
        for (const reg of localRegs) {
          await dbService.registerForEvent(reg.eventId, JSON.parse(reg.data));
        }
      }

      // 4. Migrate Albums
      const localAlbs = JSON.parse(localStorage.getItem('elcomdais_albums') || '[]');
      if (localAlbs.length > 0) {
        setMigrationStatus(`Migrating ${localAlbs.length} photo albums...`);
        for (const alb of localAlbs) {
          const imgs = await new Promise((resolve) => {
            const request = indexedDB.open('elcomdais_blob_db', 2);
            request.onsuccess = (e) => {
              const db = e.target.result;
              if (!db.objectStoreNames.contains('gallery_images')) {
                resolve([]);
                return;
              }
              const transaction = db.transaction('gallery_images', 'readonly');
              const store = transaction.objectStore('gallery_images');
              const index = store.index('albumId');
              const req = index.getAll(alb.id);
              req.onsuccess = () => resolve(req.result || []);
              req.onerror = () => resolve([]);
            };
            request.onerror = () => resolve([]);
          });
          const imageUrls = imgs.map(i => i.url);
          await dbService.createAlbum(alb, imageUrls);
        }
      }

      setMigrationStatus('Migration complete!');
      alert('Local data successfully migrated to Supabase! Refreshing dashboard...');
      loadDashboardData();
    } catch (err) {
      console.error('Migration failed:', err);
      setMigrationStatus(`Migration failed: ${err.message}`);
    } finally {
      setMigrating(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);


  async function loadDashboardData() {
    setLoading(true);
    try {
      const evts = await dbService.getEvents();
      const regs = await dbService.getRegistrations();
      const albs = await dbService.getAlbums();
      const comm = await dbService.getCommittee();

      // Self-heal event formFields to contain Section A or B
      const healedEvts = await Promise.all(evts.map(async (evt) => {
        try {
          const fields = JSON.parse(evt.formFields || '[]');
          if (!fields.some(f => f.id === 'section')) {
            fields.push({ id: 'section', label: 'Section', type: 'select', required: true, options: ['A', 'B'] });
            evt.formFields = JSON.stringify(fields);
            await dbService.saveEvent(evt);
          }
        } catch (e) {
          console.warn('Error self-healing event fields:', e);
        }
        return evt;
      }));

      setEvents(healedEvts);
      setRegistrations(regs);
      setAlbums(albs);
      if (comm) {
        if (comm.core) {
          let updated = false;
          const sec = comm.core.find(c => c.id === 'secretary');
          if (sec && sec.members !== null) {
            sec.members = null;
            updated = true;
          }
          const jsec1 = comm.core.find(c => c.id === 'jsec1');
          if (jsec1 && jsec1.members !== null) {
            jsec1.members = null;
            updated = true;
          }
          const jsec2 = comm.core.find(c => c.id === 'jsec2');
          if (jsec2 && jsec2.members !== null) {
            jsec2.members = null;
            updated = true;
          }

          // Self-healing database size resizing helper
          const resizeMembers = (memberId, targetCount, defaultRole = 'Sub-team Member') => {
            const node = comm.core.find(c => c.id === memberId);
            if (!node) return;
            if (!node.members) node.members = [];
            if (node.members.length !== targetCount) {
              if (node.members.length < targetCount) {
                while (node.members.length < targetCount) {
                  node.members.push({ name: '', role: defaultRole, image: '' });
                }
              } else {
                node.members = node.members.slice(0, targetCount);
              }
              updated = true;
            }
          };

          resizeMembers('treasurer', 2);
          resizeMembers('tech', 5);
          resizeMembers('creative', 4);
          resizeMembers('event', 8);
          resizeMembers('social', 2);
          resizeMembers('magazine', 2);
          resizeMembers('hospitality', 4);

          // Manage 'executives' node
          let execNode = comm.core.find(c => c.id === 'executives');
          if (!execNode) {
            comm.core.push({
              id: 'executives',
              name: '',
              role: 'Executive Members Head',
              bio: '',
              image: '',
              members: Array.from({ length: 4 }, () => ({ name: '', role: 'Executive Member', image: '' }))
            });
            updated = true;
          } else {
            if (!execNode.members || execNode.members.length !== 4) {
              execNode.members = Array.from({ length: 4 }, (_, i) => (execNode.members?.[i] || { name: '', role: 'Executive Member', image: '' }));
              updated = true;
            }
          }

          if (updated) {
            await dbService.saveCommittee(comm);
          }
        }
        setCommittee(comm);
      } else {
        setCommittee(DEFAULT_TEAM);
      }

      if (evts.length > 0) {
        setSelectedRegEventId(evts[0].id);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  // --- EVENTS PANEL LOGIC ---
  const handleAddNewEvent = () => {
    setEventForm({
      title: '',
      type: 'Workshop',
      startDate: '',
      endDate: '',
      venue: '',
      capacity: 50,
      coverImage: '',
      speaker: '',
      description: '',
      prerequisites: '',
      bannerPosition: 'center',
      faq: [
        { q: 'Will certificates be provided?', a: 'Yes, all participants will receive a Certificate of Participation.' }
      ],
      formFields: [
        { id: 'name', label: 'Full Name', type: 'text', required: true },
        { id: 'email', label: 'Email Address', type: 'email', required: true },
        { id: 'phone', label: 'Phone Number', type: 'tel', required: true },
        { id: 'department', label: 'Department', type: 'select', required: true, options: ['ECE', 'CSE', 'EEE'] },
        { id: 'year', label: 'Year of Study', type: 'select', required: true, options: ['1st Year', '2nd Year', '3rd Year', '4th Year'] },
        { id: 'section', label: 'Section', type: 'select', required: true, options: ['A', 'B'] }
      ]
    });
    setEditingEvent('new');
  };

  const handleEditEvent = (evt) => {
    setEventForm({
      id: evt.id,
      title: evt.title,
      type: evt.type,
      startDate: evt.startDate ? evt.startDate.substring(0, 16) : '',
      endDate: evt.endDate ? evt.endDate.substring(0, 16) : '',
      venue: evt.venue || '',
      capacity: evt.capacity || 50,
      coverImage: evt.coverImage || '',
      speaker: evt.speaker || '',
      description: evt.description || '',
      prerequisites: evt.prerequisites || '',
      bannerPosition: evt.bannerPosition || 'center',
      faq: JSON.parse(evt.faq || '[]'),
      formFields: JSON.parse(evt.formFields || '[]')
    });
    setEditingEvent(evt);
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event? This will also remove all associated registrations.')) {
      await dbService.deleteEvent(id);
      loadDashboardData();
    }
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setEventSuccess(false);

    const payload = {
      ...eventForm,
      faq: JSON.stringify(eventForm.faq),
      formFields: JSON.stringify(eventForm.formFields),
      isPublished: true
    };

    if (editingEvent !== 'new') {
      payload.id = editingEvent.id;
    }

    await dbService.saveEvent(payload);
    setEventSuccess(true);
    setEditingEvent(null);
    loadDashboardData();

    setTimeout(() => setEventSuccess(false), 3000);
  };

  // --- FAQS & FIELDS DYNAMIC MANAGEMENT ---
  const addFaqField = () => {
    setEventForm(prev => ({
      ...prev,
      faq: [...prev.faq, { q: '', a: '' }]
    }));
  };

  const removeFaqField = (idx) => {
    const copy = [...eventForm.faq];
    copy.splice(idx, 1);
    setEventForm(prev => ({ ...prev, faq: copy }));
  };

  const handleFaqChange = (idx, key, val) => {
    const copy = [...eventForm.faq];
    copy[idx][key] = val;
    setEventForm(prev => ({ ...prev, faq: copy }));
  };

  // --- COMMITTEE FORM HANDLERS ---
  const getMemberByPath = (path) => {
    if (!committee) return null;
    const [level, idx] = path.split('.');
    const index = parseInt(idx);
    if (level === 'faculty') return committee.faculty[index];
    if (level === 'presidents') return committee.presidents[index];
    if (level === 'core') return committee.core[index];
    return null;
  };

  const handleMemberChange = (field, val) => {
    setCommittee(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const [level, idx] = selectedNodePath.split('.');
      const index = parseInt(idx);
      if (level === 'faculty') copy.faculty[index][field] = val;
      else if (level === 'presidents') copy.presidents[index][field] = val;
      else if (level === 'core') copy.core[index][field] = val;
      return copy;
    });
  };

  const handleSubMemberChange = (subIdx, field, val) => {
    setCommittee(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const [level, idx] = selectedNodePath.split('.');
      const index = parseInt(idx);
      if (level === 'core') {
        copy.core[index].members[subIdx][field] = val;
      }
      return copy;
    });
  };

  const handleFileChange = (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const MAX_HEIGHT = 500;
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with 100% maximum quality
        const compressedBase64 = canvas.toDataURL('image/jpeg', 1.0);
        callback(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handlePurgePhotos = async () => {
    if (window.confirm('Are you sure you want to clear all currently uploaded committee photos? This will reset them back to the default avatar icons, allowing you to upload high-quality 100% resolution photos.')) {
      const copy = JSON.parse(JSON.stringify(committee));
      copy.faculty.forEach(f => f.image = '');
      copy.presidents.forEach(p => p.image = '');
      copy.core.forEach(c => {
        c.image = '';
        if (c.members) {
          c.members.forEach(m => m.image = '');
        }
      });

      try {
        await dbService.saveCommittee(copy);
        setCommittee(copy);
        alert('All blurry images have been purged. You can now select new files to upload at 100% quality.');
      } catch (err) {
        console.error('Error purging photos:', err);
      }
    }
  };

  const handleSaveCommittee = async (e) => {
    e.preventDefault();
    setCommSuccess(false);
    try {
      await dbService.saveCommittee(committee);
      setCommSuccess(true);
      setTimeout(() => setCommSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving committee details:', err);
    }
  };

  // --- REGISTRATIONS LOGIC ---
  const getRegsForSelectedEvent = () => {
    return registrations.filter(r => r.eventId === selectedRegEventId);
  };

  const getEventTitleById = (id) => {
    return events.find(e => e.id === id)?.title || 'Event';
  };

  const handleExportCSV = () => {
    const eventRegs = getRegsForSelectedEvent();
    const eventTitle = getEventTitleById(selectedRegEventId);
    if (eventRegs.length === 0) return;

    // Build columns dynamically based on custom fields submitted
    const headers = ['Registration ID', 'Registered At'];
    const sample = JSON.parse(eventRegs[0].data || '{}');
    const customKeys = Object.keys(sample);
    const allHeaders = [...headers, ...customKeys];

    const csvLines = [allHeaders.join(',')];

    eventRegs.forEach(r => {
      const data = JSON.parse(r.data || '{}');
      const row = [
        r.id,
        new Date(r.registeredAt).toLocaleString(),
        ...customKeys.map(k => `"${(data[k] || '').toString().replace(/"/g, '""')}"`)
      ];
      csvLines.push(row.join(','));
    });

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${eventTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startEditRegistration = (reg) => {
    setEditingReg(reg);
    setEditingRegData(JSON.parse(reg.data || '{}'));
  };

  const handleDeleteRegistration = async (id) => {
    if (window.confirm('Are you sure you want to delete this registration?')) {
      await dbService.deleteRegistration(id);
      loadDashboardData();
    }
  };

  const handleSaveRegistration = async (e) => {
    e.preventDefault();
    if (!editingReg) return;

    await dbService.saveRegistration(editingReg.id, editingRegData);
    setEditingReg(null);
    loadDashboardData();
  };

  // --- GALLERY PANEL LOGIC ---
  const handleAlbumFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to 85% JPEG quality (~45KB each)
          const base64 = canvas.toDataURL('image/jpeg', 0.85);
          setAlbumImages(prev => [...prev, base64]);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAlbumImage = (idx) => {
    setAlbumImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddNewAlbum = () => {
    setAlbumForm({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setAlbumImages([]);
    setEditingAlbum('new');
  };

  const handleEditAlbum = async (album) => {
    setAlbumForm({
      title: album.title,
      description: album.description,
      date: album.createdAt ? album.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setEditingAlbum(album);
    
    try {
      const imgs = await dbService.getAlbumImages(album.id);
      setAlbumImages(imgs.map(i => i.url));
    } catch (err) {
      console.error('Error loading album images for editing:', err);
      setAlbumImages([]);
    }
  };

  const handleDeleteAlbum = async (id) => {
    if (window.confirm('Are you sure you want to delete this album? This will remove the folder and all its images.')) {
      await dbService.deleteAlbum(id);
      loadDashboardData();
    }
  };

  const handleSaveAlbum = async (e) => {
    e.preventDefault();
    if (albumImages.length === 0) {
      alert('Please upload at least one photo for this album.');
      return;
    }
    setAlbumSuccess(false);

    const albumData = {
      title: albumForm.title,
      description: albumForm.description,
      createdAt: new Date(albumForm.date).toISOString()
    };

    if (editingAlbum === 'new') {
      await dbService.createAlbum(albumData, albumImages);
    } else {
      await dbService.saveAlbum(editingAlbum.id, albumData, albumImages);
    }

    setAlbumSuccess(true);
    setAlbumForm({ title: '', description: '', date: new Date().toISOString().split('T')[0] });
    setAlbumImages([]);
    setEditingAlbum(null);
    loadDashboardData();

    setTimeout(() => setAlbumSuccess(false), 3000);
  };

  return (
    <section className="section" style={{ minHeight: '85vh' }}>
      <div className="container">

        {/* Title Dashboard Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/logo.jpg" alt="ELCOMDAIS Logo" style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'contain' }} />
              <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', margin: 0 }}>ELCOMDAIS Workspace</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              Manage calendar schedules, registrations, photo gallery folders, and committee members.
            </p>
          </div>

          {editingEvent === null && activeTab === 'events' && (
            <button onClick={handleAddNewEvent} className="btn btn-primary" style={{ gap: '6px' }}>
              <Plus size={16} /> Add New Event
            </button>
          )}
        </div>

        {/* Dashboard Layout Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '40px', alignItems: 'start' }} className="grid-2">

          {/* SIDEBAR TABS SELECTOR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => { setActiveTab('overview'); setEditingEvent(null); }}
              className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', gap: '10px', width: '100%' }}
            >
              <LayoutDashboard size={18} /> Overview
            </button>
            <button
              onClick={() => { setActiveTab('events'); setEditingEvent(null); }}
              className={`btn ${activeTab === 'events' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', gap: '10px', width: '100%' }}
            >
              <Calendar size={18} /> Manage Events
            </button>
            <button
              onClick={() => { setActiveTab('registrations'); setEditingEvent(null); }}
              className={`btn ${activeTab === 'registrations' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', gap: '10px', width: '100%' }}
            >
              <Users size={18} /> Registrations
            </button>
            <button
              onClick={() => { setActiveTab('gallery'); setEditingEvent(null); }}
              className={`btn ${activeTab === 'gallery' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', gap: '10px', width: '100%' }}
            >
              <ImageIcon size={18} /> Photo Albums
            </button>
            <button
              onClick={() => { setActiveTab('committee'); setEditingEvent(null); }}
              className={`btn ${activeTab === 'committee' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', gap: '10px', width: '100%' }}
            >
              <Award size={18} /> Manage Committee
            </button>
          </div>

          {/* MAIN WORKING AREA PANEL */}
          <div className="card" style={{ padding: '30px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                Syncing dashboard metrics...
              </div>
            ) : (

              /* TAB 1: OVERVIEW METRICS */
              activeTab === 'overview' && (
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '20px' }}>Analytics Summary</h3>

                  {/* Summary Counters */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }} className="grid-3">
                    <div style={{ background: 'rgba(0,0,0,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Events</span>
                      <span style={{ display: 'block', fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: '5px 0' }}>{events.length}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary-cyan)' }}>Published in calendar</span>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Event Registrations</span>
                      <span style={{ display: 'block', fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: '5px 0' }}>{registrations.length}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary-cyan)' }}>Active participants</span>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Photo Folders</span>
                      <span style={{ display: 'block', fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: '5px 0' }}>{albums.length}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary-cyan)' }}>Albums in gallery</span>
                    </div>
                  </div>

                  {/* Migration Sync tool */}
                  {checkHasLocalData() && import.meta.env.VITE_SUPABASE_URL && (
                    <div className="card" style={{ backgroundColor: 'rgba(16, 185, 129, 0.03)', borderColor: '#10b981', marginBottom: '30px', padding: '20px' }}>
                      <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Cpu size={18} color="#10b981" /> Sync Local Sandbox Data to Supabase
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '15px' }}>
                        We detected sandbox data stored in this browser's local cache. Since you've successfully connected your Supabase cloud database, you can push all local events, registrations, photo albums, and committee details to your cloud tables.
                      </p>
                      <button 
                        onClick={handleMigrateLocalToSupabase} 
                        disabled={migrating}
                        className="btn btn-primary" 
                        style={{ backgroundColor: '#10b981', borderColor: '#10b981', color: '#fff', fontSize: '0.85rem', padding: '8px 16px', borderRadius: '6px' }}
                      >
                        {migrating ? migrationStatus : 'Migrate Local Data to Cloud'}
                      </button>
                    </div>
                  )}

                  {/* Local Browser Admin Accounts list */}
                  <div className="card" style={{ marginBottom: '30px', padding: '20px', backgroundColor: 'rgba(0,0,0,0.01)' }}>
                    <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={18} color="var(--primary-cyan)" /> Local Browser Admin Accounts ({getLocalAdminsList().length})
                    </h4>
                    {getLocalAdminsList().length > 0 ? (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                              <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Name</th>
                              <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Username / Email</th>
                              <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Password</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getLocalAdminsList().map((adm, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '8px 12px', fontWeight: 600 }}>{adm.name || 'Admin'}</td>
                                <td style={{ padding: '8px 12px', color: 'var(--primary-cyan)' }}>{adm.username}</td>
                                <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>{adm.password || '••••••••'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No local admin accounts found in browser storage.</p>
                    )}
                  </div>

                  {/* System Guidelines Info */}
                  <div className="card" style={{ backgroundColor: 'rgba(2, 132, 199, 0.02)', borderLeft: '4px solid var(--primary-cyan)' }}>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <Info size={20} color="var(--primary-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: '5px' }}>Workspace Instructions</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                          This control panel links to a client service layer containing local mockup databases. Changes are recorded instantly inside your browser's local sandbox space, ensuring complete layout operation before hosting server databases.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* TAB 2: EVENTS MANAGER PANEL */}
            {!loading && activeTab === 'events' && (
              <div>
                {/* LIST OF EVENTS VIEW */}
                {editingEvent === null ? (
                  <div>
                    {eventSuccess && (
                      <div className="card" style={{ borderColor: '#10b981', background: 'rgba(16,185,129,0.05)', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', marginBottom: '20px' }}>
                        <CheckCircle size={18} color="#10b981" />
                        <span style={{ fontSize: '0.9rem', color: '#10b981' }}>Event saved successfully.</span>
                      </div>
                    )}

                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '20px' }}>Scheduled Events List</h3>

                    {events.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {events.map(evt => (
                          <div
                            key={evt.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '16px 20px',
                              borderRadius: '8px',
                              border: '1px solid var(--border-color)',
                              background: 'rgba(0,0,0,0.01)',
                              flexWrap: 'wrap',
                              gap: '15px'
                            }}
                          >
                            <div>
                              <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', margin: 0 }}>{evt.title}</h4>
                              <div style={{ display: 'flex', gap: '10px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                <span>Type: {evt.type}</span>
                                <span>•</span>
                                <span>Date: {new Date(evt.startDate).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>Capacity: {evt.capacity} seats</span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                              <a href={`/events/${evt.slug}`} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px' }}>
                                <ExternalLink size={14} /> Preview
                              </a>
                              <button onClick={() => handleEditEvent(evt)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px' }}>
                                <Edit3 size={14} /> Edit
                              </button>
                              <button onClick={() => handleDeleteEvent(evt.id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px' }}>
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-muted)' }}>No events created. Click "Add New Event" to seed the calendar.</p>
                    )}
                  </div>
                ) : (

                  /* CREATE & EDIT FORM VIEW */
                  <form onSubmit={handleSaveEvent}>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '20px' }}>
                      {editingEvent === 'new' ? 'Create New Event' : `Edit: ${editingEvent.title}`}
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }} className="grid-2">
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Event Title *</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          value={eventForm.title || ''}
                          onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g. Intro to Digital Signal Processing"
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Event Type *</label>
                        <select
                          className="form-input"
                          value={eventForm.type || 'Workshop'}
                          onChange={(e) => setEventForm(prev => ({ ...prev, type: e.target.value }))}
                        >
                          <option value="Workshop">Workshop</option>
                          <option value="Guest Lecture">Guest Lecture</option>
                          <option value="Competition">Competition</option>
                          <option value="Symposium">Symposium</option>
                          <option value="Inauguration">Inauguration</option>
                          <option value="Valediction">Valediction</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }} className="grid-2">
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Start Date & Time *</label>
                        <input
                          type="datetime-local"
                          required
                          className="form-input"
                          value={eventForm.startDate || ''}
                          onChange={(e) => setEventForm(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">End Date & Time *</label>
                        <input
                          type="datetime-local"
                          required
                          className="form-input"
                          value={eventForm.endDate || ''}
                          onChange={(e) => setEventForm(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.5fr', gap: '20px', marginBottom: '20px' }} className="grid-2">
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Venue / Hall *</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          value={eventForm.venue || ''}
                          onChange={(e) => setEventForm(prev => ({ ...prev, venue: e.target.value }))}
                          placeholder="e.g. DSP Lab, 2nd Floor"
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Max Seating Capacity *</label>
                        <input
                          type="number"
                          required
                          min={5}
                          className="form-input"
                          value={eventForm.capacity || 50}
                          onChange={(e) => setEventForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 50 }))}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Speaker / Facilitator</label>
                      <input
                        type="text"
                        className="form-input"
                        value={eventForm.speaker || ''}
                        onChange={(e) => setEventForm(prev => ({ ...prev, speaker: e.target.value }))}
                        placeholder="e.g. Dr. Jane Doe"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }} className="grid-2">
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Event Banner / Cover Image (Upload)</label>
                        <input
                          type="file"
                          accept="image/*"
                          className="form-input"
                          onChange={(e) => handleFileChange(e, (base64) => setEventForm(prev => ({ ...prev, coverImage: base64 })))}
                        />
                      </div>
                      
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Banner Alignment</label>
                        <select
                          className="form-input"
                          value={eventForm.bannerPosition || 'center'}
                          onChange={(e) => setEventForm(prev => ({ ...prev, bannerPosition: e.target.value }))}
                        >
                          <option value="center">Center (Default)</option>
                          <option value="center 15%">Upper (Headshots)</option>
                          <option value="center top">Top</option>
                          <option value="center 40%">Mid-Upper</option>
                          <option value="center 60%">Mid-Lower</option>
                          <option value="center bottom">Bottom</option>
                        </select>
                      </div>
                    </div>
                    {eventForm.coverImage && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', marginBottom: '20px' }}>
                        <img src={eventForm.coverImage} alt="Event cover preview" style={{ width: '80px', height: '45px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Banner image loaded</span>
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">Bio / Detailed Description</label>
                      <textarea
                        className="form-input"
                        rows={4}
                        value={eventForm.description || ''}
                        onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="e.g. Join us for an intensive workshop covering digital circuit design and signal routing."
                        style={{ minHeight: '80px', resize: 'vertical' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Prerequisites</label>
                      <textarea
                        className="form-input"
                        rows={3}
                        value={eventForm.prerequisites || ''}
                        onChange={(e) => setEventForm(prev => ({ ...prev, prerequisites: e.target.value }))}
                        placeholder="e.g. Basic understanding of semiconductor physics, laptop with LTSpice installed."
                        style={{ minHeight: '60px', resize: 'vertical' }}
                      />
                    </div>

                    {/* DYNAMIC FAQS EDITING */}
                    <div style={{ marginBottom: '25px', paddingTop: '15px', borderTop: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h4 style={{ color: 'var(--text-main)', fontSize: '1rem' }}>Frequently Asked Questions</h4>
                        <button type="button" onClick={addFaqField} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', gap: '4px' }}>
                          <Plus size={12} /> Add FAQ
                        </button>
                      </div>

                      {eventForm.faq.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
                          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <input
                              type="text"
                              placeholder="Question"
                              className="form-input"
                              value={item.q}
                              onChange={(e) => handleFaqChange(idx, 'q', e.target.value)}
                            />
                            <input
                              type="text"
                              placeholder="Answer"
                              className="form-input"
                              value={item.a}
                              onChange={(e) => handleFaqChange(idx, 'a', e.target.value)}
                            />
                          </div>
                          <button type="button" onClick={() => removeFaqField(idx)} className="btn btn-danger" style={{ padding: '10px', minWidth: '40px' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* ACTIONS */}
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                      <button type="button" onClick={() => setEditingEvent(null)} className="btn btn-secondary">
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Save & Publish
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB 3: REGISTRATIONS MANAGEMENT PANEL */}
            {!loading && activeTab === 'registrations' && (
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '20px' }}>Registrations Tracker</h3>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', marginBottom: '25px', justifyContent: 'space-between' }}>

                  {/* Select Event dropdown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Select Event:</span>
                    <select
                      className="form-input"
                      style={{ width: '280px', padding: '0.5rem' }}
                      value={selectedRegEventId}
                      onChange={(e) => setSelectedRegEventId(e.target.value)}
                    >
                      {events.map(e => (
                        <option key={e.id} value={e.id}>{e.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* CSV Export Trigger */}
                  {getRegsForSelectedEvent().length > 0 && (
                    <button onClick={handleExportCSV} className="btn btn-secondary" style={{ gap: '6px' }}>
                      <Download size={16} /> Export CSV
                    </button>
                  )}
                </div>

                {/* Table of registries */}
                {selectedRegEventId ? (
                  getRegsForSelectedEvent().length > 0 ? (
                    <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '12px 16px', color: 'var(--text-main)' }}>Registration ID</th>
                            <th style={{ padding: '12px 16px', color: 'var(--text-main)' }}>Date Registered</th>
                            <th style={{ padding: '12px 16px', color: 'var(--text-main)' }}>Details / Credentials</th>
                            <th style={{ padding: '12px 16px', color: 'var(--text-main)' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getRegsForSelectedEvent().map(reg => {
                            const parsed = JSON.parse(reg.data || '{}');
                            return (
                              <tr key={reg.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--primary-cyan)' }}>{reg.id}</td>
                                <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                                  {new Date(reg.registeredAt).toLocaleString()}
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                    {Object.entries(parsed).map(([key, val]) => (
                                      <span key={key}>
                                        <strong style={{ color: 'var(--text-main)', textTransform: 'capitalize' }}>{key}: </strong>
                                        {val}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => startEditRegistration(reg)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem', minWidth: 'unset' }}>
                                      Edit
                                    </button>
                                    <button onClick={() => handleDeleteRegistration(reg.id)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.72rem', minWidth: 'unset' }}>
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                      No registrations recorded for this event yet.
                    </div>
                  )
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>Please select an event to track registrations.</p>
                )}

                {/* Modal for editing registration */}
                {editingReg && (
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                  }}>
                    <div className="card" style={{ width: '420px', maxWidth: '90%', padding: '25px', background: '#fff', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
                      <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '20px', marginTop: 0, fontWeight: 700 }}>Edit Registration Details</h3>
                      
                      <form onSubmit={handleSaveRegistration}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                          {Object.keys(editingRegData).map(key => (
                            <div key={key} className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ textTransform: 'capitalize', fontSize: '0.75rem', fontWeight: 600 }}>{key}</label>
                              <input
                                type="text"
                                required
                                className="form-input"
                                value={editingRegData[key] || ''}
                                onChange={(e) => setEditingRegData(prev => ({ ...prev, [key]: e.target.value }))}
                              />
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                          <button type="button" onClick={() => setEditingReg(null)} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                            Cancel
                          </button>
                          <button type="submit" className="btn btn-primary" style={{ fontSize: '0.8rem' }}>
                            Save Changes
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: GALLERY MANAGEMENT PANEL */}
            {!loading && activeTab === 'gallery' && (
              <div>
                {albumSuccess && (
                  <div className="card" style={{ borderColor: '#10b981', background: 'rgba(16,185,129,0.05)', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', marginBottom: '20px' }}>
                    <CheckCircle size={18} color="#10b981" />
                    <span style={{ fontSize: '0.9rem', color: '#10b981' }}>Album synchronized successfully.</span>
                  </div>
                )}

                {editingAlbum === null ? (
                  /* ALBUM LIST MODE */
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                      <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>Photo Albums ({albums.length})</h3>
                      <button type="button" onClick={handleAddNewAlbum} className="btn btn-primary" style={{ gap: '6px' }}>
                        <Plus size={16} /> Add New Album
                      </button>
                    </div>

                    {albums.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' }}>
                        {albums.map(alb => (
                          <div key={alb.id} className="card" style={{ padding: '15px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <img src={alb.coverImage} alt={alb.title} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border-color)' }} />
                            <div style={{ flexGrow: 1, minWidth: 0 }}>
                              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={alb.title}>
                                {alb.title}
                              </h4>
                              <span style={{ fontSize: '0.72rem', color: 'var(--primary-cyan)', fontWeight: 600 }}>
                                {new Date(alb.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                              </span>
                              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                                {alb.description}
                              </p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                              <button type="button" onClick={() => handleEditAlbum(alb)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.72rem', width: '100%', justifyContent: 'center' }}>
                                Edit
                              </button>
                              <button type="button" onClick={() => handleDeleteAlbum(alb.id)} className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '0.72rem', width: '100%', justifyContent: 'center' }}>
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)' }}>
                        No photo albums created yet. Click "Add New Album" to start!
                      </div>
                    )}
                  </div>
                ) : (
                  /* ALBUM FORM MODE (CREATE / UPDATE) */
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                      <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>
                        {editingAlbum === 'new' ? 'Create New Album Folder' : 'Update Gallery Album'}
                      </h3>
                      <button type="button" onClick={() => setEditingAlbum(null)} className="btn btn-secondary">
                        Back to List
                      </button>
                    </div>

                    <form onSubmit={handleSaveAlbum}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }} className="grid-2">
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Album Title *</label>
                          <input
                            type="text"
                            required
                            className="form-input"
                            value={albumForm.title}
                            onChange={(e) => setAlbumForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g. Electro-Hack 2026 Glimpses"
                          />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Album Date *</label>
                          <input
                            type="date"
                            required
                            className="form-input"
                            value={albumForm.date}
                            onChange={(e) => setAlbumForm(prev => ({ ...prev, date: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Brief Description *</label>
                        <textarea
                          required
                          className="form-input"
                          rows={3}
                          value={albumForm.description}
                          onChange={(e) => setAlbumForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Glimpses of students hacking hardware prototypes in ECE block."
                          style={{ minHeight: '60px', resize: 'vertical' }}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Upload Album Photos * (Select one or more files)</label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="form-input"
                          onChange={handleAlbumFilesChange}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                          Choose image files from your computer. The first uploaded photo will automatically serve as the folder cover.
                        </span>
                      </div>

                      {albumImages.length > 0 && (
                        <div style={{ marginBottom: '25px' }}>
                          <label className="form-label" style={{ fontWeight: 600 }}>Selected Photos ({albumImages.length})</label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px', marginTop: '10px' }}>
                            {albumImages.map((imgSrc, idx) => (
                              <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <img src={imgSrc} alt={`Album Upload ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button
                                  type="button"
                                  onClick={() => removeAlbumImage(idx)}
                                  style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(239, 68, 68, 0.9)',
                                    color: '#fff',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    lineHeight: 1
                                  }}
                                  title="Remove photo"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <button type="submit" className="btn btn-primary" style={{ minWidth: '180px' }}>
                        {editingAlbum === 'new' ? 'Create Album Folder' : 'Save & Update Album'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: COMMITTEE MANAGEMENT PANEL */}
            {!loading && activeTab === 'committee' && committee && (
              <div>
                {commSuccess && (
                  <div className="card" style={{ borderColor: '#10b981', background: 'rgba(16,185,129,0.05)', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', marginBottom: '20px' }}>
                    <CheckCircle size={18} color="#10b981" />
                    <span style={{ fontSize: '0.9rem', color: '#10b981' }}>Committee details saved and synced.</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>Manage Committee Members & Sub-Teams</h3>
                  <button type="button" onClick={handlePurgePhotos} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px', borderColor: '#ef4444', color: '#ef4444', background: 'transparent' }}>
                    Purge Blurry Images Cache
                  </button>
                </div>

                <form onSubmit={handleSaveCommittee}>

                  {/* Select Role to Edit */}
                  <div className="form-group" style={{ marginBottom: '25px' }}>
                    <label className="form-label">Select Committee Node/Position to Edit:</label>
                    <select
                      className="form-input"
                      value={selectedNodePath}
                      onChange={(e) => setSelectedNodePath(e.target.value)}
                    >
                      <optgroup label="Faculty Coordinators">
                        <option value="faculty.0">Faculty Coordinator 1</option>
                        <option value="faculty.1">Faculty Coordinator 2</option>
                      </optgroup>
                      <optgroup label="Student Leadership">
                        <option value="presidents.0">Student President</option>
                        <option value="presidents.1">Vice-President</option>
                      </optgroup>
                      <optgroup label="Department Chairs">
                        {committee.core.map((member, cIdx) => (
                          <option key={member.id} value={`core.${cIdx}`}>{member.role}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Node Editor Form fields */}
                  {(() => {
                    const member = getMemberByPath(selectedNodePath);
                    if (!member) return null;
                    return (
                      <div className="card" style={{ padding: '20px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', marginBottom: '25px' }}>
                        <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Editing: {member.role}
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }} className="grid-2">
                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Full Name</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="e.g. Dr. Jane Smith"
                              value={member.name || ''}
                              onChange={(e) => handleMemberChange('name', e.target.value)}
                            />
                          </div>

                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Member Photo (Upload File)</label>
                            <input
                              type="file"
                              accept="image/*"
                              className="form-input"
                              onChange={(e) => handleFileChange(e, (base64) => handleMemberChange('image', base64))}
                            />
                            {member.image && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                                <img src={member.image} alt="Preview" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Image loaded (Base64)</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bio field */}
                        {('bio' in member) && (
                          <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Bio / Coordinator Description</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="e.g. Specializes in embedded firmware programming."
                              value={member.bio || ''}
                              onChange={(e) => handleMemberChange('bio', e.target.value)}
                            />
                          </div>
                        )}

                        {/* Sub-team members form sections */}
                        {member.members && member.members.length > 0 && (
                          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '20px' }}>
                            <h5 style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '15px' }}>
                              Sub-team Coordinators / Members ({member.members.length})
                            </h5>

                            {member.members.map((sub, sIdx) => (
                              <div key={sIdx} style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1.2fr',
                                gap: '15px',
                                marginBottom: '15px',
                                paddingBottom: '15px',
                                borderBottom: sIdx !== member.members.length - 1 ? '1px dashed var(--border-color)' : 'none'
                              }} className="grid-3">
                                <div className="form-group" style={{ margin: 0 }}>
                                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Member Name</label>
                                  <input
                                    type="text"
                                    className="form-input"
                                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                                    placeholder="Member Name"
                                    value={sub.name || ''}
                                    onChange={(e) => handleSubMemberChange(sIdx, 'name', e.target.value)}
                                  />
                                </div>

                                <div className="form-group" style={{ margin: 0 }}>
                                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Role / Designation</label>
                                  <input
                                    type="text"
                                    className="form-input"
                                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                                    placeholder="Designation"
                                    value={sub.role || ''}
                                    onChange={(e) => handleSubMemberChange(sIdx, 'role', e.target.value)}
                                  />
                                </div>

                                <div className="form-group" style={{ margin: 0 }}>
                                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Member Photo (Upload)</label>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="form-input"
                                    style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                                    onChange={(e) => handleFileChange(e, (base64) => handleSubMemberChange(sIdx, 'image', base64))}
                                  />
                                  {sub.image && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                      <img src={sub.image} alt="Sub preview" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Loaded</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <button type="submit" className="btn btn-primary" style={{ minWidth: '180px' }}>
                    Save Committee Details
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>
      </div>
    </section>
  );
}
