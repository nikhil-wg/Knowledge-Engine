"use client";

import { Search } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <Link href="/">
          <h1 className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors">
            NASA Bioscience Explorer
          </h1>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/search"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors"
          >
            <Search className="w-5 h-5" />
            <span>Search</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
