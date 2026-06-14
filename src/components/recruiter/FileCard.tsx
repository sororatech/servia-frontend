'use client';

import { useState } from 'react';
import { FileText, Video, Download, FileImage, File } from 'lucide-react';

const getFileExtension = (filename: string): string => 
  filename.split('.').pop()?.toLowerCase() || '';

const isImageFile = (ext: string): boolean => 
  ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
const isPdfFile = (ext: string): boolean => ext === 'pdf';
const isVideoFile = (ext: string): boolean => 
  ['mp4', 'mov', 'webm', 'avi'].includes(ext);

interface FileCardProps {
  label: string;
  downloadUrl: string | null | undefined;
  fileName: string | null | undefined;
  fileType?: 'cv' | 'video';
}

export default function FileCard({ label, downloadUrl, fileName, fileType = 'cv' }: FileCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!downloadUrl || !fileName) {
    return (
      <div className="relative flex h-28 w-full sm:h-36 sm:w-44 flex-col items-center justify-center rounded-xl bg-[var(--color-neutral-disabled)] opacity-50 cursor-not-allowed">
        {fileType === 'cv' ? (
          <FileText className="h-10 w-10 text-[var(--color-foreground)]/30" />
        ) : (
          <Video className="h-10 w-10 text-[var(--color-foreground)]/30" />
        )}
        <span className="mt-2 text-xs text-[var(--color-foreground)]/50">{label}</span>
        <span className="absolute bottom-2 right-2">
          <Download className="h-4 w-4 text-[var(--color-foreground)]/30" />
        </span>
      </div>
    );
  }

  const ext = getFileExtension(fileName);
  const isVideo = isVideoFile(ext);

  const renderIcon = () => {
    if (isVideo) return <Video className="h-10 w-10 text-[var(--color-text-muted)]" />;
    if (isImageFile(ext)) return <FileImage className="h-10 w-10 text-[var(--color-text-muted)]" />;
    if (isPdfFile(ext)) return <FileText className="h-10 w-10 text-[var(--color-text-muted)]" />;
    return <File className="h-10 w-10 text-[var(--color-text-muted)]" />;
  };

    const handleDownload = () => {
    setIsLoading(true);
    try {
        window.open(downloadUrl, '_blank');
        setTimeout(() => setIsLoading(false), 1000);
    } catch {
        setError('Could not start download. Try right-click and save link as.');
        setIsLoading(false);
    }
    };

  return (
    <div className="group relative flex h-28 w-full sm:h-36 sm:w-44 flex-col items-center justify-center rounded-xl bg-[var(--color-neutral-disabled)] hover:shadow-md transition-all">
      {renderIcon()}
      <span className="mt-2 text-xs font-medium text-[var(--color-foreground)]/70 text-center px-2 truncate w-full">
        {fileName}
      </span>
      <div className="absolute bottom-2 right-2">
        <button
          onClick={handleDownload}
          disabled={isLoading}
          aria-label="Download"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-sm hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-colors"
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && (
        <div className="absolute -bottom-6 left-0 text-[10px] text-red-500 whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
}