// src/hooks/useVideoUpload.ts

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