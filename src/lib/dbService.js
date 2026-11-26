import { supabase } from './supabaseClient';

// --- INDEXEDDB STORAGE FOR LARGE ASSETS (COMMITTEE & GALLERY IMAGES) ---
const initIndexedDB = () => {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open('elcomdais_blob_db', 2);
      request.onblocked = () => {
        console.warn('IndexedDB upgrade blocked. Resolving with null.');
        resolve(null);
      };
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('committee_images')) {
          db.createObjectStore('committee_images');
        }
        if (!db.objectStoreNames.contains('gallery_images')) {
          const store = db.createObjectStore('gallery_images', { keyPath: 'id' });
          store.createIndex('albumId', 'albumId', { unique: false });
        }
      };
      request.onsuccess = (e) => {
        resolve(e.target.result);
      };
      request.onerror = (e) => {
        console.warn('IndexedDB open error. Resolving with null:', e.target.error);
        resolve(null);
      };
    } catch (err) {
      console.warn('IndexedDB not supported or blocked. Resolving with null:', err);
      resolve(null);
    }
  });
};

const getDBImage = async (key) => {
  try {
    const db = await initIndexedDB();
    if (!db) return '';
    return new Promise((resolve) => {
      try {
        const transaction = db.transaction('committee_images', 'readonly');
        const store = transaction.objectStore('committee_images');
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || '');
        req.onerror = () => resolve('');
      } catch (err) {
        resolve('');
      }
    });
  } catch (e) {
    console.error('IndexedDB get failed:', e);
    return '';
  }
};

