// C:\Users\ganch\.gemini\antigravity\scratch\razorops-ai\src\agents\reconciliationAgent.js

/**
 * Reconciliation Agent
 * Analyzes captured payments, matches them against Bank Settlements and ERP Invoices,
 * and isolates variances in fees, refunds, and cutoff times.
 */
export const reconciliationAgent = {
  name: 'Reconciliation Agent',
  role: 'Multi-Source Matcher & Fee Auditor',
  description: 'Validates ledger records across Razorpay, Bank Statement, and ERP ledger.',

  run: (payments, settlements, invoices) => {
    const logs = [];
    const results = [];
    const exceptions = [];

    const addLog = (paymentId, message, level = 'info') => {
      logs.push({
        agent: 'Reconciliation Agent',
        paymentId,
        timestamp: new Date().toISOString(),
        message,
        level
      });
    };

    addLog(null, `Initiating batch reconciliation for ${payments.length} records.`, 'info');

    // Create indexes for efficient lookup
    const settlementMap = {};
    settlements.forEach(s => {
      if (!s.payment_id) return;
      if (!settlementMap[s.payment_id]) {
        settlementMap[s.payment_id] = [];
      }
      settlementMap[s.payment_id].push(s);
    });

    const invoiceMap = {};
    invoices.forEach(inv => {
      if (inv.payment_id) {
        invoiceMap[inv.payment_id] = inv;
      }
    });

    payments.forEach(payment => {
      const txId = payment.id;
      const linkedSettlements = settlementMap[txId] || [];
      const invoice = invoiceMap[txId];

      addLog(txId, `Analyzing payment ${txId} of amount ₹${payment.amount} (Method: ${payment.method}).`, 'info');

      // Check ERP Invoice existence
      if (!invoice) {
        // Look for double captures or duplicates sharing same order ID
        const matchingDuplicateInvoice = invoices.find(inv => {
          // If this payment has possible_duplicate and order_id matches a payment that has an invoice
          const siblingPayment = payments.find(p => p.id !== txId && p.order_id === payment.order_id && p.id === inv.payment_id);
          return !!siblingPayment;
        });

        if (matchingDuplicateInvoice) {
          addLog(txId, `Alert: No unique ERP Invoice found for payment ${txId}. Linked to duplicate order_id: ${payment.order_id}.`, 'warn');
          exceptions.push({
            paymentId: txId,
            type: 'Duplicate Capture (Double Charge)',
            severity: 'high',
            description: `Razorpay captured two payments for Order ${payment.order_id}, but ERP only issued a single invoice ${matchingDuplicateInvoice.id}.`,
            invoiceId: matchingDuplicateInvoice.id,
            amount: payment.amount,
            resolution: 'Refund duplicate payment to customer.'
          });
          results.push({
            payment,
            invoice: null,
            settlements: linkedSettlements,
            status: 'Duplicate Capture Mismatch',
            notes: 'Duplicate capture identified for order.'
          });
          return;
        }

        addLog(txId, `Error: Missing corresponding invoice in ERP ledger for payment ID ${txId}.`, 'error');
        exceptions.push({
          paymentId: txId,
          type: 'Missing ERP Invoice',
          severity: 'high',
          description: `Captured payment of ₹${payment.amount} exists in Razorpay, but no invoice is registered in the ERP system.`,
          invoiceId: null,
          amount: payment.amount,
          resolution: 'Generate retroactive invoice in ERP or flag as orphan payment.'
        });
        results.push({
          payment,
          invoice: null,
          settlements: linkedSettlements,
          status: 'Orphan Payment (No Invoice)',
          notes: 'Missing invoice details.'
        });
        return;
      }

      // Check Invoice Amount Match
      if (invoice.amount !== payment.amount) {
        addLog(txId, `Mismatch: Payment amount ₹${payment.amount} does not match ERP Invoice amount ₹${invoice.amount} (${invoice.id}).`, 'error');
        exceptions.push({
          paymentId: txId,
          type: 'Amount Mismatch',
          severity: 'high',
          description: `ERP invoice ${invoice.id} expects ₹${invoice.amount}, but Razorpay payment capture is for ₹${payment.amount}.`,
          invoiceId: invoice.id,
          amount: Math.abs(invoice.amount - payment.amount),
          resolution: 'Verify invoice adjustments/discounts or initiate partial refund/charge request.'
        });
        results.push({
          payment,
          invoice,
          settlements: linkedSettlements,
          status: 'Invoice Amount Mismatch',
          notes: `ERP expectations (₹${invoice.amount}) deviate from capture (₹${payment.amount}).`
        });
        return;
      }

      // Check Bank Settlements
      if (linkedSettlements.length === 0) {
        // If payment is under dispute review, settlement might be delayed/held (handled by Dispute Agent),
        // but if it's not a dispute, it is a bank exception.
        if (payment.dispute_status) {
          addLog(txId, `Dispute Hold: Payment is under dispute review. Bank settlement reserve is held.`, 'warn');
          results.push({
            payment,
            invoice,
            settlements: [],
            status: 'Disputed Hold - Resolved',
            notes: 'Settlement locked under dispute reserves.'
          });
        } else {
          addLog(txId, `Error: Payment captured but no corresponding Bank Settlement / UTR record found in statement.`, 'error');
          exceptions.push({
            paymentId: txId,
            type: 'Missing Bank Settlement',
            severity: 'high',
            description: `Payment captured on ${new Date(payment.created_at).toLocaleDateString()} has not been settled by nodal bank.`,
            invoiceId: invoice.id,
            amount: payment.amount,
            resolution: 'Raise reconciliation ticket with Razorpay Nodal Bank Support.'
          });
          results.push({
            payment,
            invoice,
            settlements: [],
            status: 'Settlement Missing',
            notes: 'Awaiting bank credit / settlement log.'
          });
        }
        return;
      }

      // Check for Double Bank Settlement
      if (linkedSettlements.length > 1) {
        addLog(txId, `Warning: Multiple settlement UTRs (${linkedSettlements.map(s => s.utr).join(', ')}) mapped to payment ${txId}. Double payout error.`, 'error');
        exceptions.push({
          paymentId: txId,
          type: 'Duplicate Settlement (Double Payout)',
          severity: 'medium',
          description: `Nodal Bank issued two separate settlement records (${linkedSettlements[0].utr} and ${linkedSettlements[1].utr}) for payment ${txId}.`,
          invoiceId: invoice.id,
          amount: linkedSettlements[1].net_amount,
          resolution: 'Initiate reverse credit with nodal bank to recover duplicate settlement.'
        });
        results.push({
          payment,
          invoice,
          settlements: linkedSettlements,
          status: 'Duplicate Bank Settlement Mismatch',
          notes: `Multiple UTR credits issued: ${linkedSettlements.map(s => s.utr).join(', ')}`
        });
        return;
      }

      // Single Settlement Match Processing
      const settlement = linkedSettlements[0];

      // 1. Partial Refund Matching
      if (payment.refunded_amount && payment.refunded_amount > 0) {
        const expectedSettlementGross = payment.amount - payment.refunded_amount;
        if (settlement.gross_amount === expectedSettlementGross) {
          addLog(txId, `Match: Partial refund of ₹${payment.refunded_amount} detected. Gross settlement ₹${settlement.gross_amount} matches expectations.`, 'info');
          results.push({
            payment,
            invoice,
            settlements: linkedSettlements,
            status: 'Partial Refund Mismatch Resolved',
            notes: `Auto-reconciled: Gross captured ₹${payment.amount} minus refund ₹${payment.refunded_amount} equals settled gross ₹${settlement.gross_amount}.`
          });
          return;
        } else {
          addLog(txId, `Mismatch: Refund amount of ₹${payment.refunded_amount} does not align with gross bank settlement ₹${settlement.gross_amount}.`, 'error');
          exceptions.push({
            paymentId: txId,
            type: 'Refund Settlement Discrepancy',
            severity: 'medium',
            description: `Payment refund value (₹${payment.refunded_amount}) does not net off with bank settlement gross (₹${settlement.gross_amount}).`,
            invoiceId: invoice.id,
            amount: Math.abs(settlement.gross_amount - expectedSettlementGross),
            resolution: 'Check if refund transaction is pending settlement or double-deducted.'
          });
          results.push({
            payment,
            invoice,
            settlements: linkedSettlements,
            status: 'Refund Value Mismatch',
            notes: `Calculated gross ₹${expectedSettlementGross} vs bank gross ₹${settlement.gross_amount}.`
          });
          return;
        }
      }

      // 2. Fee & MDR Variance Check
      // Standard MDR expected: 2% of transaction + 18% GST (total fee 2.36%)
      const standardMdrRate = 0.02;
      const expectedFee = parseFloat((payment.amount * standardMdrRate * 1.18).toFixed(2));
      const feeDiff = Math.abs(settlement.fee_deducted - expectedFee);

      if (feeDiff > 0.5) { // allowance for rounding
        addLog(txId, `Variance Detected: Actual Fee charged ₹${settlement.fee_deducted} vs Standard Profile ₹${expectedFee}. Fee discrepancy: ₹${feeDiff.toFixed(2)}.`, 'warn');
        results.push({
          payment,
          invoice,
          settlements: linkedSettlements,
          status: 'MDR Fee Variance Detected',
          notes: `Expected Standard MDR ₹${expectedFee} (2% + GST). Actual MDR charged ₹${settlement.fee_deducted} (${payment.method} surcharge).`,
          variance: feeDiff
        });
        return;
      }

      // 3. Timing Cutoff Verification
      const payDate = new Date(payment.created_at);
      const settleDate = new Date(settlement.settle_date);
      const msDiff = settleDate.getTime() - payDate.getTime();
      const daysDiff = msDiff / (1000 * 60 * 60 * 24);

      // Check if Sunday transaction and settled Wednesday (cutoff lag)
      if (payDate.getUTCDay() === 0 && payDate.getUTCHours() >= 18 && daysDiff > 2.5) { // Sunday late night (past 11:30 PM IST / 6 PM UTC)
        addLog(txId, `Timing Cutoff: Late Sunday transaction settled on Wednesday (T+3). Nodal cutoff applied. Resolved.`, 'info');
        results.push({
          payment,
          invoice,
          settlements: linkedSettlements,
          status: 'Timing Cutoff Resolved',
          notes: `Sunday T+3 settlement timing lag reconciled (Cutoff passed at ${payDate.getUTCHours()}:${payDate.getUTCMinutes()}).`
        });
        return;
      }

      // Perfect Standard Match
      addLog(txId, `Match Success: Transaction successfully matched across Ledger, Gateway, and Bank UTR.`, 'info');
      results.push({
        payment,
        invoice,
        settlements: linkedSettlements,
        status: 'Perfect Match',
        notes: `Validated. UTR: ${settlement.utr}`
      });
    });

    addLog(null, `Completed reconciliation loop. Matches: ${results.filter(r => r.status === 'Perfect Match' || r.status.includes('Resolved')).length}, Exceptions: ${exceptions.length}`, 'info');

    return {
      results,
      exceptions,
      logs
    };
  }
};
