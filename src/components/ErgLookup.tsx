import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, AlertTriangle, Shield, Flame, BookOpen, ShieldAlert, Droplet, EyeOff, Wind } from 'lucide-react';

interface ErgLookupProps {
  onBack: () => void;
}

interface HazardousMaterial {
  unNumber: string;
  name: string;
  guideNumber: string;
  hazardClass: string;
  isolationDistance: string;
  protectiveDistanceDay: string;
  protectiveDistanceNight: string;
  fireResponse: string;
  healthHazards: string;
  classColor: string;
}

interface PlacardInfo {
  classNumber: string;
  name: string;
  description: string;
  primaryGuide: string;
  hazards: string;
  color: string;
}

const COMMON_MATERIALS: HazardousMaterial[] = [
  {
    unNumber: "1203",
    name: "Gasoline / Petrol",
    guideNumber: "128",
    hazardClass: "Class 3 - Flammable Liquids",
    isolationDistance: "50 meters (150 feet) in all directions",
    protectiveDistanceDay: "0.3 km (0.2 miles) for large spill",
    protectiveDistanceNight: "1.0 km (0.6 miles) for large spill",
    fireResponse: "Use dry chemical, CO2, water spray or regular foam. Avoid straight streams as they can spread flame.",
    healthHazards: "Inhalation of vapors may cause dizziness or suffocation. Contact may cause burns to skin and eyes.",
    classColor: "bg-red-500/10 text-red-500 border-red-500/20"
  },
  {
    unNumber: "1075",
    name: "Propane / Liquefied Petroleum Gas (LPG)",
    guideNumber: "115",
    hazardClass: "Class 2.1 - Flammable Gases",
    isolationDistance: "100 meters (330 feet) in all directions",
    protectiveDistanceDay: "0.4 km (0.25 miles) for large release",
    protectiveDistanceNight: "1.6 km (1.0 miles) for large release",
    fireResponse: "Do NOT extinguish a leaking gas fire unless leak can be stopped safely. Use massive quantities of water as spray/deluge to cool tanks.",
    healthHazards: "Extremely flammable. Vapors are heavier than air and can travel to source of ignition and flash back. Contact with liquid may cause frostbite.",
    classColor: "bg-red-500/10 text-red-500 border-red-500/20"
  },
  {
    unNumber: "1993",
    name: "Diesel Fuel / Fuel Oil",
    guideNumber: "128",
    hazardClass: "Class 3 - Combustible Liquids",
    isolationDistance: "50 meters (150 feet) in all directions",
    protectiveDistanceDay: "No formal action distance for small releases",
    protectiveDistanceNight: "0.5 km (0.3 miles) for massive spill",
    fireResponse: "Regular foam, dry chemical, or CO2. Cool containers with flooding quantities of water well after fire is out.",
    healthHazards: "Vapors may cause headache and nausea. Moderate fire danger when exposed to heat or flame.",
    classColor: "bg-red-500/10 text-red-500 border-red-500/20"
  },
  {
    unNumber: "1005",
    name: "Ammonia, Anhydrous",
    guideNumber: "125",
    hazardClass: "Class 2.3 - Toxic/Inhalation Hazard",
    isolationDistance: "150 meters (500 feet) in all directions",
    protectiveDistanceDay: "1.0 km (0.6 miles) for large release",
    protectiveDistanceNight: "3.2 km (2.0 miles) for large release",
    fireResponse: "Use water spray, fog or regular foam. Do not apply water directly to spilled liquid to avoid rapid boiling.",
    healthHazards: "TOXIC; may be fatal if inhaled. Corrosive; contact causes severe burns to eyes and skin. High chemical vapor concentration can cause lung damage.",
    classColor: "bg-orange-500/10 text-orange-500 border-orange-500/20"
  },
  {
    unNumber: "1017",
    name: "Chlorine Gas",
    guideNumber: "124",
    hazardClass: "Class 2.3 - Toxic Gas (Oxidizer)",
    isolationDistance: "200 meters (660 feet) in all directions",
    protectiveDistanceDay: "1.5 km (0.9 miles) for large release",
    protectiveDistanceNight: "4.8 km (3.0 miles) for large release",
    fireResponse: "Cool containers with water spray. Do not put water inside damaged cylinders. Wear self-contained breathing apparatus (SCBA) and fully encapsulating suit.",
    healthHazards: "TOXIC and extremely corrosive gas. Highly irritating to eyes, skin, and respiratory tract. Can support combustion.",
    classColor: "bg-orange-500/10 text-orange-500 border-orange-500/20"
  },
  {
    unNumber: "1072",
    name: "Oxygen, Compressed",
    guideNumber: "122",
    hazardClass: "Class 2.2 - Non-Flammable, Oxidizing Gas",
    isolationDistance: "25 meters (80 feet) in all directions",
    protectiveDistanceDay: "No action distance unless exposed to fire",
    protectiveDistanceNight: "No action distance unless exposed to fire",
    fireResponse: "Use extinguishing agent suitable for surrounding fire. Cool cylinders with flooding water from safe unmanned distance.",
    healthHazards: "Accelerates combustion rapidly. High pressure cylinders may rupture or rocket violently in fires.",
    classColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
  },
  {
    unNumber: "1170",
    name: "Ethanol / Ethyl Alcohol",
    guideNumber: "127",
    hazardClass: "Class 3 - Flammable Liquids (Polar)",
    isolationDistance: "50 meters (150 feet) in all directions",
    protectiveDistanceDay: "0.3 km (0.2 miles) for large spill",
    protectiveDistanceNight: "0.8 km (0.5 miles) for large spill",
    fireResponse: "CAUTION: Ethanol fires require alcohol-resistant (AR-AFFF) foam. Standard foams are broken down by polar solvents.",
    healthHazards: "Flammable. Light irritant. Inhalation of high vapor levels may cause intoxication.",
    classColor: "bg-red-500/10 text-red-500 border-red-500/20"
  },
  {
    unNumber: "1823",
    name: "Sodium Hydroxide, Solid (Caustic Soda)",
    guideNumber: "154",
    hazardClass: "Class 8 - Corrosives",
    isolationDistance: "25 meters (80 feet) in all directions",
    protectiveDistanceDay: "0.1 km (0.05 miles) for small release",
    protectiveDistanceNight: "0.3 km (0.2 miles) for large release",
    fireResponse: "Use dry chemical, CO2, or alcohol-resistant foam. Do not get water inside containers or on chemical directly to avoid exothermic reactions.",
    healthHazards: "Severely corrosive. Causes chemical burns to skin, eyes, and mucous membranes. Toxic by inhalation or ingestion.",
    classColor: "bg-amber-500/10 text-amber-500 border-amber-500/20"
  }
];

