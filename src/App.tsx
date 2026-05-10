import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { LiveMonitor } from './pages/LiveMonitor';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { userProfile, loading, isAdmin } = useAuth();

  if (loading) return null;
  
  if (!userProfile || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
          <Navbar />
          <main className="pb-20 pt-28">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/monitor" element={<LiveMonitor />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          {/* Footer Decoration */}
          <footer className="py-12 border-t border-slate-900 bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-6 text-center">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">
                &copy; 2026 MISS BATO COMMITTEE • OFFICIAL LIVE VOTING
              </p>
              <div className="flex items-center gap-3 justify-center">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none">SECURE FIRESTORE ENGINE ACTIVE</span>
              </div>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}
