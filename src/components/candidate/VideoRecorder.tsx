'use client';

import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import { validateVideoFile, getVideoDuration, VIDEO_CONFIG } from '@/utils/videoUpload';

interface VideoRecordProps {
  onSave: () => void;
  onSkip: () => void;
  hasUploadedVideo: boolean;
  onHasVideoChange: (hasVideo: boolean) => void;
  onUploadedFileChange: (file: File | null, previewUrl: string | null) => void;
}

export interface VideoRecordHandle {
  handleFileUpload: (file: File) => Promise<void>;
  handleSave: () => Promise<void>;
  isUploading: boolean;
  clearUpload: () => void;
  clearRecording: () => void;
  hasRecordedVideo: boolean;
}

export const VideoRecord = forwardRef<VideoRecordHandle, VideoRecordProps>(
  ({ onSave, onSkip, hasUploadedVideo, onHasVideoChange, onUploadedFileChange }, ref) => {
    const [state, setState] = useState<'idle' | 'active' | 'recording' | 'paused' | 'review'>('idle');
    const [duration, setDuration] = useState(0);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [candidateId, setCandidateId] = useState('');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [hasRecordedVideo, setHasRecordedVideo] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    
    const objectUrlsRef = useRef<Set<string>>(new Set());

    const { uploading, progress, uploadVideo } = useVideoUpload();

    useEffect(() => {
      const fetchCandidateUuid = async () => {
        try {
          const { api } = await import('@/lib/api');
          const res = await api.get('/candidates/my-applications/');
          const applications = res.data.results || res.data;
          
          if (applications && applications.length > 0) {
            const candidateUuid = applications[0].id;
            setCandidateId(candidateUuid);
          } else {
            setError('No active application found.');
          }
        } catch {
          setError('Failed to load application data.');
        }
      };
      fetchCandidateUuid();
    }, []);

    useEffect(() => {
      return () => {
        objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
        objectUrlsRef.current.clear();
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }
        if (timerRef.current) clearInterval(timerRef.current);
        if (recorderRef.current && recorderRef.current.state !== 'inactive') {
          recorderRef.current.stop();
        }
      };
    }, []);

    useEffect(() => {
      if (state === 'recording' && videoRef.current && streamRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }, [state]);

    const revokeTrackedUrl = (url: string | null) => {
      if (url && objectUrlsRef.current.has(url)) {
        URL.revokeObjectURL(url);
        objectUrlsRef.current.delete(url);
      }
    };

    const clearUpload = useCallback(() => {
      if (uploadedFile) {
        onUploadedFileChange(null, null);
      }
      setUploadedFile(null);
      setError(null);
      onHasVideoChange(false);
    }, [uploadedFile, onUploadedFileChange, onHasVideoChange]);

    const clearRecording = useCallback(() => {
      revokeTrackedUrl(videoUrl);
      setVideoUrl(null);
      chunksRef.current = [];
      setDuration(0);
      setError(null);
      setHasRecordedVideo(false);
      setState('idle');
      onHasVideoChange(false);
    }, [videoUrl, onHasVideoChange]);

    const startCamera = useCallback(async () => {
      if (hasUploadedVideo) {
        setError('Please remove the uploaded video first to record.');
        return;
      }

      setHasRecordedVideo(false);
      onHasVideoChange(false);
      
      try {
        setError(null);
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }, 
          audio: true 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          await videoRef.current.play().catch(() => {});
        }
        setState('active');
      } catch {
        setError('Camera access denied. Please allow permissions.');
      }
    }, [hasUploadedVideo, onHasVideoChange]);

    const stopCamera = useCallback(() => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    }, []);

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
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm'
      });
      recorder.ondataavailable = (e) => { 
        if (e.data.size > 0) chunksRef.current.push(e.data); 
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        objectUrlsRef.current.add(url); 
        setVideoUrl(url);
        setState('review');
        setDuration(0);
        setHasRecordedVideo(true);
        onHasVideoChange(true);
        stopCamera();
      };
      recorderRef.current = recorder;
      recorder.start(100);
      setState('recording');
      let sec = 0;
      timerRef.current = setInterval(() => {
        sec++;
        setDuration(sec);
        if (sec >= VIDEO_CONFIG.MAX_DURATION) stopRecording();
      }, 1000);
    }, [stopCamera, stopRecording, onHasVideoChange]);

    const handleRetake = useCallback(() => {
      revokeTrackedUrl(videoUrl);
      setVideoUrl(null);
      setDuration(0);
      setError(null);
      setHasRecordedVideo(false);
      setState('active');
      startCamera();
    }, [videoUrl, startCamera]);

    const handleFileUploadInternal = useCallback(async (file: File) => {
      if (hasRecordedVideo) {
        setError('Please remove the recorded video first to upload.');
        return;
      }
      
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
      const previewUrl = URL.createObjectURL(file);
      objectUrlsRef.current.add(previewUrl); 
      onUploadedFileChange(file, previewUrl);
    }, [hasRecordedVideo, onUploadedFileChange]);

    const handleSaveInternal = useCallback(async () => {
      const file = uploadedFile || (chunksRef.current.length > 0 ? new File(chunksRef.current, 'intro.webm', { type: 'video/webm' }) : null);
      
      if (!file) {
        return setError('Please record or upload a video first.');
      }

      if (!candidateId) {
        return setError('Candidate ID not found. Please refresh the page.');
      }

      try {
        const success = await uploadVideo(file, candidateId);
        
        if (success) {
          onSave();
        } else {
          setError('Upload failed. Check console for details.');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Unexpected upload error.');
      }
    }, [uploadedFile, candidateId, uploadVideo, onSave]);

    useImperativeHandle(ref, () => ({
      handleFileUpload: handleFileUploadInternal,
      handleSave: handleSaveInternal,
      isUploading: uploading,
      clearUpload,
      clearRecording,
      hasRecordedVideo
    }));

    const formatTime = (s: number) => {
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60);
      return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    return (
      <div className="space-y-4">
        <div className={`relative aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-lg ${hasUploadedVideo ? 'opacity-50' : ''}`}>
          
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover ${state === 'idle' || state === 'review' || hasUploadedVideo ? 'hidden' : ''}`}
          />
          
          {state === 'review' && videoUrl && !hasUploadedVideo && (
            <video 
              src={videoUrl} 
              className="w-full h-full object-cover" 
              playsInline 
              controls
            />
          )}
          
          {state === 'idle' && !hasUploadedVideo && !videoUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80">
              <div className="text-center text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Camera not active</p>
              </div>
            </div>
          )}

          {state === 'recording' && (
            <>
              <span className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-red-800/90 text-white text-xs font-medium rounded">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> REC
              </span>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white">
                <p className="text-xs opacity-80 mb-1">Max duration: 60s</p>
                <p className="text-3xl font-mono tracking-wider">{formatTime(duration)}</p>
              </div>
            </>
          )}

          {state === 'paused' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="text-center text-white">
                <p className="text-xl font-semibold mb-1">Paused</p>
                <p className="text-2xl font-mono">{formatTime(duration)}</p>
              </div>
            </div>
          )}

          {hasUploadedVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm rounded-xl">
              <div className="text-center text-white p-6">
                <svg className="w-12 h-12 mx-auto mb-3 text-[#26B9C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-semibold mb-1">Video Uploaded</p>
                <p className="text-sm text-gray-300">Remove uploaded video to record</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-3">
          {state === 'idle' && !videoUrl && (
            <button 
              onClick={startCamera} 
              disabled={hasUploadedVideo}
              className="px-8 py-3 bg-[#26B9C8] text-white rounded-full font-medium hover:bg-[#26B9C8]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              Start Camera
            </button>
          )}
          {state === 'active' && (
            <button 
              onClick={startRecording} 
              className="px-8 py-3 bg-[#26B9C8] text-white rounded-full font-medium hover:bg-[#26B9C8]/90 flex items-center gap-2 transition-colors shadow-md"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><rect x="6" y="6" width="8" height="8" rx="1" /></svg>
              Start Recording
            </button>
          )}
          {state === 'recording' && (
            <>
              <button onClick={pauseRecording} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full font-medium hover:bg-gray-300">Pause</button>
              <button onClick={stopRecording} className="px-6 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700">Stop</button>
            </>
          )}
          {state === 'paused' && (
            <>
              <button onClick={resumeRecording} className="px-6 py-3 bg-[#26B9C8] text-white rounded-full font-medium hover:bg-[#26B9C8]/90">Resume</button>
              <button onClick={stopRecording} className="px-6 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700">Stop</button>
            </>
          )}
          {state === 'review' && videoUrl && (
            <>
              <button 
                onClick={handleRetake} 
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full font-medium hover:bg-gray-300"
              >
                Retake
              </button>
              <button 
                onClick={clearRecording}
                className="px-6 py-3 bg-red-100 text-red-700 rounded-full font-medium hover:bg-red-200 transition-colors"
              >
                Remove
              </button>
            </>
          )}
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      </div>
    );
  }
);