import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(env.process.NEXT_PUBLIC_GOOGLE_GEMINI_AI_API_KEY);

export async function generateText(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
}

export async function analyzePublication(title, abstract) {
  const prompt = `Analyze this NASA bioscience publication and extract topics, organisms, and key findings in JSON format:

Title: ${title}
Abstract: ${abstract}`;

  return await generateText(prompt);
}
