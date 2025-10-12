const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");
const { ConvexHttpClient } = require("convex/browser");

const CONVEX_URL = "https://valiant-shrimp-391.convex.cloud";

if (!CONVEX_URL) {
  console.error("❌ Error: CONVEX_URL not provided");
  console.log("\nUsage:");
  console.log("  node scripts/upload-simple.js");
  console.log("\nMake sure NEXT_PUBLIC_CONVEX_URL is set in .env.local");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function uploadCSV() {
  console.log("🚀 Starting CSV upload...\n");
  
  const csvPath = path.join(__dirname, "../public/data/publications.csv");
  
  if (!fs.existsSync(csvPath)) {
    console.error("❌ Error: CSV file not found at", csvPath);
    console.log("📁 Expected location:", csvPath);
    process.exit(1);
  }

  const csvData = fs.readFileSync(csvPath, "utf-8");

  Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      const publications = results.data.filter(
        (row) => row.Title && row.URL && row.Abstract
      );

      console.log(`📊 Found ${publications.length} valid publications\n`);

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < publications.length; i++) {
        const pub = publications[i];

        try {
          await client.mutation("publications:add", {
            title: pub.Title.trim(),
            abstract: pub.Abstract.trim(),
            authors: (pub.Authors || "").trim(),
            summary: (pub.Summary || "").trim(),
            url: pub.URL.trim(),
          });

          successCount++;
          
          // Show progress every 50 publications
          if ((i + 1) % 50 === 0) {
            console.log(`✅ Progress: ${i + 1}/${publications.length} uploaded`);
          }

        } catch (error) {
          errorCount++;
          console.error(`❌ Error uploading [${i + 1}]: ${error.message}`);
        }

        // Small delay to avoid rate limiting
        if (i < publications.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      console.log("\n" + "=".repeat(60));
      console.log("🎉 UPLOAD COMPLETE!");
      console.log("=".repeat(60));
      console.log(`✅ Successfully uploaded: ${successCount}`);
      console.log(`❌ Failed: ${errorCount}`);
      console.log(`📊 Total: ${publications.length}`);
      console.log("\n✨ All publications are now in your Convex database!");
    },
    error: (error) => {
      console.error("❌ Error parsing CSV:", error);
      process.exit(1);
    },
  });
}

uploadCSV().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
