import { useState } from 'react';
import { api } from '@/lib/api';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export function useVideoUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadVideo = async (file: File, candidateId: string): Promise<boolean> => {
    setUploading(true);
    setError(null);

    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['mp4', 'webm', 'ogg', 'mov'];

    const isValidType = allowedTypes.includes(file.type) || file.type.startsWith('video/');
    const isValidExt = allowedExtensions.includes(fileExtension || '');

    if (!isValidType && !isValidExt) {
      setError('Invalid file type. Please upload a valid video file (MP4, WebM, MOV).');
      setUploading(false);
      return false;
    }

    setProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      const formData = new FormData();
      formData.append('video', file);

      await api.post(`/candidates/candidates/${candidateId}/upload-video/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) {
            setProgress({
              loaded: e.loaded,
              total: e.total,
              percentage: Math.round((e.loaded * 100) / e.total),
            });
          }
        },
      });

      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
      return false;
    } finally {
      setUploading(false);
    }
  };

  return { uploading, progress, error, uploadVideo };
}