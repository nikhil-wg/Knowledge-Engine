import { query } from "./_generated/server.js";
import { v } from "convex/values";

export const getKnowledgeGraph = query({
  args: {
    searchQuery: v.optional(v.string()),
    sourceTitles: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const allPublications = await ctx.db.query("publications").collect();
    
    if (!args.searchQuery) {
      return {
        publicationCount: 0,
        topicCount: 0,
        searchQuery: null,
        publications: [],
        keywords: [],
        coOccurrences: [],
      };
    }

    // FILTER publications based on user query
    const searchTerms = args.searchQuery.toLowerCase().split(/\s+/).filter(t => t.length > 3);
    
    let relevantPublications = allPublications.filter((pub) => {
      const title = (pub.Title || pub.title || "").toLowerCase();
      const abstract = (pub.Abstract || pub.abstract || "").toLowerCase();
      const summary = (pub.Summary || pub.summary || "").toLowerCase();
      const fullText = `${title} ${abstract} ${summary}`;
      
      // Match by source titles
      if (args.sourceTitles && args.sourceTitles.length > 0) {
        const titleMatch = args.sourceTitles.some((sourceTitle) => {
          const src = sourceTitle.toLowerCase();
          return fullText.includes(src.substring(0, 50)) || src.includes(title.substring(0, 50));
        });
        if (titleMatch) return true;
      }

      // Match by search keywords
      return searchTerms.some(term => fullText.includes(term));
    });

    relevantPublications = relevantPublications.slice(0, 12);

    // DYNAMIC KEYWORD EXTRACTION - Only from matched publications
    const keywordFrequency = new Map();
    const stopwords = new Set([
      "study", "studies", "research", "these", "those", "their", "there",
      "where", "which", "while", "would", "could", "should", "using",
      "based", "results", "showed", "found", "observed", "measured",
      "analysis", "significant", "effects", "during", "after", "before"
    ]);

    relevantPublications.forEach((pub) => {
      const text = `${pub.Title || pub.title || ""} ${pub.Abstract || pub.abstract || ""}`.toLowerCase();
      const words = text.match(/\b[a-z]{5,}\b/g) || [];
      
      words.forEach((word) => {
        if (!stopwords.has(word) && !searchTerms.includes(word)) {
          keywordFrequency.set(word, (keywordFrequency.get(word) || 0) + 1);
        }
      });
    });

    // Top keywords by frequency
    const topKeywords = Array.from(keywordFrequency.entries())
      .filter(([_, count]) => count >= 2) // Only keywords appearing 2+ times
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word, count]) => ({ word, count }));

    // EXTRACT CO-OCCURRENCES - Words that appear together with search terms
    const coOccurrences = extractCoOccurrences(relevantPublications, searchTerms);

    return {
      publicationCount: relevantPublications.length,
      topicCount: topKeywords.length,
      searchQuery: args.searchQuery,
      publications: relevantPublications.map((p) => ({
        title: p.Title || p.title || "Untitled",
        id: p._id,
        abstract: (p.Abstract || p.abstract || "").substring(0, 200),
      })),
      keywords: topKeywords.map(k => k.word),
      keywordCounts: topKeywords,
      coOccurrences,
      searchTerms, // Return what user searched for
    };
  },
});

// Extract words that co-occur with search terms (context-aware)
function extractCoOccurrences(publications, searchTerms) {
  const coOccurrenceMap = new Map();
  const stopwords = new Set(["study", "these", "those", "their", "where", "which"]);

  publications.forEach((pub) => {
    const text = `${pub.Title || ""} ${pub.Abstract || ""}`.toLowerCase();
    const sentences = text.split(/[.!?]+/);

    sentences.forEach((sentence) => {
      // Check if sentence contains any search term
      const hasSearchTerm = searchTerms.some(term => sentence.includes(term));
      
      if (hasSearchTerm) {
        // Extract all meaningful words from this sentence
        const words = sentence.match(/\b[a-z]{5,}\b/g) || [];
        words.forEach((word) => {
          if (!stopwords.has(word) && !searchTerms.includes(word)) {
            coOccurrenceMap.set(word, (coOccurrenceMap.get(word) || 0) + 1);
          }
        });
      }
    });
  });

  // Return top co-occurring terms
  return Array.from(coOccurrenceMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
}
