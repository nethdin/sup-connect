'use client';

import { Meeting } from '@/app/lib/types';
import { formatDateTime } from '@/app/lib/utils';

interface MeetingListProps {
  meetings: Meeting[];
  onAddNotes?: (meetingId: string) => void;
}

export default function MeetingList({
  meetings,
  onAddNotes,
}: MeetingListProps) {
  if (meetings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No meetings scheduled yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meetings.map((meeting) => (
        <div
          key={meeting.id}
          className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900">
                  Meeting with{' '}
                  {meeting.slot?.supervisorId ? 'Supervisor' : 'Student'}
                </h4>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                  {meeting.mode}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {formatDateTime(meeting.dateTime)}
              </p>
            </div>
          </div>

          {meeting.notes && (
            <div className="mb-3 p-3 bg-gray-50 rounded border border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-1">Notes:</p>
              <p className="text-sm text-gray-600">{meeting.notes}</p>
            </div>
          )}

          {meeting.feedback && (
            <div className="mb-3 p-3 bg-green-50 rounded border border-green-200">
              <p className="text-xs font-medium text-green-700 mb-1">Feedback:</p>
              <p className="text-sm text-green-600">{meeting.feedback}</p>
            </div>
          )}

          {!meeting.notes && (
            <button
              onClick={() => onAddNotes?.(meeting.id)}
              className="w-full px-4 py-2 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition"
            >
              Add Notes
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
