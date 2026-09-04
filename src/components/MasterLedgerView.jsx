// C:\Users\ganch\.gemini\antigravity\scratch\razorops-ai\src\components\MasterLedgerView.jsx
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Check
} from 'lucide-react';
import { exportLedgerToExcel, exportLedgerToCSV } from '../utils/exportUtils';

export default function MasterLedgerView({ reconciliationResults = [], metrics = {} }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Filter and search logic
  const filteredResults = useMemo(() => {
    return reconciliationResults.filter(item => {
      // Search matching
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        item.paymentId?.toLowerCase().includes(q) ||
        item.settlement?.utr?.toLowerCase().includes(q) ||
        item.invoice?.invoice_id?.toLowerCase().includes(q) ||
        item.payment?.customer_email?.toLowerCase().includes(q) ||
        item.status?.toLowerCase().includes(q)
      );

      // Status filtering
      let matchesStatus = true;
      if (statusFilter === 'perfect') {
        matchesStatus = item.status === 'Perfect Match';
      } else if (statusFilter === 'mdr') {
        matchesStatus = item.status?.includes('MDR');
      } else if (statusFilter === 'refund') {
        matchesStatus = item.status?.includes('Refund');
      } else if (statusFilter === 'cutoff') {
        matchesStatus = item.status?.includes('Cutoff');
      } else if (statusFilter === 'exceptions') {
        matchesStatus = item.status?.includes('Exception') || !item.invoice;
      }

      return matchesSearch && matchesStatus;
    });
  }, [reconciliationResults, searchQuery, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage) || 1;
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredResults.slice(start, start + itemsPerPage);
  }, [filteredResults, currentPage]);

  const handleExportExcel = () => {
    exportLedgerToExcel(filteredResults, metrics);
  };

  const handleExportCSV = () => {
    exportLedgerToCSV(filteredResults);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-1">
              <h2 className="text-xl font-bold text-[#0c2340] tracking-tight">Master Reconciled Ledger</h2>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                3-Way Matching Grid
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Audit granular transaction mapping between Razorpay Payments, Bank UTR Settlements, and ERP Invoices.
            </p>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportExcel}
              disabled={filteredResults.length === 0}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel (.xlsx)</span>
            </button>
            <button
              onClick={handleExportCSV}
              disabled={filteredResults.length === 0}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Payment ID, UTR, Invoice, Email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
            />
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center flex-wrap gap-1.5 w-full md:w-auto">
            <FilterChip 
              label="All" 
              active={statusFilter === 'all'} 
              count={reconciliationResults.length} 
              onClick={() => { setStatusFilter('all'); setCurrentPage(1); }} 
            />
            <FilterChip 
              label="Perfect Match" 
              active={statusFilter === 'perfect'} 
              color="emerald" 
              onClick={() => { setStatusFilter('perfect'); setCurrentPage(1); }} 
            />
            <FilterChip 
              label="MDR Variance" 
              active={statusFilter === 'mdr'} 
              color="amber" 
              onClick={() => { setStatusFilter('mdr'); setCurrentPage(1); }} 
            />
            <FilterChip 
              label="Refund Adjusted" 
              active={statusFilter === 'refund'} 
              color="cyan" 
              onClick={() => { setStatusFilter('refund'); setCurrentPage(1); }} 
            />
            <FilterChip 
              label="Timing Cutoff" 
              active={statusFilter === 'cutoff'} 
              color="indigo" 
              onClick={() => { setStatusFilter('cutoff'); setCurrentPage(1); }} 
            />
            <FilterChip 
              label="Exceptions" 
              active={statusFilter === 'exceptions'} 
              color="rose" 
              onClick={() => { setStatusFilter('exceptions'); setCurrentPage(1); }} 
            />
          </div>

        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold tracking-wider text-slate-500">
                <th className="px-4 py-3.5">Payment ID & Method</th>
                <th className="px-4 py-3.5">Gross Captured</th>
                <th className="px-4 py-3.5">Fee & GST</th>
                <th className="px-4 py-3.5">Net Settled</th>
                <th className="px-4 py-3.5">Bank UTR Ref</th>
                <th className="px-4 py-3.5">ERP Invoice</th>
                <th className="px-4 py-3.5">Audit Match Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedResults.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-slate-400">
                    No transactions match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedResults.map((item, idx) => {
                  const gross = item.payment?.amount || 0;
                  const fee = item.settlement?.fee_deducted || item.payment?.fee || 0;
                  const tax = item.settlement?.tax_deducted || item.payment?.tax || 0;
                  const net = item.settlement?.net_amount || (gross - fee - tax);

                  return (
                    <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                      {/* Payment ID & Method */}
                      <td className="px-4 py-3.5">
                        <div className="font-mono font-bold text-slate-900">
                          {item.paymentId}
                        </div>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {item.payment?.method || 'CARD'}
                          </span>
                          <span className="text-[11px] text-slate-500 truncate max-w-[120px]">
                            {item.payment?.customer_email || 'Verified Customer'}
                          </span>
                        </div>
                      </td>

                      {/* Gross Amount */}
                      <td className="px-4 py-3.5 font-bold text-slate-900 font-mono">
                        ₹{gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Fees */}
                      <td className="px-4 py-3.5 text-slate-600 font-mono">
                        <div>₹{fee.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-400">+ ₹{tax.toFixed(2)} GST</div>
                      </td>

                      {/* Net Settled */}
                      <td className="px-4 py-3.5 font-bold text-emerald-600 font-mono">
                        ₹{net.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Bank UTR */}
                      <td className="px-4 py-3.5">
                        {item.settlement?.utr ? (
                          <div>
                            <span className="font-mono text-blue-700 font-bold">
                              {item.settlement.utr}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {item.settlement.settled_at ? new Date(item.settlement.settled_at).toLocaleDateString() : 'T+2'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-600 font-mono italic">
                            Pending Bank Credit
                          </span>
                        )}
                      </td>

                      {/* ERP Invoice */}
                      <td className="px-4 py-3.5">
                        {item.invoice ? (
                          <div>
                            <span className="font-mono text-slate-700 font-semibold">
                              {item.invoice.invoice_id}
                            </span>
                            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                              {item.invoice.erp_status}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-rose-600 font-mono font-semibold">
                            MISSING_INVOICE
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="text-slate-800 font-bold">{paginatedResults.length}</span> of <span className="text-slate-800 font-bold">{filteredResults.length}</span> transactions
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-600 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 shadow-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

function FilterChip({ label, active, count, color = 'blue', onClick }) {
  const colorStyles = {
    blue: active ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
    emerald: active ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
    amber: active ? 'bg-amber-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
    cyan: active ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
    indigo: active ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
    rose: active ? 'bg-rose-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center space-x-1.5 ${colorStyles[color] || colorStyles.blue}`}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span className="text-[10px] opacity-80 font-mono">({count})</span>
      )}
    </button>
  );
}

function StatusBadge({ status }) {
  if (status === 'Perfect Match') {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" />
        <span>Perfect Match</span>
      </span>
    );
  }
  if (status?.includes('MDR')) {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <AlertTriangle className="w-3 h-3" />
        <span>MDR Variance</span>
      </span>
    );
  }
  if (status?.includes('Refund')) {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
        <RotateCcw className="w-3 h-3" />
        <span>Refund Adjusted</span>
      </span>
    );
  }
  if (status?.includes('Cutoff')) {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        <Clock className="w-3 h-3" />
        <span>Cutoff Delayed</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
      <AlertTriangle className="w-3 h-3" />
      <span>Unresolved Exception</span>
    </span>
  );
}
