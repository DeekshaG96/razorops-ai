// C:\Users\ganch\.gemini\antigravity\scratch\razorops-ai\src\components\Navigation.jsx
import React from 'react';
import { 
  Zap, 
  FileSpreadsheet, 
  AlertTriangle, 
  TrendingUp, 
  MessageSquare, 
  History, 
  Settings, 
  Database, 
  LogOut, 
  UserCheck,
  ShieldCheck,
  Building2
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
    { id: 'ledger', label: 'Master Ledger', icon: FileSpreadsheet, badge: null },
    { id: 'exceptions', label: 'Exceptions Desk', icon: AlertTriangle, badge: unresolvedCount > 0 ? unresolvedCount : null, badgeColor: 'bg-rose-500' },
    { id: 'forecast', label: 'Liquidity Forecast', icon: TrendingUp, badge: null },
    { id: 'copilot', label: 'Gemini Copilot', icon: MessageSquare, badge: 'AI', badgeColor: 'bg-indigo-500' },
    { id: 'history', label: 'Batch History', icon: History, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-xl backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('studio')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight text-white font-sans">
                  RazorOps<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">.ai</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Track 4 Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Autonomous Reconciliation & Liquidity Engine</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive 
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full text-white ${item.badgeColor || 'bg-slate-700'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Controls & Firestore Status */}
          <div className="flex items-center space-x-3">
            {/* Real-time sync indicator */}
            <div 
              className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                firestoreSynced 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
              title={firestoreSynced ? "Connected to Cloud Firestore" : "Local Mode active (Firestore syncing)"}
            >
              <Database className="w-3 h-3" />
              <span>{firestoreSynced ? 'Firestore Live' : 'Local Ready'}</span>
            </div>

            {/* Auth Session Info */}
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-5 h-5 rounded-full border border-blue-400" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-[10px] flex items-center justify-center font-bold text-white">
                      {user.email ? user.email.charAt(0).toUpperCase() : 'A'}
                    </div>
                  )}
                  <span className="font-medium max-w-[120px] truncate hidden sm:inline">{user.email || 'Auditor'}</span>
                </div>
                <button
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onAuditorLogin}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-500/20 transition-all ring-1 ring-white/20"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Auditor Sign-In</span>
              </button>
            )}
          </div>

        </div>

        {/* Mobile Nav Scroller */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-800 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium transition-colors ${
                  isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] font-bold px-1 rounded-full text-white ${item.badgeColor || 'bg-slate-700'}`}>
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
