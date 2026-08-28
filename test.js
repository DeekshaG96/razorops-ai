// C:\Users\ganch\.gemini\antigravity\scratch\razorops-ai\test.js
import { generateSyntheticData } from './src/data/syntheticGenerator.js';
import { controllerAgent } from './src/agents/controllerAgent.js';

try {
  console.log("Generating synthetic data...");
  const data = generateSyntheticData();
  console.log("Payments count:", data.payments.length);
  console.log("Settlements count:", data.settlements.length);
  console.log("Invoices count:", data.invoices.length);
  console.log("Disputes count:", data.disputes.length);

  console.log("Running controller agent...");
  const result = controllerAgent.run(data, 500000);
  
  console.log("Total logs generated:", result.logs.length);
  
  let undefinedCount = 0;
  result.logs.forEach((log, index) => {
    if (log === undefined || log === null) {
      console.log(`Log at index ${index} is undefined or null!`);
      undefinedCount++;
    } else if (log.level === undefined) {
      console.log(`Log level at index ${index} is undefined!`, log);
      undefinedCount++;
    }
  });

  console.log("Undefined logs count:", undefinedCount);
  console.log("Reconciliation finished successfully.");
} catch (error) {
  console.error("Error during execution:", error);
}
