import React, { useState, useRef, useEffect } from 'react';

interface InvestigationImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientId: string;
}

type ModalMode = 'selection' | 'camera';

export default function InvestigationImageModal({
  isOpen,
  onClose,
  patientName,
  patientId
}: InvestigationImageModalProps) {
  const [mode, setMode] = useState<ModalMode>('selection');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setMode('selection');
    }
  }, [isOpen]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (mode === 'camera' && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => console.error("Error playing video:", err));
    }
  }, [mode, stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: false 
      });
      setStream(mediaStream);
      setMode('camera');
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
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
        setSelectedImages(prev => [...prev, dataUrl]);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  const formattedDate = new Date().toLocaleDateString('en-US');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md transition-opacity duration-300">
      <div className="w-full max-w-2xl bg-[#0f172a] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 flex justify-between items-center border-b border-gray-800 bg-[#0f172a] z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Investigation Images</h2>
              <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
                {patientName} <span className="mx-1 text-indigo-500">·</span> {formattedDate}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-all text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#020617] relative">
          {mode === 'selection' ? (
            <div className="flex-1 flex flex-col p-6 items-center justify-center overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-lg">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex flex-col items-center justify-center p-6 sm:p-10 bg-[#1e293b] hover:bg-[#334155] border border-gray-700/50 rounded-[2rem] transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 active:scale-95"
                >
                  <div className="p-4 bg-indigo-500/10 rounded-2xl mb-4 text-indigo-400 group-hover:scale-110 transition-transform">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base font-bold text-gray-200">Gallery</span>
                </button>

                <button 
                  onClick={startCamera}
                  className="group flex flex-col items-center justify-center p-6 sm:p-10 bg-[#1e293b] hover:bg-[#334155] border border-gray-700/50 rounded-[2rem] transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 active:scale-95"
                >
                  <div className="p-4 bg-indigo-500/10 rounded-2xl mb-4 text-indigo-400 group-hover:scale-110 transition-transform">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base font-bold text-gray-200">Camera</span>
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
            </div>
          ) : (
            <div className="flex-1 flex flex-col relative bg-black overflow-hidden">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover sm:object-contain"
              />
              
              {/* Camera Controls Layer */}
              <div className="absolute inset-0 flex flex-col justify-end pointer-events-none">
                <div className="p-8 pb-12 flex items-center justify-between pointer-events-auto bg-gradient-to-t from-black/80 to-transparent">
                  <button 
                    onClick={() => { stopCamera(); setMode('selection'); }}
                    className="p-4 bg-gray-900/80 hover:bg-gray-800 text-white rounded-full transition-all border border-gray-700 backdrop-blur-md active:scale-90"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <button 
                    onClick={capturePhoto}
                    className="w-20 h-20 bg-white hover:bg-indigo-50 rounded-full border-4 border-gray-300 transition-all flex items-center justify-center active:scale-90 group"
                  >
                    <div className="w-16 h-16 rounded-full border-2 border-gray-200" />
                  </button>
                  
                  <div className="w-14" /> {/* Balanced spacer */}
                </div>
              </div>
            </div>
          )}

          {/* Floating Image Previews - Overlay strictly above controls if space is tight */}
          {selectedImages.length > 0 && (
            <div className={`p-4 ${mode === 'camera' ? 'absolute bottom-[130px] left-0 right-0 z-20 pointer-events-none' : 'bg-[#111827] border-t border-gray-800'}`}>
              <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none pointer-events-auto">
                {selectedImages.map((src, idx) => (
                  <div key={idx} className="relative flex-shrink-0 group">
                    <img 
                      src={src} 
                      className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-xl border-2 border-indigo-500 shadow-xl shadow-black/40 bg-gray-900" 
                      alt={`Capture ${idx}`} 
                    />
                    <button 
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#0f172a] border-t border-gray-800 z-10">
          <div className="text-xs sm:text-sm text-gray-400 font-medium">
            <span className="text-indigo-400 font-bold mr-1">{selectedImages.length}</span> images ready to upload
          </div>
          <div className="flex w-full sm:w-auto space-x-3">
            <button 
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-3 text-sm font-bold text-gray-400 hover:text-white hover:bg-gray-800 rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button 
              disabled={selectedImages.length === 0}
              className="flex-1 sm:flex-none px-10 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              SAVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
