// C:\Users\ganch\.gemini\antigravity\scratch\razorops-ai\src\agents\forecasterAgent.js

/**
 * Cashflow Forecaster Agent
 * Mapped to Track 04 (AI Finance Controller)
 * Calculates settlement timing projections, identifies weekend holiday lags,
 * and outputs daily cash availability predictions for the next 7 days.
 */
export const forecasterAgent = {
  name: 'Cashflow Forecaster Agent',
  role: 'Liquidity & Cashflow Modeler',
  description: 'Projects daily cash settlement availability, model nodal cycles, and highlights liquidity reserves.',

  run: (payments, settlements, reserveHold, startingBalance = 500000) => {
    const logs = [];
    const projections = [];

    const addLog = (message, level = 'info') => {
      logs.push({
        agent: 'Cashflow Forecaster Agent',
        paymentId: null,
        timestamp: new Date().toISOString(),
        message,
        level
      });
    };

    addLog(`Initiating forward cash flow model. Starting corporate bank balance: ₹${startingBalance.toLocaleString()}.`, 'info');
    addLog(`Deducting current active chargeback reserve holds of ₹${reserveHold.toLocaleString()} from available liquidity.`, 'warn');

    // Projection dates (Next 7 days starting from 2026-08-20, which is right after our batch settlements)
    const baseSettleDate = new Date('2026-08-19');
    
    // We will track the daily projected credits based on payments captured but not yet settled in the database
    // Let's analyze payments that are:
    // - Captured, but either don't have a settlement yet OR have settlements scheduled on or after 2026-08-20.
    const pendingPayments = payments.filter(pay => {
      // Find its settlement
      const matchingSettlement = settlements.find(s => s.payment_id === pay.id);
      if (!matchingSettlement) {
        // Unsettled/Missing, let's assume standard reconciliation or bank delay resolves it in 2-3 days
        return true;
      }
      if (matchingSettlement.status === 'on_hold') {
        return false; // Dispute locks this completely
      }
      if (!matchingSettlement.settle_date) {
        return true; // Not settled yet
      }
      const sDate = new Date(matchingSettlement.settle_date);
      return sDate.getTime() > baseSettleDate.getTime();
    });

    addLog(`Identified ${pendingPayments.length} pending or post-batch transactions awaiting settlement clearance.`, 'info');

    // Initialize projections map for the next 7 days
    const dailyCredits = {};
    for (let i = 1; i <= 7; i++) {
      const d = new Date(baseSettleDate);
      d.setDate(d.getDate() + i);
      const dStr = d.toISOString().split('T')[0];
      dailyCredits[dStr] = {
        date: dStr,
        gross: 0,
        fees: 0,
        net: 0,
        transCount: 0,
        explanation: []
      };
    }

    // Map pending payments to their estimated settlement date
    pendingPayments.forEach(pay => {
      const payDate = new Date(pay.created_at);
      let estimatedSettleDate = new Date(payDate);
      
      const dayOfWeek = payDate.getUTCDay(); // 0 = Sunday, 6 = Saturday
      const hourOfDay = payDate.getUTCHours(); // UTC hours

      // Rules for Nodal Settlement Cycles (T+2 business days)
      if (dayOfWeek === 5) { // Friday
        // Settles Tuesday (T+4 calendar days, weekend skip)
        estimatedSettleDate.setDate(payDate.getDate() + 4);
      } else if (dayOfWeek === 6) { // Saturday
        // Settles Tuesday (T+3 calendar days)
        estimatedSettleDate.setDate(payDate.getDate() + 3);
      } else if (dayOfWeek === 0) { // Sunday
        // Late cutoff check (11:30 PM IST / 6 PM UTC)
        if (hourOfDay >= 18) {
          // Roll to Tuesday cycle, settles Wednesday (T+3 calendar days)
          estimatedSettleDate.setDate(payDate.getDate() + 3);
        } else {
          // Settles Tuesday (T+2 calendar days)
          estimatedSettleDate.setDate(payDate.getDate() + 2);
        }
      } else {
        // Standard T+2
        estimatedSettleDate.setDate(payDate.getDate() + 2);
      }

      const estStr = estimatedSettleDate.toISOString().split('T')[0];

      // Check if it fits in our 7-day forecast window
      if (dailyCredits[estStr]) {
        const feeRate = pay.actual_fee / pay.amount || 0.0236; // fallback to standard fee + GST
        const fee = parseFloat((pay.amount * feeRate).toFixed(2));
        const net = parseFloat((pay.amount - fee).toFixed(2));

        dailyCredits[estStr].gross += pay.amount;
        dailyCredits[estStr].fees += fee;
        dailyCredits[estStr].net += net;
        dailyCredits[estStr].transCount += 1;

        const dayName = payDate.toLocaleDateString('en-US', { weekday: 'long' });
        if (dayOfWeek === 0 && hourOfDay >= 18) {
          dailyCredits[estStr].explanation.push(`₹${pay.amount} (Captured Late Sunday night, post 23:30 cutoff, rolled to Tuesday cycle)`);
        } else if (dayOfWeek === 6 || dayOfWeek === 0) {
          dailyCredits[estStr].explanation.push(`₹${pay.amount} (Captured ${dayName}, delayed by bank weekend lag)`);
        }
      }
    });

    // Compute cumulative balances
    let currentBalance = startingBalance - reserveHold;
    
    Object.keys(dailyCredits).sort().forEach(dateStr => {
      const dayData = dailyCredits[dateStr];
      const prevBal = currentBalance;
      currentBalance += dayData.net;
      
      const dayObj = new Date(dateStr);
      const dayName = dayObj.toLocaleDateString('en-US', { weekday: 'long' });

      // Add special messages for weekend days or specific events
      if (dayObj.getUTCDay() === 0 || dayObj.getUTCDay() === 6) {
        addLog(`${dateStr} (${dayName}): Bank holiday. Settlement credits: ₹0. Nodal pipeline deferred.`, 'info');
      } else if (dayData.net > 0) {
        addLog(`${dateStr} (${dayName}): Projected bank credit of ₹${dayData.net.toLocaleString()} net across ${dayData.transCount} transactions. UTR settlement bundle dispatched.`, 'info');
      }

      projections.push({
        date: dateStr,
        dayName,
        projectedCreditGross: dayData.gross,
        projectedFees: dayData.fees,
        projectedCreditNet: dayData.net,
        transactionCount: dayData.transCount,
        openingBalance: prevBal,
        closingBalance: currentBalance,
        explanations: dayData.explanation
      });
    });

    addLog(`Forecast finalized. Projected available liquidity in 7 days: ₹${currentBalance.toLocaleString()} (Reserves Held: ₹${reserveHold.toLocaleString()}).`, 'info');

    return {
      projections,
      logs
    };
  }
};
