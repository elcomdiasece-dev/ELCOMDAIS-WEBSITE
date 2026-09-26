/**
 * Converts a HEIC/HEIF file to JPEG.
 *
 * Strategy:
 * 1. Try native browser decoding via ObjectURL (works on Safari / macOS Chrome).
 * 2. Fall back to libheif-js (WASM-based, works on all platforms including Windows Chrome).
 *
 * @param {File} file - The uploaded File object
 * @returns {Promise<File>} - A JPEG File, or the original file if conversion is not needed/fails.
 */

/** Check whether a file is HEIC/HEIF by MIME type, extension, or magic bytes. */
async function isHeicFile(file) {
  const name = (file.name || '').toLowerCase();
  const type = (file.type || '').toLowerCase();

  if (type.includes('heic') || type.includes('heif')) return true;
  if (name.endsWith('.heic') || name.endsWith('.heif')) return true;

  // Magic-byte check: bytes 4-11 should contain 'ftypheic', 'ftypheix', 'ftypmif1', etc.
  if (file.size > 12) {
    try {
      const buf = await file.slice(4, 12).arrayBuffer();
      const marker = String.fromCharCode(...new Uint8Array(buf));
      if (
        marker.includes('ftyp') &&
        (marker.includes('heic') || marker.includes('heix') ||
         marker.includes('mif1') || marker.includes('hevc') ||
         marker.includes('avif'))
      ) return true;
    } catch (_) {}
  }

  return false;
}

/** Load an image file into a canvas and return a JPEG base64 blob. */
function fileToJpegViaCanvas(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d').drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
        'image/jpeg',
        0.85
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });
}

/** Convert HEIC data (ArrayBuffer) to JPEG blobs using libheif-js WASM bundle (works in all browsers). */
async function decodeHeicWithLibheif(buffer) {
  // Use wasm-bundle: pre-bundled variant designed for browser bundlers (Vite/Webpack)
  const libheif = await import('libheif-js/wasm-bundle');
  const lib = libheif.default || libheif;

  const decoder = new lib.HeifDecoder();
  const data = decoder.decode(new Uint8Array(buffer));

  if (!data || data.length === 0) throw new Error('libheif decoded no images');

  const image = data[0];
  const width = image.get_width();
  const height = image.get_height();

  const imageData = await new Promise((resolve, reject) => {
    image.display(
      { data: new Uint8ClampedArray(width * height * 4), width, height },
      (displayData) => {
        if (!displayData) reject(new Error('libheif display() failed'));
        else resolve(displayData);
      }
    );
  });

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').putImageData(
    new ImageData(imageData.data, width, height),
    0, 0
  );

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas export failed'))),
      'image/jpeg',
      0.85
    )
  );
}

export async function convertHeicIfNeeded(file) {
  if (!file) return file;

  const heic = await isHeicFile(file);
  if (!heic) return file;

  const jpegName =
    (file.name || '').replace(/\.(heic|heif)$/i, '.jpg') ||
    `converted_${Date.now()}.jpg`;

  // --- Strategy 1: native browser decode (Safari, macOS Chrome) ---
  try {
    const blob = await fileToJpegViaCanvas(file);
    console.log('[HEIC] Native decode succeeded:', file.name);
    return new File([blob], jpegName, { type: 'image/jpeg', lastModified: Date.now() });
  } catch (_) {
    console.log('[HEIC] Native decode failed, trying libheif-js WASM...');
  }

  // --- Strategy 2: libheif-js WASM decoder (Windows Chrome, etc.) ---
  try {
    const buffer = await file.arrayBuffer();
    const blob = await decodeHeicWithLibheif(buffer);
    console.log('[HEIC] libheif-js decode succeeded:', file.name);
    return new File([blob], jpegName, { type: 'image/jpeg', lastModified: Date.now() });
  } catch (err) {
    console.error('[HEIC] libheif-js decode also failed:', err);
  }

  // --- Strategy 3: legacy heic2any (last resort) ---
  try {
    const { default: heic2any } = await import('heic2any');
    const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 });
    const blob = Array.isArray(result) ? result[0] : result;
    console.log('[HEIC] heic2any decode succeeded:', file.name);
    return new File([blob], jpegName, { type: 'image/jpeg', lastModified: Date.now() });
  } catch (err) {
    console.error('[HEIC] heic2any also failed:', err);
  }

  console.warn('[HEIC] All strategies failed — returning original file:', file.name);
  return file;
}
