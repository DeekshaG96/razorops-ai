# RazorOps AI: Multi-Agent System for Dispute & Cashflow Management

A robust, Two-Tier Reconciliation Engine built for the **Razorpay AI Builder Internship 2026 (Track 4: AI Finance Controller)**.

## The Core Problem

Modern finance teams process transactions across fragmented sources (Razorpay payment logs, Nodal Bank UTRs, ERP invoices). Manual reconciliation struggles with edge cases like partial refunds, split settlements, and MDR fee variances.

## System Architecture: Deterministic First, Agentic Second

```
┌────────────────────────────────────────────────────────────────────┐
│                        DATA INGESTION                              │
│  Razorpay Logs  │  Nodal Bank UTRs  │  ERP Invoices              │
└────────┬───────────────────┬────────────────────┬─────────────────┘
         │                   │                    │
         ▼                   ▼                    ▼
┌────────────────────────────────────────────────────────────────────┐
│            TIER 1: DETERMINISTIC MATCHER (Python/Pandas)           │
│  • Exact txn_id + amount join across 3 sources                    │
│  • Float tolerance < ₹0.01 for rounding                           │
│  • Clears ~60% "happy path" instantly — zero LLM cost             │
└────────┬──────────────────────────────────────────────────────────┘
         │ Unmatched exceptions only
         ▼
┌────────────────────────────────────────────────────────────────────┐
│          TIER 2: AI RECONCILIATION AGENT (LangChain + GPT-4o)     │
│  • Structured output via Pydantic — never raw text                │
│  • Classifies: MDR_VARIANCE | TIMING_CUTOFF | PARTIAL_REFUND      │
│  • Provides root cause + recommended action                       │
│  • Fallback: AI_PROCESSING_ERROR if LLM fails (no pipeline crash) │
└────────┬──────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────────┐
│               REACT DASHBOARD (Vite + Tailwind)                   │
│  • Real-time match rate & cash position                           │
│  • Actionable exception table with color-coded badges             │
│  • One-click recommended actions for finance ops                  │
└────────────────────────────────────────────────────────────────────┘
```

### Why Two Tiers?

| Concern | Tier 1 (Code) | Tier 2 (AI) |
|---------|---------------|-------------|
| Latency | <10ms for 60 rows | ~2s per batch |
| Cost | $0 | ~$0.002 per batch |
| Accuracy | 100% on exact matches | High on fuzzy classification |
| Failure mode | Never crashes | Graceful fallback to manual review |

## Build Quality & Failure Recovery

- **Structured Outputs:** Pydantic schemas ensure the LLM returns actionable JSON, never unstructured text.
- **Failure Recovery:** If the AI agent times out or rate-limits, exceptions are flagged as `AI_PROCESSING_ERROR` and the pipeline continues.
- **Synthetic Edge Cases:** 60-record dataset with deliberate MDR variance (2.0% vs 1.8%), T+2 timing cutoffs, and 50% partial refunds.

## How to Run Locally

### 1. Backend Engine

```bash
cd backend
pip install -r requirements.txt

# Set your OpenAI API key
export OPENAI_API_KEY="sk-..."

# Generate synthetic data (60 records, 3 CSVs)
python generate_data.py

# Run the reconciliation pipeline
python engine.py
```

Output: `backend/reconciliation_report.json`

### 2. Frontend Dashboard

```bash
# From project root
npm install
npm run dev
```

Open `http://localhost:5173` to see the dashboard consuming the report.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Data Generation | Python + Pandas | Reproducible, seeded, realistic edge cases |
| Deterministic Matching | Pandas merge + float comparison | Fast, zero-cost, deterministic |
| AI Agent | LangChain + GPT-4o-mini | Structured output, cheap, fast |
| Frontend | React + Vite + Tailwind | Minimal, functional, operator-focused |
| Deployment | Docker + AWS ECS / GCP Cloud Run | Containerized, horizontally scalable |

## Project Structure

```
razorops-ai/
├── backend/
│   ├── generate_data.py      # Phase 1: Synthetic data generator
│   ├── engine.py             # Phase 2: Two-tier reconciliation engine
│   ├── requirements.txt
│   ├── rzp_logs.csv          # Generated: Razorpay capture logs
│   ├── bank_utrs.csv         # Generated: Nodal bank UTRs
│   ├── erp_df.csv            # Generated: ERP invoices
│   └── reconciliation_report.json
├── src/
│   ├── Dashboard.jsx         # Phase 3: React dashboard
│   ├── App.jsx               # Main app (existing multi-agent UI)
│   └── reconciliation_report.json
├── package.json
└── README.md
```

## Design Decisions

1. **No LLM for arithmetic.** Deterministic code handles exact matching. The AI only classifies *why* something doesn't match.
2. **Integer-friendly comparisons.** We use a ₹0.01 float tolerance rather than exact equality to handle IEEE 754 rounding.
3. **Batch-first design.** The AI receives all exceptions in one prompt, not one-by-one, minimizing API round-trips.
4. **Graceful degradation.** The system produces a report even if the LLM is completely unavailable.

---

Built by Deeksha for Razorpay AI Builder Internship 2026.
