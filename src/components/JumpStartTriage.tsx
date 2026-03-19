import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ShieldAlert, AlertTriangle, Baby } from 'lucide-react';
import { cn } from '../lib/utils';

type TriageStep = 1 | 2 | 2.1 | 2.2 | 3 | 4 | 5 | 'GREEN' | 'YELLOW' | 'RED' | 'BLACK';

interface JumpStartTriageProps {
  onBack: () => void;
}

export default function JumpStartTriage({ onBack }: JumpStartTriageProps) {
  const [step, setStep] = useState<TriageStep>(1);

  const reset = () => setStep(1);

  const renderResult = (color: string, label: string, textColor: string = 'text-white') => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("flex-1 flex flex-col items-center justify-center p-8 rounded-3xl text-center min-h-[400px]", color)}
    >
      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert className={cn("w-10 h-10", textColor)} />
      </div>
      <p className={cn("text-xs font-bold uppercase tracking-widest opacity-70", textColor)}>Pediatric Category</p>
      <h3 className={cn("text-4xl font-black my-4 tracking-tight", textColor)}>{label}</h3>
      <button 
        onClick={reset}
        className="mt-8 bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-white/90 transition-all active:scale-95 shadow-xl"
      >
        Next Patient
      </button>
    </motion.div>
  );

  return (
    <div className="max-w-md mx-auto min-h-[500px] flex flex-col">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-emerald-500 mb-6 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Tools</span>
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 shadow-lg shadow-blue-900/10">
          <Baby className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">JumpSTART</h2>
          <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest mt-1">Pediatric MCI Algorithm</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h3 className="text-2xl font-bold text-center mb-8">Can the patient walk?</h3>
              <div className="grid gap-4">
                <button onClick={() => setStep('GREEN')} className="w-full bg-emerald-500 p-6 rounded-2xl text-white font-bold text-lg shadow-lg hover:bg-emerald-400 transition-all active:scale-95">
                  Yes (Minor / Green)
                </button>
                <button onClick={() => setStep(2)} className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-white font-bold text-lg hover:bg-white/10 transition-all active:scale-95">
                  No
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h3 className="text-2xl font-bold text-center mb-8">Is the patient breathing?</h3>
              <div className="grid gap-4">
                <button onClick={() => setStep(3)} className="w-full bg-blue-500 p-6 rounded-2xl text-white font-bold text-lg shadow-lg hover:bg-blue-400 transition-all active:scale-95">
                  Yes
                </button>
                <button onClick={() => setStep(2.1)} className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-white font-bold text-lg hover:bg-white/10 transition-all active:scale-95">
                  No (Open Airway)
                </button>
              </div>
            </motion.div>
          )}

          {step === 2.1 && (
            <motion.div key="step2.1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h3 className="text-2xl font-bold text-center mb-8">Breathing after airway opened?</h3>
              <div className="grid gap-4">
                <button onClick={() => setStep('RED')} className="w-full bg-red-600 p-6 rounded-2xl text-white font-bold text-lg shadow-lg hover:bg-red-500 transition-all active:scale-95">
                  Yes (Immediate / Red)
                </button>
                <button onClick={() => setStep(2.2)} className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-white font-bold text-lg hover:bg-white/10 transition-all active:scale-95">
                  No (Check Pulse)
                </button>
              </div>
            </motion.div>
          )}

          {step === 2.2 && (
            <motion.div key="step2.2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h3 className="text-2xl font-bold text-center mb-8">Is there a palpable pulse?</h3>
              <div className="grid gap-4">
                <button onClick={() => setStep('BLACK')} className="w-full bg-zinc-900 border border-white/10 p-6 rounded-2xl text-white font-bold text-lg hover:bg-zinc-800 transition-all active:scale-95">
                  No Pulse (Deceased)
                </button>
                <button onClick={() => setStep('RED')} className="w-full bg-red-600 p-6 rounded-2xl text-white font-bold text-lg shadow-lg hover:bg-red-500 transition-all active:scale-95">
                  Pulse Present (Give 5 breaths, then Red)
                </button>
              </div>
              <p className="text-[10px] text-white/40 text-center italic">Note: If breathing starts after 5 rescue breaths, categorize as Red.</p>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h3 className="text-2xl font-bold text-center mb-8">Respiratory Rate?</h3>
              <div className="grid gap-4">
                <button onClick={() => setStep('RED')} className="w-full bg-red-600 p-6 rounded-2xl text-white font-bold text-lg shadow-lg hover:bg-red-500 transition-all active:scale-95">
                  &lt; 15 or &gt; 45 /min
                </button>
                <button onClick={() => setStep(4)} className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-white font-bold text-lg hover:bg-white/10 transition-all active:scale-95">
                  15 - 45 /min
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h3 className="text-2xl font-bold text-center mb-8">Palpable Pulse?</h3>
              <div className="grid gap-4">
                <button onClick={() => setStep('RED')} className="w-full bg-red-600 p-6 rounded-2xl text-white font-bold text-lg shadow-lg hover:bg-red-500 transition-all active:scale-95">
                  No Pulse
                </button>
                <button onClick={() => setStep(5)} className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-white font-bold text-lg hover:bg-white/10 transition-all active:scale-95">
                  Pulse Present
                </button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h3 className="text-2xl font-bold text-center mb-8">Mental Status (AVPU)?</h3>
              <div className="grid gap-4">
                <button onClick={() => setStep('RED')} className="w-full bg-red-600 p-6 rounded-2xl text-white font-bold text-lg shadow-lg hover:bg-red-500 transition-all active:scale-95">
                  P (Inappropriate) or U
                </button>
                <button onClick={() => setStep('YELLOW')} className="w-full bg-yellow-500 p-6 rounded-2xl text-black font-bold text-lg shadow-lg hover:bg-yellow-400 transition-all active:scale-95">
                  A, V, or P (Appropriate)
                </button>
              </div>
            </motion.div>
          )}

          {step === 'GREEN' && renderResult('bg-emerald-500', 'MINOR (GREEN)')}
          {step === 'YELLOW' && renderResult('bg-yellow-500', 'DELAYED (YELLOW)', 'text-black')}
          {step === 'RED' && renderResult('bg-red-600', 'IMMEDIATE (RED)')}
          {step === 'BLACK' && renderResult('bg-zinc-950 border border-white/10', 'DECEASED (BLACK)')}
        </AnimatePresence>
      </div>
    </div>
  );
}
