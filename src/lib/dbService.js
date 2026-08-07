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
  migrateKey('elcomdias_admins', 'elcomdais_admins');
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

  // Admin credentials: username=admin, password=password123
  if (!localStorage.getItem('elcomdais_admins')) {
    localStorage.setItem('elcomdais_admins', JSON.stringify([
      { username: 'admin', password: 'password123', name: 'Core Admin' }
    ]));
  }
};

initLocalDb();

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

    const localEvents = JSON.parse(localStorage.getItem('elcomdais_events') || '[]');
    let rawEvents = localEvents.length > 0 ? localEvents : [...SEED_EVENTS];

    for (let i = 0; i < rawEvents.length; i++) {
      const evt = rawEvents[i];
      if (!evt.type) evt.type = 'Workshop';
      if (evt.isPublished === undefined || evt.isPublished === null) evt.isPublished = true;
      if (evt.coverImage && evt.coverImage.startsWith('db:')) {
        const key = evt.coverImage.replace('db:', '');
        const dbImg = await getDBImage(key);
        if (dbImg) evt.coverImage = dbImg;
      }
    }

    // Set cache to local data initially so first render resolves in 0ms
    memCache.events = rawEvents;

    // Trigger background sync with Supabase (stale-while-revalidate)
    this._syncEventsBackground().catch(err => console.warn('Background events sync failed:', err));

    return rawEvents;
  },

  async _syncEventsBackground() {
    if (!supabase) return;
    try {
      let remoteEvents = null;
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

      if (remoteEvents && remoteEvents.length > 0) {
        for (let i = 0; i < remoteEvents.length; i++) {
          const evt = remoteEvents[i];
          if (!evt.type) evt.type = 'Workshop';
          if (evt.isPublished === undefined || evt.isPublished === null) evt.isPublished = true;
          if (evt.coverImage && evt.coverImage.startsWith('db:')) {
            const key = evt.coverImage.replace('db:', '');
            const dbImg = await getDBImage(key);
            if (dbImg) evt.coverImage = dbImg;
          }
        }
        memCache.events = remoteEvents;
        try {
          localStorage.setItem('elcomdais_events', JSON.stringify(remoteEvents));
        } catch (e) {}
      }
    } catch (e) {
      console.warn('Background sync failed:', e);
    }
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

    // Resolve any db: key to full image URL/data URL for portable cross-device display
    let portableCoverImage = cleanEvent.coverImage || '';
    if (portableCoverImage.startsWith('db:')) {
      const key = portableCoverImage.replace('db:', '');
      const dbImg = await getDBImage(key);
      if (dbImg) portableCoverImage = dbImg;
    }
    cleanEvent.coverImage = portableCoverImage;

    // 1. ALWAYS save to local storage & IndexedDB
    const localEvent = { ...cleanEvent };
    if (localEvent.coverImage && localEvent.coverImage.startsWith('data:')) {
      const imageKey = `event_image_${localEvent.id}`;
      await saveDBImage(imageKey, localEvent.coverImage);
    }

    const events = JSON.parse(localStorage.getItem('elcomdais_events') || '[]');
    const matchIdx = events.findIndex(e => e.id === cleanEvent.id);
    if (matchIdx !== -1) {
      events[matchIdx] = cleanEvent;
    } else {
      events.push(cleanEvent);
    }
    localStorage.setItem('elcomdais_events', JSON.stringify(events));

    // 2. Sync portable event (with real coverImage data!) to Supabase cloud database
    if (supabase) {
      try {
        const fullEventsList = JSON.parse(localStorage.getItem('elcomdais_events') || '[]');
        await supabase
          .from('settings')
          .upsert({ key: 'events', value: JSON.stringify(fullEventsList), updatedAt: new Date().toISOString() });

        const ultraMinimalPayload = {
          id: cleanEvent.id,
          title: cleanEvent.title || '',
          description: cleanEvent.description || '',
          venue: cleanEvent.venue || '',
          slug: cleanEvent.slug || ''
        };
        if (cleanEvent.startDate) ultraMinimalPayload.startDate = cleanEvent.startDate;
        if (cleanEvent.endDate) ultraMinimalPayload.endDate = cleanEvent.endDate;
        if (cleanEvent.coverImage) {
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
  async getRegistrations() {
    if (memCache.registrations) {
      return memCache.registrations;
    }

    const localRegs = JSON.parse(localStorage.getItem('elcomdais_registrations') || '[]');
    memCache.registrations = localRegs;

    this._syncRegistrationsBackground().catch(() => {});
    return localRegs;
  },

  async _syncRegistrationsBackground() {
    if (!supabase) return;
    try {
      let remoteRegs = [];
      const { data: settingsData } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'registrations')
        .maybeSingle();

      if (settingsData && settingsData.value) {
        try {
          remoteRegs = JSON.parse(settingsData.value);
        } catch (e) {}
      }

      const { data: tableData, error } = await supabase
        .from('registrations')
        .select('*')
        .order('registeredAt', { ascending: false });

      if (!error && tableData && tableData.length > 0) {
        const remoteIds = new Set(remoteRegs.map(r => r.id));
        for (const item of tableData) {
          if (!remoteIds.has(item.id)) remoteRegs.push(item);
        }
      }

      const localRegs = JSON.parse(localStorage.getItem('elcomdais_registrations') || '[]');
      const existingIds = new Set(remoteRegs.map(r => r.id));
      let hasNewLocal = false;

      for (const loc of localRegs) {
        if (!existingIds.has(loc.id)) {
          remoteRegs.push(loc);
          hasNewLocal = true;
        }
      }

      memCache.registrations = remoteRegs;

      if (hasNewLocal) {
        await supabase
          .from('settings')
          .upsert({ key: 'registrations', value: JSON.stringify(remoteRegs), updatedAt: new Date().toISOString() });
      }
    } catch (e) {
      console.warn('Background registrations sync failed:', e);
    }
  },


  async registerUser(eventId, formData) {
    return this.registerForEvent(eventId, formData);
  },

  async registerForEvent(eventId, formData) {
    memCache.registrations = null;
    const newReg = {
      id: `reg-${Date.now()}`,
      eventId,
      data: JSON.stringify(formData),
      registeredAt: new Date().toISOString()
    };

    // 1. ALWAYS save locally first
    let localRegs = [];
    try {
      localRegs = JSON.parse(localStorage.getItem('elcomdais_registrations') || '[]');
    } catch (e) {
      localRegs = [];
    }
    localRegs.unshift(newReg);
    try {
      localStorage.setItem('elcomdais_registrations', JSON.stringify(localRegs));
    } catch (e) {
      console.warn('localStorage quota note for registrations:', e);
    }

    // 2. Try direct Supabase table insert
    if (supabase) {
      try {
        await supabase.from('registrations').insert(newReg);
      } catch (e) {
        console.warn('Supabase direct registrations table insert note:', e);
      }

      // 3. Cloud sync to settings table (key: 'registrations') as guaranteed backup
      try {
        const allRegs = await this.getRegistrations();
        const exists = allRegs.some(r => r.id === newReg.id);
        if (!exists) allRegs.unshift(newReg);
        await supabase
          .from('settings')
          .upsert({ key: 'registrations', value: JSON.stringify(allRegs), updatedAt: new Date().toISOString() });
      } catch (e) {
        console.warn('Supabase settings registrations backup sync note:', e);
      }
    }

    return newReg;
  },

  async saveRegistration(id, updatedData) {
    memCache.registrations = null;
    const regString = JSON.stringify(updatedData);
    let allRegs = [];
    try {
      allRegs = JSON.parse(localStorage.getItem('elcomdais_registrations') || '[]');
    } catch (e) {
      allRegs = [];
    }

    const idx = allRegs.findIndex(r => r.id === id);
    if (idx !== -1) {
      allRegs[idx].data = regString;
      try {
        localStorage.setItem('elcomdais_registrations', JSON.stringify(allRegs));
      } catch (e) {}
    }

    if (supabase) {
      try {
        await supabase.from('registrations').update({ data: regString }).eq('id', id);
      } catch (e) {}
      try {
        const fullList = await this.getRegistrations();
        const fIdx = fullList.findIndex(r => r.id === id);
        if (fIdx !== -1) fullList[fIdx].data = regString;
        await supabase
          .from('settings')
          .upsert({ key: 'registrations', value: JSON.stringify(fullList), updatedAt: new Date().toISOString() });
      } catch (e) {}
    }

    return true;
  },

  async deleteRegistration(id) {
    memCache.registrations = null;
    // 1. ALWAYS remove from local storage
    let regs = [];
    try {
      regs = JSON.parse(localStorage.getItem('elcomdais_registrations') || '[]');
    } catch (e) {
      regs = [];
    }
    const filtered = regs.filter(r => r.id !== id);
    try {
      localStorage.setItem('elcomdais_registrations', JSON.stringify(filtered));
    } catch (e) {}

    // 2. Delete from Supabase in background
    if (supabase) {
      try {
        await supabase.from('registrations').delete().eq('id', id);
      } catch (e) {}
      try {
        const fullList = await this.getRegistrations();
        const remaining = fullList.filter(r => r.id !== id);
        await supabase
          .from('settings')
          .upsert({ key: 'registrations', value: JSON.stringify(remaining), updatedAt: new Date().toISOString() });
      } catch (e) {}
    }

    return true;
  },

  async getAlbums() {
    if (memCache.albums) {
      return memCache.albums;
    }

    const localAlbums = JSON.parse(localStorage.getItem('elcomdais_albums') || '[]');
    const albumsList = localAlbums.length > 0 ? localAlbums : [...SEED_ALBUMS];
    memCache.albums = albumsList;

    this._syncAlbumsBackground().catch(() => {});
    return albumsList;
  },

  async _syncAlbumsBackground() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .order('createdAt', { ascending: false });

      if (!error && data) {
        const localAlbums = JSON.parse(localStorage.getItem('elcomdais_albums') || '[]');
        const remoteIds = new Set(data.map(a => a.id));
        for (const loc of localAlbums) {
          if (!remoteIds.has(loc.id)) data.push(loc);
        }
        memCache.albums = data;
        try {
          localStorage.setItem('elcomdais_albums', JSON.stringify(data));
        } catch (e) {}
      }
    } catch (e) {
      console.warn('Background sync albums failed:', e);
    }
  },

  async getAlbumImages(albumId) {
    if (memCache.albumImages[albumId]) {
      return memCache.albumImages[albumId];
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

    let imagesList = localImages;
    if (imagesList.length === 0) {
      imagesList = SEED_IMAGES.filter(i => i.albumId === albumId);
    }

    memCache.albumImages[albumId] = imagesList;

    this._syncAlbumImagesBackground(albumId, imagesList).catch(() => {});
    return imagesList;
  },

  async _syncAlbumImagesBackground(albumId, localImages) {
    if (!supabase) return;
    try {
      const { data: remoteImages, error } = await supabase
        .from('images')
        .select('*')
        .eq('albumId', albumId)
        .order('id', { ascending: true });

      if (!error && remoteImages) {
        const remoteIds = new Set(remoteImages.map(i => i.id));
        for (const loc of localImages) {
          if (!remoteIds.has(loc.id)) remoteImages.push(loc);
        }
        memCache.albumImages[albumId] = remoteImages;
      }
    } catch (e) {
      console.warn('Background sync album images failed:', e);
    }
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

    let rawData = JSON.parse(localStorage.getItem('elcomdais_committee') || 'null');
    
    if (rawData) {
      for (let i = 0; i < rawData.faculty.length; i++) {
        await restoreNode(rawData.faculty[i], `faculty_${i}`);
      }
      for (let i = 0; i < rawData.presidents.length; i++) {
        await restoreNode(rawData.presidents[i], `presidents_${i}`);
      }
      for (let i = 0; i < rawData.core.length; i++) {
        await restoreNode(rawData.core[i], `core_${rawData.core[i].id}`);
      }
      memCache.committee = rawData;
      
      // Sync fresh data in the background (stale-while-revalidate)
      this._syncCommitteeBackground().catch(() => {});
      return rawData;
    }

    // No local committee, fetch synchronously
    await this._syncCommitteeBackground();
    return memCache.committee;
  },

  async _syncCommitteeBackground() {
    if (!supabase) return;
    try {
      let rawData = null;
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'committee')
        .maybeSingle();

      if (!error && data && data.value) {
        rawData = JSON.parse(data.value);
      }

      if (rawData) {
        for (let i = 0; i < rawData.faculty.length; i++) {
          await restoreNode(rawData.faculty[i], `faculty_${i}`);
        }
        for (let i = 0; i < rawData.presidents.length; i++) {
          await restoreNode(rawData.presidents[i], `presidents_${i}`);
        }
        for (let i = 0; i < rawData.core.length; i++) {
          await restoreNode(rawData.core[i], `core_${rawData.core[i].id}`);
        }
        memCache.committee = rawData;
        try {
          localStorage.setItem('elcomdais_committee', JSON.stringify(rawData));
        } catch (e) {}
      }
    } catch (e) {
      console.warn('Background committee sync failed:', e);
    }
  },

  async saveCommittee(committeeData) {
    memCache.committee = null;
    const cleanData = JSON.parse(JSON.stringify(committeeData));

    // Resolve any legacy db: keys to base64 if available in IndexedDB
    const processNode = async (node, id) => {
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

    for (let i = 0; i < cleanData.faculty.length; i++) {
      await processNode(cleanData.faculty[i], `faculty_${i}`);
    }
    for (let i = 0; i < cleanData.presidents.length; i++) {
      await processNode(cleanData.presidents[i], `presidents_${i}`);
    }
    for (let i = 0; i < cleanData.core.length; i++) {
      await processNode(cleanData.core[i], `core_${cleanData.core[i].id}`);
    }

    try {
      localStorage.setItem('elcomdais_committee', JSON.stringify(cleanData));
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        console.warn('LocalStorage quota limit reached. Clearing obsolete keys...');
        // Clear obsolete keys with old spelling (elcomdias_)
        const obsoleteKeys = [
          'elcomdias_committee',
          'elcomdias_events',
          'elcomdias_albums',
          'elcomdias_images',
          'elcomdias_registrations',
          'elcomdias_admins'
        ];
        obsoleteKeys.forEach(k => localStorage.removeItem(k));
        
        // Attempt retry
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

    // Sync cleanData (with real portable base64/HTTP image URLs!) directly to Supabase settings table
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

  // --- AUTHENTICATION ---
  async registerAdmin(username, password, name) {
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: username,
          password: password,
          options: {
            data: {
              full_name: name
            }
          }
        });
        if (!error && data.user) {
          return { username: data.user.email, name: name };
        }
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase Auth signUp failed, trying local database fallback', e);
      }
    }

    const admins = JSON.parse(localStorage.getItem('elcomdais_admins') || '[]');
    const exists = admins.find(a => a.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      throw new Error('Admin username already exists.');
    }
    const newAdmin = { username, password, name };
    admins.push(newAdmin);
    localStorage.setItem('elcomdais_admins', JSON.stringify(admins));
    return newAdmin;
  },

  async login(username, password) {
    if (supabase) {
      try {
        // Authenticating via supabase auth if supported, fallback to table check
        const { data, error } = await supabase.auth.signInWithPassword({
          email: username,
          password: password
        });
        if (!error && data.user) {
          return { username: data.user.email, name: data.user.email.split('@')[0], token: data.session.access_token };
        }
      } catch (e) {
        console.warn('Supabase Auth signIn failed, trying table/local database', e);
      }
    }

    // Local authentication check
    const admins = JSON.parse(localStorage.getItem('elcomdais_admins') || '[]');
    const matched = admins.find(a => a.username.toLowerCase() === username.toLowerCase() && a.password === password);
    if (matched) {
      return { username: matched.username, name: matched.name, token: 'local-session-token' };
    }
    throw new Error('Invalid username or password.');
  }
};
