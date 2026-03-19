import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Flame, Info, User, Baby } from 'lucide-react';
import { cn } from '../lib/utils';

const bodyRegions = [
  { id: 'head', label: 'Head', adultTotal: 9, pedsTotal: 18 },
  { id: 'torso', label: 'Torso', adultTotal: 36, pedsTotal: 36 },
  { id: 'armL', label: 'Left Arm', adultTotal: 9, pedsTotal: 9 },
  { id: 'armR', label: 'Right Arm', adultTotal: 9, pedsTotal: 9 },
  { id: 'legL', label: 'Left Leg', adultTotal: 18, pedsTotal: 14 },
  { id: 'legR', label: 'Right Leg', adultTotal: 18, pedsTotal: 14 },
];

interface BurnCalculatorProps {
  onBack: () => void;
}

export default function BurnCalculator({ onBack }: BurnCalculatorProps) {
  const [isPediatric, setIsPediatric] = useState(false);
  const [selections, setSelections] = useState<Record<string, boolean>>({});

  const toggleSide = (id: string, side: 'Front' | 'Back') => {
    const key = `${id}${side}`;
    setSelections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const totalTBSA = useMemo(() => {
    return bodyRegions.reduce((acc, region) => {
      const perSide = (isPediatric ? region.pedsTotal : region.adultTotal) / 2;
      if (selections[`${region.id}Front`]) acc += perSide;
      if (selections[`${region.id}Back`]) acc += perSide;
      return acc;
    }, 0);
  }, [selections, isPediatric]);

  return (
    <div className="max-w-2xl mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-emerald-500 mb-6 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Tools</span>
      </button>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-500 shadow-lg shadow-orange-900/10">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Advanced Burn Calc</h2>
            <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest mt-1">Split-Side TBSA Assessment</p>
          </div>
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => { setIsPediatric(false); setSelections({}); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
              !isPediatric ? "bg-emerald-500 text-white shadow-lg" : "text-white/40 hover:text-white/60"
            )}
          >
            <User className="w-3 h-3" />
            Adult
          </button>
          <button
            onClick={() => { setIsPediatric(true); setSelections({}); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
              isPediatric ? "bg-emerald-500 text-white shadow-lg" : "text-white/40 hover:text-white/60"
            )}
          >
            <Baby className="w-3 h-3" />
            Peds
          </button>
        </div>
      </div>

      <motion.div 
        layout
        className={cn(
          "p-8 rounded-2xl text-center mb-8 transition-all duration-500 shadow-xl border border-white/10",
          totalTBSA >= 15 ? "bg-red-500" : "bg-white/5"
        )}
      >
        <p className={cn(
          "text-xs font-bold uppercase tracking-widest mb-1",
          totalTBSA >= 15 ? "text-white/80" : "text-white/40"
        )}>Total TBSA Burned</p>
        <h3 className="text-6xl font-black text-white mb-2">{totalTBSA.toFixed(1)}%</h3>
        {totalTBSA >= 15 && (
          <p className="text-white font-bold bg-black/20 px-4 py-1 rounded-full inline-block text-xs">
            Significant Burn - Fluid Resuscitation Required
          </p>
        )}
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {bodyRegions.map((region) => (
          <div key={region.id} className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 text-center">{region.label}</p>
            <div className="grid grid-cols-2 gap-1 h-20 rounded-xl overflow-hidden border border-white/10 bg-white/5">
              <button
                onClick={() => toggleSide(region.id, 'Front')}
                className={cn(
                  "flex items-center justify-center text-[10px] font-bold uppercase tracking-tighter transition-all",
                  selections[`${region.id}Front`] 
                    ? "bg-orange-500 text-white" 
                    : "text-white/40 hover:bg-white/5"
                )}
              >
                Front
              </button>
              <button
                onClick={() => toggleSide(region.id, 'Back')}
                className={cn(
                  "flex items-center justify-center text-[10px] font-bold uppercase tracking-tighter transition-all border-l border-white/10",
                  selections[`${region.id}Back`] 
                    ? "bg-orange-900/80 text-white" 
                    : "text-white/40 hover:bg-white/5"
                )}
              >
                Back
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-2xl flex gap-4">
        <Info className="w-6 h-6 text-emerald-500 flex-shrink-0" />
        <div className="space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-widest text-white/40">Clinical Reference</h5>
          <p className="text-xs text-white/60 leading-relaxed">
            This advanced calculator splits the <strong>Rule of Nines</strong> into anterior (Front) and posterior (Back) components for more precise TBSA assessment. 
            TBSA ≥15% in adults typically indicates the need for formal fluid resuscitation.
          </p>
        </div>
      </div>
    </div>
  );
}
