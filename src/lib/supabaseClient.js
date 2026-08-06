import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://zvmqcetloupwcvjwkezd.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2bXFjZXRsb3Vwd2N2andrZXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NzczNzQsImV4cCI6MjEwMTU1MzM3NH0.87z1QnA89RgNbTBJvVKPWj-MxSMM6ACA1TF2z4axeag';

let rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/^["']|["']$/g, '');
let rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim().replace(/^["']|["']$/g, '');

// Validate if rawUrl is actually a hostname/URL and not an anon key pasted by mistake
const isValidSupabaseUrl = (str) => {
  if (!str || str.startsWith('sb_') || str.startsWith('eyJ') || !str.includes('.')) {
    return false;
  }
  return true;
};

if (!isValidSupabaseUrl(rawUrl)) {
  console.warn('VITE_SUPABASE_URL is invalid or misconfigured. Using project Supabase URL.');
  rawUrl = FALLBACK_URL;
}

if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
  rawUrl = `https://${rawUrl}`;
}

if (!rawKey || rawKey.startsWith('http')) {
  rawKey = FALLBACK_KEY;
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


