import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { action, internalMutation } from "./_generated/server.js";
import { internal, api } from "./_generated/api.js";
import { v } from "convex/values";
const apiKey = process.env.GOOGLE_GEMINI_AI_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("❌ Missing API key. Use GOOGLE_GEMINI_AI_API_KEY or GOOGLE_API_KEY");
}
// Internal mutation to store embeddings
export const storeEmbedding = internalMutation({
  args: {
    text: v.string(),
    embedding: v.array(v.float64()),
    metadata: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("langchain_db", {
      text: args.text,
      embedding: args.embedding,
      metadata: args.metadata,
    });
  },
});

// Embed all publications
export const embedAllPublications = action({
  args: {},
  handler: async (ctx) => {
    console.log("🚀 Starting to embed all publications...");

    const publications = await ctx.runQuery(api.publications.getAll);
    console.log(`📊 Found ${publications.length} publications to embed`);

    let successCount = 0;
    let errorCount = 0;

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey,
      model: "text-embedding-004",
      taskType: TaskType.RETRIEVAL_DOCUMENT,
    });

    for (let i = 0; i < publications.length; i++) {
      const pub = publications[i];

      try {
        const combinedText = `Title: ${pub.title}\n\nAbstract: ${pub.abstract}\n\nSummary: ${pub.summary}`;
        const chunks = splitTextIntoChunks(combinedText, 7000);

        for (const chunk of chunks) {
          const embeddingResult = await embeddings.embedQuery(chunk);

          await ctx.runMutation(internal.embeddings.storeEmbedding, {
            text: chunk,
            embedding: embeddingResult,
            metadata: {
              publicationId: pub._id,
              title: pub.title,
              url: pub.url,
            },
          });
        }

        successCount++;

        if ((i + 1) % 10 === 0) {
          console.log(`✅ Progress: ${i + 1}/${publications.length} embedded`);
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        errorCount++;
        console.error(`❌ Error embedding publication ${i + 1}:`, error.message);
      }
    }

    console.log(`\n🎉 Embedding complete! Success: ${successCount}, Errors: ${errorCount}`);
    return { successCount, errorCount, total: publications.length };
  },
});

// Search using vector similarity
export const searchPublications = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    console.log("🔍 Performing semantic search for:", args.query);

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey,
      model: "text-embedding-004",
      taskType: TaskType.RETRIEVAL_QUERY,
    });

    const queryEmbedding = await embeddings.embedQuery(args.query);

    const results = await ctx.vectorSearch("langchain_db", "byEmbedding", {
      vector: queryEmbedding,
      limit: args.limit || 10,
    });

    console.log(`✅ Found ${results.length} similar documents`);

    const uniquePublications = [];
    const seenIds = new Set();

    for (const result of results) {
      const pubId = result.metadata?.publicationId;
      if (pubId && !seenIds.has(pubId)) {
        seenIds.add(pubId);

        const publication = await ctx.runQuery(api.publications.getById, {
          id: pubId,
        });

        if (publication) {
          uniquePublications.push({
            ...publication,
            snippet: result.text.substring(0, 300),
            score: result._score,
          });
        }
      }
    }

    return uniquePublications;
  },
});
// ✅ FIXED: Use models that are actually available
export const answerQuestion = action({
  args: {
    question: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("💬 Answering question:", args.question);

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey,
      model: "text-embedding-004",
      taskType: TaskType.RETRIEVAL_QUERY,
    });

    const queryEmbedding = await embeddings.embedQuery(args.question);

    const results = await ctx.vectorSearch("langchain_db", "byEmbedding", {
      vector: queryEmbedding,
      limit: 5,
    });

    console.log(`✅ Found ${results.length} relevant documents`);

    if (results.length === 0) {
      return {
        question: args.question,
        answer: "No relevant publications found. Please ensure embeddings have been created.",
        sources: [],
      };
    }

    // Build context from results
    const context = results
      .map((doc, i) => {
        const title = doc.metadata?.title || "Unknown Source";
        const text = doc.text || "";
        return `[Source ${i + 1}: ${title}]\n${text}`;
      })
      .join("\n\n");

    console.log("Context length:", context.length);

    // ✅ FIX: Use models that are available with your API key
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const modelNames = [
      "gemini-2.0-flash",           // ✅ Available
      "gemini-2.5-flash",           // ✅ Available
      "gemini-flash-latest",        // ✅ Available
      "gemini-2.0-pro-exp",         // ✅ Available
      "gemini-pro-latest",          // ✅ Available
    ];

    let answer = null;
    let lastError = null;
    let usedModel = null;

    // Try each model until one works
    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `Based on the following NASA bioscience research publications, answer this question: ${args.question}

Context from research papers:
${context.substring(0, 30000)}

Instructions:
- Provide a detailed, scientific answer
- If you find information about inflammation or specific topics, mention which publication(s) it came from
- Provide an overview of the relevant findings
- Be specific about which sources support which claims

Answer:`;

        const result = await model.generateContent(prompt);
        answer = result.response.text();
        usedModel = modelName;
        console.log(`✅ Success with model: ${modelName}`);
        break; // Success, exit loop
      } catch (error) {
        console.log(`❌ Failed with ${modelName}:`, error.message);
        lastError = error;
        continue; // Try next model
      }
    }

    // If all models failed, return error with sources
    if (!answer) {
      console.error("All models failed. Last error:", lastError?.message);
      
      const sources = [];
      const seenIds = new Set();

      for (const doc of results) {
        const pubId = doc.metadata?.publicationId;
        if (pubId && !seenIds.has(pubId)) {
          seenIds.add(pubId);
          try {
            const pub = await ctx.runQuery(api.publications.getById, { id: pubId });
            if (pub) {
              sources.push({
                title: pub.title,
                url: pub.url,
                snippet: doc.text?.substring(0, 200) || "",
              });
            }
          } catch (err) {
            sources.push({
              title: doc.metadata?.title || "Unknown Title",
              url: doc.metadata?.url || "",
              snippet: doc.text?.substring(0, 200) || "",
            });
          }
        }
      }

      return {
        question: args.question,
        answer: `I couldn't generate an AI answer. Error: ${lastError?.message}. However, I found ${sources.length} relevant publications listed below.`,
        sources,
        error: lastError?.message,
      };
    }

    // Get sources
    const sources = [];
    const seenIds = new Set();

    for (const doc of results) {
      const pubId = doc.metadata?.publicationId;
      
      if (pubId && !seenIds.has(pubId)) {
        seenIds.add(pubId);
        
        try {
          const pub = await ctx.runQuery(api.publications.getById, { id: pubId });
          
          if (pub) {
            sources.push({
              title: pub.title || "Unknown Title",
              url: pub.url || "",
              snippet: doc.text?.substring(0, 200) || "No snippet available",
            });
          } else {
            sources.push({
              title: doc.metadata?.title || "Unknown Title",
              url: doc.metadata?.url || "",
              snippet: doc.text?.substring(0, 200) || "",
            });
          }
        } catch (error) {
          console.log("Error fetching publication:", error.message);
          sources.push({
            title: doc.metadata?.title || "Unknown Title",
            url: doc.metadata?.url || "",
            snippet: doc.text?.substring(0, 200) || "",
          });
        }
      }
    }

    return {
      question: args.question,
      answer,
      sources,
      modelUsed: usedModel, // Show which model was used
    };
  },
});
