"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
];

export default function AnalyticsPage() {
  const publications = useQuery(api.publications.getAll);
  const stats = useQuery(api.publications.getStats);

  if (!publications || !stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Extract topics data
  const topicCounts = {};
  publications.forEach((pub) => {
    const words = pub.title.toLowerCase().split(/\s+/);
    const keywords = [
      "bone",
      "muscle",
      "radiation",
      "cell",
      "space",
      "microgravity",
      "gene",
    ];

    keywords.forEach((keyword) => {
      if (words.some((word) => word.includes(keyword))) {
        topicCounts[keyword] = (topicCounts[keyword] || 0) + 1;
      }
    });
  });

  const topicData = Object.entries(topicCounts)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Year distribution (mock data - you can extract from publication dates)
  const yearData = [
    { year: "2018", count: 45 },
    { year: "2019", count: 62 },
    { year: "2020", count: 78 },
    { year: "2021", count: 95 },
    { year: "2022", count: 112 },
    { year: "2023", count: 128 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600">
          Visual insights from NASA bioscience research
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total Publications</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalPublications}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Research Topics</p>
          <p className="text-3xl font-bold text-gray-900">{topicData.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Avg Per Year</p>
          <p className="text-3xl font-bold text-gray-900">
            {Math.round(stats.totalPublications / 6)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Latest Year</p>
          <p className="text-3xl font-bold text-gray-900">2023</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Topic Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topicData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {topicData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Publications Over Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Publications Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8b5cf6" name="Publications" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Topics Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Top Research Topics</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Rank</th>
                <th className="text-left py-2 px-4">Topic</th>
                <th className="text-right py-2 px-4">Publications</th>
                <th className="text-right py-2 px-4">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {topicData.map((topic, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{idx + 1}</td>
                  <td className="py-2 px-4 font-medium">{topic.name}</td>
                  <td className="py-2 px-4 text-right">{topic.value}</td>
                  <td className="py-2 px-4 text-right">
                    {((topic.value / stats.totalPublications) * 100).toFixed(1)}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
