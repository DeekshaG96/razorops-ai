// C:\Users\ganch\.gemini\antigravity\scratch\razorops-ai\src\data\sampleTemplates.js

/**
 * Sample CSV Templates for Real File Ingestion
 * Generates ready-to-test CSV templates representing realistic Razorpay settlements,
 * Bank UTR credit statements, and ERP accounting records.
 */

export const SAMPLE_RAZORPAY_CSV = `payment_id,order_id,amount,currency,fee,tax,method,status,created_at,customer_email
pay_1001,order_7001,4500,INR,90,16.20,upi,captured,2026-08-10T10:15:00Z,priya.sharma@example.com
pay_1002,order_7002,6200,INR,124,22.32,card,captured,2026-08-10T11:20:00Z,rahul.verma@example.com
pay_1003,order_7003,3100,INR,62,11.16,netbanking,captured,2026-08-10T12:05:00Z,ananya.iyer@example.com
pay_1004,order_7004,8900,INR,178,32.04,upi,captured,2026-08-10T14:30:00Z,vikram.singh@example.com
pay_1005,order_7005,5400,INR,108,19.44,card,captured,2026-08-10T15:45:00Z,sneha.patel@example.com
pay_1006,order_7006,7500,INR,150,27.00,upi,captured,2026-08-10T16:10:00Z,arjun.reddy@example.com
pay_1007,order_7007,2900,INR,58,10.44,card,captured,2026-08-10T17:25:00Z,kavita.nair@example.com
pay_1008,order_7008,9800,INR,196,35.28,netbanking,captured,2026-08-10T18:00:00Z,rohit.gupta@example.com
pay_1009,order_7009,4100,INR,135,24.30,card,captured,2026-08-11T09:30:00Z,deepa.menon@example.com
pay_1010,order_7010,6500,INR,130,23.40,upi,captured,2026-08-11T10:45:00Z,manish.joshi@example.com
pay_1011,order_7011,5000,INR,100,18.00,upi,captured,2026-08-11T12:00:00Z,tanvi.kulkarni@example.com
pay_1012,order_7012,8200,INR,164,29.52,card,captured,2026-08-16T21:45:00Z,aditya.bose@example.com
pay_99001122,order_9901,7500,INR,150,27.00,upi,captured,2026-08-16T22:30:00Z,karthik.s@example.com
pay_99003344,order_9902,4200,INR,84,15.12,card,captured,2026-08-12T14:20:00Z,rashmi.desai@example.com
pay_99005566,order_9903,12000,INR,240,43.20,netbanking,captured,2026-08-12T16:00:00Z,sunil.chatterjee@example.com
pay_99007788,order_9904,6800,INR,290,52.20,card,captured,2026-08-12T17:15:00Z,alok.kumar@example.com`;

export const SAMPLE_BANK_UTR_CSV = `utr,payment_id,settlement_id,gross_amount,fee_deducted,tax_deducted,net_amount,bank_status,settled_at
UTR_90001,pay_1001,setl_8001,4500,90,16.20,4393.80,CREDITED,2026-08-12T06:30:00Z
UTR_90002,pay_1002,setl_8002,6200,124,22.32,6053.68,CREDITED,2026-08-12T06:30:00Z
UTR_90003,pay_1003,setl_8003,3100,62,11.16,3026.84,CREDITED,2026-08-12T06:30:00Z
UTR_90004,pay_1004,setl_8004,8900,178,32.04,8689.96,CREDITED,2026-08-12T06:30:00Z
UTR_90005,pay_1005,setl_8005,5400,108,19.44,5272.56,CREDITED,2026-08-12T06:30:00Z
UTR_90006,pay_1006,setl_8006,7500,150,27.00,7323.00,CREDITED,2026-08-12T06:30:00Z
UTR_90007,pay_1007,setl_8007,2900,58,10.44,2831.56,CREDITED,2026-08-12T06:30:00Z
UTR_90008,pay_1008,setl_8008,9800,196,35.28,9568.72,CREDITED,2026-08-12T06:30:00Z
UTR_90009,pay_1009,setl_8009,4100,135,24.30,3940.70,CREDITED,2026-08-13T06:30:00Z
UTR_90010,pay_1010,setl_8010,6500,130,23.40,6346.60,CREDITED,2026-08-13T06:30:00Z
UTR_90011,pay_1011,setl_8011,5000,100,18.00,4882.00,CREDITED,2026-08-13T06:30:00Z
UTR_90012,pay_1012,setl_8012,8200,164,29.52,8006.48,CREDITED,2026-08-18T06:30:00Z
UTR_99991,pay_99001122,setl_9901,7500,150,27.00,7323.00,CREDITED,2026-08-19T06:30:00Z
UTR_99992,pay_99003344,setl_9902,4200,84,15.12,4100.88,CREDITED,2026-08-14T06:30:00Z
UTR_99994,pay_99007788,setl_9904,6800,290,52.20,6457.80,CREDITED,2026-08-14T06:30:00Z`;

export const SAMPLE_ERP_INVOICES_CSV = `invoice_id,payment_id,order_id,invoice_amount,erp_status,created_at
INV_5001,pay_1001,order_7001,4500,PAID,2026-08-10T10:15:00Z
INV_5002,pay_1002,order_7002,6200,PAID,2026-08-10T11:20:00Z
INV_5003,pay_1003,order_7003,3100,PAID,2026-08-10T12:05:00Z
INV_5004,pay_1004,order_7004,8900,PAID,2026-08-10T14:30:00Z
INV_5005,pay_1005,order_7005,5400,PAID,2026-08-10T15:45:00Z
INV_5006,pay_1006,order_7006,7500,PAID,2026-08-10T16:10:00Z
INV_5007,pay_1007,order_7007,2900,PAID,2026-08-10T17:25:00Z
INV_5008,pay_1008,order_7008,9800,PAID,2026-08-10T18:00:00Z
INV_5009,pay_1009,order_7009,4100,PAID,2026-08-11T09:30:00Z
INV_5010,pay_1010,order_7010,6500,PAID,2026-08-11T10:45:00Z
INV_5011,pay_1011,order_7011,5000,PAID,2026-08-11T12:00:00Z
INV_5012,pay_1012,order_7012,8200,PAID,2026-08-16T21:45:00Z
INV_9901,pay_99001122,order_9901,7500,PAID,2026-08-16T22:30:00Z
INV_9904,pay_99007788,order_9904,6800,PAID,2026-08-12T17:15:00Z`;

/**
 * Trigger immediate browser download of a sample CSV template
 */
export function downloadSampleTemplate(type) {
  let content = '';
  let filename = '';

  switch (type) {
    case 'razorpay':
      content = SAMPLE_RAZORPAY_CSV;
      filename = 'sample_razorpay_settlements.csv';
      break;
    case 'bank':
      content = SAMPLE_BANK_UTR_CSV;
      filename = 'sample_bank_utr_statement.csv';
      break;
    case 'erp':
      content = SAMPLE_ERP_INVOICES_CSV;
      filename = 'sample_erp_invoices.csv';
      break;
    default:
      return;
  }

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
