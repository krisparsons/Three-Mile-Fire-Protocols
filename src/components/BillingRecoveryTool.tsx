import React, { useState, useMemo } from 'react';
import { ArrowLeft, FileText, Send, Plus, Trash2, Info, ChevronRight, ChevronLeft, DollarSign, MapPin, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface BillingRecoveryToolProps {
  onBack: () => void;
}

type Step = 'instructions' | 'details' | 'costs' | 'narrative';

interface CostItem {
  id: string;
  category: string;
  description: string;
  rate: number;
  qty: number;
  hours: number;
}

export default function BillingRecoveryTool({ onBack }: BillingRecoveryToolProps) {
  const [step, setStep] = useState<Step>('instructions');
  
  // Incident Details
  const [incidentData, setIncidentData] = useState({
    name: '',
    type: '',
    address: '',
    dateTime: '',
    responsibleName: '',
    carrier: '',
    mailingAddress: '',
    contactInfo: ''
  });

  // Cost Recovery Items
  const [items, setItems] = useState<CostItem[]>([
    { id: 'p1', category: 'Personnel (L1)', description: 'Line FF / EMT', rate: 18.83, qty: 0, hours: 1 },
    { id: 'p2', category: 'Personnel (L2)', description: 'Officer / Lead Medical', rate: 21.88, qty: 0, hours: 1 },
    { id: 'e1', category: 'Engine', description: 'Type 1 Apparatus', rate: 85.00, qty: 0, hours: 1 },
    { id: 'b1', category: 'Brush Truck', description: 'Type 6 Apparatus', rate: 45.00, qty: 0, hours: 1 },
    { id: 'w1', category: 'Water Tender', description: 'Apparatus', rate: 42.00, qty: 0, hours: 1 },
    { id: 's1', category: 'Subsistence', description: 'Meals / Per Diem', rate: 44.10, qty: 0, hours: 1 },
  ]);

  const [narrative, setNarrative] = useState('');
  const [signature, setSignature] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const totalClaim = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.rate * item.qty * item.hours), 0);
  }, [items]);

  const totalHours = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.qty > 0 ? (item.qty * item.hours) : 0), 0);
  }, [items]);

  const handleUpdateQty = (id: string, qty: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextQty = Math.max(0, qty);
        // If they select an item, ensure it has at least 1 hour by default if current is 0
        const nextHours = (item.hours === 0 && nextQty > 0) ? 1 : item.hours;
        return { ...item, qty: nextQty, hours: nextHours };
      }
      return item;
    }));
  };

  const handleUpdateHours = (id: string, hours: number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, hours: Math.max(0, hours) } : item));
  };

  const handleSendEmail = () => {
    const recipient = 'emsthreemilefiredepartment@gmail.com';
    const subject = `Billing Submission: ${incidentData.name || 'New Incident'}`;
    
    let body = `INCIDENT BILLING & COST RECOVERY REPORT\n`;
    body += `========================================\n\n`;
    
    body += `INCIDENT DETAILS\n`;
    body += `----------------\n`;
    body += `Incident Name/Number: ${incidentData.name}\n`;
    body += `Incident Type/GPS: ${incidentData.type}\n`;
    body += `Address: ${incidentData.address}\n`;
    body += `Date/Time Range: ${incidentData.dateTime}\n\n`;
    
    body += `RESPONSIBLE PARTY\n`;
    body += `-----------------\n`;
    body += `Insured Name: ${incidentData.responsibleName}\n`;
    body += `Carrier/Claim #: ${incidentData.carrier}\n`;
    body += `Mailing Address: ${incidentData.mailingAddress}\n`;
    body += `Contact Info: ${incidentData.contactInfo}\n\n`;
    
    body += `ITEMIZED COST RECOVERY\n`;
    body += `----------------------\n`;
    items.filter(i => i.qty > 0).forEach(item => {
      const total = (item.rate * item.qty * item.hours).toFixed(2);
      body += `${item.category} (${item.description}): Qty: ${item.qty} x $${item.rate.toFixed(2)}/hr x ${item.hours} hrs = $${total}\n`;
    });
    body += `\nTOTAL TIME LOGGED: ${totalHours.toFixed(1)} hrs\n`;
    body += `TOTAL CLAIM: $${totalClaim.toFixed(2)}\n\n`;
    
    body += `INCIDENT NARRATIVE\n`;
    body += `------------------\n`;
    body += `${narrative}\n\n`;
    
    body += `Reported By: ${signature}\n`;
    body += `Date: ${date}\n`;

    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto p-4 pb-20"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Tools</span>
        </button>
        <div className="flex items-center gap-2 bg-red-100 dark:bg-red-500/20 px-3 py-1 rounded-full border border-red-200 dark:border-red-500/30">
          <FileText className="w-4 h-4 text-red-600 dark:text-red-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-500">Billing v1.0</span>
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl dark:shadow-2xl relative">
        {/* Progress Bar */}
        <div className="h-1 w-full bg-zinc-100 dark:bg-white/5">
          <motion.div 
            className="h-full bg-red-500"
            initial={{ width: '25%' }}
            animate={{ 
              width: step === 'instructions' ? '25%' : 
                     step === 'details' ? '50%' : 
                     step === 'costs' ? '75%' : '100%' 
            }}
          />
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 'instructions' && (
              <motion.div
                key="instructions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white mb-2">BILLING SUBMISSION</h2>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600 dark:text-red-500">Instructions & Guidelines</p>
                </div>

                <div className="grid gap-6">
                  <section className="bg-zinc-100/50 dark:bg-white/5 rounded-2xl p-5 border border-zinc-300 dark:border-white/10">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-650 dark:text-white/40 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-600 dark:text-red-500" />
                      Submission Address
                    </h3>
                    <div className="text-sm space-y-1">
                      <p className="font-bold text-zinc-900 dark:text-white">Three Mile Fire Department</p>
                      <p className="text-zinc-700 dark:text-white/60">Attn: Billing / EMS Officer</p>
                      <p className="text-zinc-700 dark:text-white/60">1064 Three Mile Creek Rd</p>
                      <p className="text-zinc-700 dark:text-white/60">Stevensville, MT 59870</p>
                    </div>
                  </section>

                  <section className="bg-zinc-100/50 dark:bg-white/5 rounded-2xl p-5 border border-zinc-300 dark:border-white/10">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-650 dark:text-white/40 mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                      Submission By Incident Type
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-500" />
                          Motor Vehicle Accidents (MVA)
                        </p>
                        <p className="text-xs text-zinc-700 dark:text-white/60 ml-3.5 mt-1">Send to the auto insurance carrier of the at-fault driver. <span className="text-red-600 dark:text-red-400 font-bold">Required:</span> Include the MHP or Sheriff case number.</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-600 dark:bg-orange-500" />
                          Wildland Fires
                        </p>
                        <p className="text-xs text-zinc-700 dark:text-white/60 ml-3.5 mt-1">Send to the homeowners insurance of the responsible party or DNRC/USFS. <span className="text-red-600 dark:text-red-400 font-bold">Required:</span> Include GPS coordinates for the point of origin.</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-500" />
                          Structure Fires
                        </p>
                        <p className="text-xs text-zinc-700 dark:text-white/60 ml-3.5 mt-1">Send to the homeowners/property insurance carrier for the location. <span className="text-red-600 dark:text-red-400 font-bold">Required:</span> Include the NFIRS incident number.</p>
                      </div>
                    </div>
                  </section>

                  <section className="bg-red-50/70 dark:bg-red-500/5 rounded-2xl p-5 border border-red-200 dark:border-red-500/10">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-red-700 dark:text-red-500 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Critical Crew Information
                    </h3>
                    <ul className="text-xs space-y-2 text-zinc-800 dark:text-white/80">
                      <li className="flex gap-2">
                        <span className="text-red-600 dark:text-red-505 font-bold">•</span>
                        <span><strong>Time Tracking:</strong> Time must be billed from <strong>Dispatch to Clear</strong>.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-red-600 dark:text-red-505 font-bold">•</span>
                        <span><strong>Personnel Rates:</strong> $18.83/hr for Line FF/EMT; $21.88+/hr for Officers/IC.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-red-600 dark:text-red-505 font-bold">•</span>
                        <span><strong>Narrative Clarity:</strong> Be descriptive (e.g., "Extinguished 1/4 acre grass fire using 200 gallons of water").</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-red-600 dark:text-red-505 font-bold">•</span>
                        <span><strong>Itemized Supplies:</strong> List specific expendables like foam, oil absorbent, or gloves.</span>
                      </li>
                    </ul>
                  </section>
                </div>

                <button 
                  onClick={() => setStep('details')}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 dark:shadow-red-900/40 transition-all active:scale-[0.98]"
                >
                  START BILLING FORM
                  <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-650 dark:text-white/40 mb-4 px-1">Incident Details</h3>
                  <div className="grid gap-3">
                    <input 
                      type="text" placeholder="Incident Name / Number"
                      value={incidentData.name} onChange={e => setIncidentData({...incidentData, name: e.target.value})}
                      className="w-full bg-zinc-100/50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-white/30 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10"
                    />
                    <input 
                      type="text" placeholder="Incident Type / GPS"
                      value={incidentData.type} onChange={e => setIncidentData({...incidentData, type: e.target.value})}
                      className="w-full bg-zinc-100/50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-white/30 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10"
                    />
                    <input 
                      type="text" placeholder="Address"
                      value={incidentData.address} onChange={e => setIncidentData({...incidentData, address: e.target.value})}
                      className="w-full bg-zinc-100/50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-white/30 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10"
                    />
                    <input 
                      type="text" placeholder="Date / Time Range (e.g. 05/17 08:00 - 12:30)"
                      value={incidentData.dateTime} onChange={e => setIncidentData({...incidentData, dateTime: e.target.value})}
                      className="w-full bg-zinc-100/50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-white/30 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-650 dark:text-white/40 mb-4 px-1">Responsible Party</h3>
                  <div className="grid gap-3">
                    <input 
                      type="text" placeholder="Insured / Responsible Name"
                      value={incidentData.responsibleName} onChange={e => setIncidentData({...incidentData, responsibleName: e.target.value})}
                      className="w-full bg-zinc-100/50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-white/30 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10"
                    />
                    <input 
                      type="text" placeholder="Carrier / Claim #"
                      value={incidentData.carrier} onChange={e => setIncidentData({...incidentData, carrier: e.target.value})}
                      className="w-full bg-zinc-100/50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-white/30 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10"
                    />
                    <input 
                      type="text" placeholder="Mailing Address"
                      value={incidentData.mailingAddress} onChange={e => setIncidentData({...incidentData, mailingAddress: e.target.value})}
                      className="w-full bg-zinc-100/50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-white/30 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10"
                    />
                    <input 
                      type="text" placeholder="Contact Info (Phone/Email)"
                      value={incidentData.contactInfo} onChange={e => setIncidentData({...incidentData, contactInfo: e.target.value})}
                      className="w-full bg-zinc-100/50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-white/30 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setStep('instructions')}
                    className="flex-1 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-900 dark:text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    BACK
                  </button>
                  <button 
                    onClick={() => setStep('costs')}
                    className="flex-[2] bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 transition-all"
                  >
                    NEXT: COST RECOVERY
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'costs' && (
              <motion.div
                key="costs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-650 dark:text-white/40 mb-4 px-1">Itemized Cost Recovery</h3>
                  <div className="space-y-3">
                    {items.map(item => (
                      <div key={item.id} className="bg-zinc-100/50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 rounded-2xl p-4 flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-red-650 dark:text-red-500 uppercase tracking-tighter leading-none mb-1">{item.category}</p>
                            <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{item.description}</p>
                            <p className="text-xs text-zinc-500 dark:text-white/40 mt-0.5">${item.rate.toFixed(2)} / hr</p>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                            {/* Quantity Control */}
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[10px] font-bold text-zinc-400 dark:text-white/30 uppercase tracking-wider">Quantity</span>
                              <div className="flex items-center gap-1 bg-zinc-200/50 dark:bg-white/5 rounded-xl p-1 border border-zinc-300 dark:border-white/10">
                                <button 
                                  onClick={() => handleUpdateQty(item.id, item.qty - 1)}
                                  className="w-7 h-7 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-white/20 text-zinc-900 dark:text-white shadow-sm border border-zinc-300 dark:border-white/5 font-black text-xs"
                                >-</button>
                                <input 
                                  type="number" 
                                  value={item.qty || ''} 
                                  onChange={e => handleUpdateQty(item.id, parseFloat(e.target.value) || 0)}
                                  className="w-10 bg-transparent text-center font-bold text-sm text-zinc-900 dark:text-white focus:outline-none"
                                  placeholder="0"
                                />
                                <button 
                                  onClick={() => handleUpdateQty(item.id, item.qty + 1)}
                                  className="w-7 h-7 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-white/20 text-zinc-900 dark:text-white shadow-sm border border-zinc-300 dark:border-white/5 font-black text-xs"
                                >+</button>
                              </div>
                            </div>

                            {/* Hours Control */}
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[10px] font-bold text-zinc-400 dark:text-white/30 uppercase tracking-wider">Time (hrs)</span>
                              <div className="flex items-center gap-1 bg-zinc-200/50 dark:bg-white/5 rounded-xl p-1 border border-zinc-300 dark:border-white/10">
                                <button 
                                  onClick={() => handleUpdateHours(item.id, item.hours - 0.5)}
                                  className="w-7 h-7 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-white/20 text-zinc-900 dark:text-white shadow-sm border border-zinc-300 dark:border-white/5 font-bold text-[10px]"
                                >-0.5</button>
                                <input 
                                  type="number" 
                                  step="0.5"
                                  value={item.hours || ''} 
                                  onChange={e => handleUpdateHours(item.id, parseFloat(e.target.value) || 0)}
                                  className="w-10 bg-transparent text-center font-bold text-sm text-zinc-900 dark:text-white focus:outline-none"
                                  placeholder="1.0"
                                />
                                <button 
                                  onClick={() => handleUpdateHours(item.id, item.hours + 0.5)}
                                  className="w-7 h-7 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-white/20 text-zinc-900 dark:text-white shadow-sm border border-zinc-300 dark:border-white/5 font-bold text-[10px]"
                                >+0.5</button>
                              </div>
                            </div>

                            {/* Resulting Total column */}
                            <div className="w-20 text-right">
                              <p className="text-[10px] font-bold text-zinc-400 dark:text-white/30 uppercase tracking-wider">Total</p>
                              <p className="text-base font-black text-emerald-600 dark:text-emerald-500 mt-1">${(item.rate * item.qty * item.hours).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Shows formula calculation when qty > 0 */}
                        {item.qty > 0 && (
                          <div className="border-t border-zinc-200 dark:border-white/5 pt-2 flex items-center justify-between text-[11px] text-zinc-500 dark:text-white/40 font-mono">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-zinc-400" />
                              Formula:
                            </span>
                            <span>
                              {item.qty} {item.qty === 1 ? 'unit' : 'units'} × {item.hours.toFixed(1)} hrs × ${item.rate.toFixed(2)}/hr
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-600/60 dark:text-emerald-500/60 leading-none mb-1">Total Claim Estimate</p>
                      <p className="text-3xl font-black text-emerald-600 dark:text-emerald-500 leading-none tracking-tighter">
                        ${totalClaim.toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="w-10 h-10 text-emerald-600/20 dark:text-emerald-500/20" />
                  </div>
                  
                  <div className="border-t border-emerald-200/40 dark:border-emerald-500/10 pt-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/60 dark:text-emerald-500/60 leading-none mb-1">Total Time Involved</p>
                      <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 leading-none">
                        {totalHours.toFixed(1)} hrs
                      </p>
                    </div>
                    <Clock className="w-5 h-5 text-emerald-600/30 dark:text-emerald-500/30" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setStep('details')}
                    className="flex-1 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-900 dark:text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    BACK
                  </button>
                  <button 
                    onClick={() => setStep('narrative')}
                    className="flex-[2] bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 transition-all"
                  >
                    NEXT: NARRATIVE
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'narrative' && (
              <motion.div
                key="narrative"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-650 dark:text-white/40 mb-4 px-1">Incident Narrative</h3>
                  <textarea 
                    rows={8}
                    value={narrative}
                    onChange={e => setNarrative(e.target.value)}
                    placeholder="Be descriptive (e.g., 'Extinguished 1/4 acre grass fire using 200 gallons of water'). Include all itemized supplies like foam, oil absorbent, or gloves..."
                    className="w-full bg-zinc-100/50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 rounded-2xl px-4 py-4 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-650 dark:text-white/40 mb-3 px-1">Authorized Name</h3>
                    <input 
                      type="text"
                      value={signature}
                      onChange={e => setSignature(e.target.value)}
                      placeholder="Type Full Name"
                      className="w-full bg-zinc-100/50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-white/30 focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-650 dark:text-white/40 mb-3 px-1">Date</h3>
                    <input 
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full bg-zinc-100/50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setStep('costs')}
                    className="flex-1 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-900 dark:text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    BACK
                  </button>
                  <button 
                    onClick={handleSendEmail}
                    disabled={!signature}
                    className="flex-[2] bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:grayscale text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 dark:shadow-emerald-900/40 transition-all animate-pulse-subtle"
                  >
                    <Send className="w-5 h-5" />
                    SUBMIT TO BILLING
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

const AlertTriangle = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
);
