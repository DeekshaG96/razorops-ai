// C:\Users\ganch\.gemini\antigravity\scratch\razorops-ai\src\components\Navigation.jsx
import React from 'react';
import { 
  Zap, 
  FileSpreadsheet, 
  AlertTriangle, 
  TrendingUp, 
  Bot, 
  History, 
  Settings, 
  Database, 
  LogOut, 
  UserCheck,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function Navigation({ 
  activeTab, 
  setActiveTab, 
  user, 
  onSignOut, 
  onAuditorLogin, 
  firestoreSynced,
  unresolvedCount = 0
}) {
  const navItems = [
    { id: 'studio', label: 'Studio', icon: Zap, badge: null },
    { id: 'ledger', label: 'Ledger', icon: FileSpreadsheet, badge: null },
    { id: 'exceptions', label: 'Exceptions', icon: AlertTriangle, badge: unresolvedCount > 0 ? unresolvedCount : null, badgeColor: 'bg-rose-500 text-white' },
    { id: 'forecast', label: 'Liquidity', icon: TrendingUp, badge: null },
    { id: 'copilot', label: 'AI Copilot', icon: Bot, badge: 'Gemini', badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' },
    { id: 'history', label: 'History', icon: History, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <header className="bg-slate-950/80 border-b border-white/[0.08] sticky top-0 z-40 shadow-2xl backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => setActiveTab('studio')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black tracking-tight text-white font-sans">
                  RazorOps<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">.ai</span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Track 4 Pro
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 font-medium hidden sm:block">Autonomous Reconciliation & Liquidity Engine</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center bg-slate-900/60 p-1 rounded-2xl border border-white/[0.06] space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 relative ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-white/15' 
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${item.badgeColor || 'bg-slate-700'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Controls & Sync Status */}
          <div className="flex items-center space-x-3">
            {/* Real-time sync indicator */}
            <div 
              className={`hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                firestoreSynced 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}
              title={firestoreSynced ? "Connected to Cloud Firestore" : "Local engine active"}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${firestoreSynced ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`} />
              <span>{firestoreSynced ? 'Firestore Live' : 'Engine Ready'}</span>
            </div>

            {/* Auth Session Info */}
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-slate-900/80 border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-slate-200">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-5 h-5 rounded-full border border-blue-400" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-[10px] flex items-center justify-center font-bold text-white shadow-sm">
                      {user.email ? user.email.charAt(0).toUpperCase() : 'A'}
                    </div>
                  )}
                  <span className="font-medium max-w-[110px] truncate hidden sm:inline">{user.email || 'Auditor'}</span>
                </div>
                <button
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition-colors border border-transparent hover:border-rose-500/20"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onAuditorLogin}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all ring-1 ring-white/20"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Auditor Sign-In</span>
              </button>
            )}
          </div>

        </div>

        {/* Mobile Navigation Scroller */}
        <div className="flex md:hidden overflow-x-auto py-2.5 space-x-1 border-t border-white/[0.06] scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                    : 'text-slate-400 hover:text-white bg-slate-900/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] font-bold px-1.5 rounded-full ${item.badgeColor || 'bg-slate-700'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
