'use client';

import { useState } from 'react';
import { RecommendedSupervisor } from '@/app/lib/types';
import { sortRecommendations } from '@/app/lib/utils';

interface RecommendationListProps {
  recommendations: RecommendedSupervisor[];
  onRequest?: (supervisorId: string) => void;
}

export default function RecommendationList({
  recommendations,
  onRequest,
}: RecommendationListProps) {
  const sorted = sortRecommendations(recommendations);

  if (sorted.length === 0) {
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
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Recommended Supervisors
        </h3>
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          {sorted.length} match{sorted.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {sorted.map((rec, index) => (
        <div
          key={rec.supervisor.id}
          className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <h4 className="font-semibold text-gray-900">
                  {index + 1}. {rec.supervisor.user?.name}
                </h4>
                <span className="text-xs font-medium text-gray-500">
                  {rec.supervisor.specialization}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{rec.supervisor.bio}</p>
            </div>
            <div className="text-right ml-4">
              <div className="text-2xl font-bold text-blue-600">
                {rec.score.toFixed(1)}
              </div>
              <p className="text-xs text-gray-500">Match Score</p>
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
                  width: `${
                    ((rec.supervisor.maxSlots - rec.supervisor.currentSlots) /
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
