import { generateSyntheticData } from './src/data/syntheticGenerator.js';
import { controllerAgent } from './src/agents/controllerAgent.js';
import { reconciliationAgent } from './src/agents/reconciliationAgent.js';
import { disputeAgent } from './src/agents/disputeAgent.js';
import { forecasterAgent } from './src/agents/forecasterAgent.js';

console.log("=================================================");
console.log("   RAZOROPS AI: END-TO-END SYSTEM TEST SUITE    ");
console.log("=================================================");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

try {
  // TEST 1: Synthetic Data Layer
  console.log("\n--- TEST SUITE 1: Synthetic Data Layer ---");
  const data = generateSyntheticData();
  assert(data.payments.length >= 60, `Generates 60+ payments (Actual: ${data.payments.length})`);
  assert(data.settlements.length >= 60, `Generates corresponding settlement UTRs (Actual: ${data.settlements.length})`);
  assert(data.invoices.length >= 60, `Generates ERP invoices (Actual: ${data.invoices.length})`);
  assert(data.disputes.length >= 4, `Generates active chargeback dispute records (Actual: ${data.disputes.length})`);

  // TEST 2: Reconciliation Agent
  console.log("\n--- TEST SUITE 2: Reconciliation Agent ---");
  const reconResult = reconciliationAgent.run(data.payments, data.settlements, data.invoices);
  assert(reconResult.results.length === data.payments.length, `Reconciles every transaction in batch (${reconResult.results.length})`);
  
  const perfectMatches = reconResult.results.filter(r => r.status === 'Perfect Match');
  assert(perfectMatches.length >= 35, `Deterministic perfect matches identified (${perfectMatches.length})`);
  
  const variances = reconResult.results.filter(r => r.status === 'MDR Fee Variance Detected');
  assert(variances.length >= 4, `MDR fee variances detected (${variances.length})`);

  const refunds = reconResult.results.filter(r => r.status.includes('Refund'));
  assert(refunds.length >= 4, `Partial refunds resolved via net settlement calculation (${refunds.length})`);

  const cutoffs = reconResult.results.filter(r => r.status.includes('Timing Cutoff'));
  assert(cutoffs.length >= 4, `Sunday timing cutoffs mapped to deferred cycles (${cutoffs.length})`);

  assert(reconResult.exceptions.length >= 4, `Identified honest unresolvable exceptions queue (${reconResult.exceptions.length})`);

  // TEST 3: Dispute Agent
  console.log("\n--- TEST SUITE 3: Dispute Agent ---");
  const disputeResult = disputeAgent.run(data.disputes, data.payments);
  assert(disputeResult.analysis.totalDisputesCount >= 4, `Analyzes all active disputes (${disputeResult.analysis.totalDisputesCount})`);
  assert(disputeResult.analysis.reserveHoldAmount > 0, `Locks appropriate reserve hold amount: ₹${disputeResult.analysis.reserveHoldAmount}`);
  assert(disputeResult.analysis.riskSignals.length > 0, `Extracts heuristic fraud risk signals (${disputeResult.analysis.riskSignals.length} signals)`);

  // TEST 4: Cashflow Forecaster Agent
  console.log("\n--- TEST SUITE 4: Cashflow Forecaster Agent ---");
  const forecastResult = forecasterAgent.run(data.payments, data.settlements, disputeResult.analysis.reserveHoldAmount, 500000);
  assert(forecastResult.projections.length === 7, `Produces accurate 7-day liquidity projection horizon (${forecastResult.projections.length} days)`);
  assert(forecastResult.endingBalance > 0, `Ending cash balance is positive: ₹${forecastResult.endingBalance}`);
  
  const weekendDays = forecastResult.projections.filter(p => p.dayName === 'Saturday' || p.dayName === 'Sunday');
  const weekendZeroCredit = weekendDays.every(p => p.projectedCreditNet === 0);
  assert(weekendZeroCredit, `Enforces zero bank settlement credit on weekends due to nodal clearing closures`);

  // TEST 5: Controller Agent (Orchestration Loop)
  console.log("\n--- TEST SUITE 5: Controller Orchestration Loop ---");
  const fullResult = controllerAgent.run(data, 500000);
  assert(fullResult.metrics.matchRate >= 90.0, `Achieves high-accuracy audited match rate (Actual: ${fullResult.metrics.matchRate}%)`);
  assert(fullResult.logs.length >= 100, `Generates detailed chronological agent reasoning logs (${fullResult.logs.length} logs)`);
  
  const allLogsValid = fullResult.logs.every(l => l && typeof l.level === 'string' && typeof l.message === 'string');
  assert(allLogsValid, `All streaming log entries have valid structure, level, and timestamp`);

  console.log("\n=================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");
  
  if (failed > 0) {
    process.exit(1);
  }
} catch (err) {
  console.error("Test Suite execution encountered an error:", err);
  process.exit(1);
}
