import React, { useState } from 'react';
import { ClipboardList, Users, AlertCircle, FileText, Plus, Minus, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface MciOfficerToolProps {
  onBack: () => void;
}

export default function MciOfficerTool({ onBack }: MciOfficerToolProps) {
  const [tally, setTally] = useState({
    red: 0,
    yellow: 0,
    green: 0,
    black: 0
  });

  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Establish Command / Identify as MCI IC', completed: false },
    { id: 2, text: 'Initial Size-up & Scene Safety', completed: false },
    { id: 3, text: 'Declare MCI & Level', completed: false },
    { id: 4, text: 'Request Additional Resources', completed: false },
    { id: 5, text: 'Establish Staging Area', completed: false },
    { id: 6, text: 'Designate Triage Officer', completed: false },
    { id: 7, text: 'Designate Treatment Officer', completed: false },
    { id: 8, text: 'Designate Transport Officer', completed: false },
    { id: 9, text: 'Establish Communication Plan', completed: false },
    { id: 10, text: 'Coordinate with Medical Control', completed: false }
  ]);

  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const updateTally = (color: keyof typeof tally, delta: number) => {
    setTally(prev => ({
      ...prev,
      [color]: Math.max(0, prev[color] + delta)
    }));
  };

  const toggleCheck = (id: number) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const totalPatients = tally.red + tally.yellow + tally.green + tally.black;

  const generateReport = () => {
    const report = `MCI SITUATION REPORT
Time: ${new Date().toLocaleTimeString()}
-------------------
PATIENT TALLY:
Immediate (Red): ${tally.red}
Delayed (Yellow): ${tally.yellow}
Minor (Green): ${tally.green}
Deceased (Black): ${tally.black}
Total Patients: ${totalPatients}
-------------------
CHECKLIST STATUS:
${checklist.map(c => `[${c.completed ? 'X' : ' '}] ${c.text}`).join('\n')}`;

    setGeneratedReport(report);
    setCopySuccess(false);
  };

  const copyToClipboard = async () => {
    if (!generatedReport) return;
    try {
      await navigator.clipboard.writeText(generatedReport);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-emerald-500" />
        </button>
        <div>
          <h2 className="text-xl font-bold">MCI Incident Command</h2>
          <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Command & Control Tool</p>
        </div>
      </div>

      {/* Patient Tally */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-emerald-500" />
          <h3 className="text-sm font-bold uppercase tracking-widest">Patient Tally</h3>
          <span className="ml-auto bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded text-[10px] font-bold">
            TOTAL: {totalPatients}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'red', label: 'IMMEDIATE', color: 'bg-red-500', text: 'text-red-500' },
            { key: 'yellow', label: 'DELAYED', color: 'bg-yellow-500', text: 'text-yellow-500' },
            { key: 'green', label: 'MINOR', color: 'bg-emerald-500', text: 'text-emerald-500' },
            { key: 'black', label: 'DECEASED', color: 'bg-zinc-800', text: 'text-zinc-400' }
          ].map(item => (
            <div key={item.key} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-3">
              <span className={cn("text-[10px] font-bold tracking-widest", item.text)}>{item.label}</span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => updateTally(item.key as any, -1)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-2xl font-bold font-mono">{tally[item.key as keyof typeof tally]}</span>
                <button 
                  onClick={() => updateTally(item.key as any, 1)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className={cn("w-full h-1 rounded-full", item.color)} />
            </div>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <ClipboardList className="w-5 h-5 text-blue-500" />
          <h3 className="text-sm font-bold uppercase tracking-widest">Operational Checklist</h3>
        </div>
        <div className="space-y-3">
          {checklist.map(item => (
            <button 
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
                item.completed 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-100" 
                  : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
              )}
            >
              <div className={cn(
                "flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                item.completed ? "bg-emerald-500 border-emerald-500" : "border-white/20"
              )}>
                {item.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>
              <span className="text-sm font-medium">{item.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          <h3 className="text-sm font-bold uppercase tracking-widest">Quick Guidelines</h3>
        </div>
        <div className="space-y-4 text-xs text-white/60 leading-relaxed">
          <p><strong className="text-white">MCI Level 1:</strong> 5-10 Patients</p>
          <p><strong className="text-white">MCI Level 2:</strong> 11-25 Patients</p>
          <p><strong className="text-white">MCI Level 3:</strong> 26-50 Patients</p>
          <p><strong className="text-white">MCI Level 4:</strong> 51-100 Patients</p>
          <p><strong className="text-white">MCI Level 5:</strong> 100+ Patients</p>
        </div>
      </div>

      {/* Report Summary */}
      <div className="space-y-4">
        <button 
          onClick={generateReport}
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between group hover:bg-white/10 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <FileText className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold">Generate MCI Report</h3>
              <p className="text-xs text-white/40">View and copy summary</p>
            </div>
          </div>
          <Plus className="w-5 h-5 text-white/20 group-hover:text-emerald-500" />
        </button>

        {generatedReport && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-[#1A1B1E] border border-white/10 rounded-2xl p-4 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-emerald-500">Generated Report</h4>
              <div className="flex items-center gap-2">
                <button 
                  onClick={copyToClipboard}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                >
                  <ClipboardList className="w-4 h-4" />
                  {copySuccess ? 'Copied!' : 'Copy'}
                </button>
                <button 
                  onClick={() => setGeneratedReport(null)}
                  className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <pre className="text-xs font-mono text-white/70 whitespace-pre-wrap bg-black/30 p-4 rounded-xl border border-white/5">
              {generatedReport}
            </pre>
          </motion.div>
        )}
      </div>
    </div>
  );
}
