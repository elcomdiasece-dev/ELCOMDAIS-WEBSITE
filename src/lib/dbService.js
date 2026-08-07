import { supabase } from './supabaseClient';

// --- INDEXEDDB STORAGE FOR LARGE ASSETS (COMMITTEE & GALLERY IMAGES) ---
const initIndexedDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('elcomdais_blob_db', 2);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;

      // Store for committee photos
      if (!db.objectStoreNames.contains('committee_images')) {
        db.createObjectStore('committee_images');
      }

      // Store for gallery photos
      if (!db.objectStoreNames.contains('gallery_images')) {
        const store = db.createObjectStore('gallery_images', { keyPath: 'id' });
        store.createIndex('albumId', 'albumId', { unique: false });
      }
    };
    request.onsuccess = (e) => {
      resolve(e.target.result);
    };
    request.onerror = (e) => {
      reject(e.target.error);
    };
  });
};

const getDBImage = async (key) => {
  try {
    const db = await initIndexedDB();
    return new Promise((resolve) => {
      const transaction = db.transaction('committee_images', 'readonly');
      const store = transaction.objectStore('committee_images');
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || '');
      req.onerror = () => resolve('');
    });
  } catch (e) {
    console.error('IndexedDB get failed:', e);
    return '';
  }
};

