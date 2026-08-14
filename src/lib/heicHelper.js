/**
 * Checks if a File or Blob is HEIC/HEIF format and converts it to JPEG format if necessary.
 * Dynamically imports heic2any only when a HEIC file is detected for optimal bundle performance.
 * 
 * @param {File} file - The uploaded File object
 * @returns {Promise<File>} - A promise that resolves to a JPEG File or original File
 */
export async function convertHeicIfNeeded(file) {
  if (!file) return file;

  const fileName = file.name || '';
  const fileType = file.type || '';
  const isHeic = 
    fileType.toLowerCase().includes('heic') || 
    fileType.toLowerCase().includes('heif') || 
    fileName.toLowerCase().endsWith('.heic') || 
    fileName.toLowerCase().endsWith('.heif');

  if (!isHeic) {
    return file;
  }

  try {
    console.log('Converting HEIC/HEIF image to JPEG format:', fileName);
    const { default: heic2any } = await import('heic2any');
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.85
    });

    const singleBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    const newFileName = fileName.replace(/\.(heic|heif)$/i, '.jpg');
    
    return new File([singleBlob], newFileName, {
      type: 'image/jpeg',
      lastModified: Date.now()
    });
  } catch (error) {
    console.error('Error converting HEIC image:', error);
    return file;
  }
}
