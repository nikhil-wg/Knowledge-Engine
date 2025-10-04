import { FileText } from "lucide-react";

export default function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Publications</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalPublications}
            </p>
          </div>
          <div className="bg-blue-500 p-3 rounded-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
