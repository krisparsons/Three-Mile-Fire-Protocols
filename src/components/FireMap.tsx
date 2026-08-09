import React from 'react';
import { ArrowLeft, Map, ExternalLink, Flame, Navigation, Globe, Shield } from 'lucide-react';

interface FireMapProps {
  onBack: () => void;
}

export default function FireMap({ onBack }: FireMapProps) {
  const mapUrl = "https://wfca.com/fire-map?lng=-110.0444&lat=46.7294&zoom=6.59";

  return (
    <div className="space-y-6" id="fire-map-tool">
      <div className="flex items-center justify-between border-b border-zinc-150 dark:border-white/5 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-red-500 hover:text-red-400 font-bold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tools</span>
        </button>
        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center gap-1.5 animate-pulse">
          <Flame className="w-3.5 h-3.5" /> Live Fire Map
        </span>
      </div>

      <div className="bg-white dark:bg-[#1C1C1E] border border-zinc-200 dark:border-white/5 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <Map className="w-6 h-6 text-orange-500" />
              WFCA Fire Map Portal
            </h2>
            <p className="text-xs text-zinc-500 dark:text-white/40 mt-1">
              Active wildfires, thermal hotspots, and smoke prediction overlays for the Montana region and Pacific Northwest.
            </p>
          </div>
          <button
            onClick={() => window.open(mapUrl, '_blank')}
            className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold py-3 px-5 rounded-2xl shadow-lg shadow-orange-950/20 transition-all shrink-0 text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Fullscreen Map</span>
          </button>
        </div>

        {/* Info Alert Callout */}
        <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-4 mb-6 flex gap-3 text-xs leading-relaxed text-orange-600 dark:text-orange-400">
          <Shield className="w-5 h-5 shrink-0 text-orange-500" />
          <div>
            <span className="font-bold uppercase tracking-wider block mb-0.5">Tactical Tip</span>
            Use the layer controls in the top-right of the map to toggle MODIS/VIIRS satellite hotspots, fire perimeters, and red flag warnings.
          </div>
        </div>

        {/* Embedded Iframe Container */}
        <div className="relative w-full h-[450px] md:h-[650px] bg-zinc-100 dark:bg-black/30 rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/5 shadow-inner group">
          <iframe
            src={mapUrl}
            title="WFCA Wildfire Map"
            className="w-full h-full border-0 rounded-2xl"
            allow="geolocation"
            loading="lazy"
          />
          
          <div className="absolute bottom-4 left-4 right-4 bg-zinc-950/90 backdrop-blur-md border border-white/10 rounded-xl p-3.5 flex items-center justify-between text-white text-[10px] md:text-xs">
            <span className="flex items-center gap-2 text-white/80">
              <Navigation className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
              Center Coordinates: <strong className="font-mono text-orange-400">46.7294° N, 110.0444° W</strong>
            </span>
            <span className="hidden sm:inline text-white/40 font-mono">
              WFCA Real-Time GIS
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-150 dark:border-white/5 rounded-2xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-white/60 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-orange-400" /> Regional Center Focus
            </h3>
            <p className="text-xs text-zinc-500 dark:text-white/40 leading-relaxed">
              Preset centered coordinates cover the surrounding areas of Montana to ensure prompt coverage of adjacent districts, wildland urban interfaces, and municipal boundaries.
            </p>
          </div>
          <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-150 dark:border-white/5 rounded-2xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-white/60 mb-2 flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-500" /> Hotspot Legend
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-500 dark:text-white/40 font-mono mt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
                <span>VIIRS (Last 12h)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                <span>MODIS (Thermal)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500 inline-block" />
                <span>Fire Perimeter</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                <span>RAWS Weather Station</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
