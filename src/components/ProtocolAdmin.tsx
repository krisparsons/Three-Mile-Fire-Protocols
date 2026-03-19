import React, { useState } from 'react';
import { Shield, Plus, Edit2, Trash2, X, Save, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Protocol } from '../data/protocols';
import { cn } from '../lib/utils';

interface ProtocolAdminProps {
  protocols: Protocol[];
  setProtocols: (protocols: Protocol[]) => void;
  onBack: () => void;
}

export default function ProtocolAdmin({ protocols, setProtocols, onBack }: ProtocolAdminProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [showPassModal, setShowPassModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [tempTitle, setTempTitle] = useState('');
  const [tempCategory, setTempCategory] = useState<'Treatment' | 'EMS' | 'Fire'>('Treatment');
  const [tempSubCategory, setTempSubCategory] = useState('');
  const [tempContent, setTempContent] = useState('');

  const handleAdminLogin = () => {
    if (passInput === 'officer9111') {
      setIsAdmin(true);
      setShowPassModal(false);
      setPassInput('');
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect Officer Password.');
      setPassInput('');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setEditorVisible(false);
  };

  const openEditor = (protocol?: Protocol) => {
    if (protocol) {
      setEditingId(protocol.id);
      setTempTitle(protocol.title);
      setTempCategory(protocol.category);
      setTempSubCategory(protocol.subCategory || '');
      setTempContent(protocol.content);
    } else {
      setEditingId(null);
      setTempTitle('');
      setTempCategory('Treatment');
      setTempSubCategory('');
      setTempContent('');
    }
    setEditorVisible(true);
  };

  const handleSave = () => {
    if (!tempTitle || !tempContent) {
      setErrorMsg('Title and Content cannot be empty');
      return;
    }
    
    if (editingId) {
      setProtocols(protocols.map(p => p.id === editingId ? {
        ...p,
        title: tempTitle,
        category: tempCategory,
        subCategory: tempSubCategory,
        content: tempContent,
        lastUpdated: new Date().toISOString().split('T')[0]
      } : p));
    } else {
      setProtocols([...protocols, {
        id: Date.now().toString(),
        title: tempTitle,
        category: tempCategory,
        subCategory: tempSubCategory,
        content: tempContent,
        lastUpdated: new Date().toISOString().split('T')[0]
      }]);
    }
    setEditorVisible(false);
    setErrorMsg('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this protocol?')) {
      setProtocols(protocols.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-6 h-6 text-white/60" />
          </button>
          <div>
            <h2 className="text-xl font-bold">Protocol Admin</h2>
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">
              {isAdmin ? "OFFICER ACCESS ENABLED" : "Read-Only Mode"}
            </p>
          </div>
        </div>
        <button 
          onClick={isAdmin ? handleLogout : () => setShowPassModal(true)}
          className={cn(
            "p-3 rounded-full transition-all",
            isAdmin ? "bg-emerald-500/20 text-emerald-500" : "bg-white/5 text-white/40 hover:bg-white/10"
          )}
        >
          <Shield className="w-6 h-6" />
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {protocols.map((item) => (
          <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 relative group">
            <div className="pr-12">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                  {item.category}
                </span>
                {item.subCategory && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                    {item.subCategory}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-white/60 line-clamp-2">{item.content}</p>
            </div>
            
            {isAdmin && (
              <div className="absolute top-5 right-5 flex flex-col gap-2">
                <button 
                  onClick={() => openEditor(item)}
                  className="p-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Password Modal */}
      <AnimatePresence>
        {showPassModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#1A1B1E] border border-white/10 rounded-3xl p-6 w-full max-w-sm"
            >
              <h3 className="text-xl font-bold mb-6 text-center">Admin Authentication</h3>
              
              {errorMsg && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errorMsg}
                </div>
              )}

              <input 
                type="password"
                placeholder="Enter Officer Password"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-center text-lg tracking-widest focus:outline-none focus:border-emerald-500 mb-6"
                autoFocus
              />
              
              <div className="space-y-3">
                <button 
                  onClick={handleAdminLogin}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-colors"
                >
                  Unlock Admin Tools
                </button>
                <button 
                  onClick={() => { setShowPassModal(false); setErrorMsg(''); }}
                  className="w-full bg-white/5 hover:bg-white/10 text-white/60 font-bold py-4 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Modal */}
      <AnimatePresence>
        {editorVisible && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="fixed inset-0 z-50 bg-[#151619] flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#1A1B1E]">
              <button onClick={() => setEditorVisible(false)} className="p-2 text-white/60 hover:text-white">
                <X className="w-6 h-6" />
              </button>
              <h3 className="font-bold">{editingId ? 'Edit Protocol' : 'New Protocol'}</h3>
              <button onClick={handleSave} className="p-2 text-emerald-500 hover:text-emerald-400">
                <Save className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Title</label>
                <input 
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Chest Pain / STEMI"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Category</label>
                  <select 
                    value={tempCategory}
                    onChange={(e) => setTempCategory(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-emerald-500 appearance-none"
                  >
                    <option value="Treatment">Treatment</option>
                    <option value="EMS">EMS</option>
                    <option value="Fire">Fire</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Sub-Category</label>
                  <input 
                    type="text"
                    value={tempSubCategory}
                    onChange={(e) => setTempSubCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Cardiac"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Content</label>
                <textarea 
                  value={tempContent}
                  onChange={(e) => setTempContent(e.target.value)}
                  className="w-full h-64 bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-emerald-500 resize-none"
                  placeholder="Protocol details..."
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      {isAdmin && !editorVisible && (
        <button 
          onClick={() => openEditor()}
          className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-900/50 hover:bg-emerald-500 transition-transform hover:scale-105 z-40"
        >
          <Plus className="w-8 h-8" />
        </button>
      )}
    </div>
  );
}
