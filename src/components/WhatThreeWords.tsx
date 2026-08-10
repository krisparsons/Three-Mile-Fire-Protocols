import React, { useState } from 'react';
import { ArrowLeft, Navigation, MapPin, Compass, ShieldAlert, Sparkles, RefreshCw, HelpCircle, Copy, Check } from 'lucide-react';

interface WhatThreeWordsProps {
  onBack: () => void;
}

const W3W_API_KEY = 'JLI7RDOY';

export default function WhatThreeWords({ onBack }: WhatThreeWordsProps) {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [words, setWords] = useState<string | null>(null);
  const [wordsLoading, setWordsLoading] = useState(false);
  const [wordsError, setWordsError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchWords = async (lat: number, lng: number) => {
    setWordsLoading(true);
    setWordsError(null);
    setWords(null);
    try {
      const res = await fetch(
        `https://api.what3words.com/v3/convert-to-3wa?coordinates=${lat},${lng}&key=${W3W_API_KEY}`
      );
      const data = await res.json();
      if (data.words) {
        setWords(data.words);
      } else {
        setWordsError(data.error?.message || 'Could not retrieve what3words address.');
      }
    } catch (err) {
      setWordsError('Failed to reach what3words. Check your internet connection.');
    } finally {
      setWordsLoading(false);
    }
  };

  const fetchGpsCoordinates = () => {
    setGpsLoading(true);
    setGpsError(null);
    setCoords(null);
    setWords(null);
    setWordsError(null);

    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
        };
        setCoords(newCoords);
        setGpsLoading(false);
        fetchWords(newCoords.lat, newCoords.lng);
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

  const handleCopy = () => {
    if (!words) return;
    navigator.clipboard.writeText(`///${words}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <div className="bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-2xl p-5">
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
                    Grab your current tactical on-scene coordinates instantly. Your what3words address will be shown right here — no separate app or page needed.
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

                    {/* what3words result */}
                    {wordsLoading && (
                      <div className="flex items-center gap-3 py-3 justify-center">
                        <RefreshCw className="w-5 h-5 text-red-500 animate-spin shrink-0" />
                        <span className="text-xs font-bold text-zinc-500 dark:text-white/60 animate-pulse">Converting to what3words...</span>
                      </div>
                    )}

                    {wordsError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-2.5 text-xs text-red-600 dark:text-red-400">
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                        <p className="font-medium">{wordsError}</p>
                      </div>
                    )}

                    {words && (
                      <div className="bg-red-600 rounded-2xl p-5 text-center shadow-lg shadow-red-950/20">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/70 block mb-1">
                          what3words Address
                        </span>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-2xl font-black font-mono text-white break-all">
                            ///{words}
                          </span>
                        </div>
                        <button
                          onClick={handleCopy}
                          className="mt-3 inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold py-2 px-4 rounded-xl transition-all text-xs"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          <span>{copied ? 'Copied!' : 'Copy Address'}</span>
                        </button>
                      </div>
                    )}
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
