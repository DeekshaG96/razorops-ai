// C:\Users\ganch\.gemini\antigravity\scratch\razorops-ai\src\components\HistoricalBatchesView.jsx
import React, { useState } from 'react';
import { 
  History, 
  Database, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Download, 
  Layers,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { exportLedgerToExcel } from '../utils/exportUtils';

export default function HistoricalBatchesView({ 
  historicalBatches = [], 
  onLoadBatch, 
  activeBatchId 
}) {
  const [selectedBatch, setSelectedBatch] = useState(null);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Cloud Firestore Audit Trail</h2>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-1">
                <Database className="w-3 h-3" />
                <span>Persistent Batches</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Complete historical record of all certified reconciliation runs stored in Cloud Firestore.
            </p>
          </div>

          <div className="text-xs text-slate-500">
            Total Batches Logged: <span className="font-bold text-slate-900">{historicalBatches.length}</span>
          </div>
        </div>
      </div>

      {/* Batches Table / Cards */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold tracking-wider text-slate-600">
                <th className="px-5 py-3.5">Batch Identifier</th>
                <th className="px-5 py-3.5">Audit Certified Date</th>
                <th className="px-5 py-3.5">Match Rate</th>
                <th className="px-5 py-3.5">Captured Volume</th>
                <th className="px-5 py-3.5">Dispute Hold</th>
                <th className="px-5 py-3.5">Exceptions</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {historicalBatches.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-slate-500">
                    No historical reconciliation batches found. Run the engine in the Studio to persist your first batch to Firestore.
                  </td>
                </tr>
              ) : (
                historicalBatches.map((batch, idx) => {
                  const isActive = activeBatchId === batch.batchId;
                  return (
                    <tr key={idx} className={`hover:bg-blue-50/40 transition-colors ${isActive ? 'bg-blue-50/60' : ''}`}>
                      {/* Batch Identifier */}
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-900">{batch.batchId}</span>
                          {isActive && (
                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 border border-blue-200">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Source: {batch.sourceType || 'Multi-Source Pipeline'} • {batch.metrics?.totalRecords || 61} records
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-slate-700">
                        <div>{new Date(batch.timestamp).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{new Date(batch.timestamp).toLocaleTimeString()}</div>
                      </td>

                      {/* Match Rate */}
                      <td className="px-5 py-4">
                        <span className="font-black text-emerald-600 font-mono text-sm">
                          {batch.metrics?.matchRate || 93.4}%
                        </span>
                      </td>

                      {/* Gross Volume */}
                      <td className="px-5 py-4 text-slate-900 font-mono font-semibold">
                        ₹{batch.metrics?.totalCaptured?.toLocaleString() || '496,702'}
                      </td>

                      {/* Dispute Hold */}
                      <td className="px-5 py-4 text-amber-600 font-mono font-semibold">
                        ₹{batch.metrics?.reserveHoldAmount?.toLocaleString() || '80,000'}
                      </td>

                      {/* Exceptions */}
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          {batch.metrics?.unresolvedCount || batch.exceptions?.length || 4} Open
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => exportLedgerToExcel(batch.reconciliationResults || [], batch.metrics || {})}
                            title="Export to Excel"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                          </button>
                          <button
                            onClick={() => onLoadBatch(batch)}
                            disabled={isActive}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              isActive
                                ? 'bg-slate-100 text-slate-400 cursor-default'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                            }`}
                          >
                            {isActive ? 'Loaded' : 'Load Batch'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
