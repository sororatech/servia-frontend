import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { 
  validateFile, 
  formatFileSize, 
  getFileExtension, 
  getUploadErrorMessage,
  MAX_CV_SIZE_BYTES 
} from '@/utils/cvUpload';

export interface UseCVUploadReturn {
  cvFile: File | null;
  isDragging: boolean;
  uploadProgress: number;
  uploading: boolean;
  errorMessage: string | null;
  
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleSubmit: (e: React.FormEvent, applicationId: string | null) => Promise<void>;
  clearError: () => void;
  removeFile: () => void;  
  
  formatFileSize: (bytes: number) => string;
  isFileTooLarge: (file: File | null) => boolean;
}

export const useCVUpload = (): UseCVUploadReturn => {
  const router = useRouter();
  
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearError = useCallback(() => setErrorMessage(null), []);

  const removeFile = useCallback(() => {
    setCvFile(null);
    setErrorMessage(null);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setErrorMessage(validation.error || 'Invalid file');
        setCvFile(null);  
        return;
      }
      setCvFile(file);
      setErrorMessage(null);  
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    if (file) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setErrorMessage(validation.error || 'Invalid file');
        setCvFile(null);
        return;
      }
      setCvFile(file);
      setErrorMessage(null);
    }
  }, []);

  const handleSubmit = useCallback(async (
    e: React.FormEvent, 
    applicationId: string | null
  ) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!applicationId) {
      setErrorMessage('Application ID not found. Please restart the process.');
      return;
    }

    if (!cvFile) {
      setErrorMessage('Please select a CV file to upload.');
      return;
    }

    const validation = validateFile(cvFile);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file');
      setCvFile(null);
      return;
    }
    
    setUploading(true);
    setUploadProgress(10);

    try {
      const fileExtension = getFileExtension(cvFile.name);
      
      setUploadProgress(20);
      
      const urlResponse = await api.post(
        `/candidates/candidates/${applicationId}/upload-cv/`,
        { file_extension: fileExtension }
      );
      const urlData = urlResponse.data;

      setUploadProgress(40);

      const uploadResponse = await fetch(urlData.upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': urlData.content_type },
        body: cvFile,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload to R2: ${uploadResponse.status}`);
      }

      setUploadProgress(70);

      await api.post(
        `/candidates/candidates/${applicationId}/confirm-cv/`,
        { file_key: urlData.file_key, filename: cvFile.name },
        { timeout: 60000 }
      );

      setUploadProgress(100);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      router.push(`/candidate/application-success?applicationId=${applicationId}`);

    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_id');
        window.location.href = '/login';
        return;
      }
      
      setErrorMessage(getUploadErrorMessage(error));
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  }, [cvFile, router]);

  const isFileTooLarge = useCallback((file: File | null): boolean => {
    return file ? file.size > MAX_CV_SIZE_BYTES : false;
  }, []);

  return {
    cvFile,
    isDragging,
    uploadProgress,
    uploading,
    errorMessage,
    
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleSubmit,
    clearError,
    removeFile,  
    
    formatFileSize,
    isFileTooLarge,
  };
};