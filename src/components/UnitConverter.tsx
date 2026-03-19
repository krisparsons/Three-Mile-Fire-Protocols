import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, RefreshCw, Info, Scale, Thermometer } from 'lucide-react';
import { cn } from '../lib/utils';

type ConversionMode = 'lbsToKg' | 'kgToLbs' | 'fToC' | 'cToF';

interface UnitConverterProps {
  onBack: () => void;
}

export default function UnitConverter({ onBack }: UnitConverterProps) {
  const [val, setVal] = useState('');
  const [mode, setMode] = useState<ConversionMode>('lbsToKg');

  const convert = (input: string) => {
    const num = parseFloat(input);
    if (isNaN(num)) return "--";

    switch (mode) {
      case 'lbsToKg': return (num / 2.2046).toFixed(2) + " kg";
      case 'kgToLbs': return (num * 2.2046).toFixed(2) + " lbs";
      case 'fToC': return ((num - 32) * 5 / 9).toFixed(1) + " °C";
      case 'cToF': return ((num * 9 / 5) + 32).toFixed(1) + " °F";
      default: return "";
    }
  };

  const modes: { id: ConversionMode; label: string; icon: React.ReactNode }[] = [
    { id: 'lbsToKg', label: 'lb → kg', icon: <Scale className="w-3 h-3" /> },
    { id: 'kgToLbs', label: 'kg → lb', icon: <Scale className="w-3 h-3" /> },
    { id: 'fToC', label: '°F → °C', icon: <Thermometer className="w-3 h-3" /> },
    { id: 'cToF', label: '°C → °F', icon: <Thermometer className="w-3 h-3" /> },
  ];

  return (
    <div className="max-w-md mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-emerald-500 mb-6 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Tools</span>
      </button>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 shadow-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 shadow-lg shadow-blue-900/10">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Unit Converter</h2>
            <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest mt-1">EMS Field Conversion</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2 mb-8">
          {modes.map((m) => (
            <button 
              key={m.id} 
              onClick={() => { setMode(m.id); setVal(''); }}
              className={cn(
                "flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all border",
                mode === m.id 
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                  : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20"
              )}
            >
              {m.icon}
              {m.label}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
              Enter Value
            </label>
            <input
              type="number"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-6 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-4xl font-black text-white placeholder:text-white/5"
              placeholder="0.0"
              autoFocus
            />
          </div>
          
          <div className="h-px bg-white/5" />

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
              Converted Result
            </label>
            <div className="text-4xl font-black text-emerald-500 tracking-tight">
              {convert(val)}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Reference Note */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
        <p className="text-[10px] text-blue-400 font-medium leading-relaxed italic">
          {mode.includes('lbs') 
            ? "Standard EMS estimate: (lb / 2) - 10%" 
            : "Clinical Reference: 100.4°F (38°C) is the standard threshold for fever."}
        </p>
      </div>
    </div>
  );
}
