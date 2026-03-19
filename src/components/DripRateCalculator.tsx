import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Droplets, Info, Calculator } from 'lucide-react';

const DROP_FACTORS = [10, 15, 20, 60];

interface DripRateCalculatorProps {
  onBack: () => void;
}

export default function DripRateCalculator({ onBack }: DripRateCalculatorProps) {
  const [volume, setVolume] = useState('1000'); // mL
  const [hours, setHours] = useState('8');     // Hours
  const [dropFactor, setDropFactor] = useState(20);

  const dripRate = useMemo(() => {
    const v = parseFloat(volume);
    const t = parseFloat(hours) * 60; // Convert hours to minutes
    if (!v || !t || t === 0) return 0;
    
    // Formula: (Volume / Time) * Drop Factor
    const rate = (v / t) * dropFactor;
    return Math.round(rate); // Drops per minute must be a whole number
  }, [volume, hours, dropFactor]);

  const mlPerHour = useMemo(() => {
    const v = parseFloat(volume);
    const h = parseFloat(hours);
    return (v && h) ? Math.round(v / h) : 0;
  }, [volume, hours]);

  return (
    <div className="max-w-md mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-emerald-500 mb-6 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Tools</span>
      </button>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Drip Rate</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">IV Infusion Calculator</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Volume Input */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
              Total Volume (mL)
            </label>
            <input
              type="number"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-lg font-bold"
              placeholder="e.g. 1000"
            />
          </div>

          {/* Time Input */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
              Time (Hours)
            </label>
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-lg font-bold"
              placeholder="e.g. 8"
            />
          </div>

          {/* Drop Factor Selection */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
              Drop Factor (gtts/mL)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DROP_FACTORS.map((factor) => (
                <button
                  key={factor}
                  onClick={() => setDropFactor(factor)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                    dropFactor === factor 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {factor}
                  {factor === 60 && <span className="block text-[8px] opacity-60">Micro</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-emerald-500 rounded-2xl p-6 text-center shadow-lg shadow-emerald-900/20"
        >
          <div className="flex justify-center mb-2">
            <Droplets className="w-8 h-8 text-white/40" />
          </div>
          <div className="text-5xl font-black text-white mb-1">{dripRate}</div>
          <div className="text-xs font-bold uppercase tracking-widest text-white/80">Drops / Minute (gtts/min)</div>
        </motion.div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Infusion Pump Rate</p>
            <p className="text-xl font-bold text-white">{mlPerHour} <span className="text-sm font-medium text-white/40">mL/hr</span></p>
          </div>
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/20">
            <Calculator className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
        <Info className="w-5 h-5 text-orange-500 flex-shrink-0" />
        <p className="text-[10px] text-orange-400 leading-relaxed">
          <strong>Note:</strong> Always round to the nearest whole drop for manual gravity sets. Verify calculation with a second provider when possible.
        </p>
      </div>
    </div>
  );
}
