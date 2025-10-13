// convex/testGemini.js
export const testGemini = async () => {
  const apiKey = process.env.GOOGLE_GEMINI_AI_API_KEY;
  console.log("🔑 API Key present:", !!apiKey);

  if (!apiKey) {
    return { success: false, error: "API key missing" };
  }

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // ✅ Use exact model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Say 'Hello from NASA Engine' in 3 words.";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("✅ Success:", text);
    return { success: true, message: text };
  } catch (error) {
    console.error("❌ Error:", error.message);
    return { success: false, error: error.message };
  }
};
