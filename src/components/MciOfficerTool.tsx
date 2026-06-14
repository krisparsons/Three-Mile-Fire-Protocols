import React, { useState } from 'react';
import { 
  ClipboardList, Users, AlertCircle, FileText, Plus, Minus, ArrowLeft, 
  CheckCircle2, ShieldAlert, Shield, Stethoscope, MapPin, 
  ChevronDown, ChevronUp, Check, Play 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface SubStep {
  id: string;
  text: string;
  completed: boolean;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  subSteps: SubStep[];
}

type RoleID = 'ic' | 'triage' | 'treatment' | 'transport' | 'staging';

interface RoleData {
  id: RoleID;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  bgDarkColor: string;
  borderColor: string;
  description: string;
}

const ROLES: RoleData[] = [
  { 
    id: 'ic', 
    name: 'Command (IC)', 
    icon: Shield, 
    color: 'text-red-600 dark:text-red-400', 
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    bgDarkColor: 'dark:bg-red-500/10',
    borderColor: 'border-red-200 dark:border-red-500/30',
    description: 'Establishes Command, conducts scene size-up, requests resources, and coordinates major divisions.' 
  },
  { 
    id: 'triage', 
    name: 'Triage', 
    icon: ClipboardList, 
    color: 'text-orange-600 dark:text-orange-400', 
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    bgDarkColor: 'dark:bg-orange-500/10',
    borderColor: 'border-orange-200 dark:border-orange-500/30',
    description: 'Deploys rapid triage teams, categorizes patients using START / JumpSTART, and directs extraction.' 
  },
  { 
    id: 'treatment', 
    name: 'Treatment', 
    icon: Stethoscope, 
    color: 'text-blue-600 dark:text-blue-400', 
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    bgDarkColor: 'dark:bg-blue-400/10',
    borderColor: 'border-blue-200 dark:border-blue-500/30',
    description: 'Chooses the treatment sector point, organizes Red/Yellow/Green canvas holds, and stabilizes patients.' 
  },
  { 
    id: 'transport', 
    name: 'Transport', 
    icon: FileText, 
    color: 'text-emerald-600 dark:text-emerald-400', 
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    bgDarkColor: 'dark:bg-emerald-500/10',
    borderColor: 'border-emerald-200 dark:border-emerald-500/30',
    description: 'Establishes landing/loading zones, coordinates bed capacity with regional hospitals, and logs releases.' 
  },
  { 
    id: 'staging', 
    name: 'Staging', 
    icon: MapPin, 
    color: 'text-purple-600 dark:text-purple-400', 
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    bgDarkColor: 'dark:bg-purple-500/10',
    borderColor: 'border-purple-200 dark:border-purple-500/30',
    description: 'Establishes the off-scene apparatus holding zone, cataloguing units and dispatching them to loading.' 
  }
];

const INITIAL_CHECKLISTS: Record<RoleID, ChecklistItem[]> = {
  ic: [
    {
      id: 'ic-1',
      text: 'Establish Command / Identify as MCI IC',
      completed: false,
      subSteps: [
        { id: 'ic-1-1', text: 'Put on high-visibility Incident Commander (IC) vest.', completed: false },
        { id: 'ic-1-2', text: 'Broadcast over radio: "Dispatch, Command is established at [Location] as [Name] Command".', completed: false },
        { id: 'ic-1-3', text: 'Position Command Post in a safe, visible, uphill and upwind location.', completed: false }
      ]
    },
    {
      id: 'ic-2',
      text: 'Initial Size-up & Scene Safety Check',
      completed: false,
      subSteps: [
        { id: 'ic-2-1', text: 'Confirm zero exposure to chemical/gas hazards, active fire, or downed power lines.', completed: false },
        { id: 'ic-2-2', text: 'Conduct windshield survey of outer boundaries to find total scale.', completed: false },
        { id: 'ic-2-3', text: 'Instruct Law Enforcement to establish perimeter locks and secure traffic roads.', completed: false }
      ]
    },
    {
      id: 'ic-3',
      text: 'Declare MCI & Severity Level',
      completed: false,
      subSteps: [
        { id: 'ic-3-1', text: 'Formulate rapid approximation of victim volume (e.g. 5-10, 11-25) to set Level 1-5.', completed: false },
        { id: 'ic-3-2', text: 'Instruct dispatch to broadcast active MCI declaration and notify regional EDs.', completed: false }
      ]
    },
    {
      id: 'ic-4',
      text: 'Request Additional Resources',
      completed: false,
      subSteps: [
        { id: 'ic-4-1', text: 'Request extra ALS/BLS engines, heavy rescue squads, and regional medical assets.', completed: false },
        { id: 'ic-4-2', text: 'Formally request mutual aid agencies as needed.', completed: false },
        { id: 'ic-4-3', text: 'Establish dedicated tactical operations radio channel through dispatch.', completed: false }
      ]
    },
    {
      id: 'ic-5',
      text: 'Designate Key Sector Officers',
      completed: false,
      subSteps: [
        { id: 'ic-5-1', text: 'Appoint Triage Officer and hand over tracking boards.', completed: false },
        { id: 'ic-5-2', text: 'Appoint Treatment Officer and Staging Officer roles.', completed: false },
        { id: 'ic-5-3', text: 'Appoint Transport Officer to handle hospital Net brokers.', completed: false }
      ]
    },
    {
      id: 'ic-6',
      text: 'Establish Communication Plan',
      completed: false,
      subSteps: [
        { id: 'ic-6-1', text: 'Assign distinct tactical zones (e.g., Command/Ops, Triage/Treatment, Staging, Transport).', completed: false },
        { id: 'ic-6-2', text: 'Instruct all incoming vehicles to stay off Command channels until directly dialed.', completed: false }
      ]
    }
  ],
  triage: [
    {
      id: 'tr-1',
      text: 'Assess Environment & Sector Flow',
      completed: false,
      subSteps: [
        { id: 'tr-1-1', text: 'Identify safe entry and extraction pathways for walking wounded.', completed: false },
        { id: 'tr-1-2', text: 'Confirm zero kinetic, physical structural, or electricity hazards exist for crews.', completed: false }
      ]
    },
    {
      id: 'tr-2',
      text: 'Deploy Triage Teams',
      completed: false,
      subSteps: [
        { id: 'tr-2-1', text: 'Group responders into pairs equipped with triage ribbon rolls and tags.', completed: false },
        { id: 'tr-2-2', text: 'Review adult (START) or pediatric (JumpSTART) parameters with crews on site.', completed: false }
      ]
    },
    {
      id: 'tr-3',
      text: 'Execute Rapid Sorting',
      completed: false,
      subSteps: [
        { id: 'tr-3-1', text: 'Announce clearly: "If you are able to walk, please move to [Designated green zone]".', completed: false },
        { id: 'tr-3-2', text: 'Assess remaining non-ambulatory patients rapidly (<30s each) checking Repiration, Perfusion, and Mental Status (RPM).', completed: false },
        { id: 'tr-3-3', text: 'Affix highly visible neon color tags/straps to limbs (do not leave patient without tag).', completed: false }
      ]
    },
    {
      id: 'tr-4',
      text: 'Formulate and Report Counts',
      completed: false,
      subSteps: [
        { id: 'tr-4-1', text: 'Count and log exact tally counts of Red, Yellow, Green, and Black victims.', completed: false },
        { id: 'tr-4-2', text: 'Radio immediate count summaries to IC Command and the incoming Treatment Officer.', completed: false }
      ]
    },
    {
      id: 'tr-5',
      text: 'Oversee Safe Extraction Pathways',
      completed: false,
      subSteps: [
        { id: 'tr-5-1', text: 'Instruct primary extraction teams to package and slide RED (Immediate) patients first.', completed: false },
        { id: 'tr-5-2', text: 'Ensure deceased (Black) patients are left undisturbed to preserve evidence unless blocked.', completed: false }
      ]
    }
  ],
  treatment: [
    {
      id: 'tx-1',
      text: 'Select Treatment Area Location',
      completed: false,
      subSteps: [
        { id: 'tx-1-1', text: 'Identify dry, flat, spacious terrain outside the direct hazard line.', completed: false },
        { id: 'tx-1-2', text: 'Situate entry near triage pathways, and exit directly leading to the loading loop.', completed: false },
        { id: 'tx-1-3', text: 'Coordinate lay-down of color tarps (Red, Yellow, Green) and flags.', completed: false }
      ]
    },
    {
      id: 'tx-2',
      text: 'Enforce Secondary Intake Triage',
      completed: false,
      subSteps: [
        { id: 'tx-2-1', text: 'Evaluate patients at the entry of the Treatment area (status changes frequently).', completed: false },
        { id: 'tx-2-2', text: 'Reroute incoming patients to their respective color sector tarp.', completed: false }
      ]
    },
    {
      id: 'tx-3',
      text: 'Direct Clinical Stabilization',
      completed: false,
      subSteps: [
        { id: 'tx-3-1', text: 'Assign clinical staff ratios (e.g. Paramedics to Red, ADV-EMT/EMT to Yellow/Green).', completed: false },
        { id: 'tx-3-2', text: 'Focus on immediate stabilization: advanced airways, needle chest decompression, and tourniquets.', completed: false },
        { id: 'tx-3-3', text: 'Request medical supply replenishment from command/staging before depletion.', completed: false }
      ]
    },
    {
      id: 'tx-4',
      text: 'Track Treatment Center Flow',
      completed: false,
      subSteps: [
        { id: 'tx-4-1', text: 'Configure continuous list log of critical patients currently under stabilization treatment.', completed: false },
        { id: 'tx-4-2', text: 'Inform Transport Officer immediately when a critical red patient is stable/ready for ambulance arrival.', completed: false }
      ]
    }
  ],
  transport: [
    {
      id: 'tp-1',
      text: 'Establish Loading Zone Loop',
      completed: false,
      subSteps: [
        { id: 'tp-1-1', text: 'Select a loading point physically adjacent to the Treatment exit.', completed: false },
        { id: 'tp-1-2', text: 'Configure a strict, non-reversing, one-way ingress/egress driving path for apparatus.', completed: false }
      ]
    },
    {
      id: 'tp-2',
      text: 'Secure Multi-Hospital Bed Counts',
      completed: false,
      subSteps: [
        { id: 'tp-2-1', text: 'Direct dispatch or county coordinator to query regional hospital ED bed openings.', completed: false },
        { id: 'tp-2-2', text: 'Log counts: Trauma beds, ICU, Pediatric, and general medical slots.', completed: false }
      ]
    },
    {
      id: 'tp-3',
      text: 'Allocate Patients securely',
      completed: false,
      subSteps: [
        { id: 'tp-3-1', text: 'Match highest-severity patients with top emergency trauma centers.', completed: false },
        { id: 'tp-3-2', text: 'Coordinate patient allocation to multiple local networks (avoid overloading the nearest clinic).', completed: false },
        { id: 'tp-3-3', text: 'Validate wristband tagging parameters and track paperwork before loading.', completed: false }
      ]
    },
    {
      id: 'tp-4',
      text: 'Log and Record Outward Units',
      completed: false,
      subSteps: [
        { id: 'tp-4-1', text: 'Log Transporting unit ID (e.g. Ambulance 412), patient tag number, hospital destination, and departure timestamp.', completed: false },
        { id: 'tp-4-2', text: 'Maintain live log sheets to sync counts with Incident Command on intervals.', completed: false }
      ]
    }
  ],
  staging: [
    {
      id: 'st-1',
      text: 'Establish Staging Area Coordinates',
      completed: false,
      subSteps: [
        { id: 'st-1-1', text: 'Find a spacious off-site location (e.g. public parking, depot) 2-3 minutes away.', completed: false },
        { id: 'st-1-2', text: 'Ensure access allows immediate forward release without turning bottlenecks.', completed: false }
      ]
    },
    {
      id: 'st-2',
      text: 'Catalog Incoming Apparatus',
      completed: false,
      subSteps: [
        { id: 'st-2-1', text: 'Register agency identifier, type of vehicle, and capacity level (ALS vs BLS).', completed: false },
        { id: 'st-2-2', text: 'Command all parked rigs to shut down emergency lights and remain within their cabs.', completed: false }
      ]
    },
    {
      id: 'st-3',
      text: 'Release Units to Loading Loop',
      completed: false,
      subSteps: [
        { id: 'st-3-1', text: 'Direct single-unit transport ambulances to the Loading Zone immediately upon Transport Officer call.', completed: false },
        { id: 'st-3-2', text: 'Send support/manpower crews to the Command post upon direct request.', completed: false }
      ]
    },
    {
      id: 'st-4',
      text: 'Manage Transit Route Clearances',
      completed: false,
      subSteps: [
        { id: 'st-4-1', text: 'Prevent unassigned emergency vehicles from self-dispatching into active lanes.', completed: false },
        { id: 'st-4-2', text: 'Direct secondary arrivals to wait at staging holding lines.', completed: false }
      ]
    }
  ]
};

interface MciOfficerToolProps {
  onBack: () => void;
}

export default function MciOfficerTool({ onBack }: MciOfficerToolProps) {
  const [activeRole, setActiveRole] = useState<RoleID>('ic');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>('ic-1');

  const [tally, setTally] = useState({
    red: 0,
    yellow: 0,
    green: 0,
    black: 0
  });

  const [checklists, setChecklists] = useState<Record<RoleID, ChecklistItem[]>>(INITIAL_CHECKLISTS);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const updateTally = (color: keyof typeof tally, delta: number) => {
    setTally(prev => ({
      ...prev,
      [color]: Math.max(0, prev[color] + delta)
    }));
  };

  const toggleParentTask = (role: RoleID, taskId: string) => {
    setChecklists(prev => {
      const list = prev[role];
      const updatedList = list.map(task => {
        if (task.id !== taskId) return task;
        
        const newCompletedState = !task.completed;
        const updatedSubSteps = task.subSteps.map(sub => ({
          ...sub,
          completed: newCompletedState
        }));
        
        return {
          ...task,
          completed: newCompletedState,
          subSteps: updatedSubSteps
        };
      });
      return {
        ...prev,
        [role]: updatedList
      };
    });
  };

  const toggleSubStep = (role: RoleID, taskId: string, subId: string) => {
    setChecklists(prev => {
      const list = prev[role];
      const updatedList = list.map(task => {
        if (task.id !== taskId) return task;
        
        const updatedSubSteps = task.subSteps.map(sub => 
          sub.id === subId ? { ...sub, completed: !sub.completed } : sub
        );
        
        // Parent is complete if all sub-steps are complete
        const allComplete = updatedSubSteps.every(sub => sub.completed);
        
        return {
          ...task,
          subSteps: updatedSubSteps,
          completed: allComplete
        };
      });
      return {
        ...prev,
        [role]: updatedList
      };
    });
  };

  const totalPatients = tally.red + tally.yellow + tally.green + tally.black;

  const getCompletedCount = (roleId: RoleID) => {
    return checklists[roleId].filter(c => c.completed).length;
  };

  const getTotalCount = (roleId: RoleID) => {
    return checklists[roleId].length;
  };

  const generateReport = () => {
    const activeRoleData = ROLES.find(r => r.id === activeRole);
    const activeChecklist = checklists[activeRole];
    
    const report = `MCI SITUATION REPORT
Timestamp: ${new Date().toLocaleTimeString()}
Current Profile Position: ${activeRoleData?.name ?? 'Incident Command'}
--------------------------------------------------
PATIENT DISTRIBUTION TALLY:
  Immediate (Red):   ${tally.red}
  Delayed (Yellow):  ${tally.yellow}
  Minor (Green):     ${tally.green}
  Deceased (Black):  ${tally.black}
  Total Confirmed:   ${totalPatients}
--------------------------------------------------
OPERATIONAL PROTOCOL CHECKLIST:
${activeChecklist.map(c => {
  const subChecked = c.subSteps.filter(s => s.completed).length;
  const subTotal = c.subSteps.length;
  const status = c.completed ? '[X] COMPLETE' : `[${subChecked}/${subTotal}] IN PROGRESS`;
  
  let text = `${status} - ${c.text}`;
  if (c.subSteps.length > 0) {
    const subs = c.subSteps.map(s => `    - [${s.completed ? 'X' : ' '}] ${s.text}`).join('\n');
    text += `\n${subs}`;
  }
  return text;
}).join('\n\n')}`;

    setGeneratedReport(report);
    setCopySuccess(false);
  };

  const copyToClipboard = async () => {
    if (!generatedReport) return;
    try {
      await navigator.clipboard.writeText(generatedReport);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const activeRoleData = ROLES.find(r => r.id === activeRole)!;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full transition-colors" id="mci-back-btn">
          <ArrowLeft className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">MCI Incident Command</h2>
          <p className="text-[10px] font-mono text-zinc-400 dark:text-white/40 uppercase tracking-widest">Command & Control Dashboard</p>
        </div>
      </div>

      {/* Role Indicator / Selector Selector */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-white/30 block">Select Active MCI Position</span>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {ROLES.map(role => {
            const Icon = role.icon;
            const isSelected = activeRole === role.id;
            const completedCount = getCompletedCount(role.id);
            const totalCount = getTotalCount(role.id);
            const isFinished = completedCount === totalCount;

            return (
              <button
                key={role.id}
                onClick={() => {
                  setActiveRole(role.id);
                  // Auto-open first task of new role
                  const firstTask = checklists[role.id][0];
                  setExpandedTaskId(firstTask ? firstTask.id : null);
                }}
                className={cn(
                  "p-3 rounded-xl border flex flex-col items-center justify-between gap-1.5 transition-all text-center group relative",
                  isSelected 
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-lg" 
                    : "bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-white/70 hover:bg-zinc-50 dark:hover:bg-white/10"
                )}
                id={`role-btn-${role.id}`}
              >
                <div className="flex flex-col items-center gap-1">
                  <Icon className={cn(
                    "w-4 h-4 transition-colors", 
                    isSelected 
                      ? "text-emerald-400 dark:text-emerald-600" 
                      : role.color
                  )} />
                  <span className="text-[10px] font-black uppercase tracking-wider leading-tight">{role.id === 'ic' ? 'Command' : role.name}</span>
                </div>
                
                {/* Progress Indicators */}
                <div className="flex items-center gap-1 mt-1">
                  <span className={cn(
                    "text-[8px] font-mono font-bold px-1.5 py-0.5 rounded",
                    isSelected
                      ? "bg-white/20 text-white dark:bg-zinc-900/10 dark:text-zinc-950"
                      : isFinished 
                        ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" 
                        : "bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-white/40"
                  )}>
                    {completedCount}/{totalCount}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Role Profile Details */}
      <div className={cn(
        "rounded-2xl p-4 border flex items-start gap-3 transition-colors",
        activeRoleData.bgColor,
        activeRoleData.borderColor
      )}>
        <div className={cn("p-2 rounded-xl shrink-0 mt-0.5", activeRoleData.bgDarkColor)}>
          {(() => {
            const Icon = activeRoleData.icon;
            return <Icon className={cn("w-5 h-5", activeRoleData.color)} />;
          })()}
        </div>
        <div className="space-y-1">
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">
            {activeRoleData.name} Guidelines
          </h3>
          <p className="text-xs text-zinc-600 dark:text-white/70 leading-relaxed">
            {activeRoleData.description}
          </p>
        </div>
      </div>

      {/* Main Grid: Tally vs Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Patient Tally Section (6 cols) */}
        <div className="space-y-6 lg:col-span-4 select-none">
          <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white">Patient Tally</h3>
              <span className="ml-auto bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-500 px-2 py-0.5 rounded text-[10px] font-bold">
                TOTAL: {totalPatients}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'red', label: 'IMMEDIATE', color: 'bg-red-500', text: 'text-red-600 dark:text-red-500' },
                { key: 'yellow', label: 'DELAYED', color: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-500' },
                { key: 'green', label: 'MINOR', color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-500' },
                { key: 'black', label: 'DECEASED', color: 'bg-zinc-850 dark:bg-zinc-800', text: 'text-zinc-500 dark:text-zinc-400' }
              ].map(item => (
                <div key={item.key} className="bg-zinc-50/80 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl p-4 flex flex-col items-center gap-3">
                  <span className={cn("text-[10px] font-bold tracking-widest", item.text)}>{item.label}</span>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => updateTally(item.key as any, -1)}
                      className="w-8 h-8 rounded-full bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors text-zinc-650 dark:text-white"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">{tally[item.key as keyof typeof tally]}</span>
                    <button 
                      onClick={() => updateTally(item.key as any, 1)}
                      className="w-8 h-8 rounded-full bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors text-zinc-650 dark:text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className={cn("w-full h-1 rounded-full", item.color)} />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Guidelines */}
          <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-500" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white">Incident Declared Levels</h3>
            </div>
            <div className="space-y-3.5 text-xs text-zinc-650 dark:text-white/60 leading-relaxed">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-white/5">
                <span className="font-bold text-zinc-900 dark:text-white">MCI Level 1</span>
                <span className="font-mono font-bold bg-zinc-100 dark:bg-white/10 px-2 py-0.5 rounded text-[10px]">5-10 Patients</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-white/5">
                <span className="font-bold text-zinc-900 dark:text-white">MCI Level 2</span>
                <span className="font-mono font-bold bg-zinc-100 dark:bg-white/10 px-2 py-0.5 rounded text-[10px]">11-25 Patients</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-white/5">
                <span className="font-bold text-zinc-900 dark:text-white">MCI Level 3</span>
                <span className="font-mono font-bold bg-zinc-100 dark:bg-white/10 px-2 py-0.5 rounded text-[10px]">26-50 Patients</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-white/5">
                <span className="font-bold text-zinc-900 dark:text-white">MCI Level 4</span>
                <span className="font-mono font-bold bg-zinc-100 dark:bg-white/10 px-2 py-0.5 rounded text-[10px]">51-100 Reg.</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-zinc-900 dark:text-white">MCI Level 5</span>
                <span className="font-mono font-bold bg-zinc-100 dark:bg-white/10 px-2 py-0.5 rounded text-[10px]">100+ Disasters</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tailored Checklist Section (8 cols) */}
        <div className="space-y-4 lg:col-span-8">
          <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white">
                  {activeRoleData.name} Operational Checklist
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-zinc-400">
                {getCompletedCount(activeRole)}/{getTotalCount(activeRole)} Complete
              </span>
            </div>

            <div className="space-y-3">
              {checklists[activeRole].map(item => {
                const isExpanded = expandedTaskId === item.id;
                const completedSubs = item.subSteps.filter(s => s.completed).length;
                const totalSubs = item.subSteps.length;

                return (
                  <div 
                    key={item.id}
                    className={cn(
                      "rounded-xl border transition-all overflow-hidden",
                      item.completed 
                        ? "bg-emerald-500/[0.03] dark:bg-emerald-500/[0.02] border-emerald-500/20 dark:border-emerald-500/10" 
                        : "bg-zinc-50/50 dark:bg-white/[0.01] border-zinc-100 dark:border-white/5"
                    )}
                  >
                    {/* Header bar of task */}
                    <div className="flex items-center justify-between p-4 gap-3">
                      <div className="flex items-center gap-3">
                        {/* Main manual checkbox toggle */}
                        <button 
                          onClick={() => toggleParentTask(activeRole, item.id)}
                          className={cn(
                            "flex-shrink-0 w-6 h-6 rounded-md border flex items-center justify-center transition-colors shadow-sm",
                            item.completed 
                              ? "bg-emerald-500 border-emerald-500" 
                              : "bg-white dark:bg-white/5 border-zinc-300 dark:border-white/10 hover:border-zinc-400"
                          )}
                          title="Mark entire section as complete"
                        >
                          {item.completed && <Check className="w-4 h-4 text-white font-bold" />}
                        </button>
                        
                        <button 
                          onClick={() => setExpandedTaskId(isExpanded ? null : item.id)}
                          className="text-left"
                        >
                          <span className={cn(
                            "text-sm font-semibold block transition-colors",
                            item.completed 
                              ? "text-emerald-800 dark:text-emerald-300 font-bold line-through opacity-80" 
                              : "text-zinc-800 dark:text-white font-bold"
                          )}>
                            {item.text}
                          </span>
                          {/* Mini count indicator for sub-steps */}
                          {totalSubs > 0 && (
                            <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-mono text-zinc-400 dark:text-white/30 font-bold">
                              <span>Sub-steps:</span>
                              <span className={cn(
                                "px-1 rounded",
                                completedSubs === totalSubs 
                                  ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" 
                                  : "bg-zinc-150 dark:bg-white/5 text-zinc-500 dark:text-white/40"
                              )}>
                                {completedSubs}/{totalSubs}
                              </span>
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Expand Toggle */}
                      <button 
                        onClick={() => setExpandedTaskId(isExpanded ? null : item.id)}
                        className="p-1.5 hover:bg-zinc-200/50 dark:hover:bg-white/5 text-zinc-400 dark:text-white/20 hover:text-zinc-650 dark:hover:text-white/40 rounded transition-colors shrink-0"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Sub checklist wrapper */}
                    <AnimatePresence initial={false}>
                      {isExpanded && item.subSteps.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-zinc-100 dark:border-white/5 bg-zinc-100/30 dark:bg-black/10"
                        >
                          <div className="p-4 space-y-2.5">
                            <span className="text-[9px] font-mono font-black uppercase tracking-widest text-zinc-400 block mb-1">
                              Action Items List
                            </span>
                            {item.subSteps.map(sub => (
                              <button
                                key={sub.id}
                                onClick={() => toggleSubStep(activeRole, item.id, sub.id)}
                                className={cn(
                                  "w-full flex items-start gap-3 p-2.5 rounded-lg border text-left transition-all",
                                  sub.completed
                                    ? "bg-white/60 dark:bg-zinc-900/40 border-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-medium"
                                    : "bg-white/60 dark:bg-zinc-900/10 border-zinc-200 dark:border-white/5 hover:bg-white text-zinc-700 dark:text-white/70"
                                )}
                              >
                                <div className={cn(
                                  "mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors shadow-sm",
                                  sub.completed
                                    ? "bg-emerald-500 border-emerald-500"
                                    : "bg-white dark:bg-white/5 border-zinc-300 dark:border-white/10"
                                )}>
                                  {sub.completed && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <span className="text-xs">{sub.text}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Report Summary */}
      <div className="space-y-4">
        <button 
          onClick={generateReport}
          className="w-full bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 flex items-center justify-between group hover:bg-zinc-50 dark:hover:bg-white/10 transition-all shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
              <FileText className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-zinc-900 dark:text-white">Generate Position SITREP Report</h3>
              <p className="text-xs text-zinc-400 dark:text-white/40">Synthesizes active tally and check status</p>
            </div>
          </div>
          <Plus className="w-5 h-5 text-zinc-300 dark:text-white/20 group-hover:text-emerald-600 dark:group-hover:text-emerald-500" />
        </button>

        {generatedReport && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-zinc-50 dark:bg-[#1A1B1E] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 overflow-hidden shadow-inner"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-500 flex items-center gap-2">
                <Check className="w-4 h-4" /> Operational SITREP Ready
              </h4>
              <div className="flex items-center gap-2">
                <button 
                  onClick={copyToClipboard}
                  className="px-3 py-1.5 bg-zinc-200 dark:bg-white/5 hover:bg-zinc-300 dark:hover:bg-white/10 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 text-zinc-700 dark:text-white"
                >
                  <ClipboardList className="w-4 h-4" />
                  {copySuccess ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
                </button>
                <button 
                  onClick={() => setGeneratedReport(null)}
                  className="px-3 py-1.5 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-200 dark:hover:bg-red-500/20 rounded-lg text-xs font-bold transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <pre className="text-xs font-mono text-zinc-700 dark:text-white/70 whitespace-pre-wrap bg-white dark:bg-black/30 p-4 rounded-xl border border-zinc-200 dark:border-white/5 shadow-inner">
              {generatedReport}
            </pre>
          </motion.div>
        )}
      </div>
    </div>
  );
}
