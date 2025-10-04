import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const add = mutation({
  args: {
    title: v.string(),
    abstract: v.string(),
    authors: v.string(),
    summary: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const publicationId = await ctx.db.insert("publications", {
      title: args.title,
      abstract: args.abstract,
      authors: args.authors,
      summary: args.summary,
      url: args.url,
    });
    return publicationId;
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("publications").collect();
  },
});

export const getById = query({
  args: { id: v.id("publications") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const searchByTitle = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("publications")
      .withSearchIndex("search_title", (q) =>
        q.search("title", args.searchTerm)
      )
      .take(20);
  },
});

export const searchByAbstract = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("publications")
      .withSearchIndex("search_abstract", (q) =>
        q.search("abstract", args.searchTerm)
      )
      .take(20);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const publications = await ctx.db.query("publications").collect();
    return {
      totalPublications: publications.length,
    };
  },
});
