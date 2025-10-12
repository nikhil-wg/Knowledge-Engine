import { action } from "./_generated/server.js";
import { api } from "./_generated/api.js";
import { v } from "convex/values";

const apiKey = process.env.GOOGLE_GEMINI_AI_API_KEY || process.env.GOOGLE_API_KEY;

export const generateOverallInsights = action({
  args: {},
  handler: async (ctx) => {
    const publications = await ctx.runQuery(api.publications.getAll);

    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const titles = publications
      .slice(0, 50)
      .map((p) => p.title)
      .join("\n");

    const prompt = `Analyze these NASA bioscience research titles and provide:

1. Top 5 research themes
2. Top 3 scientific progress areas
3. Top 3 knowledge gaps
4. Areas of consensus vs disagreement

Titles:
${titles}

Provide structured JSON response.`;

    const result = await model.generateContent(prompt);
    const insights = result.response.text();

    return { insights, totalPublications: publications.length };
  },
});
