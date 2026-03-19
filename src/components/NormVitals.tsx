import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, ArrowLeft } from 'lucide-react';

interface NormVitalsProps {
  onBack: () => void;
}

export default function NormVitals({ onBack }: NormVitalsProps) {
  // Adult, Pediatric, Infant
  const [ageGroup, setAgeGroup] = useState<'adult' | 'pediatric' | 'infant'>('adult');

  const vitalsData = {
    adult: {
      hr: '60 - 100 bpm',
      rr: '12 - 20 breaths/min',
      bp: '90 - 120 / 60 - 80 mmHg',
      temp: '97.8 - 99.1 °F (36.5 - 37.3 °C)',
      spo2: '95 - 100%',
    },
    pediatric: {
      hr: '70 - 120 bpm (varies by exact age)',
      rr: '20 - 30 breaths/min',
      bp: '80 - 110 / 50 - 80 mmHg',
      temp: '97.9 - 99.6 °F (36.6 - 37.6 °C)',
      spo2: '95 - 100%',
    },
    infant: {
      hr: '100 - 160 bpm',
      rr: '30 - 60 breaths/min',
      bp: '70 - 90 / 50 - 65 mmHg',
      temp: '97.9 - 100.4 °F (36.6 - 38.0 °C)',
      spo2: '95 - 100%',
    }
  };

  const currentVitals = vitalsData[ageGroup];

  return (
    <div className="flex flex-col h-full bg-[#151619] text-white">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-white/10 bg-[#151619] sticky top-0 z-10">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
            <Activity className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold">Normal Vitals</h2>
        </div>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto pb-24">
        {/* Slider / Segmented Control */}
        <div className="bg-white/5 p-1 rounded-xl flex gap-1">
          {(['adult', 'pediatric', 'infant'] as const).map((group) => (
            <button
              key={group}
              onClick={() => setAgeGroup(group)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold capitalize transition-all ${
                ageGroup === group 
                  ? 'bg-rose-500 text-white shadow-lg' 
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        {/* Vitals Display */}
        <motion.div 
          key={ageGroup}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">Heart Rate</div>
            <div className="text-lg font-mono">{currentVitals.hr}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">Respiratory Rate</div>
            <div className="text-lg font-mono">{currentVitals.rr}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">Blood Pressure</div>
            <div className="text-lg font-mono">{currentVitals.bp}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">Temperature</div>
            <div className="text-lg font-mono">{currentVitals.temp}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">SpO2</div>
            <div className="text-lg font-mono">{currentVitals.spo2}</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
