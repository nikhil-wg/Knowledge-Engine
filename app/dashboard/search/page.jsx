"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Send, Loader2, ExternalLink } from "lucide-react";

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const answerQuestion = useAction(api.embeddings.answerQuestion);
  const searchPublications = useAction(api.embeddings.searchPublications);

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const answer = await answerQuestion({ question });
      setResult(answer);
    } catch (error) {
      console.error("Error:", error);
      alert("Error answering question: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Ask Questions
        </h1>
        <p className="text-gray-600">
          Search across all NASA bioscience research publications using AI
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleAskQuestion} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Question
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="E.g., What studies discuss inflammation in space? What are the effects of microgravity on bone density?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Ask Question
              </>
            )}
          </button>
        </form>
      </div>

      {result && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-600">
              Answer
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-800 whitespace-pre-wrap">{result.answer}</p>
            </div>
          </div>

          {result.sources && result.sources.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                Sources ({result.sources.length})
              </h2>
              <div className="space-y-4">
                {result.sources.map((source, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {source.title}
                        </h3>
                        <p className="text-sm text-gray-600">{source.snippet}...</p>
                      </div>
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-purple-600 hover:text-purple-700"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
