import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalMode, closeAuthModal, login, register, openAuthModal } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(authModalMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync mode with prop
  React.useEffect(() => {
    setMode(authModalMode);
    setError(null);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, phone);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick demo credentials helpers
  const handleQuickAdmin = async () => {
    setError(null);
    setLoading(true);
    try {
      await login('admin@imovies.com', 'admin123');
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickUser = async () => {
    setError(null);
    setLoading(true);
    try {
      await login('user@imovies.com', 'user123');
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#0e1017] border border-[#212739] rounded-2xl shadow-2xl overflow-hidden my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1c2232]">
          <h3 className="text-base font-bold text-white font-['Outfit']">
            {mode === 'login' ? 'Sign In to IMovies' : 'Create an Account'}
          </h3>
          <button
            onClick={closeAuthModal}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 p-1.5 m-5 mb-0 bg-[#141822] border border-[#202637] rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'login' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'register' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-9 pr-3 py-2 bg-[#141824] border border-[#252c3e] rounded-lg text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 bg-[#141824] border border-[#252c3e] rounded-lg text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-[#141824] border border-[#252c3e] rounded-lg text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 bg-[#141824] border border-[#252c3e] rounded-lg text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md shadow-red-950 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login Bar */}
        <div className="p-4 bg-[#12151f] border-t border-[#1c2231] space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block text-center">
            One-Click Test Accounts
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={handleQuickAdmin}
              disabled={loading}
              className="py-1.5 px-2 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-800/40 rounded-lg text-amber-300 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Admin (Harsh)
            </button>
            <button
              type="button"
              onClick={handleQuickUser}
              disabled={loading}
              className="py-1.5 px-2 bg-[#1a202d] hover:bg-[#232b3d] border border-[#293348] rounded-lg text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <User className="w-3.5 h-3.5 text-slate-400" />
              Regular Patron
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