const saveDBImage = async (key, base64) => {
  try {
    const db = await initIndexedDB();
    if (!db) return;
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction('committee_images', 'readwrite');
        const store = transaction.objectStore('committee_images');
        const req = store.put(base64, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  } catch (e) {
    console.error('IndexedDB save failed:', e);
  }
};

// Helper to seed localStorage with default data for 2026-2027
const SEED_EVENTS = [
  {
    id: 'evt-seed-1',
    title: "Class-J Power Amplifier Design for 5G Smart Grid's Wireless Communication Applications",
    slug: 'class-j-power-amplifier-design-for-5g-smart-grid',
    type: 'Workshop',
    startDate: '2026-08-25T10:00:00.000Z',
    endDate: '2026-08-25T16:00:00.000Z',
    venue: 'ECE Seminar Hall & Microwave Lab',
    capacity: 60,
    description: "An intensive hands-on workshop covering modern Class-J Power Amplifier design principles, RF simulation tools, and real-world deployment in 5G smart grid wireless communication networks.",
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    isPublished: true,
    createdAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'evt-seed-2',
    title: 'VLSI Design & System-on-Chip (SoC) Architectures',
    slug: 'vlsi-design-and-system-on-chip-architectures',
    type: 'Guest Lecture',
    startDate: '2026-09-12T11:00:00.000Z',
    endDate: '2026-09-12T13:00:00.000Z',
    venue: 'Auditorium Hall B',
    capacity: 120,
    description: 'Expert guest lecture exploring cutting-edge VLSI semiconductor design flows, hardware description languages, and SoC fabrication technology.',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    isPublished: true,
    createdAt: '2026-08-02T00:00:00.000Z'
  },
  {
    id: 'evt-seed-3',
    title: 'ELCOMDAIS 2026 National Level Technical Symposium',
    slug: 'elcomdais-2026-national-level-technical-symposium',
    type: 'Symposium',
    startDate: '2026-10-15T09:00:00.000Z',
    endDate: '2026-10-16T17:00:00.000Z',
    venue: 'Main Campus Auditorium & Labs',
    capacity: 300,
    description: 'Annual flagship national level technical symposium featuring Paper Presentation, Circuit Debugging, Hardware Hackathon, and Technical Quiz competitions.',
    coverImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
    isPublished: true,
    createdAt: '2026-08-03T00:00:00.000Z'
  }
];
const SEED_ALBUMS = [
  {
    id: 'alb-seed-1',
    title: 'ELCOMDAIS Inauguration 2026',
    description: 'Glimpses of the department association inauguration ceremony, keynotes, and student project displays.',
    coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-08-01T10:00:00.000Z'
  },
  {
    id: 'alb-seed-2',
    title: 'National Level Technical Symposium',
    description: 'Capturing moments from Paper Presentation, Circuit Debugging, and Hardware Hackathon events.',
    coverImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-08-03T11:00:00.000Z'
  }
];
const SEED_IMAGES = [
  {
    id: 'img-seed-1-1',
    albumId: 'alb-seed-1',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80',
    caption: 'Inaugural address by the department head'
  },
  {
    id: 'img-seed-1-2',
    albumId: 'alb-seed-1',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
    caption: 'Student audience during keynote session'
  },
  {
    id: 'img-seed-2-1',
    albumId: 'alb-seed-2',
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80',
    caption: 'Symposium presentation showcase'
  },
  {
    id: 'img-seed-2-2',
    albumId: 'alb-seed-2',
    url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80',
    caption: 'Students debugging embedded boards'
  }
];
const SEED_REGISTRATIONS = [];

// Helper to initialize database in localStorage
const initLocalDb = () => {
  // Migrate old elcomdias_ (ia) keys to new elcomdais_ (ai) keys if found
  const migrateKey = (oldKey, newKey) => {
    try {
      const oldData = localStorage.getItem(oldKey);
      if (oldData) {
        localStorage.setItem(newKey, oldData);
        localStorage.removeItem(oldKey); // Free up quota space immediately!
      }
    } catch (e) {
      console.warn(`Failed to migrate key ${oldKey} due to error:`, e);
    }
  };

  migrateKey('elcomdias_events', 'elcomdais_events');
  migrateKey('elcomdias_albums', 'elcomdais_albums');
  migrateKey('elcomdias_images', 'elcomdais_images');
  migrateKey('elcomdias_registrations', 'elcomdais_registrations');
  migrateKey('elcomdias_committee', 'elcomdais_committee');

  const cleanDb = (key, seedPattern) => {
    const existing = localStorage.getItem(key);
    if (!existing) {
      localStorage.setItem(key, JSON.stringify([]));
    } else {
      try {
        const parsed = JSON.parse(existing);
        const filtered = parsed.filter(item => {
          const itemId = item.id || '';
          return !itemId.match(seedPattern);
        });
        localStorage.setItem(key, JSON.stringify(filtered));
      } catch (e) {
        localStorage.setItem(key, JSON.stringify([]));
      }
    }
  };

  cleanDb('elcomdais_events', /^evt-[1-4]$/);
  cleanDb('elcomdais_albums', /^alb-[1-2]$/);
  cleanDb('elcomdais_images', /^img-[1-4]$/);
  cleanDb('elcomdais_registrations', /^reg-[1-4]$/);
};

initLocalDb();
// Purge plaintext admin credentials left in browsers by earlier versions.
['elcomdais_admins', 'elcomdias_admins'].forEach(k => localStorage.removeItem(k));

// --- GLOBAL MEMORY CACHE ---
const memCache = {
  events: null,
  committee: null,
  albums: null,
  registrations: null,
  albumImages: {} // keyed by albumId
};

// Helper to restore legacy/IndexedDB images
const restoreNode = async (node, id) => {
  if (node.image && node.image.startsWith('db:')) {
    const key = node.image.replace('db:', '');
    const dbImg = await getDBImage(key);
    node.image = dbImg || '';
  }
  if (node.members) {
    for (let i = 0; i < node.members.length; i++) {
      const sub = node.members[i];
      if (sub.image && sub.image.startsWith('db:')) {
        const key = sub.image.replace('db:', '');
        const dbImg = await getDBImage(key);
        sub.image = dbImg || '';
      }
    }
  }
};

export const dbService = {
  // --- EVENTS ---
  async getEvents() {
    if (memCache.events) {
      return memCache.events;
    }

    let remoteEvents = null;
    if (supabase) {
      try {
        const { data: settingsData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'events')
          .maybeSingle();

        if (settingsData && settingsData.value) {
          try {
            remoteEvents = JSON.parse(settingsData.value);
          } catch (err) {}
        }

        if (!remoteEvents || remoteEvents.length === 0) {
          const { data, error } = await supabase.from('events').select('*');
          if (!error && data && data.length > 0) {
            remoteEvents = data;
          }
        }
      } catch (e) {
        console.warn('Supabase getEvents failed, using local DB fallback', e);
      }
    }

    const localEvents = JSON.parse(localStorage.getItem('elcomdais_events') || '[]');
    let rawEvents = [];

    if (remoteEvents && remoteEvents.length > 0) {
      rawEvents = [...remoteEvents];
      try {
        localStorage.setItem('elcomdais_events', JSON.stringify(remoteEvents));
      } catch (e) {}
    } else {
      rawEvents = localEvents.length > 0 ? localEvents : [...SEED_EVENTS];
    }

    for (let i = 0; i < rawEvents.length; i++) {
      const evt = rawEvents[i];
      if (!evt.type) evt.type = 'Workshop';
      if (evt.isPublished === undefined || evt.isPublished === null) evt.isPublished = true;
      if (evt.coverImage && evt.coverImage.startsWith('db:')) {
        const key = evt.coverImage.replace('db:', '');
        const dbImg = await getDBImage(key);
        if (dbImg) evt.coverImage = dbImg;
      }

      // Automatically use high-resolution bundled poster for Paper / Poster Presentation
      if (evt.title && (evt.title.toLowerCase().includes('paper presentation') || evt.title.toLowerCase().includes('poster presentation'))) {
        if (!evt.coverImage || evt.coverImage.length < 50000) {
          evt.coverImage = '/paper-presentation-poster.jpg';
        }
      }

      // Universal Form Fields Sanitization for all events: remove EEE, ensure Section A, B, C
      if (evt.formFields) {
        try {
          let fields = typeof evt.formFields === 'string' ? JSON.parse(evt.formFields) : evt.formFields;
          if (Array.isArray(fields)) {
            fields = fields.map(f => {
              if (f.id === 'department') return { ...f, options: ['ECE', 'CSE'] };
              if (f.id === 'section') return { ...f, options: ['A', 'B', 'C'] };
              return f;
            });
            if (!fields.some(f => f.id === 'section')) {
              fields.push({ id: 'section', label: 'Section', type: 'select', required: true, options: ['A', 'B', 'C'] });
            }
            evt.formFields = JSON.stringify(fields);
          }
        } catch (e) {}
      } else {
        evt.formFields = JSON.stringify([
          { id: 'name', label: 'Full Name', type: 'text', required: true },
          { id: 'email', label: 'Email Address', type: 'email', required: true },
          { id: 'phone', label: 'Phone Number', type: 'tel', required: true },
          { id: 'department', label: 'Department', type: 'select', required: true, options: ['ECE', 'CSE'] },
          { id: 'year', label: 'Year of Study', type: 'select', required: true, options: ['1st Year', '2nd Year', '3rd Year', '4th Year'] },
          { id: 'section', label: 'Section', type: 'select', required: true, options: ['A', 'B', 'C'] }
        ]);
      }
    }

    memCache.events = rawEvents;
    return rawEvents;
  },

  async getEventBySlug(slug) {
    let evt = null;
    const events = await this.getEvents();
    if (events && events.length > 0) {
      evt = events.find(e => e.slug === slug) || null;
    }
    return evt;
  },

  async saveEvent(eventData) {
    memCache.events = null;
    const slug = eventData.slug || eventData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const cleanEvent = {
      ...eventData,
      slug,
      updatedAt: new Date().toISOString()
    };

    if (!cleanEvent.id) {
      cleanEvent.id = `evt-${Date.now()}`;
      cleanEvent.createdAt = new Date().toISOString();
    }

    // Ensure formFields in saved events do not contain EEE and include Section A, B, C
    if (cleanEvent.formFields) {
      try {
        let fields = typeof cleanEvent.formFields === 'string' ? JSON.parse(cleanEvent.formFields) : cleanEvent.formFields;
        if (Array.isArray(fields)) {
          fields = fields.map(f => {
            if (f.id === 'department') return { ...f, options: ['ECE', 'CSE'] };
            if (f.id === 'section') return { ...f, options: ['A', 'B', 'C'] };
            return f;
          });
          if (!fields.some(f => f.id === 'section')) {
            fields.push({ id: 'section', label: 'Section', type: 'select', required: true, options: ['A', 'B', 'C'] });
          }
          cleanEvent.formFields = JSON.stringify(fields);
        }
      } catch (e) {}
    }

    // Preserve the original base64 image BEFORE swapping to db: pointer,
    // so we can sync the real image data to Supabase for cross-browser visibility.
    const originalCoverImage = cleanEvent.coverImage || '';

    // Save raw base64 cover images into IndexedDB and keep lightweight pointer keys for localStorage
    if (cleanEvent.coverImage && cleanEvent.coverImage.startsWith('data:')) {
      const imageKey = `event_image_${cleanEvent.id}`;
      await saveDBImage(imageKey, cleanEvent.coverImage);
      cleanEvent.coverImage = `db:${imageKey}`;
    }

    const events = JSON.parse(localStorage.getItem('elcomdais_events') || '[]');
    const matchIdx = events.findIndex(e => e.id === cleanEvent.id);
    if (matchIdx !== -1) {
      events[matchIdx] = cleanEvent;
    } else {
      events.push(cleanEvent);
    }
    try {
      localStorage.setItem('elcomdais_events', JSON.stringify(events));
    } catch (e) {
      console.warn('localStorage saveEvent note:', e);
    }

    // 2. Sync portable event with real coverImage data to Supabase so ALL browsers/devices can display it
    if (supabase) {
      try {
        // Build a portable copy of the events list where db: pointers are replaced with real base64
        // for the event that was just saved, so Supabase stores the actual image.
        const fullEventsList = JSON.parse(localStorage.getItem('elcomdais_events') || '[]');
        const portableList = fullEventsList.map(e => {
          if (e.id === cleanEvent.id && originalCoverImage && originalCoverImage.startsWith('data:')) {
            return { ...e, coverImage: originalCoverImage };
          }
          return e;
        });
        await supabase
          .from('settings')
          .upsert({ key: 'events', value: JSON.stringify(portableList), updatedAt: new Date().toISOString() });

        const ultraMinimalPayload = {
          id: cleanEvent.id,
          title: cleanEvent.title || '',
          description: cleanEvent.description || '',
          venue: cleanEvent.venue || '',
          slug: cleanEvent.slug || ''
        };
        if (cleanEvent.startDate) ultraMinimalPayload.startDate = cleanEvent.startDate;
        if (cleanEvent.endDate) ultraMinimalPayload.endDate = cleanEvent.endDate;
        // Use the real base64 image (not the db: pointer) so Supabase events table stores the actual image
        if (originalCoverImage && originalCoverImage.startsWith('data:')) {
          ultraMinimalPayload.coverImage = originalCoverImage;
        } else if (cleanEvent.coverImage) {
          ultraMinimalPayload.coverImage = cleanEvent.coverImage;
        }

        await supabase.from('events').upsert(ultraMinimalPayload);
      } catch (e) {
        console.warn('Supabase saveEvent sync note:', e);
      }
    }

    return cleanEvent;
  },

  async deleteEvent(id) {
    memCache.events = null;
    // 1. ALWAYS remove from local storage
    const events = JSON.parse(localStorage.getItem('elcomdais_events') || '[]');
    const filtered = events.filter(e => e.id !== id);
    localStorage.setItem('elcomdais_events', JSON.stringify(filtered));

    const regs = JSON.parse(localStorage.getItem('elcomdais_registrations') || '[]');
    const filteredRegs = regs.filter(r => r.eventId !== id);
    localStorage.setItem('elcomdais_registrations', JSON.stringify(filteredRegs));

    // 2. Delete from Supabase in background
    if (supabase) {
      try {
        await supabase.from('events').delete().eq('id', id);
        await supabase.from('registrations').delete().eq('eventId', id);
        const fullEventsList = JSON.parse(localStorage.getItem('elcomdais_events') || '[]');
        await supabase
          .from('settings')
          .upsert({ key: 'events', value: JSON.stringify(fullEventsList), updatedAt: new Date().toISOString() });
      } catch (e) {
        console.warn('Supabase deleteEvent sync failed:', e);
      }
    }

    return true;
  },

  // --- REGISTRATIONS ---
  // Source of truth is the Supabase `registrations` table. Public visitors can only
  // insert and call the count/duplicate RPCs (see supabase_rls.sql); only admins can read.
  async getRegistrations() {
    if (memCache.registrations) return memCache.registrations;
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('registeredAt', { ascending: false });
    if (error) throw error;
    memCache.registrations = data || [];
    return memCache.registrations;
  },

  async getRegistrationCount(eventId) {
    if (!supabase) return 0;
    const { data, error } = await supabase.rpc('registration_count', { p_event_id: eventId });
    return error ? 0 : data || 0;
  },

  // Returns the first register no./email already registered for this event, or null.
  async findTakenValue(eventId, values) {
    if (!supabase) return null;
    const { data, error } = await supabase.rpc('registration_taken', {
      p_event_id: eventId,
      p_values: values.filter(Boolean)
    });
    if (error) throw error;
    return data || null;
  },

  async registerUser(eventId, formData) {
    return this.registerForEvent(eventId, formData);
  },

  async registerForEvent(eventId, formData) {
    memCache.registrations = null;
    if (!supabase) throw new Error('Registration service unavailable. Please try again later.');
    const newReg = {
      id: `reg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      eventId,
      data: JSON.stringify(formData),
      registeredAt: new Date().toISOString()
    };
    const { error } = await supabase.from('registrations').insert(newReg);
    if (error) {
      const m = error.message || '';
      if (m.includes('EVENT_FULL')) throw new Error('Sorry, this event is full.');
      if (m.includes('DUPLICATE')) throw new Error(`Duplicate: ${m.split('DUPLICATE: ')[1] || 'details'} already registered for this event.`);
      if (m.includes('RATE_LIMITED')) throw new Error('Too many registrations from your network. Please wait a few minutes and try again.');
      throw new Error('Could not save your registration. Please try again.');
    }
    return newReg;
  },

  async saveRegistration(id, updatedData) {
    memCache.registrations = null;
    const { error } = await supabase.from('registrations').update({ data: JSON.stringify(updatedData) }).eq('id', id);
    if (error) throw error;
    return true;
  },

  async deleteRegistration(id) {
    memCache.registrations = null;
    const { error } = await supabase.from('registrations').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  async getAlbums() {
    if (memCache.albums) {
      return memCache.albums;
    }

    let remoteAlbums = null;
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('albums')
          .select('*')
          .order('createdAt', { ascending: false });
        if (!error && data && data.length > 0) remoteAlbums = data;
      } catch (e) {
        console.warn('Supabase getAlbums failed, using local DB fallback', e);
      }
    }

    const localAlbums = JSON.parse(localStorage.getItem('elcomdais_albums') || '[]');
    let albumsList = [];

    if (remoteAlbums && remoteAlbums.length > 0) {
      albumsList = remoteAlbums;
      try {
        localStorage.setItem('elcomdais_albums', JSON.stringify(remoteAlbums));
      } catch (e) {}
    } else {
      albumsList = localAlbums.length > 0 ? localAlbums : [...SEED_ALBUMS];
    }

    memCache.albums = albumsList;
    return albumsList;
  },

  async getAlbumImages(albumId) {
    if (memCache.albumImages[albumId]) {
      return memCache.albumImages[albumId];
    }

    let remoteImages = null;
    if (supabase) {
      try {
        const { data: remoteImagesData, error } = await supabase
          .from('images')
          .select('*')
          .eq('albumId', albumId)
          .order('id', { ascending: true });
        if (!error && remoteImagesData && remoteImagesData.length > 0) remoteImages = remoteImagesData;
      } catch (e) {
        console.warn(`Supabase getAlbumImages failed for album ${albumId}`, e);
      }
    }

    let localImages = [];
    try {
      const db = await initIndexedDB();
      if (db) {
        localImages = await new Promise((resolve) => {
          try {
            const transaction = db.transaction('gallery_images', 'readonly');
            const store = transaction.objectStore('gallery_images');
            const index = store.index('albumId');
            const request = index.getAll(albumId);
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => resolve([]);
          } catch (e) {
            resolve([]);
          }
        });
      }
    } catch (err) {
      console.error('IndexedDB getAlbumImages failed:', err);
    }

    let imagesList = [];
    if (remoteImages && remoteImages.length > 0) {
      imagesList = remoteImages;
    } else {
      imagesList = localImages.length > 0 ? localImages : SEED_IMAGES.filter(i => i.albumId === albumId);
    }

    memCache.albumImages[albumId] = imagesList;
    return imagesList;
  },

  async createAlbum(albumData, fileUrls = []) {
    memCache.albums = null;
    const albumId = albumData.id || `alb-${Date.now()}`;
    const newAlbum = {
      id: albumId,
      title: albumData.title,
      description: albumData.description,
      coverImage: fileUrls[0] || albumData.coverImage || 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80',
      createdAt: albumData.createdAt || new Date().toISOString()
    };

    // 1. ALWAYS Save locally to localStorage & IndexedDB
    const albums = JSON.parse(localStorage.getItem('elcomdais_albums') || '[]');
    const matchIdx = albums.findIndex(a => a.id === newAlbum.id);
    if (matchIdx !== -1) albums[matchIdx] = newAlbum;
    else albums.push(newAlbum);
    localStorage.setItem('elcomdais_albums', JSON.stringify(albums));

    if (fileUrls.length > 0) {
      try {
        const db = await initIndexedDB();
        if (db) {
          const transaction = db.transaction('gallery_images', 'readwrite');
          const store = transaction.objectStore('gallery_images');
          fileUrls.forEach((url, idx) => {
            store.put({
              id: `img-${Date.now()}-${idx}`,
              albumId,
              url,
              caption: `Photo from ${newAlbum.title}`
            });
          });
        }
      } catch (err) {
        console.error('Error saving gallery images to IndexedDB:', err);
      }
    }

    // 2. Sync to Supabase in background
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('albums')
          .upsert(newAlbum)
          .select()
          .single();

        if (!error && data && fileUrls.length > 0) {
          const imgObjs = fileUrls.map((url, idx) => ({
            albumId: data.id,
            url,
            caption: `Photo from ${data.title}`
          }));
          await supabase.from('images').upsert(imgObjs);
        }
      } catch (e) {
        console.warn('Supabase createAlbum sync failed, using local DB:', e);
      }
    }

    return newAlbum;
  },

  async saveAlbum(albumId, albumData, fileUrls = []) {
    memCache.albums = null;
    delete memCache.albumImages[albumId];
    const updatedAlbum = {
      id: albumId,
      title: albumData.title,
      description: albumData.description,
      coverImage: fileUrls[0] || albumData.coverImage || 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80',
      createdAt: albumData.createdAt || new Date().toISOString()
    };

    // 1. ALWAYS Save locally to localStorage & IndexedDB
    const albums = JSON.parse(localStorage.getItem('elcomdais_albums') || '[]');
    const matchIdx = albums.findIndex(a => a.id === albumId);
    if (matchIdx !== -1) {
      albums[matchIdx] = updatedAlbum;
    } else {
      albums.push(updatedAlbum);
    }
    localStorage.setItem('elcomdais_albums', JSON.stringify(albums));

    if (fileUrls.length > 0) {
      try {
        const db = await initIndexedDB();
        if (db) {
          const deleteTransaction = db.transaction('gallery_images', 'readwrite');
          const deleteStore = deleteTransaction.objectStore('gallery_images');
          const index = deleteStore.index('albumId');
          const keysRequest = index.getAllKeys(albumId);

          await new Promise((resolve) => {
            keysRequest.onsuccess = () => {
              const keys = keysRequest.result || [];
              const deletePromises = keys.map(key => deleteStore.delete(key));
              resolve(Promise.all(deletePromises));
            };
          });

          const insertTransaction = db.transaction('gallery_images', 'readwrite');
          const insertStore = insertTransaction.objectStore('gallery_images');
          fileUrls.forEach((url, idx) => {
            insertStore.put({
              id: `img-${Date.now()}-${idx}`,
              albumId,
              url,
              caption: `Photo from ${updatedAlbum.title}`
            });
          });
        }
      } catch (err) {
        console.error('Error saving album images to IndexedDB:', err);
      }
    }

    // 2. Sync to Supabase in background
    if (supabase) {
      try {
        await supabase.from('albums').upsert(updatedAlbum);
        if (fileUrls.length > 0) {
          await supabase.from('images').delete().eq('albumId', albumId);
          const imgObjs = fileUrls.map((url, idx) => ({
            albumId,
            url,
            caption: `Photo from ${albumData.title}`
          }));
          await supabase.from('images').insert(imgObjs);
        }
      } catch (e) {
        console.warn('Supabase saveAlbum sync failed, using local DB:', e);
      }
    }

    return updatedAlbum;
  },

  async deleteAlbum(albumId) {
    memCache.albums = null;
    delete memCache.albumImages[albumId];
    // 1. ALWAYS delete from local storage & IndexedDB
    const albums = JSON.parse(localStorage.getItem('elcomdais_albums') || '[]');
    const filteredAlbs = albums.filter(a => a.id !== albumId);
    localStorage.setItem('elcomdais_albums', JSON.stringify(filteredAlbs));

    try {
      const db = await initIndexedDB();
      if (db) {
        const transaction = db.transaction('gallery_images', 'readwrite');
        const store = transaction.objectStore('gallery_images');
        const index = store.index('albumId');
        const keysRequest = index.getAllKeys(albumId);

        keysRequest.onsuccess = () => {
          const keys = keysRequest.result || [];
          keys.forEach(key => store.delete(key));
        };
      }
    } catch (err) {
      console.error('Error deleting gallery images from IndexedDB:', err);
    }

    // 2. Delete from Supabase in background
    if (supabase) {
      try {
        await supabase.from('albums').delete().eq('id', albumId);
        await supabase.from('images').delete().eq('albumId', albumId);
      } catch (e) {
        console.warn('Supabase deleteAlbum sync failed:', e);
      }
    }

    return true;
  },

  // --- COMMITTEE ---
  async getCommittee() {
    if (memCache.committee) {
      return memCache.committee;
    }

    let rawData = null;
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'committee')
          .maybeSingle();
        if (!error && data && data.value) {
          rawData = JSON.parse(data.value);
        }
      } catch (e) {
        console.warn('Supabase getCommittee failed, using local DB fallback', e);
      }
    }

    if (rawData) {
      try {
        localStorage.setItem('elcomdais_committee', JSON.stringify(rawData));
      } catch (e) {}
    } else {
      rawData = JSON.parse(localStorage.getItem('elcomdais_committee') || 'null');
    }

    if (!rawData) return null;

    const restoreNode = async (node, idKey) => {
      if (!node) return;
      if (node.image && node.image.startsWith('db:')) {
        const key = node.image.replace('db:', '');
        const dbImg = await getDBImage(key);
        if (dbImg) node.image = dbImg;
      }
      if (node.members && Array.isArray(node.members)) {
        for (let i = 0; i < node.members.length; i++) {
          const sub = node.members[i];
          if (sub && sub.image && sub.image.startsWith('db:')) {
            const key = sub.image.replace('db:', '');
            const dbImg = await getDBImage(key);
            if (dbImg) sub.image = dbImg;
          }
        }
      }
    };

    if (rawData.faculty) {
      for (let i = 0; i < rawData.faculty.length; i++) {
        await restoreNode(rawData.faculty[i], `faculty_${i}`);
      }
    }
    if (rawData.presidents) {
      for (let i = 0; i < rawData.presidents.length; i++) {
        await restoreNode(rawData.presidents[i], `presidents_${i}`);
      }
    }
    if (rawData.core) {
      for (let i = 0; i < rawData.core.length; i++) {
        await restoreNode(rawData.core[i], `core_${rawData.core[i].id || i}`);
      }
    }

    memCache.committee = rawData;
    return rawData;
  },

  async saveCommittee(committeeData) {
    memCache.committee = null;
    const cleanData = JSON.parse(JSON.stringify(committeeData));

    // Extract any raw base64 images into IndexedDB so cleanData contains ONLY lightweight db: keys or HTTP URLs!
    const processNode = async (node, idKey) => {
      if (!node) return;
      if (node.image && node.image.startsWith('data:image')) {
        await saveDBImage(idKey, node.image);
        node.image = `db:${idKey}`;
      }
      if (node.members && Array.isArray(node.members)) {
        for (let i = 0; i < node.members.length; i++) {
          const sub = node.members[i];
          const subKey = `${idKey}_sub_${i}`;
          if (sub && sub.image && sub.image.startsWith('data:image')) {
            await saveDBImage(subKey, sub.image);
            sub.image = `db:${subKey}`;
          }
        }
      }
    };

    if (cleanData.faculty) {
      for (let i = 0; i < cleanData.faculty.length; i++) {
        await processNode(cleanData.faculty[i], `faculty_${i}`);
      }
    }
    if (cleanData.presidents) {
      for (let i = 0; i < cleanData.presidents.length; i++) {
        await processNode(cleanData.presidents[i], `presidents_${i}`);
      }
    }
    if (cleanData.core) {
      for (let i = 0; i < cleanData.core.length; i++) {
        await processNode(cleanData.core[i], `core_${cleanData.core[i].id || i}`);
      }
    }

    try {
      localStorage.setItem('elcomdais_committee', JSON.stringify(cleanData));
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        console.warn('LocalStorage quota limit reached. Clearing obsolete keys...');
        const obsoleteKeys = [
          'elcomdias_committee',
          'elcomdias_events',
          'elcomdias_albums',
          'elcomdias_images',
          'elcomdias_registrations',
          'elcomdias_admins'
        ];
        obsoleteKeys.forEach(k => localStorage.removeItem(k));
        
        try {
          localStorage.setItem('elcomdais_committee', JSON.stringify(cleanData));
          console.log('Saved committee successfully after clearing obsolete keys.');
        } catch (retryErr) {
          console.error('LocalStorage storage failed even after cleanup:', retryErr);
        }
      } else {
        console.warn('localStorage quota note for committee details:', e);
      }
    }

    // Sync cleanData (with lightweight db: keys and URLs!) directly to Supabase settings table
    if (supabase) {
      try {
        const { error } = await supabase
          .from('settings')
          .upsert({ key: 'committee', value: JSON.stringify(cleanData), updatedAt: new Date().toISOString() });
        if (error) {
          console.warn('Supabase saveCommittee note:', error.message || error);
        }
      } catch (e) {
        console.warn('Supabase saveCommittee sync failed, using local DB:', e);
      }
    }

    return cleanData;
  },

  // --- AUTHENTICATION (Supabase Auth only; no local/default credentials) ---
  async login(username, password) {
    if (!supabase) throw new Error('Authentication service unavailable.');
    const { data, error } = await supabase.auth.signInWithPassword({ email: username, password });
    if (error || !data.user) throw new Error('Invalid username or password.');
    return { username: data.user.email, name: data.user.email.split('@')[0], token: data.session.access_token };
  }
};
