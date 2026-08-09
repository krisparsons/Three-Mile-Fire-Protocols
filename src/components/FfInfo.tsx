import React, { useState } from 'react';
import { 
  Flame, 
  Award, 
  BookOpen, 
  Droplets, 
  FileText, 
  Search, 
  ArrowLeft, 
  CheckSquare, 
  Square, 
  RotateCcw, 
  HelpCircle, 
  Info, 
  Sliders, 
  Activity, 
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Zap,
  TrendingUp,
  Award as CertificationIcon,
  Download
} from 'lucide-react';

interface FfInfoProps {
  onBack: () => void;
}

interface Flashcard {
  id: number;
  level: 'FF1' | 'FF2';
  category: string;
  question: string;
  answer: string;
}

const FLASHCARDS: Flashcard[] = [
  {
    id: 1,
    level: 'FF1',
    category: 'Fire Behavior',
    question: 'What are the four components of the Fire Tetrahedron?',
    answer: 'Oxygen, Fuel, Heat, and a Self-Sustaining Chemical Chain Reaction.'
  },
  {
    id: 2,
    level: 'FF1',
    category: 'PPE & SCBA',
    question: 'How often must SCBA cylinders be hydrostatically tested?',
    answer: 'Composite cylinders must be hydrostatically tested every 5 years (15-year lifetime); Steel and Aluminum cylinders every 5 years (no set expiration if they pass).'
  },
  {
    id: 3,
    level: 'FF1',
    category: 'Ladders',
    question: 'What is the standard angle and climbing angle for a fire service ground extension ladder?',
    answer: '75 degrees. The fly section should face outward on wooden extension ladders, but fly section faces INWARD on modern metal or fiberglass ladders (manufacturers vary, but NFPA standards specify proper placement).'
  },
  {
    id: 4,
    level: 'FF1',
    category: 'Hose & Streams',
    question: 'What is water hammer and how do you prevent it?',
    answer: 'Water hammer is a pressure surge caused when water in motion is forced to stop suddenly (e.g. closing a nozzle/valve too fast). It can damage hoses, pumps, and water mains. Prevent it by opening and closing all valves and nozzles SLOWLY.'
  },
  {
    id: 5,
    level: 'FF1',
    category: 'Ventilation',
    question: 'What is the difference between horizontal and vertical ventilation?',
    answer: 'Horizontal ventilation uses doors and windows to clear heat/smoke. Vertical ventilation makes openings in the roof/highest ceiling point to allow heat and gases to escape upward.'
  },
  {
    id: 6,
    level: 'FF2',
    category: 'ICS / NIMS',
    question: 'What are the five major functional areas of the Incident Command System (ICS)?',
    answer: 'Command, Operations, Planning, Logistics, and Finance/Administration.'
  },
  {
    id: 7,
    level: 'FF2',
    category: 'Extrication',
    question: 'In vehicle extrication, what is the order of securing the vehicle/securing hazards?',
    answer: '1. Establish scene safety and control traffic. \n2. Control hazards (fire, power lines, fuel leaks). \n3. Stabilize the vehicle (chock wheels, cribbing). \n4. Turn off ignition, disconnect batteries (typically negative first).'
  },
  {
    id: 8,
    level: 'FF2',
    category: 'Foam Operations',
    question: 'What is the expansion ratio of medium expansion foam?',
    answer: '20:1 to 200:1. Low expansion foam is up to 20:1. High expansion foam is 200:1 to 1000:1.'
  },
  {
    id: 9,
    level: 'FF2',
    category: 'Pre-Incident Planning',
    question: 'What is the main objective of conducting a pre-incident survey/plan?',
    answer: 'To gather critical site-specific safety information (structural type, hazardous materials, water supply, utility shutoffs) to assist commanders in safety and tactics.'
  },
  {
    id: 10,
    level: 'FF2',
    category: 'Evidence Preservation',
    question: 'What is a firefighter\'s primary responsibility at a fire scene regarding cause determination?',
    answer: 'Observe unusual circumstances during response/arrival, preserve physical evidence of fire origin, and protect the chain of custody by limiting access to the area.'
  }
];

