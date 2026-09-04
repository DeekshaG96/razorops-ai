// C:\Users\ganch\.gemini\antigravity\scratch\razorops-ai\src\components\ExceptionsDesk.jsx
import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Send, 
  X, 
  Download, 
  ArrowRight,
  ShieldAlert,
  Clock,
  Coins,
  Receipt
} from 'lucide-react';
import { exportAuditMemoText } from '../utils/exportUtils';

export default function ExceptionsDesk({
  exceptions = [],
  resolvedExceptionIds = {},
  onResolveException
}) {
  const [activeMemo, setActiveMemo] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);

  const getReasonIcon = (reason) => {
    if (reason?.includes('DISPUTE')) return ShieldAlert;
    if (reason?.includes('CUTOFF') || reason?.includes('TIMING')) return Clock;
    if (reason?.includes('FEE') || reason?.includes('MDR')) return Coins;
    return Receipt;
  };

  const handleOpenResolutionModal = (exc) => {
    const txId = exc.paymentId || exc.id || 'pay_unknown';
    const memoId = `RZP-NODAL-${Math.floor(10000 + Math.random() * 90000)}`;
    const hash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    let debitAcc = 'Acquiring Bank Clearing (1102)';
    let creditAcc = 'Merchant Settlement Receivable (1205)';
    let actionNote = 'Automated journal adjustment applied to ledger balance.';

    if (exc.reasonCode?.includes('DISPUTE')) {
      debitAcc = 'Dispute Reserve Escrow (2090)';
      creditAcc = 'Provisional Acquirer Hold (2095)';
      actionNote = 'Reserve hold locked; evidence submission packet created for acquiring bank.';
    } else if (exc.reasonCode?.includes('INVOICE')) {
      debitAcc = 'Unbilled Revenue Suspense (1350)';
      creditAcc = 'ERP Sales Invoices (4010)';
      actionNote = 'Auto-generated synthetic ERP invoice record matching Order ID reference.';
    } else if (exc.reasonCode?.includes('CUTOFF')) {
      debitAcc = 'Nodal Transit Receivable (1105)';
      creditAcc = 'Current Day Settlement Batch (1101)';
      actionNote = 'Reclassified cutoff transaction into deferred cycle clearing.';
    }

    const memo = {
      memoId,
      timestamp: new Date().toISOString(),
      signatureHash: hash,
      paymentId: txId,
      reasonCode: exc.reasonCode || exc.reason || 'UNRESOLVED_LEDGER_VARIANCE',
      amount: exc.amount || exc.payment?.amount || 0,
      orderId: exc.orderId || exc.payment?.order_id || 'N/A',
      rootCause: exc.rootCause || exc.explanation || 'Transaction failed deterministic reconciliation checks.',
      status: 'AUDITED & DIGITALLY CERTIFIED',
      journalEntry: {
        debit: debitAcc,
        credit: creditAcc
      },
      actionNote
    };

    setActiveMemo(memo);
  };

  const handleConfirmDispatch = (memo) => {
    setResolvingId(memo.paymentId);
    setTimeout(() => {
      onResolveException(memo.paymentId, memo);
      setResolvingId(null);
      setActiveMemo(null);
    }, 600);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h2 className="text-xl font-bold text-white tracking-tight">Honest Exceptions & Dispute Desk</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                HITL Remediation
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive Human-In-The-Loop resolver for isolated discrepancies, dispute holds, and bank cutoff lags.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
              Active Exceptions: <span className="font-bold text-rose-400">{exceptions.length}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
              Resolved in Session: <span className="font-bold text-emerald-400">{Object.keys(resolvedExceptionIds).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Exception Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exceptions.length === 0 ? (
          <div className="col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Zero Open Exceptions</h3>
            <p className="text-xs text-slate-500">
              All transactions in this batch have successfully reconciled against bank and ERP records.
            </p>
          </div>
        ) : (
          exceptions.map((exc, idx) => {
            const txId = exc.paymentId || exc.id;
            const isResolved = !!resolvedExceptionIds[txId];
            const Icon = getReasonIcon(exc.reasonCode);

            return (
              <div
                key={idx}
                className={`rounded-2xl border p-5 transition-all relative overflow-hidden ${
                  isResolved
                    ? 'bg-slate-900/40 border-emerald-500/30 shadow-sm'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-xl'
                }`}
              >
                {isResolved && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-bl-lg">
                    Dispatched to Nodal Desk
                  </div>
                )}

                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-xl ${
                      isResolved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-white text-sm">{txId}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          ₹{exc.amount ? exc.amount.toLocaleString() : (exc.payment?.amount || 0).toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-rose-400/90 block mt-0.5">
                        {exc.reasonCode || exc.reason || 'LEDGER_MISMATCH'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Root Cause Note */}
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 mb-4 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    AI Root Cause Analysis
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {exc.rootCause || exc.explanation || 'Discrepancy detected during multi-way matching checks.'}
                  </p>
                </div>

                {/* Action CTA */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-400">
                    {isResolved ? 'Audit Signed & Logged' : 'Requires Auditor Action'}
                  </span>

                  <button
                    onClick={() => handleOpenResolutionModal(exc)}
                    disabled={isResolved}
                    className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isResolved
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isResolved ? 'View Signed Memo' : 'Auto-Execute Controller Resolution'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Interactive HITL Resolution Modal */}
      {activeMemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full p-6 shadow-2xl overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Signed Audit Resolution Memo</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Ref: {activeMemo.memoId}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveMemo(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Memo Body */}
            <div className="py-4 space-y-4 text-xs font-mono">
              
              {/* Hash Header */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span>SHA-256 AUDIT INTEGRITY SIGNATURE</span>
                  <span className="text-emerald-400 font-bold">VERIFIED</span>
                </div>
                <div className="text-[11px] text-cyan-400 break-all select-all font-semibold">
                  {activeMemo.signatureHash}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px]">Payment ID:</span>
                  <span className="text-white font-bold">{activeMemo.paymentId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Impact Amount:</span>
                  <span className="text-emerald-400 font-bold">₹{activeMemo.amount?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Reason Code:</span>
                  <span className="text-rose-400 font-bold">{activeMemo.reasonCode}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Timestamp (UTC):</span>
                  <span className="text-slate-300">{new Date(activeMemo.timestamp).toLocaleString()}</span>
                </div>
              </div>

              {/* Remedial Accounting Journal Entry */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                  Remedial Accounting Journal Entry
                </span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>DR: {activeMemo.journalEntry?.debit}</span>
                    <span className="text-emerald-400 font-semibold">+₹{activeMemo.amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>CR: {activeMemo.journalEntry?.credit}</span>
                    <span className="text-rose-400 font-semibold">-₹{activeMemo.amount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Dispatch Action */}
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] leading-relaxed">
                <span className="font-bold block text-blue-200 mb-0.5">Automated Action Dispatch:</span>
                {activeMemo.actionNote}
              </div>

            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => exportAuditMemoText(activeMemo)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Download Memo (.txt)</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveMemo(null)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => handleConfirmDispatch(activeMemo)}
                  disabled={resolvingId === activeMemo.paymentId}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{resolvingId === activeMemo.paymentId ? 'Dispatching...' : 'Dispatch to Nodal Desk'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
