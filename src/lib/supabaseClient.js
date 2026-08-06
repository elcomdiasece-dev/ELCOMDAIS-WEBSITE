import { createClient } from '@supabase/supabase-js';

let rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/^["']|["']$/g, '');
let rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim().replace(/^["']|["']$/g, '');

if (rawUrl && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
  rawUrl = `https://${rawUrl}`;
}

let client = null;
if (rawUrl && rawKey) {
  try {
    client = createClient(rawUrl, rawKey);
  } catch (e) {
    console.warn('Failed to initialize Supabase client:', e);
    client = null;
  }
}

export const supabase = client;

