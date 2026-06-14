import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Flame, 
  Stethoscope, 
  ShieldAlert, 
  Home,
  Phone, 
  ChevronRight, 
  ArrowLeft,
  Clock,
  Calculator,
  Menu,
  X,
  Info,
  Pill,
  Brain,
  Droplets,
  RefreshCw,
  AlertTriangle,
  Baby,
  MapPin,
  Mail,
  BookOpen,
  FileText,
  Activity,
  QrCode,
  User,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { PROTOCOLS, CONTACTS, MEDICATIONS, type Protocol, type Medication } from './data/protocols';
import ApgarCalculator from './components/ApgarCalculator';
import GcsCalculator from './components/GcsCalculator';
import DripRateCalculator from './components/DripRateCalculator';
import BurnCalculator from './components/BurnCalculator';
import StartTriage from './components/StartTriage';
import JumpStartTriage from './components/JumpStartTriage';
import EmailRouter from './components/EmailRouter';
import MciOfficerTool from './components/MciOfficerTool';
import HomeScreen from './components/HomeScreen';
import ProtocolAdmin from './components/ProtocolAdmin';
import MedicalAbbreviations from './components/MedicalAbbreviations';
import BillingRecoveryTool from './components/BillingRecoveryTool';
import NormVitals from './components/NormVitals';
import CommunityConnect from './components/CommunityConnect';
import Endorsements from './components/Endorsements';
import { Shield } from 'lucide-react';

type Tab = 'home' | 'protocols' | 'rx' | 'contacts' | 'tools' | 'email';
type Tool = 'apgar' | 'gcs' | 'drip' | 'burn' | 'converter' | 'triage' | 'jumpstart' | 'mci' | 'admin' | 'abbreviations' | 'billing' | 'vitals' | 'community-connect' | 'endorsements' | null;

