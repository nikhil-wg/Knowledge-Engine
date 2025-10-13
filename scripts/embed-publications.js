// const { ConvexHttpClient } = require("convex/browser");

// const CONVEX_URL = "";

// if (!CONVEX_URL) {
//   console.error("❌ Error: CONVEX_URL not provided");
//   console.log("\nMake sure NEXT_PUBLIC_CONVEX_URL is set in .env.local");
//   process.exit(1);
// }

// const client = new ConvexHttpClient(CONVEX_URL);

// async function embedAllPublications() {
//   console.log("🚀 Starting embedding process...\n");

//   try {
//     const result = await client.action("embeddings:embedAllPublications", {});

//     console.log("\n" + "=".repeat(60));
//     console.log("🎉 EMBEDDING COMPLETE!");
//     console.log("=".repeat(60));
//     console.log(`✅ Success: ${result.successCount}`);
//     console.log(`❌ Errors: ${result.errorCount}`);
//     console.log(`📊 Total: ${result.total}`);
//     console.log("\n✨ All publications are now embedded and searchable!");
//   } catch (error) {
//     console.error("❌ Fatal error:", error);
//     process.exit(1);
//   }
// }

// embedAllPublications();

// scripts/test-gemini-models.js// scripts/embed-publications.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyAyPxWzR6hUyJnEvcfr7QM89zE3In9cKNM";
const genAI = new GoogleGenerativeAI(API_KEY);

const modelsToTest = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro"
];

async function testModel(modelName) {
  console.log(`\n🧪 Testing model: ${modelName}`);
  
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    
    // ✅ Define the prompt
    const prompt = "Explain how microgravity affects plant growth in 2 sentences.";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log(`✅ SUCCESS: ${modelName} → "${text.substring(0, 50)}..."`);
    return true;
  } catch (error) {
    console.log(`❌ FAILED: ${modelName} → ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log("🚀 Starting Gemini model compatibility test...\n");
  
  const results = {};
  
  for (const model of modelsToTest) {
    results[model] = await testModel(model);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log("\n✅ Final Results:");
  for (const [model, passed] of Object.entries(results)) {
    console.log(`${passed ? '🟢' : '🔴'} ${model}`);
  }
  
  const working = Object.keys(results).filter(m => results[m]);
  if (working.length > 0) {
    console.log(`\n🎉 Recommended model: ${working[0]}`);
  } else {
    console.log("\n💥 No models worked. Check your API key or API enablement.");
  }
}

runTests().catch(console.error);
