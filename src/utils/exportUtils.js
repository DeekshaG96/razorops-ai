// C:\Users\ganch\.gemini\antigravity\scratch\razorops-ai\src\utils\exportUtils.js
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

/**
 * Formats ledger items into clean exportable rows
 */
function prepareLedgerRows(results = []) {
  return results.map(item => ({
    'Payment ID': item.paymentId || '',
    'Payment Method': item.payment?.method || '',
    'Gross Amount (INR)': item.payment?.amount || 0,
    'Fee Deducted (INR)': item.settlement?.fee_deducted || item.payment?.fee || 0,
    'Tax Deducted (INR)': item.settlement?.tax_deducted || item.payment?.tax || 0,
    'Net Settled (INR)': item.settlement?.net_amount || (item.payment?.amount - (item.payment?.fee || 0) - (item.payment?.tax || 0)) || 0,
    'Bank UTR': item.settlement?.utr || 'PENDING_NODAL_CLEARING',
    'Bank Settlement Date': item.settlement?.settled_at ? new Date(item.settlement.settled_at).toLocaleDateString() : 'N/A',
    'ERP Invoice ID': item.invoice?.invoice_id || 'UNMAPPED_INVOICE',
    'Reconciliation Status': item.status || 'Unresolved Exception',
    'Audit Notes': item.notes || item.reason || ''
  }));
}

/**
 * Export Master Reconciliation Ledger to formatted Excel (.xlsx) file
 */
export function exportLedgerToExcel(results = [], metrics = {}) {
  const ledgerRows = prepareLedgerRows(results);

  // Summary statistics sheet data
  const summaryRows = [
    { 'Metric': 'Batch Audit Certified At', 'Value': new Date().toLocaleString() },
    { 'Metric': 'Total Transactions Processed', 'Value': metrics.totalRecords || results.length },
    { 'Metric': 'Certified Match Rate', 'Value': `${metrics.matchRate || 0}%` },
    { 'Metric': 'Successfully Resolved Records', 'Value': metrics.resolvedCount || 0 },
    { 'Metric': 'Unresolved Ledger Exceptions', 'Value': metrics.unresolvedCount || 0 },
    { 'Metric': 'Total Gross Captured Volume', 'Value': `INR ${metrics.totalCaptured?.toLocaleString() || 0}` },
    { 'Metric': 'Total Net Settled to Merchant', 'Value': `INR ${metrics.totalSettled?.toLocaleString() || 0}` },
    { 'Metric': 'Total Gateway MDR & GST Fees', 'Value': `INR ${metrics.totalFees?.toLocaleString() || 0}` },
    { 'Metric': 'Dispute & Chargeback Reserve Hold', 'Value': `INR ${metrics.reserveHoldAmount?.toLocaleString() || 0}` },
    { 'Metric': '7-Day Projected Ending Liquidity', 'Value': `INR ${metrics.endingBalance?.toLocaleString() || 0}` },
    { 'Metric': 'Compliance Standard', 'Value': 'Razorpay Track 4 Automated Audit Standard' }
  ];

  // Create workbook and append sheets
  const wb = XLSX.utils.book_new();

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  const wsLedger = XLSX.utils.json_to_sheet(ledgerRows);

  // Set column widths for readability
  wsSummary['!cols'] = [{ wch: 35 }, { wch: 30 }];
  wsLedger['!cols'] = [
    { wch: 18 }, // Payment ID
    { wch: 16 }, // Method
    { wch: 20 }, // Gross
    { wch: 18 }, // Fee
    { wch: 18 }, // Tax
    { wch: 18 }, // Net
    { wch: 22 }, // UTR
    { wch: 22 }, // Date
    { wch: 20 }, // Invoice
    { wch: 28 }, // Status
    { wch: 45 }  // Notes
  ];

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Executive Audit Summary');
  XLSX.utils.book_append_sheet(wb, wsLedger, 'Master Reconciled Ledger');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  XLSX.writeFile(wb, `RazorOps_Reconciliation_Audit_${timestamp}.xlsx`);
}

/**
 * Export Master Reconciliation Ledger to standard CSV file
 */
export function exportLedgerToCSV(results = []) {
  const ledgerRows = prepareLedgerRows(results);
  const csv = Papa.unparse(ledgerRows);

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  link.setAttribute('href', url);
  link.setAttribute('download', `RazorOps_Master_Ledger_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export signed resolution memo as printable format or file download
 */
export function exportAuditMemoText(memo) {
  if (!memo) return;
  const content = `================================================================================
           RAZOROPS AI — SIGNED AUDIT RESOLUTION MEMORANDUM
================================================================================
MEMO REFERENCE       : ${memo.memoId}
TIMESTAMP (UTC)      : ${memo.timestamp}
CRYPTO INTEGRITY HASH: ${memo.signatureHash}
AUDITOR STATUS       : ${memo.status}
--------------------------------------------------------------------------------
TRANSACTION CONTEXT:
Payment Identifier   : ${memo.paymentId}
Exception Category   : ${memo.reasonCode}
Variance Amount      : INR ${memo.amount}
Order Reference      : ${memo.orderId || 'N/A'}

REMEDIAL JOURNAL ENTRY:
Debit Account        : ${memo.journalEntry?.debit || 'N/A'}
Credit Account       : ${memo.journalEntry?.credit || 'N/A'}
Action Dispatch      : ${memo.actionNote || 'Dispatched to Razorpay Nodal Operations'}

DISPATCH DESTINATION : Razorpay Nodal Settlement Operations & ERP Journaling Desk
COMPLIANCE SIGN-OFF  : Certified by RazorOps Autonomous Controller Agent
================================================================================`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Audit_Memo_${memo.memoId}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