const PLACARD_CATALOG: PlacardInfo[] = [
  {
    classNumber: "Class 1",
    name: "Explosives",
    description: "Orange diamond with burst or numeral. Represents severe explosion, fragmentation, or blast hazards.",
    primaryGuide: "Guide 112 / 114",
    hazards: "Severe explosion hazard. Keep public away. Evacuate 1600 meters (1 mile) if fire reaches cargo.",
    color: "from-orange-600 to-orange-500 text-white"
  },
  {
    classNumber: "Class 2",
    name: "Gases (Flammable, Toxic, Non-Flammable)",
    description: "Red, Green, or White diamond. Propane, Ammonia, Chlorine cylinders.",
    primaryGuide: "Guide 115 / 118 / 125",
    hazards: "Vapor dispersion, BLEVE risk (Boiling Liquid Expanding Vapor Explosion) in fire. Protect assets from flying shrapnel.",
    color: "from-red-600 to-red-500 text-white"
  },
  {
    classNumber: "Class 3",
    name: "Flammable Liquids",
    description: "Red diamond with fire symbol and number 3. Gasoline, Diesel, Alcohol.",
    primaryGuide: "Guide 127 / 128",
    hazards: "Highly flammable. Vapors heavier than air. Use water spray to knock down vapor clouds. Beware of runoff contamination.",
    color: "from-rose-700 to-rose-500 text-white"
  },
  {
    classNumber: "Class 4",
    name: "Flammable Solids",
    description: "Red/White stripes, Blue, or Red/White halves. Water-reactive metals (Magnesium, Lithium, Sodium).",
    primaryGuide: "Guide 133 / 135 / 138",
    hazards: "May ignite on contact with air or moisture. Water reactive: DO NOT use water on Class 4.3 (Dangerous When Wet) chemicals.",
    color: "from-red-600 via-white to-red-600 text-zinc-900"
  },
  {
    classNumber: "Class 5",
    name: "Oxidizers / Organic Peroxides",
    description: "Yellow diamond with burning sphere symbol. Ammonium Nitrate, Hydrogen Peroxide.",
    primaryGuide: "Guide 140 / 145",
    hazards: "Intensifies fires intensely. May explode under heat, shock, or friction. Keep organic compounds away.",
    color: "from-yellow-500 to-yellow-400 text-zinc-950"
  },
  {
    classNumber: "Class 6",
    name: "Toxics / Infectious Substances",
    description: "White diamond with skull-and-crossbones symbol. Pesticides, Cyanides, Medical Waste.",
    primaryGuide: "Guide 151 / 153",
    hazards: "Toxic if inhaled, absorbed, or ingested. Wear full SCBA. Use containment barriers to block water runoff.",
    color: "from-slate-100 to-white text-zinc-900 border border-zinc-200"
  },
  {
    classNumber: "Class 8",
    name: "Corrosives",
    description: "Black and White diamond with pouring tubes eroding hand/metal. Sulfuric Acid, Caustic Soda.",
    primaryGuide: "Guide 153 / 154",
    hazards: "Severe chemical burns. Acid fumes block airway. Reacts intensely with water, releasing gas/splatter.",
    color: "from-zinc-900 to-zinc-800 text-white border-b-4 border-white"
  },
  {
    classNumber: "Class 9",
    name: "Miscellaneous",
    description: "Black/White stripes on upper half, white bottom. Dry Ice, Lithium-Ion Batteries, Asbestos.",
    primaryGuide: "Guide 171",
    hazards: "Thermal runaway in batteries. Irritating dust, vapors, or elevated temperatures.",
    color: "from-zinc-100 via-white to-zinc-200 text-zinc-800"
  }
];

