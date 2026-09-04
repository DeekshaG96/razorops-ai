// C:\Users\ganch\.gemini\antigravity\scratch\razorops-ai\src\components\RazorpayTopbar.jsx
import React from 'react';
import { 
  Menu, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Play, 
  Download, 
  Bell, 
  Layers,
  ChevronRight,
  Database,
  UserCheck,
  LogIn,
  LogOut
} from 'lucide-react';

export default function RazorpayTopbar({
  activeTab,
  setActiveTab,
  setMobileOpen,
  onRunEngine,
  isRunning,
  user,
  onAuditorLogin,
  onSignOut,
  unresolvedCount = 0
}) {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'studio': return 'Reconciliation Studio';
      case 'ledger': return 'Master Settlement Ledger';
      case 'exceptions': return 'Exceptions & Dispute Desk';
      case 'forecast': return '7-Day Nodal Liquidity Forecast';
      case 'copilot': return 'Ray AI Settlement Copilot';
      case 'history': return 'Cloud Historical Batches';
      case 'settings': return 'Merchant Settings & Fee Tiers';
      case 'login': return 'Merchant Authentication Portal';
      default: return 'Overview';
    }
  };

  return (
    <header className="h-16 bg-white/95 border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between backdrop-blur-md gap-4 shadow-xs">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-semibold hidden sm:inline">Razorpay</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:inline" />
          <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            {getTabTitle()}
          </h1>
        </div>
      </div>

      {/* Center: Search Bar (Razorpay Style) */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search payment ID, bank UTR, or order (e.g. pay_1001)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-12 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200/80 border border-slate-300 text-[10px] text-slate-600 font-mono">⌘K</kbd>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-2.5">
        {/* Nodal Status Badge */}
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span>T+2 Nodal Cycle</span>
        </div>

        {/* Action Button: Run Reconciliation */}
        {activeTab === 'studio' && (
          <button
            onClick={onRunEngine}
            disabled={isRunning}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all whitespace-nowrap disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Auditing...' : 'Run Pipeline'}</span>
          </button>
        )}

        {/* Login / Auth Portal Navigation */}
        {!user ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab && setActiveTab('login')}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#0c2340] hover:bg-[#163a66] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Open Razorpay Merchant Login Portal"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Merchant Sign In</span>
            </button>
            <button
              onClick={onAuditorLogin}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              title="1-Click Fast Pass"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>1-Click Pass</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div 
              onClick={() => setActiveTab && setActiveTab('login')}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold cursor-pointer hover:bg-emerald-100 transition-colors shadow-2xs"
              title="Click to view Account / Login status"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="truncate max-w-[120px] font-bold">{user.displayName || user.email?.split('@')[0] || 'Auditor'}</span>
            </div>
            <button
              type="button"
              id="topbar-signout-btn"
              onClick={(e) => {
                e.stopPropagation();
                onSignOut && onSignOut();
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200/90 hover:border-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
              title="Sign Out of session and return to Login Portal"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
