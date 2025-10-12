import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  publications: defineTable({
    title: v.string(),
    abstract: v.string(),
    authors: v.string(),
    summary: v.string(),
    url: v.string(),
  })
    .index("by_title", ["title"])
    .searchIndex("search_title", {
      searchField: "title",
    })
    .searchIndex("search_abstract", {
      searchField: "abstract",
    }),

  // LangChain vector store table (MUST be named exactly "langchain_db")
  langchain_db: defineTable({
    embedding: v.array(v.float64()),
    text: v.string(),
    metadata: v.any(),
  }).vectorIndex("byEmbedding", {
    vectorField: "embedding",
    dimensions: 768,
    filterFields: ["metadata.publicationId"],
  }),
});
