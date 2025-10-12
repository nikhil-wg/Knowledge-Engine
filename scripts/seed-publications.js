const Papa = require("papaparse");
const fs = require("fs");
const path = require("path");

async function seedPublications() {
  console.log("Starting publication seeding...");
  
  const csvPath = path.join(process.cwd(), "public/data/SB_publication_PMC.csv");
  const csvData = fs.readFileSync(csvPath, "utf-8");

  Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      console.log(`Found ${results.data.length} publications in CSV`);
      
      // Save parsed data to JSON for easy access
      const jsonPath = path.join(process.cwd(), "public/data/publications.json");
      fs.writeFileSync(jsonPath, JSON.stringify(results.data, null, 2));
      
      console.log("Publications saved to publications.json");
      console.log("Next steps:");
      console.log("1. Start Convex: npm run convex");
      console.log("2. Upload data through the dashboard or API");
    },
  });
}

seedPublications().catch(console.error);
