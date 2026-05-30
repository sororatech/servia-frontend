export const VIDEO_CONFIG = {
  MAX_DURATION: 60,
  MAX_SIZE: 50 * 1024 * 1024, 
  ALLOWED_TYPES: ['video/mp4', 'video/quicktime', 'video/webm'],
};

export function validateVideoFile(file: File): { isValid: boolean; error?: string } {
  if (!VIDEO_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return { isValid: false, error: 'Invalid format. Use MP4, MOV, or WEBM.' };
  }
  if (file.size > VIDEO_CONFIG.MAX_SIZE) {
    return { isValid: false, error: 'File exceeds 50MB limit.' };
  }
  return { isValid: true };
}

export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => reject(new Error('Failed to load video'));
    video.src = URL.createObjectURL(file);
  });
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}