export default function ErgLookup({ onBack }: ErgLookupProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<HazardousMaterial | null>(null);
  const [selectedPlacard, setSelectedPlacard] = useState<PlacardInfo | null>(null);

  const filteredMaterials = useMemo(() => {
    if (!searchQuery.trim()) return COMMON_MATERIALS;
    const query = searchQuery.toLowerCase();
    return COMMON_MATERIALS.filter(m => 
      m.unNumber.includes(query) || 
      m.name.toLowerCase().includes(query) ||
      m.hazardClass.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="space-y-6" id="erg-lookup-tool">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-150 dark:border-white/5 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-red-500 hover:text-red-400 font-bold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tools</span>
        </button>
        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1.5 animate-pulse">
          <BookOpen className="w-3.5 h-3.5" /> ERG 2024 Reference
        </span>
      </div>

      {/* Main Content Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Search / List Section (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-[#1C1C1E] border border-zinc-200 dark:border-white/5 rounded-3xl p-6 shadow-xl">
            <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white flex items-center gap-2 mb-2">
              <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
              On-Scene Hazmat & UN Lookup
            </h2>
            <p className="text-xs text-zinc-500 dark:text-white/40 mb-5">
              Enter the 4-digit UN chemical number (e.g. 1203, 1075) or a material name to retrieve rapid safety, isolation, and fire response protocols.
            </p>

            {/* Search Input */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600" />
              <input
                type="text"
                placeholder="SEARCH UN NUMBER OR CHEMICAL NAME..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black/30 border-2 border-zinc-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-red-600/10 focus:border-red-600 transition-all text-sm text-zinc-900 dark:text-white font-bold placeholder:text-zinc-400 dark:placeholder:text-white/20"
              />
            </div>

            {/* Common Materials List */}
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-white/30 mb-3 px-1">Common Chemicals</h3>
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {filteredMaterials.map((mat) => (
                <button
                  key={mat.unNumber}
                  onClick={() => {
                    setSelectedMaterial(mat);
                    setSelectedPlacard(null);
                  }}
                  className={`w-full border-2 rounded-2xl p-4 flex items-center justify-between group transition-all active:scale-[0.98] text-left ${
                    selectedMaterial?.unNumber === mat.unNumber
                      ? "bg-red-500/5 border-red-500 text-red-600 dark:text-red-400 dark:bg-red-500/10"
                      : "bg-zinc-50 border-zinc-100 dark:bg-white/5 dark:border-white/5 dark:hover:bg-zinc-800/30 hover:border-zinc-300 text-zinc-900 dark:text-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-zinc-900 text-amber-500 font-mono text-sm font-black px-3 py-2 rounded-xl border border-zinc-800 flex items-center justify-center tracking-wider shadow-inner shrink-0">
                      UN {mat.unNumber}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm uppercase tracking-tight leading-tight group-hover:text-red-500 transition-colors">{mat.name}</h4>
                      <span className="inline-block px-1.5 py-0.5 mt-1 bg-black/20 text-[8px] font-black uppercase tracking-wider rounded text-white/60">
                        Class: {mat.hazardClass.split(' - ')[0]} | ERG Guide: {mat.guideNumber}
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center text-zinc-400 group-hover:text-red-500 transition-all">
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </div>
                </button>
              ))}
              {filteredMaterials.length === 0 && (
                <div className="text-center py-8 text-zinc-400">
                  <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-zinc-300" />
                  <p className="text-xs font-mono">No matching UN records found in quick guide.</p>
                </div>
              )}
            </div>
          </div>

          {/* DOT Placards Grid */}
          <div className="bg-white dark:bg-[#1C1C1E] border border-zinc-200 dark:border-white/5 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Standard DOT Hazard Placards
            </h3>
            <p className="text-xs text-zinc-500 dark:text-white/40 mb-4">
              Identify container hazards visually on scene. Tap a placard type below to load rapid evacuation, protection zones, and toxic risk instructions.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PLACARD_CATALOG.map((plac) => (
                <button
                  key={plac.classNumber}
                  onClick={() => {
                    setSelectedPlacard(plac);
                    setSelectedMaterial(null);
                  }}
                  className={`relative p-4 rounded-2xl bg-gradient-to-br ${plac.color} border-2 flex flex-col justify-between items-center text-center aspect-square transition-all active:scale-95 shadow-md group ${
                    selectedPlacard?.classNumber === plac.classNumber
                      ? "ring-4 ring-red-500 border-white"
                      : "border-transparent hover:scale-105"
                  }`}
                >
                  <span className="text-[10px] font-black tracking-widest uppercase opacity-75">{plac.classNumber}</span>
                  <div className="my-auto">
                    {plac.classNumber.includes('1') && <Flame className="w-6 h-6 mx-auto mb-1 animate-pulse" />}
                    {plac.classNumber.includes('2') && <Wind className="w-6 h-6 mx-auto mb-1" />}
                    {plac.classNumber.includes('3') && <Flame className="w-6 h-6 mx-auto mb-1" />}
                    {plac.classNumber.includes('4') && <AlertTriangle className="w-6 h-6 mx-auto mb-1" />}
                    {plac.classNumber.includes('5') && <Flame className="w-6 h-6 mx-auto mb-1" />}
                    {plac.classNumber.includes('6') && <Droplet className="w-6 h-6 mx-auto mb-1" />}
                    {plac.classNumber.includes('8') && <ShieldAlert className="w-6 h-6 mx-auto mb-1" />}
                    {plac.classNumber.includes('9') && <AlertTriangle className="w-6 h-6 mx-auto mb-1" />}
                    <span className="text-[9.5px] font-black uppercase tracking-tight leading-none block px-1">{plac.name}</span>
                  </div>
                  <span className="text-[8px] font-mono font-bold tracking-wider opacity-65">GUIDE {plac.primaryGuide.split(' ')[1]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Details Panel (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-6">
            
            {/* Displaying Material Detail */}
            {selectedMaterial && (
              <div className="bg-zinc-900 border border-red-500/20 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-fade-in">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-full blur-2xl -mr-6 -mt-6" />
                
                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 mb-4">
                  <div>
                    <span className="text-[9px] font-black tracking-widest uppercase text-red-500 block mb-1">UN HAZMAT RECORD</span>
                    <h3 className="text-xl font-black uppercase tracking-tight leading-none text-white">{selectedMaterial.name}</h3>
                  </div>
                  <div className="bg-zinc-950 text-amber-500 font-mono text-lg font-black px-3.5 py-1.5 rounded-xl border border-zinc-800 shadow-inner shrink-0">
                    UN {selectedMaterial.unNumber}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1">HAZARD CLASSIFICATION</h5>
                    <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg border ${selectedMaterial.classColor}`}>
                      {selectedMaterial.hazardClass}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-950/50 rounded-xl p-3 border border-white/5">
                      <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest block mb-0.5">ERG GUIDE</span>
                      <span className="text-lg font-black text-white font-mono">{selectedMaterial.guideNumber}</span>
                    </div>
                    <div className="bg-zinc-950/50 rounded-xl p-3 border border-white/5">
                      <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest block mb-0.5">HEALTH RISK</span>
                      <span className="text-xs font-bold text-white uppercase block mt-1">High Toxic</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1 flex items-center gap-1">
                      <EyeOff className="w-3.5 h-3.5 text-red-500" /> ON-SCENE ISOLATION ZONE
                    </h5>
                    <p className="text-xs text-white bg-red-500/10 border border-red-500/20 p-3 rounded-xl font-medium leading-relaxed">
                      {selectedMaterial.isolationDistance}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-zinc-950/50 rounded-xl p-3 border border-white/5">
                      <span className="text-[8px] font-bold text-yellow-500 uppercase tracking-widest block mb-1">DAY PROTECTION ZONE</span>
                      <p className="text-xs font-bold font-mono text-white">{selectedMaterial.protectiveDistanceDay}</p>
                    </div>
                    <div className="bg-zinc-950/50 rounded-xl p-3 border border-white/5">
                      <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest block mb-1">NIGHT PROTECTION ZONE</span>
                      <p className="text-xs font-bold font-mono text-white">{selectedMaterial.protectiveDistanceNight}</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-red-500" /> TACTICAL FIRE MEASURES
                    </h5>
                    <p className="text-xs text-white/80 bg-zinc-950/40 border border-white/5 p-3 rounded-xl leading-relaxed whitespace-pre-wrap">
                      {selectedMaterial.fireResponse}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" /> MEDICAL HEALTH EFFECTS
                    </h5>
                    <p className="text-xs text-white/80 bg-zinc-950/40 border border-white/5 p-3 rounded-xl leading-relaxed whitespace-pre-wrap">
                      {selectedMaterial.healthHazards}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Displaying Placard Detail */}
            {selectedPlacard && (
              <div className="bg-white dark:bg-[#1C1C1E] border border-zinc-200 dark:border-white/5 rounded-3xl p-6 shadow-2xl animate-fade-in">
                <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-white/5 pb-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold">
                    <AlertTriangle className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold tracking-widest uppercase text-amber-500 block">PLACARD HAZARD DETAILS</span>
                    <h3 className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white leading-none">{selectedPlacard.classNumber}: {selectedPlacard.name}</h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-white/30 mb-1">VISUAL DESCRIPTION</h5>
                    <p className="text-xs text-zinc-800 dark:text-white/80 leading-relaxed bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/5 p-3 rounded-xl italic">
                      "{selectedPlacard.description}"
                    </p>
                  </div>

                  <div className="bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/5 rounded-xl p-4">
                    <h5 className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-white/30 mb-1">DEFAULT ACTION ERG GUIDES</h5>
                    <span className="text-base font-mono font-black text-red-500 block">{selectedPlacard.primaryGuide}</span>
                  </div>

                  <div>
                    <h5 className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-white/30 mb-1">CRITICAL ON-SCENE RISK</h5>
                    <p className="text-xs text-zinc-800 dark:text-white/80 leading-relaxed bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/5 p-3 rounded-xl">
                      {selectedPlacard.hazards}
                    </p>
                  </div>

                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
                    <Shield className="w-5 h-5 shrink-0 text-amber-500" />
                    <div>
                      <span className="font-bold uppercase tracking-wider block mb-0.5">ERG Standard Protocol</span>
                      Verify placard code matches vehicle billing documents, shipping papers, or rail manifest for precise billing chemical profile lookup.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Default State */}
            {!selectedMaterial && !selectedPlacard && (
              <div className="bg-zinc-50 dark:bg-white/5 border border-dashed border-zinc-200 dark:border-white/10 rounded-3xl p-8 text-center text-zinc-400 dark:text-white/20">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-zinc-300 dark:text-white/10" />
                <h4 className="font-bold uppercase tracking-widest text-xs mb-1">Select Hazmat Profile</h4>
                <p className="text-[11px] leading-relaxed max-w-xs mx-auto">
                  Click on any common UN chemical above or tap a DOT class placard to see tactical containment rules.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
