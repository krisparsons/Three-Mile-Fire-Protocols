import React, { useState } from 'react';
import { ArrowLeft, Navigation, MapPin, ExternalLink, Compass, ShieldAlert, Sparkles, RefreshCw, HelpCircle } from 'lucide-react';

interface WhatThreeWordsProps {
  onBack: () => void;
}

export default function WhatThreeWords({ onBack }: WhatThreeWordsProps) {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [manualWords, setManualWords] = useState('');

  const fetchGpsCoordinates = () => {
    setGpsLoading(true);
    setGpsError(null);
    setCoords(null);

    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
        });
        setGpsLoading(false);
      },
      (error) => {
        let msg = "Failed to retrieve GPS location.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "GPS permission denied. Please allow location access in your device settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = "GPS signal is currently unavailable.";
        } else if (error.code === error.TIMEOUT) {
          msg = "GPS request timed out.";
        }
        setGpsError(msg);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualWords.trim()) return;
    
    // Clean up input - remove leading slashes or spaces, replace slashes with dots
    let clean = manualWords.trim().toLowerCase().replace(/^\/\/\//, '').replace(/\s+/g, '.').replace(/\//g, '.');
    
    // Open in a new tab on what3words
    window.open(`https://what3words.com/${clean}`, '_blank');
  };

  return (
    <div className="space-y-6" id="what3words-tool">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-150 dark:border-white/5 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-red-500 hover:text-red-400 font-bold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tools</span>
        </button>
        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 animate-bounce" /> what3words Quick Ref
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column (7 cols) - Quick Reference & GPS Tool */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-[#1C1C1E] border border-zinc-200 dark:border-white/5 rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5 mb-2">
              <Compass className="w-6 h-6 text-red-500" />
              Tactical Location Pinpoint
            </h2>
            <p className="text-xs text-zinc-500 dark:text-white/40 mb-6 leading-relaxed">
              what3words is highly critical on wildland fires, remote search & rescue, and motor vehicle crashes. It allows emergency teams to locate any 3m x 3m square worldwide using just three simple words.
            </p>

            {/* GPS grabber tool */}
            <div className="bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-white/60">
                  On-Scene Coordinates Grabber
                </h3>
                <span className="text-[9px] font-bold font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded">
                  Device GPS Active
                </span>
              </div>

              <div className="space-y-4">
                {!coords && !gpsError && (
                  <p className="text-xs text-zinc-500 dark:text-white/40 leading-relaxed">
                    Grab your current tactical on-scene coordinates instantly. You can then open what3words directly to broadcast your exact location to dispatch or incoming crews.
                  </p>
                )}

                {gpsLoading && (
                  <div className="flex items-center gap-3 py-3">
                    <RefreshCw className="w-5 h-5 text-red-500 animate-spin shrink-0" />
                    <span className="text-xs font-bold text-zinc-500 dark:text-white/60 animate-pulse">Pinging high-accuracy GPS satellites...</span>
                  </div>
                )}

                {gpsError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-2.5 text-xs text-red-600 dark:text-red-400">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="font-medium">{gpsError}</p>
                  </div>
                )}

                {coords && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-white/5 rounded-xl p-3">
                        <span className="text-[8px] font-bold text-zinc-400 dark:text-white/30 uppercase tracking-widest block mb-0.5">Latitude</span>
                        <span className="text-sm font-black font-mono text-zinc-900 dark:text-white">{coords.lat.toFixed(6)}° N</span>
                      </div>
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-white/5 rounded-xl p-3">
                        <span className="text-[8px] font-bold text-zinc-400 dark:text-white/30 uppercase tracking-widest block mb-0.5">Longitude</span>
                        <span className="text-sm font-black font-mono text-zinc-900 dark:text-white">{coords.lng.toFixed(6)}° W</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-white/40 font-mono px-1">
                      <span>GPS Accuracy Radius: <strong className="text-emerald-500 font-bold">± {coords.accuracy} meters</strong></span>
                      <span className="text-red-500 animate-pulse">● Live Tracking</span>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => window.open(`https://what3words.com/dir/${coords.lat},${coords.lng}`, '_blank')}
                        className="w-full bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-red-950/20 transition-all flex items-center justify-center gap-2 text-xs"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Launch what3words For This Coordinate</span>
                      </button>
                    </div>
                  </div>
                )}

                {!gpsLoading && (
                  <button
                    onClick={fetchGpsCoordinates}
                    className="w-full bg-zinc-200 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/15 active:scale-95 text-zinc-900 dark:text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs border border-zinc-300 dark:border-white/5"
                  >
                    <Navigation className="w-4 h-4 text-red-500" />
                    <span>{coords ? "Recalculate Current Location" : "Acquire On-Scene GPS"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Manual Lookup form */}
            <form onSubmit={handleManualSearch} className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-white/60 px-1">
                Verify 3-Word Address From Dispatch
              </h3>
              <p className="text-xs text-zinc-500 dark:text-white/40 leading-relaxed px-1">
                Enter three words separated by dots or spaces (e.g. <code className="text-red-400 font-bold font-mono">filled.count.soap</code>) to route or locate on the map immediately.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 font-bold text-sm select-none font-mono">///</span>
                  <input
                    type="text"
                    placeholder="word1.word2.word3"
                    value={manualWords}
                    onChange={(e) => setManualWords(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-black/30 border-2 border-zinc-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-red-600/10 focus:border-red-600 transition-all text-xs font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/20 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!manualWords.trim()}
                  className="bg-red-600 hover:bg-red-500 disabled:bg-zinc-300 dark:disabled:bg-white/5 disabled:text-zinc-500 dark:disabled:text-white/20 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shrink-0 text-xs shadow-md"
                >
                  Go to Map
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right column (5 cols) - Guides & Tactical Tips */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#1C1C1E] border border-zinc-200 dark:border-white/5 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Tactical Responder Guide
            </h3>

            <div className="space-y-4 text-xs leading-relaxed">
              <div className="border-l-2 border-red-500 pl-3">
                <span className="font-bold text-zinc-800 dark:text-white block mb-0.5">Wildland Operations</span>
                <p className="text-zinc-500 dark:text-white/40">
                  Relaying precise ridges, thermal pockets, or lightning strikes with traditional latitude/longitude is highly error-prone over radio. what3words prevents mistakes.
                </p>
              </div>

              <div className="border-l-2 border-red-500 pl-3">
                <span className="font-bold text-zinc-800 dark:text-white block mb-0.5">Helispot LZ Coordinates</span>
                <p className="text-zinc-500 dark:text-white/40">
                  Safe landing zones (LZ) on gravel roads, clearings, or parks can be communicated rapidly using three unique words to LifeFlight or state air assets.
                </p>
              </div>

              <div className="border-l-2 border-red-500 pl-3">
                <span className="font-bold text-zinc-800 dark:text-white block mb-0.5">Search & Rescue (SAR)</span>
                <p className="text-zinc-500 dark:text-white/40">
                  Lost hikers can look up their what3words address on their offline mobile phone application, allowing local ground teams to hike directly to their location.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-zinc-150 dark:border-white/5 flex gap-3 text-[11px] leading-relaxed text-zinc-500 dark:text-white/40">
              <HelpCircle className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <strong className="block text-zinc-800 dark:text-white mb-0.5">No Internet? No Problem.</strong>
                The standalone official what3words application functions completely offline utilizing the device's built-in GPS chip without cellular coverage.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
