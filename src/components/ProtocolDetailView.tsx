import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  Download, 
  ShieldCheck, 
  ChevronRight,
  Flame,
  Stethoscope,
  ShieldAlert,
  Maximize2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Protocol } from '../data/protocols';
import { cn } from '../lib/utils';

interface ProtocolDetailViewProps {
  protocol: Protocol;
  onBack: () => void;
}

export default function ProtocolDetailView({ protocol, onBack }: ProtocolDetailViewProps) {
  const [showPdfView, setShowPdfView] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = `${protocol.title}\nID: ${protocol.id}\nCategory: ${protocol.category} (${protocol.subCategory || ''})\nLast Updated: ${protocol.lastUpdated}\n\n${protocol.content}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to render protocol content inside a single, cohesive document box
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentBulletList: string[] = [];

    const flushBulletList = (key: string) => {
      if (currentBulletList.length > 0) {
        elements.push(
          <ul key={key} className="space-y-2 my-3 pl-2">
            {currentBulletList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-emerald-500 shrink-0 mt-2" />
                <span>{renderInlineFormatting(item)}</span>
              </li>
            ))}
          </ul>
        );
        currentBulletList = [];
      }
    };

    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) {
        flushBulletList(`bullet-flush-${i}`);
        return;
      }

      // Check for bullet point
      if (trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const itemText = trimmed.replace(/^[•\-\*]\s*/, '');
        currentBulletList.push(itemText);
        return;
      }

      // Otherwise flush bullet list
      flushBulletList(`bullet-flush-${i}`);

      // Check for callouts / alerts
      if (/^(MANDATORY|WARNING|CAUTION|CRITICAL|SAFETY REQUIREMENT|NOTE):/i.test(trimmed)) {
        const match = trimmed.match(/^(MANDATORY|WARNING|CAUTION|CRITICAL|SAFETY REQUIREMENT|NOTE):(.*)/i);
        if (match) {
          const type = match[1].toUpperCase();
          const body = match[2].trim();
          const isDanger = type === 'MANDATORY' || type === 'WARNING' || type === 'CRITICAL';
          
          elements.push(
            <div 
              key={`callout-${i}`} 
              className={cn(
                "p-4 my-4 rounded-2xl border-l-4 shadow-sm",
                isDanger 
                  ? "bg-red-50 dark:bg-red-950/40 border-red-600 text-red-950 dark:text-red-100" 
                  : "bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-950 dark:text-blue-100"
              )}
            >
              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider mb-1">
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px]",
                  isDanger ? "bg-red-600 text-white" : "bg-blue-600 text-white"
                )}>
                  {type}
                </span>
              </div>
              <p className="text-sm font-medium leading-relaxed">{renderInlineFormatting(body)}</p>
            </div>
          );
          return;
        }
      }

      // Check for bold headings at the start of a line e.g., **Heading:** or **100.10.01 — Fire Chief:**
      if (/^\*\*[^\*]+\*\*/.test(trimmed)) {
        elements.push(
          <div key={`heading-${i}`} className="mt-6 mb-2">
            <h3 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 dark:bg-emerald-400 shrink-0" />
              {renderInlineFormatting(trimmed)}
            </h3>
          </div>
        );
        return;
      }

      // Regular paragraph
      elements.push(
        <p key={`para-${i}`} className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-3">
          {renderInlineFormatting(trimmed)}
        </p>
      );
    });

    flushBulletList('bullet-flush-end');
    return elements;
  };

  // Inline formatting for **bold** or *italic*
  const renderInlineFormatting = (text: string) => {
    // Replace **text** with <strong>
    const parts = text.split(/(\*\*[^\*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-extrabold text-zinc-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-md">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-800 dark:text-white rounded-xl transition-all text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4 text-red-600" />
          <span>Back to Protocols</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowPdfView(!showPdfView)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-xs font-bold uppercase tracking-wider border",
              showPdfView 
                ? "bg-red-600 border-red-700 text-white shadow-lg" 
                : "bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-white hover:bg-zinc-100"
            )}
          >
            <FileText className="w-4 h-4" />
            <span>{showPdfView ? "Standard Box View" : "Original PDF Page"}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-800 dark:text-white rounded-xl transition-all text-xs font-bold"
            title="Copy protocol text"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-500" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 rounded-xl transition-all text-xs font-bold"
            title="Print protocol page"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Mode 1: PDF Official Document Page Replica */}
      {showPdfView ? (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="print:p-0"
        >
          {/* Printable PDF Page Container */}
          <div className="bg-white text-zinc-900 border-2 border-zinc-300 dark:border-zinc-700 rounded-xl shadow-2xl p-6 sm:p-10 max-w-4xl mx-auto space-y-6 print:shadow-none print:border-none print:max-w-none print:p-0">
            {/* Header / Letterhead */}
            <div className="border-b-4 border-red-700 pb-6 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white border border-zinc-200 rounded-xl p-1 shrink-0 flex items-center justify-center shadow">
                  <img src="logo.png" alt="3MF Crest" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-red-900 uppercase">
                    THREE MILE FIRE DEPARTMENT
                  </h1>
                  <p className="text-xs font-bold text-zinc-600 tracking-wider uppercase">
                    Stevensville, Montana • Emergency Operations SOG Manual
                  </p>
                  <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                    Combination Department Standard Operating Guidelines
                  </p>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="inline-block px-3 py-1 bg-red-100 border border-red-200 text-red-800 text-[10px] font-black uppercase rounded tracking-widest">
                  OFFICIAL POLICY DOCUMENT
                </span>
                <p className="text-[10px] font-bold text-zinc-500 mt-2">
                  Document ID: <span className="font-mono text-zinc-900">{protocol.id}</span>
                </p>
                <p className="text-[10px] text-zinc-500">
                  Effective Date: {protocol.lastUpdated}
                </p>
              </div>
            </div>

            {/* Metadata Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs">
              <div>
                <span className="text-[9px] font-bold uppercase text-zinc-500 block">Protocol ID</span>
                <span className="font-bold text-zinc-900 font-mono">{protocol.id}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase text-zinc-500 block">Category</span>
                <span className="font-bold text-zinc-900">{protocol.category}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase text-zinc-500 block">Section</span>
                <span className="font-bold text-zinc-900">{protocol.subCategory || 'General'}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase text-zinc-500 block">Last Revised</span>
                <span className="font-bold text-zinc-900">{protocol.lastUpdated}</span>
              </div>
            </div>

            {/* Title */}
            <div className="pt-2">
              <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight border-b-2 border-zinc-200 pb-2">
                {protocol.title}
              </h2>
            </div>

            {/* Continuous Document Body */}
            <div className="prose prose-zinc max-w-none text-zinc-900 text-sm leading-relaxed space-y-4">
              {renderFormattedContent(protocol.content)}
            </div>

            {/* Action Steps if present */}
            {protocol.steps && protocol.steps.length > 0 && (
              <div className="border-t-2 border-zinc-200 pt-6 mt-6">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-600 mb-3">
                  Mandatory Action Sequence
                </h3>
                <div className="space-y-2">
                  {protocol.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-3 text-xs text-zinc-800">
                      <span className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Official Signature / Sign-off Footer */}
            <div className="border-t-2 border-zinc-300 pt-8 mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-zinc-600">
              <div>
                <p className="font-bold uppercase text-[10px] text-zinc-400 tracking-wider">Approved By Authority</p>
                <div className="h-10 border-b border-zinc-400 mt-2 flex items-end pb-1 font-serif italic text-zinc-800 text-sm">
                  Chad Hampshire, Fire Chief
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">Fire Chief — Three Mile Fire Department</p>
              </div>

              <div>
                <p className="font-bold uppercase text-[10px] text-zinc-400 tracking-wider">Governance</p>
                <div className="h-10 border-b border-zinc-400 mt-2 flex items-end pb-1 font-sans text-zinc-800 text-xs font-semibold">
                  Board of Fire Commissioners
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">Ravalli County Fire District • Annual Review Mandatory</p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Mode 2: Standard Single Box Document View */
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* SINGLE UNIFIED DOCUMENT CONTAINER */}
          <div className="bg-white dark:bg-[#1C1C1E] border-2 border-zinc-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
            
            {/* Header Meta */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg flex items-center gap-1.5",
                protocol.category === 'Treatment' ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                protocol.category === 'Fire' ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              )}>
                {protocol.category === 'Treatment' ? <Stethoscope className="w-3.5 h-3.5" /> : protocol.category === 'Fire' ? <Flame className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                <span>{protocol.category} Protocol</span>
                {protocol.subCategory && <span className="opacity-75">• {protocol.subCategory}</span>}
              </span>

              <span className="text-[10px] font-bold text-zinc-500 dark:text-white/40 flex items-center gap-1 ml-auto bg-zinc-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                <Clock className="w-3 h-3 text-red-600" />
                <span>Revised: {protocol.lastUpdated}</span>
              </span>
            </div>

            {/* Protocol Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-6 pb-4 border-b border-zinc-200 dark:border-white/10">
              {protocol.title}
            </h1>

            {/* Single Cohesive Document Body */}
            <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-800 dark:text-white/90 leading-relaxed mb-8">
              {renderFormattedContent(protocol.content)}
            </div>

            {/* Action Steps */}
            {protocol.steps && protocol.steps.length > 0 && (
              <div className="border-t border-zinc-200 dark:border-white/10 pt-6 mt-6 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-white/40">
                  Action Steps & Procedure
                </h3>
                <div className="space-y-3">
                  {protocol.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-4 p-3 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-200 dark:border-white/5">
                      <div className="flex-shrink-0 w-7 h-7 rounded-xl bg-red-600 text-white flex items-center justify-center text-xs font-black shadow-md">
                        {idx + 1}
                      </div>
                      <p className="text-sm pt-0.5 text-zinc-800 dark:text-white/90 font-medium">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
