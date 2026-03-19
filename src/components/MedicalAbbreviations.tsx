import React, { useState } from 'react';
import { Search, ArrowLeft, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

interface MedicalAbbreviationsProps {
  onBack: () => void;
}

const ABBREVIATIONS = [
  { abbr: "ACS", meaning: "acute coronary syndrome" },
  { abbr: "AED", meaning: "automatic external defibrillator" },
  { abbr: "A-FIB", meaning: "atrial fibrillation" },
  { abbr: "ALS", meaning: "advanced life support" },
  { abbr: "AMS", meaning: "altered mental status" },
  { abbr: "ASA", meaning: "aspirin" },
  { abbr: "AV", meaning: "atrioventricular" },
  { abbr: "AVPU", meaning: "alert, verbal, pain, unresponsive (neurological status measure)" },
  { abbr: "BiPAP", meaning: "bi-level positive airway pressure" },
  { abbr: "BLS", meaning: "basic life support" },
  { abbr: "BP", meaning: "blood pressure" },
  { abbr: "BPM", meaning: "beats per minute" },
  { abbr: "BSA", meaning: "body surface area" },
  { abbr: "BSI", meaning: "body substance isolation" },
  { abbr: "BVM", meaning: "bag-valve-mask" },
  { abbr: "CABG", meaning: "coronary artery bypass graft" },
  { abbr: "CAD", meaning: "coronary artery disease" },
  { abbr: "CARES", meaning: "Cardiac Arrest Registry to Enhance Survival" },
  { abbr: "CC", meaning: "chief complaint" },
  { abbr: "CDC", meaning: "Centers for Disease Control and Prevention" },
  { abbr: "CHF", meaning: "congestive heart failure" },
  { abbr: "CNS", meaning: "central nervous system" },
  { abbr: "CO", meaning: "carbon monoxide" },
  { abbr: "CO2", meaning: "carbon dioxide" },
  { abbr: "COPD", meaning: "chronic obstructive pulmonary disease" },
  { abbr: "CP", meaning: "chest pain" },
  { abbr: "CPAP", meaning: "continuous positive airway pressure" },
  { abbr: "CPI", meaning: "continuous performance improvement" },
  { abbr: "CPR", meaning: "cardiopulmonary resuscitation" },
  { abbr: "C-SECTION", meaning: "caesarean section" },
  { abbr: "C-SPINE", meaning: "cervical spine" },
  { abbr: "CT", meaning: "cat scan, Cardiac Technician" },
  { abbr: "CVA", meaning: "cerebrovascular accident (stroke)" },
  { abbr: "D5W", meaning: "5% dextrose in water" },
  { abbr: "DKA", meaning: "diabetic ketoacidosis" },
  { abbr: "DNI", meaning: "do not intubate" },
  { abbr: "DNR", meaning: "do not resuscitate" },
  { abbr: "DT", meaning: "delirium tremens" },
  { abbr: "Dx", meaning: "diagnosis" },
  { abbr: "ECPR", meaning: "extracorporeal cardiopulmonary resuscitation" },
  { abbr: "EEG", meaning: "electroencephalogram" },
  { abbr: "EENT", meaning: "eye, ear, nose, and throat" },
  { abbr: "EGD", meaning: "extraglottic device" },
  { abbr: "EKG", meaning: "electrocardiogram" },
  { abbr: "EMS", meaning: "emergency medical services" },
  { abbr: "EMT", meaning: "emergency medical technician" },
  { abbr: "ePCR", meaning: "electronic patient call/care record/report" },
  { abbr: "ET", meaning: "endotracheal" },
  { abbr: "ETA", meaning: "estimated time of arrival" },
  { abbr: "EtCO2", meaning: "end-tidal carbon dioxide; end-tidal capnography" },
  { abbr: "ETOH", meaning: "ethanol (alcohol)" },
  { abbr: "ETT", meaning: "endotracheal tube" },
  { abbr: "FBAO", meaning: "foreign body airway obstruction" },
  { abbr: "FiO2", meaning: "fraction of inspired oxygen" },
  { abbr: "g", meaning: "gram(s)" },
  { abbr: "GI", meaning: "gastrointestinal" },
  { abbr: "gtt", meaning: "drops" },
  { abbr: "GU", meaning: "genitourinary" },
  { abbr: "GYN", meaning: "gynecology (gynecological)" },
  { abbr: "HFNC", meaning: "high flow nasal cannula" },
  { abbr: "HR", meaning: "heart rate (hour)" },
  { abbr: "ICU", meaning: "intensive care unit" },
  { abbr: "IM", meaning: "intramuscular" },
  { abbr: "IO", meaning: "intraosseous" },
  { abbr: "IPPB", meaning: "intermittent positive pressure breathing" },
  { abbr: "IV", meaning: "intravenous" },
  { abbr: "IVP", meaning: "intravenous push" },
  { abbr: "J", meaning: "joules" },
  { abbr: "JVD", meaning: "jugular vein distension" },
  { abbr: "kg", meaning: "kilogram" },
  { abbr: "KVO", meaning: "keep vein open" },
  { abbr: "L", meaning: "liter" },
  { abbr: "LMA", meaning: "laryngeal mask airway" },
  { abbr: "LPM", meaning: "liters per minute" },
  { abbr: "LR", meaning: "lactated Ringer’s" },
  { abbr: "MAT", meaning: "multifocal atrial tachycardia" },
  { abbr: "mcg", meaning: "microgram(s)" },
  { abbr: "MED", meaning: "medicine" },
  { abbr: "mg", meaning: "milligram(s)" },
  { abbr: "mg/dL", meaning: "milligrams per deciliter" },
  { abbr: "MI", meaning: "myocardial infarction (heart attack)" },
  { abbr: "mL", meaning: "milliliter" },
  { abbr: "mmHg", meaning: "millimeters of mercury" },
  { abbr: "mmol", meaning: "millimole" },
  { abbr: "MOLST", meaning: "medical orders for life-sustaining treatment" },
  { abbr: "MS", meaning: "mental status" },
  { abbr: "msec", meaning: "millisecond" },
  { abbr: "MVC", meaning: "motor vehicle crash" },
  { abbr: "N/V", meaning: "nausea/vomiting" },
  { abbr: "NC", meaning: "nasal cannula" },
  { abbr: "NRB", meaning: "non-rebreather" },
  { abbr: "NS", meaning: "normal saline" },
  { abbr: "NSR", meaning: "normal sinus rhythm" },
  { abbr: "OB/GYN", meaning: "obstetrics/gynecology" },
  { abbr: "O2", meaning: "oxygen" },
  { abbr: "P", meaning: "pulse" },
  { abbr: "PAC", meaning: "premature atrial contraction" },
  { abbr: "PCR", meaning: "Patient call/care record/report" },
  { abbr: "PE", meaning: "pulmonary embolus" },
  { abbr: "PEA", meaning: "pulseless electrical activity" },
  { abbr: "PO", meaning: "orally" },
  { abbr: "POLST", meaning: "physician orders for life-sustaining treatment" },
  { abbr: "PPE", meaning: "personal protection equipment" },
  { abbr: "prn", meaning: "as needed" },
  { abbr: "PVC", meaning: "premature ventricular contraction" },
  { abbr: "q", meaning: "every (e.g., q 3-5 minutes)" },
  { abbr: "RR", meaning: "respiratory rate" },
  { abbr: "RSI", meaning: "rapid sequence intubation" },
  { abbr: "Rx", meaning: "medicine" },
  { abbr: "sat", meaning: "saturation" },
  { abbr: "SBP", meaning: "systolic blood pressure" },
  { abbr: "SC", meaning: "subcutaneous" },
  { abbr: "SCBA", meaning: "self-contained breathing apparatus" },
  { abbr: "SCUBA", meaning: "self-contained underwater breathing apparatus" },
  { abbr: "SGD", meaning: "supraglottic device" },
  { abbr: "SL", meaning: "sublingual" },
  { abbr: "SOB", meaning: "shortness of breath" },
  { abbr: "ST", meaning: "sinus tachycardia" },
  { abbr: "SVT", meaning: "supraventricular tachycardia" },
  { abbr: "T", meaning: "temperature" },
  { abbr: "TBSA", meaning: "total body surface area" },
  { abbr: "TCA", meaning: "tricyclic antidepressants" },
  { abbr: "TIA", meaning: "transient ischemic attack" },
  { abbr: "TID", meaning: "three times a day" },
  { abbr: "TKO", meaning: "to keep open" },
  { abbr: "VF", meaning: "ventricular fibrillation" },
  { abbr: "VS", meaning: "vital signs" },
  { abbr: "VT", meaning: "ventricular tachycardia" },
  { abbr: "y/o", meaning: "years old (years old)" }
];

export default function MedicalAbbreviations({ onBack }: MedicalAbbreviationsProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAbbreviations = ABBREVIATIONS.filter(item => 
    item.abbr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto p-4"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back to Tools</span>
      </button>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Medical Abbreviations</h2>
        </div>
        <p className="text-sm text-white/60">Search for approved medical abbreviations and their meanings.</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          placeholder="Search abbreviations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
      </div>

      <div className="space-y-3">
        {filteredAbbreviations.length > 0 ? (
          filteredAbbreviations.map((item, index) => (
            <div 
              key={index}
              className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-1"
            >
              <span className="font-bold text-indigo-400">{item.abbr}</span>
              <span className="text-sm text-white/80">{item.meaning}</span>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-white/40">
            No abbreviations found matching "{searchQuery}"
          </div>
        )}
      </div>
    </motion.div>
  );
}
