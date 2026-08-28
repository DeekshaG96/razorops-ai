import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import uuid
from pathlib import Path

np.random.seed(42)
random.seed(42)

NUM_RECORDS = 60

def generate_synthetic_data():
    base_time = datetime(2026, 8, 23, 10, 0, 0)

    data = []
    for i in range(NUM_RECORDS):
        txn_id = f"pay_{uuid.uuid4().hex[:8]}"
        erp_inv = f"INV-{1000 + i}"
        base_amount = round(random.uniform(500, 5000), 2)

        if i < 36:
            scenario = "perfect_match"
            rzp_amount = base_amount
            mdr_fee = round(base_amount * 0.02, 2)
            settlement_amount = rzp_amount - mdr_fee
            rzp_time = base_time + timedelta(minutes=i * 10)
            bank_time = rzp_time + timedelta(hours=24)

        elif i < 44:
            scenario = "mdr_variance"
            rzp_amount = base_amount
            mdr_fee = round(base_amount * 0.02, 2)
            settlement_amount = rzp_amount - mdr_fee
            rzp_time = base_time + timedelta(minutes=i * 10)
            bank_time = rzp_time + timedelta(hours=24)

        elif i < 52:
            scenario = "timing_cutoff"
            rzp_amount = base_amount
            mdr_fee = round(base_amount * 0.02, 2)
            settlement_amount = rzp_amount - mdr_fee
            rzp_time = base_time.replace(hour=23, minute=55) + timedelta(minutes=i)
            bank_time = rzp_time + timedelta(hours=48)

        else:
            scenario = "partial_refund"
            rzp_amount = base_amount
            mdr_fee = round(base_amount * 0.02, 2)
            refund_amount = round(base_amount * 0.5, 2)
            settlement_amount = (rzp_amount - mdr_fee) - refund_amount
            rzp_time = base_time + timedelta(minutes=i * 10)
            bank_time = rzp_time + timedelta(hours=24)

        data.append({
            "scenario": scenario,
            "txn_id": txn_id,
            "erp_inv": erp_inv,
            "base_amount": base_amount,
            "rzp_amount": rzp_amount,
            "mdr_fee": mdr_fee,
            "settlement_amount": settlement_amount,
            "rzp_time": rzp_time,
            "bank_time": bank_time,
        })

    rzp_logs = pd.DataFrame([{
        "razorpay_txn_id": d["txn_id"],
        "captured_amount": d["rzp_amount"],
        "fee_deducted": d["mdr_fee"],
        "created_at": d["rzp_time"],
    } for d in data])

    bank_utrs = pd.DataFrame([{
        "utr_id": f"UTR{uuid.uuid4().hex[:10].upper()}",
        "razorpay_txn_id": d["txn_id"],
        "settled_amount": d["settlement_amount"],
        "settlement_date": d["bank_time"],
    } for d in data])

    erp_invoices = []
    for d in data:
        expected_fee = d["mdr_fee"]
        if d["scenario"] == "mdr_variance":
            expected_fee = round(d["base_amount"] * 0.018, 2)

        erp_invoices.append({
            "invoice_id": d["erp_inv"],
            "linked_txn_id": d["txn_id"],
            "invoice_amount": d["base_amount"],
            "expected_settlement": d["base_amount"] - expected_fee,
        })
    erp_df = pd.DataFrame(erp_invoices)

    return rzp_logs, bank_utrs, erp_df


if __name__ == "__main__":
    rzp_logs, bank_utrs, erp_df = generate_synthetic_data()
    print(f"Razorpay Logs: {len(rzp_logs)} records")
    print(f"Bank UTRs: {len(bank_utrs)} records")
    print(f"ERP Invoices: {len(erp_df)} records")

    out_dir = Path(__file__).resolve().parent
    rzp_logs.to_csv(out_dir / "rzp_logs.csv", index=False)
    bank_utrs.to_csv(out_dir / "bank_utrs.csv", index=False)
    erp_df.to_csv(out_dir / "erp_df.csv", index=False)
    print(f"CSVs written to {out_dir}")
