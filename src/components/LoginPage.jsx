// C:\Users\ganch\.gemini\antigravity\scratch\razorops-ai\src\components\LoginPage.jsx
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  UserCheck, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Zap,
  TrendingUp,
  AlertCircle,
  RotateCw
} from 'lucide-react';

export default function LoginPage({
  onAuditorLogin,
  onGoogleSignIn,
  onEmailAuth,
  authError,
  authLoading,
  onSkipToDashboard
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    onEmailAuth(email, password, isSignUp);
  };

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/[0.12] rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-indigo-600/[0.12] rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/[0.04] rounded-full blur-[160px]" />
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-slate-800 bg-[#0c1326]/90 shadow-2xl overflow-hidden relative z-10 backdrop-blur-xl">
        
        {/* Left Column: Razorpay Track 4 Value Proposition (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0c2340] via-[#09182d] to-[#06101f] p-8 text-white flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
          <div>
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M13.976 1.488l-9.952 14.02a.8.8 0 00.655 1.264h6.059l-2.714 5.74a.8.8 0 001.378.756l9.952-14.02a.8.8 0 00-.655-1.264h-6.059l2.714-5.74a.8.8 0 00-1.378-.756z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-xl tracking-tight text-white font-sans">Razorpay</span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-xs font-mono font-bold border border-blue-500/30">
                    OpsAI
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Track 4: Autonomous Engine</p>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2 leading-tight">
              Autonomous 3-Way Reconciliation & Liquidity Copilot
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Zero-manual-effort treasury compliance, RBI nodal cutoff management, and automated journal entries for Razorpay merchants.
            </p>

            {/* Feature Highlights */}
            <div className="space-y-3.5">
              <div className="flex items-start space-x-3">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 mt-0.5">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">3-Way Precision Matching</h4>
                  <p className="text-[11px] text-slate-400">Cross-checks Gateway captures, Bank UTRs, and ERP Invoices down to &lt; ₹0.01.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Dispute Sentinel & Reserves</h4>
                  <p className="text-[11px] text-slate-400">Automated provisional reserve holds (₹80,000) safeguarding cashflow.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 mt-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">RBI Nodal Weekend Cleared</h4>
                  <p className="text-[11px] text-slate-400">Models T+2 nodal cycles and Sunday night 22:30 IST banking cutoffs.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Razorpay Hackathon 2026</span>
            <span className="text-emerald-400 font-semibold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Production Live</span>
            </span>
          </div>
        </div>

        {/* Right Column: Interactive Login Card (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-10 text-slate-900 flex flex-col justify-between">
          <div>
            
            {/* Top Bar inside Card */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black tracking-tight text-[#0c2340]">
                  {isSignUp ? 'Create Merchant Account' : 'Merchant Sign In'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your auditor credentials to access the live pipeline.
                </p>
              </div>

              {onSkipToDashboard && (
                <button
                  onClick={onSkipToDashboard}
                  className="text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-xl flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <span>Dashboard Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Prominent 1-Click Live Auditor Session (Judges & Evaluators) */}
            <div className="p-4 rounded-2xl bg-blue-50/90 border border-blue-200/90 mb-6 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0c2340] flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Evaluator Fast-Track Pass</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                  1-Click Access
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Evaluating Razorpay Track 4? Skip typing passwords. Launch an authenticated Lead Auditor session with full execution privileges.
              </p>
              <button
                onClick={onAuditorLogin}
                type="button"
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01]"
              >
                <UserCheck className="w-4 h-4" />
                <span>Launch Lead Auditor Session (1-Click)</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Or Sign In with Email
              </span>
            </div>

            {/* Google SSO */}
            <button
              onClick={onGoogleSignIn}
              type="button"
              className="w-full flex items-center justify-center space-x-2.5 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-all mb-4"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google Single Sign-On</span>
            </button>

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {authError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="controller@merchant.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-[#0c2340] hover:bg-[#08172b] text-white text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
              >
                {authLoading ? (
                  <RotateCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Merchant Account' : 'Sign In with Password'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle */}
            <div className="text-center pt-3 mt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                {isSignUp ? 'Already registered? Sign In' : "New merchant? Create an Account"}
              </button>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100 text-center text-[10.5px] text-slate-400">
            Protected by PCI-DSS Level 1 & RBI Nodal Escrow Compliance Standards
          </div>
        </div>

      </div>

    </div>
  );
}
