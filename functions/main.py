from firebase_functions import https_fn
from firebase_admin import initialize_app, firestore
import logging
import os

# Import your existing engine
from engine import FinanceControllerEngine

# Initialize Firebase Admin
initialize_app()
db = firestore.client()

logger = logging.getLogger("RazorOps-Cloud-Function")

@https_fn.on_request(timeout_sec=300, memory=https_fn.MemoryOption.GB_1)
def trigger_reconciliation(req: https_fn.Request) -> https_fn.Response:
    """
    HTTP endpoint to trigger the AI reconciliation pipeline.
    """
    try:
        logger.info("Initializing RazorOps AI Engine...")

        # Ensure the OpenAI API key is available to the engine via environment
        if not os.environ.get("OPENAI_API_KEY"):
            logger.warning("OPENAI_API_KEY not found in environment. Make sure to set it as a Firebase secret.")

        # 1. Initialize and run the engine
        engine = FinanceControllerEngine()
        final_report = engine.execute_pipeline()

        # 2. Push the result to Firestore for the React dashboard to read
        doc_ref = db.collection("reconciliation_reports").document("latest_batch")
        # Firestore expects JSON-serializable data
        doc_ref.set(final_report)

        logger.info("Pipeline successful. Data saved to Firestore.")

        # 3. Return a success response (Enable CORS for your frontend)
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        }

        return https_fn.Response(
            response='{"status": "success", "message": "Batch processed successfully"}',
            status=200,
            headers=headers
        )

    except Exception as e:
        logger.error(f"Pipeline failed: {str(e)}")
        return https_fn.Response(
            response=f'{"status": "error", "message": "{str(e)}"}',
            status=500
        )
