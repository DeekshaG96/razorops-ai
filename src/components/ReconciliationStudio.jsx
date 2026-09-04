// C:\Users\ganch\.gemini\antigravity\scratch\razorops-ai\src\components\ReconciliationStudio.jsx
import React, { useState } from 'react';
import { 
  Play, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Terminal as TerminalIcon, 
  Sparkles, 
  Check, 
  Layers,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Clock,
  RotateCw
} from 'lucide-react';
import { downloadSampleTemplate } from '../data/sampleTemplates';

export default function ReconciliationStudio({
  mode,
  setMode,
  onRunEngine,
  isRunning,
  metrics,
  simulatedLogs,
  terminalEndRef,
  uploadedFiles,
  onFileUpload,
  onRemoveFile,
  activeBatchId
}) {
  const [selectedFileError, setSelectedFileError] = useState('');

  const handleFileChange = async (type, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSelectedFileError('');
      await onFileUpload(type, file);
    } catch (err) {
      setSelectedFileError(err.message || 'Failed to parse file.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Mode Switcher */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h2 className="text-xl font-bold text-white tracking-tight">Reconciliation Studio</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Autonomous Pipeline
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Ingest multi-source payment settlements, bank statements, and ERP invoices to execute 3-way reconciliation.
            </p>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
            <button
              onClick={() => setMode('upload')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'upload'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Real File Ingestion</span>
            </button>
            <button
              onClick={() => setMode('demo')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'demo'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Demo Stream</span>
            </button>
          </div>
        </div>

        {/* Real File Ingestion Dropzone Grid */}
        {mode === 'upload' && (
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Multi-Source Upload Dropzones (.csv, .xlsx, .xls)
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Test Templates:</span>
                <button
                  onClick={() => downloadSampleTemplate('razorpay')}
                  className="flex items-center space-x-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-blue-400 border border-slate-700"
                >
                  <Download className="w-3 h-3" />
                  <span>Razorpay CSV</span>
                </button>
                <button
                  onClick={() => downloadSampleTemplate('bank')}
                  className="flex items-center space-x-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-blue-400 border border-slate-700"
                >
                  <Download className="w-3 h-3" />
                  <span>Bank UTR CSV</span>
                </button>
                <button
                  onClick={() => downloadSampleTemplate('erp')}
                  className="flex items-center space-x-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-blue-400 border border-slate-700"
                >
                  <Download className="w-3 h-3" />
                  <span>ERP Invoice CSV</span>
                </button>
              </div>
            </div>

            {selectedFileError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{selectedFileError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* File 1: Razorpay */}
              <UploadCard
                title="1. Razorpay Settlements"
                subtitle="Captured payments, MDR fees, GST"
                fileType="razorpay"
                uploadedFile={uploadedFiles.razorpay}
                onFileChange={(e) => handleFileChange('razorpay', e)}
                onRemove={() => onRemoveFile('razorpay')}
                required={true}
              />

              {/* File 2: Bank Statement */}
              <UploadCard
                title="2. Bank Account UTRs"
                subtitle="Net credit amounts, value dates, UTRs"
                fileType="bank"
                uploadedFile={uploadedFiles.bank}
                onFileChange={(e) => handleFileChange('bank', e)}
                onRemove={() => onRemoveFile('bank')}
                required={false}
              />

              {/* File 3: ERP Invoices */}
              <UploadCard
                title="3. ERP Accounting Ledger"
                subtitle="Sales invoices, order IDs, billing status"
                fileType="erp"
                uploadedFile={uploadedFiles.erp}
                onFileChange={(e) => handleFileChange('erp', e)}
                onRemove={() => onRemoveFile('erp')}
                required={false}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>
              {mode === 'upload' 
                ? `${uploadedFiles.razorpay ? 'Razorpay file loaded' : 'Upload Razorpay CSV or test template'} • 3-Way Matching Engine Ready`
                : 'Demo Mode: 61 Simulated Multi-Source Records Ready'}
            </span>
          </div>

          <button
            onClick={onRunEngine}
            disabled={isRunning || (mode === 'upload' && !uploadedFiles.razorpay)}
            className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-all ${
              isRunning
                ? 'bg-blue-800 text-blue-200 cursor-not-allowed opacity-80'
                : mode === 'upload' && !uploadedFiles.razorpay
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-blue-500/25 ring-1 ring-white/20'
            }`}
          >
            {isRunning ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Executing Multi-Agent Engine...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Reconciliation Agent</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Metrics Dashboard Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          
          {/* Match Rate */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Match Rate</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
              {metrics.matchRate}%
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {metrics.resolvedCount} of {metrics.totalRecords} records matched
            </p>
            <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          </div>

          {/* Captured Volume */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Gross Volume</span>
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ₹{metrics.totalCaptured?.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Gateway captured volume
            </p>
          </div>

          {/* Dispute Reserve Hold */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Dispute Hold</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
              ₹{metrics.reserveHoldAmount?.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Provisional risk lock
            </p>
          </div>

          {/* Unresolved Exceptions */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Exceptions</span>
              <AlertCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight">
              {metrics.unresolvedCount}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Awaiting HITL resolution
            </p>
          </div>

          {/* 7-Day Liquidity */}
          <div className="col-span-2 md:col-span-1 bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">7D Liquidity</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 tracking-tight">
              ₹{metrics.endingBalance ? Math.round(metrics.endingBalance).toLocaleString() : '0'}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Projected available cash
            </p>
          </div>

        </div>
      )}

      {/* Streaming Agent Terminal View */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TerminalIcon className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200 tracking-wide font-mono">
              AGENT_EXECUTION_CONSOLE // MULTI-SOURCE_STREAM
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {isRunning && (
              <span className="flex items-center space-x-1.5 text-[11px] text-cyan-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>STREAMING</span>
              </span>
            )}
            <span className="text-[10px] font-mono text-slate-500">
              {simulatedLogs.length} events
            </span>
          </div>
        </div>

        <div className="p-4 h-64 overflow-y-auto font-mono text-xs space-y-1.5 bg-black/40">
          {simulatedLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
              <TerminalIcon className="w-8 h-8 text-slate-700" />
              <p>Terminal idle. Click "Run Reconciliation Agent" to trigger multi-agent pipeline.</p>
            </div>
          ) : (
            simulatedLogs.map((log, idx) => (
              <div key={idx} className="flex items-start space-x-2 leading-relaxed">
                <span className="text-slate-600 text-[10px] select-none">
                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '00:00:00'}
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  log.level === 'warn' ? 'bg-amber-500/20 text-amber-400' :
                  log.level === 'error' ? 'bg-rose-500/20 text-rose-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  [{log.agent || 'SYSTEM'}]
                </span>
                <span className={`${
                  log.level === 'warn' ? 'text-amber-300' :
                  log.level === 'error' ? 'text-rose-300 font-semibold' :
                  'text-slate-300'
                }`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>

    </div>
  );
}

function UploadCard({ title, subtitle, fileType, uploadedFile, onFileChange, onRemove, required }) {
  return (
    <div className={`p-4 rounded-xl border transition-all ${
      uploadedFile 
        ? 'bg-blue-950/20 border-blue-500/40' 
        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-white">{title}</span>
            {required && <span className="text-[10px] text-rose-400 font-semibold">*Required</span>}
          </div>
          <p className="text-[11px] text-slate-400">{subtitle}</p>
        </div>
        {uploadedFile ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        ) : (
          <FileText className="w-5 h-5 text-slate-600 flex-shrink-0" />
        )}
      </div>

      {uploadedFile ? (
        <div className="mt-3 p-2 bg-slate-800/80 rounded-lg flex items-center justify-between text-xs">
          <div className="truncate max-w-[170px]">
            <span className="font-semibold text-slate-200 block truncate">{uploadedFile.name}</span>
            <span className="text-[10px] text-slate-400">
              {uploadedFile.rowsCount} records ({Math.round(uploadedFile.size / 1024)} KB)
            </span>
          </div>
          <button
            onClick={onRemove}
            className="text-[11px] text-rose-400 hover:text-rose-300 font-medium px-2 py-0.5 rounded bg-rose-500/10"
          >
            Remove
          </button>
        </div>
      ) : (
        <label className="mt-3 block cursor-pointer">
          <input
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={onFileChange}
            className="hidden"
          />
          <div className="border border-dashed border-slate-700 hover:border-blue-500 rounded-lg p-3 text-center transition-colors bg-slate-800/40">
            <UploadCloud className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <span className="text-xs font-medium text-slate-300 block">Click to Browse</span>
            <span className="text-[10px] text-slate-500 block">CSV or Excel spreadsheet</span>
          </div>
        </label>
      )}
    </div>
  );
}
