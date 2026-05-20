// src/components/candidate/VideoRecord.tsx

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import { validateVideoFile, getVideoDuration, VIDEO_CONFIG } from '@/utils/videoUpload';

interface VideoRecordProps {
  onSave: () => void;
  onSkip: () => void;
}

type CameraState = 'idle' | 'active' | 'recording' | 'paused' | 'review';

export function VideoRecord({ onSave, onSkip }: VideoRecordProps) {
  const [state, setState] = useState<CameraState>('idle');
  const [duration, setDuration] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [candidateId, setCandidateId] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploading, progress, uploadVideo } = useVideoUpload();

  // Fetch candidate ID on mount
  useEffect(() => {
    const fetchId = async () => {
      try {
        const { api } = await import('@/lib/api');
        const res = await api.get('/users/profile/');
        setCandidateId(res.data.id || res.data.profile?.id || '');
      } catch (e) {
        console.error('Failed to fetch candidate ID', e);
      }
    };
    fetchId();
  }, []);

  // Cleanup on unmount
  useEffect(() => () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (recorderRef.current?.state !== 'inactive') {
      recorderRef.current.stop();
    }
  }, [videoUrl]);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setState('active');
    } catch {
      setError('Camera access denied. Please allow permissions in your browser.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  // ✅ DEFINE stopRecording EARLY so other callbacks can reference it
  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const pauseRecording = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      setState('paused');
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (recorderRef.current?.state === 'paused') {
      recorderRef.current.resume();
      let sec = duration;
      timerRef.current = setInterval(() => {
        sec++;
        setDuration(sec);
        if (sec >= VIDEO_CONFIG.MAX_DURATION) stopRecording();
      }, 1000);
      setState('recording');
    }
  }, [duration, stopRecording]);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    
    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') 
        ? 'video/webm;codecs=vp9,opus' 
        : 'video/webm'
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setVideoUrl(URL.createObjectURL(blob));
      setState('review');
      setDuration(0);
      stopCamera();
    };

    recorderRef.current = recorder;
    recorder.start(100);
    setState('recording');

    // Timer
    let sec = 0;
    timerRef.current = setInterval(() => {
      sec++;
      setDuration(sec);
      if (sec >= VIDEO_CONFIG.MAX_DURATION) {
        stopRecording();
      }
    }, 1000);
  }, [stopCamera]);

  const handleRetake = useCallback(() => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setDuration(0);
    setError(null);
    setState('active');
    startCamera();
  }, [videoUrl, startCamera]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    
    const v = validateVideoFile(file);
    if (!v.isValid) return setError(v.error || 'Invalid file');
    
    try {
      const dur = await getVideoDuration(file);
      if (dur > VIDEO_CONFIG.MAX_DURATION) return setError(`Max ${VIDEO_CONFIG.MAX_DURATION}s allowed`);
    } catch {
      return setError('Failed to read video metadata');
    }
    
    setUploadedFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setState('review');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('video/')) {
      handleFileUpload({ target: { files: [file] } } as React.ChangeEvent<HTMLInputElement>);
    } else {
      setError('Please drop a video file');
    }
  }, [handleFileUpload]);

  const handleSave = useCallback(async () => {
    const file = videoUrl && state === 'review' && uploadedFile 
      ? uploadedFile 
      : chunksRef.current.length > 0 
        ? new File(chunksRef.current, 'intro.webm', { type: 'video/webm' })
        : null;
        
    if (!file || !candidateId) return setError('No video or candidate ID found');
    const ok = await uploadVideo(file, candidateId);
    if (ok) onSave();
  }, [videoUrl, state, uploadedFile, candidateId, uploadVideo, onSave]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* LEFT: Camera & Controls */}
      <div className="space-y-4">
        <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          
          {state === 'idle' && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80">
              <div className="text-center text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Camera not active</p>
              </div>
            </div>
          )}

          {state !== 'idle' && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          )}

          {state === 'recording' && (
            <>
              <span className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-red-800/90 text-white text-xs font-medium rounded pointer-events-auto">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> REC
              </span>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white pointer-events-auto">
                <p className="text-xs opacity-80 mb-1">Max duration: 60s</p>
                <p className="text-3xl font-mono tracking-wider">{formatTime(duration)}</p>
              </div>
            </>
          )}

          {state === 'paused' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-auto">
              <div className="text-center text-white">
                <p className="text-xl font-semibold mb-1">Paused</p>
                <p className="text-2xl font-mono">{formatTime(duration)}</p>
              </div>
            </div>
          )}

          {state === 'review' && videoUrl && (
            <video src={videoUrl} controls className="w-full h-full object-cover" autoPlay />
          )}
        </div>

        {/* Dynamic Controls */}
        <div className="flex justify-center gap-3">
          {state === 'idle' && (
            <button onClick={startCamera} className="px-8 py-3 bg-[#26B9C8] text-white rounded-full font-medium hover:bg-[#26B9C8]/90 transition-colors">
              Start Camera
            </button>
          )}
          
          {state === 'active' && (
            <button onClick={startRecording} className="px-8 py-3 bg-[#26B9C8] text-white rounded-full font-medium hover:bg-[#26B9C8]/90 flex items-center gap-2 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><rect x="6" y="6" width="8" height="8" rx="1" /></svg>
              Start Recording
            </button>
          )}

          {state === 'recording' && (
            <>
              <button onClick={pauseRecording} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full font-medium hover:bg-gray-300 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                Pause
              </button>
              <button onClick={stopRecording} className="px-6 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><rect x="6" y="6" width="8" height="8" rx="1" /></svg>
                Stop
              </button>
            </>
          )}

          {state === 'paused' && (
            <>
              <button onClick={resumeRecording} className="px-6 py-3 bg-[#26B9C8] text-white rounded-full font-medium hover:bg-[#26B9C8]/90 flex items-center gap-2 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                Resume
              </button>
              <button onClick={stopRecording} className="px-6 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><rect x="6" y="6" width="8" height="8" rx="1" /></svg>
                Stop
              </button>
            </>
          )}

          {state === 'review' && (
            <button onClick={handleRetake} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full font-medium hover:bg-gray-300 transition-colors">
              Retake Video
            </button>
          )}
        </div>
      </div>

      {/* RIGHT: Upload Zone */}
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-1">Already have a video?</h3>
          <p className="text-sm text-gray-600 mb-4">Upload your pre-recorded introduction in MP4, MOV, or WEBM format.</p>
          
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#26B9C8] hover:bg-[#26B9C8]/5 transition-colors"
          >
            <input ref={fileInputRef} type="file" accept="video/mp4,video/quicktime,video/webm" onChange={handleFileUpload} className="hidden" />
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-[#26B9C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-gray-900 font-medium">Drop video here</p>
            <p className="text-sm text-[#26B9C8]">or click to browse files</p>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-2">QUICK CHECKLIST</p>
            <ul className="space-y-1.5 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#26B9C8]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Professional attire recommended
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#26B9C8]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Clear background
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#26B9C8]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Under 50MB file size
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleSave} 
            disabled={(!videoUrl && state !== 'review') || uploading} 
            className="w-full py-3 bg-[#26B9C8] text-white rounded-full font-medium hover:bg-[#26B9C8]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? `Uploading... ${progress?.percentage}%` : 'Save & Continue'}
          </button>
          <button 
            onClick={onSkip} 
            disabled={uploading} 
            className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Skip for now
          </button>
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      </div>
    </div>
  );
}