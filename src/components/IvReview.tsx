import React, { useState } from 'react';
import { 
  ShieldAlert, Baby, Zap, 
  Droplets, AlertCircle, Calendar, ListTodo, Activity, Info, Lightbulb, CheckCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

import cephalicImg from '../assets/images/cephalic_vein_1783821812590.jpg';
import basilicImg from '../assets/images/basilic_vein_1783821822696.jpg';
import medianCubitalImg from '../assets/images/median_cubital_vein_1783821834479.jpg';
import handDorsumImg from '../assets/images/hand_dorsum_vein_1783821843993.jpg';
import saphenousImg from '../assets/images/saphenous_vein_1783821853733.jpg';
import scalpImg from '../assets/images/scalp_veins_1783821863097.jpg';

type IvSite = 'cephalic' | 'basilic' | 'median_cubital' | 'hand_dorsum' | 'saphenous' | 'scalp';

export default function IvReview() {
  const [ivPatientType, setIvPatientType] = useState<'adult' | 'pediatric'>('adult');
  const [selectedIvSite, setSelectedIvSite] = useState<IvSite>('cephalic');
  const [ivActiveSubSection, setIvActiveSubSection] = useState<'landmarks' | 'needles' | 'procedures' | 'complications' | 'safety'>('landmarks');
  
  // Suggested IV gauge based on selection or weight
  const [ivScenario, setIvScenario] = useState<'trauma' | 'blood' | 'standard' | 'elderly' | 'pediatric_standard' | 'neonatal'>('standard');

  const handlePatientTypeChange = (type: 'adult' | 'pediatric') => {
    setIvPatientType(type);
    if (type === 'adult') {
      if (selectedIvSite === 'saphenous' || selectedIvSite === 'scalp') {
        setSelectedIvSite('cephalic');
      }
      if (ivScenario === 'pediatric_standard' || ivScenario === 'neonatal') {
        setIvScenario('standard');
      }
    } else {
      if (selectedIvSite === 'cephalic' || selectedIvSite === 'median_cubital') {
        setSelectedIvSite('hand_dorsum');
      }
      if (ivScenario === 'trauma' || ivScenario === 'standard') {
        setIvScenario('pediatric_standard');
      }
    }
  };

  // Flow rate estimation based on gauge
  const getFlowRateInfo = (gauge: number) => {
    switch(gauge) {
      case 14: return { flow: '240 mL/min', color: 'bg-orange-500 text-white', use: 'Trauma, massive transfusion, rapid fluid resuscitation' };
      case 16: return { flow: '180 mL/min', color: 'bg-zinc-400 text-zinc-900 dark:bg-zinc-500 dark:text-white', use: 'Major trauma, surgery, rapid volume delivery' };
      case 18: return { flow: '90-110 mL/min', color: 'bg-emerald-500 text-white', use: 'Blood transfusions, CT contrast, surgical protocols' };
      case 20: return { flow: '60-65 mL/min', color: 'bg-pink-500 text-white', use: 'Standard adult gauge, routine fluids, medications' };
      case 22: return { flow: '35-38 mL/min', color: 'bg-blue-500 text-white', use: 'Small veins, elderly, pediatrics, routine infusions' };
      case 24: return { flow: '20-22 mL/min', color: 'bg-yellow-500 text-zinc-900 dark:bg-yellow-400 dark:text-zinc-950', use: 'Infants, toddlers, neonates, fragile veins' };
      default: return { flow: 'Unknown', color: 'bg-zinc-500 text-white', use: 'Routine access' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-zinc-150 dark:border-white/5 pb-4">
        <div>
          <h3 className="text-base font-black uppercase tracking-tight text-zinc-950 dark:text-white flex items-center gap-2">
            <Droplets className="w-5 h-5 text-red-600 dark:text-emerald-400 animate-pulse shrink-0" />
            <span>Intravenous (IV) Cannulation Reference Manual</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-white/40">Clinical guidelines for peripheral intravenous access, vein selection, needle sizing, and pediatric vs. adult specific protocols.</p>
        </div>
        
        {/* Patient Type Filter */}
        <div className="flex bg-zinc-100 dark:bg-white/5 p-1 rounded-xl shrink-0">
          {(['adult', 'pediatric'] as const).map((type) => (
            <button
              key={type}
              onClick={() => handlePatientTypeChange(type)}
              className={cn(
                "px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5",
                ivPatientType === type 
                  ? "bg-white dark:bg-white/10 text-zinc-950 dark:text-white shadow-xs" 
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white/80"
              )}
            >
              {type === 'pediatric' && <Baby className="w-3.5 h-3.5" />}
              <span>{type === 'adult' ? 'Adult Protocol' : 'Pediatric Protocol'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Tabs / Section Navigation */}
      <div className="flex bg-zinc-50 dark:bg-white/[0.02] border border-zinc-150 dark:border-white/5 p-1 rounded-xl overflow-x-auto whitespace-nowrap scrollbar-none">
        {[
          { id: 'landmarks', label: '1. Vein Anatomy & Sites', icon: <Activity className="w-4 h-4" /> },
          { id: 'needles', label: '2. Gauge & Flow Sizing', icon: <Zap className="w-4 h-4" /> },
          { id: 'procedures', label: '3. 10-Step Insertion', icon: <ListTodo className="w-4 h-4" /> },
          { id: 'complications', label: '4. Complications', icon: <AlertCircle className="w-4 h-4" /> },
          { id: 'safety', label: ivPatientType === 'adult' ? '5. Adult Safety Guidelines' : '5. Pediatric Safety Guidelines', icon: <ShieldAlert className="w-4 h-4" /> },
        ].map((subSec) => (
          <button
            key={subSec.id}
            onClick={() => setIvActiveSubSection(subSec.id as any)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border border-transparent",
              ivActiveSubSection === subSec.id
                ? "bg-zinc-900 text-white dark:bg-white/10 dark:text-white border-zinc-950 dark:border-white/5 shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white/80"
            )}
          >
            {subSec.icon}
            <span>{subSec.label}</span>
          </button>
        ))}
      </div>

      {/* Content Panels */}
      <div className="animate-fade-in">
        
        {/* SECTION 1: VEIN ANATOMY & SITES */}
        {ivActiveSubSection === 'landmarks' && (
          <div className="space-y-6">
            <div className="space-y-4">
              {/* Site Selection Tabs */}
              <div className="flex flex-wrap gap-1.5 bg-zinc-100 dark:bg-white/5 p-1 rounded-xl">
                {ivPatientType === 'adult' ? (
                  <>
                    {(['cephalic', 'basilic', 'median_cubital', 'hand_dorsum'] as const).map((site) => (
                      <button
                        key={site}
                        onClick={() => setSelectedIvSite(site)}
                        className={cn(
                          "flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all border",
                          selectedIvSite === site
                            ? "bg-white dark:bg-white/10 text-zinc-950 dark:text-white border-zinc-200 dark:border-white/10 shadow-xs"
                            : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white/80"
                        )}
                      >
                        {site.replace('_', ' ')}
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    {(['hand_dorsum', 'saphenous', 'scalp', 'basilic'] as const).map((site) => (
                      <button
                        key={site}
                        onClick={() => setSelectedIvSite(site)}
                        className={cn(
                          "flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all border",
                          selectedIvSite === site
                            ? "bg-white dark:bg-white/10 text-zinc-950 dark:text-white border-zinc-200 dark:border-white/10 shadow-xs"
                            : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white/80"
                        )}
                      >
                        {site === 'saphenous' ? 'Saphenous (Ankle)' : site === 'scalp' ? 'Scalp (Infant)' : site.replace('_', ' ')}
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Detail Card */}
              <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  
                  {/* Visual Canvas of Selected Anatomy */}
                  <div className="relative w-full aspect-video md:aspect-[16/10] lg:aspect-[16/9] bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 flex flex-col justify-between p-4 min-h-[350px] md:min-h-[480px]">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:24px_24px] opacity-10 pointer-events-none" />
                    
                    <div className="absolute top-3 left-3 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-xl font-mono text-[9px] text-zinc-400 uppercase tracking-widest z-10 flex items-center gap-1.5">
                      <Activity className="w-3 h-3 text-red-500 dark:text-emerald-400 animate-pulse" />
                      <span>Official Manual Reference</span>
                    </div>

                    {/* Visual Image */}
                    <div className="flex-1 flex items-center justify-center relative w-full h-full min-h-0">
                      <div className="relative w-full h-full flex items-center justify-center py-4">
                        <motion.img
                          key={selectedIvSite}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          src={
                            selectedIvSite === 'cephalic'
                              ? cephalicImg
                              : selectedIvSite === 'basilic'
                              ? basilicImg
                              : selectedIvSite === 'median_cubital'
                              ? medianCubitalImg
                              : selectedIvSite === 'hand_dorsum'
                              ? handDorsumImg
                              : selectedIvSite === 'saphenous'
                              ? saphenousImg
                              : scalpImg
                          }
                          alt={`${selectedIvSite.replace('_', ' ')} landmark`}
                          className="max-h-[300px] md:max-h-[420px] lg:max-h-[460px] w-auto h-auto object-contain rounded-lg shadow-xl border border-zinc-800/80"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-zinc-500 font-mono text-[9px] pt-2 border-t border-zinc-900 z-10">
                      <span>FLOW ANATOMY DIRECTION: DISTAL TO PROXIMAL (TOWARD HEART)</span>
                      <span>PREFERENCE: START DISTALLY ON HAND</span>
                    </div>
                  </div>

                  {/* Anatomical instructions column */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-zinc-500" />
                      <span className="text-[10px] font-mono font-black uppercase text-zinc-400">Palpation & Clinical Pearls</span>
                    </div>

                    {selectedIvSite === 'cephalic' && (
                      <div className="text-xs text-zinc-600 dark:text-white/70 space-y-2 leading-relaxed">
                        <p><strong>1. Location:</strong> Runs along the radial (thumb) side of the forearm. Easy to find above the wrist bony prominence.</p>
                        <p><strong>2. Features:</strong> Straight, thick vein with excellent dermal support. Excellent choice for larger gauge catheters (18G-20G) and long-term access.</p>
                        <p className="text-emerald-600 dark:text-emerald-400 font-bold">💡 Clinical Tip: This vein doesn't roll easily as it is anchored well by surrounding forearm tissue.</p>
                      </div>
                    )}

                    {selectedIvSite === 'basilic' && (
                      <div className="text-xs text-zinc-600 dark:text-white/70 space-y-2 leading-relaxed">
                        <p><strong>1. Location:</strong> Runs along the ulnar (pinky) side of the forearm, curving around towards the antecubital area.</p>
                        <p><strong>2. Features:</strong> Often large and highly visible, but **notoriously unstable**. It tends to roll upon needle contact if not anchored with strong skin traction.</p>
                        <p className="text-orange-600 dark:text-orange-400 font-bold">⚠️ Warning: The ulnar nerve and brachial artery lie deeper below the basilic path. Proceed carefully.</p>
                      </div>
                    )}

                    {selectedIvSite === 'median_cubital' && (
                      <div className="text-xs text-zinc-600 dark:text-white/70 space-y-2 leading-relaxed">
                        <p><strong>1. Location:</strong> Crosses the antecubital fossa (inner elbow crease) connecting the cephalic and basilic veins.</p>
                        <p><strong>2. Features:</strong> The easiest, most reliable emergency vein on the arm. Large bore, rarely rolls, excellent for immediate resuscitation fluid boluses, rapid push meds, or CT contrast.</p>
                        <p className="text-red-600 dark:text-red-400 font-bold">🛑 Limit: Avoid for long-term routine therapy as arm flexion will kink the catheter, trigger occlusion alarms, and increase infiltration rates.</p>
                      </div>
                    )}

                    {selectedIvSite === 'hand_dorsum' && (
                      <div className="text-xs text-zinc-600 dark:text-white/70 space-y-2 leading-relaxed">
                        <p><strong>1. Location:</strong> The back of the hand. Formed by the convergence of the digital veins.</p>
                        <p><strong>2. Features:</strong> Highly accessible and visual. Ideal for starting distal access. Highly mobile, but can roll easily. Usually capped at 20G or 22G except in emergency.</p>
                        <p className="text-emerald-600 dark:text-emerald-400 font-bold">👶 Pediatric Choice: This is the most common site for starting IVs in pediatric toddlers or children because of easy splinting.</p>
                      </div>
                    )}

                    {selectedIvSite === 'saphenous' && (
                      <div className="text-xs text-zinc-600 dark:text-white/70 space-y-2 leading-relaxed">
                        <p><strong>1. Location:</strong> Great Saphenous vein runs anterior to the medial malleolus (inner ankle bone bone plateau).</p>
                        <p><strong>2. Features:</strong> Easily accessible in infants, toddlers, and young children. Anchored firmly on the bone, making insertion simple even when chubby subcutaneous fat obscures other sites.</p>
                        <p className="text-amber-600 dark:text-amber-400 font-bold">⚠️ Pediatric Rule: Highly useful in pediatrics, but generally avoided in walking adults due to high risk of deep vein thrombosis (DVT) and phlebitis.</p>
                      </div>
                    )}

                    {selectedIvSite === 'scalp' && (
                      <div className="text-xs text-zinc-600 dark:text-white/70 space-y-2 leading-relaxed">
                        <p><strong>1. Location:</strong> Frontal, superficial temporal, or posterior auricular veins of the head.</p>
                        <p><strong>2. Features:</strong> Only used in infants up to approximately 9 to 12 months of age, before the skull sutures fully fuse and scalp skin thickens. Lack of valves simplifies flow.</p>
                        <p className="text-red-600 dark:text-red-400 font-bold">📢 Directional Tip: Point the catheter downwards towards the heart. Scalp veins do not contain valves, so fluid flows downward smoothly. Always shave a small patch of hair first.</p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: GAUGE & FLOW SIZING */}
        {ivActiveSubSection === 'needles' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-6">
              
              <div className="border-b border-zinc-150 dark:border-white/5 pb-3 flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono font-black uppercase text-zinc-400 tracking-wider">Clinical Flow Sizing</span>
                  <h3 className="text-base font-black uppercase tracking-tight text-zinc-950 dark:text-white">IV Gauge Selection Matrix</h3>
                  <p className="text-xs text-zinc-500 dark:text-white/40 mt-1">Proper selection guarantees fluid delivery speed while preventing mechanical trauma to vein walls.</p>
                </div>

                {/* Scenario Tester */}
                <div className="flex bg-zinc-100 dark:bg-white/5 p-1 rounded-xl">
                  {ivPatientType === 'adult' ? (
                    <>
                      {(['trauma', 'blood', 'standard', 'elderly'] as const).map((scen) => (
                        <button
                          key={scen}
                          onClick={() => setIvScenario(scen)}
                          className={cn(
                            "px-2.5 py-1 text-[9px] font-mono font-black uppercase tracking-wider rounded-lg transition-all",
                            ivScenario === scen 
                              ? "bg-white dark:bg-white/10 text-zinc-950 dark:text-white shadow-xs" 
                              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white/80"
                          )}
                        >
                          {scen}
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {(['pediatric_standard', 'neonatal'] as const).map((scen) => (
                        <button
                          key={scen}
                          onClick={() => setIvScenario(scen)}
                          className={cn(
                            "px-2.5 py-1 text-[9px] font-mono font-black uppercase tracking-wider rounded-lg transition-all",
                            ivScenario === scen 
                              ? "bg-white dark:bg-white/10 text-zinc-950 dark:text-white shadow-xs" 
                              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white/80"
                          )}
                        >
                          {scen.replace('_', ' ')}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Dynamic Interactive Scenario Card */}
              <div className="p-4 bg-red-500/5 dark:bg-emerald-500/5 border border-red-500/20 dark:border-emerald-500/20 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-black uppercase text-red-600 dark:text-emerald-400 tracking-wider">Selected Clinical Scenario</span>
                  <h4 className="text-sm font-black uppercase text-zinc-900 dark:text-white">
                    {ivScenario === 'trauma' && '🚨 Extreme Shock / Massive Trauma Bolus'}
                    {ivScenario === 'blood' && '🩸 Rapid Blood Transfusion / CT Contrast'}
                    {ivScenario === 'standard' && '💊 Routine Medical Admission / Standard Infusions'}
                    {ivScenario === 'elderly' && '👴 Geriatric Patients with Fragile / Collapsed Veins'}
                    {ivScenario === 'pediatric_standard' && '👶 Pediatric Emergency / Dehydrated Toddler'}
                    {ivScenario === 'neonatal' && '🍼 Neonate / Newborn Micro-vascular Infusion'}
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-white/60 leading-normal font-medium max-w-xl">
                    {ivScenario === 'trauma' && 'Requires instantaneous volume expansion. Use the largest bore possible to prevent resistance. A 14G or 16G is highly recommended.'}
                    {ivScenario === 'blood' && 'Packed RBCs are viscous; small gauges cause hemolysis. Rapid contrast CT requires high pressure. Minimum 18G preferred, 20G is acceptable.'}
                    {ivScenario === 'standard' && 'Safe, reliable access for maintenance fluids, antibiotics, or non-irritating IV medications. Standard 20G is ideal.'}
                    {ivScenario === 'elderly' && 'Elderly patients have thin, hyper-fragile vein walls and sparse subcutaneous support. Select a gentle 22G to prevent hematomas.'}
                    {ivScenario === 'pediatric_standard' && 'Children have narrow vessels and higher anxiety. Choose a flexible, thin 22G or 24G catheter with distracting support.'}
                    {ivScenario === 'neonatal' && 'Extremely micro-vascular vessels. Use 24G or 26G. Scalp or foot veins may be required due to umbilical line completion.'}
                  </p>
                </div>
                
                {/* Target Recommendation Badge */}
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-center shrink-0 min-w-[150px]">
                  <span className="text-[9px] font-mono font-black text-zinc-500 uppercase tracking-widest block">RECOMMENDED GAUGE</span>
                  <span className={cn(
                    "text-2xl font-black rounded-lg px-4 py-1.5 inline-block mt-2 font-mono",
                    ivScenario === 'trauma' && 'bg-orange-500 text-white',
                    ivScenario === 'blood' && 'bg-emerald-500 text-white',
                    ivScenario === 'standard' && 'bg-pink-500 text-white',
                    ivScenario === 'elderly' && 'bg-blue-500 text-white',
                    ivScenario === 'pediatric_standard' && 'bg-yellow-500 text-zinc-900',
                    ivScenario === 'neonatal' && 'bg-yellow-500 text-zinc-900'
                  )}>
                    {ivScenario === 'trauma' && '14G - 16G'}
                    {ivScenario === 'blood' && '18G'}
                    {ivScenario === 'standard' && '20G'}
                    {ivScenario === 'elderly' && '22G'}
                    {ivScenario === 'pediatric_standard' && '22G - 24G'}
                    {ivScenario === 'neonatal' && '24G'}
                  </span>
                </div>
              </div>

              {/* Grid of Gauges */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {[14, 16, 18, 20, 22, 24].map((gauge) => {
                  const info = getFlowRateInfo(gauge);
                  return (
                    <div 
                      key={gauge} 
                      className={cn(
                        "p-4 border rounded-2xl flex flex-col justify-between space-y-3 relative transition-all",
                        "bg-zinc-50/50 dark:bg-white/[0.01] border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10"
                      )}
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className={cn("px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase tracking-widest border border-white/10", info.color)}>
                            {gauge} Gauge
                          </span>
                          <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs" style={{
                            backgroundColor: 
                              gauge === 14 ? '#f97316' : 
                              gauge === 16 ? '#a1a1aa' : 
                              gauge === 18 ? '#10b981' : 
                              gauge === 20 ? '#ec4899' : 
                              gauge === 22 ? '#3b82f6' : '#eab308'
                          }}></span>
                        </div>
                        <span className="block text-xs font-mono font-black text-red-600 dark:text-emerald-400 uppercase pt-1">Flow: {info.flow}</span>
                      </div>
                      
                      <p className="text-[10px] text-zinc-500 dark:text-white/50 leading-normal font-medium">{info.use}</p>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}

        {/* SECTION 3: 10-STEP INSERTION PROCEDURE */}
        {ivActiveSubSection === 'procedures' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="border-b border-zinc-150 dark:border-white/5 pb-3">
                <span className="text-[9px] font-mono font-black uppercase text-zinc-400 tracking-wider">Clinical Guideline</span>
                <h3 className="text-base font-black uppercase tracking-tight text-zinc-950 dark:text-white">10-Step Peripheral IV Technique</h3>
                <p className="text-xs text-zinc-500 dark:text-white/40 mt-1">Proper, hygienic sequence for establishing a stable, patent IV line.</p>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-3.5 pt-2">
                {[
                  { step: "1", title: "Prep Supplies", desc: "Gather IV start kit (tourniquet, chlorhexidine scrub, tegaderm, tape), gauze, saline flush, J-loop extension, and correct gauge catheter." },
                  { step: "2", title: "Explanation & Consent", desc: "Verify patient identity, explain the steps to decrease anxiety, and obtain consent. Prime the extension set with saline to eliminate air." },
                  { step: "3", title: "Tourniquet & Palpate", desc: "Apply tourniquet 4-6 inches above target. Have patient close fist. Palpate for a springy, bouncy vein path rather than just relying on vision." },
                  { step: "4", title: "Sterilize Site", desc: "Scrub site with Chlorhexidine Gluconate (CHG) back-and-forth vigorously for 30 seconds. Allow to dry completely (crucial to kill bacteria)." },
                  { step: "5", title: "Traction & Angle", desc: "Anchor the vein with skin traction (pull down below site). Insert needle bevel-up at 15-30 degrees directly into the vein." },
                  { step: "6", title: "Look for Flashback", desc: "Watch flashback chamber for blood. Lower catheter angle to 10-15 degrees and advance 1-2 mm further to ensure the plastic cannula is fully in lumen." },
                  { step: "7", title: "Slide Cannula", desc: "Thread the plastic catheter forward into the vein while holding the needle stylet completely still. Release the tourniquet immediately." },
                  { step: "8", title: "Occlude & Withdraw", desc: "Occlude the vein proximal to catheter tip, withdraw needle stylet (engage safety trigger), and immediately secure the primed extension set." },
                  { step: "9", title: "Flush & Verify", desc: "Gently push saline flush while checking for patency. Feel for swelling, cool skin, resistance, or pain at the site." },
                  { step: "10", title: "Dress & Label", desc: "Apply transparent sterile dressing (Tegaderm) over the hub. Tape J-loop securely. Label with date, time, catheter gauge, and initials." }
                ].map((item) => (
                  <div key={item.step} className="p-4 bg-zinc-50 dark:bg-white/[0.01] border border-zinc-150 dark:border-white/5 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                    <span className="absolute -top-3 -right-3 text-5xl font-black text-zinc-250/30 dark:text-white/[0.02] font-mono select-none">
                      {item.step}
                    </span>
                    <div className="space-y-1 z-10">
                      <span className="text-[8px] font-mono font-black text-red-600 dark:text-emerald-400 uppercase tracking-widest block">Step 0{item.step}</span>
                      <h4 className="font-black text-xs uppercase tracking-tight text-zinc-900 dark:text-white leading-tight">{item.title}</h4>
                      <p className="text-[10px] text-zinc-500 dark:text-white/60 leading-normal font-medium pt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: COMPLICATIONS */}
        {ivActiveSubSection === 'complications' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="border-b border-zinc-150 dark:border-white/5 pb-3">
                <span className="text-[9px] font-mono font-black uppercase text-red-600 dark:text-emerald-400 tracking-wider">Clinical Vigilance</span>
                <h3 className="text-base font-black uppercase tracking-tight text-zinc-950 dark:text-white">IV Complications & Actions</h3>
                <p className="text-xs text-zinc-500 dark:text-white/40 mt-1">Key indicators of IV site failures and the required nursing/paramedic interventions.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 pt-2">
                {/* Infiltration */}
                <div className="border border-zinc-150 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01] p-5 rounded-2xl space-y-3">
                  <span className="px-2 py-0.5 rounded text-[8px] font-mono font-black bg-red-500/10 text-red-600 dark:text-red-400 uppercase tracking-widest border border-red-500/20">Infiltration</span>
                  <h4 className="text-sm font-black uppercase text-zinc-800 dark:text-zinc-200">Fluid In Subcutaneous Tissue</h4>
                  
                  <div className="space-y-1 text-xs text-zinc-600 dark:text-white/70">
                    <p><strong>Signs:</strong> Swelling, tightness, coolness around insertion site, pale skin, diminished infusion speed.</p>
                    <p className="text-red-600 dark:text-red-400 font-bold">🚨 Immediate Action: Stop infusion immediately. Remove catheter. Elevate the extremity and apply warm/cool compress.</p>
                  </div>
                </div>

                {/* Phlebitis */}
                <div className="border border-zinc-150 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01] p-5 rounded-2xl space-y-3">
                  <span className="px-2 py-0.5 rounded text-[8px] font-mono font-black bg-orange-500/10 text-orange-600 dark:text-orange-400 uppercase tracking-widest border border-orange-500/20">Phlebitis</span>
                  <h4 className="text-sm font-black uppercase text-zinc-800 dark:text-zinc-200">Chemical/Mechanical Inflammation</h4>
                  
                  <div className="space-y-1 text-xs text-zinc-600 dark:text-white/70">
                    <p><strong>Signs:</strong> Erythema (redness), warmth, pain along vein path, hard palpable "cord-like" vein vein.</p>
                    <p className="text-red-600 dark:text-red-400 font-bold">🚨 Immediate Action: Discontinue catheter immediately. Apply warm, moist compress to site. Document phlebitis scale rating.</p>
                  </div>
                </div>

                {/* Extravasation */}
                <div className="border border-zinc-150 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01] p-5 rounded-2xl space-y-3">
                  <span className="px-2 py-0.5 rounded text-[8px] font-mono font-black bg-purple-500/10 text-purple-600 dark:text-purple-400 uppercase tracking-widest border border-purple-500/20">Extravasation</span>
                  <h4 className="text-sm font-black uppercase text-zinc-800 dark:text-zinc-200">Vesicant Fluid Infiltration</h4>
                  
                  <div className="space-y-1 text-xs text-zinc-600 dark:text-white/70">
                    <p><strong>Signs:</strong> Pain, stinging, blistering, tissue necrosis (caused by drugs like Amiodarone, Calcium, or Dopamine).</p>
                    <p className="text-red-600 dark:text-red-400 font-bold">🚨 Immediate Action: Stop infusion. Aspirate residual drug from catheter. Administer antidote if indicated. Withdraw catheter.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 5: PEDIATRIC VS ADULT SAFETY DIFFERENCES */}
        {ivActiveSubSection === 'safety' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in">
              
              <div className="border-b border-zinc-150 dark:border-white/5 pb-3">
                <span className="text-[9px] font-mono font-black uppercase text-red-600 dark:text-emerald-400">
                  {ivPatientType === 'adult' ? 'Adult Protocol Safety' : 'Pediatric Protocol Safety'}
                </span>
                <h3 className="text-base font-black uppercase tracking-tight text-zinc-950 dark:text-white">
                  {ivPatientType === 'adult' ? 'Adult Peripheral IV Safety Rules' : 'Pediatric Peripheral IV Safety Rules'}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-white/40 mt-1">
                  {ivPatientType === 'adult'
                    ? 'Vessels in adults have high valve frequencies, structural variations, and geriatric fragility. Adhere to these clinical guidelines.'
                    : 'Specialized guidelines for high-anxiety pediatric patients, tiny vessels, securement strategies, and fluid volume controls.'}
                </p>
              </div>

              <div>
                {ivPatientType === 'pediatric' ? (
                  /* Pediatric Sizing Protocols */
                  <div className="p-6 bg-zinc-50 dark:bg-white/[0.01] border border-zinc-150 dark:border-white/5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-150 dark:border-white/5 pb-2.5">
                      <Baby className="w-5 h-5 text-emerald-500 shrink-0" />
                      <h4 className="font-black text-sm uppercase text-zinc-900 dark:text-white">Pediatric-Specific Guidelines</h4>
                    </div>
                    
                    <ul className="space-y-4 text-xs text-zinc-600 dark:text-white/70 font-medium leading-relaxed">
                      <li className="flex gap-2 items-start">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>Distraction & Comfort:</strong> Involve parents/guardians, use topical anesthetics (LMX or EMLA cream) if time permits, and secure distraction tools or child-life techniques.</span>
                      </li>
                      <li className="flex gap-2 items-start">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>Securement (Taping):</strong> Children are highly active and prone to dislodging lines. Use specialized limb boards or splints if crossing joints to prevent catheter kinking. NEVER wrap tape fully circumferentially as this acts as an accidental tourniquet.</span>
                      </li>
                      <li className="flex gap-2 items-start">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>Attempt Limit:</strong> Max 2 attempts per provider. Limit total scene attempts to 4 to prevent severe pain and venous depletion. Transition to tibial IO if critically unstable and fluids/medications are urgently needed.</span>
                      </li>
                      <li className="flex gap-2 items-start">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>Volume Control:</strong> Always use a Buretrol set, microdrip (60 gtt/mL) sets, or volumetric syringe pump to prevent accidental fluid volume overload.</span>
                      </li>
                    </ul>
                  </div>
                ) : (
                  /* Adult Sizing Protocols */
                  <div className="p-6 bg-zinc-50 dark:bg-white/[0.01] border border-zinc-150 dark:border-white/5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-150 dark:border-white/5 pb-2.5">
                      <Activity className="w-5 h-5 text-pink-500 shrink-0" />
                      <h4 className="font-black text-sm uppercase text-zinc-900 dark:text-white">Adult-Specific Guidelines</h4>
                    </div>
                    
                    <ul className="space-y-4 text-xs text-zinc-600 dark:text-white/70 font-medium leading-relaxed">
                      <li className="flex gap-2 items-start">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>Distal-First Rule:</strong> Always start access as distal as possible (hand) before moving proximal (forearm, AC). If you fail proximal, you cannot easily use the veins distal to that failed site because fluid will leak into the subcutaneous space.</span>
                      </li>
                      <li className="flex gap-2 items-start">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>Valves Awareness:</strong> Adult veins have numerous valves. If you hit resistance while advancing, attach a syringe with saline and gently flush while pushing the catheter forward (floating the catheter in) rather than forcing it mechanically.</span>
                      </li>
                      <li className="flex gap-2 items-start">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>Geriatric Caution:</strong> Elderly veins have extremely fragile, thin walls and roll easily. Avoid tight tourniquets; sometimes a warm washcloth or simple light finger pressure is sufficient to distend the vein without bursting it.</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