export default function App() {
  const [protocols, setProtocols] = useState<Protocol[]>(PROTOCOLS);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>('Treatment');
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [selectedRxCategory, setSelectedRxCategory] = useState<'Medication Guide' | 'Endorsement Meds'>('Medication Guide');
  const [activeTool, setActiveTool] = useState<Tool>(null);
  const [treatmentSubTab, setTreatmentSubTab] = useState<'protocols' | 'skills'>('protocols');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return (saved as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const filteredProtocols = useMemo(() => {
    return protocols.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.subCategory && p.subCategory.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [protocols, searchQuery, selectedCategory]);

  const filteredMedications = useMemo(() => {
    return MEDICATIONS.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.indications.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const categories = ['Treatment', 'EMS', 'Fire'];

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-[#151619] text-zinc-900 dark:text-[#FFFFFF] font-sans selection:bg-red-500/30">
      {/* Header - Tactical Black in Light, Original Sleek in Dark */}
      <header className="sticky top-0 z-50 bg-zinc-900 dark:bg-[#151619]/90 backdrop-blur-md border-b-4 border-red-600 dark:border-b dark:border-white/10 px-4 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab('home')}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-red-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-12 h-12 bg-white rounded-xl p-1 shadow-2xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
              <img 
                src="logo.png" 
                alt="TMF Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white uppercase leading-none">TMF-OPS</h1>
          </div>
        </div>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/5 shadow-inner"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Main Content */}
      <main className="pb-24">
        {!hasAcknowledged ? (
          <div className="fixed inset-0 z-[100] bg-white dark:bg-[#151619] flex items-center justify-center p-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative z-[110]">
              <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <img 
                  src="logo.png" 
                  alt="Three Mile Fire Dept Logo" 
                  className="w-full h-full object-contain drop-shadow-2xl"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('bg-red-600', 'rounded-2xl', 'shadow-lg', 'shadow-red-900/40');
                    const fallback = document.createElement('div');
                    fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-zinc-900 dark:text-white"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>';
                    e.currentTarget.parentElement?.appendChild(fallback.firstChild as Node);
                  }}
                />
              </div>
              <h2 className="text-xl font-bold mb-4 tracking-tight">PROTOCOL ACKNOWLEDGMENT</h2>
              <p className="text-sm text-zinc-600 dark:text-white/60 leading-relaxed mb-8">
                By entering this app, you acknowledge that these tools are for 
                <span className="text-zinc-900 dark:text-white font-bold"> SUPPLEMENTAL USE ONLY</span>. 
                <br /><br />
                Always defer to the most current 
                <span className="text-zinc-900 dark:text-white font-bold"> Three Mile Fire Department SOGs/SOPs </span> 
                 and local Medical Director protocols.
              </p>
              <button 
                onClick={() => setHasAcknowledged(true)}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-red-900/20"
              >
                I ACKNOWLEDGE & ENTER
              </button>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <>
              {selectedProtocol ? (
            <motion.div
              key="protocol-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <button 
                onClick={() => setSelectedProtocol(null)}
                className="flex items-center gap-2 text-emerald-500 mb-6 hover:text-emerald-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Protocols</span>
              </button>

              <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-100 dark:border-white/5 rounded-3xl p-6 mb-6 shadow-xl shadow-zinc-100 dark:shadow-none">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded",
                    selectedProtocol.category === 'Treatment' ? "bg-blue-500/10 text-blue-500" :
                    selectedProtocol.category === 'Fire' ? "bg-orange-500/10 text-orange-400" :
                    "bg-emerald-500/10 text-emerald-400"
                  )}>
                    {selectedProtocol.category === 'Treatment' ? 'Clinical Treatment Protocol' : `Fire Department Operations Protocol > ${selectedProtocol.category === 'EMS' ? 'EMS' : 'Fire'}`}
                    {selectedProtocol.subCategory ? ` > ${selectedProtocol.subCategory}` : ''}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-white/20 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Updated: {selectedProtocol.lastUpdated}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-4">{selectedProtocol.title}</h2>
                <div className="space-y-4 mb-8">
                  {(() => {
                    const content = selectedProtocol.content;
                    const sectionKeys = [
                      'Purpose:',
                      'Scope:',
                      'Blue Card Integration:',
                      'Blue Card Integration',
                      'Blue Card Information:',
                      'Blue Card Information',
                      'Procedures:',
                      'Procedure:',
                      'References:',
                      'Reference:',
                      'Criteria:',
                      'Definition:',
                      'Definitions:',
                      'Category:',
                      'Categories:',
                      'Exception:',
                      'Exceptions:',
                      'Exception A:',
                      'Exception B:',
                      'Note:',
                      'Notes:',
                      'MANDATORY:',
                      'WARNING:',
                      'CAUTION:'
                    ];

                    // Sort keys by length descending to match longest patterns first
                    const sortedKeys = [...sectionKeys].sort((a, b) => b.length - a.length);
                    
                    // Add a pattern for bolded headers like **Header:**
                    const boldHeaderPattern = '\\*\\*[^\\*]+\\*\\*[:]?';
                    const regex = new RegExp(`(${sortedKeys.join('|')}|${boldHeaderPattern})`, 'g');
                    const parts = content.split(regex);

                    const result: React.ReactNode[] = [];
                    let currentSection: string | null = null;

                    for (let i = 0; i < parts.length; i++) {
                      const part = parts[i];
                      if (sectionKeys.includes(part) || /^\*\*.*\*\*[:]?$/.test(part)) {
                        currentSection = part;
                      } else if (part.trim()) {
                        if (currentSection) {
                          const cleanSection = currentSection.replace(/\*\*/g, '');
                          
                          const colorClass = 
                            cleanSection.startsWith('Purpose') ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-900 dark:text-blue-100' :
                            cleanSection.startsWith('Scope') ? 'bg-zinc-50 dark:bg-zinc-500/10 border-zinc-100 dark:border-zinc-500/20 text-zinc-900 dark:text-zinc-100' :
                            cleanSection.startsWith('Blue Card') ? 'bg-zinc-900 text-white border-black' :
                            cleanSection.startsWith('Procedure') ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-100' :
                            cleanSection.startsWith('Reference') ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-900 dark:text-blue-100' :
                            cleanSection.startsWith('Criteria') ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-900 dark:text-red-100' :
                            cleanSection.startsWith('Definition') ? 'bg-zinc-50 dark:bg-zinc-500/10 border-zinc-100 dark:border-zinc-500/20 text-zinc-900 dark:text-zinc-100' :
                            cleanSection.startsWith('Categor') ? 'bg-zinc-100 dark:bg-purple-500/10 border-zinc-200 dark:border-purple-500/20 text-zinc-900 dark:text-purple-100' :
                            cleanSection.startsWith('Exception') ? 'bg-red-600 text-white border-red-700' :
                            cleanSection.startsWith('MANDATORY') || cleanSection.startsWith('WARNING') || cleanSection.startsWith('CAUTION') ? 'bg-red-700 text-white border-red-800' :
                            cleanSection.startsWith('Note') ? 'bg-blue-600 text-white border-blue-700' :
                            cleanSection.startsWith('Adult') ? 'bg-blue-50 dark:bg-sky-500/10 border-blue-100 dark:border-sky-500/20 text-blue-900 dark:text-sky-100' :
                            cleanSection.startsWith('Pediatric') || cleanSection.startsWith('Child') ? 'bg-red-50 dark:bg-emerald-500/10 border-red-100 dark:border-emerald-500/20 text-red-900 dark:text-emerald-100' :
                            cleanSection.startsWith('Infant') || cleanSection.startsWith('Neonate') ? 'bg-zinc-100 dark:bg-fuchsia-500/10 border-zinc-200 dark:border-fuchsia-500/20 text-zinc-900 dark:text-fuchsia-100' :
                            'bg-zinc-50 dark:bg-slate-500/10 border-zinc-100 dark:border-slate-500/20 text-zinc-900 dark:text-slate-100';

                          const headerColor = 
                            cleanSection.startsWith('Purpose') ? 'text-blue-600 dark:text-blue-400' :
                            cleanSection.startsWith('Scope') ? 'text-zinc-600 dark:text-zinc-400' :
                            cleanSection.startsWith('Blue Card') ? 'text-white/60 dark:text-indigo-400' :
                            cleanSection.startsWith('Procedure') ? 'text-emerald-600 dark:text-emerald-400' :
                            cleanSection.startsWith('Reference') ? 'text-blue-600 dark:text-blue-400' :
                            cleanSection.startsWith('Criteria') ? 'text-red-600 dark:text-red-400' :
                            cleanSection.startsWith('Definition') ? 'text-zinc-600 dark:text-zinc-400' :
                            cleanSection.startsWith('Categor') ? 'text-zinc-500 dark:text-purple-400' :
                            cleanSection.startsWith('Exception') ? 'text-white/80 dark:text-red-400' :
                            cleanSection.startsWith('MANDATORY') || cleanSection.startsWith('WARNING') || cleanSection.startsWith('CAUTION') ? 'text-white font-black' :
                            cleanSection.startsWith('Note') ? 'text-white/80 dark:text-blue-300' :
                            cleanSection.startsWith('Adult') ? 'text-blue-600 dark:text-sky-400' :
                            cleanSection.startsWith('Pediatric') || cleanSection.startsWith('Child') ? 'text-red-600 dark:text-emerald-400' :
                            cleanSection.startsWith('Infant') || cleanSection.startsWith('Neonate') ? 'text-zinc-600 dark:text-fuchsia-400' :
                            'text-zinc-500 dark:text-slate-400';

                          result.push(
                            <div key={i} className={cn("p-4 rounded-2xl border", colorClass)}>
                              <h4 className={cn("text-[10px] font-bold uppercase tracking-widest mb-2", headerColor)}>
                                {cleanSection.endsWith(':') ? cleanSection : `${cleanSection}:`}
                              </h4>
                              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                {part.trim()}
                              </div>
                            </div>
                          );
                          currentSection = null;
                        } else {
                          result.push(
                            <div key={i} className="text-zinc-700 dark:text-white/80 leading-relaxed whitespace-pre-wrap text-sm px-2">
                              {part}
                            </div>
                          );
                        }
                      }
                    }

                    return result.length > 0 ? result : (
                      <p className="text-white/80 leading-relaxed whitespace-pre-wrap text-sm">
                        {content}
                      </p>
                    );
                  })()}
                </div>

                {selectedProtocol.steps && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Action Steps</h3>
                    {selectedProtocol.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-4 group">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                          {idx + 1}
                        </div>
                        <p className="text-sm pt-0.5 text-zinc-800 dark:text-white/90">{step}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : selectedMedication ? (
            <motion.div
              key="medication-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <button 
                onClick={() => setSelectedMedication(null)}
                className="flex items-center gap-2 text-emerald-500 mb-6 hover:text-emerald-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Medications</span>
              </button>

              <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-100 dark:border-white/5 rounded-3xl p-6 mb-6 shadow-xl shadow-zinc-100 dark:shadow-none">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">{selectedMedication.name}</h2>
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-white/20 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Updated: {selectedMedication.lastUpdated}
                  </span>
                </div>

                {/* Dosing at the top as requested */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {selectedMedication.dosingDetails?.adult && selectedMedication.dosingDetails.adult.length > 0 && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-3 flex items-center gap-2">
                        <User className="w-3 h-3" /> Adult Dosing
                      </h3>
                      <div className="space-y-3">
                        {selectedMedication.dosingDetails.adult.map((d, i) => (
                          <div key={i} className="bg-black/20 rounded-lg p-3 border border-white/5">
                            <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded mb-2">
                              {d.route}
                            </span>
                            <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">{d.dose}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedMedication.dosingDetails?.pediatric && selectedMedication.dosingDetails.pediatric.length > 0 && (
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-3 flex items-center gap-2">
                        <Baby className="w-3 h-3" /> Pediatric Dosing
                      </h3>
                      <div className="space-y-3">
                        {selectedMedication.dosingDetails.pediatric.map((d, i) => (
                          <div key={i} className="bg-black/20 rounded-lg p-3 border border-white/5">
                            <span className="inline-block px-2 py-1 bg-purple-500/20 text-purple-300 text-[10px] font-bold rounded mb-2">
                              {d.route}
                            </span>
                            <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">{d.dose}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {selectedMedication.class && (
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Class</h3>
                      <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{selectedMedication.class}</p>
                    </div>
                  )}

                  {selectedMedication.mechanism && (
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Mechanism of Action</h3>
                      <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{selectedMedication.mechanism}</p>
                    </div>
                  )}

                  {selectedMedication.pharmacokinetics && (
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Pharmacokinetics</h3>
                      <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{selectedMedication.pharmacokinetics}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Indications</h3>
                    <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{selectedMedication.indications}</p>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-1">Contraindications</h3>
                    <p className="text-sm text-red-400 leading-relaxed font-medium whitespace-pre-wrap">{selectedMedication.contraindications}</p>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Side Effects</h3>
                    <p className="text-sm text-zinc-600 dark:text-white/70 leading-relaxed italic whitespace-pre-wrap">{selectedMedication.sideEffects}</p>
                  </div>

                  {selectedMedication.precautions && (
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-1">Precautions</h3>
                      <p className="text-sm text-orange-400/80 leading-relaxed whitespace-pre-wrap">{selectedMedication.precautions}</p>
                    </div>
                  )}

                  {selectedMedication.reference && (
                    <div className="pt-4 border-t border-white/5">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-white/20 mb-1">Reference</h3>
                      <p className="text-[10px] text-zinc-400 dark:text-white/30 leading-relaxed">{selectedMedication.reference}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : activeTool === 'apgar' ? (
            <motion.div
              key="apgar-calculator"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <ApgarCalculator onBack={() => setActiveTool(null)} />
            </motion.div>
          ) : activeTool === 'gcs' ? (
            <motion.div
              key="gcs-calculator"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <GcsCalculator onBack={() => setActiveTool(null)} />
            </motion.div>
          ) : activeTool === 'drip' ? (
            <motion.div
              key="drip-calculator"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <DripRateCalculator onBack={() => setActiveTool(null)} />
            </motion.div>
          ) : activeTool === 'burn' ? (
            <motion.div
              key="burn-calculator"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <BurnCalculator onBack={() => setActiveTool(null)} />
            </motion.div>
          ) : activeTool === 'gcs' ? (
            <motion.div
              key="gcs-calculator"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <GcsCalculator onBack={() => setActiveTool(null)} />
            </motion.div>
          ) : activeTool === 'triage' ? (
            <motion.div
              key="start-triage"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <StartTriage onBack={() => setActiveTool(null)} />
            </motion.div>
          ) : activeTool === 'jumpstart' ? (
            <motion.div
              key="jumpstart-triage"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <JumpStartTriage onBack={() => setActiveTool(null)} />
            </motion.div>
          ) : activeTool === 'mci' ? (
            <motion.div
              key="mci-tool"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <MciOfficerTool onBack={() => setActiveTool(null)} />
            </motion.div>
          ) : activeTool === 'admin' ? (
            <motion.div
              key="protocol-admin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <ProtocolAdmin protocols={protocols} setProtocols={setProtocols} onBack={() => setActiveTool(null)} />
            </motion.div>
          ) : activeTool === 'abbreviations' ? (
            <motion.div
              key="medical-abbreviations"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <MedicalAbbreviations onBack={() => setActiveTool(null)} />
            </motion.div>
          ) : activeTool === 'billing' ? (
            <motion.div
              key="billing-recovery"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <BillingRecoveryTool onBack={() => setActiveTool(null)} />
            </motion.div>
          ) : activeTool === 'community-connect' ? (
            <motion.div
              key="community-connect"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <CommunityConnect onBack={() => setActiveTool(null)} />
            </motion.div>
          ) : activeTool === 'vitals' ? (
            <motion.div
              key="norm-vitals"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <NormVitals onBack={() => setActiveTool(null)} />
            </motion.div>
          ) : activeTool === 'endorsements' ? (
            <motion.div
              key="endorsements"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <Endorsements onBack={() => setActiveTool(null)} />
            </motion.div>
          ) : activeTab === 'home' ? (
            <div key="home" className="p-4">
              <HomeScreen onNavigate={(tab, tool) => {
                setActiveTab(tab);
                if (tool) setActiveTool(tool as Tool);
                setSelectedProtocol(null);
                setSelectedMedication(null);
              }} />
            </div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4"
            >
               {(activeTab === 'protocols' || activeTab === 'rx') && (
                <>
                  {/* Search and Filters */}
                      <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600" />
                        <input 
                          type="text"
                          placeholder={activeTab === 'protocols' ? (selectedCategory === 'Treatment' && treatmentSubTab === 'skills' ? "SEARCH CLINICAL SKILLS..." : "SEARCH PROTOCOLS...") : "SEARCH DRUGS..."}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-red-600/10 focus:border-red-600 transition-all shadow-xl shadow-zinc-200 dark:shadow-none placeholder:text-zinc-300 dark:placeholder:text-white/20 text-zinc-900 dark:text-white font-bold"
                        />
                      </div>

                  {activeTab === 'protocols' && (
                    <div className="mb-6 space-y-4">
                      <div className="bg-zinc-200/50 dark:bg-white/5 p-1 rounded-2xl border border-zinc-200 dark:border-white/10 grid grid-cols-3 gap-1 shadow-md">
                        <button 
                          onClick={() => {
                            setSelectedCategory('Treatment');
                          }}
                          className={cn(
                            "py-3 px-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex flex-col md:flex-row items-center justify-center gap-2",
                            selectedCategory === 'Treatment'
                              ? "bg-red-650 text-white shadow"
                              : "text-zinc-600 dark:text-white/60 hover:text-zinc-950 dark:hover:text-white font-bold"
                          )}
                        >
                          <Stethoscope className="w-4 h-4 shrink-0" />
                          <span className="text-[10px] md:text-xs">Tx Protocols</span>
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedCategory('EMS');
                          }}
                          className={cn(
                            "py-3 px-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex flex-col md:flex-row items-center justify-center gap-2",
                            selectedCategory === 'EMS'
                              ? "bg-blue-600 text-white shadow"
                              : "text-zinc-600 dark:text-white/60 hover:text-zinc-950 dark:hover:text-white font-bold"
                          )}
                        >
                          <ShieldAlert className="w-4 h-4 shrink-0" />
                          <span className="text-[10px] md:text-xs">FD EMS Ops</span>
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedCategory('Fire');
                          }}
                          className={cn(
                            "py-3 px-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex flex-col md:flex-row items-center justify-center gap-2",
                            selectedCategory === 'Fire'
                              ? "bg-amber-600 text-white shadow"
                              : "text-zinc-600 dark:text-white/60 hover:text-zinc-950 dark:hover:text-white font-bold"
                          )}
                        >
                          <Flame className="w-4 h-4 shrink-0" />
                          <span className="text-[10px] md:text-xs">FD Fire Ops</span>
                        </button>
                      </div>

                      {/* Inner selector for Treatment category (rearranged: Clinical Skills is first) */}
                      {selectedCategory === 'Treatment' && (
                        <div className="flex bg-zinc-100 dark:bg-zinc-800/40 p-1 rounded-2xl border border-zinc-200/80 dark:border-white/5 max-w-sm mx-auto shadow-inner animate-fade-in">
                          <button
                            onClick={() => setTreatmentSubTab('skills')}
                            className={cn(
                              "flex-1 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5",
                              treatmentSubTab === 'skills'
                                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md font-bold"
                                : "text-zinc-600 dark:text-white/60 hover:text-zinc-950 dark:hover:text-white font-bold"
                            )}
                          >
                            <Activity className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Clinical Skills</span>
                          </button>
                          <button
                            onClick={() => setTreatmentSubTab('protocols')}
                            className={cn(
                              "flex-1 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5",
                              treatmentSubTab === 'protocols'
                                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md font-bold"
                                : "text-zinc-600 dark:text-white/60 hover:text-zinc-950 dark:hover:text-white font-bold"
                            )}
                          >
                            <Stethoscope className="w-3.5 h-3.5 text-red-500" />
                            <span>Protocols</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'rx' && (
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-6">
              {['Medication Guide', 'Endorsement Meds'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedRxCategory(cat as 'Medication Guide' | 'Endorsement Meds')}
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border-2 uppercase tracking-widest",
                    selectedRxCategory === cat 
                      ? "bg-red-600 border-red-700 text-white shadow-lg shadow-red-200" 
                      : "bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white/60 hover:bg-zinc-100"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
                  )}
                </>
              )}

              {activeTab === 'protocols' && (
                <div className="space-y-3">
                  {selectedCategory === 'Treatment' && treatmentSubTab === 'skills' ? (
                    <Endorsements 
                      searchQuery={searchQuery}
                      hideHeader={true}
                      activeSectionProp="skills"
                    />
                  ) : (selectedCategory === 'Fire' || selectedCategory === 'EMS') && searchQuery === '' ? (
                    // Grouped by subCategory when in Fire or EMS tab and not searching
                    (() => {
                      const grouped = filteredProtocols.reduce((acc, p) => {
                        const sub = p.subCategory || 'General';
                        if (!acc[sub]) acc[sub] = [];
                        acc[sub].push(p);
                        return acc;
                      }, {} as Record<string, Protocol[]>);
                      
                      // Define order for sub-categories
                      const fireOrder = [
                        'Incident Response',
                        'Command Operations',
                        'Safety & Personnel',
                        'Operations',
                        'Training & Administration',
                        'Post-Incident & Administrative',
                        'Special Operations',
                        'Appendices'
                      ];

                      const emsOrder = [
                        'General Operations',
                        'Transport Policy',
                        'Documentation',
                        'Operational Readiness',
                        'Medication & Safety',
                        'Special Response',
                        'MCI & Disaster Response',
                        'Communications & Facilities',
                        'Appendices'
                      ];

                      const order = selectedCategory === 'Fire' ? fireOrder : emsOrder;

                      const sortedKeys = Object.keys(grouped).sort((a, b) => {
                        const indexA = order.indexOf(a);
                        const indexB = order.indexOf(b);
                        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                        if (indexA !== -1) return -1;
                        if (indexB !== -1) return 1;
                        return a.localeCompare(b);
                      });

                      return sortedKeys.map(subCategory => (
                        <div key={subCategory} className="space-y-2">
                          <div className="flex items-center gap-3 px-2 mt-8 mb-3">
                            <div className="h-4 w-1 bg-red-600 dark:bg-emerald-600 rounded-full"></div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white/40">
                              {subCategory}
                            </h3>
                            <div className="flex-1 h-[1px] bg-zinc-200 dark:bg-white/5"></div>
                          </div>
                          {grouped[subCategory].map(protocol => (
                            <button
                              key={protocol.id}
                              onClick={() => setSelectedProtocol(protocol)}
                              className={cn(
                                "w-full border-2 rounded-2xl p-4 flex items-center justify-between group transition-all active:scale-[0.98] shadow-sm",
                                "dark:bg-[#1C1C1E] dark:border-white/5 dark:hover:bg-zinc-800/50 dark:shadow-none",
                                selectedCategory === 'Fire' 
                                  ? "bg-white border-zinc-100 text-zinc-900 hover:border-red-600/50" 
                                  : "bg-white border-zinc-100 text-zinc-900 hover:border-blue-600/50"
                              )}
                            >
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-105",
                                  selectedCategory === 'Fire' 
                                    ? "bg-red-600 text-white shadow-lg shadow-red-200 dark:shadow-none" 
                                    : "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none"
                                )}>
                                  {selectedCategory === 'Fire' ? <Flame className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                                </div>
                                <div className="text-left">
                                  <h3 className="font-black text-sm uppercase tracking-tight group-hover:text-red-600 dark:group-hover:text-emerald-400 dark:text-white transition-colors leading-tight">{protocol.title}</h3>
                                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                    <span className="inline-block px-1.5 py-0.5 bg-zinc-100 dark:bg-white/5 text-[8px] font-black uppercase tracking-widest text-zinc-500 dark:text-white/40 rounded animate-fade-in">
                                      {protocol.subCategory || protocol.category}
                                    </span>
                                    <span className="inline-block px-1.5 py-0.5 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-[8px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 rounded animate-fade-in">
                                      Fire Department Operations Protocol
                                    </span>
                                  </div>
                                </div>
                              </div>
                      <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-white/5 flex items-center justify-center text-zinc-300 dark:text-white/20 group-hover:text-red-500 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                            </button>
                          ))}
                        </div>
                      ));
                    })()
                  ) : (
                    filteredProtocols.map(protocol => {
                      const isFire = protocol.category === 'Fire';
                      const isEms = protocol.category === 'EMS';
                      const isTreatment = protocol.category === 'Treatment';
                      return (
                        <button
                          key={protocol.id}
                          onClick={() => setSelectedProtocol(protocol)}
                          className={cn(
                            "w-full border-2 rounded-2xl p-4 flex items-center justify-between group transition-all active:scale-[0.98] shadow-sm text-left",
                            "bg-white border-zinc-100 dark:bg-[#1C1C1E] dark:border-white/5 dark:hover:bg-zinc-800/50 dark:shadow-none text-zinc-900 dark:text-white",
                            isFire ? "hover:border-red-600/50" : "hover:border-blue-600/50"
                          )}
                        >
                          <div className="flex items-center gap-4 text-left">
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 shrink-0",
                              isTreatment ? "bg-red-600 text-white shadow-lg shadow-red-200 dark:shadow-none" :
                              isFire ? "bg-red-600 text-white shadow-lg shadow-red-200 dark:shadow-none" :
                              "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none"
                            )}>
                              {isTreatment ? <Stethoscope className="w-6 h-6" /> :
                               isFire ? <Flame className="w-6 h-6" /> : 
                               <ShieldAlert className="w-6 h-6" />}
                            </div>
                            <div className="text-left">
                              <h3 className="font-black text-sm uppercase tracking-tight group-hover:text-red-600 dark:group-hover:text-emerald-400 dark:text-white transition-colors leading-tight">{protocol.title}</h3>
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-white/5 text-[8px] font-black uppercase tracking-widest text-zinc-500 dark:text-white/40 rounded">
                                  {isTreatment ? 'Clinical Protocol' : (protocol.subCategory || protocol.category)}
                                </span>
                                {!isTreatment && (
                                  <span className="px-1.5 py-0.5 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-[8px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 rounded">
                                    Fire Department Operations Protocol
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-white/5 flex items-center justify-center text-zinc-300 dark:text-white/20 group-hover:text-red-500 transition-colors shrink-0">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </button>
                      );
                    })
                  )}
                  {filteredProtocols.length === 0 && (
                    <div className="text-center py-12">
                      <Info className="w-12 h-12 text-zinc-300 dark:text-white/10 mx-auto mb-4" />
                      <p className="text-white/40 text-sm">No protocols found matching your search.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'rx' && selectedRxCategory === 'Medication Guide' && (
                <div className="space-y-3">
                  {filteredMedications.map(med => (
                    <button
                      key={med.id}
                      onClick={() => setSelectedMedication(med)}
                      className="w-full bg-white dark:bg-[#1C1C1E] border-2 border-zinc-100 dark:border-white/5 rounded-2xl p-4 flex items-center justify-between group transition-all active:scale-[0.98] shadow-sm dark:shadow-none"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-105",
                          "bg-zinc-900 border-zinc-800 text-white shadow-lg shadow-zinc-200 dark:shadow-none"
                        )}>
                          <Pill className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-black text-sm uppercase tracking-tight group-hover:text-red-600 dark:group-hover:text-emerald-400 dark:text-white transition-colors leading-tight">{med.name}</h3>
                          <span className="inline-block px-1.5 py-0.5 mt-1 bg-zinc-100 dark:bg-white/10 text-[8px] font-black uppercase tracking-widest text-zinc-500 rounded">
                            Medication Guide
                          </span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-white/5 flex items-center justify-center text-zinc-300 dark:text-white/20 group-hover:text-red-500 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </button>
                  ))}
                  {filteredMedications.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Info className="w-8 h-8 text-zinc-300" />
                      </div>
                      <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">No Deployment Records Found</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'rx' && selectedRxCategory === 'Endorsement Meds' && (
                <Endorsements 
                  searchQuery={searchQuery}
                  hideHeader={true}
                  activeSectionProp="meds"
                />
              )}

              {activeTab === 'contacts' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3 px-2 mb-6">
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic">Tactical Directory</h2>
                    <div className="flex-1 h-[1px] bg-red-600/20"></div>
                  </div>
                  {(() => {
                    const grouped = CONTACTS.reduce((acc, contact) => {
                      const cat = contact.category || 'Other';
                      if (!acc[cat]) acc[cat] = [];
                      acc[cat].push(contact);
                      return acc;
                    }, {} as Record<string, typeof CONTACTS>);

                    const order = ['Department Members', 'Hospital & Trauma Centers', 'Dispatch & Emergency Services'];
                    const sortedKeys = Object.keys(grouped).sort((a, b) => {
                      const indexA = order.indexOf(a);
                      const indexB = order.indexOf(b);
                      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                      if (indexA !== -1) return -1;
                      if (indexB !== -1) return 1;
                      return a.localeCompare(b);
                    });

                    return sortedKeys.map(category => (
                      <div key={category} className="space-y-3">
                        <div className="flex items-center gap-3 px-2 mb-3">
                          <div className="h-4 w-1 bg-zinc-900 dark:bg-red-600 rounded-full"></div>
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                            {category}
                          </h3>
                        </div>
                        {grouped[category].map(contact => (
                          <div key={contact.id} className="bg-white dark:bg-white/5 border-2 border-zinc-100 dark:border-white/10 rounded-3xl p-5 shadow-lg shadow-zinc-100 dark:shadow-none">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="font-black text-base uppercase tracking-tight text-zinc-900 dark:text-white">{contact.name}</h3>
                                <p className="text-[10px] text-red-600 font-black uppercase tracking-[0.2em] mt-1">{contact.role}</p>
                              </div>
                              <div className="flex gap-2">
                                {contact.address && (
                                  <button 
                                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address!)}`, '_blank')}
                                    className="w-12 h-12 bg-zinc-100 border-2 border-zinc-200 dark:bg-white/10 dark:border-white/10 rounded-2xl flex items-center justify-center text-zinc-900 dark:text-white hover:bg-zinc-900 hover:text-white transition-all shadow-sm"
                                  >
                                    <MapPin className="w-5 h-5" />
                                  </button>
                                )}
                                <a 
                                  href={`tel:${contact.phone}`}
                                  className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                                >
                                  <Phone className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                            {(contact.specialty || contact.address) && (
                              <div className="pt-3 border-t border-white/5 space-y-1">
                                {contact.specialty && (
                                  <p className="text-[10px] text-emerald-400/80 leading-tight">
                                    <span className="font-bold">SPECIALTY:</span> {contact.specialty}
                                  </p>
                                )}
                                {contact.address && (
                                  <p className="text-[10px] text-white/30 leading-tight">
                                    <span className="font-bold">ADDR:</span> {contact.address}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ));
                  })()}
                </div>
              )}

              {activeTab === 'tools' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold mb-6">Field Tools</h2>
                    <div className="space-y-6">
                      {/* Clinical Section */}
                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-white/30 mb-4 px-1">Clinical Calculators</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            onClick={() => setActiveTool('drip')}
                            className="bg-blue-50/60 dark:bg-white/5 border border-blue-200/50 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-lg shadow-blue-100/20 dark:shadow-none hover:scale-105 active:scale-95 transition-all text-zinc-900 dark:text-white group"
                          >
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center dark:bg-white/20 dark:text-white">
                              <Droplets className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">Drip Rate</span>
                          </button>
                          <button 
                            onClick={() => setActiveTool('gcs')}
                            className="bg-red-50/60 dark:bg-white/5 border border-red-200/50 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-lg shadow-red-100/20 dark:shadow-none hover:scale-105 active:scale-95 transition-all text-zinc-900 dark:text-white group"
                          >
                            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center dark:bg-white/20 dark:text-white">
                              <Brain className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">GCS Calc</span>
                          </button>
                          <button 
                            onClick={() => setActiveTool('apgar')}
                            className="bg-zinc-50/60 dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-lg shadow-zinc-100/20 dark:shadow-none hover:scale-105 active:scale-95 transition-all text-zinc-900 dark:text-white group"
                          >
                            <div className="w-12 h-12 rounded-full bg-zinc-500/10 text-zinc-600 flex items-center justify-center dark:bg-white/20 dark:text-white">
                              <Clock className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">APGAR</span>
                          </button>
                          <button 
                            onClick={() => setActiveTool('burn')}
                            className="bg-red-50/60 dark:bg-white/5 border border-red-200/50 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-lg shadow-red-100/20 dark:shadow-none hover:scale-105 active:scale-95 transition-all text-zinc-900 dark:text-white group"
                          >
                            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center dark:bg-white/20 dark:text-white">
                              <Flame className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">Burn Calc</span>
                          </button>
                          <button 
                            onClick={() => setActiveTool('converter')}
                            className="bg-blue-50/60 dark:bg-white/5 border border-blue-200/50 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-lg shadow-blue-100/20 dark:shadow-none hover:scale-105 active:scale-95 transition-all text-zinc-900 dark:text-white group"
                          >
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center dark:bg-white/20 dark:text-white">
                              <RefreshCw className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">Unit Convert</span>
                          </button>
                          <button 
                            onClick={() => setActiveTool('vitals')}
                            className="bg-red-50/60 dark:bg-white/5 border border-red-200/50 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-lg shadow-red-100/20 dark:shadow-none hover:scale-105 active:scale-95 transition-all text-zinc-900 dark:text-white group"
                          >
                            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center dark:bg-white/20 dark:text-white">
                              <Activity className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">Norm Vitals</span>
                          </button>
                        </div>
                      </div>

                      {/* Divider Line */}
                      <div className="h-px bg-zinc-200 dark:bg-white/10 w-full" />

                      {/* MCI Section */}
                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-600/60 dark:text-red-500/60 mb-4 px-1">MCI / Triage</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            onClick={() => setActiveTool('mci')}
                            className="bg-blue-50/60 dark:bg-white/5 border border-blue-200/50 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-lg shadow-blue-100/20 dark:shadow-none hover:scale-105 active:scale-95 transition-all text-zinc-900 dark:text-white group"
                          >
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center dark:bg-white/20 dark:text-white">
                              <ShieldAlert className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-center">MCI IC Tool</span>
                          </button>
                          <button 
                            onClick={() => setActiveTool('triage')}
                            className="bg-red-50/60 dark:bg-white/5 border border-red-200/50 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-lg shadow-red-100/20 dark:shadow-none hover:scale-105 active:scale-95 transition-all text-zinc-900 dark:text-white group"
                          >
                            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center dark:bg-white/20 dark:text-white">
                              <AlertTriangle className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">START Triage</span>
                          </button>
                          <button 
                            onClick={() => setActiveTool('jumpstart')}
                            className="bg-blue-50/60 dark:bg-white/5 border border-blue-200/50 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-lg shadow-blue-100/20 dark:shadow-none hover:scale-105 active:scale-95 transition-all text-zinc-900 dark:text-white group"
                          >
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center dark:bg-white/20 dark:text-white">
                              <Baby className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-center">JumpSTART</span>
                          </button>
                        </div>
                      </div>

                      {/* Divider Line */}
                      <div className="h-px bg-zinc-200 dark:bg-white/10 w-full" />

                      {/* Reference Section */}
                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-indigo-500/60 mb-4 px-1">Reference</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            onClick={() => setActiveTool('abbreviations')}
                            className="bg-zinc-50/60 dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-lg shadow-zinc-100/20 dark:shadow-none hover:scale-105 active:scale-95 transition-all text-zinc-900 dark:text-white group"
                          >
                            <div className="w-12 h-12 rounded-full bg-zinc-500/10 text-zinc-600 flex items-center justify-center dark:bg-white/20 dark:text-white">
                              <BookOpen className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-center">Abbreviations</span>
                          </button>
                          <button 
                            onClick={() => setActiveTool('billing')}
                            className="bg-red-50/60 dark:bg-white/5 border border-red-200/50 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-lg shadow-red-100/20 dark:shadow-none hover:scale-105 active:scale-95 transition-all text-zinc-900 dark:text-white group"
                          >
                            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center dark:bg-white/20 dark:text-white">
                              <FileText className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-center">Billing Submission</span>
                          </button>
                          <button 
                            onClick={() => setActiveTool('community-connect')}
                            className="bg-blue-50/60 dark:bg-white/5 border border-blue-200/50 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-lg shadow-blue-100/20 dark:shadow-none hover:scale-105 active:scale-95 transition-all text-zinc-900 dark:text-white group"
                          >
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center dark:bg-white/20 dark:text-white">
                              <QrCode className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-center">Community Connect</span>
                          </button>
                        </div>
                      </div>

                      {/* Divider Line */}
                      <div className="h-px bg-zinc-200 dark:bg-white/10 w-full" />

                      {/* Admin Section */}
                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-purple-500/60 mb-4 px-1">Administration</h3>
                        <div className="grid grid-cols-1 gap-4">
                          <button 
                            onClick={() => setActiveTool('admin')}
                            className="bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 flex items-center justify-between group hover:bg-zinc-200 dark:hover:bg-white/10 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                                <Shield className="w-6 h-6" />
                              </div>
                              <div className="text-left">
                                <h3 className="font-bold text-zinc-900 dark:text-white">Protocol Admin</h3>
                                <p className="text-xs text-zinc-500 dark:text-white/40">Add, edit, or remove protocols</p>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-zinc-300 dark:text-white/20 group-hover:text-purple-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'email' && (
                <EmailRouter />
              )}
            </motion.div>
          )}
          </>
        </AnimatePresence>
      )}
      </main>

      {/* Bottom Navigation - Tactical Black in Light, Original Sleek in Dark */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 dark:bg-[#151619]/90 dark:backdrop-blur-xl border-t-2 border-red-600 dark:border-white/10 px-4 py-4 flex items-center justify-between z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] dark:shadow-none">
        <NavButton 
          active={activeTab === 'home'} 
          onClick={() => { setActiveTab('home'); setSelectedProtocol(null); setSelectedMedication(null); setActiveTool(null); }}
          icon={<Home className="w-6 h-6" />}
          label="Ops"
        />
        <NavButton 
          active={activeTab === 'protocols'} 
          onClick={() => { setActiveTab('protocols'); setSelectedProtocol(null); setSelectedMedication(null); setActiveTool(null); }}
          icon={<BookOpen className="w-6 h-6" />}
          label="Tx Protocol"
        />
        <NavButton 
          active={activeTab === 'rx'} 
          onClick={() => { setActiveTab('rx'); setSelectedProtocol(null); setSelectedMedication(null); setActiveTool(null); }}
          icon={<Pill className="w-6 h-6" />}
          label="Drugs"
        />
        <NavButton 
          active={activeTab === 'tools'} 
          onClick={() => { setActiveTab('tools'); setSelectedProtocol(null); setSelectedMedication(null); setActiveTool(null); }}
          icon={<Calculator className="w-6 h-6" />}
          label="Tools"
        />
        <NavButton 
          active={activeTab === 'contacts'} 
          onClick={() => { setActiveTab('contacts'); setSelectedProtocol(null); setSelectedMedication(null); setActiveTool(null); }}
          icon={<Phone className="w-6 h-6" />}
          label="Dispatch"
        />
        <NavButton 
          active={activeTab === 'email'} 
          onClick={() => { setActiveTab('email'); setSelectedProtocol(null); setSelectedMedication(null); setActiveTool(null); }}
          icon={<Mail className="w-6 h-6" />}
          label="Email"
        />
      </nav>

      {/* Side Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-white dark:bg-[#1A1B1E] border-l border-zinc-200 dark:border-white/10 z-[70] p-6"
            >
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-xl font-bold">Settings</h2>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-zinc-100 dark:bg-white/5 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-white/30">Application</h3>
                  
                  <button 
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="w-full flex items-center justify-between p-4 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl hover:bg-zinc-200 dark:hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-white/10 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-zinc-600 dark:text-white" />
                      </div>
                      <span className="text-sm font-medium">Dark Mode</span>
                    </div>
                    <div className={cn(
                      "w-12 h-6 rounded-full p-1 transition-colors duration-200",
                      theme === 'dark' ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"
                    )}>
                      <div className={cn(
                        "w-4 h-4 bg-white rounded-full transition-transform duration-200",
                        theme === 'dark' ? "translate-x-6" : "translate-x-0"
                      )} />
                    </div>
                  </button>

                  <div className="p-4 bg-zinc-100 dark:bg-white/5 rounded-2xl border border-zinc-200 dark:border-white/10">
                    <p className="text-xs text-zinc-500 dark:text-white/40 leading-relaxed italic">
                      Protocol database is automatically synced for offline use when connected to the internet.
                    </p>
                  </div>
                </div>

                <div className="pt-12">
                  <p className="text-[10px] text-center text-zinc-400 dark:text-white/20 font-mono">
                    Three Mile Fire Dept.<br />
                    Protocol System v1.1<br />
                    © 2024 All Rights Reserved
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 min-w-[56px] transition-all relative py-1",
        active ? "text-red-500 scale-110" : "text-white/40 hover:text-white"
      )}
    >
      <div className={cn(
        "p-1.5 rounded-xl transition-all",
        active ? "bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : ""
      )}>
        {icon}
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest leading-none">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-indicator"
          className="absolute -bottom-1 w-1 h-1 bg-red-500 rounded-full"
        />
      )}
    </button>
  );
}
