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
  LogIn,
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
        { id: 'copilot', label: 'Ray AI Copilot', icon: Bot, badge: 'Gemini', badgeColor: 'bg-blue-100 text-blue-700 border border-blue-200 font-semibold' },
      ]
    },
    {
      group: 'PLATFORM ARCHIVES',
      items: [
        { id: 'history', label: 'Batch History', icon: History, badge: null },
        { id: 'settings', label: 'Settings & MDR Rates', icon: Settings, badge: null },
        user ? {
          id: 'signout_action',
          label: 'Sign Out Session',
          icon: LogOut,
          badge: 'Exit',
          badgeColor: 'bg-rose-50 text-rose-700 border border-rose-200 font-bold',
          onClick: onSignOut
        } : {
          id: 'login',
          label: 'Merchant Sign In',
          icon: LogIn,
          badge: 'Portal',
          badgeColor: 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
        },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out shadow-xs
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top Branding */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => {
                setActiveTab('studio');
                setMobileOpen(false);
              }}
            >
              {/* Razorpay Signature Angled Lightning Glyph */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/25 ring-1 ring-white/30 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M13.976 1.488l-9.952 14.02a.8.8 0 00.655 1.264h6.059l-2.714 5.74a.8.8 0 001.378.756l9.952-14.02a.8.8 0 00-.655-1.264h-6.059l2.714-5.74a.8.8 0 00-1.378-.756z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-[#0c2340] text-lg tracking-tight font-sans">Razorpay</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-600 text-[10px] font-mono font-bold border border-blue-200">
                    OpsAI
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Track 4 Autonomous Audit</p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button 
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Merchant Account Pill */}
          <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="font-mono text-[11px] font-bold text-slate-800">MID_RZP_TRACK4</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider">Automated Settlement</span>
              </div>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold">
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
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.onClick) {
                        item.onClick();
                      } else {
                        setActiveTab(item.id);
                      }
                      setMobileOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group cursor-pointer
                      ${isActive 
                        ? 'bg-blue-50 text-blue-600 border border-blue-200/90 shadow-xs font-bold' 
                        : item.id === 'signout_action'
                          ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200/80 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}
                    `}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-600' : item.id === 'signout_action' ? 'text-rose-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full flex-shrink-0 ${item.badgeColor || 'bg-slate-100 text-slate-600'}`}>
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
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-2.5">
          {/* Cloud Firestore Indicator */}
          <div className="flex items-center justify-between px-2 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Cloud Sync</span>
            </span>
            <span className={`flex items-center space-x-1 font-semibold ${firestoreSynced ? 'text-emerald-600' : 'text-blue-600'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${firestoreSynced ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
              <span>{firestoreSynced ? 'Connected' : 'Local Ready'}</span>
            </span>
          </div>

          {/* User Session */}
          {user ? (
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center space-x-2.5 truncate">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs flex items-center justify-center font-bold text-white shadow-xs flex-shrink-0">
                  {user.email ? user.email.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="truncate min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {user.displayName || user.email || 'Lead Auditor'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    <span>Senior Controller</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                id="sidebar-signout-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onSignOut && onSignOut();
                }}
                title="Sign Out of Session"
                className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/90 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:scale-[1.01] active:scale-[0.98]"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onAuditorLogin}
              className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
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
