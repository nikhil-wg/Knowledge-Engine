import { ExternalLink, User } from "lucide-react";

export default function PublicationCard({ publication }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {publication.title}
          </h3>
          
          {publication.authors && (
            <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
              <User className="w-3 h-3" />
              {publication.authors.substring(0, 100)}
              {publication.authors.length > 100 && "..."}
            </p>
          )}
          
          {publication.summary && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">
              {publication.summary}
            </p>
          )}
        </div>
        
        <a
          href={publication.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 text-purple-600 hover:text-purple-700"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}
