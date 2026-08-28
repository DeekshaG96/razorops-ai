// C:\Users\ganch\.gemini\antigravity\scratch\razorops-ai\src\data\syntheticGenerator.js

/**
 * Generates synthetic financial datasets across 4 sources:
 * 1. Razorpay Capture Logs (Payments)
 * 2. Nodal Bank Settlements (UTRs)
 * 3. ERP Invoices
 * 4. Dispute Claims
 * 
 * Total records: 60 (40 perfect matches, 4 MDR fee variances, 4 partial refunds, 4 timing cutoffs, 4 disputes, 4 unresolved exceptions)
 */

export function generateSyntheticData() {
  const payments = [];
  const settlements = [];
  const invoices = [];
  const disputes = [];

  const baseDate = new Date('2026-08-10T10:00:00Z');
  
  // Helper to format dates
  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const addHours = (date, hours) => {
    const d = new Date(date);
    d.setHours(d.getHours() + hours);
    return d.toISOString();
  };

  let transactionCounter = 1000;
  let invoiceCounter = 5000;
  let utrCounter = 90000;
  let disputeCounter = 300;

  // 1. PERFECT MATCHES (40 records)
  // Standard 2% MDR + 18% GST on fee = 2.36% total charges. Settled Net = Gross * (1 - 0.0236)
  for (let i = 1; i <= 40; i++) {
    const txId = `pay_${transactionCounter++}`;
    const invId = `INV_${invoiceCounter++}`;
    const amount = Math.floor(Math.random() * 8000) + 2000; // 2000 to 10000
    const payDate = addDays(baseDate, Math.floor(i / 4)); // spread across days
    const payTime = addHours(payDate, 9 + (i % 8)); // business hours
    const settleDate = addDays(payTime, 2); // Standard T+2 settlement

    const feeRate = 0.02;
    const fee = parseFloat((amount * feeRate).toFixed(2));
    const gst = parseFloat((fee * 0.18).toFixed(2));
    const totalFee = parseFloat((fee + gst).toFixed(2));
    const netAmount = parseFloat((amount - totalFee).toFixed(2));

    const email = `customer_${i}@gmail.com`;
    const utr = `UTR_${utrCounter++}`;

    // Razorpay Capture Log
    payments.push({
      id: txId,
      amount,
      currency: 'INR',
      method: i % 2 === 0 ? 'card' : 'upi',
      status: 'captured',
      created_at: payTime,
      email,
      order_id: `order_${10000 + i}`,
      expected_fee: totalFee,
      actual_fee: totalFee
    });

    // ERP Invoice
    invoices.push({
      id: invId,
      customer_email: email,
      amount,
      tax_amount: parseFloat((amount * 0.18).toFixed(2)),
      status: 'Paid',
      created_at: payTime,
      payment_id: txId
    });

    // Bank Settlement
    settlements.push({
      utr,
      settle_date: settleDate,
      gross_amount: amount,
      fee_deducted: totalFee,
      net_amount: netAmount,
      payment_id: txId,
      status: 'settled'
    });
  }

  // 2. MDR FEE VARIANCES (4 records)
  // International card / special payment method. Razorpay charges 3.5% + GST. Standard model expects 2% + GST.
  const varianceMethods = ['international_card', 'amex', 'paypal', 'business_card'];
  for (let i = 1; i <= 4; i++) {
    const txId = `pay_var_${i}`;
    const invId = `INV_var_${i}`;
    const amount = 10000 + i * 5000; // 15000, 20000, 25000, 30000
    const payTime = addHours(addDays(baseDate, 3), 14);
    const settleDate = addDays(payTime, 2);
    const email = `merchant_global_${i}@foreign.com`;
    const utr = `UTR_var_${utrCounter++}`;

    const expectedFeeRate = 0.02;
    const expectedFee = parseFloat((amount * expectedFeeRate).toFixed(2));
    const expectedGst = parseFloat((expectedFee * 0.18).toFixed(2));
    const expectedTotalFee = parseFloat((expectedFee + expectedGst).toFixed(2));

    const actualFeeRate = 0.035; // 3.5%
    const actualFee = parseFloat((amount * actualFeeRate).toFixed(2));
    const actualGst = parseFloat((actualFee * 0.18).toFixed(2));
    const actualTotalFee = parseFloat((actualFee + actualGst).toFixed(2));
    const netAmount = parseFloat((amount - actualTotalFee).toFixed(2));

    payments.push({
      id: txId,
      amount,
      currency: 'INR',
      method: varianceMethods[i - 1],
      status: 'captured',
      created_at: payTime,
      email,
      order_id: `order_var_${i}`,
      expected_fee: expectedTotalFee,
      actual_fee: actualTotalFee
    });

    invoices.push({
      id: invId,
      customer_email: email,
      amount,
      tax_amount: parseFloat((amount * 0.18).toFixed(2)),
      status: 'Paid',
      created_at: payTime,
      payment_id: txId
    });

    settlements.push({
      utr,
      settle_date: settleDate,
      gross_amount: amount,
      fee_deducted: actualTotalFee,
      net_amount: netAmount,
      payment_id: txId,
      status: 'settled'
    });
  }

  // 3. PARTIAL REFUNDS (4 records)
  // Customer returned items, netting settlement.
  for (let i = 1; i <= 4; i++) {
    const txId = `pay_ref_${i}`;
    const invId = `INV_ref_${i}`;
    const amount = 8000;
    const refundAmount = i * 1500; // 1500, 3000, 4500, 6000
    const payTime = addHours(addDays(baseDate, 4), 11);
    const refundTime = addHours(addDays(payTime, 1), 10);
    const settleDate = addDays(payTime, 2);
    const email = `returnee_${i}@gmail.com`;
    const utr = `UTR_ref_${utrCounter++}`;

    const feeRate = 0.02;
    const fee = parseFloat((amount * feeRate).toFixed(2));
    const gst = parseFloat((fee * 0.18).toFixed(2));
    const totalFee = parseFloat((fee + gst).toFixed(2));
    
    // In actual gateway, refund might return standard fee proportionally, let's keep fee standard but net settled is lower by refund amount
    const netAmount = parseFloat((amount - totalFee - refundAmount).toFixed(2));

    payments.push({
      id: txId,
      amount,
      currency: 'INR',
      method: 'card',
      status: 'captured',
      created_at: payTime,
      email,
      order_id: `order_ref_${i}`,
      expected_fee: totalFee,
      actual_fee: totalFee,
      refunded_amount: refundAmount,
      refund_date: refundTime
    });

    invoices.push({
      id: invId,
      customer_email: email,
      amount,
      tax_amount: parseFloat((amount * 0.18).toFixed(2)),
      status: 'Partially_Refunded',
      created_at: payTime,
      payment_id: txId,
      refund_amount: refundAmount
    });

    settlements.push({
      utr,
      settle_date: settleDate,
      gross_amount: amount - refundAmount,
      fee_deducted: totalFee,
      net_amount: netAmount,
      payment_id: txId,
      status: 'settled'
    });
  }

  // 4. TIMING CUTOFFS (4 records)
  // Captured late Sunday (past 11:30 PM cut-off), bank settles Wednesday (T+3 effectively).
  for (let i = 1; i <= 4; i++) {
    const txId = `pay_time_${i}`;
    const invId = `INV_time_${i}`;
    const amount = 5000 + i * 1000;
    const payTime = `2026-08-16T23:48:0${i}Z`; // Sunday late night
    const settleDate = '2026-08-19'; // Wednesday settlement instead of Tuesday (since Sunday cutoff pushed it to Monday cycle, T+2 from Monday is Wednesday)
    const email = `night_shopper_${i}@gmail.com`;
    const utr = `UTR_time_${utrCounter++}`;

    const feeRate = 0.02;
    const fee = parseFloat((amount * feeRate).toFixed(2));
    const gst = parseFloat((fee * 0.18).toFixed(2));
    const totalFee = parseFloat((fee + gst).toFixed(2));
    const netAmount = parseFloat((amount - totalFee).toFixed(2));

    payments.push({
      id: txId,
      amount,
      currency: 'INR',
      method: 'netbanking',
      status: 'captured',
      created_at: payTime,
      email,
      order_id: `order_time_${i}`,
      expected_fee: totalFee,
      actual_fee: totalFee
    });

    invoices.push({
      id: invId,
      customer_email: email,
      amount,
      tax_amount: parseFloat((amount * 0.18).toFixed(2)),
      status: 'Paid',
      created_at: payTime,
      payment_id: txId
    });

    settlements.push({
      utr,
      settle_date: settleDate,
      gross_amount: amount,
      fee_deducted: totalFee,
      net_amount: netAmount,
      payment_id: txId,
      status: 'settled'
    });
  }

  // 5. CHARGEBACK DISPUTES (4 records)
  // Active disputes. Bank blocks the funds, resulting in a net settlement deduction or reserve hold.
  for (let i = 1; i <= 4; i++) {
    const txId = `pay_disp_${i}`;
    const invId = `INV_disp_${i}`;
    const amount = 10000 + i * 4000; // 14000, 18000, 22000, 26000
    const payTime = addHours(addDays(baseDate, 2), 10);
    const disputeDate = addDays(payTime, 3);
    const email = `disputer_${i}@gmail.com`;
    const disputeId = `disp_${disputeCounter++}`;

    const feeRate = 0.02;
    const fee = parseFloat((amount * feeRate).toFixed(2));
    const gst = parseFloat((fee * 0.18).toFixed(2));
    const totalFee = parseFloat((fee + gst).toFixed(2));
    // Since dispute was filed before payout or nodal bank deducted it, settlement nets to 0 or is on HOLD
    const netAmount = 0; 

    payments.push({
      id: txId,
      amount,
      currency: 'INR',
      method: 'card',
      status: 'captured',
      created_at: payTime,
      email,
      order_id: `order_disp_${i}`,
      expected_fee: totalFee,
      actual_fee: totalFee,
      dispute_status: 'under_review'
    });

    invoices.push({
      id: invId,
      customer_email: email,
      amount,
      tax_amount: parseFloat((amount * 0.18).toFixed(2)),
      status: 'Disputed',
      created_at: payTime,
      payment_id: txId
    });

    disputes.push({
      id: disputeId,
      payment_id: txId,
      amount,
      reason: i === 1 ? 'Product not received' : i === 2 ? 'Fraudulent charge' : i === 3 ? 'Duplicate charge' : 'Incorrect amount',
      status: 'under_review',
      created_at: disputeDate
    });

    // Settlement with status 'on_hold' and net 0
    settlements.push({
      utr: null,
      settle_date: null,
      gross_amount: amount,
      fee_deducted: totalFee,
      net_amount: netAmount,
      payment_id: txId,
      status: 'on_hold',
      reason: 'Dispute Hold'
    });
  }

  // 6. UNRESOLVED EXCEPTIONS (4 records)
  // Mismatches that cannot be auto-resolved by rules.
  
  // Exception 1: Missing Bank Settlement (UTR) completely
  {
    const txId = 'pay_exc_1';
    const invId = 'INV_exc_1';
    const amount = 6500;
    const payTime = addHours(addDays(baseDate, 5), 16);
    const email = 'lost_settlement@gmail.com';

    payments.push({
      id: txId,
      amount,
      currency: 'INR',
      method: 'card',
      status: 'captured',
      created_at: payTime,
      email,
      order_id: 'order_exc_1',
      expected_fee: 153.4,
      actual_fee: 153.4
    });

    invoices.push({
      id: invId,
      customer_email: email,
      amount,
      tax_amount: 1170,
      status: 'Paid',
      created_at: payTime,
      payment_id: txId
    });

    // NO entry in settlements! Missing from bank.
  }

  // Exception 2: ERP Invoice Amount Mismatch
  {
    const txId = 'pay_exc_2';
    const invId = 'INV_exc_2';
    const payAmount = 5000;
    const erpAmount = 5500; // ERP expects more
    const payTime = addHours(addDays(baseDate, 6), 12);
    const settleDate = addDays(payTime, 2);
    const email = 'mismatch_user@gmail.com';
    const utr = `UTR_exc_${utrCounter++}`;

    const feeRate = 0.02;
    const fee = parseFloat((payAmount * feeRate).toFixed(2));
    const gst = parseFloat((fee * 0.18).toFixed(2));
    const totalFee = parseFloat((fee + gst).toFixed(2));
    const netAmount = parseFloat((payAmount - totalFee).toFixed(2));

    payments.push({
      id: txId,
      amount: payAmount,
      currency: 'INR',
      method: 'upi',
      status: 'captured',
      created_at: payTime,
      email,
      order_id: 'order_exc_2',
      expected_fee: totalFee,
      actual_fee: totalFee
    });

    invoices.push({
      id: invId,
      customer_email: email,
      amount: erpAmount,
      tax_amount: 990,
      status: 'Paid',
      created_at: payTime,
      payment_id: txId
    });

    settlements.push({
      utr,
      settle_date: settleDate,
      gross_amount: payAmount,
      fee_deducted: totalFee,
      net_amount: netAmount,
      payment_id: txId,
      status: 'settled'
    });
  }

  // Exception 3: Double Bank Settlement for single Payment & ERP Invoice
  {
    const txId = 'pay_exc_3';
    const invId = 'INV_exc_3';
    const amount = 7800;
    const payTime = addHours(addDays(baseDate, 7), 15);
    const settleDate = addDays(payTime, 2);
    const email = 'double_settled@gmail.com';
    const utr1 = `UTR_exc_${utrCounter++}`;
    const utr2 = `UTR_exc_${utrCounter++}`;

    const feeRate = 0.02;
    const fee = parseFloat((amount * feeRate).toFixed(2));
    const gst = parseFloat((fee * 0.18).toFixed(2));
    const totalFee = parseFloat((fee + gst).toFixed(2));
    const netAmount = parseFloat((amount - totalFee).toFixed(2));

    payments.push({
      id: txId,
      amount,
      currency: 'INR',
      method: 'card',
      status: 'captured',
      created_at: payTime,
      email,
      order_id: 'order_exc_3',
      expected_fee: totalFee,
      actual_fee: totalFee
    });

    invoices.push({
      id: invId,
      customer_email: email,
      amount,
      tax_amount: 1404,
      status: 'Paid',
      created_at: payTime,
      payment_id: txId
    });

    // Two settlement payouts for the same payment ID (double bank credit error)
    settlements.push({
      utr: utr1,
      settle_date: settleDate,
      gross_amount: amount,
      fee_deducted: totalFee,
      net_amount: netAmount,
      payment_id: txId,
      status: 'settled'
    });

    settlements.push({
      utr: utr2,
      settle_date: settleDate,
      gross_amount: amount,
      fee_deducted: totalFee,
      net_amount: netAmount,
      payment_id: txId,
      status: 'settled',
      note: 'Duplicate UTR'
    });
  }

  // Exception 4: Duplicate Payment Captures for single ERP Invoice (Double charge)
  {
    const txId1 = 'pay_exc_4a';
    const txId2 = 'pay_exc_4b'; // customer double click
    const invId = 'INV_exc_4';
    const amount = 4500;
    const payTime1 = addHours(addDays(baseDate, 8), 10);
    const payTime2 = addHours(payTime1, 0.001); // 3 seconds later
    const settleDate = addDays(payTime1, 2);
    const email = 'double_buyer@gmail.com';
    const utr1 = `UTR_exc_${utrCounter++}`;
    const utr2 = `UTR_exc_${utrCounter++}`;

    const feeRate = 0.02;
    const fee = parseFloat((amount * feeRate).toFixed(2));
    const gst = parseFloat((fee * 0.18).toFixed(2));
    const totalFee = parseFloat((fee + gst).toFixed(2));
    const netAmount = parseFloat((amount - totalFee).toFixed(2));

    // Two captures
    payments.push({
      id: txId1,
      amount,
      currency: 'INR',
      method: 'card',
      status: 'captured',
      created_at: payTime1,
      email,
      order_id: 'order_exc_4',
      expected_fee: totalFee,
      actual_fee: totalFee
    });

    payments.push({
      id: txId2,
      amount,
      currency: 'INR',
      method: 'card',
      status: 'captured',
      created_at: payTime2,
      email,
      order_id: 'order_exc_4', // same order ID
      expected_fee: totalFee,
      actual_fee: totalFee,
      possible_duplicate: true
    });

    // Only one invoice exists in ERP
    invoices.push({
      id: invId,
      customer_email: email,
      amount,
      tax_amount: 810,
      status: 'Paid',
      created_at: payTime1,
      payment_id: txId1 // only links to first capture
    });

    // Both get settled by nodal bank
    settlements.push({
      utr: utr1,
      settle_date: settleDate,
      gross_amount: amount,
      fee_deducted: totalFee,
      net_amount: netAmount,
      payment_id: txId1,
      status: 'settled'
    });

    settlements.push({
      utr: utr2,
      settle_date: settleDate,
      gross_amount: amount,
      fee_deducted: totalFee,
      net_amount: netAmount,
      payment_id: txId2,
      status: 'settled'
    });
  }

  return { payments, settlements, invoices, disputes };
}
