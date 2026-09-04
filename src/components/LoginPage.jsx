// C:\Users\ganch\.gemini\antigravity\scratch\razorops-ai\src\components\LoginPage.jsx
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  RotateCw, 
  AlertCircle 
} from 'lucide-react';

export default function LoginPage({
  onGoogleSignIn,
  onEmailAuth,
  authError,
  authLoading,
  onSkipToDashboard
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    onEmailAuth(email, password, isSignUp);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 flex flex-col justify-center items-center p-4 sm:p-6 font-sans relative antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Background Soft Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-500/[0.07] rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-sky-400/[0.06] rounded-full blur-[100px]" />
      </div>

      {/* Main Centered Login Card */}
      <div className="w-full max-w-[440px] bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-8 relative z-10">
        
        {/* Header: Razorpay Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/25 ring-4 ring-blue-50 mb-3">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M13.976 1.488l-9.952 14.02a.8.8 0 00.655 1.264h6.059l-2.714 5.74a.8.8 0 001.378.756l9.952-14.02a.8.8 0 00-.655-1.264h-6.059l2.714-5.74a.8.8 0 00-1.378-.756z" />
            </svg>
          </div>

          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans">Razorpay</h1>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-mono font-bold border border-blue-200/80">
              OpsAI
            </span>
          </div>

          <h2 className="text-base font-bold text-slate-800 mt-2">
            {isSignUp ? 'Create Merchant Account' : 'Log in to your account'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isSignUp 
              ? 'Get started with autonomous 3-way reconciliation' 
              : 'Welcome back! Enter your merchant credentials'}
          </p>
        </div>

        {/* Google Single Sign-On Button */}
        <button
          type="button"
          onClick={onGoogleSignIn}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition-all flex items-center justify-center space-x-2.5 cursor-pointer mb-4 hover:border-slate-300"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            or with email
          </span>
        </div>

        {/* Normal Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="controller@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => alert("Password reset link will be sent to your registered email.")}
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center justify-between py-1">
            <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Remember this device</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={authLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {authLoading ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Create Account' : 'Log In'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Sign In / Sign Up */}
        <div className="text-center pt-4 mt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
              }}
              className="text-blue-600 hover:text-blue-800 font-bold ml-1 cursor-pointer"
            >
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Guest Demo Bypass Link */}
        {onSkipToDashboard && (
          <div className="text-center mt-3">
            <button
              type="button"
              onClick={onSkipToDashboard}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <span>Explore live dashboard as Guest</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        )}

      </div>

      {/* Footer Security Badges */}
      <div className="mt-6 text-center text-[11px] text-slate-400 space-y-1 relative z-10">
        <div className="flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Protected by 256-bit SSL encryption & RBI Nodal Escrow Compliance</span>
        </div>
        <p>© 2026 Razorpay Software Private Limited • Track 4: OpsAI</p>
      </div>

    </div>
  );
}
