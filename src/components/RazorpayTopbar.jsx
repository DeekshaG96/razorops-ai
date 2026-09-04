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
  UserCheck
} from 'lucide-react';

export default function RazorpayTopbar({
  activeTab,
  setMobileOpen,
  onRunEngine,
  isRunning,
  user,
  onAuditorLogin,
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
      default: return 'Overview';
    }
  };

  return (
    <header className="h-16 bg-[#070d1e]/90 border-b border-slate-800/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between backdrop-blur-xl gap-4">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-medium hidden sm:inline">Razorpay</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
            {getTabTitle()}
          </h1>
        </div>
      </div>

      {/* Center: Search Bar (Razorpay Style) */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="w-full relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search payment ID, bank UTR, or order (e.g. pay_1001)..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-12 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-mono">⌘K</kbd>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-2.5">
        {/* Nodal Status Badge */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span>T+2 Nodal Cycle</span>
        </div>

        {/* Action Button: Run Reconciliation */}
        {activeTab === 'studio' ? (
          <button
            onClick={onRunEngine}
            disabled={isRunning}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all ring-1 ring-white/10 whitespace-nowrap disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Auditing...' : 'Run Pipeline'}</span>
          </button>
        ) : !user ? (
          <button
            onClick={onAuditorLogin}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Auditor Login</span>
          </button>
        ) : null}
      </div>
    </header>
  );
}
