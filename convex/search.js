import { v } from "convex/values";
import { query } from "./_generated/server";

export const semanticSearch = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const publications = await ctx.db.query("publications").collect();
    
    // Simple text matching for now
    // In production, use embeddings for semantic search
    const query = args.query.toLowerCase();
    const results = publications
      .filter((pub) => {
        const searchText = `${pub.title} ${pub.summary} ${pub.topics.join(' ')}`.toLowerCase();
        return searchText.includes(query);
      })
      .slice(0, limit);
    
    return results;
  },
});

export const filterByOrganism = query({
  args: { organism: v.string() },
  handler: async (ctx, args) => {
    const publications = await ctx.db.query("publications").collect();
    return publications.filter((pub) =>
      pub.organisms.some((org) =>
        org.toLowerCase().includes(args.organism.toLowerCase())
      )
    );
  },
});
