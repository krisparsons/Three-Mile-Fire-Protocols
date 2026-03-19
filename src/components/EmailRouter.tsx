import React, { useState, useRef } from 'react';
import { Mail, Send, User, ChevronRight, ArrowLeft, Paperclip, X, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface EmailRouterProps {
  onBack?: () => void;
}

export default function EmailRouter({ onBack }: EmailRouterProps) {
  const [recipient, setRecipient] = useState<'ems' | 'chief' | null>(null);
  const [subject, setSubject] = useState('Incident Report');
  const [body, setBody] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const recipients = {
    ems: { name: 'EMS Officer', email: 'ems-officer@example.com' },
    chief: { name: 'Fire Chief', email: 'fire-chief@example.com' }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachment(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearAttachment = () => {
    setAttachment(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (!recipient) return;
    
    const targetEmail = recipients[recipient].email;

    if (attachment && navigator.canShare && navigator.canShare({ files: [attachment] })) {
      try {
        await navigator.share({
          title: subject,
          text: `[Intended Recipient: ${targetEmail}]\n\n${body}`,
          files: [attachment]
        });
        return;
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }

    if (attachment) {
      alert("Your device doesn't support direct file attachments via web email links. The email will open without the attachment.");
    }

    const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        {onBack && (
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-emerald-500" />
          </button>
        )}
        <h2 className="text-xl font-bold">Report Router</h2>
      </div>

      {!recipient ? (
        <div className="space-y-4">
          <p className="text-sm text-white/60 mb-4">Select the primary recipient for the report:</p>
          <button 
            onClick={() => setRecipient('ems')}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between group hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <User className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-bold">EMS Officer</h3>
                <p className="text-xs text-white/40">Direct report to EMS Command</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-emerald-500" />
          </button>

          <button 
            onClick={() => setRecipient('chief')}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between group hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                <User className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-bold">Fire Chief</h3>
                <p className="text-xs text-white/40">Departmental notification</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-emerald-500" />
          </button>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40">Sending to</p>
                  <p className="font-bold">{recipients[recipient].name}</p>
                </div>
              </div>
              <button 
                onClick={() => setRecipient(null)}
                className="text-xs text-emerald-500 hover:underline"
              >
                Change
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 block">Subject</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 block">Report Content</label>
                <textarea 
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Enter report details, patient counts, and resource needs..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none mb-4"
                />

                {/* Attachment Section */}
                <div className="mb-2">
                  {!attachment ? (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 text-xs text-emerald-500 hover:text-emerald-400 transition-colors bg-emerald-500/10 px-4 py-2.5 rounded-lg font-medium"
                    >
                      <Paperclip className="w-4 h-4" />
                      Attach Picture
                    </button>
                  ) : (
                    <div className="relative inline-block">
                      <img 
                        src={previewUrl!} 
                        alt="Attachment preview" 
                        className="h-24 w-24 object-cover rounded-xl border border-white/10 shadow-lg"
                      />
                      <button
                        onClick={clearAttachment}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
              <button 
                onClick={handleSend}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 mt-2"
              >
                <Send className="w-5 h-5" />
                Open Email Client
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
