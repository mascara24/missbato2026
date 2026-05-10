import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, getDocs, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Candidate } from '../types';
import { Plus, Trash2, Edit3, Image as ImageIcon, Save, X, RotateCcw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Admin: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetPhrase] = useState(() => Math.random().toString(36).substring(7).toUpperCase());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'candidates'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCandidates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Candidate[]);
    });
    return unsubscribe;
  }, []);

  const handleResetPoll = async () => {
    if (resetConfirmText !== resetPhrase) return;
    
    try {
      const batch = writeBatch(db);
      
      // 1. Reset all candidate vote counts
      candidates.forEach(c => {
        batch.update(doc(db, 'candidates', c.id), {
          voteCount: 0,
          updatedAt: serverTimestamp()
        });
      });

      // 2. Delete all vote records (Note: In production for large sets, this needs a cloud function or recursive loop)
      const votesSnap = await getDocs(collection(db, 'votes'));
      votesSnap.docs.forEach(voteDoc => {
        batch.delete(doc(db, 'votes', voteDoc.id));
      });

      await batch.commit();
      setIsResetting(false);
      setResetConfirmText('');
      alert("Poll has been successfully reset.");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'reset-poll');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'candidates', editingId), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'candidates'), {
          ...formData,
          voteCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setIsAdding(false);
      }
      setFormData({ name: '', description: '', imageUrl: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, editingId ? `candidates/${editingId}` : 'candidates');
    }
  };

  const handleEdit = (candidate: Candidate) => {
    setEditingId(candidate.id);
    setFormData({
      name: candidate.name,
      description: candidate.description,
      imageUrl: candidate.imageUrl
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this candidate? This will remove all their votes.")) {
      try {
        await deleteDoc(doc(db, 'candidates', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `candidates/${id}`);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 space-y-8 sm:space-y-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">Admin <span className="text-amber-500">Panel</span></h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium uppercase tracking-widest leading-loose">Registry & Candidate Management</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <button
            onClick={() => setIsResetting(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-900 border border-slate-700 text-slate-300 px-6 py-4 rounded-[1.2rem] sm:rounded-[1.5rem] font-bold uppercase text-[10px] tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Poll
          </button>
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingId(null);
              setFormData({ name: '', description: '', imageUrl: '' });
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-amber-500 text-slate-950 px-8 py-4 rounded-[1.2rem] sm:rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 active:scale-95"
          >
            {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {isAdding ? 'Close Editor' : 'Register Candidate'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isResetting && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full bg-slate-900 border border-rose-500/30 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl text-center space-y-6"
            >
              <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase">Critical Action</h3>
                <p className="text-slate-400 text-sm">You are about to wipe all cast votes and reset candidate counters. This action is irreversible.</p>
              </div>
              
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type the phrase below to confirm</p>
                <p className="text-2xl font-mono font-black text-amber-500 select-none tracking-widest break-all">{resetPhrase}</p>
                <input 
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value.toUpperCase())}
                  className="w-full bg-slate-900 border border-slate-800 px-4 py-4 rounded-xl outline-none focus:border-rose-500 transition-all text-center font-mono text-white"
                  placeholder="Enter phrase..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setIsResetting(false)}
                  className="w-full px-6 py-4 bg-slate-800 text-slate-300 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  disabled={resetConfirmText !== resetPhrase}
                  onClick={handleResetPoll}
                  className="w-full px-6 py-4 bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-500 transition-all disabled:opacity-20 disabled:grayscale"
                >
                  Confirm Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl space-y-6 sm:space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden sm:block">
                <ImageIcon className="w-32 h-32" />
              </div>

              <h2 className="text-xl font-black text-white uppercase tracking-tight">{editingId ? 'Edit Entry' : 'New Registration'}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Full Name</label>
                  <input
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 px-6 py-4 rounded-2xl border border-slate-800 focus:border-amber-500 outline-none transition-all text-white font-medium"
                    placeholder="Candidate Official Name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Portrait URL</label>
                  <input
                    required
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full bg-slate-950 px-6 py-4 rounded-2xl border border-slate-800 focus:border-amber-500 outline-none transition-all text-white font-medium"
                    placeholder="https://..."
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Candidate Biography</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-950 px-6 py-4 rounded-2xl border border-slate-800 focus:border-amber-500 outline-none transition-all text-white font-medium resize-none"
                    placeholder="Tell something about the candidate..."
                  />
                </div>
              </div>

              {formData.imageUrl && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Input Visual Verification</p>
                  <div className="w-20 sm:w-32 h-28 sm:h-44 rounded-2xl border border-slate-800 overflow-hidden">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-4 bg-white text-slate-950 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-amber-500 transition-all shadow-xl active:scale-95"
              >
                <Save className="w-5 h-5" />
                {editingId ? 'Update Registry' : 'Commit to Firestore'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden">
        {/* Desktop View Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-8 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Individual Profile</th>
                <th className="px-8 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Verified Score</th>
                <th className="px-8 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] text-right">Registry Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {candidates.map(candidate => (
                <tr key={candidate.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <img src={candidate.imageUrl} alt={candidate.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-800" />
                        <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-slate-900">
                          #{candidates.indexOf(candidate) + 1}
                        </div>
                      </div>
                      <div>
                        <p className="font-black text-white text-lg leading-none uppercase tracking-tight">{candidate.name}</p>
                        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mt-1.5 opacity-70">
                          {candidate.description.split('\n')[0]}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-baseline gap-2">
                       <span className="text-3xl font-black text-white">{candidate.voteCount.toLocaleString()}</span>
                       <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Votes</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleEdit(candidate)}
                        className="p-3 bg-slate-950 text-slate-500 hover:text-amber-500 hover:border-amber-500 border border-slate-800 rounded-xl transition-all"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(candidate.id)}
                        className="p-3 bg-slate-950 text-slate-500 hover:text-rose-500 hover:border-rose-500 border border-slate-800 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet View Cards */}
        <div className="lg:hidden p-4 space-y-4">
          <div className="flex justify-between items-center px-4 py-2 border-b border-slate-800 mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Registry List</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{candidates.length} Registered</span>
          </div>
          {candidates.map((candidate, idx) => (
            <div key={candidate.id} className="bg-slate-950/50 border border-slate-800 p-5 rounded-3xl space-y-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={candidate.imageUrl} alt={candidate.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-800" />
                    <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-slate-900">
                      #{idx + 1}
                    </div>
                  </div>
                  <div>
                    <p className="font-black text-white text-base leading-none uppercase tracking-tight">{candidate.name}</p>
                    <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mt-1.5 opacity-70">
                      {candidate.description.split('\n')[0]}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-white leading-none">{candidate.voteCount.toLocaleString()}</p>
                  <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">Votes</p>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-slate-800/50">
                <button
                  onClick={() => handleEdit(candidate)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-slate-400 rounded-xl border border-slate-800 font-bold uppercase text-[10px] tracking-widest active:scale-95 transition-all hover:text-amber-500 hover:border-amber-500"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
                <button
                  onClick={() => handleDelete(candidate.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-slate-400 rounded-xl border border-slate-800 font-bold uppercase text-[10px] tracking-widest active:scale-95 transition-all hover:text-rose-500 hover:border-rose-500"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {candidates.length === 0 && (
          <div className="px-8 py-20 text-center text-slate-600 font-medium uppercase text-xs tracking-widest italic bg-slate-950/20">
            Registry is empty. No candidates currently verified.
          </div>
        )}
      </div>
    </div>
  );
};
