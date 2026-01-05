'use client';

import { useState } from 'react';
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
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

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

  const toggleExpand = (requestId: string) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request.id}
          className="border border-gray-200 rounded-lg hover:border-blue-300 transition"
        >
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <h4 className="font-semibold text-gray-900">
                    {isSupervisor
                      ? request.student?.name
                      : request.supervisor?.user?.name}
                  </h4>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${request.status === 'ACCEPTED'
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
                  Requested on {formatDate(request.createdAt)}
                </p>
              </div>
            </div>

            {/* Project Idea Preview for Supervisors */}
            {isSupervisor && request.projectIdea && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📋</span>
                      <div>
                        <h5 className="font-medium text-gray-900 text-sm">
                          Project: {request.projectIdea.title}
                        </h5>
                        <p className="text-xs text-gray-600 mt-1">
                          Tags: {request.projectIdea.tags?.join(', ') || 'No tags'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleExpand(request.id)}
                    className="ml-2 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 bg-white hover:bg-blue-100 border border-blue-300 rounded transition flex items-center gap-1"
                  >
                    {expandedRequest === request.id ? (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        Hide Details
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        View Details
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Expanded Project Idea Details */}
            {isSupervisor && expandedRequest === request.id && request.projectIdea && (
              <div className="mt-3 p-4 bg-white border border-blue-200 rounded-lg space-y-3">
                <div>
                  <h6 className="text-xs font-semibold text-gray-700 uppercase mb-1">
                    Project Title
                  </h6>
                  <p className="text-sm text-gray-900">{request.projectIdea.title}</p>
                </div>

                <div>
                  <h6 className="text-xs font-semibold text-gray-700 uppercase mb-1">
                    Description
                  </h6>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {request.projectIdea.description}
                  </p>
                </div>

                {request.projectIdea.tags && request.projectIdea.tags.length > 0 && (
                  <div>
                    <h6 className="text-xs font-semibold text-gray-700 uppercase mb-2">
                      Tags / Tech Stack
                    </h6>
                    <div className="flex flex-wrap gap-2">
                      {request.projectIdea.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {request.projectIdea.attachments && request.projectIdea.attachments.length > 0 && (
                  <div>
                    <h6 className="text-xs font-semibold text-gray-700 uppercase mb-1">
                      Attachments
                    </h6>
                    <p className="text-xs text-gray-600">
                      {request.projectIdea.attachments.length} file(s) attached
                    </p>
                  </div>
                )}

                <div>
                  <h6 className="text-xs font-semibold text-gray-700 uppercase mb-1">
                    Submitted On
                  </h6>
                  <p className="text-sm text-gray-600">
                    {formatDate(request.projectIdea.createdAt)}
                  </p>
                </div>
              </div>
            )}

            {/* No Project Idea Warning */}
            {isSupervisor && !request.projectIdea && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  ⚠️ This student has not submitted a project idea yet.
                </p>
              </div>
            )}

            {/* Actions */}
            {isSupervisor && request.status === 'PENDING' && (
              <div className="flex gap-2 mt-4">
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
        </div>
      ))}
    </div>
  );
}
