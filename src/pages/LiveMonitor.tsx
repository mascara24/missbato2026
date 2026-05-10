import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Candidate } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Crown, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

export const LiveMonitor: React.FC = () => {
  const [topCandidates, setTopCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    // Top 3 candidates query
    const q = query(collection(db, 'candidates'), orderBy('voteCount', 'desc'), limit(3));
    
    // Total votes monitor - we'll sum from the local state or another snapshot if needed
    // But for the screen wall, just getting the top 3 is more performant
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Candidate[];
      setTopCandidates(data);
      setLoading(false);
    });

    // Handle overall vote count for the dashboard
    const allQ = query(collection(db, 'candidates'));
    const unsubscribeAll = onSnapshot(allQ, (snapshot) => {
      const total = snapshot.docs.reduce((acc, doc) => acc + (doc.data().voteCount || 0), 0);
      setTotalVotes(total);
    });

    return () => {
      unsubscribe();
      unsubscribeAll();
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <Crown className="w-12 h-12 text-amber-500 animate-pulse" />
        <p className="font-mono text-xs uppercase tracking-[0.4em] opacity-40">Connecting to Live Feed...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 overflow-hidden flex flex-col font-sans p-6 sm:p-12">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-amber-500/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 blur-[160px] rounded-full pointer-events-none" />

      {/* Header Info */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
              ● Live Polling Station
            </span>
          </div>
          <h1 className="text-4xl sm:text-7xl font-black text-white tracking-tighter uppercase leading-none">
            CURRENT <span className="text-amber-500">LEADERS</span>
          </h1>
        </div>
        
        <div className="text-right">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] mb-2">Total Verified Presence</p>
          <div className="flex items-baseline justify-end gap-4">
            <motion.span 
              key={totalVotes}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl sm:text-8xl font-black text-white tracking-tighter"
            >
              {totalVotes.toLocaleString()}
            </motion.span>
            <span className="text-xs font-black text-amber-500 uppercase tracking-widest">Votes</span>
          </div>
        </div>
      </div>

      {/* Video Wall Content - Focused on Top 3 */}
      <div className="relative z-10 flex-1 flex flex-col md:flex-row items-stretch gap-6 lg:gap-12">
        <AnimatePresence mode="popLayout">
          {topCandidates.map((candidate, index) => {
            const isFirst = index === 0;
            const isSecond = index === 1;
            const isThird = index === 2;
            
            return (
              <motion.div
                key={candidate.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "relative flex-1 flex flex-col justify-end p-8 sm:p-12 rounded-[3.5rem] overflow-hidden group transition-all duration-1000",
                  isFirst ? "bg-gradient-to-b from-amber-500/10 to-slate-950 border-2 border-amber-500/50 shadow-3xl shadow-amber-500/10 z-30" : 
                  isSecond ? "bg-slate-900 border border-slate-800 z-20" : 
                  "bg-slate-900/50 border border-slate-800/50 z-10 scale-95 origin-bottom opacity-80"
                )}
              >
                {/* Portrait */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={candidate.imageUrl} 
                    alt={candidate.name} 
                    className={cn(
                      "w-full h-full object-cover transition-opacity duration-1000",
                      isFirst ? "opacity-40" : isSecond ? "opacity-20" : "opacity-10 grayscale"
                    )}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center font-black text-2xl sm:text-4xl shadow-2xl",
                      isFirst ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"
                    )}>
                      {isFirst ? <Crown className="w-8 h-8 sm:w-12 sm:h-12" /> : index + 1}
                    </div>
                    {isFirst && (
                      <div className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-xl">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">Overall Champion</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h2 className={cn(
                      "font-black tracking-tighter uppercase leading-[0.85] text-white",
                      isFirst ? "text-5xl sm:text-7xl lg:text-9xl" : 
                      isSecond ? "text-4xl sm:text-6xl" : 
                      "text-3xl sm:text-5xl"
                    )}>
                      {candidate.name}
                    </h2>
                    <p className={cn(
                      "font-bold uppercase tracking-[0.3em] mt-4",
                      isFirst ? "text-amber-500 text-lg sm:text-xl" : "text-slate-500 text-sm"
                    )}>
                      {candidate.description.split('\n')[0]}
                    </p>
                  </div>

                  <div className={cn(
                    "flex flex-col border-t pt-8 mt-8",
                    isFirst ? "border-amber-500/20" : "border-slate-800"
                  )}>
                    <motion.span 
                      key={candidate.voteCount}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "font-black tracking-tighter",
                        isFirst ? "text-6xl sm:text-9xl text-white" : 
                        isSecond ? "text-5xl sm:text-7xl text-slate-300" : 
                        "text-4xl sm:text-6xl text-slate-500"
                      )}
                    >
                      {candidate.voteCount.toLocaleString()}
                    </motion.span>
                    <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-[0.4em] mt-2">Verified Votes Recorded</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer Branding */}
      <footer className="relative z-10 h-16 flex items-center justify-between border-t border-white/5 mt-12">
        <div className="flex items-center gap-6">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Official 2026 Pageant Broadcast Interface</p>
        </div>
        <div className="flex items-center gap-3">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Feed: Stable • Latency: 24ms</span>
        </div>
      </footer>
    </div>
  );
};
