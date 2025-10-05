"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Loader2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
} from "lucide-react";

export default function InsightsPage() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const answerQuestion = useAction(api.embeddings.answerQuestion);

  const analyzeArea = async (type) => {
    setLoading(true);
    try {
      let question = "";

      if (type === "progress") {
        question =
          "Based on all NASA space biology research, what are the top 5 areas of significant scientific progress? List major breakthroughs with specific findings.";
      } else if (type === "gaps") {
        question =
          "Analyze the research collection and identify the top 5 most critical research gaps or understudied areas in space biology that need more investigation.";
      } else if (type === "consensus") {
        question =
          "Which research topics have reached scientific consensus vs which areas still have conflicting or contradicting results? Provide specific examples.";
      } else if (type === "actionable") {
        question =
          "As a mission planner preparing for Mars missions, what are the most actionable insights and recommendations from this research? Focus on practical countermeasures.";
      }

      const result = await answerQuestion({ question });
      setInsights({ type, data: result });
    } catch (error) {
      console.error(error);
      setInsights({
        type,
        data: {
          answer: `Error generating insights: ${error.message}`,
          sources: [],
          error: true,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Research Insights
        </h1>
        <p className="text-gray-600">
          AI-powered analysis of NASA bioscience research landscape
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => analyzeArea("progress")}
          disabled={loading}
          className="bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-lg p-6 text-left transition-colors disabled:opacity-50"
        >
          <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">
            Scientific Progress
          </h3>
          <p className="text-sm text-gray-600">
            Major breakthroughs and advances
          </p>
        </button>

        <button
          onClick={() => analyzeArea("gaps")}
          disabled={loading}
          className="bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 rounded-lg p-6 text-left transition-colors disabled:opacity-50"
        >
          <AlertTriangle className="w-8 h-8 text-orange-600 mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">Knowledge Gaps</h3>
          <p className="text-sm text-gray-600">
            Understudied areas needing research
          </p>
        </button>

        <button
          onClick={() => analyzeArea("consensus")}
          disabled={loading}
          className="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg p-6 text-left transition-colors disabled:opacity-50"
        >
          <CheckCircle className="w-8 h-8 text-blue-600 mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">
            Consensus vs Debate
          </h3>
          <p className="text-sm text-gray-600">
            Agreed findings vs conflicting results
          </p>
        </button>

        <button
          onClick={() => analyzeArea("actionable")}
          disabled={loading}
          className="bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-lg p-6 text-left transition-colors disabled:opacity-50"
        >
          <Target className="w-8 h-8 text-purple-600 mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">
            Actionable Insights
          </h3>
          <p className="text-sm text-gray-600">
            Mission planning recommendations
          </p>
        </button>
      </div>

      {loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Analyzing research landscape...</p>
        </div>
      )}

      {insights && !loading && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            {insights.type === "progress" && (
              <TrendingUp className="w-8 h-8 text-green-600" />
            )}
            {insights.type === "gaps" && (
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            )}
            {insights.type === "consensus" && (
              <CheckCircle className="w-8 h-8 text-blue-600" />
            )}
            {insights.type === "actionable" && (
              <Target className="w-8 h-8 text-purple-600" />
            )}

            <h2 className="text-2xl font-semibold capitalize">
              {insights.type === "progress" && "Scientific Progress"}
              {insights.type === "gaps" && "Knowledge Gaps"}
              {insights.type === "consensus" && "Consensus vs Debate"}
              {insights.type === "actionable" && "Actionable Insights"}
            </h2>
          </div>

          <div className="prose max-w-none">
            <p
              className={`whitespace-pre-wrap leading-relaxed ${insights.data.error ? "text-red-600" : "text-gray-800"}`}
            >
              {insights.data.answer}
            </p>
          </div>

          {insights.data.sources && insights.data.sources.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Supporting Sources:</h3>
              <div className="space-y-2">
                {insights.data.sources.map((source, idx) => (
                  <div
                    key={idx}
                    className="border-l-4 border-purple-600 pl-4 py-2 bg-gray-50 rounded-r"
                  >
                    <p className="font-medium text-sm">{source.title}</p>
                    {source.snippet && (
                      <p className="text-xs text-gray-600 mt-1">
                        {source.snippet}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!insights && !loading && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Select an analysis type above to generate insights
          </h3>
          <p className="text-gray-600">
            Click any of the four cards to analyze the research landscape from
            different perspectives.
          </p>
        </div>
      )}
    </div>
  );
}
