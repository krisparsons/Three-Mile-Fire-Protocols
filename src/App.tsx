import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Flame, 
  Stethoscope, 
  ShieldAlert, 
  Settings, 
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
  Activity,
  QrCode,
  User
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
import NormVitals from './components/NormVitals';
import CommunityConnect from './components/CommunityConnect';
import { Shield } from 'lucide-react';

type Tab = 'home' | 'protocols' | 'rx' | 'contacts' | 'tools' | 'email';
type Tool = 'apgar' | 'gcs' | 'drip' | 'burn' | 'converter' | 'triage' | 'jumpstart' | 'mci' | 'admin' | 'abbreviations' | 'vitals' | 'community-connect' | null;

export default function App() {
  const [protocols, setProtocols] = useState<Protocol[]>(PROTOCOLS);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>('Treatment');
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-[#151619] text-[#FFFFFF] font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#151619]/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('bg-emerald-600', 'rounded-lg', 'shadow-lg', 'shadow-emerald-900/20');
                const fallback = document.createElement('div');
                fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>';
                e.currentTarget.parentElement?.appendChild(fallback.firstChild as Node);
              }}
            />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none">THREE MILE FIRE</h1>
            <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest mt-1">Protocol System v2.4</p>
          </div>
        </div>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 hover:bg-white/5 rounded-full transition-colors"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Main Content */}
      <main className="pb-24">
        <AnimatePresence mode="wait">
          {!hasAcknowledged ? (
            <motion.div
              key="acknowledgment"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
            >
              <div className="bg-[#1A1B1E] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
                <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <img 
                    src="/logo.png" 
                    alt="Three Mile Fire Dept Logo" 
                    className="w-full h-full object-contain drop-shadow-2xl"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.classList.add('bg-red-600', 'rounded-2xl', 'shadow-lg', 'shadow-red-900/40');
                      const fallback = document.createElement('div');
                      fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>';
                      e.currentTarget.parentElement?.appendChild(fallback.firstChild as Node);
                    }}
                  />
                </div>
                <h2 className="text-xl font-bold mb-4 tracking-tight">PROTOCOL ACKNOWLEDGMENT</h2>
                <p className="text-sm text-white/60 leading-relaxed mb-8">
                  By entering this app, you acknowledge that these tools are for 
                  <span className="text-white font-bold"> SUPPLEMENTAL USE ONLY</span>. 
                  <br /><br />
                  Always defer to the most current 
                  <span className="text-white font-bold"> Three Mile Fire Department SOGs/SOPs </span> 
                   and local Medical Director protocols.
                </p>
                <button 
                  onClick={() => setHasAcknowledged(true)}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-red-900/20"
                >
                  I ACKNOWLEDGE & ENTER
                </button>
              </div>
            </motion.div>
          ) : selectedProtocol ? (
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

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                    selectedProtocol.category === 'Treatment' ? "bg-blue-500/20 text-blue-400" :
                    selectedProtocol.category === 'Fire' ? "bg-orange-500/20 text-orange-400" :
                    "bg-emerald-500/20 text-emerald-400"
                  )}>
                    {selectedProtocol.category}{selectedProtocol.subCategory ? ` > ${selectedProtocol.subCategory}` : ''}
                  </span>
                  <span className="text-[10px] text-white/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Updated: {selectedProtocol.lastUpdated}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-4">{selectedProtocol.title}</h2>
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
                            cleanSection.startsWith('Purpose') ? 'bg-blue-500/10 border-blue-500/20 text-blue-100' :
                            cleanSection.startsWith('Scope') ? 'bg-zinc-500/10 border-zinc-500/20 text-zinc-100' :
                            cleanSection.startsWith('Blue Card') ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-100' :
                            cleanSection.startsWith('Procedure') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100' :
                            cleanSection.startsWith('Reference') ? 'bg-amber-500/10 border-amber-500/20 text-amber-100' :
                            cleanSection.startsWith('Criteria') ? 'bg-rose-500/10 border-rose-500/20 text-rose-100' :
                            cleanSection.startsWith('Definition') ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-100' :
                            cleanSection.startsWith('Categor') ? 'bg-purple-500/10 border-purple-500/20 text-purple-100' :
                            cleanSection.startsWith('Exception') ? 'bg-red-500/10 border-red-500/20 text-red-100' :
                            cleanSection.startsWith('MANDATORY') || cleanSection.startsWith('WARNING') || cleanSection.startsWith('CAUTION') ? 'bg-red-600/20 border-red-500/40 text-red-100' :
                            cleanSection.startsWith('Note') ? 'bg-blue-400/10 border-blue-400/20 text-blue-100' :
                            'bg-slate-500/10 border-slate-500/20 text-slate-100';

                          const headerColor = 
                            cleanSection.startsWith('Purpose') ? 'text-blue-400' :
                            cleanSection.startsWith('Scope') ? 'text-zinc-400' :
                            cleanSection.startsWith('Blue Card') ? 'text-indigo-400' :
                            cleanSection.startsWith('Procedure') ? 'text-emerald-400' :
                            cleanSection.startsWith('Reference') ? 'text-amber-400' :
                            cleanSection.startsWith('Criteria') ? 'text-rose-400' :
                            cleanSection.startsWith('Definition') ? 'text-cyan-400' :
                            cleanSection.startsWith('Categor') ? 'text-purple-400' :
                            cleanSection.startsWith('Exception') ? 'text-red-400' :
                            cleanSection.startsWith('MANDATORY') || cleanSection.startsWith('WARNING') || cleanSection.startsWith('CAUTION') ? 'text-red-400 font-black' :
                            cleanSection.startsWith('Note') ? 'text-blue-300' :
                            'text-slate-400';

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
                            <div key={i} className="text-white/80 leading-relaxed whitespace-pre-wrap text-sm px-2">
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
                        <p className="text-sm pt-0.5 text-white/90">{step}</p>
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

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">{selectedMedication.name}</h2>
                  <span className="text-[10px] text-white/40 flex items-center gap-1">
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
                    <p className="text-sm text-white/70 leading-relaxed italic whitespace-pre-wrap">{selectedMedication.sideEffects}</p>
                  </div>

                  {selectedMedication.precautions && (
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-1">Precautions</h3>
                      <p className="text-sm text-orange-400/80 leading-relaxed whitespace-pre-wrap">{selectedMedication.precautions}</p>
                    </div>
                  )}

                  {selectedMedication.reference && (
                    <div className="pt-4 border-t border-white/5">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1">Reference</h3>
                      <p className="text-[10px] text-white/30 leading-relaxed">{selectedMedication.reference}</p>
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
          ) : activeTab === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="p-4"
            >
              <HomeScreen onNavigate={(tab, tool) => {
                setActiveTab(tab);
                if (tool) setActiveTool(tool as Tool);
                setSelectedProtocol(null);
                setSelectedMedication(null);
              }} />
            </motion.div>
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
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input 
                      type="text"
                      placeholder={activeTab === 'protocols' ? "Search protocols..." : "Search medications..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-white/20"
                    />
                  </div>

                  {activeTab === 'protocols' && (
                    <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-4">
                      {categories.map(cat => (
                        <button 
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={cn(
                            "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                            selectedCategory === cat ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
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
                  {(selectedCategory === 'Fire' || selectedCategory === 'EMS') && searchQuery === '' ? (
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
                          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-1 mt-6 mb-2 flex items-center gap-2">
                            <span className={cn(
                              "w-1 h-1 rounded-full",
                              selectedCategory === 'Fire' ? "bg-orange-500" : "bg-emerald-500"
                            )} />
                            {subCategory}
                          </h3>
                          {grouped[subCategory].map(protocol => (
                            <button
                              key={protocol.id}
                              onClick={() => setSelectedProtocol(protocol)}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.98]"
                            >
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "w-10 h-10 rounded-xl flex items-center justify-center",
                                  selectedCategory === 'Fire' ? "bg-orange-500/10 text-orange-500" : "bg-emerald-500/10 text-emerald-500"
                                )}>
                                  {selectedCategory === 'Fire' ? <Flame className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                                </div>
                                <div className="text-left">
                                  <h3 className="font-bold text-sm group-hover:text-emerald-400 transition-colors">{protocol.title}</h3>
                                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">{protocol.subCategory || protocol.category}</p>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-emerald-500 transition-colors" />
                            </button>
                          ))}
                        </div>
                      ));
                    })()
                  ) : (
                    filteredProtocols.map(protocol => (
                      <button
                        key={protocol.id}
                        onClick={() => setSelectedProtocol(protocol)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            protocol.category === 'Treatment' ? "bg-blue-500/10 text-blue-500" :
                            protocol.category === 'Fire' ? "bg-orange-500/10 text-orange-500" :
                            "bg-emerald-500/10 text-emerald-500"
                          )}>
                            {protocol.category === 'Treatment' ? <Stethoscope className="w-5 h-5" /> :
                             protocol.category === 'Fire' ? <Flame className="w-5 h-5" /> :
                             <ShieldAlert className="w-5 h-5" />}
                          </div>
                          <div className="text-left">
                            <h3 className="font-bold text-sm group-hover:text-emerald-400 transition-colors">{protocol.title}</h3>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
                              {protocol.subCategory || protocol.category}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-emerald-500 transition-colors" />
                      </button>
                    ))
                  )}
                  {filteredProtocols.length === 0 && (
                    <div className="text-center py-12">
                      <Info className="w-12 h-12 text-white/10 mx-auto mb-4" />
                      <p className="text-white/40 text-sm">No protocols found matching your search.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'rx' && (
                <div className="space-y-3">
                  {filteredMedications.map(med => (
                    <button
                      key={med.id}
                      onClick={() => setSelectedMedication(med)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                          <Pill className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-sm group-hover:text-emerald-400 transition-colors">{med.name}</h3>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Medication Guide</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-emerald-500 transition-colors" />
                    </button>
                  ))}
                  {filteredMedications.length === 0 && (
                    <div className="text-center py-12">
                      <Info className="w-12 h-12 text-white/10 mx-auto mb-4" />
                      <p className="text-white/40 text-sm">No medications found matching your search.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'contacts' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold mb-6">Emergency Directory</h2>
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
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-1 flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-emerald-500" />
                          {category}
                        </h3>
                        {grouped[category].map(contact => (
                          <div key={contact.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="font-bold text-sm">{contact.name}</h3>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">{contact.role}</p>
                              </div>
                              <div className="flex gap-2">
                                {contact.address && (
                                  <button 
                                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address!)}`, '_blank')}
                                    className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                                  >
                                    <MapPin className="w-4 h-4" />
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
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4 px-1">Clinical Calculators</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            onClick={() => setActiveTool('drip')}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-white/10 transition-all group"
                          >
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                              <Droplets className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">Drip Rate</span>
                          </button>
                          <button 
                            onClick={() => setActiveTool('gcs')}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-white/10 transition-all group"
                          >
                            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                              <Brain className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">GCS Calc</span>
                          </button>
                          <button 
                            onClick={() => setActiveTool('apgar')}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-white/10 transition-all group"
                          >
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                              <Clock className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">APGAR</span>
                          </button>
                          <button 
                            onClick={() => setActiveTool('burn')}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-white/10 transition-all group"
                          >
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                              <Flame className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">Burn Calc</span>
                          </button>
                          <button 
                            onClick={() => setActiveTool('converter')}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-white/10 transition-all group"
                          >
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                              <RefreshCw className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">Unit Convert</span>
                          </button>
                          <button 
                            onClick={() => setActiveTool('vitals')}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-white/10 transition-all group"
                          >
                            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                              <Activity className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">Norm Vitals</span>
                          </button>
                        </div>
                      </div>

                      {/* Divider Line */}
                      <div className="h-px bg-white/10 w-full" />

                      {/* MCI Section */}
                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-500/60 mb-4 px-1">MCI / Triage</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            onClick={() => setActiveTool('mci')}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-white/10 transition-all group"
                          >
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                              <ShieldAlert className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-center">MCI IC Tool</span>
                          </button>
                          <button 
                            onClick={() => setActiveTool('triage')}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-white/10 transition-all group"
                          >
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                              <AlertTriangle className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">START Triage</span>
                          </button>
                          <button 
                            onClick={() => setActiveTool('jumpstart')}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-white/10 transition-all group"
                          >
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                              <Baby className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-center">JumpSTART</span>
                          </button>
                        </div>
                      </div>

                      {/* Divider Line */}
                      <div className="h-px bg-white/10 w-full" />

                      {/* Reference Section */}
                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-500/60 mb-4 px-1">Reference</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            onClick={() => setActiveTool('abbreviations')}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-white/10 transition-all group"
                          >
                            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                              <BookOpen className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-center">Abbreviations</span>
                          </button>
                          <button 
                            onClick={() => setActiveTool('community-connect')}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-white/10 transition-all group"
                          >
                            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                              <QrCode className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-center">Community Connect</span>
                          </button>
                        </div>
                      </div>

                      {/* Divider Line */}
                      <div className="h-px bg-white/10 w-full" />

                      {/* Admin Section */}
                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-purple-500/60 mb-4 px-1">Administration</h3>
                        <div className="grid grid-cols-1 gap-4">
                          <button 
                            onClick={() => setActiveTool('admin')}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between group hover:bg-white/10 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                                <Shield className="w-6 h-6" />
                              </div>
                              <div className="text-left">
                                <h3 className="font-bold">Protocol Admin</h3>
                                <p className="text-xs text-white/40">Add, edit, or remove protocols</p>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-purple-500" />
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
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#151619]/90 backdrop-blur-xl border-t border-white/10 px-4 py-4 flex items-center justify-between z-50">
        <NavButton 
          active={activeTab === 'home'} 
          onClick={() => { setActiveTab('home'); setSelectedProtocol(null); setSelectedMedication(null); setActiveTool(null); }}
          icon={<Flame className="w-6 h-6" />}
          label="Home"
        />
        <NavButton 
          active={activeTab === 'protocols'} 
          onClick={() => { setActiveTab('protocols'); setSelectedProtocol(null); setSelectedMedication(null); setActiveTool(null); }}
          icon={<ShieldAlert className="w-6 h-6" />}
          label="Protocols"
        />
        <NavButton 
          active={activeTab === 'rx'} 
          onClick={() => { setActiveTab('rx'); setSelectedProtocol(null); setSelectedMedication(null); setActiveTool(null); }}
          icon={<Pill className="w-6 h-6" />}
          label="RX"
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
          label="Contacts"
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
              className="fixed top-0 right-0 bottom-0 w-80 bg-[#1A1B1E] border-l border-white/10 z-[70] p-6"
            >
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-xl font-bold">Settings</h2>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30">Application</h3>
                  <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                    <span className="text-sm font-medium">Dark Mode</span>
                    <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                    <span className="text-sm font-medium">Offline Access</span>
                    <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30">Account</h3>
                  <button className="w-full flex items-center gap-3 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                    <Settings className="w-5 h-5 text-white/40" />
                    <span className="text-sm font-medium">Profile Settings</span>
                  </button>
                </div>

                <div className="pt-12">
                  <p className="text-[10px] text-center text-white/20 font-mono">
                    Three Mile Fire Dept.<br />
                    Protocol Engine v2.4.0<br />
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
        "flex flex-col items-center gap-1 transition-all",
        active ? "text-emerald-500 scale-110" : "text-white/30 hover:text-white/60"
      )}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-indicator"
          className="w-1 h-1 bg-emerald-500 rounded-full mt-1"
        />
      )}
    </button>
  );
}
