import Link from "next/link";
import { ArrowRight, Database, Brain, Search, BarChart3 } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Database,
      title: "608+ Publications",
      description: "Comprehensive collection of NASA bioscience research",
    },
    {
      icon: Brain,
      title: "AI Analysis",
      description: "Gemini-powered insights and summaries",
    },
    {
      icon: Search,
      title: "Smart Search",
      description: "Vector-based semantic search capabilities",
    },
    {
      icon: BarChart3,
      title: "Visual Analytics",
      description: "Interactive charts and knowledge graphs",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            NASA Bioscience Research Explorer
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            AI-powered dashboard to explore 608+ NASA bioscience publications.
            Discover insights, identify research gaps, and navigate decades of
            space biology research.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            Explore Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors"
              >
                <Icon className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
