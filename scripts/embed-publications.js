const { ConvexHttpClient } = require("convex/browser");

const CONVEX_URL = "";

if (!CONVEX_URL) {
  console.error("❌ Error: CONVEX_URL not provided");
  console.log("\nMake sure NEXT_PUBLIC_CONVEX_URL is set in .env.local");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function embedAllPublications() {
  console.log("🚀 Starting embedding process...\n");

  try {
    const result = await client.action("embeddings:embedAllPublications", {});

    console.log("\n" + "=".repeat(60));
    console.log("🎉 EMBEDDING COMPLETE!");
    console.log("=".repeat(60));
    console.log(`✅ Success: ${result.successCount}`);
    console.log(`❌ Errors: ${result.errorCount}`);
    console.log(`📊 Total: ${result.total}`);
    console.log("\n✨ All publications are now embedded and searchable!");
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

embedAllPublications();
