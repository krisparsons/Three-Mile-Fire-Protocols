import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { ArrowLeft, Brain } from 'lucide-react';

const GCS_DATA = {
  eye: {
    label: 'Eye Opening (E)',
    options: [
      { label: 'None', val: 1 },
      { label: 'To Pressure/Pain', val: 2 },
      { label: 'To Sound/Speech', val: 3 },
      { label: 'Spontaneous', val: 4 },
    ]
  },
  verbal: {
    label: 'Verbal Response (V)',
    options: [
      { label: 'None', val: 1 },
      { label: 'Incomprehensible sounds', val: 2 },
      { label: 'Inappropriate words', val: 3 },
      { label: 'Confused', val: 4 },
      { label: 'Oriented', val: 5 },
      { label: 'Intubated (T)', val: 0 },
    ]
  },
  motor: {
    label: 'Motor Response (M)',
    options: [
      { label: 'None', val: 1 },
      { label: 'Extension (Decerebrate)', val: 2 },
      { label: 'Abnormal Flexion (Decorticate)', val: 3 },
      { label: 'Withdrawal from pain', val: 4 },
      { label: 'Localizing pain', val: 5 },
      { label: 'Obeys commands', val: 6 },
    ]
  }
};

interface GcsCalculatorProps {
  onBack: () => void;
}

const GcsCalculator: React.FC<GcsCalculatorProps> = ({ onBack }) => {
  const [selections, setSelections] = useState<Record<string, number>>({ 
    eye: 4, 
    verbal: 5, 
    motor: 6 
  });

  const { total, severity, colorClass } = useMemo(() => {
    const isIntubated = selections.verbal === 0;
    const vScore = isIntubated ? 1 : selections.verbal;
    const sum = selections.eye + vScore + selections.motor;
    
    let sev = "Mild (13-15)";
    let col = "bg-emerald-500";

    if (sum <= 8) {
      sev = "Severe / Coma (3-8)";
      col = "bg-red-500";
    } else if (sum <= 12) {
      sev = "Moderate (9-12)";
      col = "bg-orange-500";
    }

    return { 
      total: isIntubated ? `${sum}T` : sum.toString(), 
      severity: sev, 
      colorClass: col 
    };
  }, [selections]);

  const updateSelection = (key: string, val: number) => {
    setSelections(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-emerald-500 mb-6 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Tools</span>
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/20">
          <Brain className="text-white w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">GCS Calculator</h2>
          <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest mt-1">Glasgow Coma Scale</p>
        </div>
      </div>

      <motion.div 
        layout
        className={cn(
          "p-8 rounded-2xl text-center mb-8 transition-colors duration-500 shadow-xl",
          colorClass
        )}
      >
        <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">Total GCS Score</p>
        <h3 className="text-6xl font-black text-white mb-2">{total}</h3>
        <p className="text-white font-bold bg-black/20 px-3 py-1 rounded-full inline-block text-sm">
          {severity}
        </p>
      </motion.div>

      <div className="space-y-8">
        {Object.entries(GCS_DATA).map(([key, category]) => (
          <div key={key} className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
              {category.label}
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {category.options.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => updateSelection(key, opt.val)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group",
                    selections[key] === opt.val 
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"
                  )}
                >
                  <span className="text-sm font-medium">{opt.label}</span>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                    selections[key] === opt.val 
                      ? "bg-white text-emerald-600" 
                      : "bg-white/10 text-white/40 group-hover:bg-white/20"
                  )}>
                    {opt.val === 0 ? 'T' : opt.val}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-2xl">
        <h5 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Clinical Note</h5>
        <p className="text-xs text-white/60 leading-relaxed">
          The Glasgow Coma Scale (GCS) is used to objectively describe the extent of impaired consciousness in all types of acute medical and trauma patients. A score of 8 or less is generally considered to be in a coma. For intubated patients, the verbal score is omitted or recorded as 'T'.
        </p>
      </div>
    </div>
  );
};

export default GcsCalculator;
