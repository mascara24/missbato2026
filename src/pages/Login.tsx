import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Crown, ShieldCheck, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12 relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative z-10 text-center space-y-8"
      >
        <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-yellow-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/20 mx-auto rotate-3">
          <Crown className="w-10 h-10 text-slate-950" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Identity Required</h1>
          <p className="text-slate-400 text-sm font-medium">To ensure a fair and verified voting process, we require users to connect their Google Workspace account.</p>
        </div>

        <ul className="text-left space-y-4 py-4">
          <li className="flex items-center gap-3 text-xs font-bold text-slate-300 uppercase tracking-widest">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            One verified vote per person
          </li>
          <li className="flex items-center gap-3 text-xs font-bold text-slate-300 uppercase tracking-widest">
            <Mail className="w-5 h-5 text-amber-500" />
            Automatic session verification
          </li>
        </ul>

        <button
          onClick={login}
          className="w-full flex items-center justify-center gap-4 bg-white text-slate-950 px-8 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-amber-500 transition-all shadow-xl active:scale-95"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
          Continue with Google
        </button>

        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] pt-4">
          Secured by Firebase Auth • 256-bit Encryption
        </p>
      </motion.div>
    </div>
  );
};
