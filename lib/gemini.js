import { GoogleGenerativeAI } from "@google/generative-ai";

// Get API key
const apiKey =
  process.env.GOOGLE_GEMINI_AI_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.warn("Gemini API key not found. AI features will not work.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function generateText(prompt) {
  if (!apiKey) {
    return "AI analysis not available (API key missing)";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating text:", error);
    return "Error analyzing publication: " + error.message;
  }
}

export async function analyzePublication(title, abstract) {
  const prompt = `Analyze this NASA bioscience publication and extract topics, organisms, and key findings in JSON format:

Title: ${title}
Abstract: ${abstract}`;

  return await generateText(prompt);
}
