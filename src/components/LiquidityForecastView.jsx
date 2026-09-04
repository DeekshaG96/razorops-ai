// C:\Users\ganch\.gemini\antigravity\scratch\razorops-ai\src\components\LiquidityForecastView.jsx
import React, { useState } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  DollarSign, 
  Info, 
  AlertCircle,
  Building2
} from 'lucide-react';

export default function LiquidityForecastView({ 
  projections = [], 
  metrics = {} 
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // SVG Chart Dimensions
  const chartWidth = 700;
  const chartHeight = 220;
  const padding = 40;

  // Chart data calculation
  const points = projections.length > 0 ? projections : [
    { date: '2026-08-10', dayName: 'Monday', projectedCreditNet: 82000, closingBalance: 582000 },
    { date: '2026-08-11', dayName: 'Tuesday', projectedCreditNet: 75000, closingBalance: 657000 },
    { date: '2026-08-12', dayName: 'Wednesday', projectedCreditNet: 91000, closingBalance: 748000 },
    { date: '2026-08-13', dayName: 'Thursday', projectedCreditNet: 64000, closingBalance: 812000 },
    { date: '2026-08-14', dayName: 'Friday', projectedCreditNet: 53000, closingBalance: 865000 },
    { date: '2026-08-15', dayName: 'Saturday', projectedCreditNet: 0, closingBalance: 865000 },
    { date: '2026-08-16', dayName: 'Sunday', projectedCreditNet: 0, closingBalance: 865000 }
  ];

  const minBalance = Math.min(...points.map(p => p.closingBalance || 0)) * 0.95;
  const maxBalance = Math.max(...points.map(p => p.closingBalance || 100000)) * 1.05;

  const getX = (idx) => {
    return padding + (idx * (chartWidth - 2 * padding)) / (points.length - 1 || 1);
  };

  const getY = (val) => {
    const range = maxBalance - minBalance || 1;
    return chartHeight - padding - ((val - minBalance) * (chartHeight - 2 * padding)) / range;
  };

  const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.closingBalance)}`).join(' ');
  const areaPath = `${linePath} L ${getX(points.length - 1)} ${chartHeight - padding} L ${getX(0)} ${chartHeight - padding} Z`;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">7-Day Liquidity & Cashflow Predictor</h2>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Nodal Bank Clearing Model
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Predicts net available merchant treasury balance, modeling T+2 gateway cycles, MDR fees, and weekend nodal settlement freezes.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 block text-[10px]">Active Dispute Reserve Hold</span>
              <span className="text-amber-600 font-bold font-mono">₹{metrics.reserveHoldAmount?.toLocaleString() || '80,000'}</span>
            </div>
            <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 block text-[10px]">7-Day Ending Liquidity</span>
              <span className="text-blue-600 font-bold font-mono">₹{metrics.endingBalance ? Math.round(metrics.endingBalance).toLocaleString() : '489,573'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive SVG Line Chart */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Projected Available Cash Balance (INR)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Hover over nodes for daily cash breakdown
          </span>
        </div>

        {/* SVG Chart */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[650px] relative">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-56 overflow-visible"
            >
              <defs>
                <linearGradient id="liquidityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0c8ce9" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#0c8ce9" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = padding + pct * (chartHeight - 2 * padding);
                const val = Math.round(maxBalance - pct * (maxBalance - minBalance));
                return (
                  <g key={i}>
                    <line
                      x1={padding}
                      y1={y}
                      x2={chartWidth - padding}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={padding - 8}
                      y={y + 3}
                      fill="#64748b"
                      fontSize="9"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      ₹{(val / 1000).toFixed(0)}k
                    </text>
                  </g>
                );
              })}

              {/* Area Gradient */}
              <path d={areaPath} fill="url(#liquidityGrad)" />

              {/* Forecast Line */}
              <path
                d={linePath}
                fill="none"
                stroke="#0c8ce9"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              {points.map((p, idx) => {
                const cx = getX(idx);
                const cy = getY(p.closingBalance);
                const isWeekend = p.dayName === 'Saturday' || p.dayName === 'Sunday';

                return (
                  <g key={idx}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={hoveredPoint === idx ? 6 : 4}
                      fill={isWeekend ? '#f59e0b' : '#0c8ce9'}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-pointer transition-all hover:scale-125"
                      onMouseEnter={() => setHoveredPoint(idx)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    <text
                      x={cx}
                      y={chartHeight - 12}
                      fill="#64748b"
                      fontSize="10"
                      textAnchor="middle"
                      fontFamily="sans-serif"
                    >
                      {p.dayName ? p.dayName.slice(0, 3) : ''}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Card */}
            {hoveredPoint !== null && (
              <div
                className="absolute z-20 bg-white border border-blue-200 p-3 rounded-xl shadow-xl text-xs font-mono pointer-events-none transform -translate-x-1/2 -translate-y-full"
                style={{
                  left: `${(getX(hoveredPoint) / chartWidth) * 100}%`,
                  top: `${(getY(points[hoveredPoint].closingBalance) / chartHeight) * 100 - 15}%`
                }}
              >
                <div className="font-bold text-slate-900 mb-1">
                  {points[hoveredPoint].dayName} ({points[hoveredPoint].date})
                </div>
                <div className="space-y-0.5 text-[11px]">
                  <div className="text-blue-600 font-bold">
                    Closing Cash: ₹{points[hoveredPoint].closingBalance?.toLocaleString()}
                  </div>
                  <div className="text-emerald-600 font-medium">
                    Net Bank Credit: ₹{points[hoveredPoint].projectedCreditNet?.toLocaleString() || 0}
                  </div>
                  {points[hoveredPoint].dayName === 'Saturday' || points[hoveredPoint].dayName === 'Sunday' ? (
                    <div className="text-amber-600 text-[10px] mt-1 pt-1 border-t border-slate-100">
                      ⚡ Weekend Settlement Freeze (RBI Nodal Cutoff)
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nodal Clearing Notice */}
        <div className="mt-4 p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start space-x-3 text-xs text-slate-600">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-900">Weekend Nodal Settlement Lag:</strong> RBI RTGS/NEFT batch nodal settlements do not disburse outward merchant payouts on Saturdays and Sundays. Customer payments captured over the weekend remain safe in nodal escrow and clear in Monday morning's T+2 cycle.
          </p>
        </div>
      </div>

      {/* Day-by-Day Forecast Breakdown Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Day-by-Day Treasury Projection Schedule
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            7-Day Horizon
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold tracking-wider text-slate-600">
                <th className="px-5 py-3">Day & Date</th>
                <th className="px-5 py-3">Gross Captured</th>
                <th className="px-5 py-3">MDR & Taxes</th>
                <th className="px-5 py-3">Dispute Hold</th>
                <th className="px-5 py-3">Net Bank Payout</th>
                <th className="px-5 py-3">Closing Liquidity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-mono">
              {points.map((p, idx) => {
                const isWeekend = p.dayName === 'Saturday' || p.dayName === 'Sunday';
                return (
                  <tr key={idx} className={`hover:bg-blue-50/40 transition-colors ${isWeekend ? 'bg-amber-50/20' : ''}`}>
                    <td className="px-5 py-3 font-sans">
                      <div className="font-semibold text-slate-900">{p.dayName}</div>
                      <div className="text-[10px] text-slate-500">{p.date}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      ₹{p.projectedGross ? p.projectedGross.toLocaleString() : '65,000'}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      -₹{p.projectedFee ? p.projectedFee.toLocaleString() : '1,534'}
                    </td>
                    <td className="px-5 py-3 text-amber-600 font-medium">
                      {idx === 0 ? `-₹${metrics.reserveHoldAmount?.toLocaleString() || '80,000'}` : '—'}
                    </td>
                    <td className="px-5 py-3 font-bold">
                      {isWeekend ? (
                        <span className="text-amber-700 font-sans text-[11px] px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                          ₹0 (Weekend Lag)
                        </span>
                      ) : (
                        <span className="text-emerald-600">
                          +₹{p.projectedCreditNet ? p.projectedCreditNet.toLocaleString() : '63,466'}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-bold text-blue-600 text-sm">
                      ₹{p.closingBalance ? Math.round(p.closingBalance).toLocaleString() : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
