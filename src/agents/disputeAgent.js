// C:\Users\ganch\.gemini\antigravity\scratch\razorops-ai\src\agents\disputeAgent.js

/**
 * Dispute Agent
 * Mapped to Track 02 (AI Risk Manager) and general financial controller reserves.
 * Monitors chargeback claims, calculates reserve holdings, and reviews risk signals.
 */
export const disputeAgent = {
  name: 'Dispute Agent',
  role: 'Risk Assessor & Dispute Resolver',
  description: 'Tracks credit card chargebacks, assesses reserve requirements, and identifies fraud signals.',

  run: (disputes, payments) => {
    const logs = [];
    const analysis = {
      totalDisputesCount: disputes.length,
      totalDisputedAmount: 0,
      reserveHoldAmount: 0, // funds locked in nodal banks
      riskSignals: [],
      matchedDisputes: []
    };

    const addLog = (disputeId, message, level = 'info') => {
      logs.push({
        agent: 'Dispute Agent',
        paymentId: disputeId ? `Dispute ${disputeId}` : null,
        timestamp: new Date().toISOString(),
        message,
        level
      });
    };

    addLog(null, `Starting dispute audit and risk analysis. Auditing ${disputes.length} active claims.`, 'info');

    // Risk pattern variables
    const emailCounts = {};
    const methodCounts = {};

    disputes.forEach(dispute => {
      const payId = dispute.payment_id;
      const payment = payments.find(p => p.id === payId);

      addLog(dispute.id, `Processing claim ID ${dispute.id} linked to payment ${payId} (Amount: ₹${dispute.amount}).`, 'info');

      if (!payment) {
        addLog(dispute.id, `Warning: Claim linked to missing/orphan payment ID ${payId}. Investigation required.`, 'error');
        analysis.riskSignals.push({
          type: 'Orphan Dispute',
          description: `Dispute ${dispute.id} is filed against payment ${payId} which does not exist in capture logs.`,
          severity: 'high'
        });
        return;
      }

      analysis.totalDisputedAmount += dispute.amount;

      // Nodal reserve calculation
      // If status is 'under_review' or 'lost', bank holds 100% of dispute amount as reserve
      if (dispute.status === 'under_review') {
        analysis.reserveHoldAmount += dispute.amount;
        addLog(dispute.id, `Reserve locked: ₹${dispute.amount} placed on hold by nodal bank. Status: Under Review.`, 'warn');
      }

      // Fraud risk analysis: track occurrences per email and card method
      const email = payment.email;
      emailCounts[email] = (emailCounts[email] || 0) + 1;
      methodCounts[payment.method] = (methodCounts[payment.method] || 0) + 1;

      analysis.matchedDisputes.push({
        disputeId: dispute.id,
        paymentId: payId,
        amount: dispute.amount,
        status: dispute.status,
        reason: dispute.reason,
        customerEmail: email,
        paymentMethod: payment.method,
        created_at: dispute.created_at
      });
    });

    // Evaluate Risk Patterns
    Object.entries(emailCounts).forEach(([email, count]) => {
      if (count >= 2) {
        addLog(null, `Risk Flag: Email ${email} has registered ${count} disputes within this batch. High fraud risk.`, 'warn');
        analysis.riskSignals.push({
          type: 'Repeated Buyer Dispute',
          description: `Customer ${email} filed ${count} chargebacks. Potential friendly fraud or billing issue.`,
          severity: 'high',
          identifier: email
        });
      }
    });

    // High-value and fraud reason signals
    disputes.forEach(disp => {
      if (disp.amount >= 20000) {
        addLog(disp.id, `Risk Flag: Dispute ${disp.id} amount ₹${disp.amount} exceeds high-severity threshold of ₹20,000.`, 'warn');
        analysis.riskSignals.push({
          type: 'High-Value Dispute Exposure',
          description: `Dispute amount of ₹${disp.amount.toLocaleString()} on payment ${disp.payment_id} requires priority defense.`,
          severity: 'high',
          identifier: disp.payment_id
        });
      }
      if (disp.reason === 'Fraudulent charge') {
        addLog(disp.id, `Fraud Flag: Claim ${disp.id} filed under 'Fraudulent charge'. Immediate card-level block required.`, 'error');
        analysis.riskSignals.push({
          type: 'Suspected Stolen Card Fraud',
          description: `Issuer chargeback code indicates stolen card / unauthorized transaction on payment ${disp.payment_id}.`,
          severity: 'high',
          identifier: disp.payment_id
        });
      }
    });

    Object.entries(methodCounts).forEach(([method, count]) => {
      if (count > disputes.length * 0.7 && disputes.length > 2) {
        addLog(null, `Trend Flag: ${count} of disputes are concentrated on ${method} transactions.`, 'info');
      }
    });

    addLog(null, `Dispute analysis finished. Total Reserve Hold: ₹${analysis.reserveHoldAmount}. Active alerts: ${analysis.riskSignals.length}`, 'info');

    return {
      analysis,
      logs
    };
  }
};
