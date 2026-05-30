export const MAX_CV_SIZE_BYTES = 10 * 1024 * 1024; 
export const MAX_CV_SIZE_MB = 10;

export const ALLOWED_FILE_TYPES = ['.pdf', '.doc', '.docx'];

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_FILE_TYPES.some(ext => file.name.toLowerCase().endsWith(ext))) {
    return { 
      valid: false, 
      error: `Invalid file type. Allowed: ${ALLOWED_FILE_TYPES.join(', ')}` 
    };
  }
  
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'File format not recognized. Please upload a valid PDF or Word document.' 
    };
  }
  
  if (file.size > MAX_CV_SIZE_BYTES) {
    return { 
      valid: false, 
      error: `File size exceeds ${MAX_CV_SIZE_MB}MB limit` 
    };
  }
  
  return { valid: true };
};

export const formatFileSize = (bytes: number): string => {
  return (bytes / 1024 / 1024).toFixed(2);
};


export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || 'pdf';
};

export const getUploadErrorMessage = (error: any): string => {
  if (error.response?.status === 401) return 'Session expired. Please login again.';
  if (error.response?.status === 413) return 'File too large. Please upload a smaller file.';
  if (error.response?.status === 400) return 'Invalid file format or data.';
  if (error.response?.status === 500) return 'Server error. Please try again later.';
  return error.message || 'Upload failed. Please try again.';
};