#!/usr/bin/env python3
"""Generate a messy, labeled 50+ payment batch for RazorOps AI.

Reproducible with --seed (default 42). Money is integer paise.
GST on MDR is 18%, matching typical Indian PG fee invoices.

This script is the Phase 1 source of truth. Agents in Phase 2 must
consume the CSVs under generated/, not invent parallel fixtures.
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

import numpy as np
import pandas as pd

_DATA_DIR = Path(__file__).resolve().parent
if str(_DATA_DIR) not in sys.path:
    sys.path.insert(0, str(_DATA_DIR))

from schemas import (  # noqa: E402
    CHARGEBACK_COLUMNS,
    INGEST_COLUMNS,
    INVOICE_COLUMNS,
    LABEL_COLUMNS,
    PAYMENT_COLUMNS,
    REFUND_COLUMNS,
    SETTLEMENT_COLUMNS,
)

IST = ZoneInfo("Asia/Kolkata")
GST_ON_FEE = 0.18
DEFAULT_MDR_BPS = 200  # 2.00%
ACTUAL_PROMO_MDR_BPS = 180  # 1.80% charged vs 2.00% expected
CUTOFF_HOUR = 23  # 23:00 IST settlement cutoff
MERCHANT_ID = "merch_razorops_demo"
NODAL_ACCOUNT = "NODAL_HDFC_502000112233"
CURRENCY = "INR"
SOURCE = {
    "pg": "razorpay_pg",
    "bank": "nodal_bank",
    "erp": "erp_netsuite",
    "cb": "chargeback_network",
    "rf": "razorpay_refunds",
}

logger = logging.getLogger("razorops.synthetic")


@dataclass
class Counters:
    pay: int = 10000
    order: int = 20000
    inv: int = 30000
    utr: int = 40000
    refund: int = 50000
    cb: int = 60000
    settle: int = 70000
    event: int = 1

    def next_payment(self) -> str:
        self.pay += 1
        return f"pay_{self.pay}"

    def next_order(self) -> str:
        self.order += 1
        return f"order_{self.order}"

    def next_invoice(self) -> str:
        self.inv += 1
        return f"inv_{self.inv}"

    def next_utr(self) -> str:
        self.utr += 1
        return f"HDFC{self.utr:012d}"

    def next_refund(self) -> str:
        self.refund += 1
        return f"rfnd_{self.refund}"

    def next_chargeback(self) -> str:
        self.cb += 1
        return f"cb_{self.cb}"

    def next_settlement(self) -> str:
        self.settle += 1
        return f"setl_{self.settle}"

    def next_event(self) -> str:
        eid = f"evt_{self.event:05d}"
        self.event += 1
        return eid


def fee_paise(gross_paise: int, mdr_bps: int) -> int:
    """MDR + GST on fee, rounded to nearest paise at each step."""
    fee = round(gross_paise * (mdr_bps / 10_000.0))
    gst = round(fee * GST_ON_FEE)
    return fee + gst


def capture_ts(rng: Any, day: datetime, late_cutoff: bool = False) -> datetime:
    if late_cutoff:
        minute = int(rng.integers(5, 55))
        second = int(rng.integers(0, 59))
        return day.replace(hour=CUTOFF_HOUR, minute=minute, second=second, microsecond=0)
    hour = int(rng.integers(9, 21))
    minute = int(rng.integers(0, 59))
    return day.replace(hour=hour, minute=minute, second=int(rng.integers(0, 59)), microsecond=0)


def iso(ts: datetime) -> str:
    return ts.astimezone(IST).isoformat()


def settlement_cycle(captured_at: datetime, extra_days: int = 0) -> datetime:
    """T+1 from capture date, rolling to next calendar day if past 23:00 IST."""
    local = captured_at.astimezone(IST)
    base_date = local.date()
    if local.hour >= CUTOFF_HOUR:
        base_date = base_date + timedelta(days=1)
    settle_date = base_date + timedelta(days=1 + extra_days)
    return datetime(settle_date.year, settle_date.month, settle_date.day, 11, 30, 0, tzinfo=IST)


def add_payment_bundle(
    *,
    payments: list[dict],
    refunds: list[dict],
    settlements: list[dict],
    invoices: list[dict],
    chargebacks: list[dict],
    labels: list[dict],
    counters: Counters,
    rng: Any,
    day: datetime,
    gross_paise: int,
    scenario: str,
    expected_disposition: str,
    exception_code: str,
    counts_as_matched: bool,
    notes: str,
    late_cutoff: bool = False,
    extra_settle_days: int = 0,
    expected_mdr_bps: int = DEFAULT_MDR_BPS,
    charged_mdr_bps: int | None = None,
    refund_paise: int = 0,
    split_weights: tuple[float, ...] | None = None,
    skip_utr: bool = False,
    duplicate_utr: bool = False,
    erp_delta_paise: int = 0,
    invoice_status: str = "paid",
    payment_status: str = "captured",
    method: str = "upi",
    chargeback: dict | None = None,
    hold_settlement: bool = False,
    invoice_payment_id: str | None = None,
    force_payment_id: str | None = None,
    force_order_id: str | None = None,
    force_invoice_id: str | None = None,
) -> str:
    payment_id = force_payment_id or counters.next_payment()
    order_id = force_order_id or counters.next_order()
    invoice_id = force_invoice_id or counters.next_invoice()
    captured_at = capture_ts(rng, day, late_cutoff=late_cutoff)
    charged = charged_mdr_bps if charged_mdr_bps is not None else expected_mdr_bps
    expected_fee = fee_paise(gross_paise, expected_mdr_bps)
    # PG typically keeps MDR on original capture; refund reduces gross, not the fee.
    charged_fee = fee_paise(gross_paise, charged)

    payments.append(
        {
            "payment_id": payment_id,
            "order_id": order_id,
            "merchant_id": MERCHANT_ID,
            "invoice_id": invoice_id if invoice_payment_id is None else "",
            "method": method,
            "status": payment_status,
            "gross_paise": gross_paise,
            "expected_mdr_bps": expected_mdr_bps,
            "expected_fee_paise": expected_fee,
            "currency": CURRENCY,
            "captured_at": iso(captured_at),
            "customer_email": f"buyer_{payment_id[4:]}@example.in",
            "source_system": SOURCE["pg"],
        }
    )

    if refund_paise:
        refund_at = captured_at + timedelta(hours=int(rng.integers(2, 20)))
        refunds.append(
            {
                "refund_id": counters.next_refund(),
                "payment_id": payment_id,
                "refund_paise": refund_paise,
                "refunded_at": iso(refund_at),
                "status": "processed",
                "source_system": SOURCE["rf"],
            }
        )

    linked_invoice_pay = invoice_payment_id if invoice_payment_id is not None else payment_id
    if invoice_payment_id != "":
        invoices.append(
            {
                "invoice_id": invoice_id if invoice_payment_id is None else force_invoice_id or invoice_id,
                "payment_id": linked_invoice_pay,
                "merchant_id": MERCHANT_ID,
                "invoice_paise": gross_paise + erp_delta_paise,
                "gst_on_goods_paise": round((gross_paise + erp_delta_paise) * 18 / 118)
                if erp_delta_paise
                else round(gross_paise * 18 / 118),
                "status": invoice_status,
                "issued_at": iso(captured_at - timedelta(minutes=int(rng.integers(5, 90)))),
                "source_system": SOURCE["erp"],
            }
        )

    settle_at = settlement_cycle(captured_at, extra_days=extra_settle_days)
    net_base = gross_paise - refund_paise - charged_fee

    if skip_utr:
        pass
    elif hold_settlement:
        settlements.append(
            {
                "utr": "",
                "settlement_id": counters.next_settlement(),
                "payment_id": payment_id,
                "leg_index": 1,
                "leg_count": 1,
                "gross_credited_paise": 0,
                "mdr_charged_paise": 0,
                "net_credited_paise": 0,
                "settled_at": "",
                "nodal_account": NODAL_ACCOUNT,
                "status": "on_hold",
                "bank_narration": "HOLD CHARGEBACK RESERVE",
                "source_system": SOURCE["bank"],
            }
        )
    elif split_weights:
        settlement_id = counters.next_settlement()
        remaining_gross = gross_paise - refund_paise
        remaining_fee = charged_fee
        remaining_net = net_base
        n = len(split_weights)
        for i, w in enumerate(split_weights):
            last = i == n - 1
            g = remaining_gross if last else int(round((gross_paise - refund_paise) * w))
            f = remaining_fee if last else int(round(charged_fee * w))
            net = remaining_net if last else int(round(net_base * w))
            remaining_gross -= g
            remaining_fee -= f
            remaining_net -= net
            settlements.append(
                {
                    "utr": counters.next_utr(),
                    "settlement_id": settlement_id,
                    "payment_id": payment_id,
                    "leg_index": i + 1,
                    "leg_count": n,
                    "gross_credited_paise": g,
                    "mdr_charged_paise": f,
                    "net_credited_paise": net,
                    "settled_at": iso(settle_at + timedelta(hours=i * 3)),
                    "nodal_account": NODAL_ACCOUNT,
                    "status": "settled",
                    "bank_narration": f"NEFT RAZORPAY SETT SPLIT {i + 1}/{n} {captured_at.strftime('%d%b').upper()}",
                    "source_system": SOURCE["bank"],
                }
            )
    else:
        utr = counters.next_utr()
        settlements.append(
            {
                "utr": utr,
                "settlement_id": counters.next_settlement(),
                "payment_id": payment_id,
                "leg_index": 1,
                "leg_count": 1,
                "gross_credited_paise": gross_paise - refund_paise,
                "mdr_charged_paise": charged_fee,
                "net_credited_paise": net_base,
                "settled_at": iso(settle_at),
                "nodal_account": NODAL_ACCOUNT,
                "status": "settled",
                "bank_narration": f"NEFT RAZORPAY SETT {captured_at.strftime('%d%b').upper()} {payment_id[-6:]}",
                "source_system": SOURCE["bank"],
            }
        )
        if duplicate_utr:
            settlements.append(
                {
                    "utr": counters.next_utr(),
                    "settlement_id": counters.next_settlement(),
                    "payment_id": payment_id,
                    "leg_index": 1,
                    "leg_count": 1,
                    "gross_credited_paise": gross_paise - refund_paise,
                    "mdr_charged_paise": charged_fee,
                    "net_credited_paise": net_base,
                    "settled_at": iso(settle_at + timedelta(hours=2)),
                    "nodal_account": NODAL_ACCOUNT,
                    "status": "settled",
                    "bank_narration": "NEFT RAZORPAY SETT DUPLICATE RETRY",
                    "source_system": SOURCE["bank"],
                }
            )

    if chargeback:
        chargebacks.append(
            {
                "chargeback_id": counters.next_chargeback(),
                "payment_id": payment_id,
                "claimed_paise": chargeback.get("claimed_paise", gross_paise),
                "reason_code": chargeback["reason_code"],
                "reason_text": chargeback["reason_text"],
                "filed_at": iso(captured_at + timedelta(days=int(chargeback.get("lag_days", 3)))),
                "status": chargeback.get("status", "under_review"),
                "source_system": SOURCE["cb"],
            }
        )

    labels.append(
        {
            "payment_id": payment_id,
            "scenario": scenario,
            "expected_disposition": expected_disposition,
            "exception_code": exception_code,
            "counts_as_matched": counts_as_matched,
            "notes": notes,
        }
    )
    return payment_id


def build_batch(seed: int) -> dict[str, pd.DataFrame]:
    rng = np.random.default_rng(seed)

    counters = Counters()
    payments: list[dict] = []
    refunds: list[dict] = []
    settlements: list[dict] = []
    invoices: list[dict] = []
    chargebacks: list[dict] = []
    labels: list[dict] = []

    origin = datetime(2026, 8, 3, tzinfo=IST)
    methods = ["upi", "card", "netbanking", "wallet", "card"]

    def day_offset(i: int) -> datetime:
        return origin + timedelta(days=int(i % 12))

    def gross() -> int:
        return int(rng.integers(1_500, 85_000)) * 100  # ₹1,500–₹85,000

    # --- Perfect matches: 32 ---
    for i in range(32):
        add_payment_bundle(
            payments=payments,
            refunds=refunds,
            settlements=settlements,
            invoices=invoices,
            chargebacks=chargebacks,
            labels=labels,
            counters=counters,
            rng=rng,
            day=day_offset(i),
            gross_paise=gross(),
            scenario="PERFECT_MATCH",
            expected_disposition="MATCHED",
            exception_code="MATCHED",
            counts_as_matched=True,
            notes="PG, ERP, and single UTR agree on gross, MDR+GST, and T+1 cycle.",
            method=methods[i % len(methods)],
        )

    # --- Partial refunds: 8 (loop closes if refund + UTR net) ---
    for i in range(8):
        g = gross()
        r = int(round(g * float(rng.choice([0.15, 0.25, 0.40, 0.50]))))
        add_payment_bundle(
            payments=payments,
            refunds=refunds,
            settlements=settlements,
            invoices=invoices,
            chargebacks=chargebacks,
            labels=labels,
            counters=counters,
            rng=rng,
            day=day_offset(i + 2),
            gross_paise=g,
            refund_paise=r,
            payment_status="partially_refunded",
            invoice_status="partially_refunded",
            scenario="PARTIAL_REFUND",
            expected_disposition="MATCHED",
            exception_code="PARTIAL_REFUND",
            counts_as_matched=True,
            notes="Partial refund processed before payout; UTR nets capture minus refund minus MDR.",
            method="card",
        )

    # --- MDR variance 2.00% expected vs 1.80% charged: 8 ---
    for i in range(8):
        add_payment_bundle(
            payments=payments,
            refunds=refunds,
            settlements=settlements,
            invoices=invoices,
            chargebacks=chargebacks,
            labels=labels,
            counters=counters,
            rng=rng,
            day=day_offset(i + 1),
            gross_paise=gross(),
            expected_mdr_bps=DEFAULT_MDR_BPS,
            charged_mdr_bps=ACTUAL_PROMO_MDR_BPS,
            scenario="MDR_VARIANCE",
            expected_disposition="EXCEPTION",
            exception_code="MDR_VARIANCE",
            counts_as_matched=False,
            notes="Pricing sheet 200 bps; nodal fee 180 bps + GST. Cash is higher than books expected.",
            method="card",
        )

    # --- Timing / late cutoff: 8 (cash still lands; matched with cutoff note) ---
    for i in range(8):
        add_payment_bundle(
            payments=payments,
            refunds=refunds,
            settlements=settlements,
            invoices=invoices,
            chargebacks=chargebacks,
            labels=labels,
            counters=counters,
            rng=rng,
            day=day_offset(i + 4),
            gross_paise=gross(),
            late_cutoff=True,
            extra_settle_days=1,
            scenario="TIMING_CUTOFF",
            expected_disposition="MATCHED",
            exception_code="TIMING_CUTOFF",
            counts_as_matched=True,
            notes="Capture after 23:00 IST missed the cycle; T+2 cash still reconciles.",
            method="netbanking",
        )

    # --- Split settlements: 6 ---
    for i in range(6):
        add_payment_bundle(
            payments=payments,
            refunds=refunds,
            settlements=settlements,
            invoices=invoices,
            chargebacks=chargebacks,
            labels=labels,
            counters=counters,
            rng=rng,
            day=day_offset(i + 3),
            gross_paise=max(gross(), 20_000_00),
            split_weights=(0.4, 0.6),
            scenario="SPLIT_SETTLEMENT",
            expected_disposition="MATCHED",
            exception_code="SPLIT_SETTLEMENT",
            counts_as_matched=True,
            notes="One capture, two UTR legs; sum(net) equals expected net.",
            method="card",
        )

    # --- Chargeback holds: 4 ---
    reasons = [
        ("10.4", "Fraudulent / unauthorized"),
        ("13.1", "Merchandise not received"),
        ("13.3", "Not as described"),
        ("12.6", "Duplicate processing"),
    ]
    for i, (code, text) in enumerate(reasons):
        add_payment_bundle(
            payments=payments,
            refunds=refunds,
            settlements=settlements,
            invoices=invoices,
            chargebacks=chargebacks,
            labels=labels,
            counters=counters,
            rng=rng,
            day=day_offset(i),
            gross_paise=gross(),
            hold_settlement=True,
            invoice_status="disputed",
            chargeback={"reason_code": code, "reason_text": text, "lag_days": 2 + i},
            scenario="CHARGEBACK_HOLD",
            expected_disposition="EXCEPTION",
            exception_code="CHARGEBACK_HOLD",
            counts_as_matched=False,
            notes="Scheme claim filed; nodal credit on hold. Cash position must exclude this gross.",
            method="card",
        )

    # --- Missing UTR: 4 ---
    for i in range(4):
        add_payment_bundle(
            payments=payments,
            refunds=refunds,
            settlements=settlements,
            invoices=invoices,
            chargebacks=chargebacks,
            labels=labels,
            counters=counters,
            rng=rng,
            day=day_offset(i + 8),
            gross_paise=gross(),
            skip_utr=True,
            scenario="MISSING_UTR",
            expected_disposition="EXCEPTION",
            exception_code="MISSING_UTR",
            counts_as_matched=False,
            notes="Captured in PG and invoiced in ERP; no nodal credit in the batch window.",
            method=methods[i % len(methods)],
        )

    # --- ERP amount mismatch: 2 ---
    for i, delta in enumerate((5_000_00, -12_500_00)):
        add_payment_bundle(
            payments=payments,
            refunds=refunds,
            settlements=settlements,
            invoices=invoices,
            chargebacks=chargebacks,
            labels=labels,
            counters=counters,
            rng=rng,
            day=day_offset(i + 6),
            gross_paise=50_000_00,
            erp_delta_paise=delta,
            scenario="ERP_AMOUNT_MISMATCH",
            expected_disposition="EXCEPTION",
            exception_code="ERP_AMOUNT_MISMATCH",
            counts_as_matched=False,
            notes="Invoice total diverges from capture; tax-inclusive ERP vs ex-MDR PG.",
            method="upi",
        )

    # --- Duplicate UTR (not a split): 2 ---
    for i in range(2):
        add_payment_bundle(
            payments=payments,
            refunds=refunds,
            settlements=settlements,
            invoices=invoices,
            chargebacks=chargebacks,
            labels=labels,
            counters=counters,
            rng=rng,
            day=day_offset(i + 7),
            gross_paise=gross(),
            duplicate_utr=True,
            scenario="DUPLICATE_UTR",
            expected_disposition="EXCEPTION",
            exception_code="DUPLICATE_UTR",
            counts_as_matched=False,
            notes="Two full UTR credits for one capture (retry), not complementary split legs.",
            method="upi",
        )

    # --- Duplicate capture / double click: 2 payments, 1 invoice ---
    shared_order = counters.next_order()
    shared_invoice = counters.next_invoice()
    g = 12_499_00
    first_id = add_payment_bundle(
        payments=payments,
        refunds=refunds,
        settlements=settlements,
        invoices=invoices,
        chargebacks=chargebacks,
        labels=labels,
        counters=counters,
        rng=rng,
        day=day_offset(9),
        gross_paise=g,
        force_order_id=shared_order,
        force_invoice_id=shared_invoice,
        scenario="DUPLICATE_CAPTURE",
        expected_disposition="EXCEPTION",
        exception_code="DUPLICATE_CAPTURE",
        counts_as_matched=False,
        notes="Primary capture linked to the single ERP invoice; sibling pay_* shares order_id.",
        method="card",
    )
    add_payment_bundle(
        payments=payments,
        refunds=refunds,
        settlements=settlements,
        invoices=invoices,
        chargebacks=chargebacks,
        labels=labels,
        counters=counters,
        rng=rng,
        day=day_offset(9),
        gross_paise=g,
        force_order_id=shared_order,
        force_invoice_id=shared_invoice,
        invoice_payment_id="",  # suppress second invoice
        scenario="DUPLICATE_CAPTURE",
        expected_disposition="EXCEPTION",
        exception_code="DUPLICATE_CAPTURE",
        counts_as_matched=False,
        notes=f"Double-click capture; ERP only booked {first_id}. Both UTRs credited.",
        method="card",
    )

    pay_df = pd.DataFrame(payments)[PAYMENT_COLUMNS]
    refund_df = pd.DataFrame(refunds)[REFUND_COLUMNS] if refunds else pd.DataFrame(columns=REFUND_COLUMNS)
    setl_df = pd.DataFrame(settlements)[SETTLEMENT_COLUMNS]
    inv_df = pd.DataFrame(invoices)[INVOICE_COLUMNS]
    cb_df = pd.DataFrame(chargebacks)[CHARGEBACK_COLUMNS] if chargebacks else pd.DataFrame(columns=CHARGEBACK_COLUMNS)
    label_df = pd.DataFrame(labels)[LABEL_COLUMNS]

    ingest_rows: list[dict] = []
    received = datetime(2026, 8, 17, 6, 0, tzinfo=IST)

    def dump_ingest(source: str, event_type: str, row: dict) -> None:
        ingest_rows.append(
            {
                "event_id": counters.next_event(),
                "source_system": source,
                "event_type": event_type,
                "payload_json": json.dumps(row, separators=(",", ":")),
                "received_at": iso(received + timedelta(seconds=len(ingest_rows))),
            }
        )

    for row in payments:
        dump_ingest(SOURCE["pg"], "payment_capture", row)
    for row in refunds:
        dump_ingest(SOURCE["rf"], "refund", row)
    for row in settlements:
        dump_ingest(SOURCE["bank"], "nodal_utr", row)
    for row in invoices:
        dump_ingest(SOURCE["erp"], "erp_invoice", row)
    for row in chargebacks:
        dump_ingest(SOURCE["cb"], "chargeback_claim", row)

    ingest_df = pd.DataFrame(ingest_rows)[INGEST_COLUMNS]
    return {
        "payments": pay_df,
        "refunds": refund_df,
        "settlement_legs": setl_df,
        "erp_invoices": inv_df,
        "chargebacks": cb_df,
        "labels": label_df,
        "ingest_events": ingest_df,
    }


def expected_match_rate(labels: pd.DataFrame) -> float:
    return float(labels["counts_as_matched"].astype(bool).mean() * 100.0)


def write_outputs(tables: dict[str, pd.DataFrame], out_dir: Path, seed: int) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, df in tables.items():
        path = out_dir / f"{name}.csv"
        df.to_csv(path, index=False)
        logger.info("Wrote %s (%s rows)", path, len(df))

    labels = tables["labels"]
    matched = int(labels["counts_as_matched"].astype(bool).sum())
    total = int(len(labels))
    mix = labels.groupby("scenario").size().to_dict()
    mix = {str(k): int(v) for k, v in mix.items()}

    manifest = {
        "batch_id": f"synth_{seed}_2026w33",
        "seed": seed,
        "generated_at": datetime.now(tz=IST).isoformat(),
        "merchant_id": MERCHANT_ID,
        "policy": {
            "mdr_expected_bps": DEFAULT_MDR_BPS,
            "gst_on_mdr": GST_ON_FEE,
            "cutoff_hour_ist": CUTOFF_HOUR,
            "money": "integer_paise",
            "match_rate": (
                "matched_count / distinct payment_id in payments.csv; "
                "partial refunds, split UTRs that sum, and late-cutoff cash that lands count as matched; "
                "MDR variance, missing UTR, chargeback hold, ERP mismatch, duplicate capture/UTR do not"
            ),
        },
        "counts": {
            "payments": int(len(tables["payments"])),
            "refunds": int(len(tables["refunds"])),
            "settlement_legs": int(len(tables["settlement_legs"])),
            "erp_invoices": int(len(tables["erp_invoices"])),
            "chargebacks": int(len(tables["chargebacks"])),
            "ingest_events": int(len(tables["ingest_events"])),
            "labeled_payments": total,
            "ground_truth_matched": matched,
            "ground_truth_exceptions": total - matched,
            "expected_match_rate_pct": round(expected_match_rate(labels), 2),
        },
        "scenario_mix": mix,
    }
    manifest_path = out_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    logger.info("Wrote %s", manifest_path)
    return manifest_path


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate RazorOps AI synthetic finance extracts.")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument(
        "--out",
        type=Path,
        default=Path(__file__).resolve().parent / "generated",
    )
    parser.add_argument("--log-level", default="INFO")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    logging.basicConfig(
        level=getattr(logging, str(args.log_level).upper(), logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
    try:
        tables = build_batch(args.seed)
    except Exception:
        logger.exception("Synthetic generation failed")
        return 1

    n = len(tables["payments"])
    if n < 50:
        logger.error("Hard requirement failed: only %s payments generated", n)
        return 2

    write_outputs(tables, args.out, args.seed)
    rate = expected_match_rate(tables["labels"])
    logger.info(
        "Batch ready: %s payments, expected match rate %.2f%%, exceptions %s",
        n,
        rate,
        n - int(tables["labels"]["counts_as_matched"].astype(bool).sum()),
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
