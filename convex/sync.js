// convex/sync.js
import { mutation } from "./_generated/server.js";
import { v } from "convex/values";

export const copyAllData = mutation({
  handler: async (ctx) => {
    // Example: copy from a publications table
    const devPublications = await fetchFromDevAPI(); // You'd implement this
    for (const pub of devPublications) {
      await ctx.db.insert("publications", pub);
    }
    return { success: true, count: devPublications.length };
  },
});
