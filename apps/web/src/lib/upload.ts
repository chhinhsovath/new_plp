export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

export const MAX_FILE_SIZES = {
  image: 5 * 1024 * 1024, // 5MB
  audio: 10 * 1024 * 1024, // 10MB
  video: 50 * 1024 * 1024, // 50MB
  document: 10 * 1024 * 1024, // 10MB
};

export function getFileType(mimeType: string): 'image' | 'audio' | 'video' | 'document' | 'unknown' {
  if (ALLOWED_FILE_TYPES.images.includes(mimeType)) return 'image';
  if (ALLOWED_FILE_TYPES.audio.includes(mimeType)) return 'audio';
  if (ALLOWED_FILE_TYPES.video.includes(mimeType)) return 'video';
  if (ALLOWED_FILE_TYPES.documents.includes(mimeType)) return 'document';
  return 'unknown';
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  const fileType = getFileType(file.type);
  
  if (fileType === 'unknown') {
    return { valid: false, error: 'File type not supported' };
  }
  
  const maxSize = MAX_FILE_SIZES[fileType];
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File size exceeds limit (max ${maxSize / (1024 * 1024)}MB)` 
    };
  }
  
  return { valid: true };
}

export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.split('.').slice(0, -1).join('.');
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-');
  
  return `${sanitizedName}-${timestamp}-${random}.${extension}`;
}