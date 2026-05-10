import React from 'react';
import { Candidate } from '../types';
import { motion } from 'motion/react';
import { Heart, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';

interface CandidateCardProps {
  candidate: Candidate;
  onVote: (id: string) => void;
  disabled: boolean;
  isVoted: boolean;
  totalVotes: number;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ 
  candidate, 
  onVote, 
  disabled, 
  isVoted,
  totalVotes 
}) => {
  const votePercentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative flex flex-col justify-end p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] bg-slate-900 border overflow-hidden transition-all duration-500 min-h-[400px] sm:min-h-[440px]",
        isVoted 
          ? "border-amber-500/50 shadow-2xl shadow-amber-500/10 ring-1 ring-amber-500/20" 
          : "border-slate-800 shadow-xl"
      )}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img 
          src={candidate.imageUrl} 
          alt={candidate.name}
          whileHover={{ scale: 1.15, transition: { duration: 0.8, ease: "easeOut" } }}
          className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10" />
      </div>

      {/* Content Container */}
      <div className="relative z-20 space-y-3 sm:space-y-4">
        {isVoted && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-10 h-10 mb-4 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center shadow-xl shadow-amber-500/40"
          >
            <Trophy className="w-5 h-5 fill-current" />
          </motion.div>
        )}

        <div>
          <h3 className="text-xl sm:text-2xl font-black text-white leading-none uppercase tracking-tight">{candidate.name}</h3>
          <p className="text-amber-500 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mt-2">
            {candidate.description.split('\n')[0]}
          </p>
        </div>

        {/* Progress and Votes */}
        <div className="pt-3 sm:pt-4 border-t border-slate-700/50">
          <div className="flex justify-between items-end mb-3 sm:mb-4">
            <div className="flex flex-col">
              <span className="text-3xl sm:text-4xl font-black text-white leading-none">{candidate.voteCount.toLocaleString()}</span>
              <span className="text-[9px] text-amber-500/70 font-bold uppercase tracking-[0.2em] mt-1">Official Count</span>
            </div>
            <div className="text-right">
              <span className="text-lg sm:text-xl font-bold text-slate-400">{votePercentage.toFixed(1)}%</span>
            </div>
          </div>
          
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4 sm:mb-6">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${votePercentage}%` }}
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
            />
          </div>

          <button
            onClick={() => onVote(candidate.id)}
            disabled={disabled || isVoted}
            className={cn(
              "w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all font-black uppercase text-[10px] sm:text-xs tracking-[0.2em]",
              isVoted 
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 cursor-default" 
                : "bg-white text-slate-900 hover:bg-amber-500 hover:text-slate-950 active:scale-95 disabled:opacity-30 disabled:grayscale"
            )}
          >
            {isVoted ? (
              <span>Voted successfully</span>
            ) : (
              <>
                <Heart className={cn("w-4 h-4", !disabled && "group-hover:fill-current")} />
                <span>{disabled ? "Sign in to vote" : "Cast your vote"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
