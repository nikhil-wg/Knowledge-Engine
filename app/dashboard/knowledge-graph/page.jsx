"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

export default function KnowledgeGraphPage() {
  const publications = useQuery(api.publications.getAll);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (!publications || publications.length === 0) return;

    const nodes = [];
    const links = [];
    const topicMap = new Map();

    // Sample first 50 publications for performance
    const samplePubs = publications.slice(0, 50);

    samplePubs.forEach((pub) => {
      // Add publication node
      nodes.push({
        id: pub._id,
        name: pub.title.substring(0, 40) + "...",
        type: "publication",
        val: 5,
        color: "#8b5cf6",
      });

      // Extract keywords from title
      const keywords = extractKeywords(pub.title);

      keywords.forEach((keyword) => {
        const topicId = `topic-${keyword}`;

        if (!topicMap.has(keyword)) {
          topicMap.set(keyword, topicId);
          nodes.push({
            id: topicId,
            name: keyword,
            type: "topic",
            val: 10,
            color: "#3b82f6",
          });
        }

        links.push({
          source: pub._id,
          target: topicId,
        });
      });
    });

    setGraphData({ nodes, links });
  }, [publications]);

  if (!publications) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading knowledge graph...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Knowledge Graph
        </h1>
        <p className="text-gray-600">
          Interactive visualization of research topics and connections
        </p>
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-600"></div>
            <span className="text-sm">Publications</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-600"></div>
            <span className="text-sm">Topics</span>
          </div>
        </div>
      </div>

      <div
        className="bg-white rounded-lg shadow p-4"
        style={{ height: "600px" }}
      >
        {graphData.nodes.length > 0 ? (
          <ForceGraph2D
            graphData={graphData}
            nodeLabel="name"
            nodeColor={(node) => node.color}
            nodeRelSize={6}
            linkWidth={1}
            linkColor={() => "#e5e7eb"}
            onNodeClick={(node) => setSelectedNode(node)}
            width={
              typeof window !== "undefined" ? window.innerWidth - 400 : 800
            }
            height={550}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No data available for visualization</p>
          </div>
        )}
      </div>

      {selectedNode && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-2">{selectedNode.name}</h3>
          <p className="text-sm text-gray-600">
            Type: <span className="font-medium">{selectedNode.type}</span>
          </p>
        </div>
      )}
    </div>
  );
}

function extractKeywords(text) {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
  ]);

  return text
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 4 && !stopWords.has(word))
    .slice(0, 3);
}
