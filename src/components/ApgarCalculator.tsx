import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { ArrowLeft, Calculator } from 'lucide-react';

const APGAR_DATA = [
  { key: 'appearance', label: 'Appearance (Color)', options: ['Blue/Pale', 'Body Pink, Limbs Blue', 'All Pink'] },
  { key: 'pulse', label: 'Pulse (Heart Rate)', options: ['Absent', '< 100 bpm', '> 100 bpm'] },
  { key: 'grimace', label: 'Grimace (Reflex)', options: ['No Response', 'Grimace', 'Cry/Sneeze/Cough'] },
  { key: 'activity', label: 'Activity (Tone)', options: ['Limp', 'Some Flexion', 'Active Motion'] },
  { key: 'respiration', label: 'Respiration', options: ['Absent', 'Slow/Irregular', 'Strong Cry'] },
];

interface ApgarCalculatorProps {
  onBack: () => void;
}

const ApgarCalculator: React.FC<ApgarCalculatorProps> = ({ onBack }) => {
  const [scores, setScores] = useState<Record<string, number>>({
    appearance: 0,
    pulse: 0,
    grimace: 0,
    activity: 0,
    respiration: 0,
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const sum = Object.values(scores).reduce((a: number, b: number) => a + b, 0);
    setTotal(sum);
  }, [scores]);

  const updateScore = (key: string, value: number) => {
    setScores(prev => ({ ...prev, [key]: value }));
  };

  const getScoreColor = () => {
    if (total >= 7) return 'bg-emerald-500';
    if (total >= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreStatus = () => {
    if (total >= 7) return 'Normal';
    if (total >= 4) return 'Fairly Low';
    return 'Critically Low';
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
          <Calculator className="text-white w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">APGAR Calculator</h2>
          <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest mt-1">Newborn Assessment Tool</p>
        </div>
      </div>

      <motion.div 
        layout
        className={cn(
          "p-8 rounded-2xl text-center mb-8 transition-colors duration-500 shadow-xl",
          getScoreColor()
        )}
      >
        <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">Total APGAR Score</p>
        <h3 className="text-6xl font-black text-white mb-2">{total}</h3>
        <p className="text-white font-bold bg-black/20 px-3 py-1 rounded-full inline-block text-sm">
          {getScoreStatus()}
        </p>
      </motion.div>

      <div className="space-y-8">
        {APGAR_DATA.map((item) => (
          <div key={item.key} className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
              {item.label}
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {item.options.map((option, index) => (
                <button
                  key={option}
                  onClick={() => updateScore(item.key, index)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group",
                    scores[item.key] === index 
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"
                  )}
                >
                  <span className="text-sm font-medium">{option}</span>
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    scores[item.key] === index 
                      ? "bg-white text-emerald-600" 
                      : "bg-white/10 text-white/40 group-hover:bg-white/20"
                  )}>
                    {index}
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
          APGAR scores are typically recorded at 1 and 5 minutes after birth. A score of 7-10 is considered normal, 4-6 is fairly low, and 0-3 is critically low. If the 5-minute score is less than 7, additional scores should be assigned every 5 minutes for up to 20 minutes.
        </p>
      </div>
    </div>
  );
};

export default ApgarCalculator;
