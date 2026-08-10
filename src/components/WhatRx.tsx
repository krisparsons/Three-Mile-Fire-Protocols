import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Pill, 
  ShieldAlert, 
  Sparkles, 
  AlertTriangle, 
  RefreshCw, 
  HelpCircle, 
  PhoneCall, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Stethoscope, 
  BookOpen, 
  Activity, 
  CornerDownRight,
  Camera,
  Upload
} from 'lucide-react';

interface DrugInfo {
  brandName: string;
  genericName: string;
  drugClass: string;
  primaryIndication: string;
  emergencyImplications: string;
  standardDosing: string;
  sideEffects: string[];
  contraindications: string[];
  visualDescription: string;
}

interface PillInfo {
  identified: boolean;
  brandName: string;
  genericName: string;
  drugClass: string;
  strength: string;
  emergencyImplications: string;
  descriptionConfirmed: string;
  warningLabel: string;
}

interface InteractionInfo {
  hasInteraction: boolean;
  riskLevel: 'High' | 'Moderate' | 'Low/None' | string;
  severitySummary: string;
  mechanism: string;
  emsActionableGuidance: string;
  dangerousOverlaps: string[];
}

interface PhotoScanResult {
  identified: boolean;
  medications: Array<{
    brandName: string;
    genericName: string;
    drugClass: string;
    strength: string;
    confidence: string;
    emergencyImplications: string;
    description: string;
  }>;
  overallClinicalWarning: string;
}

