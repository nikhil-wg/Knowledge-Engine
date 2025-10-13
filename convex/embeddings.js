// convex/embeddings.js
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { action, internalMutation } from "./_generated/server.js";
import { internal, api } from "./_generated/api.js";
import { v } from "convex/values";

// ✅ Get API key from environment
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

// Answer question using AI
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

    const context = results
      .map((doc, i) => {
        const title = doc.metadata?.title || "Unknown Source";
        const text = doc.text || "";
        return `[Source ${i + 1}: ${title}]\n${text}`;
      })
      .join("\n\n");

    // ✅ Trim context to avoid token overflow
    const safeContext = context.length > 10000 ? context.substring(0, 10000) : context;

    // ✅ Use dynamic import (required for Convex)
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);

    // ✅ Use only model confirmed to work
    const modelNames = ["gemini-2.0-flash"];
    let answer = null;
    let lastError = null;
    let usedModel = null;

    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `Based on the following NASA bioscience research publications, answer this question: ${args.question}

Context from research papers:
${safeContext}

Instructions:
- Provide a detailed, scientific answer
- Mention specific findings and sources
- Be concise but thorough

Answer:`;

        const result = await model.generateContent(prompt);
        answer = result.response.text();
        usedModel = modelName;
        console.log(`✅ Success with model: ${modelName}`);
        break;
      } catch (error) {
        console.log(`❌ Failed with ${modelName}:`, error.message);
        lastError = error;
      }
    }

    if (!answer) {
      const sources = results
        .filter((r) => r.metadata?.publicationId)
        .map((r) => ({
          title: r.metadata?.title || "Unknown",
          url: r.metadata?.url || "",
          snippet: r.text?.substring(0, 200) || "",
        }))
        .slice(0, 5);

      return {
        question: args.question,
        answer: `I couldn't generate an answer. Error: ${lastError?.message}. Found ${sources.length} relevant publications.`,
        sources,
        error: lastError?.message,
      };
    }

    const sources = results
      .filter((r) => r.metadata?.publicationId)
      .map((r) => ({
        title: r.metadata?.title || "Unknown",
        url: r.metadata?.url || "",
        snippet: r.text?.substring(0, 200) || "",
      }))
      .slice(0, 5);

    return {
      question: args.question,
      answer,
      sources,
      modelUsed: usedModel,
    };
  },
});

// Utility to split long text
function splitTextIntoChunks(text, maxLength) {
  const chunks = [];
  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.slice(i, i + maxLength));
  }
  return chunks;
}
