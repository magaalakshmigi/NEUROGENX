import React, { useState } from 'react';
import { Dna, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { BackgroundHelix } from '../components/common/BackgroundHelix';
import { EXACT_DISCLAIMER } from '../types';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('demo@neurogenex.app');
  const [password, setPassword] = useState('NeuroGeneX2026');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      if (email.trim() && password.trim()) {
        onLoginSuccess();
      } else {
        setError('Please enter valid investigator credentials.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#04060F] flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Animated Double Helix & Particles Background */}
      <BackgroundHelix density="high" />

      {/* Centered Glass Login Card */}
      <div className="relative z-10 w-full max-w-md glass-panel rounded-2xl p-8 border border-cyan-500/30 shadow-2xl hud-corner">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-violet-600 to-fuchsia-500 p-0.5 shadow-xl shadow-cyan-500/20 mb-4 animate-pulse">
            <div className="w-full h-full bg-[#070B1A] rounded-2xl flex items-center justify-center">
              <Dna className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl font-heading font-bold text-white tracking-widest">
            NEUROGENEX
          </h1>
          <p className="text-xs text-cyan-300 font-mono-code uppercase tracking-wider mt-1">
            Doctor / Researcher Portal · Role: Clinical Investigator
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/50 flex items-center gap-2 text-xs text-red-200 font-mono-code">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono-code text-slate-300 mb-1.5">
              Investigator Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 font-mono-code transition-colors"
                placeholder="investigator@institution.org"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono-code text-slate-300 mb-1.5">
              Security Key / Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 font-mono-code transition-colors"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-violet-600 to-fuchsia-500 hover:from-cyan-400 hover:to-fuchsia-400 text-white font-heading font-semibold text-xs tracking-wider uppercase transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating Session…' : 'Sign In to Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 font-mono-code block mb-1">
            Preloaded Demo Credentials:
          </span>
          <div className="inline-block bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono-code text-slate-300">
            <span className="text-cyan-400">demo@neurogenex.app</span> / <span className="text-fuchsia-300">NeuroGeneX2026</span>
          </div>
        </div>

        {/* Bottom De-identified Protocol Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono-code">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Local De-Identified Data Layer Active</span>
        </div>
      </div>
    </div>
  );
};
