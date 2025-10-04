import { NextResponse } from "next/server";
import { generateText } from "@/lib/gemini";

export async function POST(req) {
  try {
    const { query, publications } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    // Create context from publications
    const context = publications
      ?.slice(0, 5)
      .map((pub) => `Title: ${pub.title}\nSummary: ${pub.summary || "N/A"}`)
      .join("\n\n") || "No publications provided";

    const prompt = `You are an expert in NASA bioscience research. Based on the following research publications, answer this question: ${query}

Context:
${context}

Provide a detailed, scientific answer based on the research findings. If the context doesn't contain enough information, mention that and provide general knowledge about the topic.`;

    const response = await generateText(prompt);

    return NextResponse.json({
      answer: response,
      sources: publications?.slice(0, 5) || [],
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 }
    );
  }
}
