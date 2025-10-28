'use client';

import { BookingRequest } from '@/app/lib/types';
import { formatDate } from '@/app/lib/utils';

interface RequestListProps {
  requests: BookingRequest[];
  onAccept?: (requestId: string) => void;
  onDecline?: (requestId: string) => void;
  isSupervisor?: boolean;
}

export default function RequestList({
  requests,
  onAccept,
  onDecline,
  isSupervisor = false,
}: RequestListProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">
          {isSupervisor
            ? 'No pending requests yet'
            : 'You have not sent any requests yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request.id}
          className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <h4 className="font-semibold text-gray-900">
                  {isSupervisor
                    ? request.student?.name
                    : request.supervisor?.user?.name}
                </h4>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    request.status === 'ACCEPTED'
                      ? 'bg-green-100 text-green-700'
                      : request.status === 'DECLINED'
                        ? 'bg-red-100 text-red-700'
                        : request.status === 'SLOT_FULL'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {request.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {isSupervisor
                  ? request.student?.email
                  : request.supervisor?.user?.email}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(request.createdAt)}
              </p>
            </div>
          </div>

          {/* Actions */}
          {isSupervisor && request.status === 'PENDING' && (
            <div className="flex gap-2">
              <button
                onClick={() => onAccept?.(request.id)}
                className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
              >
                Accept
              </button>
              <button
                onClick={() => onDecline?.(request.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
              >
                Decline
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
