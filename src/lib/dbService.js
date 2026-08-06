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
const SEED_EVENTS = [];
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
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('startDate', { ascending: true });
        if (!error && data && data.length > 0) {
          remoteEvents = data;
        }
      } catch (e) {
        console.warn('Supabase getEvents failed, falling back to local DB', e);
      }
    }

    const localEvents = JSON.parse(localStorage.getItem('elcomdais_events') || '[]');
    let rawEvents = [];

    if (remoteEvents && remoteEvents.length > 0) {
      rawEvents = [...remoteEvents];
      // Merge local events that might not be in remote yet
      const remoteIds = new Set(remoteEvents.map(e => e.id));
      for (const loc of localEvents) {
        if (!remoteIds.has(loc.id)) {
          rawEvents.push(loc);
        }
      }
    } else {
      rawEvents = localEvents;
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
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
        if (!error && data) evt = data;
      } catch (e) {
        console.warn(`Supabase getEventBySlug (${slug}) failed, falling back to local DB`, e);
      }
    }
    if (!evt) {
      const events = JSON.parse(localStorage.getItem('elcomdais_events') || '[]');
      evt = events.find(e => e.slug === slug) || null;
    }

    if (evt && evt.coverImage && evt.coverImage.startsWith('db:')) {
      const key = evt.coverImage.replace('db:', '');
      const dbImg = await getDBImage(key);
      if (dbImg) evt.coverImage = dbImg;
    }
    return evt;
  },

  async saveEvent(eventData) {
    const slug = eventData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const cleanEvent = {
      ...eventData,
      slug,
      updatedAt: new Date().toISOString()
    };

    if (!cleanEvent.id) {
      cleanEvent.id = `evt-${Date.now()}`;
      cleanEvent.createdAt = new Date().toISOString();
    }

    // 1. ALWAYS save to local storage & IndexedDB first so data is NEVER lost
    const localEvent = { ...cleanEvent };
    if (localEvent.coverImage && localEvent.coverImage.startsWith('data:')) {
      const imageKey = `event_image_${localEvent.id}`;
      await saveDBImage(imageKey, localEvent.coverImage);
      localEvent.coverImage = `db:${imageKey}`;
    }

    const events = JSON.parse(localStorage.getItem('elcomdais_events') || '[]');
    const matchIdx = events.findIndex(e => e.id === localEvent.id);
    if (matchIdx !== -1) {
      events[matchIdx] = localEvent;
    } else {
      events.push(localEvent);
    }
    localStorage.setItem('elcomdais_events', JSON.stringify(events));

    // 2. Sync to Supabase in the background if connected
    if (supabase) {
      try {
        const fullPayload = {
          id: cleanEvent.id,
          title: cleanEvent.title || '',
          type: cleanEvent.type || 'Workshop',
          startDate: cleanEvent.startDate || null,
          endDate: cleanEvent.endDate || null,
          venue: cleanEvent.venue || '',
          capacity: cleanEvent.capacity || 50,
          coverImage: cleanEvent.coverImage || '',
          speaker: cleanEvent.speaker || '',
          description: cleanEvent.description || '',
          slug: cleanEvent.slug || '',
          isPublished: cleanEvent.isPublished !== undefined ? cleanEvent.isPublished : true,
          createdAt: cleanEvent.createdAt || new Date().toISOString(),
          updatedAt: cleanEvent.updatedAt || new Date().toISOString()
        };

        if (cleanEvent.faq) fullPayload.faq = cleanEvent.faq;
        if (cleanEvent.formFields) fullPayload.formFields = cleanEvent.formFields;
        if (cleanEvent.prerequisites) fullPayload.prerequisites = cleanEvent.prerequisites;

        let { error } = await supabase
          .from('events')
          .upsert(fullPayload);

        // If error occurs due to unknown columns (like type or capacity or bannerPosition), retry with ultra-minimal schema
        if (error) {
          console.warn('Supabase full payload upsert note (retrying with ultra-minimal schema):', error.message || error);
          const ultraMinimalPayload = {
            id: cleanEvent.id,
            title: cleanEvent.title || '',
            description: cleanEvent.description || '',
            venue: cleanEvent.venue || '',
            slug: cleanEvent.slug || ''
          };
          if (cleanEvent.startDate) ultraMinimalPayload.startDate = cleanEvent.startDate;
          if (cleanEvent.endDate) ultraMinimalPayload.endDate = cleanEvent.endDate;
          if (cleanEvent.coverImage && !cleanEvent.coverImage.startsWith('db:')) {
            ultraMinimalPayload.coverImage = cleanEvent.coverImage;
          }

          const retry = await supabase.from('events').upsert(ultraMinimalPayload);
          if (retry.error) {
            console.warn('Supabase ultra-minimal saveEvent note:', retry.error.message || retry.error);
          }
        }
      } catch (e) {
        console.warn('Supabase saveEvent sync failed, using local DB:', e);
      }
    }

    // Restore local image for immediate UI display
    if (localEvent.coverImage && localEvent.coverImage.startsWith('db:')) {
      const key = localEvent.coverImage.replace('db:', '');
      const dbImg = await getDBImage(key);
      if (dbImg) localEvent.coverImage = dbImg;
    }
    return localEvent;
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
      } catch (e) {
        console.warn('Supabase deleteEvent sync failed:', e);
      }
    }

    return true;
  },

  // --- REGISTRATIONS ---
  async getRegistrations() {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('*')
          .order('registeredAt', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getRegistrations failed, falling back to local DB', e);
      }
    }
    return JSON.parse(localStorage.getItem('elcomdais_registrations') || '[]');
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

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .insert(newReg)
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase registerForEvent failed, falling back to local DB', e);
      }
    }

    const regs = JSON.parse(localStorage.getItem('elcomdais_registrations') || '[]');
    regs.push(newReg);
    localStorage.setItem('elcomdais_registrations', JSON.stringify(regs));
    return newReg;
  },

  async saveRegistration(id, updatedData) {
    const regString = JSON.stringify(updatedData);
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .update({ data: regString })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase saveRegistration failed, falling back to local DB', e);
      }
    }

    const regs = JSON.parse(localStorage.getItem('elcomdais_registrations') || '[]');
    const idx = regs.findIndex(r => r.id === id);
    if (idx !== -1) {
      regs[idx].data = regString;
      localStorage.setItem('elcomdais_registrations', JSON.stringify(regs));
    }
    return true;
  },

  async deleteRegistration(id) {
    // 1. ALWAYS remove from local storage
    const regs = JSON.parse(localStorage.getItem('elcomdais_registrations') || '[]');
    const filtered = regs.filter(r => r.id !== id);
    localStorage.setItem('elcomdais_registrations', JSON.stringify(filtered));

    // 2. Delete from Supabase in background
    if (supabase) {
      try {
        await supabase.from('registrations').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteRegistration sync failed:', e);
      }
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

    // Clean up any legacy IndexedDB 'db:' image keys if resolution fails
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

    // Store images in IndexedDB to avoid exceeding browser localStorage 5MB quota
    const processNode = async (node, id) => {
      if (node.image && node.image.startsWith('data:')) {
        await saveDBImage(id, node.image);
        node.image = `db:${id}`;
      }
      if (node.members) {
        for (let i = 0; i < node.members.length; i++) {
          const sub = node.members[i];
          if (sub.image && sub.image.startsWith('data:')) {
            const subId = `${id}_sub_${i}`;
            await saveDBImage(subId, sub.image);
            sub.image = `db:${subId}`;
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

    // Sync full committeeData (with images) to Supabase settings table if connected
    if (supabase) {
      try {
        const { error } = await supabase
          .from('settings')
          .upsert({ key: 'committee', value: JSON.stringify(committeeData), updatedAt: new Date().toISOString() });
        if (error) {
          console.warn('Supabase saveCommittee note:', error.message || error);
        }
      } catch (e) {
        console.warn('Supabase saveCommittee sync failed, using local DB:', e);
      }
    }

    return committeeData;
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
