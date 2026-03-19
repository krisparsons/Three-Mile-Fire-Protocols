import React from 'react';
import { motion } from 'motion/react';
import { QrCode, ArrowLeft } from 'lucide-react';

interface CommunityConnectProps {
  onBack: () => void;
}

export default function CommunityConnect({ onBack }: CommunityConnectProps) {
  return (
    <div className="flex flex-col h-full bg-[#151619] text-white">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-white/10 bg-[#151619] sticky top-0 z-10">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <QrCode className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold">Community Connect</h2>
        </div>
      </div>

      <div className="p-4 flex flex-col items-center justify-center flex-1 space-y-8 mt-12">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold">Scan to Connect</h3>
          <p className="text-sm text-white/60 max-w-xs text-center">
            Have the patient or family member scan this QR code to access Community Connect resources.
          </p>
        </div>
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-6 rounded-3xl shadow-2xl"
        >
          <img 
            src="/community-connect-qr.png" 
            alt="Community Connect QR Code" 
            className="w-64 h-64 object-contain"
            onError={(e) => {
              // Fallback if image is not uploaded yet
              const target = e.target as HTMLImageElement;
              target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=Community+Connect+Placeholder';
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
