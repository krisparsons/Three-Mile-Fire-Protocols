import React, { useState, useMemo } from 'react';
import { Search, ArrowLeft, Info, Shield, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Permission = 'full' | 'endorsement' | 'none';

interface ECPPermission {
  emr: Permission;
  emt: Permission;
  aemt: Permission;
  paramedic: Permission;
}

interface MedEntry {
  id: string;
  name: string;
  routes: string;
  permissions: ECPPermission;
  endorsementNote?: string;
  footnote?: string;
}

interface MedCategory {
  category: string;
  meds: MedEntry[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

const ENDORSEMENT_DATA: MedCategory[] = [
  {
    category: 'Analgesics & Anesthetics',
    meds: [
      {
        id: 'analgesic-nonopioid',
        name: 'Analgesic, Non-Opioid',
        routes: 'PO / IV / IO',
        permissions: { emr: 'none', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'e.g., acetaminophen. EMT: PO only. AEMT: PO/IV/IO. Paramedic: PO/PR/IV/IO.',
      },
      {
        id: 'analgesic-otc',
        name: 'Analgesic, OTC (pain or fever)',
        routes: 'PO',
        permissions: { emr: 'none', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'All levels PO only.',
      },
      {
        id: 'analgesic-opioid',
        name: 'Analgesic, Opioid',
        routes: 'IN / IM / IV / IO',
        permissions: { emr: 'none', emt: 'none', aemt: 'endorsement', paramedic: 'full' },
        endorsementNote: 'e.g., morphine sulfate, fentanyl. Requires AEMT-99 Endorsement for AEMT.',
        footnote: '1',
      },
      {
        id: 'anesthetic-io',
        name: 'Anesthetic for Intraosseous Infusion',
        routes: 'IO',
        permissions: { emr: 'none', emt: 'none', aemt: 'endorsement', paramedic: 'full' },
        endorsementNote: 'e.g., lidocaine. Requires AEMT-99 Endorsement for AEMT.',
        footnote: '1',
      },
      {
        id: 'anesthetic-ketamine',
        name: 'Anesthetic, NMDA Receptor Antagonist',
        routes: 'IM / IV / IO',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'e.g., ketamine. Paramedic only.',
      },
      {
        id: 'anesthetic-nitrous',
        name: 'Anesthetic, NMDA Antagonist (Inhaled)',
        routes: 'INH',
        permissions: { emr: 'none', emt: 'endorsement', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'e.g., nitrous oxide. Requires EMT Medication Endorsement for EMT.',
      },
    ],
  },
  {
    category: 'Antiarrhythmics & Cardiac',
    meds: [
      {
        id: 'antiarrhythmic',
        name: 'Antiarrhythmic (ACLS/PALS)',
        routes: 'IV / IO',
        permissions: { emr: 'none', emt: 'none', aemt: 'endorsement', paramedic: 'full' },
        endorsementNote: 'Per current ACLS and PALS protocols. Requires AEMT-99 Endorsement for AEMT.',
        footnote: '1',
      },
      {
        id: 'anticoagulant',
        name: 'Anticoagulant (interfacility transport)',
        routes: 'IV',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'e.g., heparin sodium. Paramedic may initiate/continue with online medical director order.',
        footnote: '2',
      },
      {
        id: 'vasopressor',
        name: 'Vasopressor',
        routes: 'IV',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'e.g., norepinephrine, dopamine. Paramedic only.',
      },
      {
        id: 'vasodilator-htn',
        name: 'Vasodilator for Elevated Blood Pressure',
        routes: 'IV',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'e.g., hydralazine. Paramedic only.',
      },
      {
        id: 'nitro-ems',
        name: 'Vasodilator – Nitroglycerin (EMS supplied)',
        routes: 'SL / IV',
        permissions: { emr: 'none', emt: 'endorsement', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'Requires EMT Medication Endorsement for EMT. Paramedic: SL/IV.',
      },
      {
        id: 'nitro-patient',
        name: 'Vasodilator – Nitroglycerin (patient prescribed)',
        routes: 'SL',
        permissions: { emr: 'none', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: "All levels SL only, limited to patient's own medication.",
      },
      {
        id: 'magnesium',
        name: 'Magnesium Salt',
        routes: 'IV',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'e.g., magnesium sulfate. Paramedic only.',
      },
      {
        id: 'electrolytes',
        name: 'Electrolytes',
        routes: 'IV',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'e.g., sodium bicarbonate. Paramedic only.',
      },
    ],
  },
  {
    category: 'Antidotes & Reversal Agents',
    meds: [
      {
        id: 'antidote-autoinjector',
        name: 'Antidote Auto-Injector (Chemical/Hazmat)',
        routes: 'IM',
        permissions: { emr: 'full', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'e.g., atropine and pralidoxime autoinjector. All levels.',
      },
      {
        id: 'antidote-organophosphate',
        name: 'Antidote for Organophosphate Poisoning (Atropine)',
        routes: 'IM / IV / IO / ET',
        permissions: { emr: 'none', emt: 'none', aemt: 'endorsement', paramedic: 'full' },
        endorsementNote: 'Requires AEMT-99 Endorsement for AEMT. Paramedic: IM/IV/IO/ET.',
        footnote: '1',
      },
      {
        id: 'antidote-cyanide',
        name: 'Antidote for Cyanide Toxicity',
        routes: 'IV / IO',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'e.g., hydroxocobalamin, sodium thiosulfate. Paramedic only.',
      },
      {
        id: 'cyanide-kit',
        name: 'Cyanide Antidote Kit',
        routes: 'IV',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'Paramedic only.',
      },
      {
        id: 'antidote-acetaminophen',
        name: 'Antidote for Acetaminophen Overdose',
        routes: 'PO / IV',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'e.g., acetylcysteine. Paramedic only.',
      },
      {
        id: 'antidote-hypoglycemia',
        name: 'Antidote for Hypoglycemia (Glucagon)',
        routes: 'IM / IN / IV',
        permissions: { emr: 'none', emt: 'endorsement', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'Requires EMT Medication Endorsement for EMT. EMT: IM/IN. AEMT/Paramedic: IN/IM/IV.',
      },
      {
        id: 'antidote-radiation',
        name: 'Antidote (Thyroid Protective) for Radiation',
        routes: 'PO',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'e.g., potassium iodide. Paramedic only.',
      },
      {
        id: 'cana',
        name: 'CANA Autoinjector (Nerve Agent)',
        routes: 'IM',
        permissions: { emr: 'none', emt: 'none', aemt: 'endorsement', paramedic: 'full' },
        endorsementNote: 'Requires AEMT-99 Endorsement for AEMT.',
        footnote: '1',
      },
      {
        id: 'naloxone-autoinjector',
        name: 'Opioid Antagonist Auto-Injector (Naloxone)',
        routes: 'IM',
        permissions: { emr: 'full', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'All levels IM auto-injector for suspected opioid overdose.',
      },
      {
        id: 'naloxone-in',
        name: 'Opioid Antagonist – Naloxone (IN)',
        routes: 'IN',
        permissions: { emr: 'full', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'All levels intranasal for suspected opioid overdose.',
      },
      {
        id: 'naloxone-other',
        name: 'Opioid Antagonist – Naloxone (Other Routes)',
        routes: 'IM / IV / IO / ET',
        permissions: { emr: 'none', emt: 'endorsement', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'Requires EMT Medication Endorsement for EMT. Paramedic adds ET route.',
      },
    ],
  },
  {
    category: 'Antihistamines & Anti-Inflammatories',
    meds: [
      {
        id: 'antihistamine-h1',
        name: 'Antihistamine, H1 (Diphenhydramine)',
        routes: 'PO / IM / IV',
        permissions: { emr: 'none', emt: 'full', aemt: 'endorsement', paramedic: 'full' },
        endorsementNote: 'EMT: PO. Requires EMT Medication Endorsement for IM (EMT). Requires AEMT Medication Endorsement for IV (AEMT). Paramedic: PO/IM/IV.',
      },
      {
        id: 'antihistamine-h2',
        name: 'Antihistamine, H2 (e.g., famotidine)',
        routes: 'PO / IV',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'e.g., cimetidine, famotidine. Paramedic only.',
      },
      {
        id: 'glucocorticoid',
        name: 'Glucocorticoid',
        routes: 'PO / IM / IV / IO',
        permissions: { emr: 'none', emt: 'endorsement', aemt: 'endorsement', paramedic: 'full' },
        endorsementNote: 'e.g., dexamethasone, methylprednisolone, prednisone. EMT: PO/IM (needs EMT Medication Endorsement). AEMT: adds IV/IO (needs AEMT Medication Endorsement). Paramedic: all routes.',
      },
      {
        id: 'nsaid-aspirin',
        name: 'NSAID – Aspirin (chest pain, ischemic)',
        routes: 'PO',
        permissions: { emr: 'none', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'All levels PO for suspected ischemic chest pain.',
      },
      {
        id: 'nsaid-parenteral',
        name: 'NSAID – Parenteral (pain)',
        routes: 'IM / IV',
        permissions: { emr: 'none', emt: 'none', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'e.g., ibuprofen, ketorolac. AEMT and Paramedic only.',
      },
      {
        id: 'anticholinergic',
        name: 'Anticholinergic – Ipratropium (dyspnea/wheezing)',
        routes: 'INH / NEB',
        permissions: { emr: 'none', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'All levels INH/NEB.',
      },
    ],
  },
  {
    category: 'Antibiotics & Interfacility Medications',
    meds: [
      {
        id: 'antibiotic',
        name: 'Antibiotic Continuation (interfacility)',
        routes: 'IV / IO',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'Paramedic only for continuation during interfacility transport.',
      },
      {
        id: 'antifibrinolytic',
        name: 'Antifibrinolytic',
        routes: 'IV',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'e.g., tranexamic acid (TXA). Paramedic only.',
      },
      {
        id: 'blood',
        name: 'Blood or Blood Products',
        routes: 'IV',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'Paramedic only.',
      },
      {
        id: 'carbonic-anhydrase',
        name: 'Carbonic Anhydrase Inhibitor',
        routes: 'PO',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'e.g., acetazolamide. Paramedic only.',
      },
    ],
  },
  {
    category: 'Antipsychotics & Sedatives',
    meds: [
      {
        id: 'antipsychotic-atypical',
        name: 'Antipsychotic, Atypical',
        routes: 'SL / IM',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'e.g., olanzapine, ziprasidone. Paramedic only. Note: concurrent IM/IV benzodiazepines and olanzapine IM not recommended.',
        footnote: '3',
      },
      {
        id: 'antipsychotic-typical',
        name: 'Antipsychotic, Typical',
        routes: 'PO / IM / IV',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'e.g., droperidol, haloperidol. Paramedic only.',
      },
      {
        id: 'benzodiazepine',
        name: 'Benzodiazepine (anxiolysis/anticonvulsant)',
        routes: 'IN / SL / IM / IV / IO / PR',
        permissions: { emr: 'none', emt: 'none', aemt: 'endorsement', paramedic: 'full' },
        endorsementNote: 'e.g., diazepam, lorazepam, midazolam. Requires AEMT-99 Endorsement for AEMT.',
        footnote: '1,3',
      },
      {
        id: 'hypnotic-ventilated',
        name: 'Hypnotic – Non-Barbiturate (ventilated, interfacility)',
        routes: 'IV',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'endorsement' },
        endorsementNote: 'e.g., etomidate. Requires Paramedic Critical Care Endorsement.',
      },
      {
        id: 'sedation-infusion',
        name: 'Sedation Infusion (ventilated, interfacility)',
        routes: 'IV',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'endorsement' },
        endorsementNote: 'e.g., propofol. Requires Paramedic Critical Care Endorsement.',
      },
    ],
  },
  {
    category: 'Bronchodilators',
    meds: [
      {
        id: 'beta-agonist',
        name: 'Beta Agonist (patient prescribed or EMS supplied)',
        routes: 'INH / NEB',
        permissions: { emr: 'none', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'e.g., albuterol. All levels INH/NEB.',
      },
      {
        id: 'beta-agonist-combo',
        name: 'Beta Agonist/Bronchodilator + Anticholinergic',
        routes: 'INH',
        permissions: { emr: 'none', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'For dyspnea and wheezing. All levels INH.',
      },
    ],
  },
  {
    category: 'Dextrose & Metabolic',
    meds: [
      {
        id: 'glucose-oral',
        name: 'Glucose for Suspected Hypoglycemia (oral)',
        routes: 'PO',
        permissions: { emr: 'none', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'All levels PO for suspected hypoglycemia.',
      },
      {
        id: 'dextrose-10',
        name: 'Dextrose Injection 10%',
        routes: 'IV / IO',
        permissions: { emr: 'none', emt: 'none', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'AEMT and Paramedic IV/IO.',
      },
      {
        id: 'thiamine',
        name: 'Thiamine',
        routes: 'IM / IV',
        permissions: { emr: 'none', emt: 'none', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'AEMT and Paramedic IM/IV.',
      },
      {
        id: 'calcium-salts',
        name: 'Calcium Salts',
        routes: 'IV / IO / TOP',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'e.g., calcium gluconate, calcium chloride. Paramedic only.',
      },
    ],
  },
  {
    category: 'Antiemetics',
    meds: [
      {
        id: 'antiemetic',
        name: 'Antiemetic',
        routes: 'PO / SL / IM / IV / IO',
        permissions: { emr: 'none', emt: 'none', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'e.g., ondansetron, prochlorperazine, metoclopramide. AEMT: PO/IM/IV/IO. Paramedic: PO/SL/IM/IV/IO.',
      },
    ],
  },
  {
    category: 'Sympathomimetics & Vasopressors',
    meds: [
      {
        id: 'epi-autoinjector-prescribed',
        name: 'Sympathomimetic Auto-Injector (patient prescribed)',
        routes: 'IM',
        permissions: { emr: 'full', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'e.g., epinephrine. All levels IM for patient-prescribed auto-injector.',
      },
      {
        id: 'epi-autoinjector-ems',
        name: 'Sympathomimetic Auto-Injector (EMS supplied)',
        routes: 'IM',
        permissions: { emr: 'none', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'e.g., epinephrine. EMT/AEMT/Paramedic IM for EMS-supplied auto-injector.',
      },
      {
        id: 'epi-standard',
        name: 'Sympathomimetic – Epinephrine',
        routes: 'IM / IV / IO / ET',
        permissions: { emr: 'none', emt: 'endorsement', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'Requires EMT Medication Endorsement for EMT (1:1,000 = 1 mg/ml formulation specifically). AEMT: IM. Paramedic: IM/IV/ET/IO.',
      },
      {
        id: 'sympathomimetic-topical',
        name: 'Sympathomimetic, Topical',
        routes: 'IN',
        permissions: { emr: 'none', emt: 'none', aemt: 'endorsement', paramedic: 'full' },
        endorsementNote: 'e.g., oxymetazoline. Requires AEMT-99 Endorsement for AEMT.',
        footnote: '1',
      },
    ],
  },
  {
    category: 'Immunizations',
    meds: [
      {
        id: 'immunizations',
        name: 'Immunizations (CDC ACIP approved)',
        routes: 'IM',
        permissions: { emr: 'none', emt: 'endorsement', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'CDC ACIP-approved, approved by Medical Director. Requires EMT Medication Endorsement for EMT.',
        footnote: '4',
      },
      {
        id: 'immunizations-public-health',
        name: 'Immunizations (Public Health Emergency)',
        routes: 'IM',
        permissions: { emr: 'none', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'EMT/AEMT/Paramedic during declared public health emergency.',
        footnote: '4',
      },
    ],
  },
  {
    category: 'Paralytic & Critical Care (Interfacility)',
    meds: [
      {
        id: 'nmba',
        name: 'Neuromuscular Blocking Agent (maintain paralysis, interfacility)',
        routes: 'IV',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'endorsement' },
        endorsementNote: 'e.g., atracurium, vecuronium. Requires Paramedic Critical Care Endorsement.',
      },
      {
        id: 'succinylcholine',
        name: 'Skeletal Muscle Relaxant – Succinylcholine (interfacility)',
        routes: 'IV',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'endorsement' },
        endorsementNote: 'Requires Paramedic Critical Care Endorsement.',
      },
      {
        id: 'analgesia-infusion',
        name: 'Continuous Analgesia Infusion (ventilated, interfacility)',
        routes: 'IV',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'endorsement' },
        endorsementNote: 'Requires Paramedic Critical Care Endorsement.',
      },
    ],
  },
  {
    category: 'Topical & OTC',
    meds: [
      {
        id: 'otc-topical',
        name: 'Over the Counter Medications, Topical',
        routes: 'TOP',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'Paramedic only.',
      },
    ],
  },
];

const SKILLS_DATA: MedCategory[] = [
  {
    category: 'Airway / Ventilation / Oxygenation',
    meds: [
      {
        id: 'skill-airway-oral',
        name: 'Airway – oral',
        routes: '',
        permissions: { emr: 'full', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for all levels.',
      },
      {
        id: 'skill-airway-obst-manual',
        name: 'Airway obstruction – dislodgement by manual techniques',
        routes: '',
        permissions: { emr: 'full', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for all levels.',
      },
      {
        id: 'skill-bvm',
        name: 'Bag-valve-mask (BVM)',
        routes: '',
        permissions: { emr: 'full', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for all levels.',
      },
      {
        id: 'skill-head-tilt',
        name: 'Head tilt – chin lift',
        routes: '',
        permissions: { emr: 'full', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for all levels.',
      },
      {
        id: 'skill-jaw-thrust',
        name: 'Jaw thrust',
        routes: '',
        permissions: { emr: 'full', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for all levels.',
      },
      {
        id: 'skill-mouth-to-barrier',
        name: 'Mouth-to-barrier, -to-mask, -to-mouth, -to-nose, -to-stoma',
        routes: '',
        permissions: { emr: 'full', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for all levels.',
      },
      {
        id: 'skill-oxygen-nc-nrb',
        name: 'Oxygen therapy – nasal cannula, non-rebreather mask',
        routes: '',
        permissions: { emr: 'full', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for all levels.',
      },
      {
        id: 'skill-suctioning-upper',
        name: 'Suctioning – upper airway and stoma',
        routes: '',
        permissions: { emr: 'full', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for all levels.',
      },
      {
        id: 'skill-pulse-ox',
        name: 'Pulse oximetry',
        routes: '',
        permissions: { emr: 'endorsement', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'Requires EMR Monitoring Endorsement for Emergency Medical Responders (EMR).',
      },
      {
        id: 'skill-airway-nasal',
        name: 'Airway – nasal',
        routes: '',
        permissions: { emr: 'none', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for EMT, AEMT, and Paramedic.',
      },
      {
        id: 'skill-cpap',
        name: 'Continuous Positive Airway Pressure (CPAP)',
        routes: '',
        permissions: { emr: 'none', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for EMT, AEMT, and Paramedic.',
      },
      {
        id: 'skill-oxygen-humidified',
        name: 'Oxygen therapy – humidifiers, partial rebreather, simple, Venturi',
        routes: '',
        permissions: { emr: 'none', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for EMT, AEMT, and Paramedic.',
      },
      {
        id: 'skill-airway-supraglottic',
        name: 'Airway – supraglottic',
        routes: '',
        permissions: { emr: 'none', emt: 'endorsement', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'Requires EMT Airway Endorsement for EMT. In scope for AEMT and Paramedic.',
      },
      {
        id: 'skill-etco2-numeric',
        name: 'End tidal CO2 numerical values monitoring',
        routes: '',
        permissions: { emr: 'none', emt: 'endorsement', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'Requires EMT Airway Endorsement for EMT. In scope for AEMT and Paramedic.',
      },
      {
        id: 'skill-suctioning-tracheobronchial',
        name: 'Suctioning – tracheobronchial of an intubated patient',
        routes: '',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'In scope for Paramedic level only.',
      },
      {
        id: 'skill-chest-decompression',
        name: 'Chest decompression – needle',
        routes: '',
        permissions: { emr: 'none', emt: 'none', aemt: 'endorsement', paramedic: 'full' },
        endorsementNote: 'Requires AEMT-99 Endorsement for AEMT. In scope for Paramedic.',
      },
      {
        id: 'skill-intubation',
        name: 'Endotracheal intubation',
        routes: '',
        permissions: { emr: 'none', emt: 'none', aemt: 'endorsement', paramedic: 'full' },
        endorsementNote: 'Requires AEMT-99 Endorsement for AEMT. In scope for Paramedic.',
      },
      {
        id: 'skill-airway-laryngoscopy',
        name: 'Airway obstruction – dislodgement by direct laryngoscopy',
        routes: '',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'In scope for Paramedic level only.',
      },
      {
        id: 'skill-chest-tube-assist',
        name: 'Chest tube placement – assist only',
        routes: '',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'In scope for Paramedic level only.',
      },
      {
        id: 'skill-chest-tube-monitor',
        name: 'Chest tube – monitoring and management',
        routes: '',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'In scope for Paramedic level only.',
      },
      {
        id: 'skill-cricothyrotomy',
        name: 'Cricothyrotomy',
        routes: '',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'In scope for Paramedic level only.',
      },
      {
        id: 'skill-gastric-decompression',
        name: 'Gastric decompression – nasogastric or orogastric tube',
        routes: '',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'In scope for Paramedic level only.',
      },
      {
        id: 'skill-high-flow-nasal',
        name: 'Oxygen therapy – high flow nasal cannula',
        routes: '',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'In scope for Paramedic level only.',
      },
      {
        id: 'skill-etco2-capnography',
        name: 'End tidal CO2 interpretation of continuous waveform capnography',
        routes: '',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'In scope for Paramedic level only.',
      },
      {
        id: 'skill-ventilator-management',
        name: 'Manage mechanically ventilated patient (includes automatic transport ventilators)',
        routes: '',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'endorsement' },
        endorsementNote: 'Requires Paramedic Critical Care Endorsement. Contact online or offline medical director for consultation to modify ventilator settings.',
      },
      {
        id: 'skill-rsi',
        name: 'Drug Assisted Intubation (DAI) or Rapid Sequence Intubation',
        routes: '',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'none' },
        endorsementNote: 'Not in base scope or standard endorsement.',
      },
    ],
  },
  {
    category: 'Cardiovascular / Circulation',
    meds: [
      {
        id: 'skill-cpr',
        name: 'Cardiopulmonary resuscitation',
        routes: '',
        permissions: { emr: 'full', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for all levels.',
      },
      {
        id: 'skill-aed',
        name: 'Defibrillation - automated/semi-automated',
        routes: '',
        permissions: { emr: 'full', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for all levels.',
      },
      {
        id: 'skill-bleeding-control',
        name: 'Hemorrhage control – direct pressure, tourniquet, wound packing',
        routes: '',
        permissions: { emr: 'full', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for all levels.',
      },
      {
        id: 'skill-cardiac-monitoring',
        name: 'Cardiac monitoring and/or 12-lead ECG acquisition and transmission',
        routes: '',
        permissions: { emr: 'none', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for EMT, AEMT, and Paramedic.',
      },
      {
        id: 'skill-mechanical-cpr',
        name: 'Mechanical CPR device',
        routes: '',
        permissions: { emr: 'none', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for EMT, AEMT, and Paramedic.',
      },
      {
        id: 'skill-telemetric-monitoring',
        name: 'Telemetric monitoring devices and transmission of clinical data, including video data',
        routes: '',
        permissions: { emr: 'none', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for EMT, AEMT, and Paramedic.',
      },
      {
        id: 'skill-ecg-interpretation',
        name: 'Electrocardiogram interpretation',
        routes: '',
        permissions: { emr: 'none', emt: 'none', aemt: 'endorsement', paramedic: 'full' },
        endorsementNote: 'Requires AEMT-99 Endorsement for AEMT. In scope for Paramedic.',
      },
      {
        id: 'skill-cardioversion',
        name: 'Cardioversion – electrical',
        routes: '',
        permissions: { emr: 'none', emt: 'none', aemt: 'endorsement', paramedic: 'full' },
        endorsementNote: 'Requires AEMT-99 Endorsement for AEMT. In scope for Paramedic.',
      },
      {
        id: 'skill-defib-manual',
        name: 'Defibrillation – manual',
        routes: '',
        permissions: { emr: 'none', emt: 'none', aemt: 'endorsement', paramedic: 'full' },
        endorsementNote: 'Requires AEMT-99 Endorsement for AEMT. In scope for Paramedic.',
      },
      {
        id: 'skill-pacing',
        name: 'Transcutaneous pacing',
        routes: '',
        permissions: { emr: 'none', emt: 'none', aemt: 'endorsement', paramedic: 'full' },
        endorsementNote: 'Requires AEMT-99 Endorsement for AEMT. In scope for Paramedic.',
      },
      {
        id: 'skill-transvenous-pacing',
        name: 'Transvenous cardiac pacing – monitoring and maintenance',
        routes: '',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'In scope for Paramedic level only.',
      },
    ],
  },
  {
    category: 'Splinting, Spinal Motion Restrictions, & Patient Restraint',
    meds: [
      {
        id: 'skill-c-collar',
        name: 'Cervical collar',
        routes: '',
        permissions: { emr: 'full', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for all levels.',
      },
      {
        id: 'skill-emergency-moves',
        name: 'Emergency moves for endangered patients',
        routes: '',
        permissions: { emr: 'full', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for all levels.',
      },
      {
        id: 'skill-extremity-stabilization',
        name: 'Extremity stabilization – manual',
        routes: '',
        permissions: { emr: 'full', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for all levels.',
      },
      {
        id: 'skill-extremity-splinting',
        name: 'Extremity splinting',
        routes: '',
        permissions: { emr: 'full', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for all levels.',
      },
      {
        id: 'skill-manual-stabilization',
        name: 'Manual cervical stabilization',
        routes: '',
        permissions: { emr: 'full', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for all levels.',
      },
      {
        id: 'skill-long-spine-board',
        name: 'Long spine board',
        routes: '',
        permissions: { emr: 'none', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for EMT, AEMT, and Paramedic.',
      },
      {
        id: 'skill-restraint',
        name: 'Mechanical patient restraint',
        routes: '',
        permissions: { emr: 'none', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for EMT, AEMT, and Paramedic.',
      },
      {
        id: 'skill-pelvic-splinting',
        name: 'Pelvic splinting',
        routes: '',
        permissions: { emr: 'none', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for EMT, AEMT, and Paramedic.',
      },
      {
        id: 'skill-smr-ked',
        name: 'Seated Spinal Motion Restriction (SMR), (e.g., Kendrick Extrication Device (KED))',
        routes: '',
        permissions: { emr: 'none', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for EMT, AEMT, and Paramedic.',
      },
      {
        id: 'skill-splint-traction',
        name: 'Splint – traction',
        routes: '',
        permissions: { emr: 'none', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for EMT, AEMT, and Paramedic.',
      },
    ],
  },
  {
    category: 'IV Initiation / Maintenance Fluids',
    meds: [
      {
        id: 'skill-io-initiation',
        name: 'Intraosseous access – initiation, pediatric or adult',
        routes: '',
        permissions: { emr: 'none', emt: 'endorsement', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'Requires EMT IV/IO Initiation Endorsement for EMT. In scope for AEMT and Paramedic.',
      },
      {
        id: 'skill-iv-access',
        name: 'Intravenous access',
        routes: '',
        permissions: { emr: 'none', emt: 'endorsement', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'Requires EMT IV/IO Initiation Endorsement for EMT. In scope for AEMT and Paramedic.',
      },
      {
        id: 'skill-iv-nonmedicated',
        name: 'Intravenous – maintenance of non-medicated IV fluids',
        routes: '',
        permissions: { emr: 'none', emt: 'endorsement', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'Requires EMT IV/IO Initiation Endorsement OR EMT IV/IO Maintenance Endorsement for EMT. In scope for AEMT and Paramedic.',
      },
      {
        id: 'skill-iv-medicated',
        name: 'Intravenous – maintenance of medicated IV fluids',
        routes: '',
        permissions: { emr: 'none', emt: 'none', aemt: 'endorsement', paramedic: 'full' },
        endorsementNote: 'Requires AEMT-99 Endorsement for AEMT. In scope for Paramedic.',
      },
      {
        id: 'skill-indwelling-catheter',
        name: 'Access indwelling catheters and implanted central IV ports (limited to previously used ports)',
        routes: '',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'In scope for Paramedic level only.',
      },
      {
        id: 'skill-central-line-monitor',
        name: 'Central line – monitoring',
        routes: '',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'In scope for Paramedic level only.',
      },
    ],
  },
  {
    category: 'Miscellaneous Skills',
    meds: [
      {
        id: 'skill-childbirth-assisted',
        name: 'Assisted delivery (childbirth)',
        routes: '',
        permissions: { emr: 'full', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for all levels.',
      },
      {
        id: 'skill-bp-monitoring',
        name: 'Blood pressure automated or manual',
        routes: '',
        permissions: { emr: 'full', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for all levels.',
      },
      {
        id: 'skill-eye-irrigation',
        name: 'Eye irrigation',
        routes: '',
        permissions: { emr: 'full', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for all levels.',
      },
      {
        id: 'skill-blood-glucose',
        name: 'Blood glucose monitoring',
        routes: '',
        permissions: { emr: 'endorsement', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'Requires EMR Monitoring Endorsement for EMR. In scope for EMT, AEMT, and Paramedic.',
      },
      {
        id: 'skill-childbirth-complicated',
        name: 'Assisted complicated delivery (childbirth)',
        routes: '',
        permissions: { emr: 'none', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'In scope for EMT, AEMT, and Paramedic.',
      },
      {
        id: 'skill-patient-transport',
        name: 'Patient transport',
        routes: '',
        permissions: { emr: 'none', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'DPHHS allows EMR as part of a legal crew as long as at least one crew member is EMT or above.',
        footnote: '2',
      },
      {
        id: 'skill-nasal-swab',
        name: 'Specimen collection via nasal swab',
        routes: '',
        permissions: { emr: 'none', emt: 'full', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'Per National EMS Scope of Practice Model 2019: Including Change Notices 1.0 and 2.0, medical direction should ensure appropriate clinical experience to obtain an acceptable specimen to minimize inaccurate results.',
        footnote: '3',
      },
      {
        id: 'skill-venous-sampling',
        name: 'Venous blood sampling',
        routes: '',
        permissions: { emr: 'none', emt: 'endorsement', aemt: 'full', paramedic: 'full' },
        endorsementNote: 'Requires EMT IV/IO Initiation Endorsement for EMT. In scope for AEMT and Paramedic.',
      },
      {
        id: 'skill-blood-chemistry',
        name: 'Blood chemistry analysis',
        routes: '',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'In scope for Paramedic level only.',
      },
      {
        id: 'skill-eye-irrigation-handsfree',
        name: 'Eye irrigation – hands free irrigation using sterile eye irrigation device',
        routes: '',
        permissions: { emr: 'none', emt: 'none', aemt: 'none', paramedic: 'full' },
        endorsementNote: 'In scope for Paramedic level only.',
      },
    ],
  },
];

// ─── Color helpers ────────────────────────────────────────────────────────────

function permBadge(p: Permission, level: string) {
  if (p === 'full') {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 dark:border-emerald-500/40 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{level}</span>
      </div>
    );
  }
  if (p === 'endorsement') {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 dark:border-amber-500/40 flex items-center justify-center">
          <Shield className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">{level}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-white/15" />
      </div>
      <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-white/20">{level}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

// ─── Drug Synonyms Map ────────────────────────────────────────────────────────

const DRUG_SYNONYMS: Record<string, string[]> = {
  'analgesic-nonopioid': ['tylenol', 'acetaminophen', 'paracetamol', 'ibuprofen', 'advil', 'motrin', 'toradol', 'ketorolac', 'pain', 'fever'],
  'analgesic-otc': ['tylenol', 'acetaminophen', 'paracetamol', 'ibuprofen', 'advil', 'motrin', 'pain', 'fever', 'aleve', 'naproxen'],
  'analgesic-opioid': ['morphine', 'fentanyl', 'dilaudid', 'hydromorphone', 'demerol', 'meperidine', 'sublimaze', 'duragesic', 'narcotic'],
  'anesthetic-io': ['lidocaine', 'xylocaine', 'io pain', 'ez-io'],
  'anesthetic-ketamine': ['ketamine', 'ketalar', 'dissociative'],
  'anesthetic-nitrous': ['nitrous oxide', 'laughing gas', 'entonox', 'nitrox'],
  'antiarrhythmic': ['amiodarone', 'lidocaine', 'adenosine', 'cardizem', 'diltiazem', 'digoxin', 'beta-blockers', 'procainamide', 'cordarone', 'adenocard', 'acls', 'pals', 'vtach', 'afib'],
  'anticoagulant': ['heparin', 'lovenox', 'enoxaparin', 'coumadin', 'warfarin', 'blood thinner'],
  'vasopressor': ['norepinephrine', 'levophed', 'dopamine', 'epinephrine', 'adrenaline', 'shock', 'pressor'],
  'vasodilator-htn': ['hydralazine', 'apresoline', 'labetalol', 'trandate', 'blood pressure'],
  'nitro-ems': ['nitroglycerin', 'nitro', 'nitrostat', 'nitropaste', 'angina', 'chest pain'],
  'nitro-patient': ['nitroglycerin', 'nitro', 'nitrostat', 'nitropaste', 'angina', 'chest pain'],
  'magnesium': ['magnesium sulfate', 'mag', 'torsades', 'eclampsia'],
  'electrolytes': ['sodium bicarbonate', 'bicarb', 'calcium', 'potassium'],
  'antidote-autoinjector': ['atropine', 'pralidoxime', 'mark i', 'duodote', 'hazmat', 'nerve agent', 'organophosphate'],
  'antidote-organophosphate': ['atropine', '2-pam', 'pralidoxime', 'duodote', 'nerve agent'],
  'antidote-cyanide': ['hydroxocobalamin', 'cyanokit', 'sodium thiosulfate', 'cyanide'],
  'cyanide-kit': ['cyanokit', 'cyanide antidote'],
  'antidote-acetaminophen': ['mucomyst', 'acetylcysteine', 'tylenol overdose'],
  'antidote-hypoglycemia': ['glucagon', 'glucagen', 'hypoglycemia', 'dextrose', 'd10', 'd50'],
  'antidote-radiation': ['potassium iodide', 'iosat', 'thyroid shield', 'radiation'],
  'cana': ['cana', 'diazepam', 'valium', 'convulsive', 'nerve agent'],
  'naloxone-autoinjector': ['narcan', 'naloxone', 'evzio', 'opioid overdose'],
  'naloxone-in': ['narcan', 'naloxone', 'opioid overdose'],
  'naloxone-other': ['narcan', 'naloxone', 'opioid overdose'],
  'antihistamine-h1': ['benadryl', 'diphenhydramine', 'allergic', 'anaphylaxis'],
  'antihistamine-h2': ['pepcid', 'famotidine', 'zantac', 'ranitidine', 'tagamet', 'cimetidine'],
  'glucocorticoid': ['solu-medrol', 'methylprednisolone', 'decadron', 'dexamethasone', 'prednisone', 'deltasone', 'steroid'],
  'nsaid-aspirin': ['aspirin', 'asa', 'bayer', 'ecotrin', 'chest pain', 'heart attack'],
  'nsaid-parenteral': ['toradol', 'ketorolac', 'ibuprofen', 'caldolor', 'sprix'],
  'anticholinergic': ['atrovent', 'ipratropium bromide', 'copd', 'asthma'],
  'antibiotic': ['penicillin', 'ceftriaxone', 'rocephin', 'ancef', 'cefazolin', 'vancomycin', 'antibiotics'],
  'antifibrinolytic': ['txa', 'tranexamic acid', 'lysteda', 'hemorrhage', 'bleeding'],
  'blood': ['blood', 'packed red blood cells', 'prbc', 'plasma', 'ffp', 'platelets', 'transfusion'],
  'carbonic-anhydrase': ['diamox', 'acetazolamide', 'high altitude'],
  'antipsychotic-atypical': ['zyprexa', 'olanzapine', 'geodon', 'ziprasidone', 'agitation'],
  'antipsychotic-typical': ['inapsine', 'droperidol', 'haldol', 'haloperidol', 'agitation'],
  'benzodiazepine': ['versed', 'midazolam', 'valium', 'diazepam', 'ativan', 'lorazepam', 'xanax', 'alprazolam', 'seizure', 'sedative'],
  'hypnotic-ventilated': ['amidate', 'etomidate', 'intubation', 'rsi'],
  'sedation-infusion': ['diprivan', 'propofol', 'precedex', 'dexmedetomidine', 'sedative infusion'],
  'beta-agonist': ['albuterol', 'ventolin', 'proventil', 'xopenex', 'levalbuterol', 'bronchodilator', 'asthma', 'copd'],
  'beta-agonist-combo': ['combivent', 'duoneb', 'iprafed', 'albuterol ipratropium', 'asthma', 'copd'],
  'glucose-oral': ['glutose', 'insta-glucose', 'oral glucose', 'sugar gel'],
  'dextrose-10': ['d10w', 'd10', 'dextrose', 'sugar water'],
  'thiamine': ['vitamin b1', 'thiamine', 'wernicke'],
  'calcium-salts': ['calcium gluconate', 'calcium chloride', 'hyperkalemia'],
  'antiemetic': ['zofran', 'ondansetron', 'phenergan', 'promethazine', 'reglan', 'metoclopramide', 'compazine', 'prochlorperazine', 'nausea', 'vomiting'],
  'epi-autoinjector-prescribed': ['epinephrine', 'epipen', 'epi', 'adrenaline', 'anaphylaxis'],
  'epi-autoinjector-ems': ['epinephrine', 'epipen', 'epi', 'adrenaline', 'anaphylaxis'],
  'epi-standard': ['epinephrine', 'epi', 'adrenaline', 'anaphylaxis', 'asthma', 'croup'],
  'sympathomimetic-topical': ['afrin', 'oxymetazoline', 'nasal spray', 'epistaxis', 'nosebleed'],
  'nmba': ['vecuronium', 'norcuron', 'rocuronium', 'zemuron', 'atracurium', 'nimbex', 'cisatracurium', 'paralytic_infusion', 'paralytic'],
  'succinylcholine': ['anectine', 'quelicin', 'succs', 'paralytic', 'rsi'],
  'analgesia-infusion': ['fentanyl infusion', 'morphine infusion', 'pain drip'],
  // Skill Synonyms Map
  'skill-pulse-ox': ['spo2', 'oxygen saturation', 'pulse oximeter', 'oximetry'],
  'skill-cpap': ['cpap', 'continuous positive airway pressure', 'pbe', 'peep', 'bi-pap', 'bipap'],
  'skill-chest-decompression': ['needle decompression', 'nd', 'tension pneumothorax', 'needle chest thoracostomy'],
  'skill-intubation': ['ett', 'endotracheal', 'intubation', 'tube', 'airway'],
  'skill-ventilator-management': ['ventilator', 'vent', 'mechanical ventilation', 'transport ventilator', 'atv'],
  'skill-cpr': ['cpr', 'cardiopulmonary resuscitation', 'chest compressions', 'arrest', 'cardiac arrest'],
  'skill-aed': ['aed', 'automated external defibrillator', 'defib', 'shock'],
  'skill-cardiac-monitoring': ['ecg', 'ekg', '12-lead', '12 lead', 'monitor', 'telemetry'],
  'skill-ecg-interpretation': ['ecg', 'ekg', 'rhythm interpretation', 'stemi', 'interpretation'],
  'skill-cardioversion': ['electrical cardioversion', 'synchronized cardioversion', 'shock', 'svt'],
  'skill-defib-manual': ['manual defibrillation', 'defib', 'v-fib', 'pulseless v-tach'],
  'skill-pacing': ['transcutaneous pacing', 'tcp', 'pacing', 'bradycardia'],
  'skill-io-initiation': ['io', 'intraosseous', 'ez-io', 'bone needle', 'drill'],
  'skill-iv-access': ['iv', 'intravenous', 'cannula', 'line', 'saline lock'],
  'skill-blood-glucose': ['bg', 'blood sugar', 'glucose meter', 'glucometer', 'hypoglycemia', 'hyperglycemia'],
  'skill-venous-sampling': ['blood draw', 'venipuncture', 'phlebotomy', 'blood sampling', 'tubes'],
};

interface EndorsementsProps {
  onBack?: () => void;
  searchQuery?: string;
  hideHeader?: boolean;
  activeSectionProp?: 'meds' | 'skills';
}

export default function Endorsements({ onBack, searchQuery = '', hideHeader = false, activeSectionProp }: EndorsementsProps) {
  const [search, setSearch] = useState('');
  const [internalActiveSection, setInternalActiveSection] = useState<'meds' | 'skills'>('meds');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activeSection = activeSectionProp ?? internalActiveSection;
  const activeData = activeSection === 'meds' ? ENDORSEMENT_DATA : SKILLS_DATA;

  React.useEffect(() => {
    setExpandedId(null);
  }, [activeSection]);

  const filtered = useMemo(() => {
    const q = (searchQuery || search).toLowerCase().trim();
    if (!q) return activeData;
    return activeData
      .map(cat => ({
        ...cat,
        meds: cat.meds.filter(
          m => {
            const nameMatch = m.name.toLowerCase().includes(q);
            const noteMatch = m.endorsementNote?.toLowerCase().includes(q) ?? false;
            const catMatch = cat.category.toLowerCase().includes(q);
            const syns = DRUG_SYNONYMS[m.id] || [];
            const synMatch = syns.some(syn => syn.includes(q) || q.includes(syn));
            return nameMatch || noteMatch || catMatch || synMatch;
          }
        ),
      }))
      .filter(cat => cat.meds.length > 0);
  }, [search, searchQuery, activeSection, activeData]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn("max-w-2xl mx-auto pb-6", hideHeader ? "p-0" : "p-4")}
    >
      {!hideHeader && onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Tools</span>
        </button>
      )}

      {!hideHeader && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
              Montana ECP
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Endorsements</h2>
          <p className="text-xs text-zinc-500 dark:text-white/40 mt-1 font-mono">Scope of Practice & Endorsements by Level</p>
        </div>
      )}

      <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl p-4 mb-6 flex items-start gap-4 shadow-sm dark:shadow-none animate-fade-in">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-500/30 dark:border-emerald-500/40 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
          </div>
          <span className="text-[10px] text-zinc-650 dark:text-white/60 font-mono uppercase tracking-wider">In Scope</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-50 dark:bg-amber-500/20 border border-amber-500/30 dark:border-amber-500/40 flex items-center justify-center">
            <Shield className="w-2.5 h-2.5 text-amber-500 dark:text-amber-400" />
          </div>
          <span className="text-[10px] text-zinc-650 dark:text-white/60 font-mono uppercase tracking-wider">Endorsement Req.</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-zinc-150 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-white/15" />
          </div>
          <span className="text-[10px] text-zinc-650 dark:text-white/60 font-mono uppercase tracking-wider">Not in Scope</span>
        </div>
      </div>

      {!activeSectionProp && (
        <div className="flex bg-zinc-100 dark:bg-zinc-800/40 p-1.5 rounded-2xl mb-6 border border-zinc-200/80 dark:border-white/5 shadow-inner animate-fade-in">
          <button
            onClick={() => {
              setInternalActiveSection('meds');
              setExpandedId(null);
            }}
            className={cn(
              "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200",
              activeSection === 'meds'
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md"
                : "text-zinc-600 dark:text-white/60 hover:text-zinc-950 dark:hover:text-white"
            )}
          >
            Medications
          </button>
          <button
            onClick={() => {
              setInternalActiveSection('skills');
              setExpandedId(null);
            }}
            className={cn(
              "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200",
              activeSection === 'skills'
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md"
                : "text-zinc-650 dark:text-white/60 hover:text-zinc-950 dark:hover:text-white"
            )}
          >
            Clinical Skills
          </button>
        </div>
      )}

      {!hideHeader && (
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-white/30" />
          <input
            type="text"
            placeholder={activeSection === 'meds' ? "Search medications..." : "Search clinical skills..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-400 dark:placeholder:text-white/20"
          />
        </div>
      )}

      <div className="space-y-6">
        {filtered.map(cat => (
          <div key={cat.category}>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-white/30 px-1 mb-3 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              {cat.category}
            </h3>
            <div className="space-y-2">
              {cat.meds.map(med => {
                const isExpanded = expandedId === med.id;
                return (
                  <div key={med.id} className="bg-white dark:bg-[#1C1C1E] border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm dark:shadow-none animate-fade-in">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : med.id)}
                      className="w-full p-5 text-left hover:bg-zinc-50 dark:hover:bg-white/5 transition-all active:scale-[0.99] relative"
                    >
                      <div className="pr-8">
                        <div>
                          <p className="text-base font-black leading-snug text-zinc-900 dark:text-white uppercase tracking-tight">
                            {med.name}
                          </p>
                          {med.routes && (
                            <p className="text-[10px] font-mono text-zinc-500 dark:text-white/30 mt-1 uppercase tracking-wider">
                              <span className="font-bold text-zinc-400 dark:text-white/20">Routes:</span> {med.routes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-4">
                          {permBadge(med.permissions.emr, 'EMR')}
                          {permBadge(med.permissions.emt, 'EMT')}
                          {permBadge(med.permissions.aemt, 'AEMT')}
                          {permBadge(med.permissions.paramedic, 'PM')}
                        </div>
                      </div>
                      <div className="absolute right-4 top-6 text-zinc-400 dark:text-white/20">
                        <ChevronDown className={cn("w-5 h-5 transition-transform duration-200", isExpanded && "rotate-180")} />
                      </div>
                    </button>
                    {isExpanded && med.endorsementNote && (
                      <div className="px-5 pb-5 border-t border-zinc-100 dark:border-white/5 pt-3 bg-zinc-50/50 dark:bg-black/10">
                        <div className="flex items-start gap-2">
                          <Info className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-zinc-650 dark:text-white/60 leading-relaxed">
                            {med.endorsementNote}
                            {med.footnote && (
                              <span className="text-amber-600 dark:text-amber-400/70 ml-1 text-[10px]">[{med.footnote}]</span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Info className="w-12 h-12 text-zinc-300 dark:text-white/10 mx-auto mb-4" />
            <p className="text-zinc-500 dark:text-white/40 text-sm">No items found matching your search.</p>
          </div>
        )}
      </div>

      <div className="mt-8 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl p-4 space-y-2 shadow-sm dark:shadow-none">
        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-450 dark:text-white/30 mb-3">Footnotes</p>
        {(activeSection === 'meds' ? [
          ['1', 'Must be administered per Montana ECP Scope of Practice, Medical Director-approved clinical protocols, and National Model EMS Clinical Guidelines v3.0 (March 2022).'],
          ['2', 'Paramedic may initiate or continue with indication and order from online medical director.'],
          ['3', 'Concurrent use of IM/IV benzodiazepines and olanzapine IM is NOT recommended — fatalities reported (NMECG v3.0 p.61).'],
          ['4', 'Immunizations approved by CDC ACIP, approved by the Medical Director, and included in the Montana Endorsement, if applicable.'],
        ] : [
          ['1', 'Contact online or offline medical director for consultation to modify ventilator settings.'],
          ['2', 'DPHHS allows EMR as part of a legal crew as long as at least one crew member is EMT or above.'],
          ['3', 'Per National ECP Scope of Practice Model, medical direction should ensure appropriate clinical experience to obtain an acceptable specimen to minimize inaccurate results.'],
        ]).map(([num, text]) => (
          <div key={num} className="flex gap-2 animate-fade-in">
            <span className="text-[9px] text-amber-600 dark:text-amber-400/70 font-bold shrink-0">[{num}]</span>
            <p className="text-[9px] text-zinc-500 dark:text-white/30 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
