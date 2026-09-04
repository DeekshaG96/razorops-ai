// C:\Users\ganch\.gemini\antigravity\scratch\razorops-ai\src\components\RazorpaySidebar.jsx
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
  Sparkles,
  ChevronRight,
  Sliders,
  ExternalLink,
  Layers,
  X
} from 'lucide-react';

export default function RazorpaySidebar({
  activeTab,
  setActiveTab,
  user,
  onSignOut,
  onAuditorLogin,
  firestoreSynced,
  unresolvedCount = 0,
  mobileOpen,
  setMobileOpen
}) {
  const navigationSections = [
    {
      group: 'RECONCILIATION & AUDIT',
      items: [
        { id: 'studio', label: 'Reconciliation Studio', icon: Zap, badge: null },
        { id: 'ledger', label: 'Master Settlements', icon: FileSpreadsheet, badge: null },
        { id: 'exceptions', label: 'Exceptions & Disputes', icon: AlertTriangle, badge: unresolvedCount > 0 ? unresolvedCount : null, badgeColor: 'bg-rose-500 text-white' },
        { id: 'forecast', label: 'Liquidity & Cashflow', icon: TrendingUp, badge: null },
      ]
    },
    {
      group: 'INTELLIGENCE',
      items: [
        { id: 'copilot', label: 'Ray AI Copilot', icon: Bot, badge: 'Gemini', badgeColor: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm' },
      ]
    },
    {
      group: 'PLATFORM ARCHIVES',
      items: [
        { id: 'history', label: 'Batch History', icon: History, badge: null },
        { id: 'settings', label: 'Settings & MDR Rates', icon: Settings, badge: null },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#0a1128] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top Branding */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => {
                setActiveTab('studio');
                setMobileOpen(false);
              }}
            >
              {/* Razorpay Signature Angled Lightning Glyph */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M13.976 1.488l-9.952 14.02a.8.8 0 00.655 1.264h6.059l-2.714 5.74a.8.8 0 001.378.756l9.952-14.02a.8.8 0 00-.655-1.264h-6.059l2.714-5.74a.8.8 0 00-1.378-.756z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-white text-lg tracking-tight font-sans">Razorpay</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-blue-500/20 text-blue-400 text-[10px] font-mono font-bold border border-blue-500/30">
                    OpsAI
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Track 4 Autonomous Audit</p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button 
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Merchant Account Pill */}
          <div className="mt-4 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="flex flex-col">
                <span className="font-mono text-[11px] font-semibold text-slate-200">MID_RZP_TRACK4</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider">Automated Settlement</span>
              </div>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              LIVE
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
          {navigationSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <span className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase block mb-1">
                {section.group}
              </span>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group
                      ${isActive 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-1 ring-white/10' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-900/80'}
                    `}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full flex-shrink-0 ${item.badgeColor || 'bg-slate-800'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer: User / Auditor Session */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-2">
          {/* Cloud Firestore Indicator */}
          <div className="flex items-center justify-between px-2 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>Cloud Sync</span>
            </span>
            <span className={`flex items-center space-x-1 ${firestoreSynced ? 'text-emerald-400' : 'text-amber-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${firestoreSynced ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{firestoreSynced ? 'Connected' : 'Local Ready'}</span>
            </span>
          </div>

          {/* User Session */}
          {user ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center space-x-2 truncate">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-[10px] flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0">
                  {user.email ? user.email.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="truncate">
                  <div className="text-[11px] font-semibold text-white truncate">{user.displayName || user.email || 'Lead Auditor'}</div>
                  <div className="text-[9px] text-slate-400 truncate">Senior Controller</div>
                </div>
              </div>
              <button
                onClick={onSignOut}
                title="Sign Out"
                className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onAuditorLogin}
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all ring-1 ring-white/10"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>1-Click Auditor Sign-In</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
