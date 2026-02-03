'use client';

import { SupervisorProfile } from '@/app/lib/api-client';

interface RecommendationItem {
  supervisor: SupervisorProfile;
  matchedTags: string[];
  matchCount: number;
  isFullMatch: boolean;
  score: number;
}

interface RecommendationListProps {
  recommendations: RecommendationItem[];
  sortBy: 'score' | 'match_count' | 'experience' | 'availability';
  onSortChange: (sort: 'score' | 'match_count' | 'experience' | 'availability') => void;
  onRequest?: (supervisorId: string) => void;
  fullMatchCount?: number;
  partialMatchCount?: number;
}

export default function RecommendationList({
  recommendations,
  sortBy,
  onSortChange,
  onRequest,
  fullMatchCount = 0,
  partialMatchCount = 0,
}: RecommendationListProps) {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">
          No supervisors found. Please refine your project details.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with sort dropdown */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Recommended Supervisors
          </h3>
          <div className="flex gap-2">
            {fullMatchCount > 0 && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                {fullMatchCount} full match{fullMatchCount !== 1 ? 'es' : ''}
              </span>
            )}
            {partialMatchCount > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {partialMatchCount} partial
              </span>
            )}
          </div>
        </div>

        {/* Sort dropdown */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="score">Sort by Score</option>
          <option value="match_count">Sort by Match Count</option>
          <option value="experience">Sort by Experience</option>
          <option value="availability">Sort by Availability</option>
        </select>
      </div>

      {recommendations.map((rec, index) => (
        <div
          key={rec.supervisor.id}
          className={`p-4 border rounded-lg hover:border-blue-300 transition ${rec.isFullMatch ? 'border-green-300 bg-green-50/30' : 'border-gray-200'
            }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <h4 className="font-semibold text-gray-900">
                  {index + 1}. {rec.supervisor.user?.name}
                </h4>
                {rec.isFullMatch && (
                  <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded">
                    100% Match
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{rec.supervisor.bio}</p>
              {rec.supervisor.yearsOfExperience > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {rec.supervisor.yearsOfExperience} years of experience
                </p>
              )}
            </div>
            <div className="text-right ml-4">
              <div className="text-2xl font-bold text-blue-600">
                {rec.matchCount}
              </div>
              <p className="text-xs text-gray-500">Tags Matched</p>
              <p className="text-xs text-gray-400">Score: {rec.score}</p>
            </div>
          </div>

          {/* Matched Tags */}
          {rec.matchedTags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {rec.matchedTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded"
                >
                  ✓ {tag}
                </span>
              ))}
            </div>
          )}

          {/* Slot Info */}
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-gray-600">
              {rec.supervisor.maxSlots - rec.supervisor.currentSlots} slots available
            </span>
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{
                  width: `${((rec.supervisor.maxSlots - rec.supervisor.currentSlots) /
                    rec.supervisor.maxSlots) *
                    100
                    }%`,
                }}
              />
            </div>
          </div>

          {/* Action */}
          <button
            onClick={() => onRequest?.(rec.supervisor.id)}
            disabled={rec.supervisor.currentSlots >= rec.supervisor.maxSlots}
            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            Send Request
          </button>
        </div>
      ))}
    </div>
  );
}
