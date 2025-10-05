"use client";

import { useState, useRef, useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Send,
  Loader2,
  ExternalLink,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  Network,
} from "lucide-react";
import { USER_ROLES, getRolePrompt } from "@/lib/prompt";
import ReactMarkdown from "react-markdown";
import dynamic from "next/dynamic";

// Dynamic import for ForceGraph to avoid SSR issues
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

export default function SearchPage() {
  const [question, setQuestion] = useState("");
  const [selectedRole, setSelectedRole] = useState("general");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchContext, setSearchContext] = useState(null);
  const messagesEndRef = useRef(null);

  const answerQuestion = useAction(api.embeddings.answerQuestion);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        type: "question",
        text: question,
        role: selectedRole,
      },
    ]);

    const currentQuestion = question;
    setQuestion("");
    setIsLoading(true);

    try {
      const enhancedQuestion = getRolePrompt(selectedRole, currentQuestion);
      const answer = await answerQuestion({ question: enhancedQuestion });

      setSearchContext({
        query: currentQuestion,
        results: answer,
        sources: answer.sources || [],
      });

      setMessages((prev) => [
        ...prev,
        {
          type: "answer",
          data: answer,
          role: selectedRole,
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "answer",
          data: {
            answer: `Error: ${error.message}`,
            sources: [],
            error: true,
          },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (type) => {
    if (type === "knowledge-graph") {
      setMessages((prev) => [
        ...prev,
        {
          type: "knowledge-graph",
          searchContext: searchContext,
        },
      ]);
      return;
    }

    let questionText = "";

    if (type === "progress") {
      questionText = searchContext
        ? `Based on my search about "${searchContext.query}", what scientific progress has been made in this area?`
        : "What are the top 5 areas of significant scientific progress in NASA space biology research?";
    } else if (type === "gaps") {
      questionText = searchContext
        ? `What research gaps exist related to "${searchContext.query}"?`
        : "What are the most critical research gaps in space biology?";
    } else if (type === "consensus") {
      questionText = searchContext
        ? `What is the scientific consensus vs debate regarding "${searchContext.query}"?`
        : "Which research areas have scientific consensus vs conflicting results?";
    } else if (type === "actionable") {
      questionText = searchContext
        ? `What actionable insights can mission planners use related to "${searchContext.query}"?`
        : "What are the most actionable insights for Mars mission planners?";
    }

    setQuestion(questionText);
    setTimeout(() => {
      handleAskQuestion({ preventDefault: () => {} });
    }, 100);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Space Biology Knowledge Engine{" "}
            </h1>
            <p className="text-gray-600">
              Search across NASA bioscience publications with role-specific
              insights
            </p>
          </div>

          {!hasMessages && !isLoading && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <form onSubmit={handleAskQuestion} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Your Role
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {USER_ROLES.map((role) => (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setSelectedRole(role.id)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            selectedRole === role.id
                              ? "border-purple-600 bg-purple-50"
                              : "border-gray-200 hover:border-purple-300"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{role.icon}</span>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {role.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {role.description}
                              </p>
                            </div>
                            {selectedRole === role.id && (
                              <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Question
                    </label>
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="E.g., What are the mechanisms of bone loss in microgravity?"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px] text-gray-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!question.trim()}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                    Ask Question
                  </button>
                </form>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Role-Based Search Examples
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Scientist
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Find contradicting studies</li>
                      <li>• Explore mechanisms</li>
                      <li>• Generate hypotheses</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Mission Planner
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Risk assessments</li>
                      <li>• Countermeasures</li>
                      <li>• Safety protocols</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Funding Manager
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Research gaps</li>
                      <li>• Investment opportunities</li>
                      <li>• Consensus areas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {messages.map((message, idx) => (
            <MessageComponent
              key={idx}
              message={message}
              searchContext={searchContext}
            />
          ))}

          {isLoading && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                <p className="text-gray-700">Analyzing research...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {hasMessages && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-5xl mx-auto p-3 space-y-2">
            {searchContext && (
              <div className="text-xs text-gray-700 bg-purple-50 rounded px-3 py-1 inline-block">
                Context:{" "}
                <strong className="text-gray-900">{searchContext.query}</strong>
              </div>
            )}

            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => handleQuickAction("progress")}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-xs font-medium text-green-700 whitespace-nowrap disabled:opacity-50 transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                Progress
              </button>
              <button
                onClick={() => handleQuickAction("gaps")}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg text-xs font-medium text-orange-700 whitespace-nowrap disabled:opacity-50 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                Gaps
              </button>
              <button
                onClick={() => handleQuickAction("consensus")}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-medium text-blue-700 whitespace-nowrap disabled:opacity-50 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Consensus
              </button>
              <button
                onClick={() => handleQuickAction("actionable")}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-medium text-purple-700 whitespace-nowrap disabled:opacity-50 transition-colors"
              >
                <Target className="w-4 h-4" />
                Insights
              </button>
              <button
                onClick={() => handleQuickAction("knowledge-graph")}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-lg text-xs font-medium text-pink-700 whitespace-nowrap disabled:opacity-50 transition-colors"
              >
                <Network className="w-4 h-4" />
                Knowledge Graph
              </button>
            </div>

            <form onSubmit={handleAskQuestion} className="flex gap-3">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={
                  searchContext
                    ? `Ask more about "${searchContext.query}"...`
                    : "Ask another question..."
                }
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !question.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function KnowledgeGraphVisualization({ data, expanded = false }) {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const fgRef = useRef();

  useEffect(() => {
    if (!data || !data.publications || !data.keywords) return;

    const nodes = [];
    const links = [];
    const linkStrength = new Map();

    // 1. CENTER: User's Search Query
    nodes.push({
      id: "query",
      name:
        data.searchQuery.length > 35
          ? data.searchQuery.substring(0, 35) + "..."
          : data.searchQuery,
      fullName: data.searchQuery,
      type: "query",
      val: 20,
    });

    // 2. Publications
    data.publications.forEach((pub, idx) => {
      const pubId = `pub_${idx}`;
      nodes.push({
        id: pubId,
        name: pub.title.substring(0, 30) + "...",
        fullName: pub.title,
        abstract: pub.abstract,
        type: "publication",
        val: 11,
      });

      links.push({
        source: "query",
        target: pubId,
        value: 3,
      });
    });

    // 3. Keywords
    const keywordsToShow = data.keywords.slice(0, 12);
    keywordsToShow.forEach((keyword, idx) => {
      const topicId = `topic_${idx}`;
      nodes.push({
        id: topicId,
        name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
        type: "keyword",
        val: 7,
      });

      data.publications.forEach((pub, pubIdx) => {
        const pubText = `${pub.title} ${pub.abstract || ""}`.toLowerCase();
        if (pubText.includes(keyword.toLowerCase())) {
          const pubId = `pub_${pubIdx}`;
          const linkId = `${pubId}-${topicId}`;

          if (!linkStrength.has(linkId)) {
            links.push({
              source: pubId,
              target: topicId,
              value: 1.5,
            });
            linkStrength.set(linkId, true);
          }
        }
      });
    });

    // 4. Co-occurring terms
    if (data.coOccurrences && data.coOccurrences.length > 0) {
      data.coOccurrences.slice(0, 8).forEach((coOcc, idx) => {
        const coOccId = `coOcc_${idx}`;
        nodes.push({
          id: coOccId,
          name: coOcc.word.charAt(0).toUpperCase() + coOcc.word.slice(1),
          frequency: coOcc.count,
          type: "context",
          val: 5,
        });

        links.push({
          source: "query",
          target: coOccId,
          value: 1,
        });
      });
    }

    setGraphData({ nodes, links });

    if (fgRef.current) {
      setTimeout(() => {
        fgRef.current.zoomToFit(400, 180);
      }, 600);
    }
  }, [data]);

  if (!graphData.nodes.length) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
          <p className="text-gray-600">Building dynamic knowledge graph...</p>
        </div>
      </div>
    );
  }

  return (
    <ForceGraph2D
      ref={fgRef}
      graphData={graphData}
      nodeAutoColorBy="type"
      nodeCanvasObject={(node, ctx, globalScale) => {
        const label = node.name;
        const fontSize =
          node.type === "query" ? 13 / globalScale : 11 / globalScale;
        ctx.font = `${node.type === "query" ? "bold" : ""} ${fontSize}px Inter, sans-serif`;

        const colors = {
          query: "#ec4899",
          publication: "#9333ea",
          keyword: "#3b82f6",
          context: "#10b981",
        };

        const color = colors[node.type] || "#6b7280";

        ctx.shadowBlur = node.type === "query" ? 15 : 10;
        ctx.shadowColor = color;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth =
          node.type === "query" ? 3 / globalScale : 2.5 / globalScale;
        ctx.stroke();

        const textWidth = ctx.measureText(label).width;
        const padding = 5;
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.fillRect(
          node.x - textWidth / 2 - padding,
          node.y + node.val + 5,
          textWidth + padding * 2,
          fontSize + 6
        );

        ctx.fillStyle = "#1f2937";
        ctx.fillText(label, node.x, node.y + node.val + 10);
      }}
      linkColor={() => "rgba(156, 163, 175, 0.4)"}
      linkWidth={(link) => link.value || 1}
      linkDirectionalParticles={(link) => (link.value > 2 ? 3 : 0)}
      linkDirectionalParticleWidth={2}
      nodeRelSize={6}
      width={
        expanded
          ? 1200
          : typeof window !== "undefined" && window.innerWidth > 1024
            ? 900
            : 700
      }
      height={expanded ? 700 : 550}
      backgroundColor="#fafafa"
      d3VelocityDecay={0.2}
      d3AlphaDecay={0.01}
      cooldownTicks={120}
      onNodeClick={(node) => {
        if (node.fullName || node.abstract) {
          const info = node.abstract
            ? `${node.fullName}\n\n${node.abstract}...`
            : node.fullName || node.name;
          alert(info);
        }
      }}
      nodePointerAreaPaint={(node, color, ctx) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.val + 3, 0, 2 * Math.PI);
        ctx.fill();
      }}
    />
  );
}

function MessageComponent({ message, searchContext }) {
  const [isGraphExpanded, setIsGraphExpanded] = useState(false);

  const graphData = useQuery(
    api.analytics.getKnowledgeGraph,
    message.type === "knowledge-graph" && searchContext
      ? {
          searchQuery: searchContext.query,
          sourceTitles: searchContext.sources.map((s) => s.title),
        }
      : "skip"
  );

  if (message.type === "question") {
    return (
      <div className="bg-gray-100 rounded-lg p-4 ml-auto max-w-3xl">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">
              {USER_ROLES.find((r) => r.id === message.role)?.icon}
            </span>
          </div>
          <p className="text-gray-900 flex-1">{message.text}</p>
        </div>
      </div>
    );
  }

  if (message.type === "answer") {
    return (
      <div className="space-y-4">
        <div
          className={`rounded-lg shadow p-6 ${
            message.data.error ? "bg-red-50 border border-red-200" : "bg-white"
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-semibold">AI</span>
            </div>
            <h3 className="font-semibold text-gray-900">AI Assistant</h3>
          </div>

          <div className="prose max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => (
                  <h1
                    className="text-2xl font-bold text-gray-900 mt-6 mb-3"
                    {...props}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    className="text-xl font-bold text-gray-900 mt-5 mb-2"
                    {...props}
                  />
                ),
                h3: ({ node, ...props }) => (
                  <h3
                    className="text-lg font-semibold text-gray-900 mt-4 mb-2"
                    {...props}
                  />
                ),
                h4: ({ node, ...props }) => (
                  <h4
                    className="text-base font-semibold text-gray-900 mt-3 mb-1"
                    {...props}
                  />
                ),
                p: ({ node, ...props }) => (
                  <p
                    className="text-gray-800 leading-relaxed mb-3"
                    {...props}
                  />
                ),
                ul: ({ node, ...props }) => (
                  <ul
                    className="list-disc pl-5 space-y-1 mb-3 text-gray-800"
                    {...props}
                  />
                ),
                ol: ({ node, ...props }) => (
                  <ol
                    className="list-decimal pl-5 space-y-1 mb-3 text-gray-800"
                    {...props}
                  />
                ),
                li: ({ node, ...props }) => (
                  <li className="text-gray-800" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold text-gray-900" {...props} />
                ),
              }}
            >
              {message.data.answer}
            </ReactMarkdown>
          </div>
        </div>

        {message.data.sources && message.data.sources.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-3 text-gray-900">
              Sources ({message.data.sources.length})
            </h3>
            <div className="space-y-3">
              {message.data.sources.map((source, idx) => (
                <div
                  key={idx}
                  className="border-l-4 border-purple-600 pl-4 py-2 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">
                        {source.title}
                      </p>
                      {source.snippet && (
                        <p className="text-xs text-gray-700 mt-1">
                          {source.snippet}
                        </p>
                      )}
                    </div>
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (message.type === "knowledge-graph") {
    if (!graphData) {
      return (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
          <p className="text-gray-700 mt-2">Loading knowledge graph...</p>
        </div>
      );
    }

    return (
      <>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
              <Network className="w-6 h-6 text-purple-600" />
              {graphData.searchQuery
                ? `Knowledge Graph: "${graphData.searchQuery}"`
                : "Knowledge Graph"}
            </h3>
          </div>

          {graphData.searchQuery && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-purple-900">
                <strong>📊 Context:</strong> Visualizing{" "}
                {graphData.publicationCount} publications and{" "}
                {graphData.topicCount} research topics
              </p>
            </div>
          )}

          <div
            className="bg-white rounded-lg p-4 shadow-inner cursor-pointer hover:shadow-lg transition-shadow relative"
            onClick={() => setIsGraphExpanded(true)}
          >
            <div className="absolute top-2 right-2 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium z-10 hover:bg-purple-700 transition-colors">
              Click to expand 🔍
            </div>
            <KnowledgeGraphVisualization data={graphData} />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6 mt-4">
            <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-purple-100">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">📄</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">Publications</p>
              <p className="text-2xl font-bold text-purple-600">
                {graphData.publicationCount}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-blue-100">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🔬</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">Topics</p>
              <p className="text-2xl font-bold text-blue-600">
                {graphData.topicCount}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-green-100">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🔗</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">Connections</p>
              <p className="text-2xl font-bold text-green-600">
                {graphData.keywords?.length || 0}
              </p>
            </div>
          </div>

          {graphData.publications && graphData.publications.length > 0 && (
            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
              <h5 className="font-semibold mb-3 text-sm text-gray-900 flex items-center gap-2">
                <span className="text-purple-600">📚</span> Key Publications
              </h5>
              <div className="space-y-2">
                {graphData.publications.map((pub, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-sm hover:bg-purple-50 p-2 rounded transition-colors"
                  >
                    <span className="text-purple-600 font-bold text-xs mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-gray-700 flex-1 leading-relaxed">
                      {pub.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {graphData.keywords && graphData.keywords.length > 0 && (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <h5 className="font-semibold mb-3 text-sm text-gray-900 flex items-center gap-2">
                <span className="text-blue-600">🏷️</span> Key Research Topics
              </h5>
              <div className="flex flex-wrap gap-2">
                {graphData.keywords.slice(0, 15).map((keyword, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 rounded-full text-xs font-medium border border-purple-200 hover:shadow-md transition-shadow"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* EXPANDED MODAL */}
        {isGraphExpanded && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6"
            onClick={() => setIsGraphExpanded(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full h-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Network className="w-6 h-6" />
                  <div>
                    <h3 className="text-lg font-bold">
                      Knowledge Graph - Expanded View
                    </h3>
                    <p className="text-xs opacity-90">
                      {graphData.searchQuery}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsGraphExpanded(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex-1 bg-gray-50 p-6 overflow-auto">
                <div className="bg-white rounded-xl shadow-inner p-4 h-full">
                  <KnowledgeGraphVisualization
                    data={graphData}
                    expanded={true}
                  />
                </div>
              </div>

              <div className="bg-white border-t p-4">
                <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Publications</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {graphData.publicationCount}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Topics</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {graphData.topicCount}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Connections</p>
                    <p className="text-2xl font-bold text-green-600">
                      {graphData.keywords?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
