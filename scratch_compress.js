import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const sharp = require('sharp');

const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2bXFjZXRsb3Vwd2N2andrZXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NzczNzQsImV4cCI6MjEwMTU1MzM3NH0.87z1QnA89RgNbTBJvVKPWj-MxSMM6ACA1TF2z4axeag';

async function compressImage(base64Str, size = 250, quality = 70) {
  if (!base64Str || !base64Str.startsWith('data:image')) return base64Str;
  try {
    const parts = base64Str.split(',');
    if (parts.length < 2) return base64Str;
    const buf = Buffer.from(parts[1], 'base64');
    const compressedBuf = await sharp(buf)
      .resize(size, size, { fit: 'cover' })
      .jpeg({ quality, progressive: true })
      .toBuffer();
    return `data:image/jpeg;base64,${compressedBuf.toString('base64')}`;
  } catch (err) {
    console.error('Image compression error:', err.message);
    return base64Str;
  }
}

async function optimizeCommitteeData() {
  const res = await fetch('https://zvmqcetloupwcvjwkezd.supabase.co/rest/v1/settings?key=eq.committee&select=*', {
    headers: { 'apikey': key, 'Authorization': 'Bearer ' + key }
  });
  const data = await res.json();
  if (!data || data.length === 0) {
    console.log('No committee data found in Supabase.');
    return;
  }

  console.log('Original payload length:', data[0].value.length);
  const committeeObj = JSON.parse(data[0].value);

  // Compress faculty images
  if (committeeObj.faculty) {
    for (let f of committeeObj.faculty) {
      if (f.image) f.image = await compressImage(f.image, 250, 75);
    }
  }

  // Compress presidents images
  if (committeeObj.presidents) {
    for (let p of committeeObj.presidents) {
      if (p.image) p.image = await compressImage(p.image, 250, 75);
    }
  }

  // Compress core & sub-member images
  if (committeeObj.core) {
    for (let c of committeeObj.core) {
      if (c.image) c.image = await compressImage(c.image, 250, 75);
      if (c.members) {
        for (let m of c.members) {
          if (m.image) m.image = await compressImage(m.image, 100, 60);
        }
      }
    }
  }

  const newJsonStr = JSON.stringify(committeeObj);
  console.log('Compressed payload length:', newJsonStr.length);

  const upsertRes = await fetch('https://zvmqcetloupwcvjwkezd.supabase.co/rest/v1/settings', {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': 'Bearer ' + key,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify({
      key: 'committee',
      value: newJsonStr,
      updatedAt: new Date().toISOString()
    })
  });

  console.log('SUPABASE OPTIMIZED UPSERT STATUS:', upsertRes.status);
}

optimizeCommitteeData().catch(console.error);
