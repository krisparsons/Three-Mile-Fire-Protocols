import React from 'react';
import { 
  ChevronRight,
  FileText,
  BookOpen,
  AlertTriangle,
  Flame,
  Brain,
  ShieldAlert,
  MapPin,
  QrCode,
  Baby
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

// Valid tab types based on App.tsx
type AppTab = 'home' | 'protocols' | 'rx' | 'contacts' | 'tools' | 'email';

interface HomeScreenProps {
  onNavigate: (tab: AppTab, tool?: string) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const logoUrl = "logo.png";

  const quickTools = [
    { title: "MCI IC Tool", icon: <ShieldAlert />, color: "border-blue-600", bg: "bg-blue-600/10", text: "text-blue-600 dark:text-blue-400", tool: 'mci' },
    { title: "START Triage", icon: <AlertTriangle />, color: "border-red-600", bg: "bg-red-600/10", text: "text-red-600 dark:text-red-400", tool: 'triage' },
    { title: "JumpSTART", icon: <Baby />, color: "border-teal-600", bg: "bg-teal-600/10", text: "text-teal-600 dark:text-teal-400", tool: 'jumpstart' },
    { title: "Burn / TBSA", icon: <Flame />, color: "border-red-600", bg: "bg-red-600/10", text: "text-red-600 dark:text-red-400", tool: 'burn' },
    { title: "GCS Calc", icon: <Brain />, color: "border-red-600", bg: "bg-red-600/10", text: "text-red-600 dark:text-red-400", tool: 'gcs' },
    { title: "Hospitals", icon: <MapPin />, color: "border-blue-700", bg: "bg-blue-700/10", text: "text-blue-700 dark:text-blue-400", tab: 'contacts' as AppTab },
  ];

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto py-8 px-4">
      {/* Visual Identity */}
      <div className="w-full flex flex-col items-center">
        <div className="w-48 h-48 mb-6 relative group transform hover:scale-105 transition-all duration-500">
          <div className="absolute inset-0 bg-red-600 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative w-full h-full flex items-center justify-center p-2 rounded-full transition-all duration-500">
            <img 
              src={logoUrl} 
              alt="TMF Maltese Cross" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">
            Three Mile <br/>
            <span className="text-red-700 dark:text-red-500">Fire Dept</span>
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="h-0.5 w-10 bg-red-700"></div>
            <p className="text-[11px] font-black font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.4em]">Unit Readiness: 1.1</p>
            <div className="h-0.5 w-10 bg-red-700"></div>
          </div>
        </div>
      </div>

      {/* Quick Tools Grid - Tactical Tile Layout */}
      <div className="w-full">
        <h3 className="text-[10px] font-black font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.3em] mb-4 px-2 flex items-center gap-2">
          Quick Deployment Tools
          <div className="flex-1 h-[1px] bg-zinc-200 dark:bg-zinc-800"></div>
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {quickTools.map((item, idx) => (
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
                "flex flex-col gap-3 p-4 rounded-3xl border-2 transition-all text-left group shadow-lg active:scale-95",
                "bg-white dark:bg-[#1C1C1E] border-zinc-100 dark:border-white/10 hover:border-red-600/30 dark:hover:border-red-500/30",
                "hover:shadow-red-900/5 dark:shadow-none"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-3 shadow-sm",
                item.bg, item.text,
                "dark:bg-white/10 dark:border dark:border-white/10"
              )}>
                {React.cloneElement(item.icon as React.ReactElement, { className: "w-5 h-5" })}
              </div>
              <div>
                <span className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-tighter block">{item.title}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="w-full flex flex-col gap-3">
        <button 
          onClick={() => onNavigate('tools', 'community-connect')}
          className="w-full bg-zinc-100 dark:bg-white/5 border-2 border-zinc-200 dark:border-white/10 rounded-3xl p-4 flex items-center justify-between group hover:bg-zinc-200 dark:hover:bg-white/10 transition-all font-black"
        >
          <div className="flex items-center gap-4 text-zinc-650 dark:text-zinc-400">
            <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xs uppercase tracking-widest text-zinc-900 dark:text-white">Community Connect</h3>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-1 transition-transform" />
        </button>

        <button 
          onClick={() => onNavigate('tools', 'billing')}
          className="w-full bg-zinc-100 dark:bg-white/5 border-2 border-zinc-200 dark:border-white/10 rounded-3xl p-4 flex items-center justify-between group hover:bg-zinc-200 dark:hover:bg-white/10 transition-all font-black"
        >
          <div className="flex items-center gap-4 text-zinc-650 dark:text-zinc-400">
            <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="text-xs uppercase tracking-widest text-zinc-900 dark:text-white">Billing & Recovery</h3>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <footer className="mt-4 text-center">
        <p className="text-[10px] text-zinc-400 dark:text-white/20 font-mono uppercase tracking-[0.2em] font-bold">Serving Ravalli County Emergency Services</p>
      </footer>
    </div>
  );
}
