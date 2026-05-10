import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, getDoc, doc, writeBatch, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Candidate, Vote } from '../types';
import { useAuth } from '../context/AuthContext';
import { CandidateCard } from '../components/CandidateCard';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, Clock, AlertCircle, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<'default' | 'popularity'>('default');

  useEffect(() => {
    const q = query(collection(db, 'candidates'), orderBy('voteCount', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const candidatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Candidate[];
      setCandidates(candidatesData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const sortedCandidates = [...candidates].sort((a, b) => {
    if (sortBy === 'popularity') {
      return b.voteCount - a.voteCount;
    }
    // Default sort by name or creation? Let's use the current order from Firestore (popularity by default in query)
    // but if we want "All Candidates" to be alphabetic:
    return a.name.localeCompare(b.name);
  });

  useEffect(() => {
    if (!user) {
      setUserVote(null);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'votes', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setUserVote(snapshot.data() as Vote);
      } else {
        setUserVote(null);
      }
    });

    return unsubscribe;
  }, [user]);

  const handleVote = async (candidateId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (userVote) {
      setError("You have already cast your vote.");
      return;
    }

    setVoting(true);
    setError(null);

    try {
      const batch = writeBatch(db);
      
      // 1. Create Vote record
      const voteRef = doc(db, 'votes', user.uid);
      batch.set(voteRef, {
        userId: user.uid,
        candidateId,
        voterEmail: user.email,
        createdAt: serverTimestamp()
      });

      // 2. Increment Candidate vote count
      const candidateRef = doc(db, 'candidates', candidateId);
      const candidateDoc = await getDoc(candidateRef);
      if (!candidateDoc.exists()) throw new Error("Candidate not found");
      
      batch.update(candidateRef, {
        voteCount: (candidateDoc.data()?.voteCount || 0) + 1,
        updatedAt: serverTimestamp()
      });

      await batch.commit();
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, `votes/${user.uid}`);
    } finally {
      setVoting(false);
    }
  };

  const totalVotes = candidates.reduce((acc, c) => acc + c.voteCount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-12 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 relative z-10"
        >
          <div className="inline-flex items-center gap-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
            <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
            Live Data Synchronization
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white max-w-4xl mx-auto leading-[0.9]">
            THE <span className="text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-600">ROYAL</span> POLL
          </h1>
          <p className="text-slate-400 text-base md:text-xl max-w-2xl mx-auto font-medium lowercase tracking-tight">
            Every session is verified through Google Workspace. One identity, one choice, for the next Miss Bato.
          </p>
        </motion.div>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/5 blur-2xl group-hover:bg-blue-500/10 transition-colors" />
          <div className="relative z-10 space-y-2">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Total Participation</p>
            <div className="flex items-baseline gap-2">
              <p className="text-5xl font-black text-white">{totalVotes.toLocaleString()}</p>
              <span className="text-[10px] font-bold text-slate-600 uppercase">Sessions</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500/10 to-slate-900 border border-amber-500/20 p-8 rounded-[2.5rem] shadow-2xl shadow-amber-500/5 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/10 blur-2xl group-hover:bg-amber-500/20 transition-colors" />
          <div className="relative z-10 space-y-2">
            <p className="text-[10px] font-mono text-amber-500/70 uppercase tracking-widest">Top Candidate</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-none tracking-tight break-words line-clamp-2 min-h-[2.5em] md:min-h-[2em]">
              {candidates[0]?.name || 'N/A'}
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-500/5 blur-2xl group-hover:bg-green-500/10 transition-colors" />
          <div className="relative z-10 space-y-2">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Verified Entries</p>
            <div className="flex items-baseline gap-1">
              <p className="text-5xl font-black text-white">{candidates.length}</p>
              <span className="text-[10px] font-bold text-slate-600 uppercase">Delegates</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-rose-500/10 text-rose-400 p-6 rounded-3xl flex items-center gap-4 border border-rose-500/20 shadow-xl shadow-rose-950/20"
        >
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <p className="font-bold uppercase text-xs tracking-widest">{error}</p>
        </motion.div>
      )}

      {/* Candidates Grid */}
      <section className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <h2 className="text-3xl sm:text-4xl font-light text-slate-400">
            <span className="font-black text-white uppercase tracking-tight">Main</span> Competition
          </h2>
          <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl w-full sm:w-auto">
            <button 
              onClick={() => setSortBy('default')}
              className={cn(
                "flex-1 sm:flex-none px-6 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-all",
                sortBy === 'default' ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "text-slate-500 hover:text-slate-300"
              )}
            >
              All Nominees
            </button>
            <button 
              onClick={() => setSortBy('popularity')}
              className={cn(
                "flex-1 sm:flex-none px-6 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-all",
                sortBy === 'popularity' ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "text-slate-500 hover:text-slate-300"
              )}
            >
              Popularity
            </button>
          </div>
        </div>
        
        {candidates.length === 0 ? (
          <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-[2.5rem]">
            <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">No entries found in registry.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
            <AnimatePresence mode="popLayout">
              {sortedCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onVote={handleVote}
                  disabled={voting}
                  isVoted={userVote?.candidateId === candidate.id}
                  totalVotes={totalVotes}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
};
