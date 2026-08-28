"""Canonical column contracts for RazorOps AI synthetic extracts.

All money fields are integer paise. Timestamps are ISO-8601 in Asia/Kolkata
with explicit offset. Agents must treat these names as the contract.
"""

from __future__ import annotations

PAYMENT_COLUMNS = [
    "payment_id",
    "order_id",
    "merchant_id",
    "invoice_id",
    "method",
    "status",
    "gross_paise",
    "expected_mdr_bps",
    "expected_fee_paise",
    "currency",
    "captured_at",
    "customer_email",
    "source_system",
]

REFUND_COLUMNS = [
    "refund_id",
    "payment_id",
    "refund_paise",
    "refunded_at",
    "status",
    "source_system",
]

SETTLEMENT_COLUMNS = [
    "utr",
    "settlement_id",
    "payment_id",
    "leg_index",
    "leg_count",
    "gross_credited_paise",
    "mdr_charged_paise",
    "net_credited_paise",
    "settled_at",
    "nodal_account",
    "status",
    "bank_narration",
    "source_system",
]

INVOICE_COLUMNS = [
    "invoice_id",
    "payment_id",
    "merchant_id",
    "invoice_paise",
    "gst_on_goods_paise",
    "status",
    "issued_at",
    "source_system",
]

CHARGEBACK_COLUMNS = [
    "chargeback_id",
    "payment_id",
    "claimed_paise",
    "reason_code",
    "reason_text",
    "filed_at",
    "status",
    "source_system",
]

LABEL_COLUMNS = [
    "payment_id",
    "scenario",
    "expected_disposition",
    "exception_code",
    "counts_as_matched",
    "notes",
]

INGEST_COLUMNS = [
    "event_id",
    "source_system",
    "event_type",
    "payload_json",
    "received_at",
]