export default function FfInfo({ onBack }: FfInfoProps) {
  const [activeTab, setActiveTab] = useState<'ff1' | 'ff2' | 'hydraulics' | 'flashcards'>('ff1');
  const [ff1SubSection, setFf1SubSection] = useState<'ppe' | 'behavior' | 'ventilation' | 'ladders'>('ppe');
  const [ff2SubSection, setFf2SubSection] = useState<'suppression' | 'ics' | 'extrication' | 'preservation'>('suppression');

  // Checklist states
  const [checkedSkills, setCheckedSkills] = useState<Record<string, boolean>>({});

  // Flashcard states
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardLevelFilter, setCardLevelFilter] = useState<'ALL' | 'FF1' | 'FF2'>('ALL');

  // Hydraulics Calculator states
  const [hoseDiameter, setHoseDiameter] = useState<number>(1.75); // C coefficient
  const [flowGPM, setFlowGPM] = useState<number>(150);
  const [hoseLength, setHoseLength] = useState<number>(150);
  const [nozzlePressure, setNozzlePressure] = useState<number>(100); // 100 PSI standard fog, 50/75 smooth
  const [elevationChange, setElevationChange] = useState<number>(0); // in feet
  const [appliances, setAppliances] = useState<number>(0); // PSI loss

  // Filter cards
  const filteredCards = FLASHCARDS.filter(card => 
    cardLevelFilter === 'ALL' || card.level === cardLevelFilter
  );

  const toggleSkill = (id: string) => {
    setCheckedSkills(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev + 1) % filteredCards.length);
    }, 150);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
    }, 150);
  };

  const resetSkills = () => {
    setCheckedSkills({});
  };

  // Calculations for Hydraulics
  // FL = C * (Q/100)^2 * (L/100)
  const getCoefficient = (dia: number) => {
    if (dia === 1) return 150; // Booster
    if (dia === 1.5) return 24;
    if (dia === 1.75) return 15.5;
    if (dia === 2) return 8;
    if (dia === 2.5) return 2;
    if (dia === 3) return 0.8;
    if (dia === 5) return 0.08;
    return 2;
  };

  const c = getCoefficient(hoseDiameter);
  const qFactor = flowGPM / 100;
  const lFactor = hoseLength / 100;
  const frictionLoss = parseFloat((c * Math.pow(qFactor, 2) * lFactor).toFixed(1));
  const elevationLoss = parseFloat((elevationChange * 0.434).toFixed(1)); // 0.434 PSI per foot
  const pumpDischargePressure = Math.round(nozzlePressure + frictionLoss + elevationLoss + appliances);

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-800 dark:text-zinc-200 transition-all active:scale-95"
            id="ff-info-back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-red-600 animate-pulse" />
              FF-1 & FF-2 Certification Reference
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              NFPA 1001 Standard for Fire Fighter Professional Qualifications & Tactical Pump Calculator
            </p>
          </div>
        </div>

        <a
          href="/FD_Fire_Ops_Reference.txt"
          download="FD_Fire_Ops_Reference.txt"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download Text Doc</span>
        </a>
      </div>

      {/* Primary Category Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-zinc-100 dark:bg-white/5 p-1 rounded-2xl border-2 border-zinc-200/50 dark:border-white/5">
        <button
          onClick={() => { setActiveTab('ff1'); setIsFlipped(false); }}
          className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === 'ff1'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Firefighter I (FF1)</span>
        </button>
        <button
          onClick={() => { setActiveTab('ff2'); setIsFlipped(false); }}
          className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === 'ff2'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <CertificationIcon className="w-4 h-4" />
          <span>Firefighter II (FF2)</span>
        </button>
        <button
          onClick={() => { setActiveTab('hydraulics'); setIsFlipped(false); }}
          className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === 'hydraulics'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Droplets className="w-4 h-4" />
          <span>Hydraulics Calc</span>
        </button>
        <button
          onClick={() => { setActiveTab('flashcards'); setIsFlipped(false); }}
          className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === 'flashcards'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Q&A Study Guide</span>
        </button>
      </div>

      {/* 1. FIREFIGHTER I SECTION */}
      {activeTab === 'ff1' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Side Menu Subcategories */}
          <div className="lg:col-span-3 space-y-2">
            <span className="text-[10px] font-mono font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block px-1">FF1 core skills</span>
            <button
              onClick={() => setFf1SubSection('ppe')}
              className={`w-full text-left p-3.5 rounded-xl transition-all border font-bold text-xs flex items-center justify-between ${
                ff1SubSection === 'ppe'
                  ? 'bg-red-600/10 text-red-600 dark:text-red-400 border-red-500/20'
                  : 'bg-white dark:bg-[#1C1C1E] text-zinc-700 dark:text-zinc-300 border-zinc-200/50 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/5'
              }`}
            >
              <span>PPE & SCBA Donning</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
            <button
              onClick={() => setFf1SubSection('behavior')}
              className={`w-full text-left p-3.5 rounded-xl transition-all border font-bold text-xs flex items-center justify-between ${
                ff1SubSection === 'behavior'
                  ? 'bg-red-600/10 text-red-600 dark:text-red-400 border-red-500/20'
                  : 'bg-white dark:bg-[#1C1C1E] text-zinc-700 dark:text-zinc-300 border-zinc-200/50 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/5'
              }`}
            >
              <span>Fire Dynamics & Behavior</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
            <button
              onClick={() => setFf1SubSection('ladders')}
              className={`w-full text-left p-3.5 rounded-xl transition-all border font-bold text-xs flex items-center justify-between ${
                ff1SubSection === 'ladders'
                  ? 'bg-red-600/10 text-red-600 dark:text-red-400 border-red-500/20'
                  : 'bg-white dark:bg-[#1C1C1E] text-zinc-700 dark:text-zinc-300 border-zinc-200/50 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/5'
              }`}
            >
              <span>Ladders & Search</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
            <button
              onClick={() => setFf1SubSection('ventilation')}
              className={`w-full text-left p-3.5 rounded-xl transition-all border font-bold text-xs flex items-center justify-between ${
                ff1SubSection === 'ventilation'
                  ? 'bg-red-600/10 text-red-600 dark:text-red-400 border-red-500/20'
                  : 'bg-white dark:bg-[#1C1C1E] text-zinc-700 dark:text-zinc-300 border-zinc-200/50 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/5'
              }`}
            >
              <span>Ventilation & Hose</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
          </div>

          {/* Details Content (Right) */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* SUBSECTION: PPE */}
            {ff1SubSection === 'ppe' && (
              <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-3xl p-6 space-y-6">
                <div>
                  <span className="text-[9px] font-mono font-black text-red-600 dark:text-red-400 uppercase tracking-widest block">NFPA 1001 — Skill Sheet 1-I</span>
                  <h3 className="text-lg font-black uppercase text-zinc-900 dark:text-white mt-1">PPE & SCBA Rapid Donning Procedure</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Standard protocol for donning full turnout gear, hood, helmet, and Self-Contained Breathing Apparatus within 60 seconds.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-black block">Rapid Donning Checklist</span>
                    {[
                      { id: 'ppe1', text: 'Turnout boots pulled up fully, suspenders over shoulders.' },
                      { id: 'ppe2', text: 'Turnout coat donned, storm collar secured, zipper/clips locked.' },
                      { id: 'ppe3', text: 'Flash hood put on and pulled down around neck.' },
                      { id: 'ppe4', text: 'SCBA harness placed over shoulders (backpack style or over-the-head).' },
                      { id: 'ppe5', text: 'Waist belt and chest straps tightened, hoses clear.' },
                      { id: 'ppe6', text: 'Main cylinder valve fully opened, HUD checked, low-air alarm verifies.' },
                      { id: 'ppe7', text: 'Facepiece donned, straps tightened from bottom to top.' },
                      { id: 'ppe8', text: 'Check seal by covering intake with hand and inhaling deeply.' },
                      { id: 'ppe9', text: 'Flash hood pulled up to cover head with no skin exposed.' },
                      { id: 'ppe10', text: 'Helmet donned, chin strap tightened. Turnout gloves secured.' },
                    ].map((step, idx) => (
                      <div 
                        key={step.id}
                        onClick={() => toggleSkill(step.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                          checkedSkills[step.id]
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-zinc-800 dark:text-zinc-100'
                            : 'bg-zinc-50 dark:bg-black/20 border-zinc-200/50 dark:border-white/5 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <div className="mt-0.5">
                          {checkedSkills[step.id] ? (
                            <CheckSquare className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Square className="w-4 h-4 text-zinc-400" />
                          )}
                        </div>
                        <div className="text-xs font-bold leading-snug">
                          <span className="font-mono text-[10px] text-red-500 dark:text-red-400 mr-1">Step {idx+1}:</span> {step.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="bg-zinc-50 dark:bg-black/30 border border-zinc-200/50 dark:border-white/5 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-2 text-zinc-800 dark:text-white font-bold text-xs">
                        <Info className="w-4 h-4 text-red-500 shrink-0" />
                        <span>Critical Safety Checkpoints</span>
                      </div>
                      <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400 list-disc pl-4 leading-relaxed font-semibold">
                        <li>Ensure NO skin is visible between the facepiece seal, flash hood, and turnout coat collar.</li>
                        <li>SCBA low-air alarm must actuate briefly during system charge (verifying operation).</li>
                        <li>Your bypass valve should be closed, and purge button verified before entering IDLH atmospheres.</li>
                        <li>Never rush seal testing: a failure inside a structures fire means immediate cyanide/carbon monoxide intake.</li>
                      </ul>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 space-y-2.5">
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                        <ShieldAlert className="w-4 h-4" />
                        <span>IDLH Definition & Limits</span>
                      </div>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-semibold">
                        <strong>Immediately Dangerous to Life or Health (IDLH):</strong> Atmospheres where carbon monoxide is &gt;1200 ppm, oxygen is &lt;19.5%, or visible smoke is present require complete SCBA utilization.
                      </p>
                    </div>

                    <button 
                      onClick={resetSkills}
                      className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 transition-all flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset Checklist</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUBSECTION: FIRE BEHAVIOR */}
            {ff1SubSection === 'behavior' && (
              <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-3xl p-6 space-y-6">
                <div>
                  <span className="text-[9px] font-mono font-black text-red-600 dark:text-red-400 uppercase tracking-widest block">Theory & Incident Dynamics</span>
                  <h3 className="text-lg font-black uppercase text-zinc-900 dark:text-white mt-1">Fire Dynamics & Extreme Phenom</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Recognize indicators of rollover, flashover, backdraft, and rapid thermal decomposition under compartment conditions.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-zinc-50 dark:bg-black/20 border border-zinc-200/50 dark:border-white/5 rounded-2xl p-4.5 space-y-2">
                    <span className="text-[9px] font-mono font-black text-red-600 uppercase tracking-widest block">01 / Rollover</span>
                    <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white">Flame Licking (Gas Ignition)</h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-semibold">
                      Unburned pyrolysis products accumulate at the ceiling, mixing with oxygen until they ignite. Licks of flame run through the smoke layer.
                    </p>
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono pt-1">
                      ⚠️ WARNING: Imminent Flashover indicator.
                    </div>
                  </div>

                  <div className="bg-zinc-50 dark:bg-black/20 border border-zinc-200/50 dark:border-white/5 rounded-2xl p-4.5 space-y-2">
                    <span className="text-[9px] font-mono font-black text-red-600 uppercase tracking-widest block">02 / Flashover</span>
                    <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white">Simultaneous Ignition</h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-semibold">
                      Compartment temperature reaches approx. 1,100°F (593°C). Radiant heat warms all combustibles to ignition temperature simultaneously. Survival rate is zero.
                    </p>
                    <div className="text-[10px] text-red-500 dark:text-red-400 font-mono pt-1">
                      🛑 ACTION: Immediately stay low & apply stream.
                    </div>
                  </div>

                  <div className="bg-zinc-50 dark:bg-black/20 border border-zinc-200/50 dark:border-white/5 rounded-2xl p-4.5 space-y-2">
                    <span className="text-[9px] font-mono font-black text-red-600 uppercase tracking-widest block">03 / Backdraft</span>
                    <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white">Explosive Re-entry</h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-semibold">
                      Oxygen-depleted fire room is filled with superheated carbon monoxide gas. Introducing fresh air causes an explosive, rapid ignition of gases.
                    </p>
                    <div className="text-[10px] text-red-500 dark:text-red-400 font-mono pt-1">
                      💨 INDICATORS: Puffy, yellow smoke; soot on glass.
                    </div>
                  </div>
                </div>

                <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    <span>Thermal Layering & Nozzle Discipline</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-semibold">
                    Superheated gases rise, creating a distinct boundary layer. Droplets of water straight into the thermal column can expand instantly to steam (1,700x ratio), destroying thermal balance, pushing heat down onto firefighters and victims. Apply brief, pulsing direct bursts to cool the overhead smoke layer without excessive steam generation.
                  </p>
                </div>
              </div>
            )}

            {/* SUBSECTION: LADDERS & SEARCH */}
            {ff1SubSection === 'ladders' && (
              <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-3xl p-6 space-y-6">
                <div>
                  <span className="text-[9px] font-mono font-black text-red-600 dark:text-red-400 uppercase tracking-widest block">Operations & Life Safety</span>
                  <h3 className="text-lg font-black uppercase text-zinc-900 dark:text-white mt-1">Ladders, Carries, and Search Procedures</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Core specifications for ladder positioning, climbing, and VEIS (Vent, Enter, Isolate, Search) operations.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-zinc-50 dark:bg-black/30 border border-zinc-200/50 dark:border-white/5 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-red-600" />
                      <span>Ladder Placement Rules</span>
                    </h4>
                    
                    <div className="space-y-3 font-semibold text-xs text-zinc-600 dark:text-zinc-400">
                      <div className="flex justify-between border-b border-zinc-150 dark:border-white/5 pb-2">
                        <span>Standard Angle</span>
                        <span className="text-zinc-900 dark:text-white font-mono">75 Degrees (1/4 working length out)</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-150 dark:border-white/5 pb-2">
                        <span>For Roof Access</span>
                        <span className="text-zinc-900 dark:text-white font-mono">3 to 5 rungs above the roofline</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-150 dark:border-white/5 pb-2">
                        <span>For Window Rescue</span>
                        <span className="text-zinc-900 dark:text-white font-mono">Just below window sill level</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span>Ventilation (Window)</span>
                        <span className="text-zinc-900 dark:text-white font-mono">Even with top of the window frame</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <span className="text-[9px] font-mono uppercase text-red-500 font-bold block">Proper Angle Formula:</span>
                      <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                        Divide the height to be reached by 4. Place the butt of the ladder that exact distance away from the building.
                      </p>
                    </div>
                  </div>

                  <div className="bg-zinc-50 dark:bg-black/30 border border-zinc-200/50 dark:border-white/5 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white flex items-center gap-2">
                      <Search className="w-4 h-4 text-red-600" />
                      <span>Primary Search Operations</span>
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-semibold">
                      Always search in systematic patterns (left-hand or right-hand wall searches). Maintain physical/visual contact with thermal imaging, walls, or tool vectors.
                    </p>
                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                      <span className="text-[9px] font-mono font-black text-red-600 dark:text-red-400 uppercase tracking-widest block">VEIS PROTOCOL</span>
                      <p className="text-[11px] text-zinc-700 dark:text-zinc-300 font-bold mt-1">
                        <strong>V:</strong> Vent window, <strong>E:</strong> Enter window, <strong>I:</strong> ISOLATE room first by closing the door (blocking fire path), <strong>S:</strong> Search room rapidly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBSECTION: VENTILATION & HOSE */}
            {ff1SubSection === 'ventilation' && (
              <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-3xl p-6 space-y-6">
                <div>
                  <span className="text-[9px] font-mono font-black text-red-600 dark:text-red-400 uppercase tracking-widest block">Suppression & Ventilation</span>
                  <h3 className="text-lg font-black uppercase text-zinc-900 dark:text-white mt-1">Tactical Ventilation & Hose Streams</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Covers hydraulic, mechanical, natural ventilation, and standard water stream behaviors.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-zinc-50 dark:bg-black/30 border border-zinc-200/50 dark:border-white/5 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-red-600" />
                      <span>Water Streams & Friction Loss</span>
                    </h4>
                    <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 font-semibold list-disc pl-4 leading-relaxed">
                      <li><strong>Solid Stream:</strong> Superior penetration, maximum reach, minimum steam production, keeps thermal layering intact.</li>
                      <li><strong>Fog Stream:</strong> Maximum heat absorption (due to surface area), poor reach, susceptible to wind and disruption.</li>
                      <li><strong>Hose Handling:</strong> Stand on the inside of the backup line curves. Maintain a backup distance of at least 3-4 feet from the nozzle operator.</li>
                    </ul>
                  </div>

                  <div className="bg-zinc-50 dark:bg-black/30 border border-zinc-200/50 dark:border-white/5 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white flex items-center gap-2">
                      <Flame className="w-4 h-4 text-red-600" />
                      <span>Hydraulic Ventilation</span>
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-semibold">
                      Uses a fog stream to pull smoke and gas out of an opening. Stand 2 feet back, adjust nozzle to a wide fog pattern covering 85% of the window/door area, and direct the spray out of the structure to create low pressure.
                    </p>
                    <div className="text-[10px] text-zinc-500 font-mono mt-1">
                      💡 Advantage: Clears smoke quickly; doesn't require complex mechanical fans.
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 2. FIREFIGHTER II SECTION */}
      {activeTab === 'ff2' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Side Menu Subcategories */}
          <div className="lg:col-span-3 space-y-2">
            <span className="text-[10px] font-mono font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block px-1">FF2 Core skills</span>
            <button
              onClick={() => setFf2SubSection('suppression')}
              className={`w-full text-left p-3.5 rounded-xl transition-all border font-bold text-xs flex items-center justify-between ${
                ff2SubSection === 'suppression'
                  ? 'bg-red-600/10 text-red-600 dark:text-red-400 border-red-500/20'
                  : 'bg-white dark:bg-[#1C1C1E] text-zinc-700 dark:text-zinc-300 border-zinc-200/50 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/5'
              }`}
            >
              <span>Advanced Fire Suppression</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
            <button
              onClick={() => setFf2SubSection('ics')}
              className={`w-full text-left p-3.5 rounded-xl transition-all border font-bold text-xs flex items-center justify-between ${
                ff2SubSection === 'ics'
                  ? 'bg-red-600/10 text-red-600 dark:text-red-400 border-red-500/20'
                  : 'bg-white dark:bg-[#1C1C1E] text-zinc-700 dark:text-zinc-300 border-zinc-200/50 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/5'
              }`}
            >
              <span>Incident Command (ICS)</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
            <button
              onClick={() => setFf2SubSection('extrication')}
              className={`w-full text-left p-3.5 rounded-xl transition-all border font-bold text-xs flex items-center justify-between ${
                ff2SubSection === 'extrication'
                  ? 'bg-red-600/10 text-red-600 dark:text-red-400 border-red-500/20'
                  : 'bg-white dark:bg-[#1C1C1E] text-zinc-700 dark:text-zinc-300 border-zinc-200/50 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/5'
              }`}
            >
              <span>Vehicle Extrication & Rescue</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
            <button
              onClick={() => setFf2SubSection('preservation')}
              className={`w-full text-left p-3.5 rounded-xl transition-all border font-bold text-xs flex items-center justify-between ${
                ff2SubSection === 'preservation'
                  ? 'bg-red-600/10 text-red-600 dark:text-red-400 border-red-500/20'
                  : 'bg-white dark:bg-[#1C1C1E] text-zinc-700 dark:text-zinc-300 border-zinc-200/50 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/5'
              }`}
            >
              <span>Fire Cause & Evidence</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
          </div>

          {/* Details Content (Right) */}
          <div className="lg:col-span-9 space-y-6">

            {/* SUBSECTION: ADVANCED FIRE SUPPRESSION */}
            {ff2SubSection === 'suppression' && (
              <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-3xl p-6 space-y-6">
                <div>
                  <span className="text-[9px] font-mono font-black text-red-600 dark:text-red-400 uppercase tracking-widest block">FF2 — NFPA 1001 Section 5.3</span>
                  <h3 className="text-lg font-black uppercase text-zinc-900 dark:text-white mt-1">Advanced Fire Suppression & Foam Ops</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Tactical deployment of Class A and Class B foam concentrates, foam induction devices, and special liquid fire suppression methods.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-zinc-50 dark:bg-black/30 border border-zinc-200/50 dark:border-white/5 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-red-600" />
                      <span>Foam Application Methods</span>
                    </h4>
                    <div className="space-y-3 font-semibold text-xs text-zinc-600 dark:text-zinc-400">
                      <div>
                        <strong className="text-zinc-900 dark:text-white block uppercase text-[10px]">1. Roll-On Method:</strong>
                        <span>Directing foam stream onto the ground just in front of a flammable liquid spill, allowing it to roll gently across the surface.</span>
                      </div>
                      <div>
                        <strong className="text-zinc-900 dark:text-white block uppercase text-[10px]">2. Bank-Down Method:</strong>
                        <span>Bouncing the foam stream off an object (such as a vehicle fire wall or container side) so it runs down and blankets the liquid.</span>
                      </div>
                      <div>
                        <strong className="text-zinc-900 dark:text-white block uppercase text-[10px]">3. Rain-Down Method:</strong>
                        <span>Shooting the stream high into the air above the spill, allowing the foam to fall gently onto the surface like rain.</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-50 dark:bg-black/30 border border-zinc-200/50 dark:border-white/5 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white flex items-center gap-2">
                      <Flame className="w-4 h-4 text-red-600" />
                      <span>Class A vs Class B Foams</span>
                    </h4>
                    
                    <div className="space-y-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                      <div className="p-3 bg-red-600/5 border border-red-500/10 rounded-xl">
                        <strong className="text-red-600 dark:text-red-400 uppercase text-[10px] block mb-1">Class A (Structural / Wildland)</strong>
                        <span>Reduces water surface tension, enabling faster soaking and penetration into carbonaceous materials. Generally mixed at 0.1% to 1%.</span>
                      </div>
                      <div className="p-3 bg-blue-600/5 border border-blue-500/10 rounded-xl">
                        <strong className="text-blue-600 dark:text-blue-400 uppercase text-[10px] block mb-1">Class B (Hydrocarbon / Polar Solvent)</strong>
                        <span>Creates an aqueous film blanket to suppress vapors and exclude oxygen from fuel. Hydrocarbons (gasoline) use 3%, Polar solvents (ethanol/acetone) require 6% concentrates.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBSECTION: INCIDENT COMMAND SYSTEM (ICS) */}
            {ff2SubSection === 'ics' && (
              <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-3xl p-6 space-y-6">
                <div>
                  <span className="text-[9px] font-mono font-black text-red-600 dark:text-red-400 uppercase tracking-widest block">Incident Operations</span>
                  <h3 className="text-lg font-black uppercase text-zinc-900 dark:text-white mt-1">Incident Command System (ICS) on Scene</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Practical scene size-up, unified command structure, transfer of command, and communications.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-zinc-50 dark:bg-black/30 border border-zinc-200/50 dark:border-white/5 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-red-600" />
                      <span>Tactical On-Scene Size Up</span>
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-semibold">
                      The first-arriving unit must immediately establish command and broadcast a brief scene report (Size-Up):
                    </p>
                    <div className="border border-zinc-200 dark:border-white/5 rounded-xl p-3 text-xs font-mono space-y-1.5 bg-zinc-900 text-green-400">
                      <div>1. Unit designation & arrival status</div>
                      <div>2. Brief description of incident (e.g. multi-family dwelling, heavy fire showing)</div>
                      <div>3. Declaration of offensive/defensive strategy</div>
                      <div>4. Command name and command post location</div>
                    </div>
                  </div>

                  <div className="bg-zinc-50 dark:bg-black/30 border border-zinc-200/50 dark:border-white/5 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-red-600" />
                      <span>Span of Control Limits</span>
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-semibold">
                      Under NIMS guidelines, the span of control of any single supervisor is limited to <strong>3 to 7 subordinates</strong>, with <strong>5 being the optimum ratio</strong>. If command goes beyond 1:5, assign Group/Division leaders to delegate tracking.
                    </p>
                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 leading-normal">
                      🔴 Command transfers must always be handled FACE-TO-FACE or via highly structured radio brief containing absolute status updates.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBSECTION: VEHICLE EXTRICATION */}
            {ff2SubSection === 'extrication' && (
              <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-3xl p-6 space-y-6">
                <div>
                  <span className="text-[9px] font-mono font-black text-red-600 dark:text-red-400 uppercase tracking-widest block">Tactical Rescue Specs</span>
                  <h3 className="text-lg font-black uppercase text-zinc-900 dark:text-white mt-1">Vehicle Rescue & Extrication Techniques</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Understanding glass management, stabilization, stabilization equipment, and vehicle anatomy.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-zinc-50 dark:bg-black/30 border border-zinc-200/50 dark:border-white/5 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-red-600" />
                      <span>Glass Management Profiles</span>
                    </h4>
                    <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400 font-semibold list-disc pl-4 leading-relaxed">
                      <li><strong>Laminated Glass:</strong> High strength (windshields and some modern side glass). Requires glass saw, reciprocating saw, or ax. Does not shatter on impact.</li>
                      <li><strong>Tempered Glass:</strong> Designed to break into small pebbles (side and rear windows). Use center spring punch in lower corner of the window. Wear safety glasses. Clear shards fully.</li>
                    </ul>
                  </div>

                  <div className="bg-zinc-50 dark:bg-black/30 border border-zinc-200/50 dark:border-white/5 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-red-600" />
                      <span>Securing High-Voltage & SRS</span>
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-semibold">
                      <strong>EV / Hybrid Hazards:</strong> Orange conduits indicate high voltage (typically up to 650V DC). NEVER cut orange wiring. Always shut off ignition and pull service disconnects if visible.
                    </p>
                    <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-[11px] text-zinc-700 dark:text-zinc-300 font-bold leading-normal">
                      ⚠️ WARNING: SRS (Airbags) capacitors hold electricity for up to 10-15 minutes after power disconnects. Maintain "5-10-20 rule" (5 inches from side airbags, 10 inches from driver wheel, 20 inches from passenger dashboard).
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBSECTION: FIRE CAUSE & EVIDENCE */}
            {ff2SubSection === 'preservation' && (
              <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-3xl p-6 space-y-6">
                <div>
                  <span className="text-[9px] font-mono font-black text-red-600 dark:text-red-400 uppercase tracking-widest block">Scene Protection</span>
                  <h3 className="text-lg font-black uppercase text-zinc-900 dark:text-white mt-1">Preservation of Evidence & Fire Origin</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Guidance on securing fire scenes, recognizing pour patterns, and cooperating with fire investigators.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-zinc-50 dark:bg-black/30 border border-zinc-200/50 dark:border-white/5 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-600" />
                      <span>Fire Scene Protection Rules</span>
                    </h4>
                    <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 font-semibold list-disc pl-4 leading-relaxed">
                      <li>Minimize structural disruption in the suspected area of origin.</li>
                      <li>Post a sentry or secure with red fire line tape.</li>
                      <li>Avoid washouts of evidence with high-pressure streams.</li>
                      <li>Do NOT clean out ashes, charcoal, or furniture from the origin room until the investigator documents them.</li>
                    </ul>
                  </div>

                  <div className="bg-zinc-50 dark:bg-black/30 border border-zinc-200/50 dark:border-white/5 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-red-600" />
                      <span>Indications of Intentional Fires</span>
                    </h4>
                    <div className="space-y-1.5 font-semibold text-xs text-zinc-600 dark:text-zinc-400">
                      <div>• <strong>Multiple Points of Origin:</strong> Unconnected fire spots.</div>
                      <div>• <strong>Pour Patterns:</strong> "V-patterns" or trailing burns on floors indicative of liquid accelerants.</div>
                      <div>• <strong>Missing Valuables:</strong> Closets emptied, family photo albums gone before arrival.</div>
                      <div>• <strong>Incendiary Devices:</strong> Bottles, matches, timers, or wires.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 3. HYDRAULICS CALCULATOR SECTION */}
      {activeTab === 'hydraulics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (Left) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-3xl p-5 shadow-md space-y-5">
              <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-white/5 pb-3">
                <Sliders className="w-4 h-4 text-red-600" />
                <span>Line Input Parameters</span>
              </h3>

              {/* Hose Diameter */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Hose Size (Diameter)</label>
                <div className="grid grid-cols-4 gap-1.5 bg-zinc-100 dark:bg-black/30 p-1 rounded-xl">
                  {[
                    { dia: 1.5, label: "1.5\"" },
                    { dia: 1.75, label: "1.75\"" },
                    { dia: 2.5, label: "2.5\"" },
                    { dia: 5, label: "5\"" }
                  ].map((hose) => (
                    <button
                      key={hose.dia}
                      type="button"
                      onClick={() => setHoseDiameter(hose.dia)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                        hoseDiameter === hose.dia 
                          ? 'bg-red-600 text-white shadow-sm' 
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      {hose.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flow GPM Slider / Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  <span>Flow GPM (Water Stream)</span>
                  <span className="text-red-500 dark:text-red-400">{flowGPM} GPM</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="25"
                  value={flowGPM}
                  onChange={(e) => setFlowGPM(parseInt(e.target.value))}
                  className="w-full accent-red-600 bg-zinc-100 dark:bg-white/5 h-2 rounded-lg"
                />
              </div>

              {/* Hose Length */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  <span>Hose Length (Lay)</span>
                  <span className="text-red-500 dark:text-red-400">{hoseLength} Feet</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={hoseLength}
                  onChange={(e) => setHoseLength(parseInt(e.target.value))}
                  className="w-full accent-red-600 bg-zinc-100 dark:bg-white/5 h-2 rounded-lg"
                />
              </div>

              {/* Nozzle Pressure Preset */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Nozzle Pressure Preset</label>
                <div className="grid grid-cols-3 gap-1.5 bg-zinc-100 dark:bg-black/30 p-1 rounded-xl">
                  {[
                    { press: 100, label: "Fog (100)" },
                    { press: 75, label: "Fog Low (75)" },
                    { press: 50, label: "Smooth (50)" }
                  ].map((pres) => (
                    <button
                      key={pres.press}
                      type="button"
                      onClick={() => setNozzlePressure(pres.press)}
                      className={`py-1.5 px-1 text-[10px] font-bold transition-all rounded-lg ${
                        nozzlePressure === pres.press
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      {pres.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Elevation Change */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  <span>Elevation Change</span>
                  <span className={elevationChange >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                    {elevationChange >= 0 ? `+${elevationChange}` : elevationChange} ft ({Math.round(elevationChange * 0.434)} PSI)
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="200"
                  step="10"
                  value={elevationChange}
                  onChange={(e) => setElevationChange(parseInt(e.target.value))}
                  className="w-full accent-red-600 bg-zinc-100 dark:bg-white/5 h-2 rounded-lg"
                />
              </div>

              {/* Appliances loss */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Appliance/Wye Friction Loss</label>
                <div className="grid grid-cols-4 gap-1.5 bg-zinc-100 dark:bg-black/30 p-1 rounded-xl">
                  {[
                    { val: 0, label: "None (0)" },
                    { val: 5, label: "Wye (+5)" },
                    { val: 10, label: "Master (+10)" },
                    { val: 15, label: "Aerial (+15)" }
                  ].map((app) => (
                    <button
                      key={app.val}
                      type="button"
                      onClick={() => setAppliances(app.val)}
                      className={`py-1.5 px-0.5 text-[9px] font-bold transition-all rounded-lg ${
                        appliances === app.val
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      {app.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Calculations Outcome Card (Right) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[420px] text-white">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:24px_24px] opacity-10 pointer-events-none" />

              <div className="z-10 flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-mono font-black uppercase text-zinc-500 tracking-widest block">Tactics & Hydraulics</span>
                  <h4 className="text-xs font-black uppercase text-white mt-0.5">Pump Discharge Pressure (PDP) Results</h4>
                </div>
                <div className="bg-red-600 text-white font-mono text-[9px] font-black uppercase tracking-wider py-1 px-2.5 rounded-lg">
                  Formula: PDP = NP + FL + EL + APP
                </div>
              </div>

              {/* Gauge Style Large Reading */}
              <div className="flex-1 flex flex-col items-center justify-center py-6 z-10 space-y-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black">RECOMMENDED ENGINE PRESSURE</span>
                <div className="flex items-baseline gap-1 animate-pulse">
                  <span className="text-6xl md:text-7xl font-black text-red-500 tracking-tight">{pumpDischargePressure}</span>
                  <span className="text-lg font-bold text-zinc-400">PSI</span>
                </div>
                <p className="text-center text-[11px] text-zinc-400 max-w-sm">
                  Recommended Pump Discharge Pressure for {hoseDiameter}" hose, flowing {flowGPM} GPM through a {hoseLength} ft lay.
                </p>
              </div>

              {/* Dynamic calculations rundown grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl z-10 text-xs font-mono">
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase block font-black">NP Preset</span>
                  <span className="text-white font-bold block mt-1">{nozzlePressure} PSI</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase block font-black">Friction Loss</span>
                  <span className="text-red-400 font-bold block mt-1">+{frictionLoss} PSI</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase block font-black">Elevation Loss</span>
                  <span className="text-amber-500 font-bold block mt-1">
                    {elevationLoss >= 0 ? `+${elevationLoss}` : elevationLoss} PSI
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase block font-black">Appliances</span>
                  <span className="text-blue-400 font-bold block mt-1">+{appliances} PSI</span>
                </div>
              </div>

              <div className="text-[10px] text-zinc-500 font-mono mt-3 z-10 text-center">
                * Note: C coefficients derived from NFPA fire stream recommendations: 1.75" is 15.5; 2.5" is 2.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Q&A STUDY FLASHCARDS SECTION */}
      {activeTab === 'flashcards' && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Controls */}
          <div className="flex justify-between items-center bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-mono">Filters:</span>
              {['ALL', 'FF1', 'FF2'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    setCardLevelFilter(lvl as any);
                    setCurrentCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    cardLevelFilter === lvl
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <span className="text-xs font-mono font-bold text-zinc-500">
              Card {currentCardIndex + 1} of {filteredCards.length}
            </span>
          </div>

          {/* Interactive Card */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer perspective-1000 h-[300px] w-full relative group"
          >
            <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}>
              
              {/* FRONT SIDE */}
              <div className={`absolute inset-0 backface-hidden bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-3xl p-8 flex flex-col justify-between shadow-xl transition-all duration-300 ${
                isFlipped ? 'opacity-0 pointer-events-none select-none invisible' : 'opacity-100'
              }`}>
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 bg-red-600/10 text-red-600 font-mono text-[9px] uppercase tracking-wider rounded-md border border-red-600/20 font-black">
                    {filteredCards[currentCardIndex]?.level} — {filteredCards[currentCardIndex]?.category}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-wider">FRONT — Click to Flip</span>
                </div>

                <div className="flex-1 flex items-center justify-center text-center">
                  <p className="text-lg md:text-xl font-black text-zinc-900 dark:text-white leading-relaxed max-w-xl">
                    {filteredCards[currentCardIndex]?.question}
                  </p>
                </div>

                <div className="text-center text-[10px] text-zinc-400 font-mono uppercase font-black">
                  * Think of the answer, then click to flip and review.
                </div>
              </div>

              {/* BACK SIDE */}
              <div className={`absolute inset-0 backface-hidden rotate-y-180 bg-zinc-950 border-2 border-zinc-800 rounded-3xl p-8 flex flex-col justify-between shadow-xl text-white transition-all duration-300 ${
                isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none select-none invisible'
              }`}>
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 font-mono text-[9px] uppercase tracking-wider rounded-md border border-emerald-500/20 font-black">
                    {filteredCards[currentCardIndex]?.level} — {filteredCards[currentCardIndex]?.category}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-wider">BACK — Click to Flip</span>
                </div>

                <div className="flex-1 flex items-center justify-center text-center">
                  <p className="text-base md:text-lg font-bold text-emerald-400 dark:text-emerald-400 leading-relaxed max-w-xl">
                    {filteredCards[currentCardIndex]?.answer}
                  </p>
                </div>

                <div className="text-center text-[10px] text-zinc-500 font-mono uppercase font-black">
                  * Click again to flip back to question.
                </div>
              </div>

            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={(e) => { e.stopPropagation(); handlePrevCard(); }}
              className="py-3 px-6 bg-white dark:bg-[#1C1C1E] hover:bg-zinc-50 dark:hover:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-white transition-all active:scale-95 shadow-sm"
            >
              Previous Card
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNextCard(); }}
              className="py-3 px-8 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-md"
            >
              Next Card
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
