'use client';

import { SupervisorProfile } from '@/app/lib/types';
import { getInitials } from '@/app/lib/utils';
import Image from 'next/image';

interface SupervisorCardProps {
  supervisor: SupervisorProfile;
  onViewClick?: (id: string) => void;
  onRequestClick?: (id: string) => void;
}

export default function SupervisorCard({
  supervisor,
  onViewClick,
  onRequestClick,
}: SupervisorCardProps) {
  const slotPercentage = (supervisor.currentSlots / supervisor.maxSlots) * 100;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {getInitials(supervisor.user?.name || 'N/A')}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {supervisor.user?.name}
              </h3>
              <p className="text-sm text-blue-600 font-medium">
                {supervisor.department || 'No department'}
              </p>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {supervisor.bio}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {supervisor.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
            >
              {tag.name}
            </span>
          ))}
          {supervisor.tags.length > 3 && (
            <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full">
              +{supervisor.tags.length - 3}
            </span>
          )}
        </div>

        {/* Slot Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Available Slots</span>
            <span className="font-medium text-gray-900">
              {supervisor.maxSlots - supervisor.currentSlots} / {supervisor.maxSlots}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition ${slotPercentage < 80
                ? 'bg-green-500'
                : slotPercentage < 100
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
                }`}
              style={{ width: `${Math.min(slotPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
        <button
          onClick={() => onViewClick?.(supervisor.id)}
          className="flex-1 px-4 py-2 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition"
        >
          View Profile
        </button>
        <button
          onClick={() => onRequestClick?.(supervisor.id)}
          disabled={supervisor.currentSlots >= supervisor.maxSlots}
          className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {supervisor.currentSlots >= supervisor.maxSlots
            ? 'Full'
            : 'Request'}
        </button>
      </div>
    </div>
  );
}
