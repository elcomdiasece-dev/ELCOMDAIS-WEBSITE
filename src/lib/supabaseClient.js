import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://zvmqcetloupwcvjwkezd.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2bXFjZXRsb3Vwd2N2andrZXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NzczNzQsImV4cCI6MjEwMTU1MzM3NH0.87z1QnA89RgNbTBJvVKPWj-MxSMM6ACA1TF2z4axeag';

let rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/^["']|["']$/g, '');
let rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim().replace(/^["']|["']$/g, '');

// Strictly validate that rawUrl is a valid Supabase project domain and not an API key
const isValidSupabaseUrl = (str) => {
  if (!str || typeof str !== 'string') return false;
  const s = str.toLowerCase();
  if (s.includes('sb_publishable') || s.includes('eyjhbgci') || s.includes('anon_key')) {
    return false;
  }
  if (!s.includes('.supabase.co') && !s.includes('.supabase.')) {
    return false;
  }
  return true;
};

if (!rawUrl) {
  rawUrl = FALLBACK_URL;
} else if (!isValidSupabaseUrl(rawUrl)) {
  console.warn('VITE_SUPABASE_URL is invalid. Falling back to project Supabase URL.');
  rawUrl = FALLBACK_URL;
}

if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
  rawUrl = `https://${rawUrl}`;
}

if (!rawKey) {
  rawKey = FALLBACK_KEY;
} else if (rawKey.startsWith('http') || rawKey.length < 20) {
  console.warn('VITE_SUPABASE_ANON_KEY is invalid. Falling back to project Supabase key.');
  rawKey = FALLBACK_KEY;
}

// Circuit breaker state to avoid hanging requests when Supabase is paused or unreachable
let isSupabaseOffline = false;
let offlineCooldownUntil = 0;
const READ_TIMEOUT_MS = 2500; // fast fallback for reads
const WRITE_TIMEOUT_MS = 30000; // writes carry base64 images; 2.5s would abort them

const resilientFetch = async (url, options = {}) => {
  const now = Date.now();
  if (isSupabaseOffline && now < offlineCooldownUntil) {
    throw new Error('Supabase client is temporarily offline due to previous timeout.');
  }

  const controller = new AbortController();
  const method = (options.method || 'GET').toUpperCase();
  const timeoutMs = method === 'GET' || method === 'HEAD' ? READ_TIMEOUT_MS : WRITE_TIMEOUT_MS;
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  if (options.signal) {
    if (options.signal.aborted) {
      clearTimeout(timer);
      controller.abort();
    } else {
      options.signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    isSupabaseOffline = false;
    return response;
  } catch (err) {
    // If request timed out, aborted, or had a network failure, trip circuit breaker for 30s
    if (err.name === 'AbortError' || err.message?.includes('abort') || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
      isSupabaseOffline = true;
      offlineCooldownUntil = Date.now() + 30000;
      console.warn('Supabase cloud service timed out or is unreachable. Falling back immediately to local storage / IndexedDB.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
};

let client = null;
if (rawUrl && rawKey) {
  try {
    client = createClient(rawUrl, rawKey, {
      global: {
        fetch: resilientFetch
      }
    });
  } catch (e) {
    console.warn('Failed to initialize Supabase client:', e);
    client = null;
  }
}

export const supabase = client;