export default function WhatRx() {
  const [activeMode, setActiveMode] = useState<'info' | 'pill' | 'interactions'>('info');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Photo Scan specific states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Result States
  const [drugResult, setDrugResult] = useState<DrugInfo | null>(null);
  const [pillResult, setPillResult] = useState<PillInfo | null>(null);
  const [interactionResult, setInteractionResult] = useState<InteractionInfo | null>(null);
  const [scanResult, setScanResult] = useState<PhotoScanResult | null>(null);

  // Clean up camera on switch or unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setIsCameraActive(true);
    setSelectedImage(null);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setError("Could not access your device camera. Please upload an image instead, or ensure camera permissions are allowed.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const MAX_DIMENSION = 1024;
  const JPEG_QUALITY = 0.7;

  const resizeImage = (source: CanvasImageSource, sourceWidth: number, sourceHeight: number): string => {
    let width = sourceWidth;
    let height = sourceHeight;

    if (width > height && width > MAX_DIMENSION) {
      height = Math.round((height * MAX_DIMENSION) / width);
      width = MAX_DIMENSION;
    } else if (height > MAX_DIMENSION) {
      width = Math.round((width * MAX_DIMENSION) / height);
      height = MAX_DIMENSION;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(source, 0, 0, width, height);
    }
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const width = videoRef.current.videoWidth || 640;
      const height = videoRef.current.videoHeight || 480;
      const dataUrl = resizeImage(videoRef.current, width, height);
      setSelectedImage(dataUrl);
      stopCamera();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const dataUrl = resizeImage(img, img.width, img.height);
      setSelectedImage(dataUrl);
      stopCamera();
    };
    img.src = URL.createObjectURL(file);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const isScanningPhoto = !!selectedImage;
    if (!isScanningPhoto && !query.trim()) return;

    setIsLoading(true);
    setError(null);
    setDrugResult(null);
    setPillResult(null);
    setInteractionResult(null);
    setScanResult(null);

    try {
      const response = await fetch('https://three-mile-fire-department.vercel.app/api/rx/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: isScanningPhoto ? 'image-analysis' : query.trim(),
          type: isScanningPhoto ? 'scan' : activeMode,
          image: isScanningPhoto ? selectedImage : undefined
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch medical intelligence.');
      }

      const data = await response.json();
      
      if (isScanningPhoto) {
        setScanResult(data);
      } else if (activeMode === 'info') {
        setDrugResult(data);
      } else if (activeMode === 'pill') {
        setPillResult(data);
      } else if (activeMode === 'interactions') {
        setInteractionResult(data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while analyzing the database.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (mode: 'info' | 'pill' | 'interactions') => {
    setActiveMode(mode);
    setQuery('');
    setError(null);
    setDrugResult(null);
    setPillResult(null);
    setInteractionResult(null);
    setScanResult(null);
    setSelectedImage(null);
    stopCamera();
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const loadExample = (ex: string) => {
    setQuery(ex);
  };

  return (
    <div className="space-y-6" id="what-rx-tool">
      {/* Header Panel */}
      <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-3xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <Pill className="w-6 h-6 text-red-600 shrink-0" />
              What RX? — Integrated Medical Intelligence
            </h2>
            <p className="text-xs text-zinc-500 dark:text-white/40 mt-1">
              Live server-side clinical search and pharmaceutical lookups. No external tabs required.
            </p>
          </div>
          <a
            href="tel:18002221222"
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all shrink-0 text-xs"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Poison Control: 1-800-222-1222</span>
          </a>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 bg-zinc-100 dark:bg-white/5 p-1 rounded-xl mt-6">
          <button
            type="button"
            onClick={() => handleModeChange('info')}
            className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              activeMode === 'info'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Drug Search</span>
            <span className="sm:hidden">Search</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('pill')}
            className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              activeMode === 'pill'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pill ID</span>
            <span className="sm:hidden">Pill ID</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('interactions')}
            className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              activeMode === 'interactions'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Interactions</span>
            <span className="sm:hidden">Interactions</span>
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="mt-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder={
                selectedImage 
                  ? "Medication photo loaded. Click Analyze to identify."
                  : activeMode === 'info'
                  ? "ENTER BRAND OR GENERIC NAME (e.g. Metoprolol, Lisinopril, Percocet)..."
                  : activeMode === 'pill'
                  ? "ENTER PILL IMPRINT, MARKING, COLOR, OR SHAPE (e.g. 'IP 203 white oval', 'M367')..."
                  : "ENTER MULTIPLE MEDS SPLIT BY COMMAS (e.g. Warfarin, Aspirin, Ibuprofen)..."
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={!!selectedImage}
              className="w-full bg-zinc-50 dark:bg-black/30 border-2 border-zinc-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-red-600/10 focus:border-red-600 transition-all text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/20 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Camera Scan Panel (Shows inline when camera is active or image is captured/uploaded) */}
          {(isCameraActive || selectedImage) && (
            <div className="border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden bg-zinc-50 dark:bg-black/30 p-4">
              {isCameraActive ? (
                <div className="relative aspect-video w-full max-w-lg mx-auto bg-black rounded-xl overflow-hidden border border-zinc-250 dark:border-white/5">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-red-600/30 rounded-xl pointer-events-none">
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-red-600"></div>
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-red-600"></div>
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-red-600"></div>
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-red-600"></div>
                    <div className="absolute inset-x-0 top-1/2 h-[1px] bg-red-600/30 animate-pulse"></div>
                  </div>
                  <div className="absolute bottom-3 inset-x-0 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase px-4 py-2 rounded-lg shadow-lg active:scale-95 transition-all"
                    >
                      Capture Photo
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white font-black text-xs uppercase px-4 py-2 rounded-lg shadow-lg active:scale-95 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : selectedImage ? (
                <div className="space-y-4 text-center">
                  <div className="relative inline-block max-w-xs mx-auto rounded-xl overflow-hidden border border-zinc-250 dark:border-white/5 bg-zinc-950">
                    <img src={selectedImage} alt="Selected medication" className="max-h-60 w-auto mx-auto object-contain" />
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full transition-all"
                    >
                      <XCircle className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                  <div className="flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-black text-xs uppercase px-4 py-2 rounded-lg transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Retake
                    </button>
                    <label className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-black text-xs uppercase px-4 py-2 rounded-lg cursor-pointer transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      Change File
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Rapid Examples */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[9px] font-mono uppercase text-zinc-400 font-black">Examples:</span>
              {activeMode === 'info' && (
                <>
                  <button type="button" onClick={() => loadExample('Metformin')} className="px-2 py-0.5 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-md text-[9px] font-mono font-bold text-zinc-600 dark:text-zinc-300">Metformin</button>
                  <button type="button" onClick={() => loadExample('Fentanyl')} className="px-2 py-0.5 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-md text-[9px] font-mono font-bold text-zinc-600 dark:text-zinc-300">Fentanyl</button>
                  <button type="button" onClick={() => loadExample('Eliquis')} className="px-2 py-0.5 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-md text-[9px] font-mono font-bold text-zinc-600 dark:text-zinc-300">Eliquis</button>
                </>
              )}
              {activeMode === 'pill' && (
                <>
                  <button type="button" onClick={() => loadExample('IP 203 white round')} className="px-2 py-0.5 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-md text-[9px] font-mono font-bold text-zinc-600 dark:text-zinc-300">IP 203</button>
                  <button type="button" onClick={() => loadExample('M367')} className="px-2 py-0.5 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-md text-[9px] font-mono font-bold text-zinc-600 dark:text-zinc-300">M 367</button>
                  <button type="button" onClick={() => loadExample('Watson 853')} className="px-2 py-0.5 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-md text-[9px] font-mono font-bold text-zinc-600 dark:text-zinc-300">Watson 853</button>
                </>
              )}
              {activeMode === 'interactions' && (
                <>
                  <button type="button" onClick={() => loadExample('Warfarin, Aspir')} className="px-2 py-0.5 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-md text-[9px] font-mono font-bold text-zinc-600 dark:text-zinc-300">Warfarin + Aspirin</button>
                  <button type="button" onClick={() => loadExample('Sildenafil, Nitroglycerin')} className="px-2 py-0.5 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-md text-[9px] font-mono font-bold text-zinc-600 dark:text-zinc-300">Viagra + Nitroglycerin</button>
                </>
              )}
            </div>

            <div className="flex gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={isCameraActive ? stopCamera : startCamera}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 font-black uppercase tracking-wider py-3 px-4 rounded-xl shadow-lg transition-all text-xs active:scale-95 ${
                  isCameraActive || selectedImage
                    ? 'bg-amber-600 text-white hover:bg-amber-500'
                    : 'bg-zinc-200 dark:bg-white/5 hover:bg-zinc-300 dark:hover:bg-white/10 text-zinc-800 dark:text-white'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Live Camera</span>
              </button>

              <button
                type="submit"
                disabled={isLoading || (!query.trim() && !selectedImage)}
                className="flex-2 sm:flex-initial flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:bg-zinc-200 dark:disabled:bg-white/5 disabled:text-zinc-400 dark:disabled:text-white/20 text-white font-black uppercase tracking-wider py-3 px-6 rounded-xl shadow-lg transition-all text-xs shrink-0 active:scale-95"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Medication</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Database Error Callout */}
      {error && (
        <div className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-4 flex gap-3 text-red-600 dark:text-red-400 items-start">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <div>
            <span className="font-black uppercase tracking-wider text-[10px] block">Search Error</span>
            <p className="text-xs font-bold leading-normal mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Loading Placeholder */}
      {isLoading && (
        <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          <div className="text-center">
            <h4 className="font-black uppercase text-xs text-zinc-900 dark:text-white tracking-widest">Accessing Medical Repository</h4>
            <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">Retrieving toxicology profiles and molecular records...</p>
          </div>
        </div>
      )}

      {/* Main Results Board */}

      {/* 1. Drug Search Results */}
      {!isLoading && drugResult && (
        <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-6 animate-fade-in">
          <div className="border-b border-zinc-150 dark:border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[9px] font-mono font-black text-red-600 uppercase tracking-widest block">MEDICATION IDENTIFIED</span>
              <h3 className="text-xl font-black uppercase text-zinc-900 dark:text-white mt-1">
                {drugResult.brandName} <span className="text-sm font-medium text-zinc-500 normal-case">({drugResult.genericName})</span>
              </h3>
            </div>
            <span className="px-3 py-1 bg-red-600/10 text-red-600 font-black text-[9px] uppercase tracking-wider rounded-md border border-red-600/20 self-start sm:self-auto">
              {drugResult.drugClass}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Emergency Action Callout (Left Column) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="text-[10.5px] font-mono font-black uppercase tracking-wider">Critical EMS Implications</span>
                </div>
                <p className="text-xs font-bold leading-relaxed text-zinc-700 dark:text-white/80">
                  {drugResult.emergencyImplications}
                </p>
              </div>

              <div className="bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/5 rounded-2xl p-4 space-y-2">
                <span className="text-[9px] font-mono uppercase text-zinc-400 font-black">Visual Description / Typical Form</span>
                <p className="text-xs font-bold text-zinc-700 dark:text-white/80 leading-relaxed">
                  {drugResult.visualDescription}
                </p>
              </div>
            </div>

            {/* Structured Details (Right Column) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-50 dark:bg-white/[0.02] border border-zinc-150 dark:border-white/5 rounded-2xl p-4">
                  <span className="text-[9px] font-mono uppercase text-zinc-400 font-black block mb-1">Primary Indication</span>
                  <p className="text-xs font-bold text-zinc-800 dark:text-white">
                    {drugResult.primaryIndication}
                  </p>
                </div>
                <div className="bg-zinc-50 dark:bg-white/[0.02] border border-zinc-150 dark:border-white/5 rounded-2xl p-4">
                  <span className="text-[9px] font-mono uppercase text-zinc-400 font-black block mb-1">Standard Outpatient Dosing</span>
                  <p className="text-xs font-bold text-zinc-800 dark:text-white">
                    {drugResult.standardDosing}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[9px] font-mono uppercase text-zinc-400 font-black block px-1">Top EMS Side Effects</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {drugResult.sideEffects?.map((effect, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-zinc-50 dark:bg-white/[0.01] border border-zinc-150 dark:border-white/5 rounded-xl p-3 text-xs font-semibold text-zinc-700 dark:text-white/70">
                      <Activity className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>{effect}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[9px] font-mono uppercase text-zinc-400 font-black block px-1">Major Contraindications</span>
                <div className="space-y-1.5">
                  {drugResult.contraindications?.map((contra, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-red-500/5 border border-red-500/10 rounded-xl p-3 text-xs font-bold text-red-600 dark:text-red-400 leading-normal">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span>{contra}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Pill ID Results */}
      {!isLoading && pillResult && (
        <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-6 animate-fade-in">
          <div className="border-b border-zinc-150 dark:border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[9px] font-mono font-black text-red-600 uppercase tracking-widest block">PILL SPECIMEN ANALYSIS</span>
              {pillResult.identified ? (
                <h3 className="text-xl font-black uppercase text-zinc-900 dark:text-white mt-1 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{pillResult.brandName} <span className="text-sm font-medium text-zinc-500 normal-case">({pillResult.genericName})</span></span>
                </h3>
              ) : (
                <h3 className="text-xl font-black uppercase text-zinc-900 dark:text-white mt-1">
                  Ambiguous Imprint / Unidentified Pill
                </h3>
              )}
            </div>
            {pillResult.identified && (
              <span className="px-3 py-1 bg-red-600/10 text-red-600 font-black text-[9px] uppercase tracking-wider rounded-md border border-red-600/20 self-start sm:self-auto">
                {pillResult.drugClass}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-zinc-50 dark:bg-white/[0.01] border border-zinc-150 dark:border-white/5 rounded-2xl p-4 space-y-3">
                <span className="text-[9px] font-mono uppercase text-zinc-400 font-black block">Confirmed Description</span>
                <p className="text-xs font-bold text-zinc-800 dark:text-white leading-relaxed">
                  {pillResult.descriptionConfirmed}
                </p>
                <div className="pt-2 border-t border-zinc-150 dark:border-white/5 flex justify-between text-xs font-mono">
                  <span className="text-zinc-400 uppercase font-black text-[9px]">Standard Strength:</span>
                  <span className="text-zinc-900 dark:text-white font-black">{pillResult.strength || 'N/A'}</span>
                </div>
              </div>

              {pillResult.warningLabel && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-3 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                  <div>
                    <span className="font-mono font-black uppercase tracking-wider text-[9px]">Clinical Alert</span>
                    <p className="text-xs font-bold leading-normal mt-1">{pillResult.warningLabel}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-6">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 space-y-3 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-[10.5px] font-mono font-black uppercase tracking-wider">Tactical Responder Implications</span>
                  </div>
                  <p className="text-xs font-bold text-zinc-700 dark:text-white/80 leading-relaxed">
                    {pillResult.emergencyImplications}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-amber-500/10 text-[10px] text-zinc-500 font-mono">
                  * Verify markings closely before clinical intervention.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Drug Interactions Results */}
      {!isLoading && interactionResult && (
        <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-6 animate-fade-in">
          <div className="border-b border-zinc-150 dark:border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[9px] font-mono font-black text-red-600 uppercase tracking-widest block">INTERACTION RISK VERIFICATION</span>
              <h3 className="text-xl font-black uppercase text-zinc-900 dark:text-white mt-1">
                Polymedication Profile Analysis
              </h3>
            </div>
            <div className={`px-3 py-1 font-black text-[9px] uppercase tracking-wider rounded-md border self-start sm:self-auto ${
              interactionResult.riskLevel.toLowerCase() === 'high'
                ? 'bg-red-500/10 text-red-600 border-red-500/30'
                : interactionResult.riskLevel.toLowerCase() === 'moderate'
                ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
            }`}>
              RISK LEVEL: {interactionResult.riskLevel}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-zinc-50 dark:bg-white/[0.01] border border-zinc-150 dark:border-white/5 rounded-2xl p-5 space-y-3">
                <span className="text-[9px] font-mono uppercase text-zinc-400 font-black block">Severity Summary</span>
                <p className="text-xs font-black text-zinc-800 dark:text-white leading-relaxed">
                  {interactionResult.severitySummary}
                </p>
                <div className="pt-3 border-t border-zinc-150 dark:border-white/5">
                  <span className="text-[9px] font-mono uppercase text-zinc-400 font-black block mb-1">Pharmacological Mechanism</span>
                  <p className="text-xs text-zinc-600 dark:text-white/60 leading-relaxed font-medium">
                    {interactionResult.mechanism}
                  </p>
                </div>
              </div>

              {interactionResult.dangerousOverlaps?.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[9px] font-mono uppercase text-zinc-400 font-black block px-1">Severe Overlaps Identified</span>
                  <div className="space-y-1.5">
                    {interactionResult.dangerousOverlaps.map((overlap, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-red-500/5 border border-red-500/10 rounded-xl p-3 text-xs font-bold text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                        <span>{overlap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-6">
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 space-y-4 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span className="text-[10.5px] font-mono font-black uppercase tracking-wider">Actionable Responder Guidance</span>
                  </div>
                  <p className="text-xs font-black text-zinc-900 dark:text-white leading-relaxed">
                    {interactionResult.emsActionableGuidance}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-red-500/10 text-[10px] text-zinc-500 font-mono">
                  * Alert on-line medical command if severe adverse indicators present.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Photo Scan Results */}
      {!isLoading && scanResult && (
        <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-6 animate-fade-in">
          <div className="border-b border-zinc-150 dark:border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[9px] font-mono font-black text-red-600 uppercase tracking-widest block">PHOTO SCAN ANALYSIS REPORT</span>
              <h3 className="text-xl font-black uppercase text-zinc-900 dark:text-white mt-1">
                Computer Vision Med Identification
              </h3>
            </div>
            <div className={`px-3 py-1 font-black text-[9px] uppercase tracking-wider rounded-md border self-start sm:self-auto ${
              scanResult.identified
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
            }`}>
              {scanResult.identified ? 'MEDICATIONS DETECTED' : 'NOT DETECTED / UNCERTAIN'}
            </div>
          </div>

          {/* Overall Clinical Warning */}
          {scanResult.overallClinicalWarning && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-mono font-black uppercase tracking-wider text-[9px]">Patient Overlap Warning</span>
                <p className="text-xs font-bold leading-normal mt-1 text-zinc-800 dark:text-white/90">
                  {scanResult.overallClinicalWarning}
                </p>
              </div>
            </div>
          )}

          {scanResult.medications && scanResult.medications.length > 0 ? (
            <div className="space-y-4">
              <span className="text-[9px] font-mono uppercase text-zinc-400 font-black block px-1">Detected Substances</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scanResult.medications.map((med, idx) => (
                  <div key={idx} className="bg-zinc-50 dark:bg-white/[0.01] border border-zinc-150 dark:border-white/5 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-start gap-2 border-b border-zinc-200/50 dark:border-white/5 pb-2">
                      <div>
                        <h4 className="font-black text-xs uppercase text-zinc-900 dark:text-white">
                          {med.brandName} <span className="text-[10px] font-medium text-zinc-500 normal-case">({med.genericName})</span>
                        </h4>
                        <span className="text-[8px] font-mono font-bold text-zinc-400 dark:text-white/40 block mt-0.5 uppercase">
                          {med.drugClass || "Unknown Class"} {med.strength && `• ${med.strength}`}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase ${
                        med.confidence.toLowerCase() === 'high'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : med.confidence.toLowerCase() === 'medium'
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          : 'bg-red-500/10 text-red-600 border border-red-500/20'
                      }`}>
                        {med.confidence} Match
                      </span>
                    </div>

                    {med.description && (
                      <div className="text-[10px] text-zinc-500 dark:text-white/40 leading-relaxed">
                        <span className="font-black text-zinc-700 dark:text-white/60">Visual Reference:</span> {med.description}
                      </div>
                    )}

                    <div className="bg-zinc-100 dark:bg-black/20 rounded-xl p-3 border border-zinc-150 dark:border-white/5">
                      <span className="text-[8px] font-mono font-black text-red-600 uppercase tracking-widest block mb-1">EMS IMPLICATION</span>
                      <p className="text-[11px] font-bold text-zinc-700 dark:text-white/80 leading-relaxed">
                        {med.emergencyImplications}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-zinc-500 dark:text-white/30 text-xs">
              No medications could be extracted from the provided image. Please ensure the medication labels or tablet shape/marking are clear and fully visible.
            </div>
          )}
        </div>
      )}

      {/* Responder Tactical Checklist Info Panel */}
      {!isLoading && !drugResult && !pillResult && !interactionResult && !scanResult && (
        <div className="bg-white dark:bg-[#1C1C1E] border border-zinc-150 dark:border-white/5 rounded-3xl p-6 shadow-md space-y-4">
          <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-4.5 h-4.5 text-red-600" />
            Tactical Medication Identification Guidelines
          </h3>
          <p className="text-xs leading-relaxed text-zinc-500 dark:text-white/50">
            Identifying patient medications on scene provides vital context during cardiac events, drug overdoses, altered mental status, or stroke evaluations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="border border-zinc-150 dark:border-white/5 rounded-2xl p-4 space-y-1.5 bg-zinc-50 dark:bg-white/[0.01]">
              <span className="text-[9px] font-mono font-black text-red-600 uppercase tracking-widest block">STEP 01</span>
              <h4 className="font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-tight">Gather Prescriptions</h4>
              <p className="text-[11px] text-zinc-500 dark:text-white/40 leading-relaxed">
                Check medicine cabinets, bedside tables, and purses for prescription bottles, taking note of dosage instructions.
              </p>
            </div>
            <div className="border border-zinc-150 dark:border-white/5 rounded-2xl p-4 space-y-1.5 bg-zinc-50 dark:bg-white/[0.01]">
              <span className="text-[9px] font-mono font-black text-red-600 uppercase tracking-widest block">STEP 02</span>
              <h4 className="font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-tight">Imprint Lookup</h4>
              <p className="text-[11px] text-zinc-500 dark:text-white/40 leading-relaxed">
                If loose tablets are found, note the numbers, letters, colors, and shapes to perform an imprint search above.
              </p>
            </div>
            <div className="border border-zinc-150 dark:border-white/5 rounded-2xl p-4 space-y-1.5 bg-zinc-50 dark:bg-white/[0.01]">
              <span className="text-[9px] font-mono font-black text-red-600 uppercase tracking-widest block">STEP 03</span>
              <h4 className="font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-tight">Interaction Risks</h4>
              <p className="text-[11px] text-zinc-500 dark:text-white/40 leading-relaxed">
                Cross-verify critical overlaps (such as blood thinners combined with NSAIDs) using the integrated checker.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