const saveDBImage = async (key, base64) => {
  try {
    const db = await initIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('committee_images', 'readwrite');
      const store = transaction.objectStore('committee_images');
      const req = store.put(base64, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
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
const SEED_ALBUMS = [];
const SEED_IMAGES = [];
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

export const dbService = {
  // --- EVENTS ---
  async getEvents() {
    let remoteEvents = null;
    if (supabase) {
      try {
        // 1. Try fetching from settings cloud store (guaranteed 100% schema compatibility)
        const { data: settingsData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'events')
          .maybeSingle();

        if (settingsData && settingsData.value) {
          try {
            remoteEvents = JSON.parse(settingsData.value);
          } catch (err) {
            console.warn('Error parsing events settings JSON:', err);
          }
        }

        // 2. Fallback to direct events table if settings store was empty
        if (!remoteEvents || remoteEvents.length === 0) {
          const { data, error } = await supabase
            .from('events')
            .select('*');
          if (!error && data && data.length > 0) {
            remoteEvents = data;
          }
        }
      } catch (e) {
        console.warn('Supabase getEvents failed, falling back to local DB', e);
      }
    }

    const localEvents = JSON.parse(localStorage.getItem('elcomdais_events') || '[]');
    let rawEvents = [];

    if (remoteEvents && remoteEvents.length > 0) {
      rawEvents = [...remoteEvents];
      const remoteIds = new Set(remoteEvents.map(e => e.id));
      for (const loc of localEvents) {
        if (!remoteIds.has(loc.id)) {
          rawEvents.push(loc);
        }
      }
    } else {
      rawEvents = localEvents;
    }

    // Fallback to seed events if no events exist in remote or local
    if (!rawEvents || rawEvents.length === 0) {
      rawEvents = [...SEED_EVENTS];
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
    }
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
    let remoteRegs = [];
    if (supabase) {
      try {
        // 1. Try fetching from settings table cloud store (key: 'registrations')
        const { data: settingsData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'registrations')
          .maybeSingle();

        if (settingsData && settingsData.value) {
          try {
            remoteRegs = JSON.parse(settingsData.value);
          } catch (e) {
            console.warn('Error parsing registrations settings JSON:', e);
          }
        }

        // 2. Fallback / merge with registrations direct table
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
      } catch (e) {
        console.warn('Supabase getRegistrations failed, falling back to local DB', e);
      }
    }

    // 3. Merge with local storage registrations so nothing is ever lost
    const localRegs = JSON.parse(localStorage.getItem('elcomdais_registrations') || '[]');
    const existingIds = new Set(remoteRegs.map(r => r.id));
    let hasNewLocal = false;

    for (const loc of localRegs) {
      if (!existingIds.has(loc.id)) {
        remoteRegs.push(loc);
        hasNewLocal = true;
      }
    }

    // If local items were missing from remote, sync them to Supabase settings in background
    if (hasNewLocal && supabase) {
      try {
        await supabase
          .from('settings')
          .upsert({ key: 'registrations', value: JSON.stringify(remoteRegs), updatedAt: new Date().toISOString() });
      } catch (e) {
        console.warn('Background sync of local registrations to settings failed:', e);
      }
    }

    return remoteRegs;
  },

  async registerUser(eventId, formData) {
    return this.registerForEvent(eventId, formData);
  },

  async registerForEvent(eventId, formData) {
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

  // --- PHOTO GALLERY ---
  async getAlbums() {
    let remoteAlbums = null;
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('albums')
          .select('*')
          .order('createdAt', { ascending: false });
        if (!error && data && data.length > 0) remoteAlbums = data;
      } catch (e) {
        console.warn('Supabase getAlbums failed, falling back to local DB', e);
      }
    }

    const localAlbums = JSON.parse(localStorage.getItem('elcomdais_albums') || '[]');
    if (remoteAlbums && remoteAlbums.length > 0) {
      const remoteIds = new Set(remoteAlbums.map(a => a.id));
      for (const loc of localAlbums) {
        if (!remoteIds.has(loc.id)) remoteAlbums.push(loc);
      }
      return remoteAlbums;
    }
    return localAlbums;
  },

  async getAlbumImages(albumId) {
    let remoteImages = null;
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('images')
          .select('*')
          .eq('albumId', albumId)
          .order('id', { ascending: true });
        if (!error && data && data.length > 0) remoteImages = data;
      } catch (e) {
        console.warn(`Supabase getAlbumImages (${albumId}) failed, falling back to IndexedDB`, e);
      }
    }

    let localImages = [];
    try {
      const db = await initIndexedDB();
      localImages = await new Promise((resolve) => {
        const transaction = db.transaction('gallery_images', 'readonly');
        const store = transaction.objectStore('gallery_images');
        const index = store.index('albumId');
        const request = index.getAll(albumId);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
    } catch (err) {
      console.error('IndexedDB getAlbumImages failed:', err);
    }

    if (remoteImages && remoteImages.length > 0) {
      const remoteIds = new Set(remoteImages.map(i => i.id));
      for (const loc of localImages) {
        if (!remoteIds.has(loc.id)) remoteImages.push(loc);
      }
      return remoteImages;
    }
    return localImages;
  },

  async createAlbum(albumData, fileUrls = []) {
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
    // 1. ALWAYS delete from local storage & IndexedDB
    const albums = JSON.parse(localStorage.getItem('elcomdais_albums') || '[]');
    const filteredAlbs = albums.filter(a => a.id !== albumId);
    localStorage.setItem('elcomdais_albums', JSON.stringify(filteredAlbs));

    try {
      const db = await initIndexedDB();
      const transaction = db.transaction('gallery_images', 'readwrite');
      const store = transaction.objectStore('gallery_images');
      const index = store.index('albumId');
      const keysRequest = index.getAllKeys(albumId);

      keysRequest.onsuccess = () => {
        const keys = keysRequest.result || [];
        keys.forEach(key => store.delete(key));
      };
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
    let rawData = null;
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'committee')
          .maybeSingle();
        if (!error && data && data.value) rawData = JSON.parse(data.value);
      } catch (e) {
        console.warn('Supabase getCommittee failed, falling back to local DB', e);
      }
    }
    if (!rawData) {
      rawData = JSON.parse(localStorage.getItem('elcomdais_committee') || 'null');
    }
    if (!rawData) return null;

    // Clean up any legacy IndexedDB 'db:' image keys if found
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

    for (let i = 0; i < rawData.faculty.length; i++) {
      await restoreNode(rawData.faculty[i], `faculty_${i}`);
    }
    for (let i = 0; i < rawData.presidents.length; i++) {
      await restoreNode(rawData.presidents[i], `presidents_${i}`);
    }
    for (let i = 0; i < rawData.core.length; i++) {
      await restoreNode(rawData.core[i], `core_${rawData.core[i].id}`);
    }

    return rawData;
  },

  async saveCommittee(committeeData) {
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
      console.warn('localStorage quota note for committee details:', e);
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
