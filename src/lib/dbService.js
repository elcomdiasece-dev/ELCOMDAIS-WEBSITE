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
    let rawEvents = null;
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('startDate', { ascending: true });
        if (!error && data) rawEvents = data;
      } catch (e) {
        console.warn('Supabase getEvents failed, falling back to local DB', e);
      }
    }
    if (!rawEvents) {
      rawEvents = JSON.parse(localStorage.getItem('elcomdais_events') || '[]');
    }

    for (let i = 0; i < rawEvents.length; i++) {
      const evt = rawEvents[i];
      if (evt.coverImage && evt.coverImage.startsWith('db:')) {
        const key = evt.coverImage.replace('db:', '');
        evt.coverImage = await getDBImage(key);
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
      evt.coverImage = await getDBImage(key);
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

    if (cleanEvent.coverImage && cleanEvent.coverImage.startsWith('data:')) {
      const imageKey = `event_image_${cleanEvent.id}`;
      await saveDBImage(imageKey, cleanEvent.coverImage);
      cleanEvent.coverImage = `db:${imageKey}`;
    }

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('events')
          .upsert(cleanEvent)
          .select()
          .single();
        if (!error && data) {
          if (data.coverImage && data.coverImage.startsWith('db:')) {
            const key = data.coverImage.replace('db:', '');
            data.coverImage = await getDBImage(key);
          }
          return data;
        }
      } catch (e) {
        console.warn('Supabase saveEvent failed, falling back to local DB', e);
      }
    }

    const events = JSON.parse(localStorage.getItem('elcomdais_events') || '[]');
    const matchIdx = events.findIndex(e => e.id === cleanEvent.id);
    if (matchIdx !== -1) {
      events[matchIdx] = cleanEvent;
    } else {
      events.push(cleanEvent);
    }
    localStorage.setItem('elcomdais_events', JSON.stringify(events));

    if (cleanEvent.coverImage && cleanEvent.coverImage.startsWith('db:')) {
      const key = cleanEvent.coverImage.replace('db:', '');
      cleanEvent.coverImage = await getDBImage(key);
    }
    return cleanEvent;
  },

  async deleteEvent(id) {
    if (supabase) {
      try {
        await supabase.from('events').delete().eq('id', id);
        await supabase.from('registrations').delete().eq('eventId', id);
        return true;
      } catch (e) {
        console.warn('Supabase deleteEvent failed, falling back to local DB', e);
      }
    }

    const events = JSON.parse(localStorage.getItem('elcomdais_events') || '[]');
    const filtered = events.filter(e => e.id !== id);
    localStorage.setItem('elcomdais_events', JSON.stringify(filtered));

    const regs = JSON.parse(localStorage.getItem('elcomdais_registrations') || '[]');
    const filteredRegs = regs.filter(r => r.eventId !== id);
    localStorage.setItem('elcomdais_registrations', JSON.stringify(filteredRegs));

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
    if (supabase) {
      try {
        await supabase.from('registrations').delete().eq('id', id);
        return true;
      } catch (e) {
        console.warn('Supabase deleteRegistration failed, falling back to local DB', e);
      }
    }

    const regs = JSON.parse(localStorage.getItem('elcomdais_registrations') || '[]');
    const filtered = regs.filter(r => r.id !== id);
    localStorage.setItem('elcomdais_registrations', JSON.stringify(filtered));
    return true;
  },

  // --- PHOTO GALLERY ---
  async getAlbums() {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('albums')
          .select('*')
          .order('createdAt', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getAlbums failed, falling back to local DB', e);
      }
    }
    return JSON.parse(localStorage.getItem('elcomdais_albums') || '[]');
  },

  async getAlbumImages(albumId) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('images')
          .select('*')
          .eq('albumId', albumId)
          .order('id', { ascending: true });
        if (!error && data) return data;
      } catch (e) {
        console.warn(`Supabase getAlbumImages (${albumId}) failed, falling back to IndexedDB`, e);
      }
    }

    try {
      const db = await initIndexedDB();
      return new Promise((resolve) => {
        const transaction = db.transaction('gallery_images', 'readonly');
        const store = transaction.objectStore('gallery_images');
        const index = store.index('albumId');
        const request = index.getAll(albumId);
        request.onsuccess = () => {
          resolve(request.result || []);
        };
        request.onerror = () => {
          resolve([]);
        };
      });
    } catch (err) {
      console.error('IndexedDB getAlbumImages failed:', err);
      return [];
    }
  },

  async createAlbum(albumData, fileUrls = []) {
    const albumId = `alb-${Date.now()}`;
    const newAlbum = {
      id: albumId,
      title: albumData.title,
      description: albumData.description,
      coverImage: fileUrls[0] || 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80',
      createdAt: albumData.createdAt || new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('albums')
          .insert(newAlbum)
          .select()
          .single();

        if (!error && data) {
          if (fileUrls.length > 0) {
            const imgObjs = fileUrls.map((url, idx) => ({
              albumId: data.id,
              url,
              caption: `Photo from ${data.title}`
            }));
            await supabase.from('images').insert(imgObjs);
          }
          return data;
        }
      } catch (e) {
        console.warn('Supabase createAlbum failed, falling back to local DB', e);
      }
    }

    const albums = JSON.parse(localStorage.getItem('elcomdais_albums') || '[]');
    albums.push(newAlbum);
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

    return newAlbum;
  },

  async saveAlbum(albumId, albumData, fileUrls = []) {
    const updatedAlbum = {
      id: albumId,
      title: albumData.title,
      description: albumData.description,
      coverImage: fileUrls[0] || 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80',
      createdAt: albumData.createdAt || new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('albums').upsert(updatedAlbum);
        await supabase.from('images').delete().eq('albumId', albumId);
        if (fileUrls.length > 0) {
          const imgObjs = fileUrls.map((url, idx) => ({
            albumId,
            url,
            caption: `Photo from ${albumData.title}`
          }));
          await supabase.from('images').insert(imgObjs);
        }
        return updatedAlbum;
      } catch (e) {
        console.warn('Supabase saveAlbum failed, falling back to local DB', e);
      }
    }

    const albums = JSON.parse(localStorage.getItem('elcomdais_albums') || '[]');
    const matchIdx = albums.findIndex(a => a.id === albumId);
    if (matchIdx !== -1) {
      albums[matchIdx] = updatedAlbum;
    } else {
      albums.push(updatedAlbum);
    }
    localStorage.setItem('elcomdais_albums', JSON.stringify(albums));

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

    return updatedAlbum;
  },

  async deleteAlbum(albumId) {
    if (supabase) {
      try {
        await supabase.from('albums').delete().eq('id', albumId);
        await supabase.from('images').delete().eq('albumId', albumId);
        return true;
      } catch (e) {
        console.warn('Supabase deleteAlbum failed, falling back to local DB', e);
      }
    }

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
        if (!error && data) rawData = JSON.parse(data.value);
      } catch (e) {
        console.warn('Supabase getCommittee failed, falling back to local DB', e);
      }
    }
    if (!rawData) {
      rawData = JSON.parse(localStorage.getItem('elcomdais_committee') || 'null');
    }
    if (!rawData) return null;

    // Restore images from IndexedDB
    const restoreNode = async (node, id) => {
      if (node.image && node.image.startsWith('db:')) {
        const key = node.image.replace('db:', '');
        node.image = await getDBImage(key);
      }
      if (node.members) {
        for (let i = 0; i < node.members.length; i++) {
          const sub = node.members[i];
          if (sub.image && sub.image.startsWith('db:')) {
            const key = sub.image.replace('db:', '');
            sub.image = await getDBImage(key);
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

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('settings')
          .upsert({ key: 'committee', value: JSON.stringify(cleanData), updatedAt: new Date().toISOString() })
          .select()
          .single();
        if (!error && data) return JSON.parse(data.value);
      } catch (e) {
        console.warn('Supabase saveCommittee failed, falling back to local DB', e);
      }
    }
    localStorage.setItem('elcomdais_committee', JSON.stringify(cleanData));
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
