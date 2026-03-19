import React from 'react';
import { 
  AlertTriangle, 
  Flame, 
  Droplets, 
  RefreshCw, 
  ShieldAlert, 
  MapPin,
  ChevronRight,
  Baby,
  Brain
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface HomeScreenProps {
  onNavigate: (tab: 'protocols' | 'rx' | 'contacts' | 'tools' | 'email', tool?: string) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const navItems = [
    { title: "START Triage", icon: <AlertTriangle className="w-6 h-6" />, color: "border-red-600", bg: "bg-red-600/10", text: "text-red-500", tool: 'triage' },
    { title: "Burn / TBSA", icon: <Flame className="w-6 h-6" />, color: "border-red-600", bg: "bg-red-600/10", text: "text-red-500", tool: 'burn' },
    { title: "JumpSTART", icon: <Baby className="w-6 h-6" />, color: "border-blue-600", bg: "bg-blue-600/10", text: "text-blue-500", tool: 'jumpstart' },
    { title: "GCS", icon: <Brain className="w-6 h-6" />, color: "border-orange-500", bg: "bg-orange-500/10", text: "text-orange-500", tool: 'gcs' },
    { title: "MCI Officer", icon: <ShieldAlert className="w-6 h-6" />, color: "border-emerald-600", bg: "bg-emerald-600/10", text: "text-emerald-500", tool: 'mci' },
    { title: "Hospitals", icon: <MapPin className="w-6 h-6" />, color: "border-purple-600", bg: "bg-purple-600/10", text: "text-purple-500", tab: 'contacts' as const },
  ];

  return (
    <div className="flex flex-col items-center px-4 py-8">
      {/* Logo Section */}
      <div className="mb-8 flex flex-col items-center">
        <div className="w-32 h-32 mb-4 flex items-center justify-center">
          <img 
            src="/logo.png" 
            alt="Three Mile Fire Dept Logo" 
            className="w-full h-full object-contain drop-shadow-2xl"
            onError={(e) => {
              // Fallback to the Flame icon if the image isn't uploaded yet
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add('bg-red-600', 'rounded-2xl', 'shadow-2xl', 'shadow-red-900/40', 'transform', '-rotate-3');
              const fallback = document.createElement('div');
              fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>';
              e.currentTarget.parentElement?.appendChild(fallback.firstChild as Node);
            }}
          />
        </div>
        <h2 className="text-2xl font-black tracking-tighter text-red-600 uppercase text-center">Three Mile Fire Dept</h2>
        <p className="text-xs font-mono text-white/40 uppercase tracking-[0.2em] mt-1 text-center">Clinical & Tactical Suite</p>
      </div>

      {/* Static Disclaimer */}
      <div className="w-full bg-red-500/5 border border-red-500/20 rounded-xl p-3 mb-8 text-center">
        <p className="text-[10px] text-red-400 leading-relaxed">
          ⚠️ <span className="font-bold">Note:</span> Refer to official protocols for the most up-to-date data.
        </p>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {navItems.map((item, idx) => (
          <motion.button
            key={idx}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (item.tab) {
                onNavigate(item.tab);
              } else if (item.tool) {
                onNavigate('tools', item.tool);
              }
            }}
            className={cn(
              "flex items-center gap-3 p-4 rounded-2xl border-l-4 bg-white/5 border-white/10 hover:bg-white/10 transition-all text-left group",
              item.color
            )}
          >
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110", item.bg, item.text)}>
              {item.icon}
            </div>
            <span className="text-xs font-bold text-white/90 uppercase tracking-tight">{item.title}</span>
          </motion.button>
        ))}
      </div>

      {/* Protocols & RX Quick Access */}
      <div className="w-full max-w-md mt-8 space-y-3">
        <button 
          onClick={() => onNavigate('protocols')}
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/10 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-sm">Treatment Protocols</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Full Reference</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-emerald-500" />
        </button>

        <button 
          onClick={() => onNavigate('rx')}
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/10 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-sm">Medication Guide</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Dosing & Indications</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-emerald-500" />
        </button>
      </div>

      <footer className="mt-12 text-center">
        <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest">Serving Ravalli County</p>
      </footer>
    </div>
  );
}
