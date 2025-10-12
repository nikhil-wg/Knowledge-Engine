// lib/config.js
export const config = {
  geminiApiKey: process.env.GOOGLE_GEMINI_AI_API_KEY || process.env.GOOGLE_API_KEY,
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
};

// Validate required environment variables
if (!config.geminiApiKey) {
  console.error('❌ Missing GOOGLE_GEMINI_AI_API_KEY environment variable');
}

if (!config.convexUrl) {
  console.error('❌ Missing NEXT_PUBLIC_CONVEX_URL environment variable');
}
