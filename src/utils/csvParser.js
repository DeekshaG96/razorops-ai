// C:\Users\ganch\.gemini\antigravity\scratch\razorops-ai\src\utils\csvParser.js
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Universal File Reader (CSV & Excel)
 * Parses File object into JSON rows.
 */
export async function parseFileToJSON(file) {
  const extension = file.name.split('.').pop().toLowerCase();

  if (extension === 'csv' || extension === 'txt') {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => resolve(results.data),
        error: (err) => reject(err)
      });
    });
  } else if (['xlsx', 'xls'].includes(extension)) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          resolve(json);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  } else {
    throw new Error(`Unsupported file extension: .${extension}. Please upload CSV or Excel files.`);
  }
}

/**
 * Clean and normalize column names (lowercase, remove spaces, underscores)
 */
function normalizeKey(key) {
  return String(key || '').trim().toLowerCase().replace(/[\s\-_]+/g, '_');
}

function getField(row, aliases, defaultValue = '') {
  const normalizedRow = {};
  Object.keys(row).forEach(k => {
    normalizedRow[normalizeKey(k)] = row[k];
  });

  for (const alias of aliases) {
    const key = normalizeKey(alias);
    if (normalizedRow[key] !== undefined && normalizedRow[key] !== null) {
      return normalizedRow[key];
    }
  }
  return defaultValue;
}

/**
 * Normalizes uploaded raw rows into standard Payments schema
 */
export function normalizePayments(rawRows) {
  return rawRows.map((row, index) => {
    const id = String(getField(row, ['payment_id', 'id', 'txn_id', 'transaction_id', 'pay_id'], `pay_auto_${1000 + index}`));
    const amount = parseFloat(getField(row, ['amount', 'gross_amount', 'gross', 'total'], 0)) || 0;
    const fee = parseFloat(getField(row, ['fee', 'fees', 'mdr', 'service_tax'], (amount * 0.02).toFixed(2))) || 0;
    const tax = parseFloat(getField(row, ['tax', 'gst', 'tax_amount'], (fee * 0.18).toFixed(2))) || 0;

    return {
      id,
      order_id: String(getField(row, ['order_id', 'order', 'reference_id'], `order_${7000 + index}`)),
      amount,
      currency: String(getField(row, ['currency'], 'INR')).toUpperCase(),
      fee,
      tax,
      method: String(getField(row, ['method', 'payment_method', 'type'], 'card')).toLowerCase(),
      status: String(getField(row, ['status', 'payment_status'], 'captured')).toLowerCase(),
      created_at: String(getField(row, ['created_at', 'date', 'timestamp', 'capture_time'], new Date().toISOString())),
      customer_email: String(getField(row, ['customer_email', 'email', 'customer'], `user_${index + 1}@example.com`))
    };
  });
}

/**
 * Normalizes uploaded raw rows into standard Settlements schema
 */
export function normalizeSettlements(rawRows, payments = []) {
  if (!rawRows || rawRows.length === 0) {
    // Generate derived settlements from payments if file was omitted
    return payments.map((p, idx) => {
      const gross = p.amount;
      const totalFee = parseFloat((p.fee + p.tax).toFixed(2));
      const net = parseFloat((gross - totalFee).toFixed(2));
      return {
        id: `setl_${8000 + idx}`,
        payment_id: p.id,
        utr: `UTR_AUTO_${90000 + idx}`,
        gross_amount: gross,
        fee_deducted: p.fee,
        tax_deducted: p.tax,
        net_amount: net,
        bank_status: 'CREDITED',
        settled_at: new Date(Date.now() + 86400000 * 2).toISOString()
      };
    });
  }

  return rawRows.map((row, index) => {
    const gross = parseFloat(getField(row, ['gross_amount', 'amount', 'gross'], 0)) || 0;
    const fee = parseFloat(getField(row, ['fee_deducted', 'fee', 'fees', 'mdr'], (gross * 0.02).toFixed(2))) || 0;
    const tax = parseFloat(getField(row, ['tax_deducted', 'tax', 'gst'], (fee * 0.18).toFixed(2))) || 0;
    const net = parseFloat(getField(row, ['net_amount', 'credited_amount', 'net'], (gross - (fee + tax)).toFixed(2))) || 0;

    return {
      id: String(getField(row, ['settlement_id', 'id', 'setl_id'], `setl_${8000 + index}`)),
      payment_id: String(getField(row, ['payment_id', 'id', 'txn_id', 'tx_id'], '')),
      utr: String(getField(row, ['utr', 'bank_ref', 'rrn', 'reference_no'], `UTR_${90000 + index}`)),
      gross_amount: gross,
      fee_deducted: fee,
      tax_deducted: tax,
      net_amount: net,
      bank_status: String(getField(row, ['bank_status', 'status'], 'CREDITED')).toUpperCase(),
      settled_at: String(getField(row, ['settled_at', 'date', 'credit_date', 'timestamp'], new Date().toISOString()))
    };
  });
}

/**
 * Normalizes uploaded raw rows into standard Invoices schema
 */
export function normalizeInvoices(rawRows, payments = []) {
  if (!rawRows || rawRows.length === 0) {
    // Generate derived invoices from payments if file was omitted
    return payments.map((p, idx) => ({
      invoice_id: `INV_AUTO_${5000 + idx}`,
      payment_id: p.id,
      order_id: p.order_id,
      invoice_amount: p.amount,
      erp_status: 'PAID',
      created_at: p.created_at
    }));
  }

  return rawRows.map((row, index) => ({
    invoice_id: String(getField(row, ['invoice_id', 'id', 'bill_no', 'invoice_no'], `INV_${5000 + index}`)),
    payment_id: String(getField(row, ['payment_id', 'txn_id', 'id'], '')),
    order_id: String(getField(row, ['order_id', 'order', 'reference'], '')),
    invoice_amount: parseFloat(getField(row, ['invoice_amount', 'amount', 'total'], 0)) || 0,
    erp_status: String(getField(row, ['erp_status', 'status'], 'PAID')).toUpperCase(),
    created_at: String(getField(row, ['created_at', 'date', 'timestamp'], new Date().toISOString()))
  }));
}

/**
 * Normalizes uploaded raw rows into standard Disputes schema
 */
export function normalizeDisputes(rawRows, payments = []) {
  if (!rawRows || rawRows.length === 0) {
    // Return empty list or 1-2 standard test chargebacks
    return payments.slice(0, 2).map((p, idx) => ({
      id: `disp_${300 + idx}`,
      payment_id: p.id,
      amount: p.amount,
      reason_code: 'FRAUDULENT_CARD_USE',
      status: 'under_review',
      created_at: new Date().toISOString()
    }));
  }

  return rawRows.map((row, index) => ({
    id: String(getField(row, ['dispute_id', 'id'], `disp_${300 + index}`)),
    payment_id: String(getField(row, ['payment_id', 'txn_id'], '')),
    amount: parseFloat(getField(row, ['amount', 'dispute_amount'], 0)) || 0,
    reason_code: String(getField(row, ['reason_code', 'reason', 'category'], 'CUSTOMER_DISPUTE')),
    status: String(getField(row, ['status'], 'under_review')).toLowerCase(),
    created_at: String(getField(row, ['created_at', 'date'], new Date().toISOString()))
  }));
}
