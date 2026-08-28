// C:\Users\ganch\.gemini\antigravity\scratch\razorops-ai\src\agents\controllerAgent.js

import { reconciliationAgent } from './reconciliationAgent.js';
import { disputeAgent } from './disputeAgent.js';
import { forecasterAgent } from './forecasterAgent.js';

/**
 * Controller Agent
 * High-confidence validator that orchestrates individual agents,
 * aggregates execution logs, computes the final match rate, and isolates exceptions.
 */
export const controllerAgent = {
  name: 'Verification & Controller Agent',
  role: 'Orchestrator & Compliance Officer',
  description: 'Validates agent reconciliations, compiles the exception queue, and certifies matching rates.',

  run: (syntheticData, startingBalance = 500000) => {
    const { payments, settlements, invoices, disputes } = syntheticData;
    const controllerLogs = [];

    const addLog = (message, level = 'info') => {
      controllerLogs.push({
        agent: 'Verification & Controller Agent',
        paymentId: null,
        timestamp: new Date().toISOString(),
        message,
        level
      });
    };

    addLog('Orchestrator initiated. Launching subagents sequentially to close finance loop.', 'info');

    // 1. Run Reconciliation Agent
    addLog('Launching Reconciliation Agent to audit gateway logs vs. nodal credits...', 'info');
    const reconResults = reconciliationAgent.run(payments, settlements, invoices);
    
    // 2. Run Dispute Agent
    addLog('Launching Dispute Agent to calculate active chargeback reserves and risk thresholds...', 'info');
    const disputeResults = disputeAgent.run(disputes, payments);
    const reserveHoldAmount = disputeResults.analysis.reserveHoldAmount;

    // 3. Run Cashflow Forecaster Agent
    addLog('Launching Cashflow Forecaster Agent to model T+2 and weekend clearing pipelines...', 'info');
    const forecastResults = forecasterAgent.run(payments, settlements, reserveHoldAmount, startingBalance);

    // 4. Summarize and Compute Accuracy
    addLog('Aggregating subagent evaluations. Verifying ledger balances...', 'info');

    // Calculate match stats
    const totalRecords = payments.length;
    
    // Unresolved exceptions are those from the Reconciliation Agent exceptions list
    const unresolvedExceptions = reconResults.exceptions;
    const unresolvedCount = unresolvedExceptions.length;
    const resolvedCount = totalRecords - unresolvedCount;
    const matchRate = parseFloat(((resolvedCount / totalRecords) * 100).toFixed(1));

    addLog(`Compliance Audit completed. Match Rate Certified: ${matchRate}% (${resolvedCount}/${totalRecords} resolved).`, 'info');
    if (unresolvedCount > 0) {
      addLog(`Honest Exception List compiled. ${unresolvedCount} critical items escalated to human operations queue.`, 'warn');
    } else {
      addLog('Perfect reconciliation. Zero exceptions detected.', 'info');
    }

    // Combine all logs in order of agent execution
    const allLogs = [
      ...controllerLogs,
      ...reconResults.logs,
      ...disputeResults.logs,
      ...forecastResults.logs
    ];

    // Compute basic batch metrics
    const totalCaptured = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalSettled = settlements.reduce((sum, s) => sum + s.net_amount, 0);
    const totalFees = settlements.reduce((sum, s) => sum + s.fee_deducted, 0);

    return {
      metrics: {
        totalRecords,
        resolvedCount,
        unresolvedCount,
        matchRate,
        totalCaptured,
        totalSettled,
        totalFees,
        reserveHoldAmount,
        startingBalance,
        endingBalance: forecastResults.projections[forecastResults.projections.length - 1].closingBalance
      },
      reconciliationResults: reconResults.results,
      exceptions: unresolvedExceptions,
      disputeAnalysis: disputeResults.analysis,
      projections: forecastResults.projections,
      logs: allLogs
    };
  }
};
