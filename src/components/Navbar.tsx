import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Crown, LogIn, LogOut, Monitor } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent } from 'motion/react';

export const Navbar: React.FC = () => {
  const { user, login, logout, isAdmin } = useAuth();
  const location = useLocation();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  // Hide completely on monitor page
  if (location.pathname === '/monitor') return null;

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.nav 
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: "-100%", opacity: 0 },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-slate-900/40 backdrop-blur-xl border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-amber-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:rotate-12 transition-transform">
              <span className="text-slate-950 font-black text-xl">B</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white m-0 leading-tight">
                MISS BATO <span className="text-amber-500">2026</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 m-0 leading-none">Official Live Voting Poll</p>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            {isAdmin && (
              <div className="flex items-center gap-6">
                <Link 
                  to="/monitor" 
                  className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-amber-500 transition-colors flex items-center gap-2"
                  target="_blank"
                >
                  <Monitor className="w-4 h-4" />
                  Monitor
                </Link>
                <Link 
                  to="/admin" 
                  className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-amber-500 transition-colors"
                >
                  Dashboard
                </Link>
              </div>
            )}
            
            {user ? (
              <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center space-x-3 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
                  <img 
                    src={user.photoURL || ''} 
                    alt={user.displayName || ''} 
                    className="w-6 h-6 rounded-full border border-slate-600"
                  />
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-200 leading-none">{user.displayName}</p>
                    {isAdmin ? (
                      <p className="text-[9px] text-amber-500 font-bold uppercase tracking-wider leading-none mt-1">Admin Access</p>
                    ) : (
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none mt-1">Verified Voter</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-300 transition-colors border border-slate-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={login}
                className="px-6 py-2.5 bg-amber-500 text-slate-950 rounded-full text-xs font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20"
              >
                Sign In
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
