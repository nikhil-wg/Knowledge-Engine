import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";

let vectorStore = null;

export async function initializeVectorStore() {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY is not set");
  }

  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    modelName: "models/embedding-001",
  });

  vectorStore = new MemoryVectorStore(embeddings);
  return vectorStore;
}

export async function addDocumentsToVectorStore(documents) {
  if (!vectorStore) {
    await initializeVectorStore();
  }

  const docs = documents.map(
    (doc) =>
      new Document({
        pageContent: `${doc.title}\n\n${doc.content}`,
        metadata: { id: doc.id, title: doc.title },
      })
  );

  await vectorStore.addDocuments(docs);
}

export async function searchSimilarPublications(query, k = 5) {
  if (!vectorStore) {
    throw new Error("Vector store not initialized");
  }

  const results = await vectorStore.similaritySearch(query, k);
  return results.map((doc) => ({
    id: doc.metadata.id,
    title: doc.metadata.title,
    content: doc.pageContent,
  }));
}

export function getVectorStore() {
  return vectorStore;
}
