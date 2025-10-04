"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import StatsCards from "@/components/dashboard/StatsCards";
import PublicationCard from "@/components/dashboard/PublicationCard";

export default function DashboardPage() {
  const publications = useQuery(api.publications.getAll);
  const stats = useQuery(api.publications.getStats);

  if (!publications || !stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Research Dashboard
        </h1>
        <p className="text-gray-600">
          Explore NASA bioscience publications
        </p>
      </div>

      <StatsCards stats={stats} />

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">All Publications</h2>
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {publications.map((pub) => (
            <PublicationCard key={pub._id} publication={pub} />
          ))}
        </div>
      </div>
    </div>
  );
}
