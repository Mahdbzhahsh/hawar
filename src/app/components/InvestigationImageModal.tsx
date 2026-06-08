import React, { useState, useRef, useEffect } from 'react';
import { compressImage, formatBytes } from '@/lib/imageCompression';

interface InvestigationImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientId: string;
  initialImages?: string[];
  onSave?: (images: string[]) => void;
}

type ModalMode = 'selection' | 'camera';

interface ImageItem {
  id: string;
  src: string; // Base64 dataURL or R2 URL
  originalSize?: number;
  compressedSize?: number;
  percentageSaved?: number;
  isCompressing: boolean;
  isUploaded: boolean;
  isDeleting?: boolean;
  hasError?: boolean;
}

export default function InvestigationImageModal({
  isOpen,
  onClose,
  patientName,
  patientId,
  initialImages = [],
  onSave,
}: InvestigationImageModalProps) {
  const [mode, setMode] = useState<ModalMode>('selection');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with initial images from parent when modal opens
  useEffect(() => {
    if (isOpen) {
      const mapped = initialImages
        .filter((url) => url && url.trim() !== '')
        .map((url) => ({
          id: `initial-${Math.random().toString(36).substr(2, 9)}`,
          src: url,
          isCompressing: false,
          isUploaded: true,
        }));
      setImages(mapped);
    } else {
      stopCamera();
      setMode('selection');
    }
  }, [isOpen, initialImages]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (mode === 'camera' && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => console.error('Error playing video:', err));
    }
  }, [mode, stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setStream(mediaStream);
      setMode('camera');
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access camera. Please check permissions.');
    }
  };

  // Helper function to process and compress an image base64 string
  const processImageFile = async (base64Url: string) => {
    const tempId = `temp-${Math.random().toString(36).substr(2, 9)}`;

    // 1. Add to state with compressing status
    setImages((prev) => [
      ...prev,
      {
        id: tempId,
        src: base64Url,
        isCompressing: true,
        isUploaded: false,
      },
    ]);

    // 2. Perform intelligent compression
    const compressed = await compressImage(base64Url);

    // 3. Update state with compressed image data
    setImages((prev) =>
      prev.map((item) =>
        item.id === tempId
          ? {
              ...item,
              src: compressed.dataUrl,
              originalSize: compressed.originalSize,
              compressedSize: compressed.compressedSize,
              percentageSaved: compressed.percentageSaved,
              isCompressing: false,
            }
          : item
      )
    );
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        processImageFile(dataUrl);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          processImageFile(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Delete image function with warning for R2 uploaded files
  const removeImage = async (id: string, src: string) => {
    const isUploaded = src.startsWith('/api/images/');

    if (isUploaded) {
      const confirmDelete = window.confirm(
        "This image will be permanently deleted from Cloudflare R2 storage. This action cannot be undone.\n\nAre you sure you want to proceed?"
      );
      if (!confirmDelete) return;

      try {
        // Mark as deleting
        setImages((prev) =>
          prev.map((img) => (img.id === id ? { ...img, isDeleting: true } : img))
        );

        const filename = src.split('/').pop();
        const res = await fetch(`/api/images/${filename}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to delete from storage');
        }

        // Successfully deleted from R2, remove from local state
        const updatedImages = images.filter((img) => img.id !== id);
        setImages(updatedImages);

        // Propagate changes to parent immediately
        if (onSave) {
          onSave(updatedImages.map((img) => img.src));
        }
      } catch (err: any) {
        console.error('Error deleting image:', err);
        alert(`Error deleting image: ${err.message || 'Please try again.'}`);
        // Reset deleting state
        setImages((prev) =>
          prev.map((img) => (img.id === id ? { ...img, isDeleting: false } : img))
        );
      }
    } else {
      // Local unsaved base64 image, just filter out of state
      setImages((prev) => prev.filter((img) => img.id !== id));
    }
  };

  const handleSave = async () => {
    if (images.length === 0) {
      if (onSave) onSave([]);
      onClose();
      return;
    }

    try {
      setIsSaving(true);
      const imagePayload = images.map((img) => img.src);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: imagePayload,
          patientId: patientId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to upload images');
      }

      const data = await res.json();
      if (onSave) {
        onSave(data.urls);
      }
      onClose();
    } catch (err: any) {
      console.error('Error saving images:', err);
      alert(`Error saving images: ${err.message || 'Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const isCompressingAny = images.some((img) => img.isCompressing);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300">
      <div className="w-full max-w-3xl bg-[#090d16] border border-slate-800/80 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 flex justify-between items-center border-b border-slate-800/60 bg-[#090d16]">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl shadow-inner">
              <svg
                className="w-6 h-6 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight sm:text-xl">
                Investigation Attachments
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Patient: <span className="text-indigo-400 font-semibold">{patientName}</span>{' '}
                <span className="mx-1 text-slate-600">•</span> {formattedDate}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-800/60 border border-transparent hover:border-slate-800 rounded-full transition-all text-slate-400 hover:text-white"
            disabled={isSaving}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#04060b] overflow-hidden">
          {mode === 'selection' ? (
            <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
              {/* Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto w-full">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 hover:from-indigo-500/15 hover:to-purple-500/10 border border-indigo-500/20 hover:border-indigo-500/40 rounded-3xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98]"
                  disabled={isSaving}
                >
                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl mb-4 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-base font-extrabold text-slate-200">Open Media Gallery</span>
                  <span className="text-[11px] text-slate-500 mt-1 font-medium text-center">
                    Select JPEG, PNG, or PDF report captures
                  </span>
                </button>

                <button
                  type="button"
                  onClick={startCamera}
                  className="group relative flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 hover:from-emerald-500/15 hover:to-teal-500/10 border border-emerald-500/20 hover:border-emerald-500/40 rounded-3xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/5 active:scale-[0.98]"
                  disabled={isSaving}
                >
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-4 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-base font-extrabold text-slate-200">Launch Live Camera</span>
                  <span className="text-[11px] text-slate-500 mt-1 font-medium text-center">
                    Snap prescription or scan using camera
                  </span>
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept="image/*"
                className="hidden"
              />

              {/* Grid of Images */}
              {images.length > 0 && (
                <div className="space-y-3.5 pt-4">
                  <div className="flex items-center justify-between border-b border-slate-800/40 pb-2">
                    <h3 className="text-xs uppercase tracking-wider text-slate-400 font-extrabold">
                      Selected Images ({images.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((img) => (
                      <div
                        key={img.id}
                        className="relative group aspect-[4/5] rounded-2xl overflow-hidden border border-slate-850 bg-slate-900 shadow-md transition-all hover:border-slate-700"
                      >
                        {img.hasError ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-950/90 text-center">
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl mb-2 text-rose-400">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </div>
                            <span className="text-[11px] font-bold text-slate-200">Image Missing</span>
                            <span className="text-[9px] text-slate-500 mt-1 font-medium leading-relaxed">
                              Not found on Cloudflare R2
                            </span>
                          </div>
                        ) : (
                          <img
                            src={img.src}
                            className="w-full h-full object-cover"
                            alt="Investigation attachment preview"
                            onError={() => {
                              setImages((prev) =>
                                prev.map((item) =>
                                  item.id === img.id ? { ...item, hasError: true } : item
                                )
                              );
                            }}
                          />
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
                          {!img.isUploaded && img.percentageSaved !== undefined && img.percentageSaved > 0 ? (
                            <span className="bg-emerald-500/90 text-white font-extrabold text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-md shadow backdrop-blur-sm tracking-wide border border-emerald-400/20">
                              -{img.percentageSaved}% Saved
                            </span>
                          ) : (
                            !img.isUploaded && !img.isCompressing && (
                              <span className="bg-slate-700/80 text-white font-bold text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-md shadow backdrop-blur-sm tracking-wide border border-slate-600/20">
                                Original size
                              </span>
                            )
                          )}
                        </div>

                        {/* Deleting or Compressing Overlay */}
                        {(img.isCompressing || img.isDeleting) && (
                          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-[11px] text-indigo-400 font-bold z-20">
                            <svg className="animate-spin h-6 w-6 mb-2 text-indigo-500" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            <span>{img.isCompressing ? 'Compressing...' : 'Deleting from R2...'}</span>
                          </div>
                        )}

                        {/* Size statistics at the bottom */}
                        {!img.isCompressing && !img.isDeleting && img.compressedSize && (
                          <div className="absolute bottom-2 left-2 right-2 bg-slate-950/70 border border-slate-800/40 text-[9px] text-slate-300 text-center py-1 rounded-md backdrop-blur-sm">
                            {formatBytes(img.compressedSize)}
                          </div>
                        )}

                        {/* Hover delete trigger button */}
                        {!img.isCompressing && !img.isDeleting && (
                          <button
                            type="button"
                            onClick={() => removeImage(img.id, img.src)}
                            className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-500 text-white p-1.5 rounded-xl shadow-lg border border-rose-500/20 transition-all hover:scale-105 active:scale-90"
                            title="Delete Image"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Immersive Camera Interface */
            <div className="flex-1 flex flex-col relative bg-black overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover md:object-contain"
              />

              {/* Status Header overlay */}
              <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-black/60 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
                <span className="text-[10px] sm:text-xs font-bold text-white tracking-widest uppercase">Live Camera Feed</span>
              </div>

              {/* Camera Image Shelf overlay */}
              {images.length > 0 && (
                <div className="absolute top-4 right-4 z-10 bg-black/60 border border-white/10 px-3 py-2 rounded-2xl backdrop-blur-md flex items-center space-x-2">
                  <div className="flex -space-x-2 overflow-hidden">
                    {images.slice(-3).map((img, index) => (
                      <img
                        key={img.id}
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-950 object-cover"
                        src={img.src}
                        alt="Thumbnail"
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-white font-extrabold">{images.length} Snapped</span>
                </div>
              )}

              {/* Controls Overlays */}
              <div className="absolute inset-0 flex flex-col justify-end pointer-events-none">
                <div className="p-8 pb-10 flex items-center justify-between pointer-events-auto bg-gradient-to-t from-black/90 to-transparent">
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setMode('selection');
                    }}
                    className="p-4 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full transition-all border border-slate-700/80 backdrop-blur-md active:scale-90"
                    disabled={isSaving}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="w-20 h-20 bg-white hover:bg-indigo-50 rounded-full border-[6px] border-slate-800/80 transition-all flex items-center justify-center active:scale-[0.88] shadow-2xl relative"
                    disabled={isSaving}
                  >
                    <div className="w-12 h-12 bg-indigo-600 rounded-full hover:bg-indigo-500 shadow-inner transition-colors" />
                  </button>

                  <div className="w-14" /> {/* Balanced spacer */}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#090d16] border-t border-slate-800/60 z-10">
          <div className="text-xs sm:text-sm text-slate-400 font-medium text-center sm:text-left">
            <span className="text-indigo-400 font-bold mr-1">{images.length}</span> images attached
            {images.some((img) => img.originalSize) && (
              <span className="text-slate-500 text-[10px] sm:text-xs ml-2">
                (Optimized Total:{' '}
                {formatBytes(
                  images.reduce((sum, img) => sum + (img.compressedSize || img.originalSize || 0), 0)
                )}
                )
              </span>
            )}
          </div>
          <div className="flex w-full sm:w-auto space-x-3.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-3 text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-800"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isCompressingAny || isSaving}
              className="flex-1 sm:flex-none px-12 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-650/20 hover:shadow-indigo-650/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>SAVING...</span>
                </>
              ) : (
                <span>SAVE</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
