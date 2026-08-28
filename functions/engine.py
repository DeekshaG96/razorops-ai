import pandas as pd
import json
import logging
import os
from pathlib import Path
from typing import List, Dict
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("RazorOps-AI-Engine")

BACKEND_DIR = Path(__file__).resolve().parent


class ExceptionAnalysis(BaseModel):
    transaction_id: str = Field(description="The Razorpay transaction ID")
    exception_type: str = Field(
        description="One of: MDR_VARIANCE, TIMING_CUTOFF, PARTIAL_REFUND, UNKNOWN_ERROR"
    )
    root_cause: str = Field(description="Brief explanation of the discrepancy")
    recommended_action: str = Field(description="Action for the finance team")


class AIReconciliationReport(BaseModel):
    analyses: List[ExceptionAnalysis]


class FinanceControllerEngine:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    def load_data(self) -> pd.DataFrame:
        try:
            rzp_logs = pd.read_csv(BACKEND_DIR / "rzp_logs.csv")
            bank_utrs = pd.read_csv(BACKEND_DIR / "bank_utrs.csv")
            erp_df = pd.read_csv(BACKEND_DIR / "erp_df.csv")

            merged_df = rzp_logs.merge(bank_utrs, on="razorpay_txn_id", how="left")
            merged_df = merged_df.merge(
                erp_df, left_on="razorpay_txn_id", right_on="linked_txn_id", how="left"
            )
            logger.info(f"Loaded and merged {len(merged_df)} records.")
            return merged_df
        except FileNotFoundError as e:
            logger.error("Data files not found. Run generate_data.py first.")
            raise e

    def tier_1_deterministic_match(self, df: pd.DataFrame):
        logger.info("Executing Tier 1 Deterministic Matching...")
        df["is_match"] = abs(df["settled_amount"] - df["expected_settlement"]) < 0.01
        matched = df[df["is_match"]].copy()
        exceptions = df[~df["is_match"]].copy()
        logger.info(f"Tier 1 result: {len(matched)} matched, {len(exceptions)} exceptions")
        return matched, exceptions

    def tier_2_ai_agent(self, exceptions_df: pd.DataFrame) -> List[Dict]:
        if exceptions_df.empty:
            return []

        logger.info(f"Routing {len(exceptions_df)} exceptions to AI Agent...")

        cols_to_send = [
            "razorpay_txn_id", "captured_amount", "fee_deducted",
            "settled_amount", "expected_settlement", "created_at", "settlement_date",
        ]
        clean = exceptions_df[[c for c in cols_to_send if c in exceptions_df.columns]]
        records_json = clean.to_dict(orient="records")

        prompt = ChatPromptTemplate.from_messages([
            ("system", (
                "You are an expert FinTech Reconciliation AI at Razorpay. "
                "Analyze the following batch of unmatched financial transactions. "
                "Compare captured_amount, fee_deducted, settled_amount, and expected_settlement. "
                "Identify why the ERP expectation doesn't match the actual bank settlement. "
                "Classify each as MDR_VARIANCE, TIMING_CUTOFF, PARTIAL_REFUND, or UNKNOWN_ERROR."
            )),
            ("human", "Exception records:\n{records}"),
        ])

        structured_llm = self.llm.with_structured_output(AIReconciliationReport)
        chain = prompt | structured_llm

        try:
            response = chain.invoke({"records": json.dumps(records_json)})
            return [a.model_dump() for a in response.analyses]
        except Exception as e:
            logger.error(f"AI Agent Failure: {e}")
            return [
                {
                    "transaction_id": row["razorpay_txn_id"],
                    "exception_type": "AI_PROCESSING_ERROR",
                    "root_cause": "LLM unavailable or timed out",
                    "recommended_action": "Manual review required",
                }
                for _, row in exceptions_df.iterrows()
            ]

    def execute_pipeline(self) -> Dict:
        df = self.load_data()
        total_processed = len(df)

        matched_df, exceptions_df = self.tier_1_deterministic_match(df)
        match_rate = round((len(matched_df) / total_processed) * 100, 2)

        ai_exceptions_report = self.tier_2_ai_agent(exceptions_df)

        final_report = {
            "metrics": {
                "total_records_processed": total_processed,
                "successful_matches": int(len(matched_df)),
                "exceptions_flagged": int(len(exceptions_df)),
                "match_rate_percentage": match_rate,
            },
            "exception_list": ai_exceptions_report,
        }

        report_path = BACKEND_DIR / "reconciliation_report.json"
        report_path.write_text(json.dumps(final_report, indent=2))
        logger.info(f"Pipeline complete. Match Rate: {match_rate}%. Report: {report_path}")
        return final_report


if __name__ == "__main__":
    engine = FinanceControllerEngine()
    report = engine.execute_pipeline()
    print("\n--- FINAL SYSTEM REPORT ---")
    print(json.dumps(report["metrics"], indent=2))
