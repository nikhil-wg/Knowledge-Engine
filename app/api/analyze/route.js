import { NextResponse } from "next/server";
import { analyzePublication } from "@/lib/gemini";

export async function POST(req) {
  try {
    const { title, abstract } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const analysis = await analyzePublication(title, abstract || "");

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze publication" },
      { status: 500 }
    );
  }
}
