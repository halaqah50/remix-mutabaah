import React, { useState } from 'react';
import { BookOpen, Lock, User as UserIcon, LogIn, AlertCircle } from 'lucide-react';
import { getMembers } from '../lib/storage';

interface LoginFormProps {
  onLoginSuccess: (userId: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const u = username.trim().toLowerCase();
    const p = password.trim();

    let matchedUserId: string | null = null;

    if (u === 'widy' && (p === 'dakwah' || p === 'ibadah')) {
      matchedUserId = 'usr-widy';
    } else if (u === 'rovi' && (p === 'dakwah' || p === 'ibadah')) {
      matchedUserId = 'usr-rovi';
    } else if (u === 'admin' && (p === 'ibadah' || p === 'dakwah')) {
      matchedUserId = 'usr-admin'; // Administrator CM3105 (Admin)
    } else {
      // Find matching member from storage
      const members = getMembers();
      const found = members.find((m) => {
        const nameLower = m.name.toLowerCase();
        const emailLower = m.email.toLowerCase();
        return (
          nameLower.includes(u) ||
          emailLower.includes(u) ||
          m.id.toLowerCase() === u
        );
      });

      if (found && (p === 'ibadah' || p === 'dakwah' || p === '123456')) {
        matchedUserId = found.id;
      }
    }

    if (matchedUserId) {
      localStorage.setItem('cm3105_is_authenticated', 'true');
      localStorage.setItem('cm3105_current_user_id', matchedUserId);
      onLoginSuccess(matchedUserId);
    } else {
      setError('Username atau Password yang Anda masukkan salah!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Subtle Background Glow */}
      <div className="absolute w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 space-y-6 relative overflow-hidden">
        
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />

        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <BookOpen className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mutabaah Ibadah CM3105</h2>
          <p className="text-xs text-slate-500 font-medium">
            Silakan login untuk mengakses halaman mutabaah
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2 animate-in fade-in zoom-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 ml-1">Username</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:font-normal placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 ml-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:font-normal placeholder:text-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-[0.99]"
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk ke Halaman</span>
          </button>
        </form>

        <div className="pt-2 text-center border-t border-slate-100">
          <p className="text-[11px] text-slate-400 font-medium">
            Halaqah Yaumiyah CM3105
          </p>
        </div>

      </div>
    </div>
  );
};
