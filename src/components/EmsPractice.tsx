import React, { useState, useEffect, useRef } from 'react';
import { 
  Award, BookOpen, Brain, CheckCircle, ChevronRight, ClipboardList, 
  Flame, Heart, HelpCircle, Info, Lightbulb, Play, 
  RotateCcw, Stethoscope, ThumbsUp, Timer, User, XCircle, ShieldAlert,
  Baby, Zap, Droplets, AlertCircle, Calendar, ListTodo, Activity,
  Volume2, VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import IoReview from './IoReview';
import IvReview from './IvReview';

// =========================================================================
// TYPES
// =========================================================================

interface ScenarioStep {
  id: string;
  text: string;
  vitals?: {
    hr: string;
    bp: string;
    rr: string;
    spo2: string;
    gcs?: string;
  };
  options: {
    text: string;
    nextStepId: string;
    feedback: string;
    correct: boolean;
    critical?: boolean;
  }[];
}

interface ClinicalScenario {
  id: string;
  title: string;
  category: 'Cardiac' | 'Trauma' | 'Respiratory' | 'Pediatric' | 'Medical' | 'Operations';
  difficulty: 'EMR' | 'EMT' | 'AEMT';
  dispatch: string;
  initialAssessment: string;
  steps: Record<string, ScenarioStep>;
  finalSummary: string;
}

interface QuizQuestion {
  id: string;
  category: 'Medications' | 'Protocols' | 'EKG & Vitals' | 'EMS Operations' | 'IO Access';
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

interface SkillChecklist {
  id: string;
  title: string;
  category: 'EMR' | 'EMT' | 'AEMT';
  steps: {
    text: string;
    critical: boolean;
  }[];
}

interface EkgRhythm {
  id: string;
  name: string;
  category: string;
  rate: number;
  regularity: string;
  qrs: string;
  pWave: string;
  description: string;
  treatment: string;
}

// =========================================================================
// DATA
// =========================================================================

const CLINICAL_SCENARIOS: ClinicalScenario[] = [
  {
    id: 'scen-1',
    title: 'Acute Coronary Syndrome (STEMI)',
    category: 'Cardiac',
    difficulty: 'EMT',
    dispatch: 'Dispatch: Medical call for 58 YOM experiencing severe chest pain at a local hardware store.',
    initialAssessment: 'Patient is conscious, alert, pale, diaphoretic, clutching his chest. "It feels like an elephant is sitting on my chest," he gasps.',
    steps: {
      start: {
        id: 'start',
        text: 'What is your initial immediate action after taking BSI/scene safety precautions and performing primary assessment?',
        vitals: { hr: '104', bp: '138/86', rr: '20', spo2: '93%' },
        options: [
          { text: 'Administer Aspirin 324 mg chewable.', nextStepId: 'ox_stemi', feedback: 'Correct. Aspirin inhibits platelet aggregation and is the highest priority first drug.', correct: true },
          { text: 'Administer high-flow O2 via Non-Rebreather at 15 L/min.', nextStepId: 'wrong_oxygen', feedback: 'Incorrect. O2 is only indicated if SpO2 is <94% or patient is in distress; aggressive O2 can cause hyperoxic coronary vasoconstriction.', correct: false },
          { text: 'Assist patient with his own Nitroglycerin right away.', nextStepId: 'nitro_first', feedback: 'Caution: Nitroglycerin requires checking BP first. Also, Aspirin is higher priority.', correct: false }
        ]
      },
      wrong_oxygen: {
        id: 'wrong_oxygen',
        text: 'You administer high-flow O2. The patient is still complaining of chest pain. What is your next move?',
        options: [
          { text: 'Administer Aspirin 324 mg chewable.', nextStepId: 'ox_stemi', feedback: 'Correct. Do not forget Aspirin for active chest pain.', correct: true },
          { text: 'Check vitals and administer Nitroglycerin.', nextStepId: 'nitro_eval', feedback: 'Partial. Always ensure Aspirin is given early.', correct: true }
        ]
      },
      nitro_first: {
        id: 'nitro_first',
        text: 'You prepare to assist with Nitroglycerin. What absolute contraindications must you verify first?',
        options: [
          { text: 'Verify systolic BP >100 mmHg and no erectile dysfunction (ED) drugs within 24-48 hours.', nextStepId: 'ox_stemi', feedback: 'Correct. NTG will cause catastrophic hypotension if BP is low or if ED meds were taken.', correct: true, critical: true },
          { text: 'Ask if he has a history of high blood pressure.', nextStepId: 'fail_nitro', feedback: 'Incorrect. Hypotension is the danger, not hypertension.', correct: false }
        ]
      },
      ox_stemi: {
        id: 'ox_stemi',
        text: 'Aspirin is administered. A 12-Lead EKG is obtained. It shows 3mm ST-segment elevation in Leads II, III, and aVF (Inferior STEMI). What is your primary clinical concern regarding Nitroglycerin administration in this patient?',
        vitals: { hr: '96', bp: '108/64', rr: '18', spo2: '94%' },
        options: [
          { text: 'Inferior STEMIs are highly preload-dependent; Nitroglycerin can cause profound hypotension.', nextStepId: 'stemi_complete', feedback: 'Excellent! Inferior STEMIs often involve the Right Ventricle. Venodilation from NTG reduces preload, crashing cardiac output.', correct: true },
          { text: 'Nitroglycerin can cause tachycardia, worsening the ST elevation.', nextStepId: 'stemi_complete', feedback: 'Secondary concern, but preload depletion and severe hypotension is the chief danger in RV infarcts.', correct: false }
        ]
      },
      stemi_complete: {
        id: 'stemi_complete',
        text: 'Preload dependency identified. You withhold Nitroglycerin, establish IV access, and prepare for immediate transport to the nearest Percutaneous Coronary Intervention (PCI) center.',
        options: [
          { text: 'Complete scenario.', nextStepId: 'finish', feedback: 'Scenario successfully resolved!', correct: true }
        ]
      }
    },
    finalSummary: 'Outstanding work. You successfully recognized the priority of early Aspirin, screened for ED drugs, identified an Inferior STEMI on the 12-lead, and correctly withheld Nitroglycerin due to right-ventricular preload dependency risk.'
  },
  {
    id: 'scen-2',
    title: 'Pediatric Anaphylaxis',
    category: 'Pediatric',
    difficulty: 'AEMT',
    dispatch: 'Dispatch: Emergency call for a 4 YOM who ingested a cookie containing peanuts. Patient is breathing rapidly.',
    initialAssessment: 'You find a 4-year-old child sitting on his mother\'s lap. He is anxious, has hives on his neck and chest, and you hear audible high-pitched inspiratory stridor.',
    steps: {
      start: {
        id: 'start',
        text: 'The patient shows clear signs of impending airway closure. What is the immediate first-line medication and route?',
        vitals: { hr: '138', bp: '82/48', rr: '32', spo2: '89%' },
        options: [
          { text: 'Epinephrine 1:1,000 (1 mg/mL) - 0.15 mg IM (Intramuscular) in the outer thigh.', nextStepId: 'epi_done', feedback: 'Correct! IM Epinephrine is the absolute first-line treatment for anaphylaxis. The pediatric dose is 0.15 mg (0.15 mL).', correct: true, critical: true },
          { text: 'Albuterol 2.5 mg nebulized.', nextStepId: 'wrong_epi_first', feedback: 'Incorrect. Nebulizers treat bronchospasm, but Epinephrine is needed immediately to reverse upper-airway laryngeal edema and support pressure.', correct: false },
          { text: 'Start an IV line and give Diphenhydramine 12.5 mg IV slow push.', nextStepId: 'wrong_epi_first', feedback: 'Incorrect. Starting an IV in a screaming pediatric patient delays life-saving Epinephrine. Diphenhydramine is a secondary antihistamine.', correct: false }
        ]
      },
      wrong_epi_first: {
        id: 'wrong_epi_first',
        text: 'The stridor gets louder and the child is becoming lethargic. You must act immediately!',
        options: [
          { text: 'Epinephrine 0.15 mg IM in outer thigh.', nextStepId: 'epi_done', feedback: 'Correct. epinephrine IM is the primary rescue medication.', correct: true, critical: true },
          { text: 'Attempt bag-valve mask ventilations.', nextStepId: 'bvm_ped', feedback: 'Ventilations are difficult due to laryngeal swelling. Give Epinephrine first to open the airway.', correct: false }
        ]
      },
      epi_done: {
        id: 'epi_done',
        text: 'IM Epinephrine is administered. Within 3 minutes, stridor decreases, SpO2 rises, and hives begin to fade. What are your subsequent supportive care priorities?',
        vitals: { hr: '144', bp: '94/60', rr: '24', spo2: '96%' },
        options: [
          { text: 'Provide blow-by oxygen, establish vascular access, and administer secondary Diphenhydramine (1 mg/kg IM/IV).', nextStepId: 'peds_complete', feedback: 'Excellent. Secondary antihistamines assist in keeping histamine receptors blocked, while oxygen supports recovery.', correct: true },
          { text: 'Prepare to perform surgical cricothyroidotomy.', nextStepId: 'cric_wrong', feedback: 'Completely inappropriate. The airway is improving, and needle/surgical airways are absolute last resorts in pediatrics.', correct: false }
        ]
      },
      peds_complete: {
        id: 'peds_complete',
        text: 'The patient is fully stabilized, and transport is initiated. You continue to monitor closely for a potential biphasic anaphylactic reaction.',
        options: [
          { text: 'Complete scenario.', nextStepId: 'finish', feedback: 'Scenario completed successfully!', correct: true }
        ]
      }
    },
    finalSummary: 'Superb pediatric management. You recognized that IM Epinephrine in the anterolateral thigh is the first-line lifesaver for anaphylaxis, avoiding delays of IV lines or isolated nebulizer treatments.'
  },
  {
    id: 'scen-3',
    title: 'Opioid Overdose (Naloxone Titration)',
    category: 'Medical',
    difficulty: 'EMR',
    dispatch: 'Dispatch: 911 call for an unresponsive 24 YOM found in a public park restroom.',
    initialAssessment: 'The patient is unresponsive, lying supine, cyanotic around his lips, breathing is shallow, pinpoint pupils. You feel a slow, bounding radial pulse.',
    steps: {
      start: {
        id: 'start',
        text: 'With respiratory rate at 4 breaths per minute and cyanosis, what is your immediate first action?',
        vitals: { hr: '54', bp: '100/60', rr: '4', spo2: '74%' },
        options: [
          { text: 'Immediately begin ventilations with a Bag-Valve-Mask (BVM) and 100% Oxygen.', nextStepId: 'ventilated', feedback: 'Correct! Oxygenation and ventilation are the highest priorities to reverse hypoxemia and prevent respiratory arrest.', correct: true },
          { text: 'Administer Naloxone (Narcan) 4 mg Intranasally immediately.', nextStepId: 'narcan_delayed', feedback: 'Secondary priority. You must support breathing first. Patients in severe hypoxia can suffer cardiac arrest if given Naloxone without ventilations.', correct: false },
          { text: 'Perform a sternal rub and shout to check for responsiveness.', nextStepId: 'start', feedback: 'Already completed; patient is unresponsive. Do not delay life-saving ventilation.', correct: false }
        ]
      },
      narcan_delayed: {
        id: 'narcan_delayed',
        text: 'You administer Narcan first, but the patient remains cyanotic and apneic. You must support oxygenation.',
        options: [
          { text: 'Begin ventilations with BVM at 15 L/min.', nextStepId: 'ventilated', feedback: 'Correct. Ventilate immediately to raise oxygen saturation.', correct: true }
        ]
      },
      ventilated: {
        id: 'ventilated',
        text: 'After 2 minutes of effective BVM ventilations, SpO2 rises to 94%. You now prepare to administer Naloxone. What is the correct dosing philosophy under professional protocols?',
        vitals: { hr: '72', bp: '110/70', rr: 'BVM', spo2: '94%' },
        options: [
          { text: 'Administer Naloxone titrated (0.4-2mg IV/IM or 2-4mg IN) to restore adequate spontaneous respirations, NOT to fully awaken.', nextStepId: 'narcan_complete', feedback: 'Perfect! The goal is breathing, not walking. Waking the patient fully can cause acute opioid withdrawal, severe vomiting, aspiration, and violent combative behavior.', correct: true, critical: true },
          { text: 'Give the maximum possible dose to wake the patient up so they can stand up and walk to the ambulance.', nextStepId: 'narcan_combative', feedback: 'Danger! Giving high doses of Narcan instantly can precipitate severe withdrawal, vomiting, or acute combativeness, endangering the crew.', correct: false }
        ]
      },
      narcan_complete: {
        id: 'narcan_complete',
        text: 'You administer 1mg of Naloxone IN. Within 4 minutes, the patient is breathing adequately on his own at 12 breaths/min, eyes open slightly, but remains calm and sleepy.',
        options: [
          { text: 'Complete scenario.', nextStepId: 'finish', feedback: 'Scenario completed!', correct: true }
        ]
      }
    },
    finalSummary: 'Excellent. You prioritized BVM ventilations to resolve deep hypoxia first, and correctly titrated Naloxone to restore spontaneous respiration rather than triggering a dangerous, fully-awake withdrawal state.'
  },
  {
    id: 'scen-4',
    title: 'Load-and-Go Pelvis Trauma (Rendezvous)',
    category: 'Trauma',
    difficulty: 'AEMT',
    dispatch: 'Dispatch: Remote timber loading dock, 45 YOM fell 20 feet from a platform. MESI Ambulance ETA is 25 minutes.',
    initialAssessment: 'Patient is cold, clammy, and groaning. Heavy bleeding from an arm laceration is controlled. He has severe pelvic pain and a rigid abdomen.',
    steps: {
      start: {
        id: 'start',
        text: 'What are your immediate physical stabilization priorities for a suspected pelvic fracture showing signs of hemorrhagic shock?',
        vitals: { hr: '128', bp: '84/50', rr: '24', spo2: '92%' },
        options: [
          { text: 'Apply a pelvic binder or bedsheet wrap, keep him warm with blankets, and administer high-flow oxygen.', nextStepId: 'transport_decision', feedback: 'Correct. Pelvic stabilization minimizes internal bleeding. Preventing the "trauma triad of death" (hypothermia, acidosis, coagulopathy) is critical.', correct: true },
          { text: 'Attempt to walk the patient to a spine board to test stability.', nextStepId: 'pelvic_fail', feedback: 'CRITICAL FAILURE! Any movement or weight-bearing on an unstable pelvic fracture can lacerate the iliac arteries, causing fatal internal bleeding.', correct: false, critical: true }
        ]
      },
      transport_decision: {
        id: 'transport_decision',
        text: 'Pelvic binder is secured. You are on a remote logging road and MESI is still 20 minutes away. According to Three Mile Fire Department Protocol 4.2, what transport decision is authorized?',
        options: [
          { text: 'Exception A: Rendezvous Transport ("Load and Go") - Load patient into 3MF Ambulance 3040/3045 and start driving to meet MESI.', nextStepId: 'rendezvous_ops', feedback: 'Correct. Under Exception A, you are fully authorized to initiate transport to rendezvous with the incoming MESI transport crew to save precious time.', correct: true },
          { text: 'Wait on scene for 20 minutes for MESI to arrive to avoid moving the patient.', nextStepId: 'wait_fail', feedback: 'Incorrect. In severe internal bleeding, delay of transport increases mortality. You should rendezvous.', correct: false }
        ]
      },
      rendezvous_ops: {
        id: 'rendezvous_ops',
        text: 'You load the patient into Ambulance 3045. What operational communication steps must you perform immediately upon leaving?',
        options: [
          { text: 'Notify Dispatch of leaving scene, state estimated departure time, and confirm rendezvous location (e.g. Ambrose / Eastside HWY).', nextStepId: 'ops_complete', feedback: 'Exactly. Dispatch needs the exact rendezvous meeting point so they can coordinate with the incoming MESI ambulance.', correct: true },
          { text: 'Drive directly to the hospital without notifying anyone.', nextStepId: 'comms_fail', feedback: 'Incorrect. If you do not notify dispatch, MESI will drive to the scene while you are leaving, missing the rendezvous completely!', correct: false }
        ]
      },
      ops_complete: {
        id: 'ops_complete',
        text: 'You safely rendezvous with MESI at Ambrose/Eastside HWY. The paramedic crew boards, and you provide a comprehensive SBAR report.',
        options: [
          { text: 'Complete scenario.', nextStepId: 'finish', feedback: 'Scenario completed successfully!', correct: true }
        ]
      }
    },
    finalSummary: 'Outstanding operational mastery. You applied a pelvic binder, managed severe hemorrhagic shock, initiated a "Load and Go" rendezvous transport under Protocol 4.2 Exception A, and maintained flawless dispatch communications.'
  },
  {
    id: 'scen-5',
    title: 'Environmental Heat Stroke',
    category: 'Medical',
    difficulty: 'EMR',
    dispatch: 'Dispatch: 911 call for a 67 YOF collapsed at an outdoor community park picnic on a 98°F day.',
    initialAssessment: 'Patient is semi-conscious, groaning, hot, dry, and flushed to the touch. Her breathing is fast and shallow.',
    steps: {
      start: {
        id: 'start',
        text: 'After ensuring scene safety and personal BSI, what is your initial clinical priority for this patient?',
        vitals: { hr: '124', bp: '94/56', rr: '28', spo2: '95%' },
        options: [
          { text: 'Move patient to shade/air conditioning, assess responsiveness, and initiate immediate active cooling.', nextStepId: 'cooling_details', feedback: 'Correct. Move her out of the heat and cooling her down immediately is the absolute priority for Heat Stroke.', correct: true },
          { text: 'Force her to drink cold water or sports drinks immediately.', nextStepId: 'water_fail', feedback: 'CRITICAL ERROR: Forcing fluids into a semi-conscious patient can cause airway obstruction and fatal aspiration.', correct: false, critical: true },
          { text: 'Place her in a warm blanket to prevent shock.', nextStepId: 'shock_fail', feedback: 'CRITICAL ERROR: Wrapping an active hyperthermic heat stroke patient in a warm blanket prevents heat dissipation, worsening core hyperthermia.', correct: false, critical: true }
        ]
      },
      water_fail: {
        id: 'water_fail',
        text: 'The patient aspirates on the water and begins coughing weakly. Airway must be cleared. What is your cooling alternative?',
        options: [
          { text: 'Move her to shade, suction airway, and start active cooling (ice packs to groin/axillae/neck).', nextStepId: 'cooling_details', feedback: 'Correct. Move to shade and active cooling is the lifesaver.', correct: true }
        ]
      },
      shock_fail: {
        id: 'shock_fail',
        text: 'Her core temperature is estimated at 105°F. You must act immediately to cool her core.',
        options: [
          { text: 'Remove the blanket, move her to shade, and start active external cooling.', nextStepId: 'cooling_details', feedback: 'Correct. Rapid active cooling is mandatory.', correct: true }
        ]
      },
      cooling_details: {
        id: 'cooling_details',
        text: 'Patient is moved to shade. Ice packs are applied to axillae, groin, and lateral neck. What additional supportive EMR care should you initiate?',
        vitals: { hr: '118', bp: '96/58', rr: '24', spo2: '94%' },
        options: [
          { text: 'Administer high-flow supplemental oxygen and prepare for ALS transport arrival.', nextStepId: 'cooling_complete', feedback: 'Correct. High flow oxygen supports the highly-stressed hyperthermic organs and system.', correct: true },
          { text: 'Perform vigorous range of motion check on all limbs.', nextStepId: 'cooling_details', feedback: 'Incorrect. Unnecessary and delays care. Focus on oxygenation and monitoring.', correct: false }
        ]
      },
      cooling_complete: {
        id: 'cooling_complete',
        text: 'Active cooling successfully lowered estimated core temp slightly. ALS transport crew arrives on scene to assume care and initiate IV fluid cooling.',
        options: [
          { text: 'Complete scenario.', nextStepId: 'finish', feedback: 'Scenario completed successfully!', correct: true }
        ]
      }
    },
    finalSummary: 'Excellent job. You immediately recognized Heat Stroke, moved the patient to shade, applied active cooling to vascular areas, and avoided the dangerous mistake of giving oral fluids to an altered patient.'
  },
  {
    id: 'scen-6',
    title: 'Severe Bleeding Control',
    category: 'Trauma',
    difficulty: 'EMR',
    dispatch: 'Dispatch: 911 call for a 22 YOM carpenter who accidentally sliced his lower forearm with a circular saw.',
    initialAssessment: 'You find the patient pale and anxious, clutching a cloth over his left arm. Crimson, bright red blood is rapidly spurting from the wound, quickly soaking the cloth.',
    steps: {
      start: {
        id: 'start',
        text: 'With rapid, spurting bright red bleeding (arterial), what is your first immediate intervention?',
        vitals: { hr: '116', bp: '108/70', rr: '22', spo2: '96%' },
        options: [
          { text: 'Apply firm, direct pressure over the wound using sterile gauze or a clean dressing.', nextStepId: 'pressure_applied', feedback: 'Correct. Direct pressure is the first line of intervention for external hemorrhage.', correct: true },
          { text: 'Apply a combat tourniquet to the arm right away.', nextStepId: 'pressure_applied', feedback: 'Direct pressure is usually first, but rapid tourniquet is acceptable if massive arterial spurting is unchecked.', correct: true },
          { text: 'Elevate the arm above the head without applying pressure.', nextStepId: 'bleeding_worsens', feedback: 'Incorrect. Elevation alone is ineffective for severe arterial bleeding and delays direct compression.', correct: false }
        ]
      },
      bleeding_worsens: {
        id: 'bleeding_worsens',
        text: 'CRITICAL FAILURE: The patient is losing more blood due to delayed compression. You must halt this bleeding now!',
        options: [
          { text: 'Apply immediate, forceful direct pressure over the wound.', nextStepId: 'pressure_applied', feedback: 'Correct. Direct pressure applied.', correct: true }
        ]
      },
      pressure_applied: {
        id: 'pressure_applied',
        text: 'Direct pressure is maintained for 2 minutes, but blood continues to soak through the thick dressings and pool on the floor. What is your next line of action?',
        vitals: { hr: '124', bp: '94/62', rr: '24', spo2: '93%' },
        options: [
          { text: 'Apply a high-and-tight combat tourniquet to the upper arm and crank windlass until bleeding stops.', nextStepId: 'tourniquet_applied', feedback: 'Correct! When direct pressure fails on an extremity, apply a tourniquet proximal to the injury.', correct: true, critical: true },
          { text: 'Add more gauze pads on top of the soaked gauze and continue direct pressure.', nextStepId: 'shock_approaching', feedback: 'Incorrect. Adding more gauze is ineffective and delays definitive control; the patient is entering hemorrhagic shock.', correct: false }
        ]
      },
      shock_approaching: {
        id: 'shock_approaching',
        text: 'The bleeding continues to soak through and the patient shows signs of shock: skin is cold, pale, and clammy. You must halt this bleeding now!',
        options: [
          { text: 'Apply a combat tourniquet proximal to the wound on the upper arm.', nextStepId: 'tourniquet_applied', feedback: 'Correct. Tourniquet applied proximal to injury.', correct: true, critical: true }
        ]
      },
      tourniquet_applied: {
        id: 'tourniquet_applied',
        text: 'Tourniquet is secured and cranked. Spurting bleeding halts completely and the distal radial pulse is no longer palpable. What are your next EMR actions?',
        vitals: { hr: '128', bp: '88/54', rr: '26', spo2: '91%' },
        options: [
          { text: 'Write the time of application on the tourniquet band, wrap patient in blankets to prevent hypothermia, lay him flat, and administer oxygen.', nextStepId: 'bleeding_complete', feedback: 'Correct! Shock management and recording application time are critical subsequent actions.', correct: true },
          { text: 'Loosen the tourniquet every 5 minutes to let the tissue breathe.', nextStepId: 'tourniquet_loosen', feedback: 'CRITICAL ERROR: Once a tourniquet is applied, NEVER loosen or remove it in the prehospital environment. Doing so can cause sudden shock.', correct: false, critical: true }
        ]
      },
      tourniquet_loosen: {
        id: 'tourniquet_loosen',
        text: 'The tourniquet is loosened and bleeding immediately re-starts aggressively. Re-tighten it now!',
        options: [
          { text: 'Re-tighten tourniquet and treat patient for hypoperfusion/shock.', nextStepId: 'bleeding_complete', feedback: 'Correct. Re-secured.', correct: true }
        ]
      },
      bleeding_complete: {
        id: 'bleeding_complete',
        text: 'Hemorrhage is controlled, shock therapy is active, and transport EMTs have arrived to assume care.',
        options: [
          { text: 'Complete scenario.', nextStepId: 'finish', feedback: 'Scenario completed successfully!', correct: true }
        ]
      }
    },
    finalSummary: 'Excellent bleed control management. You correctly started with direct pressure, quickly transitioned to a tourniquet when pressure failed, secured it until bleeding stopped, treated for shock, and marked the application time.'
  },
  {
    id: 'scen-7',
    title: 'Respiratory Distress (Asthma)',
    category: 'Respiratory',
    difficulty: 'EMT',
    dispatch: 'Dispatch: 911 call for an 18 YOF experiencing severe breathing difficulties at her high school gym.',
    initialAssessment: 'You find the patient sitting in a tripod position, struggling to speak. You hear audible expiratory wheezing. She is using neck accessory muscles to breathe.',
    steps: {
      start: {
        id: 'start',
        text: 'With severe expiratory wheezing, tachypnea, and tripod position, what is your initial assessment and first medication action?',
        vitals: { hr: '118', bp: '130/82', rr: '28', spo2: '87%' },
        options: [
          { text: 'Administer Albuterol 2.5 mg nebulized with oxygen flowing at 6-8 L/min.', nextStepId: 'albuterol_admin', feedback: 'Correct. Inhaled beta-2 agonist (Albuterol) is the primary first-line EMT intervention for bronchospasm.', correct: true },
          { text: 'Immediately administer Epinephrine 0.3 mg IM.', nextStepId: 'epi_first_fail', feedback: 'Incorrect. Epinephrine is a secondary rescue drug reserved for when nebulizers fail or the patient is in extremis.', correct: false },
          { text: 'Set up a Bag-Valve-Mask and force positive pressure ventilations.', nextStepId: 'bvm_first_fail', feedback: 'Incorrect. Patient is conscious, alert, and protecting her airway. BVM ventilation is highly distressing and unnecessary at this stage.', correct: false }
        ]
      },
      epi_first_fail: {
        id: 'epi_first_fail',
        text: 'Epinephrine is withheld for now. Try nebulized bronchodilation first.',
        options: [
          { text: 'Administer Albuterol 2.5 mg via nebulizer.', nextStepId: 'albuterol_admin', feedback: 'Correct. Albuterol nebulizer initiated.', correct: true }
        ]
      },
      bvm_first_fail: {
        id: 'bvm_first_fail',
        text: 'You decide against BVM. Try a non-invasive bronchodilator first.',
        options: [
          { text: 'Administer Albuterol 2.5 mg via nebulizer.', nextStepId: 'albuterol_admin', feedback: 'Correct. Albuterol nebulizer initiated.', correct: true }
        ]
      },
      albuterol_admin: {
        id: 'albuterol_admin',
        text: 'Albuterol is administered. After 10 minutes, there is minimal improvement. The wheezing has become quieter, but her work of breathing is increasing and she is becoming lethargic. What is your next protocol-driven step?',
        vitals: { hr: '122', bp: '124/76', rr: '30', spo2: '85%' },
        options: [
          { text: 'Administer Epinephrine 0.3 mg IM (1:1,000) in the lateral thigh to induce rapid bronchodilation.', nextStepId: 'asthma_complete', feedback: 'Correct! Epinephrine IM is indicated when severe refractory bronchospasm shows signs of respiratory failure.', correct: true, critical: true },
          { text: 'Perform another Albuterol treatment and wait.', nextStepId: 'asthma_worsens', feedback: 'Incorrect. Delaying Epinephrine IM during impending respiratory arrest can be fatal.', correct: false }
        ]
      },
      asthma_worsens: {
        id: 'asthma_worsens',
        text: 'The patient is slipping into respiratory failure. You cannot delay epinephrine!',
        options: [
          { text: 'Administer Epinephrine 0.3 mg IM immediately.', nextStepId: 'asthma_complete', feedback: 'Correct. Epinephrine IM is given.', correct: true, critical: true }
        ]
      },
      asthma_complete: {
        id: 'asthma_complete',
        text: 'Within minutes of Epinephrine IM, the severe bronchospasm breaks. Airway resistance drops, wheezing resolves, and SpO2 rises. You initiate rapid transport.',
        vitals: { hr: '128', bp: '132/80', rr: '18', spo2: '96%' },
        options: [
          { text: 'Complete scenario.', nextStepId: 'finish', feedback: 'Scenario completed!', correct: true }
        ]
      }
    },
    finalSummary: 'Excellent work. You correctly identified bronchospasm, started with Albuterol nebulization, recognized when the patient failed to improve, and timely administered Epinephrine IM to prevent respiratory arrest.'
  },
  {
    id: 'scen-8',
    title: 'Hypoglycemic Crisis',
    category: 'Medical',
    difficulty: 'EMT',
    dispatch: 'Dispatch: 911 call for a 32 YOM diabetic patient acting erratically and aggressively in a grocery store parking lot.',
    initialAssessment: 'The patient is sitting on a curb, sweating profusely, pale, confused, and speaking incoherently. He is defensive but not physically hostile.',
    steps: {
      start: {
        id: 'start',
        text: 'What is your initial diagnostic priority for an altered patient with a known history of diabetes?',
        vitals: { hr: '106', bp: '128/78', rr: '18', spo2: '97%' },
        options: [
          { text: 'Measure his Blood Glucose Level (BGL) using a glucometer.', nextStepId: 'bgl_measured', feedback: 'Correct! Measuring BGL is the vital diagnostic tool to confirm hypoglycemia.', correct: true },
          { text: 'Administer Oral Glucose immediately without checking BGL.', nextStepId: 'bgl_measured', feedback: 'Checking BGL first is important to confirm, though giving glucose is safe if hypoglycemia is suspected.', correct: true },
          { text: 'Call law enforcement for a psychiatric hold.', nextStepId: 'psych_fail', feedback: 'CRITICAL FAULT: Altered mental status in diabetics is a highly common mimic of psychiatric emergency. Check BGL first.', correct: false }
        ]
      },
      psych_fail: {
        id: 'psych_fail',
        text: 'You realize it could be hypoglycemia. What is your next move?',
        options: [
          { text: 'Perform a finger-stick blood glucose measurement.', nextStepId: 'bgl_measured', feedback: 'Correct. Glucometer check initiated.', correct: true }
        ]
      },
      bgl_measured: {
        id: 'bgl_measured',
        text: 'The glucometer reads 42 mg/dL, confirming severe hypoglycemia. The patient is confused but is conscious, sitting up, and has an active gag reflex. What is the correct EMT protocol action?',
        vitals: { hr: '108', bp: '126/74', rr: '16', spo2: '98%' },
        options: [
          { text: 'Administer 15 grams (one tube) of Oral Glucose paste into the pocket between his cheek and gum.', nextStepId: 'glucose_admin', feedback: 'Correct. Oral glucose is safe and indicated here because the patient is conscious and able to swallow.', correct: true },
          { text: 'Attempt to administer Glucagon 1mg IV push.', nextStepId: 'glucagon_fail', feedback: 'Incorrect. Glucagon is not an IV push drug for EMTs, and the patient has an active gag reflex.', correct: false }
        ]
      },
      glucagon_fail: {
        id: 'glucagon_fail',
        text: 'You decide to use the oral route. What is the correct dosage and administration?',
        options: [
          { text: 'Administer Oral Glucose paste (15 grams).', nextStepId: 'glucose_admin', feedback: 'Correct.', correct: true }
        ]
      },
      glucose_admin: {
        id: 'glucose_admin',
        text: 'Oral glucose is swallowed. After 10 minutes, the patient\'s mental status begins to clear. He is now oriented x 4, sweating has stopped, and his blood sugar reads 92 mg/dL. What is your final duty?',
        vitals: { hr: '84', bp: '120/80', rr: '14', spo2: '99%' },
        options: [
          { text: 'Offer food high in complex carbohydrates/protein, explain the risks of refusal, and document care.', nextStepId: 'hypo_complete', feedback: 'Correct! Offering food is vital to prevent rebound hypoglycemia as the simple glucose is rapidly burned.', correct: true },
          { text: 'Release the patient immediately without further evaluation or documentation.', nextStepId: 'refusal_fail', feedback: 'Incorrect. Diabetics who recover on scene must be offered food and fully documented before release.', correct: false }
        ]
      },
      refusal_fail: {
        id: 'refusal_fail',
        text: 'You must properly complete the call. What actions do you take?',
        options: [
          { text: 'Provide food, evaluate for full refusal capacity, and document.', nextStepId: 'hypo_complete', feedback: 'Correct.', correct: true }
        ]
      },
      hypo_complete: {
        id: 'hypo_complete',
        text: 'Patient is fully recovered and declines transport. A complete refusal of care is documented with full decision-making capacity.',
        options: [
          { text: 'Complete scenario.', nextStepId: 'finish', feedback: 'Scenario completed!', correct: true }
        ]
      }
    },
    finalSummary: 'Splendid medical management. You checked blood glucose, verified airway reflexes, safely administered oral glucose, monitored full recovery, and completed the refusal process appropriately.'
  },
  {
    id: 'scen-9',
    title: 'Diabetic Ketoacidosis & IO Access',
    category: 'Medical',
    difficulty: 'AEMT',
    dispatch: 'Dispatch: 911 call for a 25 YOF found semi-conscious and breathing heavily inside her apartment.',
    initialAssessment: 'The patient is lying in bed, responsive only to painful stimuli. Her breathing is extremely deep and fast, and you note a distinct fruity/sweet odor on her breath.',
    steps: {
      start: {
        id: 'start',
        text: 'Given the deep rapid breathing (Kussmaul) and fruity breath odor, what condition do you suspect, and what is your first diagnostic action?',
        vitals: { hr: '128', bp: '84/50', rr: '34', spo2: '92%' },
        options: [
          { text: 'Suspect Diabetic Ketoacidosis (DKA); check blood glucose and assess peripheral perfusion.', nextStepId: 'dka_bgl', feedback: 'Correct! Kussmaul respirations and fruity odor indicate DKA. Rapid assessment of BGL is primary.', correct: true },
          { text: 'Suspect acute opioid overdose; administer Naloxone 2mg IM.', nextStepId: 'dka_narcan_fail', feedback: 'Incorrect. Opioid overdoses present with slow, shallow breathing (bradypnea) and pinpoint pupils, not rapid deep breathing.', correct: false }
        ]
      },
      dka_narcan_fail: {
        id: 'dka_narcan_fail',
        text: 'Naloxone is ineffective. What is the appropriate diagnostic approach?',
        options: [
          { text: 'Check blood sugar and perfusion.', nextStepId: 'dka_bgl', feedback: 'Correct. BGL checked.', correct: true }
        ]
      },
      dka_bgl: {
        id: 'dka_bgl',
        text: 'The glucometer reads "HIGH" (>500 mg/dL). Vitals show deep hypovolemia and shock. Peripheral veins are completely collapsed and you fail to obtain a peripheral IV. What is your next vascular access action?',
        vitals: { hr: '132', bp: '80/46', rr: '36', spo2: '91%' },
        options: [
          { text: 'Perform Intraosseous (IO) access in the proximal tibia to establish a rapid fluid line.', nextStepId: 'dka_io', feedback: 'Correct! When peripheral IV access fails in severe shock/dehydration, IO access is indicated.', correct: true, critical: true },
          { text: 'Keep trying for a peripheral IV in the neck.', nextStepId: 'iv_delay_fail', feedback: 'CRITICAL DELAY: Collapsed shock veins will not yield easily. Delaying fluid resuscitation in severe DKA is highly dangerous.', correct: false }
        ]
      },
      iv_delay_fail: {
        id: 'iv_delay_fail',
        text: 'The patient is deteriorating. You must establish rapid vascular access immediately.',
        options: [
          { text: 'Establish an IO line in the proximal tibia.', nextStepId: 'dka_io', feedback: 'Correct. IO access initiated.', correct: true, critical: true }
        ]
      },
      dka_io: {
        id: 'dka_io',
        text: 'IO catheter is successfully placed in the tibial cortex. The patient is semi-conscious and groans. How should you proceed before infusing fluids?',
        vitals: { hr: '130', bp: '82/48', rr: '32', spo2: '92%' },
        options: [
          { text: 'Aspirate a small amount of marrow, flush with 2% Lidocaine 20-40mg slow for anesthetic effect, then initiate a 20 mL/kg Normal Saline bolus.', nextStepId: 'dka_complete', feedback: 'Correct. Conscious patients experience intense pain during IO pressure flushes; Lidocaine is highly recommended for pain control first.', correct: true },
          { text: 'Connect the fluid line and run normal saline wide open immediately without flushing Lidocaine.', nextStepId: 'pain_fail', feedback: 'Conscious or semi-conscious patients experience intense pain during IO pressure flushes; Lidocaine is highly recommended.', correct: true }
        ]
      },
      pain_fail: {
        id: 'pain_fail',
        text: 'Lidocaine is administered to control the intense pressure-pain. The fluid line is now secured and running.',
        options: [
          { text: 'Continue Normal Saline bolus and transport.', nextStepId: 'dka_complete', feedback: 'Correct.', correct: true }
        ]
      },
      dka_complete: {
        id: 'dka_complete',
        text: 'You successfully infuse 1 Liter of Normal Saline. BP improves to 96/60, and patient is stabilized for transport to the emergency department.',
        vitals: { hr: '112', bp: '96/60', rr: '28', spo2: '94%' },
        options: [
          { text: 'Complete scenario.', nextStepId: 'finish', feedback: 'Scenario completed!', correct: true }
        ]
      }
    },
    finalSummary: 'Excellent advanced clinical execution. You identified DKA and hypovolemic shock, successfully pivoted to IO access when IV failed, managed infusion pain with Lidocaine, and rehydrated the patient effectively.'
  },
  {
    id: 'scen-10',
    title: 'Symptomatic Bradycardia',
    category: 'Cardiac',
    difficulty: 'AEMT',
    dispatch: 'Dispatch: 911 call for a 72 YOM complaining of sudden onset chest pressure and extreme dizziness at home.',
    initialAssessment: 'You find the patient sitting on a couch, pale, diaphoretic, and speaking in weak, single words. You feel a very slow, regular radial pulse.',
    steps: {
      start: {
        id: 'start',
        text: 'With severe bradycardia and hypotension, what is your initial diagnostic action?',
        vitals: { hr: '32', bp: '80/42', rr: '18', spo2: '91%' },
        options: [
          { text: 'Place 4-Lead EKG electrodes to obtain a diagnostic rhythm strip.', nextStepId: 'ekg_rhythm', feedback: 'Correct! EKG is necessary to identify the exact block and direct treatment.', correct: true },
          { text: 'Administer Albuterol nebulized to increase heart rate.', nextStepId: 'albuterol_brady_fail', feedback: 'Incorrect. Albuterol is a bronchodilator, not an antiarrhythmic. You need to obtain a diagnostic EKG first.', correct: false }
        ]
      },
      albuterol_brady_fail: {
        id: 'albuterol_brady_fail',
        text: 'You decide to obtain an EKG first. What are your steps?',
        options: [
          { text: 'Place EKG electrodes and run a Lead II strip.', nextStepId: 'ekg_rhythm', feedback: 'Correct.', correct: true }
        ]
      },
      ekg_rhythm: {
        id: 'ekg_rhythm',
        text: 'The EKG reveals a Third-Degree AV Block (Complete Heart Block) with ventricular escape rate of 32 bpm. The patient is pale, diaphoretic, and hypotensive. What is the first-line pharmacologic drug for bradycardia under protocols, and what are its limits?',
        vitals: { hr: '32', bp: '78/40', rr: '20', spo2: '91%' },
        options: [
          { text: 'Administer Atropine Sulfate 1 mg IV push, but recognize that Atropine is rarely effective in high-degree AV blocks and prepare Transcutaneous Pacing (TCP) pads immediately.', nextStepId: 'pacing_prep', feedback: 'Correct! Atropine works by block acetylcholine at the AV node. In 3rd-degree block, the block is infranodal, so Atropine is rarely effective; TCP is primary.', correct: true, critical: true },
          { text: 'Administer Atropine 1 mg and wait 15 minutes to see if it works.', nextStepId: 'atropine_delay_fail', feedback: 'CRITICAL DELAY: Atropine will not easily cross an infranodal third-degree block. Waiting without preparing transcutaneous pacing can cause cardiac arrest!', correct: false }
        ]
      },
      atropine_delay_fail: {
        id: 'atropine_delay_fail',
        text: 'The patient is losing consciousness. You must initiate electrical pacing immediately.',
        options: [
          { text: 'Administer Atropine but immediately apply pacing pads.', nextStepId: 'pacing_prep', feedback: 'Correct.', correct: true, critical: true }
        ]
      },
      pacing_prep: {
        id: 'pacing_prep',
        text: 'Pacing pads are applied to the chest (anterior/posterior configuration). Atropine is given with no heart rate change. How do you configure and initiate Transcutaneous Pacing?',
        vitals: { hr: '32', bp: '76/38', rr: '20', spo2: '91%' },
        options: [
          { text: 'Set pacer rate to 60-70 ppm, increase current (mA) until electrical and mechanical capture (pulse matches pacer) are confirmed, and consider fentanyl/midazolam for pacing pain.', nextStepId: 'pacing_complete', feedback: 'Correct! Electrical capture (wide QRS and T-waves after pacer spike) and mechanical capture (correlating femoral pulse) are vital.', correct: true },
          { text: 'Turn on the pacer to maximum current without checking for a femoral pulse.', nextStepId: 'pacer_blind_fail', feedback: 'Incorrect. You must confirm mechanical capture by checking a pulse, and ensure pain management as pacing is extremely painful.', correct: false }
        ]
      },
      pacer_blind_fail: {
        id: 'pacer_blind_fail',
        text: 'Pacing is active, capture is verified, and patient is sedated for comfort.',
        options: [
          { text: 'Prepare for immediate transport.', nextStepId: 'pacing_complete', feedback: 'Correct.', correct: true }
        ]
      },
      pacing_complete: {
        id: 'pacing_complete',
        text: 'Mechanical capture is achieved at 65 bpm, BP stabilizes to 102/66, and patient is safely transferred to hospital emergency crew.',
        options: [
          { text: 'Complete scenario.', nextStepId: 'finish', feedback: 'Scenario completed successfully!', correct: true }
        ]
      }
    },
    finalSummary: 'Excellent clinical execution. You diagnosed 3rd degree AV block, recognized the limits of Atropine, pre-applied pacing pads, successfully initiated transcutaneous pacing with capture verification, and provided comfort sedation.'
  },
  {
    id: 'scen-11',
    title: 'Pediatric Anaphylaxis (Classic)',
    category: 'Pediatric',
    difficulty: 'EMT',
    dispatch: 'Dispatch: Emergency call for a 5 YOF at a playground who was stung by an insect and is now breaking out in hives and breathing rapidly.',
    initialAssessment: 'You find a 5-year-old female sitting on her mother\'s lap. She is crying, scratching herself, and breathing at 28 breaths per minute with audible expiratory wheezes. Skin is warm and covered with generalized urticaria (hives).',
    steps: {
      start: {
        id: 'start',
        text: 'After verifying scene safety and securing BSI, you perform a primary assessment. The child has no stridor, but has prominent expiratory wheezing and generalized hives. What is your immediate clinical decision?',
        vitals: { hr: '124', bp: '90/58', rr: '28', spo2: '93%' },
        options: [
          { text: 'Administer Epinephrine 1:1,000 (1 mg/mL) - 0.15 mg IM (Intramuscular) in the anterolateral thigh.', nextStepId: 'epi_given', feedback: 'Excellent. For pediatric anaphylaxis (involving at least 2 body systems: skin hives and respiratory wheezing), Epinephrine 0.15 mg IM is the absolute first-line therapy.', correct: true, critical: true },
          { text: 'Administer Albuterol 2.5 mg nebulized first to treat the wheezing.', nextStepId: 'wrong_nebulizer', feedback: 'Incorrect. While Albuterol treats bronchospasm, it will not prevent or treat systemic anaphylactic collapse. Epinephrine must always be given first when multiple systems are involved.', correct: false },
          { text: 'Provide Diphenhydramine 25 mg orally and monitor.', nextStepId: 'wrong_oral', feedback: 'Incorrect. Oral medication works too slowly, and Diphenhydramine is a secondary treatment that does not resolve bronchospasm or edema. Give Epinephrine IM.', correct: false }
        ]
      },
      wrong_nebulizer: {
        id: 'wrong_nebulizer',
        text: 'As you set up, the child\'s coughing increases, she becomes more agitated, and hives spread to her face. SpO2 drops to 90%. What must you do immediately?',
        options: [
          { text: 'Give Epinephrine 0.15 mg IM in the outer thigh.', nextStepId: 'epi_given', feedback: 'Correct. Epinephrine is the definitive lifesaver.', correct: true, critical: true }
        ]
      },
      wrong_oral: {
        id: 'wrong_oral',
        text: 'Oral medications take too long to absorb, and the child\'s work of breathing is worsening. You need immediate action!',
        options: [
          { text: 'Give Epinephrine 0.15 mg IM in the outer thigh.', nextStepId: 'epi_given', feedback: 'Correct. Epinephrine IM is the absolute priority.', correct: true, critical: true }
        ]
      },
      epi_given: {
        id: 'epi_given',
        text: 'Within 5 minutes of Epinephrine IM, the patient\'s breathing calms, wheezing is significantly reduced, and SpO2 improves. What is your next step in managing this child?',
        vitals: { hr: '136', bp: '96/62', rr: '20', spo2: '97%' },
        options: [
          { text: 'Administer supplemental blow-by oxygen at 6 L/min, prepare Diphenhydramine 1 mg/kg if authorized, and begin rapid transport with continuous monitoring.', nextStepId: 'classic_complete', feedback: 'Correct! Supplemental oxygen, secondary antihistamines (such as Diphenhydramine), and continuous assessment are excellent supportive care.', correct: true },
          { text: 'Declare the patient fully recovered and recommend they stay home.', nextStepId: 'classic_refusal_fail', feedback: 'Incorrect. Anaphylaxis patients MUST be transported to an emergency department due to the high risk of a biphasic reaction.', correct: false }
        ]
      },
      classic_refusal_fail: {
        id: 'classic_refusal_fail',
        text: 'You explain the critical risks of refusal, including life-threatening recurrence. The mother agrees to transport. How do you proceed?',
        options: [
          { text: 'Provide supportive oxygen and initiate immediate transport.', nextStepId: 'classic_complete', feedback: 'Correct.', correct: true }
        ]
      },
      classic_complete: {
        id: 'classic_complete',
        text: 'The child remains stable and cooperative during transport. You hand over the patient to the hospital ER staff.',
        options: [
          { text: 'Complete scenario.', nextStepId: 'finish', feedback: 'Scenario completed successfully!', correct: true }
        ]
      }
    },
    finalSummary: 'Outstanding job. You recognized that involvement of two body systems (hives and wheezing) dictates immediate Epinephrine 0.15 mg IM. You avoided delaying with oral medications or isolated nebulizers, and initiated appropriate supportive transport.'
  },
  {
    id: 'scen-12',
    title: 'Pediatric Anaphylaxis (Biphasic Recurrence)',
    category: 'Pediatric',
    difficulty: 'EMT',
    dispatch: 'Dispatch: Emergency call for an 8 YOF who ate peanut cookies. Parents administered her home EpiPen (0.15 mg) 20 minutes ago. She initially improved, but breathing is worsening again.',
    initialAssessment: 'You find an 8-year-old girl sitting up in bed. She initially felt better after her auto-injector, but her coughing has returned, she is anxious, has cold clammy skin, and you hear audible laryngeal stridor.',
    steps: {
      start: {
        id: 'start',
        text: 'The patient initially improved but is now showing a rapid recurrence of severe airway swelling (biphasic reaction). What is your immediate course of action?',
        vitals: { hr: '142', bp: '82/50', rr: '30', spo2: '90%' },
        options: [
          { text: 'Administer a second dose of Epinephrine 1:1,000 - 0.15 mg IM in the opposite outer thigh.', nextStepId: 'second_epi_given', feedback: 'Perfect! Protocols authorize a second dose of IM Epinephrine (after 5-15 minutes) if severe symptoms of anaphylaxis persist or recur.', correct: true, critical: true },
          { text: 'Wait for ALS backup to arrive on scene to give any further medications.', nextStepId: 'wait_als_fail', feedback: 'CRITICAL DELAY: Airway closure from biphasic anaphylaxis can cause asphyxiation. You must not wait for ALS backup to administer a life-saving second dose of Epinephrine.', correct: false, critical: true },
          { text: 'Apply a non-rebreather mask and start transport without further drugs.', nextStepId: 'wait_als_fail', feedback: 'Incorrect. Oxygen alone will not reverse the laryngeal edema closing her airway. You need to administer Epinephrine.', correct: false }
        ]
      },
      wait_als_fail: {
        id: 'wait_als_fail',
        text: 'The patient\'s stridor worsens, and she starts to struggle for air. You must act right now!',
        options: [
          { text: 'Administer a second dose of Epinephrine 0.15 mg IM immediately.', nextStepId: 'second_epi_given', feedback: 'Correct. Re-dosing Epinephrine IM is the absolute priority.', correct: true, critical: true }
        ]
      },
      second_epi_given: {
        id: 'second_epi_given',
        text: 'The second dose of Epinephrine IM is administered. Within 3 minutes, the stridor softens, and her SpO2 rises. You load the patient into the ambulance. How do you manage her during transport?',
        vitals: { hr: '148', bp: '94/60', rr: '22', spo2: '96%' },
        options: [
          { text: 'Administer high-flow oxygen, monitor vitals every 5 minutes, and prepare for a potential airway rescue if symptoms recur again.', nextStepId: 'biphasic_complete', feedback: 'Excellent. Continuous reassessment is critical since she has already demonstrated a biphasic recurrence.', correct: true },
          { text: 'Allow her to sleep deeply without checking her vitals to let her rest.', nextStepId: 'biphasic_sleep_fail', feedback: 'Dangerous! An altered or resting state can easily mask progressive respiratory depression or airway closure. Monitor her closely.', correct: false }
        ]
      },
      biphasic_sleep_fail: {
        id: 'biphasic_sleep_fail',
        text: 'You realize that close monitoring is required. You resume regular assessments and supportive oxygenation.',
        options: [
          { text: 'Continue close transport monitoring.', nextStepId: 'biphasic_complete', feedback: 'Correct.', correct: true }
        ]
      },
      biphasic_complete: {
        id: 'biphasic_complete',
        text: 'The patient arrives safely at the emergency department. You deliver a precise handover report detailing both Epinephrine administrations.',
        options: [
          { text: 'Complete scenario.', nextStepId: 'finish', feedback: 'Scenario completed!', correct: true }
        ]
      }
    },
    finalSummary: 'Outstanding clinical decision making. You recognized a classic biphasic anaphylactic reaction, correctly administered a life-saving second dose of IM Epinephrine when laryngeal stridor returned, and maintained high vigilance during transport.'
  },
  {
    id: 'scen-13',
    title: 'Pediatric Anaphylaxis (Refractory Shock & IO)',
    category: 'Pediatric',
    difficulty: 'AEMT',
    dispatch: 'Dispatch: 911 call for a 3 YOF with severe swelling and breathing difficulty after taking an oral antibiotic syrup.',
    initialAssessment: 'You find a 3-year-old girl lying in her crib. She is lethargic, pale, with severe periorbital and lip swelling. Breathing is extremely shallow, with poor chest rise, and you hear a quiet, gasping stridor. Peripheral pulses are threadlike and weak.',
    steps: {
      start: {
        id: 'start',
        text: 'The child is in severe, decompensated anaphylactic shock with impending respiratory failure. What is your first immediate therapeutic action?',
        vitals: { hr: '160', bp: '62/34', rr: '36', spo2: '82%', gcs: '9' },
        options: [
          { text: 'Immediately administer Epinephrine 1:1,000 - 0.15 mg IM in the lateral thigh.', nextStepId: 'shock_epi_given', feedback: 'Correct! IM Epinephrine is the primary drug for any level of anaphylaxis, even in shock. Do not delay for vascular access.', correct: true, critical: true },
          { text: 'Attempt to establish a peripheral IV line in her hand to give IV fluids.', nextStepId: 'shock_iv_delay', feedback: 'Incorrect. In profound shock, peripheral veins collapse, making IV insertion slow and difficult. Delaying Epinephrine to search for a vein is highly dangerous.', correct: false },
          { text: 'Set up a pediatric bag-valve-mask and begin ventilations.', nextStepId: 'shock_bvm_delay', feedback: 'BVM is a secondary airway support, but without Epinephrine to decrease the laryngeal edema and support cardiac output, ventilations will be highly resistant and ineffective.', correct: false }
        ]
      },
      shock_iv_delay: {
        id: 'shock_iv_delay',
        text: 'The child\'s heart rate is climbing, and she is becoming unresponsive. You must administer the rescue drug immediately!',
        options: [
          { text: 'Administer Epinephrine 0.15 mg IM in the outer thigh.', nextStepId: 'shock_epi_given', feedback: 'Correct. Epinephrine IM given.', correct: true, critical: true }
        ]
      },
      shock_bvm_delay: {
        id: 'shock_bvm_delay',
        text: 'Ventilations are resisting due to airway closure. Administer Epinephrine first to relieve the swelling!',
        options: [
          { text: 'Administer Epinephrine 0.15 mg IM in the outer thigh.', nextStepId: 'shock_epi_given', feedback: 'Correct. Epinephrine IM given.', correct: true, critical: true }
        ]
      },
      shock_epi_given: {
        id: 'shock_epi_given',
        text: 'IM Epinephrine is given. 5 minutes later, there is minimal improvement; she remains profoundly hypotensive, cyanotic, and unresponsive. You must establish vascular access immediately. You attempt a peripheral IV once and fail. What is your next move?',
        vitals: { hr: '168', bp: '58/30', rr: '12', spo2: '80%', gcs: '6' },
        options: [
          { text: 'Establish an Intraosseous (IO) line in her proximal tibia to initiate fluid resuscitation.', nextStepId: 'shock_io_established', feedback: 'Excellent. When peripheral IV access fails in a decompensating pediatric shock patient, an IO line must be established immediately.', correct: true, critical: true },
          { text: 'Attempt another peripheral IV in her other hand.', nextStepId: 'shock_iv_fail_twice', feedback: 'Incorrect. Repeated peripheral IV attempts in collapsed pediatric shock are low-yield and delay fluid support. Go to IO.', correct: false }
        ]
      },
      shock_iv_fail_twice: {
        id: 'shock_iv_fail_twice',
        text: 'Vascular access is a matter of life or death. You must utilize the IO route!',
        options: [
          { text: 'Perform proximal tibia IO access.', nextStepId: 'shock_io_established', feedback: 'Correct. Tibial IO established.', correct: true, critical: true }
        ]
      },
      shock_io_established: {
        id: 'shock_io_established',
        text: 'The tibial IO is successfully established. What fluid therapy and auxiliary medication should you initiate immediately through the IO line?',
        vitals: { hr: '158', bp: '54/28', rr: '10', spo2: '82%', gcs: '6' },
        options: [
          { text: 'Administer a 20 mL/kg Normal Saline bolus under pressure, and prepare a second dose of IM Epinephrine (or continuous epinephrine infusion if authorized).', nextStepId: 'shock_complete', feedback: 'Excellent! Aggressive fluid resuscitation (20 mL/kg isotonic crystalloid boluses) is vital to treat the severe vasodilation of anaphylaxis, and refractory shock requires redosing Epinephrine.', correct: true },
          { text: 'Infuse Dextrose 50% (D50) 25 grams wide open.', nextStepId: 'shock_d50_fail', feedback: 'Incorrect. D50 is highly hypertonic and completely contraindicated through an IO without checking BGL. The primary issue is anaphylactic shock requiring Normal Saline, not hypoglycemia.', correct: false }
        ]
      },
      shock_d50_fail: {
        id: 'shock_d50_fail',
        text: 'You correct your course. You initiate the 20 mL/kg Normal Saline bolus and support respirations.',
        options: [
          { text: 'Run the Normal Saline bolus and assist ventilations with BVM.', nextStepId: 'shock_complete', feedback: 'Correct.', correct: true }
        ]
      },
      shock_complete: {
        id: 'shock_complete',
        text: 'Following the 20 mL/kg NS bolus and assisted BVM ventilation, her blood pressure rises to 82/52, spontaneous respirations improve, and her color pinks up. You initiate rapid transport to the trauma center.',
        options: [
          { text: 'Complete scenario.', nextStepId: 'finish', feedback: 'Scenario completed successfully!', correct: true }
        ]
      }
    },
    finalSummary: 'Outstanding advanced pediatric management. You recognized decompensated anaphylactic shock, administered immediate IM Epinephrine, pivoted quickly to tibial IO access when peripheral veins failed, and executed a critical 20 mL/kg fluid bolus to reverse profound vasodilation.'
  },
  {
    id: 'scen-14',
    title: 'Pediatric Anaphylaxis (Airway Obstruction)',
    category: 'Pediatric',
    difficulty: 'AEMT',
    dispatch: 'Dispatch: Emergency call for a 10-year-old male who ate shrimp at a restaurant and is now in extreme respiratory distress.',
    initialAssessment: 'You find a 10-year-old boy sitting upright, gasping silently. He is cyanotic around the lips, and his throat shows deep suprasternal retractions. He cannot speak or cough, and chest auscultation reveals almost completely silent breath sounds.',
    steps: {
      start: {
        id: 'start',
        text: 'The patient is moving almost no air, demonstrating "silent chest" due to extreme laryngeal swelling. What is your immediate priority?',
        vitals: { hr: '150', bp: '88/54', rr: '38', spo2: '74%', gcs: '11' },
        options: [
          { text: 'Immediately administer Epinephrine 1:1,000 (1 mg/mL) - 0.3 mg IM in the outer thigh.', nextStepId: 'severe_epi_given', feedback: 'Correct! For a 10-year-old (typically >30 kg), the standard adult/pediatric-high dose of 0.3 mg IM Epinephrine is indicated. This is critical to shrink severe upper airway swelling.', correct: true, critical: true },
          { text: 'Perform an immediate surgical cricothyroidotomy.', nextStepId: 'severe_cric_fail', feedback: 'Incorrect. Surgical cricothyroidotomy is contraindicated in children, and any invasive airway attempt must wait until pharmacologic measures (IM Epinephrine) have been tried.', correct: false },
          { text: 'Give Epinephrine 0.15 mg IM.', nextStepId: 'severe_underdose', feedback: 'Sub-optimal: A 10-year-old child who weighs over 30kg should receive the full 0.3 mg IM dose of Epinephrine, especially in severe airway closure.', correct: false }
        ]
      },
      severe_underdose: {
        id: 'severe_underdose',
        text: 'You adjust the dosage and administer the full Epinephrine 0.3 mg IM in the outer thigh.',
        options: [
          { text: 'Administer Epinephrine 0.3 mg IM.', nextStepId: 'severe_epi_given', feedback: 'Correct.', correct: true }
        ]
      },
      severe_cric_fail: {
        id: 'severe_cric_fail',
        text: 'Surgical cricothyroidotomy is inappropriate for this age. Give the life-saving Epinephrine IM first!',
        options: [
          { text: 'Administer Epinephrine 0.3 mg IM.', nextStepId: 'severe_epi_given', feedback: 'Correct.', correct: true }
        ]
      },
      severe_epi_given: {
        id: 'severe_epi_given',
        text: 'Epinephrine is given, but the patient begins to lose consciousness due to deep hypoxia. He is now unresponsive, and his respiratory effort is failing. How do you assist his airway and breathing?',
        vitals: { hr: '144', bp: '82/48', rr: '6', spo2: '65%', gcs: '4' },
        options: [
          { text: 'Initiate Bag-Valve-Mask (BVM) ventilations with 100% oxygen using a tight two-handed seal to force oxygen past the swelling.', nextStepId: 'severe_bvm_success', feedback: 'Excellent. High-pressure bag-valve-mask ventilations with a tight seal can often force oxygen through narrow, swollen vocal cords. This is the primary rescue technique.', correct: true },
          { text: 'Immediately attempt endotracheal intubation.', nextStepId: 'severe_intubate_fail', feedback: 'Incorrect. Attempting to intubate highly swollen vocal cords without paralytics can cause complete, irreversible trauma and spasm, fully closing the airway. Support with high-pressure BVM first while Epinephrine works.', correct: false }
        ]
      },
      severe_intubate_fail: {
        id: 'severe_intubate_fail',
        text: 'You realize that forcing air with a BVM is safer and more likely to succeed. You initiate BVM ventilations immediately.',
        options: [
          { text: 'Perform high-pressure BVM ventilations with 100% oxygen.', nextStepId: 'severe_bvm_success', feedback: 'Correct. BVM ventilations initiated.', correct: true }
        ]
      },
      severe_bvm_success: {
        id: 'severe_bvm_success',
        text: 'With high-pressure BVM ventilations, you achieve subtle chest rise. SpO2 slowly climbs to 88%. The Epinephrine takes effect, reducing mucosal swelling. The child begins to breathe spontaneously at 18 breaths/min, and his level of consciousness improves. What is your final step?',
        vitals: { hr: '128', bp: '98/62', rr: '18', spo2: '95%', gcs: '13' },
        options: [
          { text: 'Transition to high-flow oxygen via Non-Rebreather, maintain close monitoring, and expedite transport to the pediatric trauma center.', nextStepId: 'severe_complete', feedback: 'Correct. Keep supportive oxygenation active and transport with high vigilance.', correct: true }
        ]
      },
      severe_complete: {
        id: 'severe_complete',
        text: 'The patient remains stable, with fully restored airway patency upon arrival at the emergency department.',
        options: [
          { text: 'Complete scenario.', nextStepId: 'finish', feedback: 'Scenario completed!', correct: true }
        ]
      }
    },
    finalSummary: 'Outstanding work. You recognized severe airway closure, administered the appropriate 0.3 mg IM Epinephrine dose for an older child, utilized high-pressure BVM ventilations to bypass the laryngeal swelling, and successfully stabilized the patient for rapid transport.'
  },
  {
    id: 'scen-15',
    title: 'Geriatric Anaphylaxis (Beta-Blocker Resistance)',
    category: 'Medical',
    difficulty: 'AEMT',
    dispatch: 'Dispatch: Emergency call for a 68 YOM with history of congestive heart failure who was stung by a wasp and is now dizzy, wheezing, and hypotensive.',
    initialAssessment: 'You find the patient sitting on a porch. He is pale, sweating, speaking in fragmented sentences, and wheezing. His wife states he takes Metoprolol (a beta-blocker) for his heart.',
    steps: {
      start: {
        id: 'start',
        text: 'Given the wasp sting, respiratory distress, and profound hypotension, you suspect anaphylaxis. Knowing he is on Metoprolol (beta-blocker), what is your first intervention?',
        vitals: { hr: '58', bp: '78/44', rr: '26', spo2: '88%' },
        options: [
          { text: 'Administer Epinephrine 1:1,000 - 0.3 mg IM in the outer thigh, and prepare for potential resistance due to his beta-blocker medication.', nextStepId: 'bb_epi_given', feedback: 'Correct. Epinephrine IM remains the first-line medication, but be highly alert that patients on beta-blockers may have refractory symptoms and bradycardia.', correct: true },
          { text: 'Withhold Epinephrine because his heart rate is relatively slow (58 bpm).', nextStepId: 'bb_withhold_fail', feedback: 'CRITICAL ERROR: Epinephrine is a life-saving rescue drug. His heart rate is slow because of Metoprolol, not because he doesn\'t need Epinephrine. Do not withhold.', correct: false, critical: true }
        ]
      },
      bb_withhold_fail: {
        id: 'bb_withhold_fail',
        text: 'The patient\'s blood pressure continues to slide, and he becomes lethargic. You must give Epinephrine!',
        options: [
          { text: 'Administer Epinephrine 0.3 mg IM immediately.', nextStepId: 'bb_epi_given', feedback: 'Correct.', correct: true, critical: true }
        ]
      },
      bb_epi_given: {
        id: 'bb_epi_given',
        text: 'You administer the Epinephrine IM. After 5 minutes, there is absolutely no improvement; BP is still 74/40, bronchospasm is severe, and heart rate remains slow. Under AEMT protocols, what is the specific rescue antidote for beta-blocker-induced refractory anaphylaxis?',
        vitals: { hr: '54', bp: '74/40', rr: '28', spo2: '86%' },
        options: [
          { text: 'Administer Glucagon 1-2 mg IV or IM.', nextStepId: 'bb_glucagon_given', feedback: 'Brilliant! Glucagon activates adenyl cyclase through non-beta receptors, directly increasing intracellular cAMP. This bypasses the blocked beta-adrenergic receptors, restoring inotropic/chronotropic support and bronchodilation.', correct: true, critical: true },
          { text: 'Give a second dose of Epinephrine 0.3 mg IM and double the dose of Albuterol.', nextStepId: 'bb_epi_fail', feedback: 'Incorrect. Giving more Epinephrine will be ineffective because his beta-receptors are occupied by Metoprolol. You need Glucagon to bypass the blockade.', correct: false }
        ]
      },
      bb_epi_fail: {
        id: 'bb_epi_fail',
        text: 'The patient is not responding to Epinephrine. You must administer the receptor-bypassing agent immediately.',
        options: [
          { text: 'Administer Glucagon 1-2 mg IV or IM.', nextStepId: 'bb_glucagon_given', feedback: 'Correct. Glucagon is administered.', correct: true, critical: true }
        ]
      },
      bb_glucagon_given: {
        id: 'bb_glucagon_given',
        text: 'Glucagon is administered. At the same time, you establish a large-bore IV line. What is your subsequent fluid management for this patient\'s vasodilation?',
        vitals: { hr: '76', bp: '82/48', rr: '20', spo2: '92%' },
        options: [
          { text: 'Administer an aggressive 1-2 Liter Normal Saline or Lactated Ringers fluid bolus wide open to support preload.', nextStepId: 'bb_complete', feedback: 'Correct! Anaphylaxis causes profound vascular permeability and vasodilation, requiring substantial volume resuscitation alongside pharmacological reversal.', correct: true },
          { text: 'Keep the IV at a micro-drip (keep-vein-open) rate to avoid fluid overload.', nextStepId: 'bb_fluid_fail', feedback: 'Incorrect. In profound anaphylactic shock, distributive vasodilation requires active fluid expansion. A keep-vein-open rate is insufficient.', correct: false }
        ]
      },
      bb_fluid_fail: {
        id: 'bb_fluid_fail',
        text: 'You open the IV line and administer a rapid Normal Saline fluid bolus.',
        options: [
          { text: 'Infuse a 1-2 Liter Normal Saline bolus.', nextStepId: 'bb_complete', feedback: 'Correct.', correct: true }
        ]
      },
      bb_complete: {
        id: 'bb_complete',
        text: 'Within minutes of the Glucagon administration and fluid volume, his blood pressure increases to 98/62, bronchospasm breaks, and his pulse rate increases to 78 bpm. He is fully stabilized and transported.',
        options: [
          { text: 'Complete scenario.', nextStepId: 'finish', feedback: 'Scenario completed successfully!', correct: true }
        ]
      }
    },
    finalSummary: 'Superb clinical acumen. You recognized that patients taking beta-blockers are highly resistant to Epinephrine during anaphylaxis. You correctly administered Glucagon to bypass beta-receptors, supported the cardiovascular collapse with aggressive fluid boluses, and achieved successful stabilization.'
  }
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  // ==========================================
  // SUBJECT: Medications (14 Questions)
  // ==========================================
  {
    id: 'q-1',
    category: 'Medications',
    question: 'What is the adult dosage of Epinephrine (Adrenaline) for the emergency treatment of severe anaphylaxis via the Intramuscular (IM) route?',
    options: [
      '0.3 mg to 0.5 mg (using 1 mg/mL solution)',
      '1.0 mg (using 0.1 mg/mL solution)',
      '0.01 mg/kg IV',
      '5.0 mg nebulized'
    ],
    correctAnswerIndex: 0,
    explanation: 'For adult anaphylaxis, Epinephrine is given Intramuscularly (IM) at a dose of 0.3 mg to 0.5 mg of the 1 mg/mL (1:1,000) concentration.'
  },
  {
    id: 'q-2',
    category: 'Medications',
    question: 'Which of the following is a potential indication for nebulized Albuterol under our clinical guidelines?',
    options: [
      'Bronchospasm in Asthma, COPD, or hyperkalemia with EKG changes',
      'Acute coronary syndrome with substernal chest pain',
      'Severe bradycardia with signs of shock',
      'Opioid overdose with respiratory depression'
    ],
    correctAnswerIndex: 0,
    explanation: 'Albuterol relax airway smooth muscles (bronchodilation) in asthma/COPD. It is also used in suspected hyperkalemia to lower serum potassium levels.'
  },
  {
    id: 'q-3',
    category: 'Medications',
    question: 'When administering Naloxone (Narcan) to a patient with a suspected opioid overdose, what is the primary therapeutic goal?',
    options: [
      'To fully awaken the patient and have them talking',
      'To restore adequate spontaneous respirations and oxygenation',
      'To reverse pupil constriction',
      'To cure addiction'
    ],
    correctAnswerIndex: 1,
    explanation: 'Naloxone should be titrated to restore adequate respiratory rate, depth, and protective airway reflexes, avoiding acute withdrawal/combativeness.'
  },
  {
    id: 'q-4',
    category: 'Medications',
    question: 'What is the standard adult dose of Aspirin administered for suspected Acute Coronary Syndrome (ACS)?',
    options: [
      '81 mg chewable',
      '162 mg to 324 mg chewable (usually 324 mg as four 81mg tablets)',
      '500 mg swallowed',
      '1000 mg IV'
    ],
    correctAnswerIndex: 1,
    explanation: 'The standard protocol dose of Aspirin for active ACS is 162 mg to 324 mg of chewable non-enteric-coated tablets, which is rapidly absorbed in the mouth.'
  },
  {
    id: 'q-5',
    category: 'Medications',
    question: 'Before assisting or administering Nitroglycerin for chest pain, what is the minimum systolic blood pressure required?',
    options: [
      '90 mmHg',
      '100 mmHg',
      '110 mmHg',
      '120 mmHg'
    ],
    correctAnswerIndex: 1,
    explanation: 'Protocol requires a systolic blood pressure of at least 100 mmHg to administer Nitroglycerin due to its potent vasodilatory effects which can cause severe hypotension.'
  },
  {
    id: 'q-6',
    category: 'Medications',
    question: 'Which of the following medication pairings and their indications is correct?',
    options: [
      'Aspirin - Platelet inhibitor for ACS',
      'Albuterol - Anticholinergic for bradycardia',
      'Naloxone - Synthetic opioid for pain management',
      'Oral Glucose - Fast-acting hormone for hyperglycemia'
    ],
    correctAnswerIndex: 0,
    explanation: 'Aspirin acts as a platelet aggregation inhibitor to prevent coronary artery thrombus from expanding in ACS.'
  },
  {
    id: 'q-7',
    category: 'Medications',
    question: 'At the AEMT level, what is the adult dose of Atropine Sulfate for symptomatic bradycardia, and what is the maximum cumulative dose?',
    options: [
      '0.5 mg IV/IO every 3-5 mins; max 3.0 mg',
      '1.0 mg IV/IO every 3-5 mins; max 3.0 mg',
      '1.0 mg IV/IO once; max 1.0 mg',
      '2.0 mg IM once; max 6.0 mg'
    ],
    correctAnswerIndex: 1,
    explanation: 'Under current Guidelines, the single adult dose of Atropine for symptomatic bradycardia is 1.0 mg IV/IO, repeated every 3-5 minutes up to a maximum total dose of 3.0 mg.'
  },
  {
    id: 'q-8',
    category: 'Medications',
    question: 'In pediatric patients, what is the correct dose and route of Epinephrine for severe anaphylaxis?',
    options: [
      '0.15 mg IM (1:1,000 / 1 mg/mL) in the anterolateral thigh',
      '0.30 mg IM (1:1,000 / 1 mg/mL) in the deltoid',
      '0.01 mg IM of 1:10,000 solution',
      '0.50 mg orally'
    ],
    correctAnswerIndex: 0,
    explanation: 'The standard pediatric dose of Epinephrine for anaphylaxis is 0.15 mg Intramuscularly (IM) using the 1 mg/mL (1:1,000) concentration, injected into the lateral thigh.'
  },
  {
    id: 'q-9',
    category: 'Medications',
    question: 'What is the absolute contraindication for the administration of Oral Glucose paste?',
    options: [
      'Blood glucose level greater than 70 mg/dL',
      'Age under 12 years old',
      'Altered mental status with a compromised airway or absent gag reflex',
      'History of insulin-dependent diabetes'
    ],
    correctAnswerIndex: 2,
    explanation: 'Oral glucose requires the patient to be conscious, cooperative, and able to swallow with an intact airway and gag reflex to prevent aspiration.'
  },
  {
    id: 'q-10',
    category: 'Medications',
    question: 'What is the first-line medication and adult dose for cardiac arrest associated with shockable Ventricular Fibrillation (V-Fib) or Pulseless V-Tach?',
    options: [
      'Epinephrine 1 mg (1:10,000 / 0.1 mg/mL) IV/IO every 3-5 minutes',
      'Amiodarone 150 mg IV/IO once',
      'Atropine 1 mg IV/IO every 3-5 minutes',
      'Vasopressin 40 Units IM'
    ],
    correctAnswerIndex: 0,
    explanation: 'Epinephrine 1 mg of 0.1 mg/mL (1:10,000) is the primary vasopressor administered in cardiac arrest, repeated every 3 to 5 minutes.'
  },
  {
    id: 'q-11',
    category: 'Medications',
    question: 'At the AEMT level, what is the initial adult dose of Amiodarone for refractory VF/Pulseless VT cardiac arrest?',
    options: [
      '150 mg IV/IO',
      '300 mg IV/IO',
      '450 mg IV/IO',
      '1 mg/kg IV'
    ],
    correctAnswerIndex: 1,
    explanation: 'The first bolus dose of Amiodarone for pulseless VF/VT is 300 mg IV/IO. If refractory, a second dose of 150 mg can be given.'
  },
  {
    id: 'q-12',
    category: 'Medications',
    question: 'Why is nitroglycerin contraindicated in patients who have taken sildenafil (Viagra) or similar PDE5 inhibitors within 24 to 48 hours?',
    options: [
      'It will trigger severe, uncontrollable seizures',
      'It causes extreme coronary artery spasm',
      'It synergistically induces profound, life-threatening hypotension',
      'It neutralizes the analgesic effect of oxygen'
    ],
    correctAnswerIndex: 2,
    explanation: 'Nitroglycerin and PDE5 inhibitors both promote smooth muscle relaxation and vasodilation. Combined, they cause catastrophic drops in blood pressure.'
  },
  {
    id: 'q-13',
    category: 'Medications',
    question: 'When performing Intraosseous (IO) infusion on a conscious patient, what medication and dose is flushed first to prevent intense pressure pain?',
    options: [
      'Fentanyl 100 mcg IV',
      '2% Lidocaine 20 mg to 40 mg slow IO flush',
      'Normal Saline 10 mL rapid flush',
      'Epinephrine 1 mg slow push'
    ],
    correctAnswerIndex: 1,
    explanation: 'Infusing fluid into the bone marrow is extremely painful. Instilling 2% preservative-free Lidocaine (20-40 mg slow) anesthetizes the intraosseous cavity.'
  },
  {
    id: 'q-14',
    category: 'Medications',
    question: 'What is the primary mechanism of action of Albuterol (Proventil)?',
    options: [
      'Alpha-1 adrenergic agonist causing arterial vasoconstriction',
      'Beta-1 adrenergic antagonist reducing heart rate',
      'Beta-2 selective adrenergic agonist causing bronchodilation',
      'Parasympathetic blocker reducing mucosal secretions'
    ],
    correctAnswerIndex: 2,
    explanation: 'Albuterol selectively stimulates beta-2 adrenergic receptors on airway smooth muscles, relaxing them to reverse bronchospasm.'
  },

  // ==========================================
  // SUBJECT: Protocols (14 Questions)
  // ==========================================
  {
    id: 'q-15',
    category: 'Protocols',
    question: 'According to Three Mile Fire Department Protocol 4.2, what are the only two authorized exceptions for patient transport in our units (3040/3045)?',
    options: [
      'Rendezvous Transport ("Load & Go") and True Life-and-Death Emergency Transport',
      'When the patient refuses MESI transport or has no insurance',
      'When it is raining heavily or command orders it',
      'Minor transport and administrative transport'
    ],
    correctAnswerIndex: 0,
    explanation: 'Protocol 4.2 limits transport in 3MF units to Rendezvous Transport (Exception A) and True Life-and-Death Emergency (Exception B).'
  },
  {
    id: 'q-16',
    category: 'Protocols',
    question: 'If a patient explicitly requests transport to Bitterroot Health Hospitals, what should Three Mile Fire crews do regarding the enroute MESI crew?',
    options: [
      'Request Bitterroot Health Ambulances and cancel the enroute MESI crew',
      'Ignore the patient\'s request and wait for MESI',
      'Transport the patient ourselves without notifying anyone',
      'Call the police'
    ],
    correctAnswerIndex: 0,
    explanation: 'Under 3MF General 911 Response Protocol, if the patient requests Bitterroot Health, we request Bitterroot Health Ambulances and cancel MESI.'
  },
  {
    id: 'q-17',
    category: 'Protocols',
    question: 'What constitutes a legally valid Refusal of Medical Care (AMA) on a 911 scene?',
    options: [
      'The patient saying "I\'m fine" and walking away',
      'Patient is awake, alert, oriented x4, possesses decision-making capacity, is informed of risks, and signs a refusal form',
      'The patient\'s spouse signing on their behalf while the patient is unconscious',
      'Any patient who is over the age of 18 regardless of sobriety or head trauma'
    ],
    correctAnswerIndex: 1,
    explanation: 'A valid refusal requires documented proof that the patient is alert and oriented, displays complete cognitive capacity (no alcohol, hypoxia, head trauma), understands risks, and signs.'
  },
  {
    id: 'q-18',
    category: 'Protocols',
    question: 'What does the "B" stand for in the standard clinical SBAR handoff report?',
    options: [
      'Breathing rate and depth',
      'Background (pertinent patient history, allergies, events leading up)',
      'Blood pressure and baseline vitals',
      'Body Substance Isolation'
    ],
    correctAnswerIndex: 1,
    explanation: 'SBAR stands for Situation, Background, Assessment, and Recommendation. Background covers the historical details of the patient.'
  },
  {
    id: 'q-19',
    category: 'Protocols',
    question: 'Why is active management of hypothermia highly critical in severe trauma patients?',
    options: [
      'Hypothermia causes severe burns when they reach the hospital',
      'Hypothermia disrupts the coagulation cascade, worsening bleeding as part of the "Trauma Triad of Death"',
      'It prevents them from shivering which burns calories',
      'Blankets increase the oxygen level in the room'
    ],
    correctAnswerIndex: 1,
    explanation: 'The "Trauma Triad of Death" consists of hypothermia, acidosis, and coagulopathy. Keeping trauma patients warm is vital to ensure blood clotting.'
  },
  {
    id: 'q-20',
    category: 'Protocols',
    question: 'Which of the following is a direct indication for immediate spinal motion restriction (immobilization)?',
    options: [
      'An isolated ankle fracture with clear mental status',
      'A high-energy mechanism of injury with midline cervical spine tenderness or focal neurological deficit',
      'A history of chronic scoliosis',
      'Any patient transported on a Tuesday'
    ],
    correctAnswerIndex: 1,
    explanation: 'Spinal restriction is indicated for blunt trauma with midline spinal tenderness, altered mental status, sensory/motor deficits, or distracting injuries.'
  },
  {
    id: 'q-21',
    category: 'Protocols',
    question: 'If you find a patient in cardiac arrest and the family presents a photocopied DNR order, what must you verify to withhold resuscitation?',
    options: [
      'That it is a state-approved form, fully completed, and signed by both a physician and the patient/surrogate',
      'That the form is less than 30 days old',
      'Only that the patient is older than 65',
      'Nothing; a verbal statement from any family member is sufficient to stop CPR'
    ],
    correctAnswerIndex: 0,
    explanation: 'For a DNR to be legally binding in the field, it must be a valid, fully completed, signed, and unrevoked state-approved form.'
  },
  {
    id: 'q-22',
    category: 'Protocols',
    question: 'What is the distinction between "Standing Orders" and "Online Medical Direction"?',
    options: [
      'Standing orders are written protocols we follow automatically; Online direction is direct voice contact with a physician',
      'Standing orders require a written signature for every step; Online direction is via email',
      'Standing orders are for trauma only; Online direction is for pediatric only',
      'There is no difference'
    ],
    correctAnswerIndex: 0,
    explanation: 'Standing orders (offline protocols) allow prehospital actions without delay. Online medical direction involves consulting a physician via phone/radio.'
  },
  {
    id: 'q-23',
    category: 'Protocols',
    question: 'Under child protection protocols, what is the EMT\'s legal obligation if child abuse or neglect is suspected?',
    options: [
      'Confront the parents immediately on scene',
      'Document findings objectively and file an immediate report to Child Protective Services or Law Enforcement',
      'Keep it confidential to protect patient privacy',
      'Wait for the hospital doctor to make the report'
    ],
    correctAnswerIndex: 1,
    explanation: 'EMS personnel are legally mandated reporters. Suspected abuse must be reported directly to law enforcement/protective services immediately.'
  },
  {
    id: 'q-24',
    category: 'Protocols',
    question: 'According to shock protocols, how should a patient in decompensated hemorrhagic shock be positioned?',
    options: [
      'Sitting upright in high-Fowler\'s position to help breathing',
      'Lying flat on their back (supine) to maintain cerebral perfusion',
      'Lying on their left side in the recovery position',
      'With their head hanging off the edge of the stretcher'
    ],
    correctAnswerIndex: 1,
    explanation: 'Supine positioning is critical in hemorrhagic shock to maximize blood flow to the brain and vital organs.'
  },
  {
    id: 'q-25',
    category: 'Protocols',
    question: 'What is the absolute first action when a clinical responder encounters an active emergency scene?',
    options: [
      'Assess the patient\'s level of consciousness',
      'Take BSI precautions and verify that the scene is safe to enter',
      'Retrieve the defibrillator and oxygen bag',
      'Begin chest compressions'
    ],
    correctAnswerIndex: 1,
    explanation: 'Scene safety and personal protective equipment (BSI) are always the absolute first priorities to prevent the responder from becoming a casualty.'
  },
  {
    id: 'q-26',
    category: 'Protocols',
    question: 'When should a pelvic binder be applied to a trauma patient?',
    options: [
      'When they have an isolated hip dislocation',
      'When there is a high-energy mechanism and pelvic instability, pain, or signs of hypovolemic shock',
      'To prevent lower back strain during transport',
      'Only after a pelvic X-ray is obtained'
    ],
    correctAnswerIndex: 1,
    explanation: 'A pelvic binder is applied in the field to stabilize suspected pelvic fractures and minimize life-threatening internal bleeding.'
  },
  {
    id: 'q-27',
    category: 'Protocols',
    question: 'Under respiratory protocols, when is CPAP (Continuous Positive Airway Pressure) indicated for an adult?',
    options: [
      'A patient with a respiratory rate of 4 who is unconscious',
      'Conscious respiratory distress (e.g. CHF/pulmonary edema, asthma/COPD) with accessory muscle use and SpO2 <90%',
      'A patient with an active pneumothorax',
      'A patient with persistent nausea and vomiting'
    ],
    correctAnswerIndex: 1,
    explanation: 'CPAP is indicated for conscious, breathing patients with severe distress from pulmonary edema or bronchospasm, but contraindicated in apnea or vomiting.'
  },
  {
    id: 'q-28',
    category: 'Protocols',
    question: 'What is the correct treatment for an open sucking chest wound?',
    options: [
      'Apply a dry sterile dressing wrapped tightly with gauze',
      'Apply an occlusive dressing sealed on three sides (vented chest seal)',
      'Keep the wound open to let air escape freely',
      'Pack the wound with hemostatic gauze'
    ],
    correctAnswerIndex: 1,
    explanation: 'A vented chest seal (occlusive sealed on 3 sides) lets air exit the pleural cavity during expiration but blocks air from entering during inspiration.'
  },

  // ==========================================
  // SUBJECT: EKG & Vitals (14 Questions)
  // ==========================================
  {
    id: 'q-29',
    category: 'EKG & Vitals',
    question: 'Which of the following describes the electrical characteristics of Ventricular Fibrillation (V-Fib)?',
    options: [
      'Rapid, regular, wide QRS complexes with absent P waves',
      'Irregularly irregular rhythm with narrow QRS complexes and no P waves',
      'Chaotic, disorganized electrical activity with no recognizable QRS complexes',
      'A slow, flat baseline with rare, wide QRS complexes'
    ],
    correctAnswerIndex: 2,
    explanation: 'V-Fib is a chaotic, completely disorganized rhythm where the ventricles quiver. There are no recognizable QRS complexes.'
  },
  {
    id: 'q-30',
    category: 'EKG & Vitals',
    question: 'What is the target blood oxygen saturation (SpO2) level for a COPD patient experiencing an acute exacerbation?',
    options: [
      '94% - 99%',
      '100%',
      '88% - 92%',
      '80% - 85%'
    ],
    correctAnswerIndex: 2,
    explanation: 'For COPD patients, the target oxygen level is 88%-92% to prevent depression of the hypoxic respiratory drive.'
  },
  {
    id: 'q-31',
    category: 'EKG & Vitals',
    question: 'What does an irregularly irregular rhythm with narrow QRS complexes and completely absent P waves indicate?',
    options: [
      'Sinus Arrythmia',
      'Atrial Fibrillation (A-Fib)',
      'Atrial Flutter',
      'Ventricular Tachycardia'
    ],
    correctAnswerIndex: 1,
    explanation: 'Atrial Fibrillation presents with chaotic atrial activity (no distinct P waves) and a highly irregular ventricular response (irregularly irregular).'
  },
  {
    id: 'q-32',
    category: 'EKG & Vitals',
    question: 'Which of the following EKG rhythms is considered "shockable" during a pulseless cardiac arrest?',
    options: [
      'Asystole and PEA (Pulseless Electrical Activity)',
      'VF (Ventricular Fibrillation) and Pulseless VT (Ventricular Tachycardia)',
      'Third-Degree Heart Block and Sinus Bradycardia',
      'Atrial Fibrillation and SVT'
    ],
    correctAnswerIndex: 1,
    explanation: 'The only two shockable rhythms in cardiac arrest are Ventricular Fibrillation and pulseless Ventricular Tachycardia.'
  },
  {
    id: 'q-33',
    category: 'EKG & Vitals',
    question: 'What EKG feature is the hallmark of a Second-Degree Type I (Wenckebach) AV Block?',
    options: [
      'Constant, prolonged PR interval followed by a dropped QRS',
      'Progressive lengthening of the PR interval until a QRS complex is dropped',
      'Complete dissociation between P waves and QRS complexes',
      'Narrow QRS complexes with a rate of 150 bpm'
    ],
    correctAnswerIndex: 1,
    explanation: 'Wenckebach block exhibits progressive prolonging of the PR interval until an electrical impulse fails to conduct (dropped QRS).'
  },
  {
    id: 'q-34',
    category: 'EKG & Vitals',
    question: 'What constitutes a "wide" QRS complex on a standard EKG grid?',
    options: [
      'Greater than 0.12 seconds (3 small boxes)',
      'Greater than 0.20 seconds (1 large box)',
      'Less than 0.08 seconds (2 small boxes)',
      'Exactly 0.10 seconds'
    ],
    correctAnswerIndex: 0,
    explanation: 'A normal narrow QRS complex is <0.12 seconds. A QRS >=0.12 seconds indicates a delay in ventricular conduction (ventricular rhythm or bundle block).'
  },
  {
    id: 'q-35',
    category: 'EKG & Vitals',
    question: 'What are the three components evaluated in the Glasgow Coma Scale (GCS)?',
    options: [
      'Pulse, Respiration, Blood Pressure',
      'Eye opening, Verbal response, Motor response',
      'Pupil size, Grip strength, Speech clarity',
      'Airway, Breathing, Circulation'
    ],
    correctAnswerIndex: 1,
    explanation: 'The Glasgow Coma Scale (GCS) grades brain injury severity based on Eye (1-4), Verbal (1-5), and Motor (1-6) responses, scoring from 3 to 15.'
  },
  {
    id: 'q-36',
    category: 'EKG & Vitals',
    question: 'A GCS score of 8 or less typically indicates what clinical priority?',
    options: [
      'Mild concussion; safe to discharge home',
      'Severe brain injury; immediate airway control/ventilation assistance is indicated',
      'Hypoglycemic state; give orange juice',
      'Normal neurological status'
    ],
    correctAnswerIndex: 1,
    explanation: 'A GCS of <= 8 represents a comatose patient who cannot protect their own airway. Intubation or aggressive airway protection is indicated.'
  },
  {
    id: 'q-37',
    category: 'EKG & Vitals',
    question: 'What does a sudden drop in continuous capnography (ETCO2) to near zero in an intubated patient indicate?',
    options: [
      'The patient is improving and breathing on their own',
      'Dislodgement of the ET tube or complete loss of perfusion (cardiac arrest)',
      'An increase in core temperature',
      'The oxygen cylinder is empty'
    ],
    correctAnswerIndex: 1,
    explanation: 'Since ETCO2 measures exhaled carbon dioxide, a sudden drop to zero in an intubated patient means either the tube has dislodged into the esophagus or the heart has stopped pumping blood.'
  },
  {
    id: 'q-38',
    category: 'EKG & Vitals',
    question: 'What is the normal range for continuous end-tidal capnography (ETCO2) in a healthy, breathing adult?',
    options: [
      '20 - 30 mmHg',
      '35 - 45 mmHg',
      '50 - 60 mmHg',
      '80 - 100 mmHg'
    ],
    correctAnswerIndex: 1,
    explanation: 'Normal partial pressure of exhaled carbon dioxide (ETCO2) is 35 to 45 mmHg, which correlates with normal arterial CO2 tension.'
  },
  {
    id: 'q-39',
    category: 'EKG & Vitals',
    question: 'How does hyperventilation affect end-tidal carbon dioxide (ETCO2) levels?',
    options: [
      'It increases ETCO2 due to carbon dioxide retention',
      'It decreases ETCO2 as carbon dioxide is rapidly "blown off"',
      'It has no impact on ETCO2',
      'It causes the ETCO2 reading to fluctuate chaoticly'
    ],
    correctAnswerIndex: 1,
    explanation: 'Rapid breathing exhales more CO2 than the body generates, causing the blood and exhaled CO2 values to drop below 35 mmHg.'
  },
  {
    id: 'q-40',
    category: 'EKG & Vitals',
    question: 'What EKG finding represents a Third-Degree (Complete) AV Block?',
    options: [
      'A prolonged, fixed PR interval',
      'Progressive PR prolongation followed by dropped QRS',
      'No relationship between P waves and QRS complexes (AV dissociation)',
      'A lack of any P waves with a fast, narrow rhythm'
    ],
    correctAnswerIndex: 2,
    explanation: 'In 3rd-degree block, the atria and ventricles beat independently. P waves and QRS complexes have completely independent rates.'
  },
  {
    id: 'q-41',
    category: 'EKG & Vitals',
    question: 'Which of the following is considered a hallmark sign of neurogenic shock?',
    options: [
      'Tachycardia and cold, pale, wet skin',
      'Bradycardia and warm, dry, flushed skin below the injury site',
      'Severe hypertension and hyperactive reflexes',
      'Chaotic respiration and hyperthermia'
    ],
    correctAnswerIndex: 1,
    explanation: 'Loss of sympathetic tone in neurogenic shock prevents tachycardia and vasoconstriction. Thus, the skin remains warm/dry with bradycardia.'
  },
  {
    id: 'q-42',
    category: 'EKG & Vitals',
    question: 'What is the physiological cause of the ST-segment elevation seen on a 12-lead ECG during a STEMI?',
    options: [
      'Severe, localized skeletal muscle damage',
      'Acute transmural myocardial injury (infarction) of the heart wall',
      'A benign artifact from patient movement',
      'High concentrations of potassium in the bloodstream'
    ],
    correctAnswerIndex: 1,
    explanation: 'ST elevation represents an acute transmural (full thickness of the heart wall) myocardial injury caused by total coronary artery blockage.'
  },

  // ==========================================
  // SUBJECT: EMS Operations (14 Questions)
  // ==========================================
  {
    id: 'q-43',
    category: 'EMS Operations',
    question: 'During what hours is Ambulance 3045 staffed by the contracted MESI crew?',
    options: [
      '24 hours a day, 7 days a week',
      'Monday through Friday, 7:00 AM to 7:00 PM',
      'Weekends only, 8:00 AM to 8:00 PM',
      'Night shifts only, 7:00 PM to 7:00 AM'
    ],
    correctAnswerIndex: 1,
    explanation: 'Under Protocol 2.1, Ambulance 3045 is staffed by the contracted MESI crew Monday through Friday, 7:00 AM to 7:00 PM.'
  },
  {
    id: 'q-44',
    category: 'EMS Operations',
    question: 'During contracted hours, the MESI crew on Ambulance 3045 is required to begin emergency response within what timeframe?',
    options: [
      'Within 90 seconds (1.5 minutes) of dispatch',
      'Within 5 minutes of dispatch',
      'Within 10 minutes of dispatch',
      'There is no required turnout timeframe'
    ],
    correctAnswerIndex: 0,
    explanation: 'The MESI crew operating Ambulance 3045 is required to begin response (log out of station) within 90 seconds of receiving initial dispatch notification.'
  },
  {
    id: 'q-45',
    category: 'EMS Operations',
    question: 'In the START triage system used during a Mass Casualty Incident (MCI), what is the very first step?',
    options: [
      'Check radial pulses',
      'Assess airway and breathing of unresponsive patients',
      'Instruct all walking wounded patients to move to a designated area',
      'Deliver immediate rescue breaths to non-breathing patients'
    ],
    correctAnswerIndex: 2,
    explanation: 'The first step in START triage is to clear the green "walking wounded" patients by instructing them to move to a safe, designated treatment area.'
  },
  {
    id: 'q-46',
    category: 'EMS Operations',
    question: 'What are the four color-coded categories used in mass casualty incident (MCI) triage tags?',
    options: [
      'Red (Immediate), Yellow (Delayed), Green (Minor), Black (Deceased)',
      'Blue (Critical), Red (Serious), White (Stable), Grey (Deceased)',
      'Orange (Severe), Purple (Intermediate), Yellow (Minor), Pink (Deceased)',
      'Red (Shock), Pink (Bleeding), Yellow (Stable), Green (Discharged)'
    ],
    correctAnswerIndex: 0,
    explanation: 'Standard triage tags use Red (Immediate life-threats), Yellow (Delayed), Green (Minor walking wounded), and Black (Expectant/Deceased).'
  },
  {
    id: 'q-47',
    category: 'EMS Operations',
    question: 'In START triage, what assessment findings would place an adult patient in the RED (Immediate) category?',
    options: [
      'Any patient who is crying or screaming in pain',
      'Respiratory rate >30, absent radial pulse, or unable to follow simple commands',
      'A patient who is walking around looking for their keys',
      'An unconscious patient who does not breathe even after opening their airway'
    ],
    correctAnswerIndex: 1,
    explanation: 'Adult START Red criteria use the "RPM" pneumonic: Respirations >30, Perfusion (no radial pulse/cap refill >2s), and Mental Status (cannot follow commands).'
  },
  {
    id: 'q-48',
    category: 'EMS Operations',
    question: 'What are the minimum dimension and safety requirements for establishing a helicopter Landing Zone (LZ)?',
    options: [
      '50x50 feet, near powerlines for illumination',
      '100x100 feet, flat, clear of debris, wires, trees, and secured from public access',
      '200x200 feet, on a steep incline',
      'Any local paved street without preparation'
    ],
    correctAnswerIndex: 1,
    explanation: 'Helicopter safety requires a flat, secured 100x100 foot landing zone free of loose debris (which can blow into rotors) and overhead wires.'
  },
  {
    id: 'q-49',
    category: 'EMS Operations',
    question: 'When driving an emergency vehicle with active lights and sirens, how must intersections be approached?',
    options: [
      'Accelerate through to clear the intersection as fast as possible',
      'Slow down and prepare to stop, proceeding only after ensuring all traffic has yielded',
      'Treat all red lights as green lights because sirens grant right-of-way',
      'Drive in the opposing lane without slowing down'
    ],
    correctAnswerIndex: 1,
    explanation: 'Emergency vehicles do not possess absolute right of way. Drivers must exercise "due regard," meaning slowing or stopping at red lights/stop signs.'
  },
  {
    id: 'q-50',
    category: 'EMS Operations',
    question: 'What is the safest biomechanical method for lifting a heavy patient or equipment?',
    options: [
      'Bend at the waist, lock your knees, and lift rapidly using your back muscles',
      'Keep your back straight, bend at the knees, lift with your leg muscles, and keep the load close to your body',
      'Lift with your arms outstretched as far as possible',
      'Twist your torso while lifting to distribute the load'
    ],
    correctAnswerIndex: 1,
    explanation: 'Leg muscles are far stronger than back muscles. Keeping the back straight, lifting with legs, and keeping the load close prevents debilitating back injuries.'
  },
  {
    id: 'q-51',
    category: 'EMS Operations',
    question: 'When arriving at a suspected Hazardous Materials (HazMat) scene, where should you park the emergency vehicle?',
    options: [
      'Directly adjacent to the leaking container for easy access',
      'Uphill and upwind, at a safe distance, referencing the Emergency Response Guidebook (ERG)',
      'Downhill and downwind to keep the scene behind you',
      'Inside the warm zone near the police line'
    ],
    correctAnswerIndex: 1,
    explanation: 'Parking uphill and upwind prevents toxic gases or liquid runoff from flowing toward your ambulance and compromising the responders.'
  },
  {
    id: 'q-52',
    category: 'EMS Operations',
    question: 'What is the very first priority for decon (decontamination) when a patient has suffered a chemical exposure to their skin?',
    options: [
      'Apply neutralizing chemicals immediately',
      'Flush the affected area with large volumes of clean water',
      'Scrub the skin vigorously with a dry wire brush',
      'Apply sterile petroleum jelly to coat the chemical'
    ],
    correctAnswerIndex: 1,
    explanation: 'Flushing with large volumes of water dilutes and removes the toxic chemical. Neutralizing agents are avoided because the reaction can generate severe heat.'
  },
  {
    id: 'q-53',
    category: 'EMS Operations',
    question: 'What constitutes standard Body Substance Isolation (BSI) precautions for a patient with an active, spurting arterial bleed?',
    options: [
      'Gloves only',
      'Gloves, eye protection, and a fluid-resistant gown/mask',
      'A surgical mask only',
      'BSI is not required for trauma calls'
    ],
    correctAnswerIndex: 1,
    explanation: 'Spurting blood can spray into eyes, nose, or mouth. Full splash protection (gloves, eye shield, gown, and mask) is mandatory.'
  },
  {
    id: 'q-54',
    category: 'EMS Operations',
    question: 'Under the Incident Command System (ICS), who has the final authority and responsibility for all scene operations?',
    options: [
      'The most senior paramedic on scene',
      'The Incident Commander (IC)',
      'The first police officer to arrive',
      'The medical director via telephone'
    ],
    correctAnswerIndex: 1,
    explanation: 'The Incident Commander holds ultimate command and management responsibility for safety and operations at any incident scene.'
  },
  {
    id: 'q-55',
    category: 'EMS Operations',
    question: 'What is the purpose of a "staging area" at a large-scale mass casualty scene?',
    options: [
      'To provide a press briefing location for the media',
      'To hold incoming emergency vehicles and personnel in a designated spot until assigned to specific tasks',
      'To perform secondary triage on green-tagged patients',
      'To store the deceased'
    ],
    correctAnswerIndex: 1,
    explanation: 'Staging prevents gridlock at the immediate scene by keeping ambulances and responders nearby but out of the way until they are called in.'
  },
  {
    id: 'q-56',
    category: 'EMS Operations',
    question: 'Under START triage, if you open an unresponsive patient\'s airway and they do not begin breathing, what category do they receive?',
    options: [
      'RED (Immediate)',
      'BLACK (Deceased/Expectant)',
      'YELLOW (Delayed)',
      'YELLOW, but re-evaluate in 5 minutes'
    ],
    correctAnswerIndex: 1,
    explanation: 'If a patient is apneic and does not begin breathing after simple manual airway opening, they are classified as Black (Deceased) under START triage.'
  },
  {
    id: 'q-io-1',
    category: 'IO Access',
    question: 'Which needle is the clinical standard of care for a humeral head IO placement in a conscious adult?',
    options: [
      'Pink 15 mm (Pediatric Size)',
      'Blue 25 mm (Adult Standard)',
      'Yellow 45 mm (Extended Size)',
      'None of the above'
    ],
    correctAnswerIndex: 2,
    explanation: 'Humeral insertion requires the Yellow 45mm needle in almost all adults to successfully clear the deltoid muscle pad and fat layer, allowing proper seating of the needle hub.'
  },
  {
    id: 'q-io-2',
    category: 'IO Access',
    question: 'Where is the correct pediatric proximal tibia IO insertion site to avoid epiphyseal plates?',
    options: [
      'Directly into the center of the tibial tuberosity bone bump',
      '1 cm medial to the tibial tuberosity, and slightly distal (downward)',
      '3 cm proximal to the lateral malleolus',
      '2 cm lateral to the patella'
    ],
    correctAnswerIndex: 1,
    explanation: 'In pediatric patients, the proximal tibia target must be 1 cm medial and slightly distal (1 cm) to the tibial tuberosity to safely bypass the active epiphyseal growth plate.'
  },
  {
    id: 'q-io-3',
    category: 'IO Access',
    question: 'What is the recommended medication protocol before performing a saline flush in a conscious patient?',
    options: [
      'No medicine is needed, push saline as fast as possible',
      'Slowly instill 2% preservative-free Lidocaine (Adult: 40mg, Ped: 0.5mg/kg)',
      'Flush with cold Sterile Water',
      'Administer IV Morphine first'
    ],
    correctAnswerIndex: 1,
    explanation: 'Instilling 2% Lidocaine slowly before flushing is critical in conscious patients, as fluid infusion in the marrow cavity expands pressure-sensitive pain receptors, causing severe pain.'
  },
  {
    id: 'q-io-4',
    category: 'IO Access',
    question: 'Which of the following constitutes an absolute contraindication for IO placement in a target limb?',
    options: [
      'Patient is in cardiac arrest or deep shock',
      'Fracture of the target bone or previous IO insertion within 48 hours',
      'The patient is conscious and responsive',
      'Active peripheral IV access in the opposite limb'
    ],
    correctAnswerIndex: 1,
    explanation: 'A fractured bone or previous IO attempt within 48h are absolute contraindications because fluid and drugs will leak through the fracture/puncture site into surrounding tissues (extravasation), leading to compartment syndrome.'
  }
];

const SKILL_CHECKLISTS: SkillChecklist[] = [
  // =========================================================================
  // 1. EMR (Emergency Medical Responder)
  // =========================================================================
  {
    id: 'chk-emr-cpr',
    title: 'Adult CPR & AED (EMR / BLS)',
    category: 'EMR',
    steps: [
      { text: 'Verifies scene safety and takes BSI precautions.', critical: true },
      { text: 'Assesses patient for responsiveness (taps and shouts).', critical: false },
      { text: 'Shouts for nearby help and directs someone to call 911/get AED.', critical: false },
      { text: 'Checks carotid pulse and breathing simultaneously for 5 to 10 seconds.', critical: true },
      { text: 'Delivers high-quality chest compressions at 100-120/min rate.', critical: true },
      { text: 'Ensures correct compression depth of 2 to 2.4 inches and full chest recoil.', critical: true },
      { text: 'Minimizes chest compression interruptions to less than 10 seconds.', critical: true },
      { text: 'Opens airway and delivers 2 rescue breaths with visible chest rise.', critical: false },
      { text: 'Turns on AED immediately upon arrival and attaches pads correctly.', critical: true },
      { text: 'Clears patient during EKG analysis and shock delivery.', critical: true },
      { text: 'Resumes chest compressions immediately after shock/no-shock advisory.', critical: true }
    ]
  },
  {
    id: 'chk-emr-assess-medical',
    title: 'Patient Assessment: Medical (EMR)',
    category: 'EMR',
    steps: [
      { text: 'Takes BSI precautions and ensures scene safety.', critical: true },
      { text: 'Determines the Nature of Illness (NOI).', critical: false },
      { text: 'Determines number of patients and requests additional help if needed.', critical: false },
      { text: 'Formulates general impression and assesses responsiveness (AVPU).', critical: true },
      { text: 'Assesses airway, breathing, and starts high-flow oxygen if indicated.', critical: true },
      { text: 'Checks circulation (radial pulse, skin color, temperature, and moisture).', critical: true },
      { text: 'Identifies chief complaint and obtains SAMPLE history.', critical: false },
      { text: 'Performs focused physical exam based on symptoms.', critical: false },
      { text: 'Obtains baseline vital signs (pulse, respiration, blood pressure estimate).', critical: false },
      { text: 'Gives accurate handoff report to arriving EMTs/Paramedics.', critical: true }
    ]
  },
  {
    id: 'chk-emr-assess-trauma',
    title: 'Patient Assessment: Trauma (EMR)',
    category: 'EMR',
    steps: [
      { text: 'Takes BSI precautions and ensures scene safety.', critical: true },
      { text: 'Determines Mechanism of Injury (MOI) and patient count.', critical: false },
      { text: 'Considers immediate manual stabilization of the cervical spine.', critical: true },
      { text: 'Formulates general impression and assesses level of consciousness (AVPU).', critical: false },
      { text: 'Checks airway and breathing, ensuring clear passage and adequate respiration.', critical: true },
      { text: 'Assesses circulation: immediately checks and controls major/severe bleeding.', critical: true },
      { text: 'Performs rapid trauma sweep (head, neck, chest, abdomen, pelvis, extremities).', critical: false },
      { text: 'Maintains C-spine control and prepares patient for spinal immobilization.', critical: true },
      { text: 'Obtains SAMPLE history and vital signs if time permits.', critical: false },
      { text: 'Delivers a precise oral transfer of care to arriving transport crew.', critical: true }
    ]
  },
  {
    id: 'chk-emr-bvm-suction',
    title: 'Airway & Ventilation: BVM & Suction (EMR)',
    category: 'EMR',
    steps: [
      { text: 'Takes BSI precautions and ensures scene safety.', critical: false },
      { text: 'Checks, prepares, and turns on suction device (generates vacuum >= 300 mmHg).', critical: true },
      { text: 'Measures suction catheter from corner of mouth to earlobe.', critical: false },
      { text: 'Inserts catheter into oropharynx without suction, then suctions on withdrawal with circular motion (max 15s).', critical: true },
      { text: 'Manually opens airway (head-tilt/chin-lift or jaw-thrust for trauma).', critical: true },
      { text: 'Selects and inserts appropriate size Oropharyngeal (OPA) or Nasopharyngeal (NPA) airway.', critical: true },
      { text: 'Assembles Bag-Valve-Mask (BVM), connects to oxygen at 15 L/min.', critical: false },
      { text: 'Applies mask using E-C clamp technique to achieve a tight seal.', critical: true },
      { text: 'Ventilates patient at 1 breath every 6 seconds, ensuring visible chest rise.', critical: true },
      { text: 'Monitors chest rise, skin color, and ventilation effectiveness.', critical: false }
    ]
  },
  {
    id: 'chk-emr-o2-nrb-mouth',
    title: 'Oxygen Administration: NRB & Mouth-to-Mask (EMR)',
    category: 'EMR',
    steps: [
      { text: 'Takes BSI precautions.', critical: false },
      { text: 'Assembles pocket mask, connects oxygen supply (at 10-15 L/min).', critical: false },
      { text: 'Positions mask on patient face, opens airway, and delivers 1-second breaths.', critical: true },
      { text: 'Ensures visible chest rise with each breath.', critical: true },
      { text: 'Switches to oxygen cylinder: cracks valve, attaches regulator, and checks pressure (>500 psi).', critical: true },
      { text: 'Connects Non-Rebreather (NRB) mask, sets flow rate to 10-15 L/min.', critical: true },
      { text: 'Pre-inflates reservoir bag completely before placing on patient.', critical: true },
      { text: 'Applies NRB snugly to face, securing straps and monitoring reservoir deflation.', critical: false }
    ]
  },
  {
    id: 'chk-emr-circulation-shock',
    title: 'Circulation: Bleeding & Shock Management (EMR)',
    category: 'EMR',
    steps: [
      { text: 'Takes BSI precautions and ensures scene safety.', critical: true },
      { text: 'Applies direct pressure to the wound using sterile dressing.', critical: true },
      { text: 'Applies a pressure dressing over the wound to maintain control.', critical: false },
      { text: 'Identifies that direct pressure failed to control bleeding and applies high-and-tight combat tourniquet.', critical: true },
      { text: 'Tightens tourniquet windlass until bleeding stops and distal pulse is impalpable.', critical: true },
      { text: 'Writes time of application on the tourniquet band.', critical: false },
      { text: 'Recognizes systemic signs of shock (hypoperfusion).', critical: true },
      { text: 'Administers high-flow supplemental oxygen.', critical: false },
      { text: 'Positions patient supine (flat on back).', critical: true },
      { text: 'Prevents heat loss by wrapping patient in warm blankets.', critical: true },
      { text: 'Stresses immediate transport priority.', critical: false }
    ]
  },
  {
    id: 'chk-emr-immobilization',
    title: 'Basic Immobilization: Bone, Joint, & Spinal (EMR)',
    category: 'EMR',
    steps: [
      { text: 'Takes BSI precautions.', critical: false },
      { text: 'Directs partner to maintain manual stabilization of injury or head/neck.', critical: true },
      { text: 'Checks distal Pulse, Motor, and Sensory function (PMS) in the affected extremity.', critical: true },
      { text: 'Selects splint of appropriate size and pre-pads if rigid.', critical: false },
      { text: 'Applies splint, immobilizing joint above and joint below the injury.', critical: true },
      { text: 'Secures splint snugly, ensuring no restriction of circulation.', critical: false },
      { text: 'Re-evaluates distal PMS immediately after splinting.', critical: true },
      { text: 'For spinal: measures and applies appropriately sized cervical collar (C-collar).', critical: true },
      { text: 'Logs patient onto backboard maintaining axial alignment, secures torso then head.', critical: true }
    ]
  },

  // =========================================================================
  // 2. EMT (Emergency Medical Technician)
  // =========================================================================
  {
    id: 'chk-emt-trauma',
    title: 'Trauma Patient Assessment (EMT)',
    category: 'EMT',
    steps: [
      { text: 'Takes BSI precautions and ensures scene safety.', critical: true },
      { text: 'Determines Mechanism of Injury (MOI) and number of patients.', critical: false },
      { text: 'Requests additional resources (manpower, mutual aid, transport).', critical: false },
      { text: 'Considers immediate C-spine stabilization.', critical: true },
      { text: 'Formulates general impression and assesses level of consciousness (AVPU).', critical: false },
      { text: 'Identifies and controls any life-threatening external hemorrhage.', critical: true },
      { text: 'Assesses airway, breathing, and initiates appropriate oxygen therapy.', critical: true },
      { text: 'Assesses circulation (radial pulse, skin color/temp/condition).', critical: true },
      { text: 'Establishes priority patient status and makes transport decision.', critical: true },
      { text: 'Performs rapid trauma head-to-toe scan (DCAP-BTLS).', critical: false },
      { text: 'Obtains baseline vital signs and SAMPLE / OPQRST history.', critical: false }
    ]
  },
  {
    id: 'chk-emt-med',
    title: 'Medical Patient Assessment (EMT)',
    category: 'EMT',
    steps: [
      { text: 'Takes BSI precautions and determines scene safety.', critical: true },
      { text: 'Determines Nature of Illness (NOI).', critical: false },
      { text: 'Assesses level of consciousness (AVPU) and general impression.', critical: false },
      { text: 'Assesses airway patency and administers appropriate oxygen therapy.', critical: true },
      { text: 'Assesses circulation (radial pulse, skin signs) and manages shock.', critical: true },
      { text: 'Makes priority transport decision.', critical: true },
      { text: 'Obtains History of Present Illness (OPQRST questions).', critical: false },
      { text: 'Obtains Past Medical History (SAMPLE).', critical: false },
      { text: 'Performs focused physical exam of affected body system.', critical: false },
      { text: 'Verifies correct clinical intervention based on protocols.', critical: true }
    ]
  },
  {
    id: 'chk-emt-cardiac-aed',
    title: 'Cardiac Arrest & AED Integration (EMT)',
    category: 'EMT',
    steps: [
      { text: 'Takes BSI precautions and ensures scene safety.', critical: true },
      { text: 'Asserts pulselessness and apnea (checks carotid pulse and breathing for 5-10s).', critical: true },
      { text: 'Initiates immediate high-quality CPR (30 compressions to 2 ventilations).', critical: true },
      { text: 'Directs secondary responder to turn on AED and attach pads without interrupting CPR.', critical: true },
      { text: 'Assures everyone is clear of the patient during EKG analysis.', critical: true },
      { text: 'Delivers shock when advised by AED, immediately resuming chest compressions afterward.', critical: true },
      { text: 'Performs 5 cycles (2 minutes) of CPR before allowing AED to re-analyze.', critical: false },
      { text: 'Maintains effective compression depth (2.0 - 2.4 inches) and rate (100 - 120/min).', critical: true },
      { text: 'Uses high-flow oxygen with BVM during resuscitation.', critical: false }
    ]
  },
  {
    id: 'chk-emt-med-admin',
    title: 'Medication Administration Assistance (EMT)',
    category: 'EMT',
    steps: [
      { text: 'Takes BSI precautions.', critical: false },
      { text: 'Obtains medical director order (direct or standing protocol).', critical: true },
      { text: 'Verifies the "Six Rights" of medication administration (Patient, Drug, Dose, Route, Time, Documentation).', critical: true },
      { text: 'Checks expiration date and physical appearance of the medication.', critical: true },
      { text: 'For Nitroglycerin: checks BP (>100 systolic) and confirms no erectile dysfunction meds within 24-48 hours.', critical: true },
      { text: 'Administers Nitroglycerin sublingually (0.4mg spray or tablet) or assists patient with administration.', critical: false },
      { text: 'For Epinephrine Auto-Injector: selects correct dose (0.3mg adult, 0.15mg pediatric) and injects into lateral thigh (holds for 3s).', critical: true },
      { text: 'For Oral Glucose: ensures patient is conscious, alert, and able to swallow before administering into cheek.', critical: true },
      { text: 'Re-evaluates patient vital signs and documents dose, time, and patient response.', critical: false }
    ]
  },
  {
    id: 'chk-emt-sga-insert',
    title: 'Airway Adjuncts: Supraglottic Airway Insertion (EMT)',
    category: 'EMT',
    steps: [
      { text: 'Takes BSI precautions and ensures patient is pre-oxygenated.', critical: true },
      { text: 'Selects correct size SGA device (i-gel or King Tube) based on patient height/weight.', critical: false },
      { text: 'Lubricates the distal tip/bevel of the device using water-soluble lubricant.', critical: false },
      { text: 'Maintains manual head position (sniffing or neutral position).', critical: false },
      { text: 'Inserts the device into the midline of the mouth and advances to the marked depth.', critical: true },
      { text: 'If using King LT: inflates the cuff to the recommended pressure or volume.', critical: false },
      { text: 'Attaches BVM and begins ventilating the patient.', critical: true },
      { text: 'Confirms placement via bilateral chest rise, auscultation of lungs, and absent gastric sounds.', critical: true },
      { text: 'Verifies placement with end-tidal CO2 (capnography) indicating carbon dioxide excretion.', critical: true },
      { text: 'Secures the tube with a commercial tube holder and continues ventilations (1 breath every 6s).', critical: false }
    ]
  },
  {
    id: 'chk-emt-traction-splint',
    title: 'Traction Splinting: Femur Fractures (EMT)',
    category: 'EMT',
    steps: [
      { text: 'Takes BSI precautions and ensures scene safety.', critical: false },
      { text: 'Directs partner to apply manual inline stabilization and traction of the injured leg.', critical: true },
      { text: 'Assesses distal Pulse, Motor, and Sensory function (PMS) in the injured leg.', critical: true },
      { text: 'Measures splint against uninjured leg to adjust length, ensuring it extends past heel.', critical: false },
      { text: 'Positions splint under injured leg, seating the proximal ischial pad against the pelvis.', critical: true },
      { text: 'Secures proximal groin strap snugly.', critical: true },
      { text: 'Applies ankle hitch snugly around ankle and foot.', critical: false },
      { text: 'Attaches ankle hitch to traction crank and applies mechanical traction until pain/spasm is relieved.', critical: true },
      { text: 'Secures remaining support straps around thigh, knee, and calf.', critical: false },
      { text: 'Re-assesses distal PMS in the splinted leg, noting any changes.', critical: true }
    ]
  },

  // =========================================================================
  // 3. AEMT (Advanced EMT)
  // =========================================================================
  {
    id: 'chk-aemt-iv-io',
    title: 'IV & IO Access (AEMT)',
    category: 'AEMT',
    steps: [
      { text: 'Takes BSI precautions.', critical: false },
      { text: 'Prepares and inspects fluid bag (clarity, expiration) and primes administration line.', critical: true },
      { text: 'For IV: applies tourniquet, selects and cleanses vein with alcohol/chlorhexidine.', critical: false },
      { text: 'Inserts IV catheter with bevel up, observes flashback, advances catheter, and retracts needle.', critical: true },
      { text: 'Disposes of IV needle in sharps container immediately.', critical: true },
      { text: 'Releases tourniquet, connects saline lock or IV line, and flushes to verify patency.', critical: true },
      { text: 'For IO: selects site (proximal tibia or humeral head), cleanses site with antiseptic.', critical: false },
      { text: 'Loads IO needle onto driver, penetrates skin, and drills through cortex until "give" is felt.', critical: true },
      { text: 'Removes stylet, disposes of sharps, attaches extension set, and aspirates for marrow.', critical: true },
      { text: 'Flushes IO with 2-5mL Lidocaine (if conscious, for pain) followed by normal saline.', critical: true },
      { text: 'Secures dressing and monitors site for infiltration or swelling.', critical: true }
    ]
  },
  {
    id: 'chk-aemt-et-intubation',
    title: 'Advanced Airway: Endotracheal Intubation (AEMT)',
    category: 'AEMT',
    steps: [
      { text: 'Takes BSI precautions.', critical: false },
      { text: 'Ensures manual ventilations and pre-oxygenation are active.', critical: true },
      { text: 'Assembles and tests equipment: laryngoscope blade light, ET tube cuff integrity, stylet insertion.', critical: true },
      { text: 'Positions patient head (sniffing position) and removes any oral obstructions.', critical: false },
      { text: 'Inserts laryngoscope blade, sweeps tongue to left, and visualizes vocal cords.', critical: true },
      { text: 'Inserts ET tube through vocal cords under direct visualization (cuff placed 2-3cm past cords).', critical: true },
      { text: 'Limits each intubation attempt to a maximum of 30 seconds.', critical: true },
      { text: 'Inflates cuff, removes stylet, and attaches BVM with capnography.', critical: false },
      { text: 'Confirms placement via bilateral chest rise, auscultation, and continuous waveform capnography.', critical: true },
      { text: 'Secures tube with commercial holder, notes depth at teeth, and continues ventilations.', critical: false }
    ]
  },
  {
    id: 'chk-aemt-med-push',
    title: 'Advanced Medication: IM, SQ, IV Push, & Nebulized (AEMT)',
    category: 'AEMT',
    steps: [
      { text: 'Takes BSI precautions.', critical: false },
      { text: 'Confirms medical order and verifies the Six Rights of drug administration.', critical: true },
      { text: 'For IM/SQ: selects correct syringe, needle gauge/length, and draws correct dosage.', critical: false },
      { text: 'Cleanses site, stretches/pinches skin, and injects at proper angle (90° IM, 45° SQ).', critical: true },
      { text: 'For IV Push: cleanses IV port, attaches syringe, aspirates for blood, and administers at correct rate.', critical: true },
      { text: 'Flushes IV port with saline after IV push medication.', critical: true },
      { text: 'For Nebulized: places medication in cup, connects oxygen flow (6-8 L/min) until misting occurs.', critical: false },
      { text: 'Places nebulizer mask on patient and instructs them to take slow, deep breaths.', critical: false },
      { text: 'Disposes of all needles/syringes in sharps container immediately.', critical: true },
      { text: 'Monitors vitals and documents administration time, dosage, and patient response.', critical: true }
    ]
  },
  {
    id: 'chk-aemt-cardiac-monitoring',
    title: 'Cardiac Monitoring: 4-Lead ECG & Rhythm Recognition (AEMT)',
    category: 'AEMT',
    steps: [
      { text: 'Takes BSI precautions.', critical: false },
      { text: 'Prepares patient skin: clips hair or wipes moisture if necessary.', critical: false },
      { text: 'Places electrodes correctly (White on Right, Clouds over Grass, Smoke over Fire).', critical: true },
      { text: 'Connects lead wires to electrodes and powers on the monitor.', critical: false },
      { text: 'Selects Lead II for monitoring.', critical: false },
      { text: 'Identifies and minimizes artifact to obtain a clean EKG tracing.', critical: false },
      { text: 'Interprets the rhythm: measures heart rate, checks regularity, assesses QRS width, and searches for P waves.', critical: true },
      { text: 'Accurately diagnoses life threats (e.g., V-Fib, V-Tach, Complete Block, or Asystole).', critical: true },
      { text: 'Communicates findings clearly to transport team or medical control.', critical: false }
    ]
  }
];

const EKG_RHYTHMS: EkgRhythm[] = [
  // 1. The Basics & Life Threats (Shockable & Asystole)
  {
    id: 'nsr',
    name: 'Normal Sinus Rhythm (NSR)',
    category: 'Basics & Life Threats (Shockable & Asystole)',
    rate: 72,
    regularity: 'Regular',
    qrs: 'Narrow',
    pWave: 'Present',
    description: 'Normal electrical conduction starting from SA node. Each QRS is preceded by an upright P wave.',
    treatment: 'Normal physiological state. Continue monitoring as clinically indicated.'
  },
  {
    id: 'vfib',
    name: 'Ventricular Fibrillation (V-Fib)',
    category: 'Basics & Life Threats (Shockable & Asystole)',
    rate: 0,
    regularity: 'None',
    qrs: 'Absent',
    pWave: 'Absent',
    description: 'Chaotic, disorganized quivering of the ventricles with no organized waves. Complete cardiac arrest.',
    treatment: 'Immediate high-quality CPR and Defibrillation (shockable!). Administer Epinephrine 1mg every 3-5 mins and Amiodarone 300mg IV/IO.'
  },
  {
    id: 'vtach',
    name: 'Ventricular Tachycardia (V-Tach)',
    category: 'Basics & Life Threats (Shockable & Asystole)',
    rate: 160,
    regularity: 'Regular',
    qrs: 'Wide',
    pWave: 'Absent',
    description: 'A rapid, wide-complex rhythm originating in the ventricles. Can be pulseless (complete cardiac arrest) or perfusing with a pulse.',
    treatment: 'If pulseless: high-quality CPR and Defibrillation (shockable!). If patient is perfusing but unstable: Synchronized Cardioversion. If stable: Cardioversion or antiarrhythmic medications (Amiodarone/Lidocaine).'
  },
  {
    id: 'asystole',
    name: 'Asystole (Flatline)',
    category: 'Basics & Life Threats (Shockable & Asystole)',
    rate: 0,
    regularity: 'None',
    qrs: 'Absent',
    pWave: 'Absent',
    description: 'Complete cessation of electrical and mechanical cardiac activity (a flat line). Non-shockable cardiac arrest.',
    treatment: 'Immediate high-quality CPR, airway management, and Epinephrine 1mg IV/IO every 3-5 mins (defibrillation will not work). Search for and treat reversible causes (Hs & Ts).'
  },
  {
    id: 'pea',
    name: 'Pulseless Electrical Activity (PEA)',
    category: 'Basics & Life Threats (Shockable & Asystole)',
    rate: 70,
    regularity: 'Regular',
    qrs: 'Narrow or Wide',
    pWave: 'Present or Absent',
    description: 'Any organized electrical rhythm (other than V-Fib/V-Tach) displaying on the monitor but with no palpable pulse. Non-shockable cardiac arrest.',
    treatment: 'Immediate high-quality CPR and Epinephrine 1mg IV/IO every 3-5 mins. Treat underlying causes (Hs & Ts) such as hypoxia, hypovolemia, and tension pneumothorax.'
  },

  // 2. Stable/Unstable Tachycardias
  {
    id: 'sinus_tach',
    name: 'Sinus Tachycardia',
    category: 'Stable/Unstable Tachycardias',
    rate: 125,
    regularity: 'Regular',
    qrs: 'Narrow',
    pWave: 'Present',
    description: 'A fast, regular rhythm with visible, normal P waves preceding every QRS. It is typically a physiological response to stress.',
    treatment: 'Treat the underlying cause (pain, fever, hypovolemia, hypoxia, anxiety) rather than attempting to slow the heart rate directly.'
  },
  {
    id: 'svt',
    name: 'Supraventricular Tachycardia (SVT)',
    category: 'Stable/Unstable Tachycardias',
    rate: 185,
    regularity: 'Regular',
    qrs: 'Narrow',
    pWave: 'Buried or Absent',
    description: 'A rapid, narrow-complex rhythm originating above the ventricles, where the rate is generally >150 bpm and P waves are usually buried or absent.',
    treatment: 'If stable: vagal maneuvers followed by rapid IV push of Adenosine (6mg, then 12mg). If unstable (altered mental status, hypotension): perform immediate Synchronized Cardioversion.'
  },
  {
    id: 'afib',
    name: 'Atrial Fibrillation (A-Fib)',
    category: 'Stable/Unstable Tachycardias',
    rate: 115,
    regularity: 'Irregular',
    qrs: 'Narrow',
    pWave: 'Fibrillatory',
    description: 'Irregularly irregular R-R intervals with narrow QRS complexes and no distinct P waves (replaced by chaotic, wavy fibrillatory baseline).',
    treatment: 'Monitor rate and perfusion. If stable: manage rate (Beta-blockers, Calcium channel blockers), anticoagulation. If unstable and rapid: Synchronized Cardioversion.'
  },
  {
    id: 'aflutter',
    name: 'Atrial Flutter',
    category: 'Stable/Unstable Tachycardias',
    rate: 100,
    regularity: 'Regular',
    qrs: 'Narrow',
    pWave: 'Sawtooth F-waves',
    description: 'A rapid atrial rhythm characterized by continuous, regular "sawtooth" baseline waves (F-waves), usually with a regular conduction ratio (e.g., 2:1 or 3:1).',
    treatment: 'Same as A-Fib; manage ventricular rate using Beta-blockers or Calcium channel blockers. If unstable and rapid: Synchronized Cardioversion.'
  },

  // 3. Bradycardias
  {
    id: 'brady',
    name: 'Sinus Bradycardia',
    category: 'Bradycardias',
    rate: 42,
    regularity: 'Regular',
    qrs: 'Narrow',
    pWave: 'Present',
    description: 'Normal P, QRS, and T waves, but the heart rate is under 60 beats per minute. Only requires intervention if symptomatic.',
    treatment: 'If asymptomatic: monitor. If symptomatic (hypotension, chest pain, syncope, altered GCS): administer Atropine 1 mg IV, prepare for Transcutaneous Pacing (TCP) or Epinephrine/Dopamine infusion.'
  },
  {
    id: 'first_degree_block',
    name: 'First-Degree AV Block',
    category: 'Bradycardias',
    rate: 58,
    regularity: 'Regular',
    qrs: 'Narrow',
    pWave: 'Prolonged PR',
    description: 'Constant, prolonged PR interval (>0.20 seconds or more than 5 small squares). Every P wave is followed by a QRS complex; heart rate can be normal.',
    treatment: 'Typically benign and asymptomatic. Monitor the patient and evaluate for potential pharmaceutical causes (e.g. Beta-blockers, Calcium channel blockers).'
  },
  {
    id: 'second_degree_type1',
    name: 'Second-Degree AV Block (Mobitz Type I / Wenckebach)',
    category: 'Bradycardias',
    rate: 48,
    regularity: 'Irregular',
    qrs: 'Narrow',
    pWave: 'Progressively Prolonged',
    description: 'The PR interval gets progressively longer with each beat until a QRS complex is completely dropped, after which the cycle repeats.',
    treatment: 'Observe and monitor if asymptomatic. If symptomatic (signs of poor perfusion): administer Atropine 1mg IV or prepare for Transcutaneous Pacing (TCP).'
  },
  {
    id: 'second_degree_type2',
    name: 'Second-Degree AV Block (Mobitz Type II)',
    category: 'Bradycardias',
    rate: 38,
    regularity: 'Irregular',
    qrs: 'Narrow or Wide',
    pWave: 'Constant PR, Dropped QRS',
    description: 'PR intervals remain constant, but some P waves fail to conduct to the ventricles, causing dropped QRS complexes. This is highly unstable and can rapidly progress to Complete Heart Block.',
    treatment: 'Do NOT rely on Atropine. Initiate Transcutaneous Pacing (TCP) immediately if symptomatic or unstable, and prepare for permanent pacemaker insertion.'
  },
  {
    id: 'third_degree_block',
    name: 'Third-Degree AV Block (Complete Heart Block)',
    category: 'Bradycardias',
    rate: 30,
    regularity: 'Regular',
    qrs: 'Wide (usually)',
    pWave: 'Independent (Dissociated)',
    description: 'Atria and ventricles beat independently (complete dissociation between P waves and QRS complexes). No electrical signals conduct from atria to ventricles.',
    treatment: 'For unstable bradycardia: initiate Transcutaneous Pacing (TCP) immediately. Prepare Epinephrine or Dopamine infusion. Atropine is generally ineffective due to the infranodal block.'
  },
  {
    id: 'brady_to_asystole',
    name: 'Bradycardia to Asystole (Dying Heart)',
    category: 'Bradycardias',
    rate: 42,
    regularity: 'Regular -> Flatline',
    qrs: 'Narrow -> Absent',
    pWave: 'Present -> Absent',
    description: 'Presents initially as a slow Bradycardia, but then suddenly stops conducting electrical pulses and deteriorates into Asystole (flatline) as the strip scrolls on, simulating a dying heart arrest.',
    treatment: 'Confirm flatline in two leads. Start high-quality CPR (chest compressions) immediately. Administer Epinephrine 1mg IV/IO every 3-5 minutes. Search for and treat reversible H\'s and T\'s.'
  },

  // 4. Ectopy & Other Rhythms
  {
    id: 'pvcs',
    name: 'Premature Ventricular Contractions (PVCs)',
    category: 'Ectopy & Other Rhythms',
    rate: 75,
    regularity: 'Irregular',
    qrs: 'Wide & Bizarre PVCs',
    pWave: 'Present (underlying)',
    description: 'Wide, bizarre early beats that interrupt the underlying regular rhythm. Frequent or consecutive PVCs can signal underlying myocardial ischemia, hypoxia, or risk for V-Tach.',
    treatment: 'Treat the underlying cause (hypoxia, electrolyte imbalance, or ischemia). Monitor closely; antiarrhythmics are considered in symptomatic cases.'
  },
  {
    id: 'torsades',
    name: 'Torsades de Pointes',
    category: 'Ectopy & Other Rhythms',
    rate: 200,
    regularity: 'Irregular',
    qrs: 'Polymorphic Wide',
    pWave: 'Absent',
    description: 'A specific polymorphic V-Tach that looks like a "twisting of the points" around the isoelectric baseline. Often associated with prolonged QT interval.',
    treatment: 'Intravenous Magnesium Sulfate is the drug of choice. Defibrillate immediately if pulseless.'
  },
  {
    id: 'nsr_pvcs',
    name: 'Normal Sinus Rhythm with PVCs',
    category: 'Ectopy & Other Rhythms',
    rate: 72,
    regularity: 'Irregular',
    qrs: 'Narrow with Wide PVCs',
    pWave: 'Present (underlying)',
    description: 'An underlying Normal Sinus Rhythm where early, wide, bizarre QRS complexes (PVCs) occasionally interrupt the normal beat. There are no preceding P waves for the PVCs, and they are followed by a compensatory pause.',
    treatment: 'Asymptomatic PVCs do not require treatment. If frequent, assess for hypoxia, electrolyte imbalances (hypokalemia), acid-base disturbance, or ischemia.'
  },
  {
    id: 'nsr_to_vfib',
    name: 'NSR to Ventricular Fibrillation (Sudden Arrest)',
    category: 'Ectopy & Other Rhythms',
    rate: 72,
    regularity: 'Regular -> Chaotic',
    qrs: 'Narrow -> Absent',
    pWave: 'Present -> Absent',
    description: 'Starts as a regular Normal Sinus Rhythm, but suddenly degenerates into chaotic Ventricular Fibrillation (V-Fib) representing sudden cardiac arrest. At first, the clinician cannot foresee it, but the lethal transition unfolds as the strip sweeps.',
    treatment: 'Immediate chest compressions / high-quality CPR and rapid Defibrillation (shockable rhythm!). Set up IV/IO, administer Epinephrine 1mg every 3-5 minutes, and Amiodarone 300mg.'
  },
  {
    id: 'nsr_to_vtach',
    name: 'NSR to Ventricular Tachycardia (Run of V-Tach)',
    category: 'Ectopy & Other Rhythms',
    rate: 72,
    regularity: 'Regular -> Fast Run',
    qrs: 'Narrow -> Wide',
    pWave: 'Present -> Absent',
    description: 'Initially presents as Normal Sinus Rhythm (NSR) but abruptly bursts into a fast, highly unstable run of wide-complex Ventricular Tachycardia (V-Tach) as the strip scrolls on.',
    treatment: 'Check patient responsiveness and pulse immediately. If pulseless, treat as V-Fib (defibrillate). If conscious with pulse, consider Amiodarone or synchronized Cardioversion.'
  },
  {
    id: 'svt_to_nsr',
    name: 'SVT to NSR (Adenosine Effect)',
    category: 'Stable/Unstable Tachycardias',
    rate: 180,
    regularity: 'Regular -> Converted',
    qrs: 'Narrow',
    pWave: 'Absent -> Present',
    description: 'A rapid Supraventricular Tachycardia (SVT) at 180 bpm is seen, followed by chemical administration of Adenosine. A brief pause (flatline) of AV-block occurs, showing up before spontaneously converting into a stable Normal Sinus Rhythm.',
    treatment: 'Confirm successful chemical conversion. Continue to assess blood pressure, mental status, and prepare a post-conversion 12-lead ECG. Monitor for SVT recurrence.'
  },
  {
    id: 'nsr_to_pause',
    name: 'NSR with Sinus Pause (Arrest)',
    category: 'Bradycardias',
    rate: 72,
    regularity: 'Irregular (Pause)',
    qrs: 'Narrow',
    pWave: 'Present (underlying)',
    description: 'An underlying Normal Sinus Rhythm that is suddenly interrupted by a failure of the SA node to fire, resulting in a dramatic 3-second sinus arrest (flatline) before normal beats resume as the strip progresses.',
    treatment: 'Observe closely. If symptomatic (dizziness, syncope), prepare Atropine or Transcutaneous Pacing (TCP). Review and hold causative drugs (beta-blockers, calcium channel blockers).'
  }
];

// =========================================================================
// INTERACTIVE EKG GUIDE DISPLAY FOR THE MONITOR
// =========================================================================

interface EkgGuideMonitorDisplayProps {
  subTab: 'intro' | 'leads' | 'anatomy' | 'rules';
  activeIntroNode: 'sa' | 'av' | 'purkinje' | null;
  setActiveIntroNode: (node: 'sa' | 'av' | 'purkinje') => void;
  activeAnatomySegment: number;
  setActiveAnatomySegment: (seg: number) => void;
  activeLeadSystem: '4lead' | '12lead';
  setActiveLeadSystem: (lead: '4lead' | '12lead') => void;
  activeRulesStep: number;
  setActiveRulesStep: (step: number) => void;
}

function EkgGuideMonitorDisplay({
  subTab,
  activeIntroNode,
  setActiveIntroNode,
  activeAnatomySegment,
  setActiveAnatomySegment,
  activeLeadSystem,
  setActiveLeadSystem,
  activeRulesStep,
  setActiveRulesStep
}: EkgGuideMonitorDisplayProps) {
  return (
    <div className="w-full h-full text-white font-sans flex flex-col justify-between p-3 select-none relative overflow-hidden">
      {/* Dynamic Grid Background overlay for medical diagnostic look */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="monitor-grid-small" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#10b981" strokeWidth="0.5" />
            </pattern>
            <pattern id="monitor-grid-large" width="25" height="25" patternUnits="userSpaceOnUse">
              <rect width="25" height="25" fill="url(#monitor-grid-small)" />
              <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#10b981" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#monitor-grid-large)" />
        </svg>
      </div>

      {/* Screen Glare overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-500/[0.02] to-transparent pointer-events-none" />

      {/* TOP HEADER */}
      <div className="flex justify-between items-center text-[9px] font-mono tracking-widest text-emerald-400 border-b border-zinc-900/50 pb-1.5 z-10 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-bold">GUIDE SIMULATION MODE</span>
        </div>
        <div className="font-bold uppercase text-right">
          {subTab === 'intro' && "Anatomy & Conduction Pathways"}
          {subTab === 'leads' && "Camera Vector Angles: 4-Lead vs 12-Lead"}
          {subTab === 'anatomy' && `Beat Waveform Segments: Segment ${activeAnatomySegment}/5`}
          {subTab === 'rules' && `Step ${activeRulesStep}/5: Diagnostic Reading Check`}
        </div>
      </div>

      {/* CENTER WORKSPACE */}
      <div className="flex-1 min-h-0 py-1 flex items-center justify-center relative z-10">
        <AnimatePresence mode="wait">
          {/* SUBTAB 1: INTRO (HEART + NODE MAPPING) */}
          {subTab === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex flex-col md:grid md:grid-cols-12 gap-3"
            >
              {/* Left Side: Heart conduction vector drawing */}
              <div className="md:col-span-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-zinc-900/40 pb-2 md:pb-0 pr-0 md:pr-2 shrink-0">
                <span className="text-[8px] font-mono uppercase text-zinc-400 mb-1">Click a heart conduction node:</span>
                <svg viewBox="0 0 140 140" className="w-24 h-24 cursor-pointer select-none">
                  {/* Base Heart outline */}
                  <path 
                    d="M 70 20 C 40 5, 12 35, 12 65 C 12 98, 70 132, 70 132 C 70 132, 128 98, 128 65 C 128 35, 100 5, 70 20 Z" 
                    fill="#150808" 
                    stroke="rgba(239, 68, 68, 0.25)" 
                    strokeWidth="1.5" 
                  />
                  {/* Septum line */}
                  <path d="M 70 42 L 70 128" stroke="rgba(239, 68, 68, 0.15)" strokeWidth="1" strokeDasharray="2 3" />
                  
                  {/* Conduction fibers (Purkinje) */}
                  <path 
                    d="M 68 70 L 68 85 C 68 95, 50 108, 38 105 M 68 85 C 68 95, 88 108, 102 105" 
                    fill="none" 
                    stroke={activeIntroNode === 'purkinje' ? '#22d3ee' : '#27272a'} 
                    strokeWidth={activeIntroNode === 'purkinje' ? "2" : "1.5"}
                    className="transition-all"
                  />
                  {/* Thin branching Purkinje paths */}
                  <path 
                    d="M 38 105 Q 26 95, 22 80 M 102 105 Q 114 95, 118 80" 
                    fill="none" 
                    stroke={activeIntroNode === 'purkinje' ? '#22d3ee' : '#18181b'} 
                    strokeWidth="1"
                    strokeDasharray="2 1"
                  />

                  {/* SA Node button dot */}
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="8" 
                    fill={activeIntroNode === 'sa' ? '#ef4444' : '#52525b'} 
                    className="transition-all hover:scale-125 cursor-pointer opacity-40"
                    onClick={() => setActiveIntroNode('sa')}
                  />
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="4" 
                    fill={activeIntroNode === 'sa' ? '#f87171' : '#a1a1aa'} 
                    className="transition-all cursor-pointer"
                    onClick={() => setActiveIntroNode('sa')}
                  />
                  {activeIntroNode === 'sa' && (
                    <circle cx="40" cy="40" r="12" fill="none" stroke="#ef4444" strokeWidth="1" className="animate-ping" />
                  )}

                  {/* AV Node button dot */}
                  <circle 
                    cx="68" 
                    cy="70" 
                    r="8" 
                    fill={activeIntroNode === 'av' ? '#f59e0b' : '#52525b'} 
                    className="transition-all hover:scale-125 cursor-pointer opacity-40"
                    onClick={() => setActiveIntroNode('av')}
                  />
                  <circle 
                    cx="68" 
                    cy="70" 
                    r="4" 
                    fill={activeIntroNode === 'av' ? '#fbbf24' : '#a1a1aa'} 
                    className="transition-all cursor-pointer"
                    onClick={() => setActiveIntroNode('av')}
                  />
                  {activeIntroNode === 'av' && (
                    <circle cx="68" cy="70" r="12" fill="none" stroke="#f59e0b" strokeWidth="1" className="animate-ping" />
                  )}

                  {/* Purkinje node selector button zones */}
                  <circle 
                    cx="55" 
                    cy="105" 
                    r="7" 
                    fill="none" 
                    className="cursor-pointer hover:bg-cyan-500/20 rounded-full" 
                    onClick={() => setActiveIntroNode('purkinje')}
                  />
                  <circle 
                    cx="85" 
                    cy="105" 
                    r="7" 
                    fill="none" 
                    className="cursor-pointer hover:bg-cyan-500/20 rounded-full" 
                    onClick={() => setActiveIntroNode('purkinje')}
                  />
                  {activeIntroNode === 'purkinje' && (
                    <>
                      <circle cx="38" cy="105" r="3" fill="#22d3ee" className="animate-pulse" />
                      <circle cx="102" cy="105" r="3" fill="#22d3ee" className="animate-pulse" />
                    </>
                  )}
                </svg>
              </div>

              {/* Right Side: Conduction to EKG wave mapping */}
              <div className="md:col-span-7 flex flex-col justify-between md:pl-2 flex-1 min-h-0">
                <div className="relative flex-1 bg-black/40 rounded-xl p-2.5 border border-zinc-900/60 flex flex-col justify-between">
                  <div className="flex justify-between items-center border-b border-zinc-900/40 pb-1 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-100 flex items-center gap-1.5">
                      {activeIntroNode === 'sa' && <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />}
                      {activeIntroNode === 'av' && <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />}
                      {activeIntroNode === 'purkinje' && <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />}
                      {activeIntroNode === 'sa' && "SA NODE pacemaker (60-100 BPM)"}
                      {activeIntroNode === 'av' && "AV NODE gatekeeper (40-60 BPM)"}
                      {activeIntroNode === 'purkinje' && "PURKINJE fibers (20-40 BPM)"}
                    </span>
                  </div>

                  <p className="text-[10px] text-zinc-300 font-semibold leading-relaxed">
                    {activeIntroNode === 'sa' && "The heart's natural pacemaker. Initiates depolarization in the atrium, which forces blood down into the ventricles and draws the P WAVE."}
                    {activeIntroNode === 'av' && "Hold the signal for ~0.1 seconds to allow the mechanical filling of the ventricles. This delay forms the flat PR INTERVAL on your EKG."}
                    {activeIntroNode === 'purkinje' && "Shoots the signal through the ventricles at blazing speed, leading to powerful contraction and creating the sharp, tall QRS COMPLEX."}
                  </p>

                  {/* MINI EKG WAVEFORM RE-DRAW WITH GLOW ACCORDING TO STATE */}
                  <div className="h-16 w-full flex items-center justify-center mt-1 bg-[#09090b] rounded-lg border border-zinc-900 overflow-hidden relative">
                    <svg viewBox="0 0 180 80" className="w-full h-full">
                      {/* Grid background */}
                      <line x1="0" y1="40" x2="180" y2="40" stroke="#18181b" strokeWidth="0.5" />
                      
                      {/* Entire Base curve (muted background) */}
                      <path 
                        d="M 5 45 L 25 45 C 30 45, 33 34, 38 34 C 43 34, 46 45, 52 45 L 75 45 L 81 49 L 90 10 L 99 57 L 102 45 L 125 45 C 132 45, 137 32, 142 32 C 147 32, 152 45, 158 45 L 175 45"
                        fill="none" 
                        stroke="#27272a" 
                        strokeWidth="1.5" 
                      />

                      {/* Highlighted active curves */}
                      {activeIntroNode === 'sa' && (
                        <motion.path 
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5 }}
                          d="M 25 45 C 30 45, 33 34, 38 34 C 43 34, 46 45, 52 45"
                          fill="none" 
                          stroke="#ef4444" 
                          strokeWidth="2.5" 
                          strokeLinecap="round"
                          className="drop-shadow-[0_0_4px_rgba(239,68,68,0.7)]"
                        />
                      )}

                      {activeIntroNode === 'av' && (
                        <motion.path 
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5 }}
                          d="M 25 45 C 30 45, 33 34, 38 34 C 43 34, 46 45, 52 45 L 75 45"
                          fill="none" 
                          stroke="#fbbf24" 
                          strokeWidth="2.5" 
                          strokeLinecap="round"
                          className="drop-shadow-[0_0_4px_rgba(251,191,36,0.7)]"
                        />
                      )}

                      {activeIntroNode === 'purkinje' && (
                        <motion.path 
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5 }}
                          d="M 75 45 L 81 49 L 90 10 L 99 57 L 102 45"
                          fill="none" 
                          stroke="#22d3ee" 
                          strokeWidth="2.5" 
                          strokeLinecap="round"
                          className="drop-shadow-[0_0_4px_rgba(34,211,238,0.7)]"
                        />
                      )}

                      {/* Labels */}
                      {activeIntroNode === 'sa' && (
                        <text x="38" y="24" fill="#ef4444" fontSize="6" fontFamily="monospace" fontWeight="bold" textAnchor="middle">P WAVE (Atria Contract)</text>
                      )}
                      {activeIntroNode === 'av' && (
                        <text x="50" y="58" fill="#fbbf24" fontSize="6" fontFamily="monospace" fontWeight="bold" textAnchor="middle">PR INTERVAL (Conduction Delay)</text>
                      )}
                      {activeIntroNode === 'purkinje' && (
                        <text x="90" y="5" fill="#22d3ee" fontSize="6" fontFamily="monospace" fontWeight="bold" textAnchor="middle">QRS COMPLEX (Ventricles Contract)</text>
                      )}
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SUBTAB 2: LEADS (4-LEAD VS 12-LEAD TORSO PLACEMENTS) */}
          {subTab === 'leads' && (
            <motion.div 
              key="leads"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex flex-col"
            >
              <div className="flex gap-2 mb-1.5 self-center bg-zinc-900/80 p-0.5 rounded-lg border border-zinc-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveLeadSystem('4lead')}
                  className={cn(
                    "px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all",
                    activeLeadSystem === '4lead' ? "bg-emerald-500 text-black shadow" : "text-zinc-400 hover:text-white"
                  )}
                >
                  3 / 4-Lead Placement
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLeadSystem('12lead')}
                  className={cn(
                    "px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all",
                    activeLeadSystem === '12lead' ? "bg-emerald-500 text-black shadow" : "text-zinc-400 hover:text-white"
                  )}
                >
                  Diagnostic 12-Lead
                </button>
              </div>

              <div className="flex-1 min-h-0 flex flex-col md:grid md:grid-cols-12 gap-3 md:items-center">
                {/* Torso Drawing panel */}
                <div className="md:col-span-5 flex justify-center items-center border-b md:border-b-0 md:border-r border-zinc-900/40 pb-2 md:pb-0 pr-0 md:pr-2 shrink-0">
                  <svg viewBox="0 0 160 140" className="w-24 h-24 relative">
                    {/* Real torso outline */}
                    <path 
                      d="M 52 5 C 57 12, 103 12, 108 5 C 112 5, 125 15, 128 25 C 130 35, 122 55, 118 70 C 115 85, 110 135, 110 135 L 50 135 C 50 135, 45 85, 42 70 C 38 55, 30 35, 32 25 C 35 15, 48 5, 52 5 Z" 
                      fill="#0d0d11" 
                      stroke="rgba(255, 255, 255, 0.12)" 
                      strokeWidth="1.5" 
                    />
                    {/* Micro Heart in chest */}
                    <path 
                      d="M 85 45 C 75 35, 68 45, 68 53 C 68 62, 85 75, 85 75 C 85 75, 102 62, 102 53 C 102 45, 95 35, 85 45 Z" 
                      fill="#e63946" 
                      opacity="0.1" 
                    />

                    {/* ELECTRODE PLACEMENTS */}
                    {activeLeadSystem === '4lead' ? (
                      <>
                        {/* RA - White */}
                        <circle cx="48" cy="22" r="5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
                        <text x="48" y="23.5" fill="#000" fontSize="5" fontFamily="monospace" fontWeight="black" textAnchor="middle">RA</text>
                        {/* LA - Black */}
                        <circle cx="112" cy="22" r="5" fill="#18181b" stroke="#ffffff" strokeWidth="1" />
                        <text x="112" y="23.5" fill="#fff" fontSize="5" fontFamily="monospace" fontWeight="black" textAnchor="middle">LA</text>
                        {/* RL - Green */}
                        <circle cx="48" cy="115" r="5" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
                        <text x="48" y="116.5" fill="#fff" fontSize="5" fontFamily="monospace" fontWeight="black" textAnchor="middle">RL</text>
                        {/* LL - Red */}
                        <circle cx="112" cy="115" r="5" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
                        <text x="112" y="116.5" fill="#fff" fontSize="5" fontFamily="monospace" fontWeight="black" textAnchor="middle">LL</text>

                        {/* LEAD II VECTOR ARROW (RA to LL) */}
                        <path d="M 52 25 L 108 111" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3 2" />
                        <polygon points="108,111 106,104 101,107" fill="#fbbf24" />
                        <text x="86" y="72" fill="#fbbf24" fontSize="6.5" fontFamily="monospace" fontWeight="black" textAnchor="middle">LEAD II VIEW</text>
                      </>
                    ) : (
                      <>
                        {/* 12-lead precordial chest leads V1-V6 */}
                        {/* V1 - Red (4th ICS, right sternal border) */}
                        <circle cx="75" cy="55" r="4.5" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1" />
                        <text x="75" y="56.5" fill="#fff" fontSize="4" fontFamily="monospace" fontWeight="black" textAnchor="middle">V1</text>
                        
                        {/* V2 - Yellow (4th ICS, left sternal border) */}
                        <circle cx="87" cy="55" r="4.5" fill="#eab308" stroke="#713f12" strokeWidth="1" />
                        <text x="87" y="56.5" fill="#000" fontSize="4" fontFamily="monospace" fontWeight="black" textAnchor="middle">V2</text>
                        
                        {/* V3 - Green (between V2 & V4) */}
                        <circle cx="91" cy="65" r="4.5" fill="#22c55e" stroke="#14532d" strokeWidth="1" />
                        <text x="91" y="66.5" fill="#fff" fontSize="4" fontFamily="monospace" fontWeight="black" textAnchor="middle">V3</text>
                        
                        {/* V4 - Blue (5th ICS, mid-clavicular) */}
                        <circle cx="97" cy="74" r="4.5" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="1" />
                        <text x="97" y="75.5" fill="#fff" fontSize="4" fontFamily="monospace" fontWeight="black" textAnchor="middle">V4</text>
                        
                        {/* V5 - Orange (anterior axillary) */}
                        <circle cx="106" cy="78" r="4.5" fill="#f97316" stroke="#7c2d12" strokeWidth="1" />
                        <text x="106" y="79.5" fill="#fff" fontSize="4" fontFamily="monospace" fontWeight="black" textAnchor="middle">V5</text>
                        
                        {/* V6 - Purple (mid-axillary) */}
                        <circle cx="116" cy="80" r="4.5" fill="#a855f7" stroke="#581c87" strokeWidth="1" />
                        <text x="116" y="81.5" fill="#fff" fontSize="4" fontFamily="monospace" fontWeight="black" textAnchor="middle">V6</text>

                        {/* Limb lead mini points for reference */}
                        <circle cx="48" cy="22" r="3" fill="#fff" opacity="0.6" />
                        <circle cx="112" cy="22" r="3" fill="#000" stroke="#fff" strokeWidth="0.5" opacity="0.6" />
                        <circle cx="48" cy="115" r="3" fill="#22c55e" opacity="0.6" />
                        <circle cx="112" cy="115" r="3" fill="#ef4444" opacity="0.6" />
                      </>
                    )}
                  </svg>
                </div>

                {/* Explanation text column */}
                <div className="md:col-span-7 flex flex-col justify-center gap-1 md:pl-2 min-h-0 flex-1">
                  <div className="bg-black/30 border border-zinc-900/60 p-2.5 rounded-xl space-y-1">
                    <span className="text-[8px] font-mono font-black text-emerald-400 block uppercase">
                      {activeLeadSystem === '4lead' ? "4-LEAD CONTINUOUS STRIP" : "12-LEAD DIAGNOSTIC GRID"}
                    </span>
                    <h5 className="text-[11px] font-black uppercase text-white leading-none">
                      {activeLeadSystem === '4lead' ? "Continuous Rhythm Telemetry" : "Localized Left-Ventricle Camera Views"}
                    </h5>
                    <p className="text-[9.5px] text-zinc-300 font-semibold leading-relaxed">
                      {activeLeadSystem === '4lead' 
                        ? "Rely on 4 limb stickers to produce Leads I, II, III. Lead II (White RA to Red LL) traces the down-leftward flow, giving the perfect trace morphology to continuously track cardiac rates and immediate blocks."
                        : "Requires 10 physical stickers to create 12 viewpoints. These segment the left ventricle: Septal (V1-V2), Anterior (V3-V4), Lateral (V5-V6, I, aVL), and Inferior (II, III, aVF) to detect localized infarcts."
                      }
                    </p>
                    <div className="text-[9px] font-mono text-amber-300 bg-amber-500/5 p-1 rounded border border-amber-500/10 font-bold leading-normal">
                      {activeLeadSystem === '4lead'
                        ? "🚨 LIMITATION: Missing precordial chest angles. Cannot diagnose localized STEMIs."
                        : "✅ ACQUISITION: Vital for suspected Coronary Syndrome. Must be flat/still to prevent muscle tremors."
                      }
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SUBTAB 3: BEAT ANATOMY (SEGMENTS 1-5 SELECTOR) */}
          {subTab === 'anatomy' && (
            <motion.div 
              key="anatomy"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex flex-col gap-1.5"
            >
              {/* Horizontal Segment Touch Controller */}
              <div className="grid grid-cols-5 gap-0.5 shrink-0 bg-zinc-900/80 p-0.5 rounded-lg border border-zinc-800">
                {[
                  { id: 1, label: 'P Wave' },
                  { id: 2, label: 'PR Interval' },
                  { id: 3, label: 'QRS complex' },
                  { id: 4, label: 'ST segment' },
                  { id: 5, label: 'T Wave' }
                ].map((seg) => (
                  <button
                    key={seg.id}
                    type="button"
                    onClick={() => setActiveAnatomySegment(seg.id)}
                    className={cn(
                      "py-1 rounded text-[8px] md:text-[9px] font-black uppercase tracking-wider transition-all text-center",
                      activeAnatomySegment === seg.id 
                        ? "bg-emerald-500 text-black shadow-sm" 
                        : "text-zinc-400 hover:text-white"
                    )}
                  >
                    {seg.label}
                  </button>
                ))}
              </div>

              {/* Grid paper & segment display */}
              <div className="flex-1 min-h-0 flex flex-col md:grid md:grid-cols-12 gap-3 md:items-center">
                {/* Visual grid segment */}
                <div className="md:col-span-7 w-full h-24 md:h-28 bg-[#1a0f0f] border border-red-950/40 rounded-xl overflow-hidden relative shrink-0">
                  {/* Custom SVG Grid paper background */}
                  <div className="absolute inset-0 pointer-events-none">
                    <svg width="100%" height="100%">
                      <defs>
                        <pattern id="grid-paper-small" width="4" height="4" patternUnits="userSpaceOnUse">
                          <path d="M 4 0 L 0 0 0 4" fill="none" stroke="rgba(239, 68, 68, 0.08)" strokeWidth="0.5"/>
                        </pattern>
                        <pattern id="grid-paper-large" width="20" height="20" patternUnits="userSpaceOnUse">
                          <rect width="20" height="20" fill="url(#grid-paper-small)"/>
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(239, 68, 68, 0.22)" strokeWidth="0.8"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid-paper-large)" />
                    </svg>
                  </div>

                  {/* Waveform Drawing */}
                  <svg viewBox="0 0 320 120" className="w-full h-full relative z-10">
                    {/* Isoelectric flat line underlay */}
                    <line x1="10" y1="70" x2="310" y2="70" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" strokeDasharray="3 3" />

                    {/* Full Muted Base Waveform path */}
                    <path 
                      d="M 15 70 L 45 70 C 53 70, 58 54, 65 54 C 72 54, 77 70, 85 70 L 110 70 L 117 76 L 130 18 L 143 100 L 147 70 L 195 70 C 205 70, 218 45, 230 45 C 242 45, 255 70, 265 70 L 305 70"
                      fill="none" 
                      stroke="#4b5563" 
                      strokeWidth="2.5" 
                      strokeLinecap="round"
                    />

                    {/* SEGMENT 1: P WAVE (Coral) */}
                    {activeAnatomySegment === 1 && (
                      <motion.path 
                        initial={{ opacity: 0.5, strokeWidth: 2.5 }}
                        animate={{ opacity: [0.5, 1, 0.5], strokeWidth: [3, 4, 3] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        d="M 45 70 C 53 70, 58 54, 65 54 C 72 54, 77 70, 85 70"
                        fill="none" 
                        stroke="#f87171" 
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]"
                      />
                    )}

                    {/* SEGMENT 2: PR INTERVAL (Gold) */}
                    {activeAnatomySegment === 2 && (
                      <motion.path 
                        initial={{ opacity: 0.5, strokeWidth: 2.5 }}
                        animate={{ opacity: [0.5, 1, 0.5], strokeWidth: [3, 4, 3] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        d="M 45 70 C 53 70, 58 54, 65 54 C 72 54, 77 70, 85 70 L 110 70 L 117 76"
                        fill="none" 
                        stroke="#fbbf24" 
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]"
                      />
                    )}

                    {/* SEGMENT 3: QRS COMPLEX (Teal) */}
                    {activeAnatomySegment === 3 && (
                      <motion.path 
                        initial={{ opacity: 0.5, strokeWidth: 2.5 }}
                        animate={{ opacity: [0.5, 1, 0.5], strokeWidth: [3, 4, 3] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        d="M 110 70 L 117 76 L 130 18 L 143 100 L 147 70"
                        fill="none" 
                        stroke="#22d3ee" 
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]"
                      />
                    )}

                    {/* SEGMENT 4: ST SEGMENT (Emerald) */}
                    {activeAnatomySegment === 4 && (
                      <>
                        <motion.path 
                          initial={{ opacity: 0.5 }}
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          d="M 147 70 L 195 70"
                          fill="none" 
                          stroke="#34d399" 
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          className="drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                        />
                        <path 
                          d="M 147 70 L 151 50 L 195 50" 
                          fill="none" 
                          stroke="#ef4444" 
                          strokeWidth="1.5" 
                          strokeDasharray="2 2" 
                          opacity="0.8"
                        />
                        <text x="175" y="42" fill="#f87171" fontSize="5" fontFamily="monospace" fontWeight="black" textAnchor="middle">ANOMALY: STEMI ELEVATION (+5mm)</text>
                      </>
                    )}

                    {/* SEGMENT 5: T WAVE (Pink/Magenta) */}
                    {activeAnatomySegment === 5 && (
                      <>
                        <motion.path 
                          initial={{ opacity: 0.5, strokeWidth: 2.5 }}
                          animate={{ opacity: [0.5, 1, 0.5], strokeWidth: [3, 4, 3] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          d="M 195 70 C 205 70, 218 45, 230 45 C 242 45, 255 70, 265 70"
                          fill="none" 
                          stroke="#ec4899" 
                          strokeLinecap="round"
                          className="drop-shadow-[0_0_6px_rgba(236,72,153,0.8)]"
                        />
                        <path 
                          d="M 195 70 C 205 70, 215 22, 230 22 C 245 22, 255 70, 265 70" 
                          fill="none" 
                          stroke="#f472b6" 
                          strokeWidth="1" 
                          strokeDasharray="2 2" 
                          opacity="0.8"
                        />
                        <text x="230" y="16" fill="#f472b6" fontSize="5" fontFamily="monospace" fontWeight="black" textAnchor="middle">ANOMALY: PEAKED T-WAVE (HYPERKALEMIA)</text>
                      </>
                    )}

                    {/* Segment Brackets and Callout overlays */}
                    {activeAnatomySegment === 1 && (
                      <g fill="#f87171" fontSize="6" fontFamily="monospace" fontWeight="bold">
                        <text x="65" y="44" textAnchor="middle">P WAVE</text>
                        <line x1="45" y1="84" x2="85" y2="84" stroke="#f87171" strokeWidth="0.8" />
                        <line x1="45" y1="80" x2="45" y2="88" stroke="#f87171" strokeWidth="0.8" />
                        <line x1="85" y1="80" x2="85" y2="88" stroke="#f87171" strokeWidth="0.8" />
                        <text x="65" y="93" textAnchor="middle">ATRIAL DEPOLARIZATION</text>
                      </g>
                    )}

                    {activeAnatomySegment === 2 && (
                      <g fill="#fbbf24" fontSize="6" fontFamily="monospace" fontWeight="bold">
                        <text x="75" y="44" textAnchor="middle">PR INTERVAL</text>
                        <line x1="45" y1="84" x2="117" y2="84" stroke="#fbbf24" strokeWidth="0.8" />
                        <line x1="45" y1="80" x2="45" y2="88" stroke="#fbbf24" strokeWidth="0.8" />
                        <line x1="117" y1="80" x2="117" y2="88" stroke="#fbbf24" strokeWidth="0.8" />
                        <text x="81" y="93" textAnchor="middle">AV NODE CONDUCTION TIME</text>
                      </g>
                    )}

                    {activeAnatomySegment === 3 && (
                      <g fill="#22d3ee" fontSize="6" fontFamily="monospace" fontWeight="bold">
                        <text x="130" y="10" textAnchor="middle">QRS COMPLEX</text>
                        <line x1="110" y1="110" x2="147" y2="110" stroke="#22d3ee" strokeWidth="0.8" />
                        <line x1="110" y1="106" x2="110" y2="114" stroke="#22d3ee" strokeWidth="0.8" />
                        <line x1="147" y1="106" x2="147" y2="114" stroke="#22d3ee" strokeWidth="0.8" />
                        <text x="128.5" y="117" textAnchor="middle">VENTRICULAR CONTRACT</text>
                      </g>
                    )}

                    {activeAnatomySegment === 4 && (
                      <g fill="#34d399" fontSize="6" fontFamily="monospace" fontWeight="bold">
                        <text x="171" y="62" textAnchor="middle">ST SEGMENT</text>
                        <line x1="147" y1="84" x2="195" y2="84" stroke="#34d399" strokeWidth="0.8" />
                        <line x1="147" y1="80" x2="147" y2="88" stroke="#34d399" strokeWidth="0.8" />
                        <line x1="195" y1="80" x2="195" y2="88" stroke="#34d399" strokeWidth="0.8" />
                        <text x="171" y="93" textAnchor="middle">ISOELECTRIC PLATEAU</text>
                      </g>
                    )}

                    {activeAnatomySegment === 5 && (
                      <g fill="#ec4899" fontSize="6" fontFamily="monospace" fontWeight="bold">
                        <text x="230" y="36" textAnchor="middle">T WAVE</text>
                        <line x1="195" y1="84" x2="265" y2="84" stroke="#ec4899" strokeWidth="0.8" />
                        <line x1="195" y1="80" x2="195" y2="88" stroke="#ec4899" strokeWidth="0.8" />
                        <line x1="265" y1="80" x2="265" y2="88" stroke="#ec4899" strokeWidth="0.8" />
                        <text x="230" y="93" textAnchor="middle">VENTRICULAR REPOLARIZE</text>
                      </g>
                    )}
                  </svg>
                </div>

                {/* Mini diagnostic criteria column */}
                <div className="md:col-span-5 flex flex-col justify-center md:pl-2 min-h-0 flex-1">
                  <div className="bg-black/30 border border-zinc-900/60 p-2.5 rounded-xl space-y-1">
                    <span className="text-[8px] font-mono font-black text-emerald-400 uppercase tracking-widest block leading-none">
                      {activeAnatomySegment === 1 && "Segment 1 of 5"}
                      {activeAnatomySegment === 2 && "Segment 2 of 5"}
                      {activeAnatomySegment === 3 && "Segment 3 of 5"}
                      {activeAnatomySegment === 4 && "Segment 4 of 5"}
                      {activeAnatomySegment === 5 && "Segment 5 of 5"}
                    </span>
                    <h5 className="text-[11px] font-black uppercase text-white leading-none">
                      {activeAnatomySegment === 1 && "P Wave — Atrial Activity"}
                      {activeAnatomySegment === 2 && "PR Interval — Conduction Speed"}
                      {activeAnatomySegment === 3 && "QRS Complex — Pump Power"}
                      {activeAnatomySegment === 4 && "ST Segment — Baseline Plateau"}
                      {activeAnatomySegment === 5 && "T Wave — Electrical Recharge"}
                    </h5>
                    <p className="text-[9px] leading-relaxed text-zinc-300 font-semibold mt-1">
                      {activeAnatomySegment === 1 && "Normally < 0.11 seconds wide and upright in Lead II. Represents SA node initiating atrial squeeze. Absent P-waves mean SA node is offline (junctional or A-Fib)."}
                      {activeAnatomySegment === 2 && "Spans 0.12 - 0.20 seconds (3 to 5 small squares). Measures travel time from atria to ventricles. Prolonged constant PR (>0.20s) indicates First-Degree AV Block."}
                      {activeAnatomySegment === 3 && "Normally under 0.12 seconds (< 3 small squares). Signifies superfast conduction through ventricles. Wide complexes indicate a slower ventricular backup route (PVC, V-Tach, BBB)."}
                      {activeAnatomySegment === 4 && "Normally flat along the isoelectric baseline. Elevation of >= 1mm in contiguous leads means coronary artery blockage (Acute STEMI). Depression suggests cardiac ischemia."}
                      {activeAnatomySegment === 5 && "Represents ventricles resetting. Peaked, tall T-waves represent immediate early heart attack or high blood potassium (Hyperkalemia). Inversion can represent ischemia."}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SUBTAB 4: 5-STEP RULES SYSTEM */}
          {subTab === 'rules' && (
            <motion.div 
              key="rules"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex flex-col gap-1.5"
            >
              {/* Rules Step Pills */}
              <div className="grid grid-cols-5 gap-0.5 shrink-0 bg-zinc-900/80 p-0.5 rounded-lg border border-zinc-800">
                {[1, 2, 3, 4, 5].map((stepNum) => (
                  <button
                    key={stepNum}
                    type="button"
                    onClick={() => setActiveRulesStep(stepNum)}
                    className={cn(
                      "py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all",
                      activeRulesStep === stepNum 
                        ? "bg-emerald-500 text-black shadow-sm" 
                        : "text-zinc-400 hover:text-white"
                    )}
                  >
                    Step {stepNum}
                  </button>
                ))}
              </div>

              {/* Step workspace display */}
              <div className="flex-1 min-h-0 flex flex-col md:grid md:grid-cols-12 gap-3 md:items-center">
                {/* Visual grid caliper simulation */}
                <div className="md:col-span-6 w-full h-24 md:h-28 bg-[#0c1a12] border border-emerald-950/40 rounded-xl overflow-hidden relative shrink-0">
                  {/* Grid background */}
                  <div className="absolute inset-0 opacity-15 pointer-events-none">
                    <svg width="100%" height="100%">
                      <rect width="100%" height="100%" fill="url(#monitor-grid-large)" />
                    </svg>
                  </div>

                  {/* Step Interactive Visual */}
                  <svg viewBox="0 0 240 120" className="w-full h-full relative z-10">
                    {/* Normal sinus trace background */}
                    <path 
                      d="M 5 60 L 35 60 C 40 60, 42 50, 46 50 C 50 60, 52 60, 56 60 L 70 60 L 75 64 L 83 20 L 91 72 L 93 60 L 125 60 C 130 60, 132 50, 136 50 C 140 60, 142 60, 146 60 L 160 60 L 165 64 L 173 20 L 181 72 L 183 60 L 215 60 C 220 60, 222 50, 226 50"
                      fill="none" 
                      stroke="rgba(255,255,255,0.15)" 
                      strokeWidth="1.5"
                    />

                    {/* STEP 1: RATE (Calculate large boxes) */}
                    {activeRulesStep === 1 && (
                      <g>
                        {/* Highlights two peaks */}
                        <circle cx="83" cy="20" r="4" fill="none" stroke="#22d3ee" strokeWidth="1.5" className="animate-ping" />
                        <circle cx="173" cy="20" r="4" fill="none" stroke="#22d3ee" strokeWidth="1.5" className="animate-ping" />
                        <path d="M 83 20 L 173 20" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="2 2" />
                        {/* Brackets measuring boxes */}
                        <line x1="83" y1="20" x2="83" y2="40" stroke="#22d3ee" strokeWidth="1" />
                        <line x1="173" y1="20" x2="173" y2="40" stroke="#22d3ee" strokeWidth="1" />
                        {/* Large box counts */}
                        <text x="128" y="15" fill="#22d3ee" fontSize="6.5" fontFamily="monospace" fontWeight="black" textAnchor="middle">MEASURE R-R PEAK SPACING</text>
                        {/* Box segments */}
                        <g stroke="#34d399" strokeWidth="1" opacity="0.8">
                          <line x1="101" y1="35" x2="101" y2="45" />
                          <line x1="119" y1="35" x2="119" y2="45" />
                          <line x1="137" y1="35" x2="137" y2="45" />
                          <line x1="155" y1="35" x2="155" y2="45" />
                        </g>
                        <text x="128" y="42" fill="#34d399" fontSize="6" fontFamily="monospace" fontWeight="black" textAnchor="middle">1[300]   2[150]   3[100]   4[75]   5[60]</text>
                        <text x="128" y="105" fill="#a7f3d0" fontSize="7" fontFamily="monospace" fontWeight="black" textAnchor="middle">FORMULA: 300 / 4.5 BOXES = ~66 BPM</text>
                      </g>
                    )}

                    {/* STEP 2: REGULARITY (Caliper ticks) */}
                    {activeRulesStep === 2 && (
                      <g>
                        {/* Tick indicators over two cycles */}
                        <line x1="83" y1="15" x2="83" y2="45" stroke="#fbbf24" strokeWidth="1.5" />
                        <line x1="173" y1="15" x2="173" y2="45" stroke="#fbbf24" strokeWidth="1.5" />
                        <path d="M 83 22 L 173 22" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
                        <text x="128" y="17" fill="#fbbf24" fontSize="6.5" fontFamily="monospace" fontWeight="black" textAnchor="middle">CALIPER GAP A = 90px</text>

                        {/* Projected tick indicator to prove equality */}
                        <line x1="173" y1="15" x2="173" y2="45" stroke="#34d399" strokeWidth="1.5" strokeDasharray="1 1" />
                        <line x1="263" y1="15" x2="263" y2="45" stroke="#34d399" strokeWidth="1.5" strokeDasharray="1 1" />
                        <text x="218" y="17" fill="#34d399" fontSize="6.5" fontFamily="monospace" fontWeight="black" textAnchor="middle">CALIPER GAP B = 90px</text>
                        
                        <text x="128" y="105" fill="#fef08a" fontSize="7" fontFamily="monospace" fontWeight="black" textAnchor="middle">STATUS: EQUAL SPACING = REGULAR RHYTHM</text>
                      </g>
                    )}

                    {/* STEP 3: ANALYZE P-WAVES (Upright / rounded magnifier) */}
                    {activeRulesStep === 3 && (
                      <g>
                        {/* Circular zoom on the P-wave */}
                        <circle cx="46" cy="50" r="14" fill="none" stroke="#22c55e" strokeWidth="2" className="animate-pulse" />
                        <line x1="46" y1="64" x2="70" y2="85" stroke="#22c55e" strokeWidth="1" />
                        
                        <path d="M 40 54 C 43 54, 44 48, 46 48 C 48 48, 49 54, 52 54" fill="none" stroke="#22c55e" strokeWidth="2" />
                        <text x="46" y="32" fill="#22c55e" fontSize="6.5" fontFamily="monospace" fontWeight="black" textAnchor="middle">UPRIGHT & ROUNDED</text>
                        
                        {/* Explanation detail */}
                        <text x="128" y="105" fill="#a7f3d0" fontSize="7" fontFamily="monospace" fontWeight="black" textAnchor="middle">P-WAVE PRESENT: CONFIRMS SINUS ORIGIN</text>
                      </g>
                    )}

                    {/* STEP 4: MEASURE PR INTERVAL (3-5 boxes magnifier) */}
                    {activeRulesStep === 4 && (
                      <g>
                        {/* Highlights PR interval zoom zone */}
                        <rect x="30" y="42" width="55" height="30" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
                        {/* Magnified ruler */}
                        <line x1="80" y1="80" x2="160" y2="80" stroke="#f59e0b" strokeWidth="1.5" />
                        {/* Tick marks representing 0.16 seconds */}
                        <line x1="80" y1="75" x2="80" y2="85" stroke="#f59e0b" strokeWidth="1.5" />
                        <line x1="100" y1="77" x2="100" y2="83" stroke="#d97706" />
                        <line x1="120" y1="77" x2="120" y2="83" stroke="#d97706" />
                        <line x1="140" y1="77" x2="140" y2="83" stroke="#d97706" />
                        <line x1="160" y1="75" x2="160" y2="85" stroke="#f59e0b" strokeWidth="1.5" />
                        <text x="120" y="72" fill="#f59e0b" fontSize="6.5" fontFamily="monospace" fontWeight="black" textAnchor="middle">4 SMALL BOXES (0.16s)</text>
                        <text x="120" y="105" fill="#fef08a" fontSize="7" fontFamily="monospace" fontWeight="black" textAnchor="middle">STATUS: NORMAL PR INTERVAL (0.12 - 0.20s)</text>
                      </g>
                    )}

                    {/* STEP 5: MEASURE QRS DURATION (Narrow vs Wide demo) */}
                    {activeRulesStep === 5 && (
                      <g>
                        {/* Focuses on the QRS spikes */}
                        <rect x="70" y="16" width="25" height="60" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="2 2" />
                        {/* Horizontal measuring brackets */}
                        <line x1="75" y1="90" x2="93" y2="90" stroke="#22d3ee" strokeWidth="1.5" />
                        <line x1="75" y1="86" x2="75" y2="94" stroke="#22d3ee" strokeWidth="1.5" />
                        <line x1="93" y1="86" x2="93" y2="94" stroke="#22d3ee" strokeWidth="1.5" />
                        
                        <text x="84" y="82" fill="#22d3ee" fontSize="6" fontFamily="monospace" fontWeight="black" textAnchor="middle">2 BOXES (0.08s)</text>
                        <text x="145" y="50" fill="#a5f3fc" fontSize="6.5" fontFamily="monospace" fontWeight="black" textAnchor="left">NARROW & CRUNCHY (&lt;0.12s)</text>
                        <text x="128" y="105" fill="#a5f3fc" fontSize="7" fontFamily="monospace" fontWeight="black" textAnchor="middle">NARROW QRS: DEPOLARIZATION VIA BUNDLE BRANCHES</text>
                      </g>
                    )}
                  </svg>
                </div>

                {/* Step Details Column */}
                <div className="md:col-span-6 flex flex-col justify-center md:pl-2 min-h-0 flex-1">
                  <div className="bg-black/30 border border-zinc-900/60 p-2.5 rounded-xl space-y-1">
                    <span className="text-[8px] font-mono font-black text-emerald-400 block uppercase">SYSTEMATIC METHOD GUIDE</span>
                    <h5 className="text-[11px] font-black uppercase text-white leading-none">
                      {activeRulesStep === 1 && "Step 1: Calculate the Rate"}
                      {activeRulesStep === 2 && "Step 2: Assess Regularity"}
                      {activeRulesStep === 3 && "Step 3: Search for P Waves"}
                      {activeRulesStep === 4 && "Step 4: Measure PR Interval"}
                      {activeRulesStep === 5 && "Step 5: Measure QRS Duration"}
                    </h5>
                    <p className="text-[9px] leading-relaxed text-zinc-300 font-semibold mt-1">
                      {activeRulesStep === 1 && "Locate two contiguous R-peaks on a grid line. Count large squares between them: 1 box = 300 bpm, 2 = 150, 3 = 100, 4 = 75, 5 = 60, 6 = 50. For irregular rates, count total peaks on a 6-second strip (30 large boxes) and multiply by 10."}
                      {activeRulesStep === 2 && "Verify if distances between R-peaks are consistent across the whole strip. Use paper ticks or calipers. Minor variations are normal with breathing, but difference > 1.5 small boxes indicates an irregular rhythm (e.g., A-Fib)."}
                      {activeRulesStep === 3 && "Analyze atrial activity. Upright, rounded, identical P-waves occurring regularly confirm SA node origin. Sawtooth waves represent Atrial Flutter. No P-waves with an irregular rate confirms Atrial Fibrillation."}
                      {activeRulesStep === 4 && "Measure from the exact start of the P-wave to the very start of the QRS complex. Normal width is 3 to 5 small squares (0.12 to 0.20s). Constant but prolonged PR suggests a 1st-degree block."}
                      {activeRulesStep === 5 && "Measure from the start of the Q (or R) wave to the point where the S wave returns to the baseline. Normal duration is <0.12s (3 small boxes). Wide QRS complexes signify delayed conduction originating inside ventricles."}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER DIAGNOSTIC INFO BLOCK */}
      <div className="text-[8px] font-mono flex justify-between text-zinc-500 border-t border-zinc-900/40 pt-1.5 shrink-0 z-10 uppercase">
        <span>Click tabs below to unlock detailed instructions</span>
        <span>SWEEP: 25MM/S | GAIN: 10MM/MV</span>
      </div>
    </div>
  );
}

// =========================================================================
// COMPONENT
// =========================================================================

export default function EmsPractice() {
  const [activeSubTab, setActiveSubTab] = useState<'scenarios' | 'quiz' | 'checksheets' | 'ekg' | 'iv' | 'io'>('scenarios');
  const [scrollProgress, setScrollProgress] = useState(0);
  const subtabsContainerRef = useRef<HTMLDivElement>(null);

  const handleSubtabsScroll = () => {
    if (subtabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = subtabsContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        setScrollProgress(scrollLeft / maxScroll);
      } else {
        setScrollProgress(0);
      }
    }
  };

  useEffect(() => {
    const handleResize = () => {
      handleSubtabsScroll();
    };
    window.addEventListener('resize', handleResize);
    // Initial check
    setTimeout(handleSubtabsScroll, 100);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Scenario Simulator State
  const [selectedScenario, setSelectedScenario] = useState<ClinicalScenario | null>(null);
  const [currentScenarioStepId, setCurrentScenarioStepId] = useState<string>('start');
  const [scenarioHistory, setScenarioHistory] = useState<string[]>([]);
  const [scenarioFeedbacks, setScenarioFeedbacks] = useState<string[]>([]);
  const [criticalFailOccurred, setCriticalFailOccurred] = useState<boolean>(false);
  const [scenarioLevel, setScenarioLevel] = useState<'All' | 'EMR' | 'EMT' | 'AEMT'>('All');

  // Quiz Engine State
  const [quizCategory, setQuizCategory] = useState<'All' | 'Medications' | 'Protocols' | 'EKG & Vitals' | 'EMS Operations' | 'IO Access'>('All');
  const [quizLength, setQuizLength] = useState<number>(10);
  const [filteredQuestions, setFilteredQuestions] = useState<QuizQuestion[]>([]);
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Checklist State
  const [selectedChecklist, setSelectedChecklist] = useState<SkillChecklist | null>(null);
  const [checklistProgress, setChecklistProgress] = useState<Record<number, boolean>>({});
  const [checklistCategory, setChecklistCategory] = useState<'All' | 'EMR' | 'EMT' | 'AEMT'>('All');

  // EKG State
  const [ekgMode, setEkgMode] = useState<'guide' | 'learn' | 'quiz'>('guide');
  const [guideSubTab, setGuideSubTab] = useState<'intro' | 'leads' | 'anatomy' | 'rules'>('intro');
  const [activeIntroNode, setActiveIntroNode] = useState<'sa' | 'av' | 'purkinje' | null>('sa');
  const [activeAnatomySegment, setActiveAnatomySegment] = useState<number>(1);
  const [activeLeadSystem, setActiveLeadSystem] = useState<'4lead' | '12lead'>('4lead');
  const [activeRulesStep, setActiveRulesStep] = useState<number>(1);
  const [selectedEkgId, setSelectedEkgId] = useState<string>('nsr');
  const [ekgQuizCurrent, setEkgQuizCurrent] = useState<EkgRhythm>(EKG_RHYTHMS[0]);
  const [ekgQuizOptions, setEkgQuizOptions] = useState<EkgRhythm[]>([]);
  const [ekgQuizAnswered, setEkgQuizAnswered] = useState<boolean>(false);
  const [ekgQuizSelectedId, setEkgQuizSelectedId] = useState<string | null>(null);
  const [ekgQuizScore, setEkgQuizScore] = useState<number>(0);
  const [ekgQuizTotal, setEkgQuizTotal] = useState<number>(0);
  const [ekgAudioEnabled, setEkgAudioEnabled] = useState<boolean>(false);
  const ekgAudioEnabledRef = useRef<boolean>(false);
  const [ekgSpeedMultiplier, setEkgSpeedMultiplier] = useState<number>(1);
  const ekgSpeedMultiplierRef = useRef<number>(1);

  useEffect(() => {
    ekgAudioEnabledRef.current = ekgAudioEnabled;
  }, [ekgAudioEnabled]);

  useEffect(() => {
    ekgSpeedMultiplierRef.current = ekgSpeedMultiplier;
  }, [ekgSpeedMultiplier]);

  // IO Review State (for compatibility of deactivated block)
  const [selectedIoSite, setSelectedIoSite] = useState<'proximal_tibia' | 'proximal_humerus' | 'distal_femur' | 'distal_tibia'>('proximal_tibia');
  const [ioPatientType, setIoPatientType] = useState<'adult' | 'pediatric'>('adult');
  const [ioQuizAnswers, setIoQuizAnswers] = useState<Record<number, string>>({});
  const [ioQuizRevealed, setIoQuizRevealed] = useState<Record<number, boolean>>({});

  // EKG Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Start Scenario
  const handleStartScenario = (scenario: ClinicalScenario) => {
    setSelectedScenario(scenario);
    setCurrentScenarioStepId('start');
    setScenarioHistory([]);
    setScenarioFeedbacks([]);
    setCriticalFailOccurred(false);
  };

  const handleScenarioOption = (option: any) => {
    setScenarioFeedbacks(prev => [...prev, option.feedback]);
    if (option.critical && !option.correct) {
      setCriticalFailOccurred(true);
    }
    if (option.nextStepId === 'finish') {
      setCurrentScenarioStepId('finish');
    } else {
      setScenarioHistory(prev => [...prev, currentScenarioStepId]);
      setCurrentScenarioStepId(option.nextStepId);
    }
  };

  const handleResetScenario = () => {
    if (selectedScenario) {
      handleStartScenario(selectedScenario);
    }
  };

  // Start Quiz
  const handleStartQuiz = () => {
    let q = [...QUIZ_QUESTIONS];
    if (quizCategory !== 'All') {
      q = q.filter(question => question.category === quizCategory);
    }
    // Shuffle questions
    q = q.sort(() => 0.5 - Math.random());
    // Limit to chosen number of questions
    if (quizLength !== -1) {
      q = q.slice(0, quizLength);
    }
    setFilteredQuestions(q);
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setQuizScore(0);
  };

  const handleAnswerClick = (idx: number) => {
    if (selectedAnswerIndex !== null) return;
    setSelectedAnswerIndex(idx);
    if (idx === filteredQuestions[currentQuestionIndex].correctAnswerIndex) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswerIndex(null);
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const handleResetQuiz = () => {
    setQuizStarted(false);
    setSelectedAnswerIndex(null);
  };

  // Checklist Action
  const handleStartChecklist = (list: SkillChecklist) => {
    setSelectedChecklist(list);
    setChecklistProgress({});
  };

  const toggleChecklistStep = (index: number) => {
    setChecklistProgress(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const resetChecklist = () => {
    setChecklistProgress({});
  };

  // EKG Quiz Setup
  const generateEkgQuiz = () => {
    const randomRhythm = EKG_RHYTHMS[Math.floor(Math.random() * EKG_RHYTHMS.length)];
    // Pick 3 wrong options
    const otherOptions = EKG_RHYTHMS.filter(r => r.id !== randomRhythm.id);
    const shuffledOthers = otherOptions.sort(() => 0.5 - Math.random()).slice(0, 3);
    const finalOptions = [randomRhythm, ...shuffledOthers].sort(() => 0.5 - Math.random());

    setEkgQuizCurrent(randomRhythm);
    setEkgQuizOptions(finalOptions);
    setEkgQuizAnswered(false);
    setEkgQuizSelectedId(null);
  };

  useEffect(() => {
    if (ekgMode === 'quiz') {
      generateEkgQuiz();
    }
  }, [ekgMode]);

  const handleEkgAnswer = (id: string) => {
    if (ekgQuizAnswered) return;
    setEkgQuizSelectedId(id);
    setEkgQuizAnswered(true);
    setEkgQuizTotal(prev => prev + 1);
    if (id === ekgQuizCurrent.id) {
      setEkgQuizScore(prev => prev + 1);
    }
  };

  // EKG Canvas Simulation Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed virtual resolution
    const virtualWidth = 600;
    const virtualHeight = 150;
    canvas.width = virtualWidth;
    canvas.height = virtualHeight;

    const centerY = virtualHeight / 2;
    const traceData = new Array(virtualWidth).fill(0);
    let sweepX = 0;
    let tickCount = 0;

    // Determine target rhythm
    const activeRhythmId = ekgMode === 'quiz' ? ekgQuizCurrent.id : selectedEkgId;
    const activeRhythm = EKG_RHYTHMS.find(r => r.id === activeRhythmId);
    const activeRate = activeRhythm ? activeRhythm.rate : 72;

    // Dynamically adjust trace sweep speed based on heart rate to match beeps precisely
    let speed = 2.5;
    switch (activeRhythmId) {
      case 'nsr':
        speed = 2.4; // (72 * 120) / 3600
        break;
      case 'brady':
      case 'brady_to_asystole':
        speed = 2.5; // (42 * 214) / 3600 = 2.5
        break;
      case 'vtach':
        speed = 1.78; // (160 * 40) / 3600
        break;
      case 'vfib':
        speed = 2.5;
        break;
      case 'afib':
        speed = 2.3;
        break;
      case 'asystole':
        speed = 2.5;
        break;
      case 'pea':
        speed = 2.4; // NSR pattern
        break;
      case 'sinus_tach':
        speed = 2.43; // (125 * 70) / 3600
        break;
      case 'svt':
        speed = 2.52; // (185 * 49) / 3600
        break;
      case 'aflutter':
        speed = 2.3;
        break;
      case 'first_degree_block':
        speed = 2.25; // (58 * 140) / 3600
        break;
      case 'second_degree_type1':
        speed = 3.2; // (48 * 240) / 3600
        break;
      case 'second_degree_type2':
        speed = 2.5; // (38 * 236) / 3600 = 2.5
        break;
      case 'third_degree_block':
        speed = 2.5; // (30 * 300) / 3600 = 2.5
        break;
      case 'pvcs':
        speed = 2.22;
        break;
      case 'torsades':
        speed = 2.5;
        break;
      case 'nsr_pvcs':
        speed = 2.0; // (72 * 100) / 3600
        break;
      case 'nsr_to_vfib':
        speed = 2.4;
        break;
      case 'nsr_to_vtach':
        speed = 2.4;
        break;
      case 'svt_to_nsr':
        speed = 2.3;
        break;
      case 'nsr_to_pause':
        speed = 2.4;
        break;
      default:
        speed = 2.5;
    }

    // Apply the user-selected interactive sweep speed multiplier
    speed = speed * ekgSpeedMultiplierRef.current;

    const playBeep = () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const audioCtx = new AudioContextClass();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.frequency.value = 950; // Pristine hospital monitor pitch
        oscillator.type = 'sine';

        // Clean crisp click-less beep envelope
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.12);
      } catch (err) {
        console.warn('Audio Context beep failed:', err);
      }
    };

    let lastBeatTime = 0;

    const getEkgHeight = (x: number, rhythmId: string): number => {
      if (rhythmId === 'nsr') {
        const phase = x % 120;
        if (phase >= 60 && phase < 68) {
          return Math.sin((phase - 60) / 8 * Math.PI) * 5; // P wave
        } else if (phase >= 78 && phase < 81) {
          return -3; // Q
        } else if (phase >= 81 && phase < 85) {
          return 42; // R
        } else if (phase >= 85 && phase < 89) {
          return -12; // S
        } else if (phase >= 97 && phase < 110) {
          return Math.sin((phase - 97) / 13 * Math.PI) * 8; // T wave
        }
        return 0;
      }

      if (rhythmId === 'brady') {
        const phase = x % 214; // Adjusted to match exact heart rate of 42
        if (phase >= 150 && phase < 158) {
          return Math.sin((phase - 150) / 8 * Math.PI) * 5; // P wave
        } else if (phase >= 168 && phase < 171) {
          return -3; // Q
        } else if (phase >= 171 && phase < 175) {
          return 42; // R
        } else if (phase >= 175 && phase < 179) {
          return -12; // S
        } else if (phase >= 187 && phase < 200) {
          return Math.sin((phase - 187) / 13 * Math.PI) * 8; // T wave
        }
        return 0;
      }

      if (rhythmId === 'brady_to_asystole') {
        if (x < 850) {
          const phase = x % 214; // Adjusted to match exact heart rate of 42
          if (phase >= 150 && phase < 158) {
            return Math.sin((phase - 150) / 8 * Math.PI) * 5; // P wave
          } else if (phase >= 168 && phase < 171) {
            return -3; // Q
          } else if (phase >= 171 && phase < 175) {
            return 42; // R
          } else if (phase >= 175 && phase < 179) {
            return -12; // S
          } else if (phase >= 187 && phase < 200) {
            return Math.sin((phase - 187) / 13 * Math.PI) * 8; // T wave
          }
          return 0;
        } else {
          // Asystole flatline
          return (Math.random() - 0.5) * 1.5;
        }
      }

      if (rhythmId === 'vtach') {
        const phase = x % 40;
        const angle = (phase / 40) * 2 * Math.PI;
        return Math.sin(angle) * 28 - Math.cos(angle * 2) * 5;
      }

      if (rhythmId === 'vfib') {
        return Math.sin(x * 0.12) * 12 + Math.sin(x * 0.28) * 6 + (Math.random() - 0.5) * 5;
      }

      if (rhythmId === 'afib') {
        // Irregular R-R intervals (custom triggers)
        const triggers = [40, 110, 195, 290, 365, 450, 515, 580];
        const localX = x % 600;
        const baseNoise = Math.sin(localX * 0.4) * 2 + (Math.random() - 0.5) * 2;
        
        for (const trig of triggers) {
          if (localX >= trig && localX < trig + 30) {
            const p = localX - trig;
            if (p >= 2 && p < 5) return -3;
            if (p >= 5 && p < 8) return 40;
            if (p >= 8 && p < 11) return -12;
            if (p >= 17 && p < 27) return Math.sin((p - 17) / 10 * Math.PI) * 7;
          }
        }
        return baseNoise;
      }

      if (rhythmId === 'asystole') {
        return (Math.random() - 0.5) * 1.5;
      }

      if (rhythmId === 'pea') {
        // PEA displays normal sinus rhythm electrically on the monitor, but has no pulse!
        const phase = x % 120;
        if (phase >= 60 && phase < 68) {
          return Math.sin((phase - 60) / 8 * Math.PI) * 5; // P wave
        } else if (phase >= 78 && phase < 81) {
          return -3; // Q
        } else if (phase >= 81 && phase < 85) {
          return 42; // R
        } else if (phase >= 85 && phase < 89) {
          return -12; // S
        } else if (phase >= 97 && phase < 110) {
          return Math.sin((phase - 97) / 13 * Math.PI) * 8; // T wave
        }
        return 0;
      }

      if (rhythmId === 'sinus_tach') {
        const phase = x % 70;
        if (phase >= 20 && phase < 28) {
          return Math.sin((phase - 20) / 8 * Math.PI) * 4; // P wave
        } else if (phase >= 34 && phase < 37) {
          return -3; // Q
        } else if (phase >= 37 && phase < 41) {
          return 40; // R
        } else if (phase >= 41 && phase < 45) {
          return -10; // S
        } else if (phase >= 50 && phase < 62) {
          return Math.sin((phase - 50) / 12 * Math.PI) * 7; // T wave
        }
        return 0;
      }

      if (rhythmId === 'svt') {
        const phase = x % 49; // Adjusted to match exact heart rate of 185
        if (phase >= 12 && phase < 15) {
          return -4; // Q
        } else if (phase >= 15 && phase < 19) {
          return 44; // R
        } else if (phase >= 19 && phase < 23) {
          return -12; // S
        } else if (phase >= 28 && phase < 38) {
          return Math.sin((phase - 28) / 10 * Math.PI) * 9; // T wave
        }
        return 0;
      }

      if (rhythmId === 'aflutter') {
        const phase = x % 140;
        const sawtoothPhase = x % 25;
        const baseline = (sawtoothPhase / 25) * 8 - 4; // Sawtooth base
        
        if (phase >= 85 && phase < 88) {
          return -3 + baseline; // Q
        } else if (phase >= 88 && phase < 92) {
          return 42 + baseline; // R
        } else if (phase >= 92 && phase < 96) {
          return -12 + baseline; // S
        }
        return baseline;
      }

      if (rhythmId === 'first_degree_block') {
        const phase = x % 140;
        if (phase >= 20 && phase < 28) {
          return Math.sin((phase - 20) / 8 * Math.PI) * 5; // P wave
        } else if (phase >= 85 && phase < 88) {
          return -3; // Q
        } else if (phase >= 88 && phase < 92) {
          return 42; // R
        } else if (phase >= 92 && phase < 96) {
          return -12; // S
        } else if (phase >= 106 && phase < 119) {
          return Math.sin((phase - 106) / 13 * Math.PI) * 8; // T wave
        }
        return 0;
      }

      if (rhythmId === 'second_degree_type1') {
        const cycle = x % 720; // Corrected period to match 48 bpm ventricular rate
        // P waves are regularly every 180 pixels: 30, 210, 390, 570
        if (cycle >= 30 && cycle < 38) {
          return Math.sin((cycle - 30) / 8 * Math.PI) * 5;
        }
        if (cycle >= 210 && cycle < 218) {
          return Math.sin((cycle - 210) / 8 * Math.PI) * 5;
        }
        if (cycle >= 390 && cycle < 398) {
          return Math.sin((cycle - 390) / 8 * Math.PI) * 5;
        }
        if (cycle >= 570 && cycle < 578) {
          return Math.sin((cycle - 570) / 8 * Math.PI) * 5;
        }

        // QRS 1 (PR is short = 30) -> QRS starts at 60
        if (cycle >= 60 && cycle < 63) return -3;
        if (cycle >= 63 && cycle < 67) return 42;
        if (cycle >= 67 && cycle < 71) return -12;
        if (cycle >= 81 && cycle < 94) return Math.sin((cycle - 81) / 13 * Math.PI) * 8; // T

        // QRS 2 (PR is longer = 40) -> QRS starts at 250
        if (cycle >= 250 && cycle < 253) return -3;
        if (cycle >= 253 && cycle < 257) return 42;
        if (cycle >= 257 && cycle < 261) return -12;
        if (cycle >= 271 && cycle < 284) return Math.sin((cycle - 271) / 13 * Math.PI) * 8; // T

        // QRS 3 (PR is longest = 50) -> QRS starts at 440
        if (cycle >= 440 && cycle < 443) return -3;
        if (cycle >= 443 && cycle < 447) return 42;
        if (cycle >= 447 && cycle < 451) return -12;
        if (cycle >= 461 && cycle < 474) return Math.sin((cycle - 461) / 13 * Math.PI) * 8; // T

        // 4th QRS (at 570 + 60 = 630) is dropped!
        return 0;
      }

      if (rhythmId === 'second_degree_type2') {
        const cycle = x % 236; // Adjusted to match exact heart rate of 38 bpm
        // P waves at 30 and 148
        if (cycle >= 30 && cycle < 38) {
          return Math.sin((cycle - 30) / 8 * Math.PI) * 5;
        }
        if (cycle >= 148 && cycle < 156) {
          return Math.sin((cycle - 148) / 8 * Math.PI) * 5;
        }
        // QRS only conducted after the 1st P wave (at 65)
        if (cycle >= 65 && cycle < 68) return -3;
        if (cycle >= 68 && cycle < 72) return 42;
        if (cycle >= 72 && cycle < 76) return -12;
        if (cycle >= 86 && cycle < 99) return Math.sin((cycle - 86) / 13 * Math.PI) * 8; // T
        return 0;
      }

      if (rhythmId === 'third_degree_block') {
        // Dissociated P waves every 95 pixels
        const pPhase = x % 95;
        let pHeight = 0;
        if (pPhase >= 20 && pPhase < 28) {
          pHeight = Math.sin((pPhase - 20) / 8 * Math.PI) * 5;
        }

        // Dissociated slow ventricular beats (every 300 pixels to match 30 bpm exactly), wide QRS
        const qrsPhase = x % 300;
        let qrsHeight = 0;
        if (qrsPhase >= 150 && qrsPhase < 155) {
          qrsHeight = -4;
        } else if (qrsPhase >= 155 && qrsPhase < 164) {
          qrsHeight = 35; // Wide R
        } else if (qrsPhase >= 164 && qrsPhase < 172) {
          qrsHeight = -15; // Wide S
        } else if (qrsPhase >= 185 && qrsPhase < 210) {
          qrsHeight = Math.sin((qrsPhase - 185) / 25 * Math.PI) * -10; // Inverted T wave
        }
        return pHeight + qrsHeight;
      }

      if (rhythmId === 'pvcs') {
        const cycle = x % 320;
        // Normal beat 1 (P at 10, QRS at 40, T at 60)
        if (cycle >= 10 && cycle < 18) {
          return Math.sin((cycle - 10) / 8 * Math.PI) * 5;
        }
        if (cycle >= 28 && cycle < 31) return -3;
        if (cycle >= 31 && cycle < 35) return 42;
        if (cycle >= 35 && cycle < 39) return -12;
        if (cycle >= 47 && cycle < 60) return Math.sin((cycle - 47) / 13 * Math.PI) * 8;

        // Normal beat 2 (P at 130, QRS at 160, T at 180)
        if (cycle >= 130 && cycle < 138) {
          return Math.sin((cycle - 130) / 8 * Math.PI) * 5;
        }
        if (cycle >= 148 && cycle < 151) return -3;
        if (cycle >= 151 && cycle < 155) return 42;
        if (cycle >= 155 && cycle < 159) return -12;
        if (cycle >= 167 && cycle < 180) return Math.sin((cycle - 167) / 13 * Math.PI) * 8;

        // PVC (Starts early at 230, wide bizarre QRS, massive inverted T)
        if (cycle >= 230 && cycle < 234) return -6;
        if (cycle >= 234 && cycle < 246) return 35; // Wide R
        if (cycle >= 246 && cycle < 256) return -20; // Deep S
        if (cycle >= 256 && cycle < 280) return Math.sin((cycle - 256) / 24 * Math.PI) * -12; // Huge inverted T
        return 0;
      }

      if (rhythmId === 'torsades') {
        const baseWave = Math.sin(x * 0.18) * 22;
        const modulation = Math.sin(x * 0.015) * 1.2; // Waxes and wanes amplitude
        return baseWave * modulation + (Math.random() - 0.5) * 1.5;
      }

      // =========================================================================
      // ADVANCED RHYTHMS (NEW)
      // =========================================================================
      if (rhythmId === 'nsr_pvcs') {
        const cycle = x % 300;
        // Normal beat 1 (P at 10, QRS at 40, T at 60)
        if (cycle >= 10 && cycle < 18) {
          return Math.sin((cycle - 10) / 8 * Math.PI) * 5;
        }
        if (cycle >= 28 && cycle < 31) return -3;
        if (cycle >= 31 && cycle < 35) return 42;
        if (cycle >= 35 && cycle < 39) return -12;
        if (cycle >= 47 && cycle < 60) return Math.sin((cycle - 47) / 13 * Math.PI) * 8;

        // Normal beat 2 (P at 110, QRS at 140, T at 160)
        if (cycle >= 110 && cycle < 118) {
          return Math.sin((cycle - 110) / 8 * Math.PI) * 5;
        }
        if (cycle >= 128 && cycle < 131) return -3;
        if (cycle >= 131 && cycle < 135) return 42;
        if (cycle >= 135 && cycle < 139) return -12;
        if (cycle >= 147 && cycle < 160) return Math.sin((cycle - 147) / 13 * Math.PI) * 8;

        // PVC (Starts early at 200, wide bizarre QRS, massive inverted T)
        if (cycle >= 200 && cycle < 204) return -6;
        if (cycle >= 204 && cycle < 216) return 35; // Wide R
        if (cycle >= 216 && cycle < 226) return -20; // Deep S
        if (cycle >= 226 && cycle < 250) return Math.sin((cycle - 226) / 24 * Math.PI) * -12; // Huge inverted T
        return 0;
      }

      if (rhythmId === 'nsr_to_vfib') {
        if (x < 900) {
          // Standard NSR (period 120)
          const phase = x % 120;
          if (phase >= 60 && phase < 68) {
            return Math.sin((phase - 60) / 8 * Math.PI) * 5; // P wave
          } else if (phase >= 78 && phase < 81) {
            return -3; // Q
          } else if (phase >= 81 && phase < 85) {
            return 42; // R
          } else if (phase >= 85 && phase < 89) {
            return -12; // S
          } else if (phase >= 97 && phase < 110) {
            return Math.sin((phase - 97) / 13 * Math.PI) * 8; // T wave
          }
          return 0;
        } else {
          // Degenerates into chaotic V-Fib
          return Math.sin(x * 0.12) * 11 + Math.sin(x * 0.28) * 7 + (Math.random() - 0.5) * 6;
        }
      }

      if (rhythmId === 'nsr_to_vtach') {
        if (x < 900 || x >= 1600) {
          // Normal sinus rhythm
          const phase = x % 120;
          if (phase >= 60 && phase < 68) {
            return Math.sin((phase - 60) / 8 * Math.PI) * 5; // P wave
          } else if (phase >= 78 && phase < 81) {
            return -3; // Q
          } else if (phase >= 81 && phase < 85) {
            return 42; // R
          } else if (phase >= 85 && phase < 89) {
            return -12; // S
          } else if (phase >= 97 && phase < 110) {
            return Math.sin((phase - 97) / 13 * Math.PI) * 8; // T wave
          }
          return 0;
        } else {
          // Sudden run of wide Ventricular Tachycardia (period 40)
          const phase = x % 40;
          const angle = (phase / 40) * 2 * Math.PI;
          return Math.sin(angle) * 28 - Math.cos(angle * 2) * 5;
        }
      }

      if (rhythmId === 'svt_to_nsr') {
        if (x < 800) {
          // Rapid SVT (period 45)
          const phase = x % 45;
          if (phase >= 12 && phase < 15) {
            return -4; // Q
          } else if (phase >= 15 && phase < 19) {
            return 44; // R
          } else if (phase >= 19 && phase < 23) {
            return -12; // S
          } else if (phase >= 28 && phase < 38) {
            return Math.sin((phase - 28) / 10 * Math.PI) * 9; // T wave
          }
          return 0;
        } else if (x >= 800 && x < 1300) {
          // Adenosine blockade pause (brief silent noise)
          return (Math.random() - 0.5) * 1.5;
        } else {
          // Converts to Normal Sinus Rhythm (period 120)
          const phase = (x - 1300) % 120;
          if (phase >= 60 && phase < 68) {
            return Math.sin((phase - 60) / 8 * Math.PI) * 5; // P wave
          } else if (phase >= 78 && phase < 81) {
            return -3; // Q
          } else if (phase >= 81 && phase < 85) {
            return 42; // R
          } else if (phase >= 85 && phase < 89) {
            return -12; // S
          } else if (phase >= 97 && phase < 110) {
            return Math.sin((phase - 97) / 13 * Math.PI) * 8; // T wave
          }
          return 0;
        }
      }

      if (rhythmId === 'nsr_to_pause') {
        if (x < 900 || x >= 1400) {
          // Standard NSR (period 120)
          const phase = x % 120;
          if (phase >= 60 && phase < 68) {
            return Math.sin((phase - 60) / 8 * Math.PI) * 5; // P wave
          } else if (phase >= 78 && phase < 81) {
            return -3; // Q
          } else if (phase >= 81 && phase < 85) {
            return 42; // R
          } else if (phase >= 85 && phase < 89) {
            return -12; // S
          } else if (phase >= 97 && phase < 110) {
            return Math.sin((phase - 97) / 13 * Math.PI) * 8; // T wave
          }
          return 0;
        } else {
          // Sinus pause (arrest flatline with standard baseline noise)
          return (Math.random() - 0.5) * 1.2;
        }
      }

      return 0;
    };

    const animate = () => {
      // Draw grid
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, virtualWidth, virtualHeight);

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < virtualWidth; x += 15) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, virtualHeight);
        ctx.stroke();
      }
      for (let y = 0; y < virtualHeight; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(virtualWidth, y);
        ctx.stroke();
      }

      // Fill trace data ahead of sweeping bar
      let qrsTriggered = false;
      for (let i = 0; i < speed; i++) {
        const px = Math.floor(sweepX + i) % virtualWidth;
        const h = getEkgHeight(tickCount, activeRhythmId);
        traceData[px] = h + (Math.random() - 0.5) * 0.8;
        tickCount++;

        // Detect high positive spike (R-wave peak, h > 30)
        if (h > 30) {
          qrsTriggered = true;
        }
      }

      if (qrsTriggered) {
        const now = Date.now();
        if (now - lastBeatTime > 220) {
          lastBeatTime = now;

          // Visual heart icon flash
          const heartIcon = document.getElementById('monitor-heart-icon');
          if (heartIcon) {
            heartIcon.classList.add('text-red-500', 'scale-125', 'brightness-125');
            setTimeout(() => {
              heartIcon.classList.remove('scale-125', 'brightness-125');
            }, 120);
          }

          // Audio beep if enabled
          if (ekgAudioEnabledRef.current) {
            playBeep();
          }
        }
      }

      // Draw active sweeping line
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#10b981';
      ctx.beginPath();

      let isDrawing = false;
      const eraserGap = 15;

      for (let i = 0; i < virtualWidth; i++) {
        // Eraser gap
        const isInEraser = (i >= sweepX && i < sweepX + eraserGap) || 
                           (sweepX + eraserGap > virtualWidth && i < (sweepX + eraserGap) % virtualWidth);
        
        if (isInEraser) {
          isDrawing = false;
          continue;
        }

        const yVal = centerY - traceData[i];
        if (!isDrawing) {
          ctx.moveTo(i, yVal);
          isDrawing = true;
        } else {
          ctx.lineTo(i, yVal);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Draw sweeps indicator bar
      ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.fillRect(sweepX, 0, 3, virtualHeight);

      sweepX = (sweepX + speed) % virtualWidth;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [selectedEkgId, ekgQuizCurrent, ekgMode, ekgSpeedMultiplier]);

  return (
    <div className="w-full bg-zinc-50 dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-100 flex flex-col font-sans">
      {/* Upper Navigation: EMS Practice Main Subtabs */}
      <div className="border-b border-zinc-200 dark:border-white/5 bg-white dark:bg-[#121214] sticky top-0 z-10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-600/10 text-red-600 dark:text-emerald-400 dark:bg-emerald-500/10 rounded-xl">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white leading-none">EMS Practice Center</h1>
            </div>
          </div>

          {/* Subtabs Controller */}
          <div className="flex flex-col gap-1.5 w-full md:w-auto">
            <div 
              ref={subtabsContainerRef}
              onScroll={handleSubtabsScroll}
              className="flex bg-zinc-100 dark:bg-white/5 p-1 rounded-xl w-full md:w-auto overflow-x-auto flex-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:min-w-[580px]"
            >
              {(['scenarios', 'quiz', 'checksheets', 'ekg', 'iv', 'io'] as const).map((tab) => (
                <button
                  key={tab}
                  id={`practice-tab-${tab}`}
                  onClick={() => {
                    setActiveSubTab(tab);
                    setSelectedScenario(null);
                    setSelectedChecklist(null);
                    setQuizStarted(false);
                  }}
                  className={cn(
                    "flex-1 md:flex-none shrink-0 text-center py-2 px-3 md:px-4 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all whitespace-nowrap",
                    activeSubTab === tab 
                      ? "bg-white dark:bg-white/10 text-zinc-950 dark:text-white shadow-xs" 
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white/80"
                  )}
                >
                  {tab === 'scenarios' && 'Clinical Scenarios'}
                  {tab === 'quiz' && 'Subject Quiz'}
                  {tab === 'checksheets' && 'Skill Sheets'}
                  {tab === 'ekg' && 'EKG Practice'}
                  {tab === 'iv' && 'IV Reference'}
                  {tab === 'io' && 'IO Review'}
                </button>
              ))}
            </div>

            {/* Custom Horizontal Scroll/Slide Bar for Mobile */}
            <div className="flex items-center justify-between md:hidden px-2 mt-0.5 w-full">
              <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Scroll tabs
              </span>
              <div className="w-24 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full relative">
                <div 
                  className="absolute top-0 h-full w-8 bg-red-600 dark:bg-emerald-400 rounded-full transition-all duration-75"
                  style={{
                    left: `${scrollProgress * (96 - 32)}px` // w-24 is 96px, thumb w-8 is 32px
                  }}
                />
              </div>
              <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider animate-pulse">
                Swipe &rarr;
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        
        {/* =========================================================================
             CLINICAL SCENARIOS TAB 
           ========================================================================= */}
        {activeSubTab === 'scenarios' && (
          <div className="space-y-6">
            {!selectedScenario ? (
              <div className="space-y-6">
                {/* Skill Level Selection at the Top */}
                <div className="flex flex-wrap gap-4 items-center justify-between border-b border-zinc-150 dark:border-white/5 pb-4">
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tight text-zinc-950 dark:text-white">Clinical Scenario Simulator</h3>
                    <p className="text-xs text-zinc-500 dark:text-white/40">Select your certification skill level to filter realistic protocol-guided scenario simulations.</p>
                  </div>
                  <div className="flex bg-zinc-100 dark:bg-white/5 p-1 rounded-xl">
                    {(['All', 'EMR', 'EMT', 'AEMT'] as const).map((level) => (
                      <button
                        key={level}
                        id={`scenario-level-filter-${level}`}
                        onClick={() => setScenarioLevel(level)}
                        className={cn(
                          "px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                          scenarioLevel === level 
                            ? "bg-white dark:bg-white/10 text-zinc-950 dark:text-white shadow-xs" 
                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white/80"
                        )}
                      >
                        {level === 'All' ? 'All Levels' : level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {CLINICAL_SCENARIOS
                    .filter((scen) => scenarioLevel === 'All' || scen.difficulty === scenarioLevel)
                    .map((scen) => (
                      <div 
                        key={scen.id} 
                        id={`scenario-card-${scen.id}`}
                        className="border-2 border-zinc-150 dark:border-white/5 bg-white dark:bg-[#1C1C1E] rounded-2xl p-5 shadow-sm hover:border-red-600/30 dark:hover:border-emerald-600/30 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                              scen.difficulty === 'EMR' ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-850 dark:text-zinc-300' :
                              scen.difficulty === 'EMT' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                              'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                            )}>
                              {scen.difficulty} LEVEL
                            </span>
                            <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-white/30 uppercase tracking-widest">
                              {scen.category}
                            </span>
                          </div>
                          <h3 className="font-black text-lg uppercase tracking-tight text-zinc-900 dark:text-white">{scen.title}</h3>
                          <p className="text-xs text-zinc-500 dark:text-white/60 line-clamp-3 leading-relaxed">
                            {scen.dispatch}
                          </p>
                        </div>
                        <button
                          onClick={() => handleStartScenario(scen)}
                          className="mt-6 w-full py-3 bg-zinc-900 dark:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-red-600 dark:hover:bg-emerald-600 transition-colors"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          Begin Scenario
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              // Active Scenario Simulator UI
              <div className="border-2 border-zinc-200 dark:border-white/10 bg-white dark:bg-[#1C1C1E] rounded-3xl overflow-hidden shadow-lg max-w-3xl mx-auto">
                {/* Simulator Header */}
                <div className="p-4 md:p-6 border-b border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] flex items-center justify-between flex-wrap gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-black uppercase tracking-widest text-red-600 dark:text-emerald-400">ACTIVE SIMULATOR</span>
                    <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white leading-none">{selectedScenario.title}</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedScenario(null)}
                    className="px-3 py-1.5 bg-zinc-900 dark:bg-white/10 hover:bg-red-600 dark:hover:bg-red-600/25 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                    Exit Simulator
                  </button>
                </div>

                {/* Patient Monitor panel (Vitals) */}
                {selectedScenario.steps[currentScenarioStepId]?.vitals && (
                  <div className="bg-black text-emerald-400 p-4 md:px-6 grid grid-cols-4 gap-2 border-b border-zinc-900 font-mono text-center">
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider text-zinc-500">HR</span>
                      <span className="text-base md:text-xl font-black">{selectedScenario.steps[currentScenarioStepId].vitals?.hr} bpm</span>
                    </div>
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider text-zinc-500">BP</span>
                      <span className="text-base md:text-xl font-black">{selectedScenario.steps[currentScenarioStepId].vitals?.bp}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider text-zinc-500">RR</span>
                      <span className="text-base md:text-xl font-black">{selectedScenario.steps[currentScenarioStepId].vitals?.rr} /min</span>
                    </div>
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider text-zinc-500">SpO2</span>
                      <span className="text-base md:text-xl font-black">{selectedScenario.steps[currentScenarioStepId].vitals?.spo2}</span>
                    </div>
                  </div>
                )}

                {/* Scenario Content */}
                <div className="p-4 md:p-6 space-y-6">
                  {/* Step ID = start, show dispatch & assessment */}
                  {currentScenarioStepId === 'start' && (
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-150 dark:border-white/5 space-y-3">
                      <div className="flex gap-2 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                        <User className="w-4 h-4 text-red-600" />
                        <span>INITIAL dispatch & ASSESSMENT:</span>
                      </div>
                      <p className="text-xs font-semibold leading-relaxed text-zinc-800 dark:text-white">{selectedScenario.dispatch}</p>
                      <p className="text-xs text-zinc-500 dark:text-white/60 leading-relaxed italic">{selectedScenario.initialAssessment}</p>
                    </div>
                  )}

                  {/* Active Question/Step */}
                  {currentScenarioStepId !== 'finish' && !criticalFailOccurred ? (
                    <div className="space-y-4">
                      <h3 className="font-bold text-sm text-zinc-950 dark:text-white leading-relaxed">
                        {selectedScenario.steps[currentScenarioStepId].text}
                      </h3>

                      {/* Options */}
                      <div className="space-y-2.5">
                        {selectedScenario.steps[currentScenarioStepId].options.map((opt, index) => (
                          <button
                            key={index}
                            onClick={() => handleScenarioOption(opt)}
                            className="w-full text-left border border-zinc-150 dark:border-white/5 bg-zinc-50 hover:bg-zinc-100 dark:bg-white/[0.02] dark:hover:bg-white/5 hover:border-red-600/30 dark:hover:border-emerald-600/30 p-3.5 rounded-xl text-xs font-black flex items-center justify-between group transition-all"
                          >
                            <span className="leading-relaxed text-zinc-800 dark:text-white group-hover:text-zinc-950 dark:group-hover:text-white font-bold">{opt.text}</span>
                            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-white shrink-0 ml-2" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : criticalFailOccurred ? (
                    // Critical Failure screen
                    <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500 text-center space-y-4 max-w-md mx-auto">
                      <div className="w-12 h-12 bg-red-500/20 text-red-600 rounded-full flex items-center justify-center mx-auto">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-black uppercase tracking-tight text-red-600">CRITICAL FAILURE OCCURRED</h3>
                      <p className="text-xs text-zinc-600 dark:text-white/75 leading-relaxed">
                        You chose an action that violated critical patient safety protocols or would result in patient fatality.
                      </p>
                      <div className="p-3 bg-white/5 rounded-xl border border-red-500/15 text-left text-xs italic font-medium">
                        {scenarioFeedbacks[scenarioFeedbacks.length - 1]}
                      </div>
                      <button
                        onClick={handleResetScenario}
                        className="w-full py-2.5 bg-red-600 text-white rounded-lg text-xs font-black uppercase tracking-wider hover:bg-red-700 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (
                    // Scenario Finished screen
                    <div className="p-6 text-center space-y-6 max-w-md mx-auto">
                      <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <Award className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">SCENARIO RESOLVED</h3>
                      <p className="text-xs text-zinc-500 dark:text-white/70 leading-relaxed">
                        {selectedScenario.finalSummary}
                      </p>
                      <button
                        onClick={() => setSelectedScenario(null)}
                        className="w-full py-3 bg-zinc-900 dark:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-600 dark:hover:bg-emerald-600 transition-colors"
                      >
                        Return to Scenarios
                      </button>
                    </div>
                  )}

                  {/* Active Feedbacks log */}
                  {scenarioFeedbacks.length > 0 && !criticalFailOccurred && (
                    <div className="pt-4 border-t border-zinc-100 dark:border-white/5 space-y-2">
                      <span className="text-[8px] font-mono font-black uppercase tracking-widest text-zinc-400">Clinical Pearl:</span>
                      <div className="p-3.5 bg-zinc-50 dark:bg-white/5 rounded-xl text-xs italic text-zinc-600 dark:text-white/70 border border-zinc-150 dark:border-white/5">
                        {scenarioFeedbacks[scenarioFeedbacks.length - 1]}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
             SUBJECT QUIZ TAB 
           ========================================================================= */}
        {activeSubTab === 'quiz' && (
          <div className="space-y-6 max-w-xl mx-auto">
            {!quizStarted ? (
              <div className="border-2 border-zinc-200 dark:border-white/10 bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-sm space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">Protocol Exam Center</h3>
                  <p className="text-xs text-zinc-500 dark:text-white/60">
                    Test your knowledge on medications, county EMS operations, transport exceptions, diagnostic vitals, and intraosseous vascular access.
                  </p>
                </div>

                {/* Category selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-zinc-400 block">Select Subject:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['All', 'Medications', 'Protocols', 'EKG & Vitals', 'EMS Operations', 'IO Access'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setQuizCategory(cat)}
                        className={cn(
                          "py-2 px-3 border rounded-xl text-left text-xs font-black transition-all",
                          quizCategory === cat 
                            ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white/10 dark:border-white/10" 
                            : "bg-white border-zinc-200 hover:border-red-600/30 text-zinc-700 dark:bg-white/[0.01] dark:border-white/5 dark:text-white/80"
                        )}
                      >
                        {cat === 'All' ? 'Comprehensive Exam' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of Questions selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-zinc-400 block">Select Number of Questions:</label>
                  <div className="grid grid-cols-5 gap-2">
                    {([5, 10, 15, 25, -1] as const).map((len) => (
                      <button
                        key={len}
                        type="button"
                        onClick={() => setQuizLength(len)}
                        className={cn(
                          "py-2 text-center border rounded-xl text-xs font-black transition-all",
                          quizLength === len 
                            ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white/10 dark:border-white/10" 
                            : "bg-white border-zinc-200 hover:border-red-600/30 text-zinc-700 dark:bg-white/[0.01] dark:border-white/5 dark:text-white/80"
                        )}
                      >
                        {len === -1 ? 'Max' : len}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleStartQuiz}
                  className="w-full py-3.5 bg-zinc-900 dark:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-600 dark:hover:bg-emerald-600 transition-colors"
                >
                  Start Exam
                </button>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center p-6 bg-white dark:bg-[#1C1C1E] border border-zinc-200 dark:border-white/5 rounded-2xl">
                <p className="text-xs font-bold">No questions found under this category.</p>
                <button onClick={handleResetQuiz} className="mt-4 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold">Back</button>
              </div>
            ) : currentQuestionIndex < filteredQuestions.length ? (
              // Active Quiz Screen
              <div className="border-2 border-zinc-200 dark:border-white/10 bg-white dark:bg-[#1C1C1E] rounded-3xl overflow-hidden shadow-lg">
                <div className="p-4 md:px-6 bg-zinc-50 dark:bg-white/[0.02] border-b border-zinc-100 dark:border-white/5 flex justify-between items-center text-xs font-mono font-black">
                  <span className="uppercase text-red-600 dark:text-emerald-400">{filteredQuestions[currentQuestionIndex].category}</span>
                  <span className="text-zinc-400">Q: {currentQuestionIndex + 1} / {filteredQuestions.length}</span>
                </div>

                <div className="p-5 md:p-6 space-y-6">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white leading-relaxed">
                    {filteredQuestions[currentQuestionIndex].question}
                  </h4>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {filteredQuestions[currentQuestionIndex].options.map((option, idx) => {
                      const isAnswered = selectedAnswerIndex !== null;
                      const isSelected = selectedAnswerIndex === idx;
                      const isCorrect = idx === filteredQuestions[currentQuestionIndex].correctAnswerIndex;

                      return (
                        <button
                          key={idx}
                          disabled={isAnswered}
                          onClick={() => handleAnswerClick(idx)}
                          className={cn(
                            "w-full border-2 rounded-xl p-4 text-left text-xs font-bold transition-all flex items-center justify-between",
                            !isAnswered 
                              ? "bg-white dark:bg-white/5 border-zinc-100 dark:border-white/5 hover:border-red-600/30 text-zinc-800 dark:text-white/80 hover:text-zinc-950 dark:hover:text-white" 
                              : isSelected && isCorrect 
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400" 
                              : isSelected && !isCorrect 
                              ? "bg-red-500/10 border-red-500 text-red-700 dark:text-red-400"
                              : isCorrect 
                              ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-700 dark:text-emerald-400" 
                              : "bg-zinc-50/50 dark:bg-white/[0.01] border-zinc-100 dark:border-white/[0.01] opacity-50 text-zinc-500"
                          )}
                        >
                          <span className="leading-relaxed">{option}</span>
                          {isAnswered && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 ml-3" />}
                          {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 shrink-0 ml-3" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback Pearl */}
                  {selectedAnswerIndex !== null && (
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 space-y-2 animate-fade-in">
                      <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-black text-[10px] uppercase tracking-wider">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span>CLINICAL PEARL:</span>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-white/70 leading-relaxed font-medium">
                        {filteredQuestions[currentQuestionIndex].explanation}
                      </p>
                    </div>
                  )}

                  {/* Next / Finish */}
                  {selectedAnswerIndex !== null && (
                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-3 bg-zinc-900 dark:bg-white/10 hover:bg-red-600 dark:hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                    >
                      {currentQuestionIndex < filteredQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // Quiz Finished Screen
              <div className="border-2 border-zinc-200 dark:border-white/10 bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 text-center space-y-6 shadow-lg">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <Award className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">Exam Completed!</h3>
                  <p className="text-xs font-mono font-black text-zinc-400 dark:text-white/30 uppercase tracking-widest">Your Score</p>
                  <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                    {quizScore} / {filteredQuestions.length}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-white/50 italic">
                    ({Math.round((quizScore / filteredQuestions.length) * 100)}% correct rate)
                  </p>
                </div>

                <div className="flex gap-3 justify-center pt-2">
                  <button
                    onClick={handleResetQuiz}
                    className="px-6 py-3 bg-zinc-900 dark:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-600 dark:hover:bg-emerald-600 transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restart Quiz
                  </button>
                  <button
                    onClick={() => setQuizStarted(false)}
                    className="px-6 py-3 border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                  >
                    Back to Setup
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
             CHECKSHEETS TAB 
           ========================================================================= */}
        {activeSubTab === 'checksheets' && (
          <div className="space-y-6">
            {!selectedChecklist ? (
              <div className="space-y-6">
                {/* Level selection filters */}
                <div className="flex flex-wrap gap-4 items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-4">
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tight text-zinc-950 dark:text-white">EMS Skill Sheets</h3>
                    <p className="text-xs text-zinc-500 dark:text-white/40">Select a certification level to view psychomotor checksheets and critical standards.</p>
                  </div>
                  <div className="flex bg-zinc-100 dark:bg-white/5 p-1 rounded-xl">
                    {(['All', 'EMR', 'EMT', 'AEMT'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setChecklistCategory(cat)}
                        className={cn(
                          "px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                          checklistCategory === cat 
                            ? "bg-white dark:bg-white/10 text-zinc-950 dark:text-white shadow-xs" 
                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white/80"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {SKILL_CHECKLISTS
                    .filter((list) => checklistCategory === 'All' || list.category === checklistCategory)
                    .map((list) => (
                      <div 
                        key={list.id}
                        className="border-2 border-zinc-150 dark:border-white/5 bg-white dark:bg-[#1C1C1E] rounded-2xl p-5 shadow-sm hover:border-red-600/30 dark:hover:border-emerald-600/30 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                              list.category === 'EMR' ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-850 dark:text-zinc-300' :
                              list.category === 'EMT' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                              'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                            )}>
                              {list.category} LEVEL
                            </span>
                            <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-white/30">
                              {list.steps.length} Steps
                            </span>
                          </div>
                          <h3 className="font-black text-lg uppercase tracking-tight text-zinc-900 dark:text-white">{list.title}</h3>
                          <p className="text-xs text-zinc-500 dark:text-white/60">
                            Interactive steps and critical criteria checklists to practice psychomotor assessments and hands-on drills.
                          </p>
                        </div>
                        <button
                          onClick={() => handleStartChecklist(list)}
                          className="mt-6 w-full py-3 bg-zinc-900 dark:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-red-600 dark:hover:bg-emerald-600 transition-colors"
                        >
                          <ClipboardList className="w-4 h-4" />
                          Open Skill Sheet
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              // Active Checksheet
              <div className="border-2 border-zinc-200 dark:border-white/10 bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-lg overflow-hidden">
                <div className="p-4 md:p-6 border-b border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] flex items-center justify-between flex-wrap gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-black uppercase tracking-widest text-red-600 dark:text-emerald-400">{selectedChecklist.category} SKILL SHEET ASSESSMENT</span>
                    <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white leading-tight">{selectedChecklist.title}</h3>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={resetChecklist}
                      className="px-3 py-1.5 border border-zinc-200 dark:border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </button>
                    <button 
                      onClick={() => setSelectedChecklist(null)}
                      className="px-3 py-1.5 bg-zinc-900 dark:bg-white/15 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-red-600 dark:hover:bg-emerald-600 transition-colors"
                    >
                      Exit
                    </button>
                  </div>
                </div>

                <div className="p-4 md:p-6 space-y-4">
                  <div className="p-3.5 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/25 rounded-2xl flex gap-2.5 text-xs text-amber-700 dark:text-amber-400">
                    <Info className="w-5 h-5 shrink-0" />
                    <div>
                      <span className="font-bold uppercase tracking-wider block text-[10px] mb-0.5">CRITICAL STANDARDS</span>
                      <p className="leading-relaxed">Steps marked with <span className="font-black text-red-600 dark:text-red-400">CRITICAL</span> are mandatory. Missing any critical step results in an automatic fail on psychomotor testing.</p>
                    </div>
                  </div>

                  {/* Steps List */}
                  <div className="space-y-2">
                    {selectedChecklist.steps.map((step, idx) => {
                      const isChecked = !!checklistProgress[idx];
                      return (
                        <div 
                          key={idx}
                          onClick={() => toggleChecklistStep(idx)}
                          className={cn(
                            "p-3.5 border rounded-xl flex gap-3.5 items-start cursor-pointer transition-all select-none",
                            isChecked 
                              ? "bg-zinc-50 dark:bg-white/[0.02] border-emerald-500 dark:border-emerald-500/50 opacity-80" 
                              : "bg-white dark:bg-white/[0.01] border-zinc-150 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/[0.03]"
                          )}
                        >
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="w-4 h-4 text-emerald-600 mt-0.5 rounded cursor-pointer shrink-0"
                          />
                          <div className="flex-1 space-y-1">
                            <p className={cn(
                              "text-xs font-semibold leading-relaxed",
                              isChecked ? "line-through text-zinc-400 dark:text-white/30 font-medium" : "text-zinc-800 dark:text-white/90"
                            )}>
                              {step.text}
                            </p>
                            {step.critical && (
                              <span className="inline-block px-1.5 py-0.5 bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-[8px] font-black uppercase tracking-wider rounded">
                                CRITICAL STEP
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress Indicator */}
                  <div className="mt-6 p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-150 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <span className="block text-[9px] font-mono font-black uppercase tracking-widest text-zinc-400 dark:text-white/30">COMPLETION</span>
                      <span className="text-sm font-black text-zinc-800 dark:text-white font-mono">
                        {Object.values(checklistProgress).filter(Boolean).length} / {selectedChecklist.steps.length} Steps
                      </span>
                    </div>
                    {Object.values(checklistProgress).filter(Boolean).length === selectedChecklist.steps.length && (
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
                        <ThumbsUp className="w-5 h-5" />
                        <span>Ready For Evaluation!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
             EKG PRACTICE TAB (NEW FEATURE)
           ========================================================================= */}
        {activeSubTab === 'ekg' && (
          <div className="space-y-6">
            {/* Mode Segmented Controls */}
            <div className="flex justify-center max-w-sm mx-auto bg-zinc-100 dark:bg-white/5 p-1 rounded-xl gap-1">
              <button
                onClick={() => setEkgMode('guide')}
                className={cn(
                  "flex-1 text-center py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
                  ekgMode === 'guide' ? "bg-white dark:bg-white/10 text-zinc-950 dark:text-white shadow-xs" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-350"
                )}
              >
                EKG Guide
              </button>
              <button
                onClick={() => setEkgMode('learn')}
                className={cn(
                  "flex-1 text-center py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
                  ekgMode === 'learn' ? "bg-white dark:bg-white/10 text-zinc-950 dark:text-white shadow-xs" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-350"
                )}
              >
                Learn Rhythms
              </button>
              <button
                onClick={() => {
                  setEkgMode('quiz');
                  setEkgQuizAnswered(false);
                  setEkgQuizSelectedId(null);
                  setEkgQuizScore(0);
                  setEkgQuizTotal(0);
                }}
                className={cn(
                  "flex-1 text-center py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
                  ekgMode === 'quiz' ? "bg-white dark:bg-white/10 text-zinc-950 dark:text-white shadow-xs" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-350"
                )}
              >
                Identify Quiz
              </button>
            </div>

            {/* Simulated EKG Hardware Monitor Card - Full Width */}
            <div className="border-4 border-zinc-800 bg-black rounded-3xl p-4 shadow-2xl relative overflow-hidden mb-6">
              {/* Neon screen glare */}
              <div className="absolute inset-0 bg-radial-at-t from-emerald-500/5 to-transparent pointer-events-none" />

              {/* Monitor Header Panel */}
              <div className="flex justify-between items-center text-emerald-500 font-mono text-[10px] uppercase tracking-wider border-b border-zinc-900 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <span className="font-bold">3MF PHYSIO-MONITOR 3045</span>
                </div>
                <div>
                  <span>LEAD II | SWEEP: {ekgSpeedMultiplier === 1 ? "25" : ekgSpeedMultiplier === 0.5 ? "12.5" : "6.25"} MM/S</span>
                </div>
              </div>

              {/* Canvas Container */}
              <div className={cn(
                "relative w-full bg-[#030304] rounded-xl border border-zinc-900 overflow-hidden transition-all duration-300",
                ekgMode === 'guide' ? "h-[500px] sm:h-[460px] md:h-[300px]" : "h-44"
              )}>
                {ekgMode !== 'guide' ? (
                  <>
                    <canvas ref={canvasRef} className="w-full h-full block" />

                    {/* Numeric Diagnostics floating overlay */}
                    <div className="absolute top-3 right-3 bg-black/60 border border-zinc-900 px-3 py-2 rounded-xl text-right font-mono select-none flex items-center gap-3">
                      {/* Sound toggle button */}
                      <button 
                        onClick={() => setEkgAudioEnabled(!ekgAudioEnabled)} 
                        className={cn(
                          "p-1.5 rounded-lg transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500/50", 
                          ekgAudioEnabled 
                            ? "text-emerald-400 bg-emerald-500/15 border border-emerald-500/20" 
                            : "text-zinc-600 hover:text-zinc-400 bg-zinc-900/40 border border-zinc-800"
                        )}
                        title={ekgAudioEnabled ? "Mute EKG Beep" : "Unmute EKG Beep"}
                      >
                        {ekgAudioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                      </button>

                      <div>
                        <span className="block text-[8px] text-zinc-500 uppercase tracking-widest leading-none">HR</span>
                        <div className="flex items-baseline justify-end gap-1 text-emerald-400">
                          <Heart id="monitor-heart-icon" className="w-3.5 h-3.5 text-zinc-500 inline shrink-0 transition-all duration-100 ease-out" />
                          <span className="text-2xl font-black tracking-tighter">
                            {ekgMode === 'quiz' 
                              ? (ekgQuizAnswered ? ekgQuizCurrent.rate : '??') 
                              : EKG_RHYTHMS.find(r => r.id === selectedEkgId)?.rate}
                          </span>
                          <span className="text-[9px] text-zinc-500 font-bold">/MIN</span>
                        </div>
                      </div>
                    </div>

                    {/* Unknown rhythm badge */}
                    {ekgMode === 'quiz' && !ekgQuizAnswered && (
                      <div className="absolute top-3 left-3 px-2 py-0.5 bg-red-600 text-white font-mono font-bold text-[9px] uppercase tracking-widest rounded animate-pulse">
                        UNKNOWN RHYTHM
                      </div>
                    )}
                  </>
                ) : (
                  <EkgGuideMonitorDisplay 
                    subTab={guideSubTab} 
                    activeIntroNode={activeIntroNode}
                    setActiveIntroNode={setActiveIntroNode}
                    activeAnatomySegment={activeAnatomySegment}
                    setActiveAnatomySegment={setActiveAnatomySegment}
                    activeLeadSystem={activeLeadSystem}
                    setActiveLeadSystem={setActiveLeadSystem}
                    activeRulesStep={activeRulesStep}
                    setActiveRulesStep={setActiveRulesStep}
                  />
                )}
              </div>

              {/* Monitor Bottom Footer */}
              <div className="flex justify-between items-center text-zinc-600 font-mono text-[9px] pt-2 border-t border-zinc-900 mt-2">
                <div className="flex items-center gap-3">
                  <span>CO2: 38 MMHG</span>
                  <span>SPO2: 97%</span>
                </div>

                {/* Interactive Sweep Speed Buttons */}
                <div className="flex items-center gap-1.5 bg-zinc-900/40 p-0.5 rounded-lg border border-zinc-800/60">
                  <span className="text-[8px] text-zinc-500 uppercase tracking-widest px-1">SWEEP:</span>
                  <button
                    type="button"
                    onClick={() => setEkgSpeedMultiplier(1)}
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider transition-all",
                      ekgSpeedMultiplier === 1
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                        : "text-zinc-500 hover:text-zinc-400 border border-transparent"
                    )}
                  >
                    1x (Normal)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEkgSpeedMultiplier(0.5)}
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider transition-all",
                      ekgSpeedMultiplier === 0.5
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                        : "text-zinc-500 hover:text-zinc-400 border border-transparent"
                    )}
                  >
                    0.5x (Slow)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEkgSpeedMultiplier(0.25)}
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider transition-all",
                      ekgSpeedMultiplier === 0.25
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                        : "text-zinc-500 hover:text-zinc-400 border border-transparent"
                    )}
                  >
                    0.25x (V.Slow)
                  </button>
                </div>

                <div>
                  <span>TEMP: 98.6 F</span>
                </div>
              </div>
            </div>

            {/* Side-by-Side Picker and Information/Quiz Sections */}
            {ekgMode === 'guide' && (
              <div className="space-y-6">
                {/* EKG Guide Internal Navigation Subtabs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-zinc-150 dark:bg-white/5 p-1 rounded-2xl border border-zinc-200 dark:border-white/5">
                  <button
                    onClick={() => setGuideSubTab('intro')}
                    className={cn(
                      "py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
                      guideSubTab === 'intro'
                        ? 'bg-zinc-900 dark:bg-white/10 text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    )}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>1. Intro & Pacemaker</span>
                  </button>
                  <button
                    onClick={() => setGuideSubTab('leads')}
                    className={cn(
                      "py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
                      guideSubTab === 'leads'
                        ? 'bg-zinc-900 dark:bg-white/10 text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    )}
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>2. 4-Lead vs. 12-Lead</span>
                  </button>
                  <button
                    onClick={() => setGuideSubTab('anatomy')}
                    className={cn(
                      "py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
                      guideSubTab === 'anatomy'
                        ? 'bg-zinc-900 dark:bg-white/10 text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    )}
                  >
                    <Heart className="w-3.5 h-3.5 animate-pulse text-red-500" />
                    <span>3. Beat Anatomy</span>
                  </button>
                  <button
                    onClick={() => setGuideSubTab('rules')}
                    className={cn(
                      "py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
                      guideSubTab === 'rules'
                        ? 'bg-zinc-900 dark:bg-white/10 text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    )}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>4. 5-Step Reading</span>
                  </button>
                </div>

                {/* Subtab Contents */}
                <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-3xl p-6 space-y-6">
                  {/* TAB 1: INTRO */}
                  {guideSubTab === 'intro' && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="border-b border-zinc-150 dark:border-white/5 pb-4">
                        <span className="text-[9px] font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">ECG FOUNDATIONS</span>
                        <h3 className="text-lg font-black uppercase text-zinc-900 dark:text-white mt-1 font-sans">Understanding the Heart's Spark</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed font-semibold">
                          An <strong>Electrocardiogram (ECG or EKG)</strong> is a vital diagnostic record of the heart's electrical system. 
                          By placing sensitive electrode leads on the body, clinicians can observe the wave vectors generated 
                          as the myocardial cells depolarize (contract) and repolarize (recharge).
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* SA Node Card */}
                        <button
                          type="button"
                          onClick={() => setActiveIntroNode('sa')}
                          className={cn(
                            "p-4 rounded-2xl text-left border transition-all space-y-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/30",
                            activeIntroNode === 'sa'
                              ? "bg-red-500/10 border-red-500/40 shadow-sm"
                              : "bg-zinc-50 dark:bg-black/30 border-zinc-200/50 dark:border-white/5 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30"
                          )}
                        >
                          <span className="text-[8px] font-mono font-black text-red-500 uppercase tracking-widest block">Primary Pacemaker</span>
                          <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            Sinoatrial (SA) Node
                          </h4>
                          <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
                            Located in the upper right atrium. It fires at an intrinsic rate of <strong>60-100 bpm</strong>. 
                            Its impulse flows downward across both atria, producing the <strong>P wave</strong> on the monitor.
                          </p>
                          <span className="text-[9px] font-mono font-bold text-red-500/80 block pt-1">
                            {activeIntroNode === 'sa' ? "● ACTIVE VIEW" : "Click to view on heart"}
                          </span>
                        </button>

                        {/* AV Node Card */}
                        <button
                          type="button"
                          onClick={() => setActiveIntroNode('av')}
                          className={cn(
                            "p-4 rounded-2xl text-left border transition-all space-y-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/30",
                            activeIntroNode === 'av'
                              ? "bg-amber-500/10 border-amber-500/40 shadow-sm"
                              : "bg-zinc-50 dark:bg-black/30 border-zinc-200/50 dark:border-white/5 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30"
                          )}
                        >
                          <span className="text-[8px] font-mono font-black text-amber-500 uppercase tracking-widest block">The Gatekeeper</span>
                          <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            Atrioventricular (AV) Node
                          </h4>
                          <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
                            Located at the junction. Holds the impulse for approx. 0.1s (PR interval) to let blood fill the ventricles. 
                            Acts as a backup pacemaker firing at <strong>40-60 bpm</strong> if the SA node fails.
                          </p>
                          <span className="text-[9px] font-mono font-bold text-amber-500/80 block pt-1">
                            {activeIntroNode === 'av' ? "● ACTIVE VIEW" : "Click to view on heart"}
                          </span>
                        </button>

                        {/* Purkinje System Card */}
                        <button
                          type="button"
                          onClick={() => setActiveIntroNode('purkinje')}
                          className={cn(
                            "p-4 rounded-2xl text-left border transition-all space-y-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/30",
                            activeIntroNode === 'purkinje'
                              ? "bg-cyan-500/10 border-cyan-500/40 shadow-sm"
                              : "bg-zinc-50 dark:bg-black/30 border-zinc-200/50 dark:border-white/5 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30"
                          )}
                        >
                          <span className="text-[8px] font-mono font-black text-cyan-500 uppercase tracking-widest block">Ventricular Distribution</span>
                          <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            Purkinje System
                          </h4>
                          <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
                            Includes the Bundle of His, bundle branches, and Purkinje fibers. Distributes the signal with extreme speed, 
                            producing the <strong>QRS complex</strong>. Backup firing rate is <strong>20-40 bpm</strong>.
                          </p>
                          <span className="text-[9px] font-mono font-bold text-cyan-500/80 block pt-1">
                            {activeIntroNode === 'purkinje' ? "● ACTIVE VIEW" : "Click to view on heart"}
                          </span>
                        </button>
                      </div>

                      <div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/25 rounded-2xl space-y-2">
                        <h4 className="text-xs font-black uppercase text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                          <Lightbulb className="w-4 h-4 shrink-0 animate-pulse text-amber-500" />
                          EMS Interactive Tip: Spark Pathway
                        </h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-semibold">
                          The active physiomonitor above shows exactly how each heart pacemaker structure draws its corresponding wave! Click the cards above or click on the glowing nodes directly on the heart vector graphic inside the top monitor block.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: LEADS (4 vs 12) */}
                  {guideSubTab === 'leads' && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="border-b border-zinc-150 dark:border-white/5 pb-4">
                        <span className="text-[9px] font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">LEAD SYSTEM CONFIGURATIONS</span>
                        <h3 className="text-lg font-black uppercase text-zinc-900 dark:text-white mt-1">Camera Vector Angles: 4-Lead vs. 12-Lead</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed font-semibold">
                          Students often confuse physical electrode patches with EKG views. An <strong>electrode</strong> is a physical sticker on the skin. 
                          A <strong>lead</strong> is a calculated, vector-based "camera angle" looking at the heart's center.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 4-Lead Card */}
                        <button
                          type="button"
                          onClick={() => setActiveLeadSystem('4lead')}
                          className={cn(
                            "text-left border rounded-2xl p-5 space-y-4 cursor-pointer focus:outline-none transition-all focus:ring-2 focus:ring-amber-500/30",
                            activeLeadSystem === '4lead'
                              ? "bg-amber-500/5 border-amber-500/30 shadow-md scale-[1.01]"
                              : "bg-zinc-50 dark:bg-black/30 border-zinc-200/50 dark:border-white/5 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30"
                          )}
                        >
                          <div className="flex items-center gap-2 text-red-600 dark:text-red-450">
                            <Activity className="w-5 h-5" />
                            <h4 className="text-sm font-black uppercase text-zinc-900 dark:text-white">Continuous telemetry (4-Lead)</h4>
                          </div>

                          <div className="space-y-2.5 font-semibold text-xs text-zinc-600 dark:text-zinc-400 w-full">
                            <div className="flex justify-between border-b border-zinc-200/40 dark:border-white/5 pb-1.5">
                              <span>Physical Stickers</span>
                              <span className="text-zinc-900 dark:text-white font-mono">3 or 4 Electrodes</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-200/40 dark:border-white/5 pb-1.5">
                              <span>Limb Placements</span>
                              <span className="text-zinc-900 dark:text-white font-mono text-[10px]">RA (White), LA (Black), LL (Red), RL (Green)</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-200/40 dark:border-white/5 pb-1.5">
                              <span>Calculated Views</span>
                              <span className="text-zinc-900 dark:text-white font-mono">Leads I, II, III (often Lead II standard)</span>
                            </div>
                            <div className="pt-2 text-left">
                              <span className="text-[9px] font-mono uppercase text-red-500 font-bold block">Best For:</span>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed font-semibold">
                                Continuous telemetry, monitoring heart rates, and picking up sudden rhythm transitions (V-Tach, Heart Blocks) during active patient transit.
                              </p>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono font-bold text-amber-500 block pt-1">
                            {activeLeadSystem === '4lead' ? "● ACTIVE CAMERA SYSTEM" : "Click to view torso placement above"}
                          </span>
                        </button>

                        {/* 12-Lead Card */}
                        <button
                          type="button"
                          onClick={() => setActiveLeadSystem('12lead')}
                          className={cn(
                            "text-left border rounded-2xl p-5 space-y-4 cursor-pointer focus:outline-none transition-all focus:ring-2 focus:ring-emerald-500/30",
                            activeLeadSystem === '12lead'
                              ? "bg-emerald-500/5 border-emerald-500/30 shadow-md scale-[1.01]"
                              : "bg-zinc-50 dark:bg-black/30 border-zinc-200/50 dark:border-white/5 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30"
                          )}
                        >
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-450">
                            <Zap className="w-5 h-5" />
                            <h4 className="text-sm font-black uppercase text-zinc-900 dark:text-white">Diagnostic 12-Lead EKG</h4>
                          </div>

                          <div className="space-y-2.5 font-semibold text-xs text-zinc-600 dark:text-zinc-400 w-full">
                            <div className="flex justify-between border-b border-zinc-200/40 dark:border-white/5 pb-1.5">
                              <span>Physical Stickers</span>
                              <span className="text-zinc-900 dark:text-white font-mono">10 Electrodes</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-200/40 dark:border-white/5 pb-1.5">
                              <span>Chest Placements</span>
                              <span className="text-zinc-900 dark:text-white font-mono text-[10px]">V1 to V6 (anatomically across chest wall)</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-200/40 dark:border-white/5 pb-1.5">
                              <span>Calculated Views</span>
                              <span className="text-zinc-900 dark:text-white font-mono text-[10px]">I, II, III, aVR, aVL, aVF, and V1 - V6</span>
                            </div>
                            <div className="pt-2 text-left">
                              <span className="text-[9px] font-mono uppercase text-emerald-500 font-bold block">Contiguous Anatomical Views:</span>
                              <div className="grid grid-cols-3 gap-1.5 text-[9px] font-mono text-zinc-500 mt-1 bg-black/5 dark:bg-black/40 p-2 rounded-lg">
                                <div>
                                  <strong className="text-zinc-800 dark:text-white block uppercase text-[8px]">Inferior</strong>
                                  <span>II, III, aVF</span>
                                </div>
                                <div>
                                  <strong className="text-zinc-800 dark:text-white block uppercase text-[8px]">Anterior</strong>
                                  <span>V3, V4</span>
                                </div>
                                <div>
                                  <strong className="text-zinc-800 dark:text-white block uppercase text-[8px]">Lateral</strong>
                                  <span>I, aVL, V5, V6</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono font-bold text-emerald-500 block pt-1">
                            {activeLeadSystem === '12lead' ? "● ACTIVE CAMERA SYSTEM" : "Click to view chest electrode placement above"}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: BEAT ANATOMY */}
                  {guideSubTab === 'anatomy' && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="border-b border-zinc-150 dark:border-white/5 pb-4">
                        <span className="text-[9px] font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">WAVEFORM ANALYSIS</span>
                        <h3 className="text-lg font-black uppercase text-zinc-900 dark:text-white mt-1">Anatomy of an EKG Beat (Segments 1 to 5)</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed font-semibold">
                          Each individual heartbeat produces a sequence of electrical waves. Click the wave segments below to highlight them on the medical diagnostic grid paper at the top of this card.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {[
                          {
                            id: 1,
                            title: 'P Wave — Atrial Depolarization',
                            desc: 'Represents the SA Node pacemaker firing. The impulse spreads outwards across the left and right atria, causing muscular contraction.',
                            val: 'Normal: Under 0.11 seconds wide, and rounded. If absent, the rhythm may be A-Fib or junctional.',
                            color: 'text-red-500 bg-red-500/10'
                          },
                          {
                            id: 2,
                            title: 'PR Interval — Conduction Pause',
                            desc: 'The time taken for the electrical impulse to travel from the SA node, across the atria, and pass through the AV Node gatekeeper.',
                            val: 'Normal: 0.12 - 0.20 seconds (3 to 5 small squares). If constant and prolonged (> 0.20 seconds), it indicates First-Degree Heart Block.',
                            color: 'text-amber-500 bg-amber-500/10'
                          },
                          {
                            id: 3,
                            title: 'QRS Complex — Ventricular Depolarization',
                            desc: 'Represents the impulse shooting down the Bundle of His and Purkinje fibers, causing the ventricles to depolarize and contract with force.',
                            val: 'Normal: Under 0.12 seconds (3 small squares). If wide (>= 0.12 seconds), the rhythm originates in the ventricles (e.g., PVCs, V-Tach, Bundle Branch Blocks).',
                            color: 'text-cyan-500 bg-cyan-500/10'
                          },
                          {
                            id: 4,
                            title: 'ST Segment — Plateau Baseline',
                            desc: 'The temporary baseline state when ventricles are fully depolarized but have not yet begun to reset.',
                            val: 'Normal: Flat on the isoelectric line. If elevated by >= 1mm in contiguous leads, it represents acute STEMI (heart attack). If depressed, it suggests ischemia.',
                            color: 'text-emerald-500 bg-emerald-500/10'
                          },
                          {
                            id: 5,
                            title: 'T Wave — Ventricular Repolarization',
                            desc: 'Represents the ventricles resting and electrically recharging (repolarization) so they are ready to contract on the next beat.',
                            val: 'Normal: Smooth, asymmetrical slope. Hyperacute (very tall and pointed) T waves indicate hyperkalemia or immediate early stages of ischemia.',
                            color: 'text-pink-500 bg-pink-500/10'
                          }
                        ].map((wave) => (
                          <button
                            key={wave.id}
                            type="button"
                            onClick={() => setActiveAnatomySegment(wave.id)}
                            className={cn(
                              "w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-1.5 cursor-pointer focus:outline-none focus:ring-1",
                              activeAnatomySegment === wave.id
                                ? "bg-zinc-50 dark:bg-black/40 border-emerald-500/40 shadow-sm scale-[1.005]"
                                : "bg-zinc-50/50 dark:bg-black/15 border-zinc-200/40 dark:border-white/5 hover:bg-zinc-100/30 dark:hover:bg-white/5"
                            )}
                          >
                            <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white flex items-center gap-2">
                              <span className={cn("font-mono text-[9px] px-1.5 py-0.5 rounded font-black", wave.color)}>
                                0{wave.id}
                              </span>
                              {wave.title}
                              {activeAnatomySegment === wave.id && (
                                <span className="text-[8px] font-mono text-emerald-500 font-bold ml-auto uppercase tracking-wider animate-pulse">● HIGHLIGHTED IN MONITOR</span>
                              )}
                            </h4>
                            <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
                              {wave.desc}
                            </p>
                            <div className="text-[10px] font-mono text-zinc-700 dark:text-zinc-300 bg-black/5 dark:bg-black/30 border border-zinc-200/40 dark:border-white/5 p-2 rounded-lg font-bold w-full">
                              ⚡ Measurement Key: {wave.val}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: 5-STEP METHOD */}
                  {guideSubTab === 'rules' && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="border-b border-zinc-150 dark:border-white/5 pb-4">
                        <span className="text-[9px] font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">RAPID ECG INTERPRETATION</span>
                        <h3 className="text-lg font-black uppercase text-zinc-900 dark:text-white mt-1">The 5-Step Systematic Method</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed font-semibold">
                          To read any EKG with perfect accuracy, never try to guess based on visual "looks". Always run through 
                          these 5 diagnostic steps. Click on any step to see interactive calipers on the grid above!
                        </p>
                      </div>

                      <div className="space-y-4">
                        {[
                          {
                            id: 1,
                            step: 'Step 1: Calculate the Rate',
                            info: 'Determine the heart rate in beats per minute.',
                            detail: 'For regular rhythms, count the number of large squares between two R-wave peaks and divide 300 by that number (e.g., 4 large squares = 75 bpm). For irregular rhythms, count the QRS waves in a 6-second strip and multiply by 10.'
                          },
                          {
                            id: 2,
                            step: 'Step 2: Assess Regularity',
                            info: 'Is the distance between consecutive R peaks equal?',
                            detail: 'Measure R-R intervals with calipers or paper. If they are equal, it is regular. If they vary by more than 1.5 small boxes, it is irregular (e.g. Atrial Fibrillation is "irregularly irregular").'
                          },
                          {
                            id: 3,
                            step: 'Step 3: Analyze P-Waves',
                            info: 'Look closely for atrial activity.',
                            detail: 'Are there P-waves? Are they upright and identical? Is there exactly one P-wave before every QRS complex? (No P-waves + irregular rate = Atrial Fibrillation. Flutter sawtooth waves = Atrial Flutter).'
                          },
                          {
                            id: 4,
                            step: 'Step 4: Measure the PR Interval',
                            info: 'Measure from start of P wave to start of QRS.',
                            detail: 'Is the PR interval constant? Is it between 0.12 and 0.20 seconds? If constant but prolonged, it is a First-Degree AV Block. If it changes, check if it progressively elongates (Wenckebach) or has constant but dropped QRS cycles (Mobitz II).'
                          },
                          {
                            id: 5,
                            step: 'Step 5: Measure the QRS Duration',
                            info: 'Measure from start of Q-wave to end of S-wave.',
                            detail: 'Is it narrow (<0.12s / 3 small boxes)? Or is it wide (>= 0.12s)? Wide QRS means conduction is delayed in the ventricles (e.g. Ventricular Tachycardia, PVC, or Bundle Branch Blocks).'
                          }
                        ].map((stepObj) => (
                          <button
                            key={stepObj.id}
                            type="button"
                            onClick={() => setActiveRulesStep(stepObj.id)}
                            className={cn(
                              "w-full text-left p-4 rounded-2xl border transition-all flex gap-3.5 items-start cursor-pointer focus:outline-none focus:ring-1",
                              activeRulesStep === stepObj.id
                                ? "bg-zinc-50 dark:bg-black/40 border-emerald-500/40 shadow-sm scale-[1.005]"
                                : "bg-zinc-50/50 dark:bg-black/15 border-zinc-200/40 dark:border-white/5 hover:bg-zinc-100/30 dark:hover:bg-white/5"
                            )}
                          >
                            <div className={cn(
                              "flex items-center justify-center w-8 h-8 rounded-full font-mono text-xs font-black shrink-0 mt-0.5",
                              activeRulesStep === stepObj.id
                                ? "bg-emerald-500 text-black shadow-sm"
                                : "bg-zinc-900 text-white dark:bg-emerald-500/10 dark:text-emerald-400"
                            )}>
                              {stepObj.id}
                            </div>
                            <div className="space-y-1 w-full">
                              <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white flex items-center justify-between">
                                <span>{stepObj.step}</span>
                                {activeRulesStep === stepObj.id && (
                                  <span className="text-[8px] font-mono text-emerald-500 font-bold uppercase tracking-wider animate-pulse">● CALIPERS ON MONITOR</span>
                                )}
                              </h4>
                              <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                                {stepObj.info}
                              </p>
                              <p className="text-xs text-zinc-600 dark:text-white/70 leading-relaxed font-semibold pt-1">
                                {stepObj.detail}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mobile-Only Interactive EKG Monitor Mirror */}
                  <div className="md:hidden pt-6 border-t border-zinc-200 dark:border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-mono font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">
                          Active Monitor Display (Mirror)
                        </span>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                        Interactive Live Feed
                      </span>
                    </div>
                    
                    <div className="relative w-full bg-[#030304] rounded-3xl border-2 border-zinc-900 overflow-hidden h-[480px] sm:h-[440px] shadow-2xl">
                      <EkgGuideMonitorDisplay 
                        subTab={guideSubTab} 
                        activeIntroNode={activeIntroNode}
                        setActiveIntroNode={setActiveIntroNode}
                        activeAnatomySegment={activeAnatomySegment}
                        setActiveAnatomySegment={setActiveAnatomySegment}
                        activeLeadSystem={activeLeadSystem}
                        setActiveLeadSystem={setActiveLeadSystem}
                        activeRulesStep={activeRulesStep}
                        setActiveRulesStep={setActiveRulesStep}
                      />
                    </div>
                    
                    {/* Compact Mobile Monitor Footer */}
                    <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400 font-mono text-[9px] bg-zinc-50 dark:bg-black/40 px-4 py-2.5 rounded-2xl border border-zinc-200/50 dark:border-white/5 shadow-xs">
                      <span className="font-semibold">CO2: 38 MMHG</span>
                      <span className="font-semibold">SPO2: 97%</span>
                      <span className="font-semibold">TEMP: 98.6°F</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {ekgMode === 'learn' && (
              <div className="space-y-6">
                {/* ACLS ALIGNMENT on top */}
                <div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/25 rounded-2xl flex gap-2.5 text-xs text-emerald-700 dark:text-emerald-400">
                  <Info className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="font-bold uppercase tracking-wider block text-[10px] mb-0.5">ACLS ALIGNMENT</span>
                    <p className="leading-relaxed font-medium text-[11px]">Use study mode to analyze heart rhythms, rate, P-waves, and QRS intervals. Toggle quiz mode to test diagnostic interpretation accuracy under pressure.</p>
                  </div>
                </div>

                {/* Side-by-Side Picker and Information Sections */}
                <div className="grid lg:grid-cols-12 gap-6">
                  {/* Left Column: Rhythms Selection Sidebar */}
                  <div className="lg:col-span-5 xl:col-span-4 space-y-4">
                    <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-2xl p-4 shadow-sm max-h-[500px] overflow-y-auto scrollbar-thin">
                      <h4 className="text-[10px] font-mono font-black uppercase tracking-wider text-zinc-400 mb-3 sticky top-0 bg-white dark:bg-[#1C1C1E] py-1 z-10">ECG Rhythm Library</h4>
                      <div className="space-y-4">
                        {[
                          'Basics & Life Threats (Shockable & Asystole)',
                          'Stable/Unstable Tachycardias',
                          'Bradycardias',
                          'Ectopy & Other Rhythms'
                        ].map((categoryName) => {
                          const rhythms = EKG_RHYTHMS.filter(r => r.category === categoryName);
                          return (
                            <div key={categoryName} className="space-y-1.5">
                              <span className="block text-[8px] font-mono font-black text-red-600 dark:text-emerald-400 uppercase tracking-widest bg-zinc-50 dark:bg-white/5 px-2 py-0.5 rounded leading-normal">
                                {categoryName}
                              </span>
                              {rhythms.map((rhythm) => (
                                <button
                                  key={rhythm.id}
                                  onClick={() => {
                                    setSelectedEkgId(rhythm.id);
                                    setEkgMode('learn');
                                  }}
                                  className={cn(
                                    "w-full text-left p-2 border rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-between group transition-all",
                                    selectedEkgId === rhythm.id
                                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                                      : "bg-white border-zinc-100 hover:border-zinc-300 text-zinc-700 dark:bg-white/[0.01] dark:border-white/5 dark:text-white/80"
                                  )}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Heart className="w-3 h-3 text-zinc-400 group-hover:text-red-500 shrink-0" />
                                    <span className="truncate">{rhythm.name}</span>
                                  </div>
                                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                </button>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Active Study Criteria */}
                  <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                    <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
                      {(() => {
                        const rhythm = EKG_RHYTHMS.find(r => r.id === selectedEkgId);
                        if (!rhythm) return null;
                        return (
                          <>
                            <div className="flex justify-between items-start flex-wrap gap-2 border-b border-zinc-150 dark:border-white/5 pb-3">
                              <div>
                                <span className="text-[9px] font-mono font-black uppercase tracking-wider text-red-600 dark:text-emerald-400">RHYTHM CRITERIA</span>
                                <h3 className="text-xl font-black uppercase tracking-tight text-zinc-950 dark:text-white mt-1">{rhythm.name}</h3>
                              </div>
                              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-zinc-100 dark:bg-white/5 rounded">
                                Rate: {rhythm.rate} bpm
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono py-2 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-150 dark:border-white/5 rounded-xl">
                              <div>
                                <span className="block text-zinc-400 uppercase text-[8px]">Regularity</span>
                                <span className="font-black text-zinc-800 dark:text-white uppercase">{rhythm.regularity}</span>
                              </div>
                              <div>
                                <span className="block text-zinc-400 uppercase text-[8px]">QRS Complex</span>
                                <span className="font-black text-zinc-800 dark:text-white uppercase">{rhythm.qrs}</span>
                              </div>
                              <div>
                                <span className="block text-zinc-400 uppercase text-[8px]">P-Wave</span>
                                <span className="font-black text-zinc-800 dark:text-white uppercase">{rhythm.pWave}</span>
                              </div>
                            </div>

                            <div className="space-y-3 pt-2">
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono font-bold text-zinc-400 block">Pathophysiology:</span>
                                <p className="text-xs leading-relaxed text-zinc-600 dark:text-white/70">{rhythm.description}</p>
                              </div>
                              <div className="space-y-1 border-t border-zinc-100 dark:border-white/5 pt-2">
                                <span className="text-[10px] font-mono font-bold text-zinc-400 block">Treatment & Intervention:</span>
                                <p className="text-xs leading-relaxed text-emerald-600 dark:text-emerald-400 font-semibold">{rhythm.treatment}</p>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {ekgMode === 'quiz' && (
              /* Quiz Mode Layout: Full-Width, Center-Aligned, No Sidebar */
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-100 dark:border-white/5 pb-3">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-zinc-400">CHOOSE CORRECT INTERPRETATION:</span>
                    <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">Score: {ekgQuizScore} / {ekgQuizTotal}</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-2.5">
                    {ekgQuizOptions.map((opt) => {
                      const isAnswered = ekgQuizAnswered;
                      const isSelected = ekgQuizSelectedId === opt.id;
                      const isCorrect = opt.id === ekgQuizCurrent.id;

                      return (
                        <button
                          key={opt.id}
                          disabled={isAnswered}
                          onClick={() => handleEkgAnswer(opt.id)}
                          className={cn(
                            "p-3.5 border text-left text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-between",
                            !isAnswered 
                              ? "bg-zinc-50 hover:bg-zinc-100 dark:bg-white/[0.01] border-zinc-150 dark:border-white/5 hover:border-emerald-500/30 text-zinc-800 dark:text-white/80 hover:text-zinc-950 dark:hover:text-white"
                              : isSelected && isCorrect
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                              : isSelected && !isCorrect
                              ? "bg-red-500/10 border-red-500 text-red-600 dark:text-red-400"
                              : isCorrect
                              ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold"
                              : "opacity-40 text-zinc-400 dark:text-white/20 border-zinc-100 dark:border-white/[0.01]"
                          )}
                        >
                          <span>{opt.name}</span>
                          {isAnswered && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                          {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-500" />}
                        </button>
                      );
                    })}
                  </div>

                  {ekgQuizAnswered && (
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-150 dark:border-white/5 space-y-3 mt-4 animate-fade-in">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-black text-[10px] uppercase tracking-wider">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          <span>CLINICAL PEARL:</span>
                        </div>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-zinc-200 dark:bg-white/5 text-zinc-600 dark:text-white/70 rounded">
                          Heart Rate: {ekgQuizCurrent.rate} bpm
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-white/70 leading-relaxed font-medium">
                        {ekgQuizCurrent.description}
                      </p>
                      <div className="border-t border-zinc-200 dark:border-white/10 pt-2 text-[11px]">
                        <span className="font-black text-red-600 dark:text-emerald-400 block uppercase text-[9px] mb-0.5">PROTOCOL CRITICAL ACTION:</span>
                        <p className="text-zinc-700 dark:text-emerald-300 font-semibold italic">{ekgQuizCurrent.treatment}</p>
                      </div>
                      
                      <button
                        onClick={generateEkgQuiz}
                        className="w-full mt-2 py-2.5 bg-zinc-900 dark:bg-white/10 hover:bg-emerald-600 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-colors"
                      >
                        Next ECG Rhythm
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
             IV REVIEW TAB (NEW FEATURE)
           ========================================================================= */}
        {activeSubTab === 'iv' && (
          <IvReview />
        )}

        {/* =========================================================================
             IO REVIEW TAB (NEW FEATURE)
           ========================================================================= */}
        {activeSubTab === 'io' && (
          <IoReview />
        )}

        {false && (activeSubTab as string) === 'io' && (
          <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-wrap gap-4 items-center justify-between border-b border-zinc-150 dark:border-white/5 pb-4">
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-zinc-950 dark:text-white">Intraosseous (IO) Access Review</h3>
                <p className="text-xs text-zinc-500 dark:text-white/40">Anatomical landmarking, needle selections, and procedural guidelines for adult and pediatric emergency infusion.</p>
              </div>
              
              {/* Patient Type Filter */}
              <div className="flex bg-zinc-100 dark:bg-white/5 p-1 rounded-xl">
                {(['adult', 'pediatric'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setIoPatientType(type);
                      // Set a valid default site for the chosen patient type
                      if (type === 'pediatric' && selectedIoSite === 'distal_tibia') {
                        setSelectedIoSite('proximal_tibia');
                      } else if (type === 'adult' && selectedIoSite === 'distal_femur') {
                        setSelectedIoSite('proximal_tibia');
                      }
                    }}
                    className={cn(
                      "px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                      ioPatientType === type 
                        ? "bg-white dark:bg-white/10 text-zinc-950 dark:text-white shadow-xs" 
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white/80"
                    )}
                  >
                    {type === 'adult' ? 'Adult Protocol' : 'Pediatric Protocol'}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Left Column: Anatomical Sites & Diagrams (Spans 7/12) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
                  
                  {/* Site Tabs */}
                  <div className="flex flex-wrap gap-2">
                    {ioPatientType === 'adult' ? (
                      <>
                        <button
                          onClick={() => setSelectedIoSite('proximal_tibia')}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border",
                            selectedIoSite === 'proximal_tibia'
                              ? "bg-red-600/10 border-red-500 text-red-700 dark:text-red-400"
                              : "bg-zinc-50 border-zinc-150 text-zinc-600 dark:bg-white/5 dark:border-white/5 dark:text-white/60"
                          )}
                        >
                          Proximal Tibia
                        </button>
                        <button
                          onClick={() => setSelectedIoSite('proximal_humerus')}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border",
                            selectedIoSite === 'proximal_humerus'
                              ? "bg-red-600/10 border-red-500 text-red-700 dark:text-red-400"
                              : "bg-zinc-50 border-zinc-150 text-zinc-600 dark:bg-white/5 dark:border-white/5 dark:text-white/60"
                          )}
                        >
                          Proximal Humerus
                        </button>
                        <button
                          onClick={() => setSelectedIoSite('distal_tibia')}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border",
                            selectedIoSite === 'distal_tibia'
                              ? "bg-red-600/10 border-red-500 text-red-700 dark:text-red-400"
                              : "bg-zinc-50 border-zinc-150 text-zinc-600 dark:bg-white/5 dark:border-white/5 dark:text-white/60"
                          )}
                        >
                          Distal Tibia
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setSelectedIoSite('proximal_tibia')}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border",
                            selectedIoSite === 'proximal_tibia'
                              ? "bg-red-600/10 border-red-500 text-red-700 dark:text-red-400"
                              : "bg-zinc-50 border-zinc-150 text-zinc-600 dark:bg-white/5 dark:border-white/5 dark:text-white/60"
                          )}
                        >
                          Proximal Tibia (Peds)
                        </button>
                        <button
                          onClick={() => setSelectedIoSite('distal_femur')}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border",
                            selectedIoSite === 'distal_femur'
                              ? "bg-red-600/10 border-red-500 text-red-700 dark:text-red-400"
                              : "bg-zinc-50 border-zinc-150 text-zinc-600 dark:bg-white/5 dark:border-white/5 dark:text-white/60"
                          )}
                        >
                          Distal Femur (Peds)
                        </button>
                        <button
                          onClick={() => setSelectedIoSite('proximal_humerus')}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border",
                            selectedIoSite === 'proximal_humerus'
                              ? "bg-red-600/10 border-red-500 text-red-700 dark:text-red-400"
                              : "bg-zinc-50 border-zinc-150 text-zinc-600 dark:bg-white/5 dark:border-white/5 dark:text-white/60"
                          )}
                        >
                          Proximal Humerus (Peds)
                        </button>
                      </>
                    )}
                  </div>

                  {/* SVG Anatomical Visual Canvas */}
                  <div className="relative w-full aspect-video md:h-80 bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 flex flex-col justify-between p-4">
                    
                    {/* Background Grid Lines to make it feel like medical/technical schematic */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:24px_24px] opacity-10 pointer-events-none" />
                    
                    {/* Floating Info Badge */}
                    <div className="absolute top-3 left-3 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-xl font-mono text-[9px] select-none text-zinc-400 uppercase tracking-widest z-10">
                      Anatomical Landmark Guide
                    </div>

                    {/* Render Specific SVG Visual Diagram based on selected site and patient type */}
                    <div className="flex-1 flex items-center justify-center relative w-full h-full min-h-0">
                      
                      {selectedIoSite === 'proximal_tibia' && (
                        <svg viewBox="0 0 400 250" className="w-full h-full max-h-[220px]">
                          <defs>
                            <linearGradient id="boneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#2d2d30" />
                              <stop offset="50%" stopColor="#4e4e54" />
                              <stop offset="100%" stopColor="#1e1e20" />
                            </linearGradient>
                            <linearGradient id="patellaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#52525b" />
                              <stop offset="100%" stopColor="#27272a" />
                            </linearGradient>
                          </defs>

                          {/* Knee joint leg contour outline - Anatomically styled */}
                          <path d="M 110,20 C 110,70 100,105 110,125 C 125,145 125,160 135,175 C 145,190 145,230" fill="none" stroke="#4b5563" strokeWidth="2" strokeDasharray="3,3" opacity="0.6" />
                          <path d="M 210,20 C 210,80 200,130 190,180 C 185,200 180,230" fill="none" stroke="#4b5563" strokeWidth="2" strokeDasharray="3,3" opacity="0.6" />
                          
                          {/* Femur bone block - Anatomical condyles */}
                          <path d="M 142,20 L 142,90 C 140,102 148,110 155,110 C 160,110 162,104 165,104 C 168,104 170,110 175,110 C 182,110 190,102 188,90 L 188,20" fill="url(#boneGrad)" stroke="#71717a" strokeWidth="1.5" />
                          <text x="148" y="55" fill="#a1a1aa" className="text-[7px] font-bold font-mono">FEMUR</text>

                          {/* Patella (Kneecap) - Almond shaped, anatomical */}
                          <path d="M 124,106 C 120,106 117,112 119,120 C 121,128 127,130 129,122 C 131,114 128,106 124,106 Z" fill="url(#patellaGrad)" stroke="#a1a1aa" strokeWidth="1.2" />
                          <text x="110" y="116" textAnchor="end" fill="#a1a1aa" className="text-[8px] font-mono">Patella</text>
                          <line x1="114" y1="114" x2="120" y2="114" stroke="#71717a" strokeWidth="0.5" />

                          {/* Patellar Ligament (Tendon) - cyan color */}
                          <path d="M 124,122 Q 123,136 137,144" fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
                          <text x="110" y="132" textAnchor="end" fill="#06b6d4" className="text-[8px] font-mono font-bold">Patellar Tendon</text>
                          <line x1="114" y1="130" x2="124" y2="131" stroke="#06b6d4" strokeWidth="0.5" opacity="0.7" />

                          {/* Tibia bone with plateau, tibial tuberosity, and shaft */}
                          <path d="M 136,134 C 142,134 148,138 155,138 C 162,138 168,134 174,134 C 182,134 184,140 184,148 L 172,230 L 142,230 L 142,154 C 135,152 134,144 138,140 Z" fill="url(#boneGrad)" stroke="#e4e4e7" strokeWidth="1.5" />
                          <text x="146" y="210" fill="#e4e4e7" className="text-[8px] font-bold font-mono">TIBIA</text>

                          {/* Tibial Tuberosity Highlight (bony bump on anterior tibia) */}
                          <circle cx="136" cy="144" r="3.5" fill="#f43f5e" />
                          <text x="110" y="156" textAnchor="end" fill="#f43f5e" className="text-[8px] font-mono font-bold">Tibial Tuberosity</text>
                          <line x1="114" y1="154" x2="134" y2="146" stroke="#f43f5e" strokeWidth="0.5" />

                          {/* Fibula bone (lateral side, background) */}
                          <path d="M 182,146 L 190,150 L 182,230 L 176,230 Z" fill="url(#boneGrad)" stroke="#52525b" strokeWidth="1.2" opacity="0.7" />
                          <text x="188" y="215" fill="#71717a" className="text-[7px] font-bold font-mono">FIBULA</text>

                          {/* TARGET IO PLACEMENT BULLEYE */}
                          {ioPatientType === 'adult' ? (
                            <>
                              {/* Adult Target: 2cm medial to the tuberosity (on the flat anteromedial aspect) */}
                              <g className="animate-pulse">
                                <circle cx="156" cy="152" r="14" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2,2" />
                                <circle cx="156" cy="152" r="8" fill="none" stroke="#ef4444" strokeWidth="2" />
                                <circle cx="156" cy="152" r="2.5" fill="#ef4444" />
                              </g>
                              
                              {/* Anatomically detailed measurement line (2cm medial) */}
                              <line x1="136" y1="144" x2="156" y2="152" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="3,1" />
                              <circle cx="136" cy="144" r="1.5" fill="#ef4444" />
                              <circle cx="156" cy="152" r="1.5" fill="#ef4444" />
                              
                              <text x="210" y="150" fill="#ef4444" className="text-[10px] font-black uppercase tracking-wider font-mono">ADULT TARGET ACCESS</text>
                              <text x="210" y="162" fill="#9ca3af" className="text-[8px] font-mono">2 cm Medial to Tibial Tuberosity</text>
                              <text x="210" y="172" fill="#9ca3af" className="text-[8px] font-mono">on flat anteromedial aspect</text>
                            </>
                          ) : (
                            <>
                              {/* Pediatric Target: 1-2cm distal & slightly medial to avoid growth plate */}
                              <g className="animate-pulse">
                                <circle cx="154" cy="174" r="14" fill="none" stroke="#34d399" strokeWidth="1.5" strokeDasharray="2,2" />
                                <circle cx="154" cy="174" r="8" fill="none" stroke="#34d399" strokeWidth="2" />
                                <circle cx="154" cy="174" r="2.5" fill="#34d399" />
                              </g>

                              {/* Epiphyseal Plate (growth plate warning) - anatomically located above tuberosity */}
                              <line x1="138" y1="138" x2="182" y2="138" stroke="#fbbf24" strokeWidth="3" strokeDasharray="3,2" />
                              <text x="120" y="141" textAnchor="end" fill="#fbbf24" className="text-[8px] font-black font-mono">GROWTH PLATE (AVOID)</text>
                              <line x1="124" y1="138" x2="136" y2="138" stroke="#fbbf24" strokeWidth="0.5" />
                              
                              {/* Dimension lines showing 1-2 cm distal and slightly medial */}
                              <line x1="136" y1="144" x2="136" y2="174" stroke="#34d399" strokeWidth="1" strokeDasharray="2,1" />
                              <line x1="136" y1="174" x2="154" y2="174" stroke="#34d399" strokeWidth="1" strokeDasharray="2,1" />
                              <circle cx="136" cy="144" r="1.5" fill="#34d399" />
                              <circle cx="154" cy="174" r="1.5" fill="#34d399" />

                              <text x="210" y="174" fill="#34d399" className="text-[10px] font-black uppercase tracking-wider font-mono">PEDIATRIC TARGET</text>
                              <text x="210" y="186" fill="#9ca3af" className="text-[8px] font-mono">1-2 cm Distal & Medial to Tuberosity</text>
                              <text x="210" y="196" fill="#9ca3af" className="text-[8px] font-mono">(Completely clear of Epiphyseal plate)</text>
                            </>
                          )}
                        </svg>
                      )}

                      {selectedIoSite === 'proximal_humerus' && (
                        <svg viewBox="0 0 400 250" className="w-full h-full max-h-[220px]">
                          <defs>
                            <linearGradient id="humerusGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#2d2d30" />
                              <stop offset="60%" stopColor="#4e4e54" />
                              <stop offset="100%" stopColor="#1e1e20" />
                            </linearGradient>
                          </defs>

                          {/* Shoulder joint skin and arm outline */}
                          <path d="M 80,60 C 130,50 150,70 170,95 C 180,110 185,130 185,160 C 185,200 170,230" fill="none" stroke="#4b5563" strokeWidth="2" strokeDasharray="3,3" opacity="0.6" />
                          <path d="M 230,120 C 235,140 230,195 225,240" fill="none" stroke="#4b5563" strokeWidth="2" strokeDasharray="3,3" opacity="0.6" />
                          
                          {/* Clavicle */}
                          <path d="M 80,75 L 146,92" fill="none" stroke="#52525b" strokeWidth="3" strokeLinecap="round" />
                          <text x="82" y="70" fill="#71717a" className="text-[8px] font-mono">Clavicle</text>

                          {/* Scapula - Acromion Process (forms the bony ceiling of shoulder) */}
                          <path d="M 134,80 L 168,90 Q 174,92 172,98 L 162,112" fill="none" stroke="#71717a" strokeWidth="2" />
                          <text x="110" y="112" fill="#71717a" className="text-[8px] font-mono">Acromion Process</text>
                          <line x1="146" y1="110" x2="162" y2="98" stroke="#52525b" strokeWidth="0.5" />

                          {/* Humerus Bone structure - Anatomically precise head, neck, greater/lesser tubercle */}
                          {/* Glenoid Cavity area (faint backdrop bone) */}
                          <path d="M 130,105 C 128,115 128,125 132,135" fill="none" stroke="#52525b" strokeWidth="2.5" opacity="0.5" />

                          {/* Humerus bone shape */}
                          <path d="M 144,125 C 144,110 156,98 168,98 C 176,98 184,104 186,112 C 192,112 196,116 196,124 C 196,132 188,138 182,144 L 182,230 L 154,230 L 154,144 C 150,140 144,135 144,125 Z" fill="url(#humerusGrad)" stroke="#e4e4e7" strokeWidth="1.5" />
                          <text x="156" y="200" fill="#e4e4e7" className="text-[8px] font-bold font-mono">HUMERUS</text>

                          {/* Bicipital Groove & Biceps Tendon - anatomical hazard on medial aspect */}
                          <path d="M 172,114 C 172,114 170,126 170,136 L 170,166" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="2,2" opacity="0.8" />
                          <text x="120" y="142" textAnchor="end" fill="#f43f5e" className="text-[8px] font-mono font-bold">Bicipital Groove</text>
                           <text x="120" y="152" textAnchor="end" fill="#f43f5e" className="text-[8px] font-mono font-bold">& Biceps Tendon (AVOID)</text>
                          <line x1="125" y1="145" x2="168" y2="136" stroke="#f43f5e" strokeWidth="0.5" opacity="0.7" />

                          {/* TARGET IO PLACEMENT BULLEYE on Greater Tubercle (lateral/anterior aspect) */}
                          <g className="animate-pulse">
                            <circle cx="186" cy="122" r="14" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2,2" />
                            <circle cx="186" cy="122" r="8" fill="none" stroke="#ef4444" strokeWidth="2" />
                            <circle cx="186" cy="122" r="2.5" fill="#ef4444" />
                          </g>

                          {/* Annotations & anatomical alignment directions */}
                          <text x="215" y="115" fill="#ef4444" className="text-[10px] font-black uppercase tracking-wider font-mono">HUMERAL HEAD TARGET</text>
                          <text x="215" y="127" fill="#e4e4e7" className="text-[8px] font-mono font-bold">Greater Tubercle Center</text>
                          <text x="215" y="139" fill="#9ca3af" className="text-[7.5px] font-mono leading-normal">
                            • Arm must be internally rotated (hand on abdomen).</text>
                          <text x="215" y="149" fill="#9ca3af" className="text-[7.5px] font-mono">• Exposes greater tubercle & shifts biceps tendon medially.</text>
                          <text x="215" y="159" fill="#9ca3af" className="text-[7.5px] font-mono">• Angle: 45° to anterior/medial plane.</text>
                          <text x="215" y="169" fill="#9ca3af" className="text-[7.5px] font-mono" opacity="0">
                          </text>

                          <text x="188" y="106" fill="#a1a1aa" className="text-[7px] font-mono">Greater Tubercle</text>
                        </svg>
                      )}

                      {selectedIoSite === 'distal_femur' && (
                        <svg viewBox="0 0 400 250" className="w-full h-full max-h-[220px]">
                          <defs>
                            <linearGradient id="femurGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#2d2d30" />
                              <stop offset="50%" stopColor="#4e4e54" />
                              <stop offset="100%" stopColor="#1e1e20" />
                            </linearGradient>
                          </defs>

                          {/* Thigh & Knee outline - pediatric contours */}
                          <path d="M 110,40 C 130,55 125,95 145,115 C 150,120 180,123 185,133" fill="none" stroke="#4b5563" strokeWidth="2" strokeDasharray="3,3" opacity="0.6" />
                          <path d="M 190,40 C 205,65 210,105 212,125 Q 215,145 212,230" fill="none" stroke="#4b5563" strokeWidth="2" strokeDasharray="3,3" opacity="0.6" />

                          {/* Femur bone with distinct flared condyles (Anatomically correct) */}
                          <path d="M 148,20 L 148,80 C 148,92 134,100 134,112 C 134,122 144,126 155,126 C 166,126 176,122 176,112 C 176,100 162,92 162,80 L 162,20 Z" fill="url(#femurGrad)" stroke="#e4e4e7" strokeWidth="1.5" />
                          <text x="148" y="45" fill="#e4e4e7" className="text-[8px] font-bold font-mono">FEMUR</text>

                          {/* Epiphyseal Plate (growth plate cartilage line) - Warning */}
                          <line x1="136" y1="96" x2="174" y2="96" stroke="#fbbf24" strokeWidth="3" strokeDasharray="3,1" />
                          <text x="120" y="99" textAnchor="end" fill="#fbbf24" className="text-[8px] font-black font-mono">EPIPHYSEAL PLATE (AVOID)</text>
                          <line x1="124" y1="96" x2="135" y2="96" stroke="#fbbf24" strokeWidth="0.5" />

                          {/* Patella (Kneecap) sitting below the femur condyles */}
                          <path d="M 146,140 C 142,140 140,145 142,152 C 144,158 151,160 154,160 C 157,160 164,158 166,152 C 168,145 166,140 162,140 Z" fill="url(#patellaGrad)" stroke="#71717a" strokeWidth="1" />
                          <text x="110" y="148" textAnchor="end" fill="#71717a" className="text-[8px] font-mono">Patella (Kneecap)</text>
                          <line x1="114" y1="146" x2="141" y2="146" stroke="#71717a" strokeWidth="0.5" />

                          {/* TARGET IO PLACEMENT BULLEYE - Distal Femur (Midline, 1-2 cm proximal to patellar superior border) */}
                          <g className="animate-pulse">
                            <circle cx="155" cy="74" r="14" fill="none" stroke="#34d399" strokeWidth="1.5" strokeDasharray="2,2" />
                            <circle cx="155" cy="74" r="8" fill="none" stroke="#34d399" strokeWidth="2" />
                            <circle cx="155" cy="74" r="2.5" fill="#34d399" />
                          </g>

                          {/* Measurement indicator line */}
                          <line x1="155" y1="140" x2="155" y2="74" stroke="#34d399" strokeWidth="1" strokeDasharray="2,2" />
                          <line x1="150" y1="140" x2="160" y2="140" stroke="#34d399" strokeWidth="1" />
                          <line x1="150" y1="74" x2="160" y2="74" stroke="#34d399" strokeWidth="1" />
                          
                          {/* Annotations & details */}
                          <text x="215" y="70" fill="#34d399" className="text-[10px] font-black uppercase tracking-wider font-mono">PEDIATRIC FEMORAL TARGET</text>
                          <text x="215" y="82" fill="#e4e4e7" className="text-[8px] font-mono font-bold">1-2 cm Proximal to Patella</text>
                          <text x="215" y="94" fill="#9ca3af" className="text-[7.5px] font-mono leading-normal">
                            • Centered in the anterior midline of the femur shaft.</text>
                          <text x="215" y="104" fill="#9ca3af" className="text-[7.5px] font-mono">• Clear of the distal growth plate.</text>
                          <text x="215" y="114" fill="#9ca3af" className="text-[7.5px] font-mono">• Direct 90° angle to anterior bone surface.</text>
                          <text x="215" y="124" fill="#9ca3af" className="text-[7.5px] font-mono" opacity="0">
                          </text>
                        </svg>
                      )}

                      {selectedIoSite === 'distal_tibia' && (
                        <svg viewBox="0 0 400 250" className="w-full h-full max-h-[220px]">
                          <defs>
                            <linearGradient id="tibiaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#2d2d30" />
                              <stop offset="50%" stopColor="#4e4e54" />
                              <stop offset="100%" stopColor="#1e1e20" />
                            </linearGradient>
                          </defs>

                          {/* Ankle profile contours */}
                          <path d="M 130,30 L 130,165 C 130,185 105,210 80,215 L 80,230 L 220,230" fill="none" stroke="#4b5563" strokeWidth="2" strokeDasharray="3,3" opacity="0.6" />
                          <path d="M 180,30 L 180,165 C 180,190 200,210 215,215" fill="none" stroke="#4b5563" strokeWidth="2" strokeDasharray="3,3" opacity="0.6" />
                          
                          {/* Distal Tibia Bone - Anatomically correct, including medial malleolus flare */}
                          <path d="M 138,20 L 164,20 L 164,160 C 164,180 178,185 178,200 L 130,200 C 130,186 138,172 138,160 Z" fill="url(#tibiaGrad)" stroke="#e4e4e7" strokeWidth="1.5" />
                          <text x="144" y="60" fill="#e4e4e7" className="text-[8px] font-bold font-mono">TIBIA</text>

                          {/* Medial Malleolus Peak highlight */}
                          <circle cx="130" cy="196" r="3.5" fill="#f43f5e" />
                          <text x="110" y="206" textAnchor="end" fill="#f43f5e" className="text-[8px] font-mono font-bold">Medial Malleolus</text>
                           <text x="110" y="215" textAnchor="end" fill="#f43f5e" className="text-[8px] font-mono font-bold">(Inner Ankle Bone)</text>
                          <line x1="115" y1="210" x2="128" y2="197" stroke="#f43f5e" strokeWidth="0.5" />

                          {/* Fibula Bone shaft on lateral side */}
                          <path d="M 172,20 L 182,20 L 182,170 C 182,185 190,195 190,206 L 180,206 L 172,170 Z" fill="url(#tibiaGrad)" stroke="#52525b" strokeWidth="1.2" opacity="0.7" />
                          <text x="180" y="60" fill="#71717a" className="text-[7px] font-bold font-mono">FIBULA</text>

                          {/* Talus & Tarsal joint bones */}
                          <path d="M 130,204 C 130,202 154,200 178,204 C 182,208 180,224 154,224 C 130,224 126,212 130,204 Z" fill="#1e1e20" stroke="#71717a" strokeWidth="1" />
                          <text x="142" y="218" fill="#52525b" className="text-[7px] font-mono">TALUS</text>

                          {/* TARGET IO PLACEMENT BULLEYE - Distal Tibia (2-3 cm proximal to medial malleolus flat surface) */}
                          <g className="animate-pulse">
                            <circle cx="151" cy="142" r="14" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2,2" />
                            <circle cx="151" cy="142" r="8" fill="none" stroke="#ef4444" strokeWidth="2" />
                            <circle cx="151" cy="142" r="2.5" fill="#ef4444" />
                          </g>

                          {/* Measurement dimension lines (2-3 cm proximal) */}
                          <line x1="130" y1="196" x2="130" y2="142" stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" />
                          <line x1="130" y1="142" x2="151" y2="142" stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" />
                          <circle cx="130" cy="196" r="1.5" fill="#ef4444" />
                          <circle cx="151" cy="142" r="1.5" fill="#ef4444" />

                          {/* Annotations */}
                          <text x="215" y="140" fill="#ef4444" className="text-[10px] font-black uppercase tracking-wider font-mono">DISTAL TIBIA TARGET</text>
                          <text x="215" y="152" fill="#e4e4e7" className="text-[8px] font-mono font-bold">2-3 cm Proximal to Inner Ankle</text>
                          <text x="215" y="164" fill="#9ca3af" className="text-[7.5px] font-mono leading-normal">
                            • Located on the flat anteromedial aspect of the tibia.</text>
                          <text x="215" y="174" fill="#9ca3af" className="text-[7.5px] font-mono">• Easily palpated shin bone just above inner ankle bump.</text>
                          <text x="215" y="184" fill="#9ca3af" className="text-[7.5px] font-mono">• Avoid lateral tendons and great saphenous vein.</text>
                          <text x="215" y="194" fill="#9ca3af" className="text-[7.5px] font-mono" opacity="0">
                          </text>
                        </svg>
                      )}

                    </div>

                    {/* Technical stats overlay footer */}
                    <div className="flex justify-between items-center text-zinc-500 font-mono text-[9px] pt-2 border-t border-zinc-900 z-10">
                      <span>ANGLE: 90° CORONAL PLANE</span>
                      <span>SYSTEM: POWER DRILL (EZ-IO)</span>
                      <span>FORCE: GENTLE STEADY PRESS</span>
                    </div>
                  </div>
                </div>

                {/* Needle Sizing Guide Tool */}
                <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
                  <h4 className="text-[10px] font-mono font-black uppercase tracking-wider text-zinc-400">EZ-IO Needle Sizing Reference</h4>
                  <div className="grid md:grid-cols-3 gap-3">
                    {/* Pink Needle */}
                    <div className="border border-zinc-150 dark:border-white/5 p-3 rounded-xl flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-pink-500 shrink-0 border border-white/20 flex items-center justify-center text-[10px] text-white font-black">15</span>
                      <div>
                        <span className="block text-[11px] font-black uppercase text-zinc-800 dark:text-zinc-200">Pink (15mm / 15G)</span>
                        <span className="block text-[9px] font-mono text-zinc-400 mt-0.5">3 kg - 39 kg Patients</span>
                        <p className="text-[10px] text-zinc-500 dark:text-white/40 mt-1.5 leading-relaxed">Standard pediatric needle. Ideal for minimal subcutaneous fat or superficial tissues.</p>
                      </div>
                    </div>
                    {/* Blue Needle */}
                    <div className="border border-zinc-150 dark:border-white/5 p-3 rounded-xl flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-500 shrink-0 border border-white/20 flex items-center justify-center text-[10px] text-white font-black">25</span>
                      <div>
                        <span className="block text-[11px] font-black uppercase text-zinc-800 dark:text-zinc-200">Blue (25mm / 15G)</span>
                        <span className="block text-[9px] font-mono text-zinc-400 mt-0.5">≥ 40 kg Patients</span>
                        <p className="text-[10px] text-zinc-500 dark:text-white/40 mt-1.5 leading-relaxed">Standard adult needle for proximal tibia, distal tibia, or lean tissues.</p>
                      </div>
                    </div>
                    {/* Yellow Needle */}
                    <div className="border border-zinc-150 dark:border-white/5 p-3 rounded-xl flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-yellow-500 shrink-0 border border-white/20 flex items-center justify-center text-[10px] text-black font-black">45</span>
                      <div>
                        <span className="block text-[11px] font-black uppercase text-zinc-800 dark:text-zinc-200">Yellow (45mm / 15G)</span>
                        <span className="block text-[9px] font-mono text-zinc-400 mt-0.5">Humeral Head / Large Adults</span>
                        <p className="text-[10px] text-zinc-500 dark:text-white/40 mt-1.5 leading-relaxed">Required for humeral sites or patients with thick subcutaneous tissue/edema.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Site Criteria and Landmark Instructions (Spans 5/12) */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Site Landmark Instructions Box */}
                <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
                  {(() => {
                    if (selectedIoSite === 'proximal_tibia') {
                      return (
                        <>
                          <div className="border-b border-zinc-150 dark:border-white/5 pb-3">
                            <span className="text-[9px] font-mono font-black uppercase tracking-wider text-red-600 dark:text-emerald-400">LANDMARK CRITERIA</span>
                            <h3 className="text-lg font-black uppercase tracking-tight text-zinc-950 dark:text-white">Proximal Tibia Landmark</h3>
                          </div>

                          <div className="space-y-4 text-xs">
                            <div className="space-y-2">
                              <span className="font-bold text-zinc-800 dark:text-zinc-200 block uppercase text-[10px]">How to Locate (Palpation):</span>
                              <ol className="list-decimal list-inside space-y-2 text-zinc-600 dark:text-white/70 leading-relaxed font-medium">
                                <li>Palpate the patella (kneecap) and slide your finger distally along the patellar tendon.</li>
                                <li>Identify the <strong>tibial tuberosity</strong> (the bony protrusion at the top of the tibia).</li>
                                <li>
                                  {ioPatientType === 'adult' ? (
                                    <span>Move <strong>2 cm medial</strong> (inward) along the flat bone of the tibial plateau. This is the flat bone of the shin.</span>
                                  ) : (
                                    <span className="text-emerald-600 dark:text-emerald-400">Move <strong>1 to 2 cm distal</strong> (downward) and slightly medial. Crucial to avoid the growth plate (epiphyseal plate).</span>
                                  )}
                                </li>
                              </ol>
                            </div>

                            <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-800 dark:text-amber-400 text-[11px] leading-relaxed">
                              <span className="font-bold uppercase tracking-wider block text-[9px] mb-0.5">Growth Plate Warning:</span>
                              Pediatric proximal tibia requires extreme care. Do not drill directly in or above the tuberosity. Ensure you are distal to the plate to avoid growth arrest.
                            </div>
                          </div>
                        </>
                      );
                    } else if (selectedIoSite === 'proximal_humerus') {
                      return (
                        <>
                          <div className="border-b border-zinc-150 dark:border-white/5 pb-3">
                            <span className="text-[9px] font-mono font-black uppercase tracking-wider text-red-600 dark:text-emerald-400">LANDMARK CRITERIA</span>
                            <h3 className="text-lg font-black uppercase tracking-tight text-zinc-950 dark:text-white">Proximal Humerus Landmark</h3>
                          </div>

                          <div className="space-y-4 text-xs">
                            <div className="space-y-2">
                              <span className="font-bold text-zinc-800 dark:text-zinc-200 block uppercase text-[10px]">How to Locate (Palpation):</span>
                              <ol className="list-decimal list-inside space-y-2 text-zinc-600 dark:text-white/70 leading-relaxed font-medium">
                                <li>Place the patient's arm adducted and <strong>internally rotated</strong> (put their hand over their abdomen). This exposes the tubercle and moves the biceps tendon out of the path.</li>
                                <li>Palpate the humeral shaft and slide superiorly to locate the humeral head.</li>
                                <li>Palpate the <strong>greater tubercle</strong> prominence at the high peak of the shoulder.</li>
                                <li>The target is the center of the greater tubercle, approximately 1-2 cm below the acromion border.</li>
                              </ol>
                            </div>

                            <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-800 dark:text-red-400 text-[11px] leading-relaxed">
                              <span className="font-bold uppercase tracking-wider block text-[9px] mb-0.5">Anatomical Hazard:</span>
                              Humeral head IOs provide close proximity to central circulation (flow rate up to 5L/hr), but misplacement can sever the biceps tendon or damage the axillary nerve if arm is not internally rotated!
                            </div>
                          </div>
                        </>
                      );
                    } else if (selectedIoSite === 'distal_femur') {
                      return (
                        <>
                          <div className="border-b border-zinc-150 dark:border-white/5 pb-3">
                            <span className="text-[9px] font-mono font-black uppercase tracking-wider text-red-600 dark:text-emerald-400">LANDMARK CRITERIA</span>
                            <h3 className="text-lg font-black uppercase tracking-tight text-zinc-950 dark:text-white">Distal Femur Landmark (Pediatric Only)</h3>
                          </div>

                          <div className="space-y-4 text-xs">
                            <div className="space-y-2">
                              <span className="font-bold text-zinc-800 dark:text-zinc-200 block uppercase text-[10px]">How to Locate (Palpation):</span>
                              <ol className="list-decimal list-inside space-y-2 text-zinc-600 dark:text-white/70 leading-relaxed font-medium">
                                <li>Extend the child's knee fully.</li>
                                <li>Palpate the superior border of the <strong>patella</strong> (kneecap).</li>
                                <li>Measure approximately <strong>1 to 2 cm proximal</strong> (above) the patella on the anterior midline of the thigh.</li>
                                <li>Target the flat anterior surface of the distal femur. Avoid the soft lateral tissues.</li>
                              </ol>
                            </div>

                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-800 dark:text-emerald-400 text-[11px] leading-relaxed">
                              <span className="font-bold uppercase tracking-wider block text-[9px] mb-0.5">Clinical Advantage:</span>
                              The distal femur is a preferred pediatric site because it features a thick cortical bone and is highly distant from ongoing airway management and chest compressions during resuscitation.
                            </div>
                          </div>
                        </>
                      );
                    } else {
                      return (
                        <>
                          <div className="border-b border-zinc-150 dark:border-white/5 pb-3">
                            <span className="text-[9px] font-mono font-black uppercase tracking-wider text-red-600 dark:text-emerald-400">LANDMARK CRITERIA</span>
                            <h3 className="text-lg font-black uppercase tracking-tight text-zinc-950 dark:text-white">Distal Tibia Landmark</h3>
                          </div>

                          <div className="space-y-4 text-xs">
                            <div className="space-y-2">
                              <span className="font-bold text-zinc-800 dark:text-zinc-200 block uppercase text-[10px]">How to Locate (Palpation):</span>
                              <ol className="list-decimal list-inside space-y-2 text-zinc-600 dark:text-white/70 leading-relaxed font-medium">
                                <li>Identify the <strong>medial malleolus</strong> (the prominent inner ankle bone protrusion).</li>
                                <li>Measure approximately <strong>2 to 3 cm proximal</strong> (above) to the medial malleolus.</li>
                                <li>Palpate the flat anterior-medial surface of the tibia bone. This is the flat "shin bone" just above the ankle.</li>
                              </ol>
                            </div>

                            <div className="p-3 bg-zinc-50 border border-zinc-200 dark:bg-white/5 dark:border-white/5 rounded-xl text-zinc-700 dark:text-white/70 text-[11px] leading-relaxed">
                              <span className="font-bold uppercase tracking-wider block text-[9px] mb-0.5">Alternative Site Role:</span>
                              The distal tibia is an exceptional alternative site when upper extremities or knees are fractured, compromised, or covered with orthotics or surgical dressings.
                            </div>
                          </div>
                        </>
                      );
                    }
                  })()}
                </div>

                {/* Patient Safety Contraindications Box */}
                <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-red-600">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider">Absolute Contraindications</span>
                  </div>
                  <ul className="text-[11px] leading-relaxed font-medium text-zinc-600 dark:text-white/70 list-disc list-inside space-y-1.5">
                    <li><strong>Fracture</strong> of the target bone (fluid will leak into soft tissue).</li>
                    <li><strong>Previous IO attempt</strong> or placement in the same bone within 48 hours.</li>
                    <li><strong>Prosthesis or surgical hardware</strong> directly under the insertion target.</li>
                    <li><strong>Severe infection or burn</strong> at the target site (infection hazard).</li>
                    <li><strong>Inability to locate landmarks</strong> (due to severe edema or trauma).</li>
                  </ul>
                </div>

              </div>
            </div>

            {/* Procedural Step-By-Step Guidelines Section (Full Width) */}
            <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-zinc-150 dark:border-white/5 pb-3">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-zinc-400">CLINICAL ALGORITHM</span>
                <h3 className="text-lg font-black uppercase tracking-tight text-zinc-950 dark:text-white mt-1">EZ-IO Insertion Step-By-Step Procedure</h3>
              </div>

              {/* Procedural Timeline */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    step: "1",
                    title: "Prepare & Mark Site",
                    desc: "Locate landmarks using physical palpation. Clean the target site thoroughly with Chlorhexidine (friction rub). Let dry."
                  },
                  {
                    step: "2",
                    title: "Sizing & Assembly",
                    desc: "Assemble EZ-IO driver and needle. Ensure needle cap is removed. Place tip on landmark, verify at least one black line is visible before drilling."
                  },
                  {
                    step: "3",
                    title: "Power Insertion",
                    desc: "Insert at 90° angle to bone. Pierce skin, then activate driver with steady pressure. Stop immediately when a 'give' or loss of resistance is felt."
                  },
                  {
                    step: "4",
                    title: "Stabilize & Infuse",
                    desc: "Remove stylet. Aspirate marrow to confirm. Slow push Lidocaine 2% (if conscious), then flush with saline (Adult: 10ml, Ped: 5ml) to open marrow channels."
                  }
                ].map((item) => (
                  <div key={item.step} className="p-4 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-150 dark:border-white/5 relative overflow-hidden flex flex-col justify-between">
                    <span className="absolute -top-3 -right-3 text-6xl font-black text-zinc-200/50 dark:text-white/5 font-mono select-none">
                      {item.step}
                    </span>
                    <div className="space-y-1.5 z-10">
                      <span className="text-[9px] font-mono font-black text-red-600 dark:text-emerald-400 block">STEP 0{item.step}</span>
                      <h4 className="font-black text-xs uppercase tracking-tight text-zinc-900 dark:text-white">{item.title}</h4>
                      <p className="text-[10.5px] text-zinc-500 dark:text-white/60 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Self-Assessment Mini-Quiz (High-Yield Clinical Scenario questions) */}
            <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-zinc-150 dark:border-white/5 pb-3">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-zinc-400">KNOWLEDGE VERIFICATION</span>
                <h3 className="text-lg font-black uppercase tracking-tight text-zinc-950 dark:text-white mt-1">High-Yield IO Clinical Questions</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    id: 1,
                    question: "Which needle is the clinical standard of care for a humeral head IO placement in a conscious adult?",
                    options: [
                      { key: "a", text: "Pink 15 mm (Pediatric Size)", correct: false },
                      { key: "b", text: "Blue 25 mm (Adult Standard)", correct: false },
                      { key: "c", text: "Yellow 45 mm (Extended Size)", correct: true }
                    ],
                    rationale: "Humeral insertion requires the Yellow 45mm needle in almost all adults to successfully clear the deltoid muscle pad and fat layer, allowing proper seating of the needle hub."
                  },
                  {
                    id: 2,
                    question: "Where is the correct pediatric proximal tibia IO insertion site to avoid epiphyseal plates?",
                    options: [
                      { key: "a", text: "Directly into the center of the tibial tuberosity bone bump", correct: false },
                      { key: "b", text: "1-2 cm distal (downward) to the tibial tuberosity, and slightly medial", correct: true },
                      { key: "c", text: "3 cm proximal to the lateral malleolus", correct: false }
                    ],
                    rationale: "In pediatric patients, the proximal tibia target must be 1-2 cm distal and slightly medial to the tibial tuberosity to safely bypass the active epiphyseal growth plate."
                  },
                  {
                    id: 3,
                    question: "What is the recommended medication protocol before performing a saline flush in a conscious patient?",
                    options: [
                      { key: "a", text: "No medicine is needed, push saline as fast as possible", correct: false },
                      { key: "b", text: "Slowly instill 2% preservative-free Lidocaine (Adult: 40mg, Ped: 0.5mg/kg)", correct: true },
                      { key: "c", text: "Flush with cold Sterile Water", correct: false }
                    ],
                    rationale: "Instilling 2% Lidocaine slowly before flushing is critical in conscious patients, as fluid infusion in the marrow cavity expands pressure-sensitive pain receptors, causing severe pain."
                  },
                  {
                    id: 4,
                    question: "Which of the following constitutes an absolute contraindication for IO placement in a target limb?",
                    options: [
                      { key: "a", text: "Patient is in cardiac arrest or deep shock", correct: false },
                      { key: "b", text: "Fracture of the target bone or previous IO insertion within 48 hours", correct: true },
                      { key: "c", text: "The patient is conscious and responsive", correct: false }
                    ],
                    rationale: "A fractured bone or previous IO attempt within 48h are absolute contraindications because fluid and drugs will leak through the fracture/puncture site into surrounding tissues (extravasation), leading to compartment syndrome."
                  }
                ].map((q) => {
                  const hasAnswered = !!ioQuizAnswers[q.id];
                  const chosenKey = ioQuizAnswers[q.id];
                  const correctOption = q.options.find(o => o.correct);
                  const isRevealed = ioQuizRevealed[q.id];

                  return (
                    <div key={q.id} className="p-4 border border-zinc-150 dark:border-white/5 rounded-xl space-y-4">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono font-black text-red-600 dark:text-emerald-400 uppercase tracking-widest block">Question 0{q.id}</span>
                        <h4 className="font-bold text-xs text-zinc-900 dark:text-white leading-relaxed">{q.question}</h4>
                      </div>

                      <div className="space-y-2">
                        {q.options.map((opt) => {
                          const isSelected = chosenKey === opt.key;
                          const isCorrect = opt.correct;
                          return (
                            <button
                              key={opt.key}
                              disabled={hasAnswered}
                              onClick={() => {
                                setIoQuizAnswers(prev => ({ ...prev, [q.id]: opt.key }));
                                setIoQuizRevealed(prev => ({ ...prev, [q.id]: true }));
                              }}
                              className={cn(
                                "w-full text-left p-3 border rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-between transition-all",
                                !hasAnswered
                                  ? "bg-zinc-50 border-zinc-150 hover:border-red-600/30 text-zinc-700 dark:bg-white/[0.01] dark:border-white/5 dark:text-white/80"
                                  : isSelected && isCorrect
                                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                                  : isSelected && !isCorrect
                                  ? "bg-red-500/10 border-red-500 text-red-600 dark:text-red-400"
                                  : isCorrect
                                  ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                                  : "opacity-45 text-zinc-400 dark:text-white/20 border-zinc-100 dark:border-white/[0.01]"
                              )}
                            >
                              <span>{opt.text}</span>
                              {hasAnswered && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />}
                              {hasAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-500 shrink-0 ml-2" />}
                            </button>
                          );
                        })}
                      </div>

                      {isRevealed && (
                        <div className="p-3 bg-zinc-50 dark:bg-white/5 border border-zinc-150 dark:border-white/5 rounded-xl text-[10.5px] leading-relaxed font-medium animate-fade-in text-zinc-600 dark:text-white/70">
                          <span className="font-black text-red-600 dark:text-emerald-400 block uppercase text-[8.5px] mb-0.5">Clinical Rationale:</span>
                          {q.rationale}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
