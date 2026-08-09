import React, { useState } from 'react';
import { 
  ShieldAlert, Baby, Zap, 
  Droplets, AlertCircle, Calendar, ListTodo, Activity, Info, Lightbulb
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

import proximalTibiaImg from '../assets/images/proximal_tibia_landmark_1783220483477.jpg';
import proximalHumerusImg from '../assets/images/proximal_humerus_landmark_1783220496403.jpg';
import distalFemurImg from '../assets/images/distal_femur_landmark_1783220515779.jpg';
import distalTibiaImg from '../assets/images/distal_tibia_landmark_1783220525787.jpg';

// Define the site types
type IoSite = 'proximal_tibia' | 'proximal_humerus' | 'distal_femur' | 'distal_tibia';

export default function IoReview() {
  const [ioPatientType, setIoPatientType] = useState<'adult' | 'pediatric'>('adult');
  const [selectedIoSite, setSelectedIoSite] = useState<IoSite>('proximal_tibia');
  const [ioActiveSubSection, setIoActiveSubSection] = useState<'landmarks' | 'needles' | 'procedures' | 'pain' | 'safety'>('landmarks');
  const [ioLidocaineWeight, setIoLidocaineWeight] = useState<number>(70);

  // Synchronize site when patient type changes (Adults don't have distal femur)
  const handlePatientTypeChange = (type: 'adult' | 'pediatric') => {
    setIoPatientType(type);
    if (type === 'adult' && selectedIoSite === 'distal_femur') {
      setSelectedIoSite('proximal_tibia');
    }
  };

  // Lidocaine dosage calculations (Page 8)
  const initialLidoDoseMg = ioPatientType === 'adult' ? 40 : Math.min(40, Number((ioLidocaineWeight * 0.5).toFixed(1)));
  const initialLidoVolMl = Number((initialLidoDoseMg / 20).toFixed(2)); // 2% is 20mg/mL
  const salineFlushVol = ioPatientType === 'adult' ? '5 - 10 mL' : '2 - 5 mL';
  const repeatLidoDoseMg = Number((initialLidoDoseMg / 2).toFixed(1));
  const repeatLidoVolMl = Number((repeatLidoDoseMg / 20).toFixed(2));

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-zinc-150 dark:border-white/5 pb-4">
        <div>
          <h3 className="text-base font-black uppercase tracking-tight text-zinc-950 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-red-600 dark:text-emerald-400 animate-pulse shrink-0" />
            <span>EZ-IO® Intraosseous Vascular Access System</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-white/40">Official clinical training reference manual for site selection, needle sizing, 10-step insertion, and lidocaine pain protocols.</p>
        </div>
        
        {/* Patient Type Filter */}
        <div className="flex bg-zinc-100 dark:bg-white/5 p-1 rounded-xl shrink-0">
          {(['adult', 'pediatric'] as const).map((type) => (
            <button
              key={type}
              onClick={() => handlePatientTypeChange(type)}
              className={cn(
                "px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5",
                ioPatientType === type 
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
          { id: 'landmarks', label: '1. Anatomy & Landmarks', icon: <Activity className="w-4 h-4" /> },
          { id: 'needles', label: '2. Needle & Sizing', icon: <Zap className="w-4 h-4" /> },
          { id: 'procedures', label: '3. Insertion & Removal', icon: <ListTodo className="w-4 h-4" /> },
          { id: 'pain', label: '4. Pain Management', icon: <Droplets className="w-4 h-4" /> },
          { id: 'safety', label: '5. Indications & Contraindications', icon: <ShieldAlert className="w-4 h-4" /> },
        ].map((subSec) => (
          <button
            key={subSec.id}
            onClick={() => setIoActiveSubSection(subSec.id as any)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border border-transparent",
              ioActiveSubSection === subSec.id
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
        
        {/* SECTION 1: ANATOMY & LANDMARKS */}
        {ioActiveSubSection === 'landmarks' && (
          <div className="space-y-6">
            
            {/* Site Detail and Landmarking Checklist */}
            <div className="space-y-4">
              
              {/* Site Selection Tabs in Detail Column */}
              <div className="flex flex-wrap gap-1.5 bg-zinc-100 dark:bg-white/5 p-1 rounded-xl">
                {ioPatientType === 'adult' ? (
                  <>
                    {(['proximal_tibia', 'proximal_humerus', 'distal_tibia'] as const).map((site) => (
                      <button
                        key={site}
                        onClick={() => setSelectedIoSite(site)}
                        className={cn(
                          "flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all border",
                          selectedIoSite === site
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
                    {(['proximal_tibia', 'distal_femur', 'proximal_humerus', 'distal_tibia'] as const).map((site) => (
                      <button
                        key={site}
                        onClick={() => setSelectedIoSite(site)}
                        className={cn(
                          "flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all border",
                          selectedIoSite === site
                            ? "bg-white dark:bg-white/10 text-zinc-950 dark:text-white border-zinc-200 dark:border-white/10 shadow-xs"
                            : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white/80"
                        )}
                      >
                        {site === 'distal_femur' ? 'Distal Femur' : site.replace('_', ' ')}
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Landmark Diagram Card */}
              <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
                
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
                        key={selectedIoSite}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        src={
                          selectedIoSite === 'proximal_tibia'
                            ? proximalTibiaImg
                            : selectedIoSite === 'proximal_humerus'
                            ? proximalHumerusImg
                            : selectedIoSite === 'distal_femur'
                            ? distalFemurImg
                            : distalTibiaImg
                        }
                        alt={`${selectedIoSite.replace('_', ' ')} landmark`}
                        className="max-h-[300px] md:max-h-[420px] lg:max-h-[460px] w-auto h-auto object-contain rounded-lg shadow-xl border border-zinc-800/80"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-zinc-500 font-mono text-[9px] pt-2 border-t border-zinc-900 z-10">
                    <span>NEEDLE DIRECTION: BONE SURFACE PERPENDICULAR (90°)</span>
                    <span>EXCEPTION: HUMERUS 45°</span>
                  </div>
                </div>

                {/* Landmarking Text Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-zinc-500" />
                    <span className="text-[10px] font-mono font-black uppercase text-zinc-400">Palpation & Anatomical Instructions</span>
                  </div>
                  
                  {selectedIoSite === 'proximal_tibia' && (
                    <div className="text-xs text-zinc-600 dark:text-white/70 space-y-2 font-medium leading-relaxed">
                      <p>
                        <strong>1. Patient Positioning:</strong> Extend the leg straight out to stabilize the joint knee.
                      </p>
                      <p>
                        <strong>2. Palpation:</strong> Locate the patella, slide your finger distally along the patellar ligament to identify the bony tubercle protrusion (tibial tuberosity).
                      </p>
                      <p>
                        {ioPatientType === 'adult' ? (
                          <span><strong>3. Target Point:</strong> Measure <strong>approximately 2 cm medial</strong> (inward) to the tibial tuberosity, along the flat anteromedial aspect of the tibia.</span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400"><strong>3. Target Point (Pediatric):</strong> Measure <strong>approximately 1 cm medial</strong> to the tibial tuberosity, and slightly distal (1 cm downward) along the flat bone. This avoids the proximal growth plate. If tuberosity cannot be palpated, find the target 1-2 cm below patella along flat aspect.</span>
                        )}
                      </p>
                    </div>
                  )}

                  {selectedIoSite === 'proximal_humerus' && (
                    <div className="text-xs text-zinc-600 dark:text-white/70 space-y-2 font-medium leading-relaxed">
                      <p>
                        <strong>1. Arm Positioning (CRITICAL):</strong> Adduct the arm tight to the side, and <strong>internally rotate</strong> the humerus. This can be achieved by placing their hand flat over their abdomen (Method 2) OR rotating the arm tight with palm facing outward, thumb pointing down (Method 1).
                      </p>
                      <p>
                        <strong>2. Palpation:</strong> Palpate the humeral shaft from distal to superior, letting your fingers slide up onto the rounded <strong>greater tubercle</strong>.
                      </p>
                      <p>
                        <strong>3. Target Point:</strong> Center of the greater tubercle. Angle the needle at approximately <strong>45-degrees</strong> pointing backward and downward toward the opposite hip.
                      </p>
                    </div>
                  )}

                  {selectedIoSite === 'distal_femur' && (
                    <div className="text-xs text-zinc-600 dark:text-white/70 space-y-2 font-medium leading-relaxed">
                      <p>
                        <strong>1. Patient Positioning:</strong> Outstretched leg with knee straight. Ensure the extremity is fully stabilized.
                      </p>
                      <p>
                        <strong>2. Palpation:</strong> Identify the superior border of the <strong>patella</strong> (kneecap) on the thigh.
                      </p>
                      <p>
                        <span className="text-emerald-600 dark:text-emerald-400"><strong>3. Target Point:</strong> Measure <strong>approximately 1 to 2 cm proximal</strong> to the superior patellar border, and <strong>1 cm medial</strong> to the midline of the femur shaft. Aim needle at a 90-degree angle to the bone.</span>
                      </p>
                    </div>
                  )}

                  {selectedIoSite === 'distal_tibia' && (
                    <div className="text-xs text-zinc-600 dark:text-white/70 space-y-2 font-medium leading-relaxed">
                      <p>
                        <strong>1. Patient Positioning:</strong> Stabilize ankle with leg flat.
                      </p>
                      <p>
                        <strong>2. Palpation:</strong> Identify the <strong>medial malleolus</strong> (the inner prominent ankle bone).
                      </p>
                      <p>
                        {ioPatientType === 'adult' ? (
                          <span><strong>3. Target Point:</strong> Measure <strong>approximately 3 cm proximal</strong> (above) the most prominent aspect of the medial malleolus. Palpate the flat midline of the tibia shaft.</span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400"><strong>3. Target Point (Pediatric):</strong> Measure <strong>approximately 1 to 2 cm proximal</strong> to the medial malleolus. Palpate the flat anterior-medial aspect of the bone.</span>
                        )}
                      </p>
                    </div>
                  )}

                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-red-800 dark:text-red-400 text-[11px] leading-relaxed">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold uppercase block tracking-wider text-[9px] mb-0.5">WARNING: STERNAL IO FORBIDDEN</span>
                      Do not use the Arrow® EZ-IO® System in the sternum. Sternal insertion is strictly contra-indicated with this system.
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: NEEDLE & SIZING GUIDE */}
        {ioActiveSubSection === 'needles' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="border-b border-zinc-150 dark:border-white/5 pb-3">
                <span className="text-[9px] font-mono font-black uppercase text-zinc-400 tracking-wider">Clinical Sizing Criteria</span>
                <h3 className="text-base font-black uppercase tracking-tight text-zinc-950 dark:text-white">Needle Length Selection Guide</h3>
                <p className="text-xs text-zinc-500 dark:text-white/40 mt-1">Sizing is based on patient weight, anatomy, and overlying tissue depth. Consider longer needles for thicker tissues.</p>
              </div>

              {/* Three Needles Flex Display */}
              <div className="grid md:grid-cols-3 gap-6 pt-2">
                {/* Pink */}
                <div className="border border-zinc-150 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01] p-5 rounded-2xl flex flex-col justify-between space-y-4 relative">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 rounded text-[8px] font-mono font-black bg-pink-500/20 text-pink-600 dark:text-pink-400 uppercase tracking-widest border border-pink-500/30">15 mm</span>
                      <span className="text-[10px] font-mono font-black text-zinc-400">Order: 9018P-VC-005</span>
                    </div>
                    <span className="block text-sm font-black uppercase text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-pink-500 block"></span>
                      <span>EZ-IO® 15 mm Needle Set</span>
                    </span>
                    <span className="block text-xs font-mono font-black text-red-600 dark:text-red-400 uppercase">Weight Range: 3 - 39 kg</span>
                    <p className="text-xs text-zinc-500 dark:text-white/40 leading-relaxed font-medium">Specifically designed for pediatric patients or adult candidates with exceptionally thin overlying subcutaneous tissue.</p>
                  </div>
                  
                  {/* Needle Drawing */}
                  <svg viewBox="0 0 100 30" className="w-full h-8 mt-2">
                    <rect x="10" y="11" width="12" height="8" rx="2" fill="#ec4899" />
                    <rect x="22" y="13" width="40" height="4" fill="#a1a1aa" />
                    <line x1="62" y1="15" x2="65" y2="15" stroke="#71717a" strokeWidth="1" />
                    <polygon points="65,13 72,15 65,17" fill="#a1a1aa" />
                    <line x1="35" y1="11" x2="35" y2="19" stroke="#000" strokeWidth="1.5" />
                    <text x="35" y="8" textAnchor="middle" fill="#000" className="text-[6px] font-mono font-black">5mm line</text>
                  </svg>
                </div>

                {/* Blue */}
                <div className="border border-zinc-150 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01] p-5 rounded-2xl flex flex-col justify-between space-y-4 relative">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 rounded text-[8px] font-mono font-black bg-blue-500/20 text-blue-600 dark:text-blue-400 uppercase tracking-widest border border-blue-500/30">25 mm</span>
                      <span className="text-[10px] font-mono font-black text-zinc-400">Order: 9001P-VC-005</span>
                    </div>
                    <span className="block text-sm font-black uppercase text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-blue-500 block"></span>
                      <span>EZ-IO® 25 mm Needle Set</span>
                    </span>
                    <span className="block text-xs font-mono font-black text-blue-600 dark:text-blue-400 uppercase">Weight Range: ≥ 3 kg</span>
                    <p className="text-xs text-zinc-500 dark:text-white/40 leading-relaxed font-medium">The standard adult needle set for tibial plateau, distal tibia, or other sites in normal-sized adult or pediatric patients.</p>
                  </div>

                  {/* Needle Drawing */}
                  <svg viewBox="0 0 100 30" className="w-full h-8 mt-2">
                    <rect x="10" y="11" width="12" height="8" rx="2" fill="#3b82f6" />
                    <rect x="22" y="13" width="55" height="4" fill="#a1a1aa" />
                    <line x1="77" y1="15" x2="80" y2="15" stroke="#71717a" strokeWidth="1" />
                    <polygon points="80,13 87,15 80,17" fill="#a1a1aa" />
                    <line x1="45" y1="11" x2="45" y2="19" stroke="#000" strokeWidth="1.5" />
                    <text x="45" y="8" textAnchor="middle" fill="#000" className="text-[6px] font-mono font-black">5mm line</text>
                  </svg>
                </div>

                {/* Yellow */}
                <div className="border border-zinc-150 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01] p-5 rounded-2xl flex flex-col justify-between space-y-4 relative">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 rounded text-[8px] font-mono font-black bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 uppercase tracking-widest border border-yellow-500/30">45 mm</span>
                      <span className="text-[10px] font-mono font-black text-zinc-400">Order: 9079P-VC-005</span>
                    </div>
                    <span className="block text-sm font-black uppercase text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-yellow-500 block"></span>
                      <span>EZ-IO® 45 mm Needle Set</span>
                    </span>
                    <span className="block text-xs font-mono font-black text-yellow-600 dark:text-yellow-400 uppercase">Weight Range: ≥ 40 kg</span>
                    <p className="text-xs text-zinc-500 dark:text-white/40 leading-relaxed font-medium">Crucial for humeral head site access, or large/edematous adult patients with thick overlying tissue pads.</p>
                  </div>

                  {/* Needle Drawing */}
                  <svg viewBox="0 0 100 30" className="w-full h-8 mt-2">
                    <rect x="10" y="11" width="12" height="8" rx="2" fill="#eab308" />
                    <rect x="22" y="13" width="68" height="4" fill="#a1a1aa" />
                    <line x1="90" y1="15" x2="93" y2="15" stroke="#71717a" strokeWidth="1" />
                    <polygon points="93,13 100,15 93,17" fill="#a1a1aa" />
                    <line x1="55" y1="11" x2="55" y2="19" stroke="#000" strokeWidth="1.5" />
                    <text x="55" y="8" textAnchor="middle" fill="#000" className="text-[6px] font-mono font-black">5mm line</text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Crucial 5mm Mark Visibility Requirement (Page 3) */}
            <div className="bg-amber-500/10 border-2 border-amber-500/20 rounded-2xl p-6 flex flex-col md:flex-row gap-5 items-center">
              <div className="w-full md:w-1/3 aspect-video md:h-28 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden relative flex items-center justify-center p-2">
                <svg viewBox="0 0 120 70" className="w-full h-full">
                  {/* Bone level */}
                  <rect x="0" y="50" width="120" height="20" fill="#2d2d30" />
                  <line x1="0" y1="50" x2="120" y2="50" stroke="#71717a" strokeWidth="1" />
                  <text x="60" y="62" textAnchor="middle" fill="#71717a" className="text-[6px] font-mono font-black">CORTICAL BONE</text>
                  
                  {/* Skin level */}
                  <line x1="0" y1="30" x2="120" y2="30" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="3,1" opacity="0.6" />
                  <text x="5" y="26" fill="#ec4899" className="text-[5px] font-mono font-black">SKIN LINE</text>

                  {/* Needle inserted to bone */}
                  <rect x="58" y="5" width="4" height="20" fill="#3b82f6" />
                  <line x1="60" y1="25" x2="60" y2="50" stroke="#a1a1aa" strokeWidth="2" />
                  {/* Bevel tip touching bone */}
                  <polygon points="59,50 61,50 60,53" fill="#a1a1aa" />

                  {/* 5mm mark - closest black line to hub */}
                  <line x1="58" y1="18" x2="62" y2="18" stroke="#000" strokeWidth="2" />
                  
                  {/* Arrow indicating 5mm mark is visible */}
                  <line x1="62" y1="18" x2="80" y2="18" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,1" />
                  <polygon points="62,18 66,16 66,20" fill="#f59e0b" />
                  <text x="83" y="20" fill="#f59e0b" className="text-[5.5px] font-black font-mono">5 mm MARK VISIBLE</text>
                </svg>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider">Crucial Length Confirmation Rule (5 mm Mark)</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-white/70 leading-relaxed font-medium">
                  Prior to triggering the power driver, push the needle set tip through the skin until the tip rests firmly against the bone.
                </p>
                <div className="p-2 bg-white/50 dark:bg-black/20 rounded-lg text-amber-800 dark:text-amber-300 font-mono text-[10.5px] font-bold border border-amber-500/10 leading-normal">
                  "The 5 mm black mark (the line closest to the needle hub) MUST remain visible above the skin surface prior to activating the power driver to ensure adequate needle length for insertion."
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: INSERTION & REMOVAL PROCEDURES (10 Steps) */}
        {ioActiveSubSection === 'procedures' && (
          <div className="space-y-6">
            
            {/* 10 Step Insertion Procedure */}
            <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="border-b border-zinc-150 dark:border-white/5 pb-3">
                <span className="text-[9px] font-mono font-black uppercase text-zinc-400 tracking-wider">Clinical Method</span>
                <h3 className="text-base font-black uppercase tracking-tight text-zinc-950 dark:text-white">10-Step Insertion Technique</h3>
                <p className="text-xs text-zinc-500 dark:text-white/40 mt-1">Official Arrow® EZ-IO® step-by-step clinical vascular access procedure.</p>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-3.5 pt-2">
                {[
                  { step: "1", title: "Clean Site", desc: "Clean the target insertion site per institutional protocol/policy. Thoroughly stabilize the target extremity." },
                  { step: "2", title: "Prep Supplies", desc: "Unlock clamp on EZ-Connect® Extension Set, prime with saline and purge air. Attach needle to power driver and remove safety cap." },
                  { step: "3", title: "Pierce & Check", desc: "Push needle through skin until tip rests against bone. Confirm the 5 mm black mark closest to hub is visible. Squeeze trigger with steady, gentle pressure." },
                  { step: "4", title: "Stylet Out", desc: "On sudden 'give' or loss of resistance, immediately release trigger. Stabilize hub, disconnect power driver, and rotate stylet counterclockwise to remove." },
                  { step: "5", title: "Apply Stabilizer", desc: "Place the EZ-Stabilizer® Dressing over the cannula hub. Place stylet into locking sharps containment block (NeedleVISE®)." },
                  { step: "6", title: "EZ-Connect", desc: "Attach the primed EZ-Connect® Extension Set to the cannula hub. Firmly secure by twisting clockwise. Ensure the clamp is completely open." },
                  { step: "7", title: "Adhere Dressing", desc: "Pull the adhesive tabs off the EZ-Stabilizer® dressing and adhere firmly to skin to minimize movement." },
                  { step: "8", title: "Confirm & Flush", desc: "Confirm placement. Flush cannula with normal saline (5-10 mL for adults; 2-5 mL for children). Essential rapid flush displaces marrow to facilitate flow." },
                  { step: "9", title: "Deliver Fluids", desc: "Deliver medications and fluids as ordered. If adequate flow rates cannot be achieved with infusion pump, use a pressure bag." },
                  { step: "10", title: "Document", desc: "Document date, time, site, and needle size. Apply EZ-IO wristband to patient's extremity." }
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

            {/* Removal Technique */}
            <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="border-b border-zinc-150 dark:border-white/5 pb-3">
                <span className="text-[9px] font-mono font-black uppercase text-red-600 dark:text-emerald-400 tracking-wider">Dwell Limit & Removal</span>
                <h3 className="text-base font-black uppercase tracking-tight text-zinc-950 dark:text-white">Cannula Removal Guidelines</h3>
                <p className="text-xs text-zinc-500 dark:text-white/40 mt-1">EZ-IO® dwell limit is up to 24 hours. For patients ≥12 years old, it may be extended up to 48 hours when alternatives are unavailable.</p>
              </div>

              <div className="grid md:grid-cols-5 gap-3.5 pt-2">
                {[
                  { step: "1", title: "Disconnect Set", desc: "Remove the EZ-Connect® Extension Set from the hub." },
                  { step: "2", title: "Peel Dressing", desc: "Carefully lift and peel away the EZ-Stabilizer® Dressing." },
                  { step: "3", title: "Attach Syringe", desc: "Attach a standard luer-lock syringe directly to the hub of the cannula." },
                  { step: "4", title: "Rotate & Pull", desc: "Maintain strict axial alignment. Rotate syringe clockwise while pulling straight out. Do NOT rock or bend the cannula." },
                  { step: "5", title: "Dispose & Dress", desc: "Immediately place the cannula with syringe attached into an appropriate sharps container. Dress site per local protocol." }
                ].map((item) => (
                  <div key={item.step} className="p-4 bg-zinc-50 dark:bg-white/[0.01] border border-zinc-150 dark:border-white/5 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                    <span className="absolute -top-3 -right-3 text-5xl font-black text-zinc-250/30 dark:text-white/[0.02] font-mono select-none">
                      {item.step}
                    </span>
                    <div className="space-y-1 z-10">
                      <span className="text-[8px] font-mono font-black text-zinc-400 uppercase tracking-widest block">Step 0{item.step}</span>
                      <h4 className="font-black text-xs uppercase tracking-tight text-zinc-900 dark:text-white leading-tight">{item.title}</h4>
                      <p className="text-[10px] text-zinc-500 dark:text-white/60 leading-normal font-medium pt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Axial Alignment Warning (Page 5) */}
              <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-800 dark:text-red-400 text-[11px] leading-relaxed font-semibold">
                <span className="font-black uppercase tracking-wider block text-[9.5px] mb-0.5">CRITICAL REMOVAL HAZARD:</span>
                DO NOT rock, wiggle, or bend the cannula during removal. Maintain straight axial alignment and twist clockwise while pulling straight out. Rocking or wiggling can cause the needle/cannula to snap or shear inside the bone.
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: LIDOCAINE PAIN MANAGEMENT PROTOCOL & WEIGHT CALCULATOR */}
        {ioActiveSubSection === 'pain' && (
          <div className="grid lg:grid-cols-12 gap-6">
            
            {/* Left Column: Interactive Dosing Calculator (Spans 6) */}
            <div className="lg:col-span-6 bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-zinc-150 dark:border-white/5 pb-3">
                <span className="text-[9px] font-mono font-black uppercase text-red-600 dark:text-emerald-400 tracking-wider">Page 8 IFU Guide</span>
                <h3 className="text-base font-black uppercase tracking-tight text-zinc-950 dark:text-white">Lidocaine Anesthetic Calculator</h3>
                <p className="text-xs text-zinc-500 dark:text-white/40 mt-1">Suggested protocol for patients responsive to pain before performing saline flushes or infusing fluids.</p>
              </div>

              {/* Weight selection slider if pediatric */}
              {ioPatientType === 'pediatric' && (
                <div className="space-y-2 p-4 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-150 dark:border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-zinc-700 dark:text-zinc-300">Pediatric Weight (kg):</span>
                    <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded">{ioLidocaineWeight} kg</span>
                  </div>
                  <input 
                    type="range" 
                    min="3" 
                    max="39" 
                    value={ioLidocaineWeight} 
                    onChange={(e) => setIoLidocaineWeight(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <span className="text-[9px] font-mono text-zinc-400 block text-right">Slide to adjust weight for mg and volume calculations.</span>
                </div>
              )}

              {/* Dosage readout cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-zinc-50 dark:bg-white/5 border border-zinc-150 dark:border-white/5 rounded-xl">
                  <span className="text-[9px] font-mono font-black text-zinc-400 uppercase tracking-wider block">Initial Lidocaine Dose</span>
                  <div className="flex items-baseline gap-1 mt-1.5">
                    <span className="text-xl font-black text-zinc-900 dark:text-white">{initialLidoDoseMg}</span>
                    <span className="text-xs font-bold text-zinc-500 font-mono">mg</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-red-500 dark:text-emerald-400 block mt-1">Volume: {initialLidoVolMl} mL (2% Lidocaine)</span>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-white/5 border border-zinc-150 dark:border-white/5 rounded-xl">
                  <span className="text-[9px] font-mono font-black text-zinc-400 uppercase tracking-wider block">Normal Saline Flush</span>
                  <div className="flex items-baseline gap-1 mt-1.5">
                    <span className="text-xl font-black text-zinc-900 dark:text-white">
                      {ioPatientType === 'adult' ? '5 - 10' : '2 - 5'}
                    </span>
                    <span className="text-xs font-bold text-zinc-500 font-mono">mL</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-zinc-400 block mt-1">Adult vs Child flush range</span>
                </div>
              </div>

              {/* Second Dose calculations */}
              <div className="p-4 bg-zinc-50 dark:bg-white/5 border border-zinc-150 dark:border-white/5 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono font-black text-zinc-400 uppercase tracking-wider">Subsequent Dose (If needed)</span>
                  <span className="text-[8px] font-black uppercase text-red-600 dark:text-emerald-400 tracking-wider">Half of Initial Dose</span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-lg font-black text-zinc-900 dark:text-white">{repeatLidoDoseMg} mg</span>
                  <span className="text-xs font-mono text-zinc-500">({repeatLidoVolMl} mL)</span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">Slowly infuse over 60 seconds if pain persists during saline flushes.</p>
              </div>

              {/* Total duration check */}
              <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-800 dark:text-blue-300">
                <Calendar className="w-5 h-5 shrink-0" />
                <div className="text-[10.5px]">
                  <span className="font-black uppercase block tracking-wider text-[9px] mb-0.5">PROTOCOL DURATION: ≥ 4 MINUTES</span>
                  Lidocaine must be administered in sequence to allow receptors to desensitize. Do not rush.
                </div>
              </div>
            </div>

            {/* Right Column: Step-by-Step Pain Protocol Timeline (Spans 6) */}
            <div className="lg:col-span-6 bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
              <div className="border-b border-zinc-150 dark:border-white/5 pb-3">
                <span className="text-[9px] font-mono font-black uppercase text-zinc-400">Anesthetic Administration Timeline</span>
                <h3 className="text-base font-black uppercase tracking-tight text-zinc-950 dark:text-white">Suggested Anesthetic Procedure</h3>
              </div>

              <div className="relative border-l-2 border-zinc-200 dark:border-white/10 pl-5 ml-2.5 space-y-4 text-xs font-medium">
                
                {/* Step 1 */}
                <div className="relative">
                  <span className="absolute -left-8 top-0 w-6 h-6 rounded-full bg-zinc-900 dark:bg-white/10 text-white flex items-center justify-center font-mono text-[10px] font-black border border-zinc-800">1</span>
                  <div className="space-y-1">
                    <span className="font-bold text-zinc-900 dark:text-white uppercase text-[10px]">Attach Syringe Directly</span>
                    <p className="text-zinc-500 dark:text-white/60 leading-relaxed">
                      With stabilizer in place, carefully attach syringe containing Lidocaine <strong>directly to IO catheter luer-lock hub</strong> (without extension set in place).
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <span className="absolute -left-8 top-0 w-6 h-6 rounded-full bg-zinc-900 dark:bg-white/10 text-white flex items-center justify-center font-mono text-[10px] font-black border border-zinc-800">2</span>
                  <div className="space-y-1">
                    <span className="font-bold text-zinc-900 dark:text-white uppercase text-[10px]">Slowly Infuse Initial Dose</span>
                    <p className="text-zinc-500 dark:text-white/60 leading-relaxed">
                      Infuse Lidocaine slowly over <strong>120 seconds</strong>. Allow Lidocaine to dwell in medullary cavity for <strong>60 seconds</strong> to establish blockade.
                    </p>
                    <span className="block text-[10px] text-red-600 dark:text-emerald-400 font-mono uppercase font-bold pt-0.5">Adult: 40mg (2mL) | Ped: 0.5mg/kg</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <span className="absolute -left-8 top-0 w-6 h-6 rounded-full bg-zinc-900 dark:bg-white/10 text-white flex items-center justify-center font-mono text-[10px] font-black border border-zinc-800">3</span>
                  <div className="space-y-1">
                    <span className="font-bold text-zinc-900 dark:text-white uppercase text-[10px]">Normal Saline Flush</span>
                    <p className="text-zinc-500 dark:text-white/60 leading-relaxed">
                      Flush IO catheter with normal saline (<strong>Adult: 5-10 mL</strong>; <strong>Infant/Child: 2-5 mL</strong>). Perform this flush rapidly to clear marrow channel and open flow.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <span className="absolute -left-8 top-0 w-6 h-6 rounded-full bg-zinc-900 dark:bg-white/10 text-white flex items-center justify-center font-mono text-[10px] font-black border border-zinc-800">4</span>
                  <div className="space-y-1">
                    <span className="font-bold text-zinc-900 dark:text-white uppercase text-[10px]">Assess Pain & Infuse Half-Dose</span>
                    <p className="text-zinc-500 dark:text-white/60 leading-relaxed">
                      Assess patient pain. If needed, slowly infuse half of the initial Lidocaine dose over <strong>60 seconds</strong>.
                    </p>
                    <span className="block text-[10px] text-red-600 dark:text-emerald-400 font-mono uppercase font-bold pt-0.5">Adult: 20mg (1mL) | Ped: 0.25mg/kg</span>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="relative">
                  <span className="absolute -left-8 top-0 w-6 h-6 rounded-full bg-zinc-900 dark:bg-white/10 text-white flex items-center justify-center font-mono text-[10px] font-black border border-zinc-800">5</span>
                  <div className="space-y-1">
                    <span className="font-bold text-zinc-900 dark:text-white uppercase text-[10px]">Attach Primed Extension Set</span>
                    <p className="text-zinc-500 dark:text-white/60 leading-relaxed">
                      Attach primed extension set and begin ordered fluid/medication infusions. Consider systemic pain control if patient continues to feel pain.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: CLINICAL VERIFICATION & SAFETY GUIDELINES */}
        {ioActiveSubSection === 'safety' && (
          <div className="space-y-6">
            
            {/* When to use & Contraindications List */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Indications Page 6 */}
              <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-white border-b border-zinc-150 dark:border-white/5 pb-2.5">
                  <Activity className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider">Approved Clinical Indications</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-white/40 leading-normal">Use whenever vascular access is difficult to obtain in emergent, urgent, or medically necessary cases, such as:</p>
                
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <span className="block text-[10px] font-mono font-black uppercase text-red-600 dark:text-red-400">SHOCK & TRAUMA</span>
                    <ul className="text-[10.5px] leading-relaxed font-medium text-zinc-600 dark:text-white/70 list-disc list-inside space-y-0.5">
                      <li>Anaphylaxis</li>
                      <li>Severe Burns</li>
                      <li>Dehydration</li>
                      <li>Sepsis / SIRS</li>
                      <li>Severe Trauma</li>
                    </ul>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[10px] font-mono font-black uppercase text-blue-500">CARDIAC</span>
                    <ul className="text-[10.5px] leading-relaxed font-medium text-zinc-600 dark:text-white/70 list-disc list-inside space-y-0.5">
                      <li>Cardiac Arrest</li>
                      <li>Chest Pain / MI</li>
                      <li>Severe CHF</li>
                      <li>Dysrhythmias</li>
                      <li>STEMI / NSTEMI</li>
                    </ul>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[10px] font-mono font-black uppercase text-emerald-500">RESPIRATORY</span>
                    <ul className="text-[10.5px] leading-relaxed font-medium text-zinc-600 dark:text-white/70 list-disc list-inside space-y-0.5">
                      <li>Severe COPD</li>
                      <li>Intubation (RSI)</li>
                      <li>Pneumonia / Failure</li>
                      <li>Status Asthmaticus</li>
                    </ul>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[10px] font-mono font-black uppercase text-purple-500">NEUROLOGICAL</span>
                    <ul className="text-[10.5px] leading-relaxed font-medium text-zinc-600 dark:text-white/70 list-disc list-inside space-y-0.5">
                      <li>Encephalopathy</li>
                      <li>Head Injury / TBI</li>
                      <li>Status Epilepticus</li>
                      <li>Acute Stroke</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Contraindications Page 7 */}
              <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-red-600 border-b border-zinc-150 dark:border-white/5 pb-2.5">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider">Absolute Contraindications</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-white/40 leading-normal">The Arrow® EZ-IO® System must never be inserted if any of these conditions are present:</p>

                <ul className="text-[10.5px] leading-relaxed font-semibold text-zinc-600 dark:text-white/70 list-disc list-inside space-y-2 pt-1">
                  <li><strong className="text-red-500">Fracture</strong> of the target bone (leakage/extravasation hazard).</li>
                  <li><strong className="text-red-500">Infection</strong> at the immediate area of insertion.</li>
                  <li><strong className="text-red-500">Excessive tissue</strong> (severe obesity) or inability to locate anatomical landmarks.</li>
                  <li><strong className="text-red-500">IO access</strong> or attempted IO access in the target bone within past <strong>48 hours</strong>.</li>
                  <li><strong className="text-red-500">Previous significant orthopedic procedure</strong> at the site, prosthetic limb or joint.</li>
                  <li><strong className="text-red-500">Sternal Insertion</strong> (strictly forbidden with EZ-IO).</li>
                </ul>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
