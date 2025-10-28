'use client';

import { useState } from 'react';
import { Assignment, Meeting, ProgressUpdate } from '@/app/lib/types';
import MeetingList from '@/app/components/common/MeetingList';
import Link from 'next/link';

export default function StudentDashboard() {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);

  // TODO: Fetch real data from API
  const mockAssignment: Assignment = {
    id: '1',
    studentId: 'student1',
    supervisorId: 'sup1',
    assignedAt: new Date(),
    supervisor: {
      id: 'sup1',
      userId: 'user1',
      specialization: 'AI/ML',
      tags: ['machine learning', 'deep learning'],
      bio: 'Expert in AI and machine learning',
      maxSlots: 5,
      currentSlots: 3,
      user: {
        id: 'user1',
        email: 'prof@uni.edu',
        name: 'Prof. Smith',
        role: 'SUPERVISOR',
        createdAt: new Date(),
      },
    },
  };

  const mockMeetings: Meeting[] = [
    {
      id: '1',
      studentId: 'student1',
      supervisorId: 'sup1',
      dateTime: new Date(Date.now() + 86400000 * 3),
      mode: 'ONLINE',
      notes: 'Discussed project scope and deliverables',
      createdAt: new Date(),
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Student Dashboard
          </h1>
          <p className="text-gray-600">Manage your final-year project supervision</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Assignment Status */}
            {mockAssignment ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Assigned Supervisor
                </h2>
                <div className="flex items-start justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {mockAssignment.supervisor?.user?.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {mockAssignment.supervisor?.specialization}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {mockAssignment.supervisor?.bio}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                    Message
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Not Yet Assigned
                </h2>
                <p className="text-gray-600 mb-4">
                  You haven't been assigned a supervisor yet. Submit your project
                  idea to get started.
                </p>
                <Link
                  href="/student/idea"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Submit Project Idea
                </Link>
              </div>
            )}

            {/* Upcoming Meetings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Upcoming Meetings
              </h2>
              <MeetingList
                meetings={mockMeetings}
                onAddNotes={(id) => alert(`Add notes to meeting ${id}`)}
              />
            </div>

            {/* Progress Updates */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Progress Updates
                </h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                  New Update
                </button>
              </div>

              {progressUpdates.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  No progress updates yet. Start sharing your progress!
                </p>
              ) : (
                <div className="space-y-4">
                  {progressUpdates.map((update) => (
                    <div
                      key={update.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <h4 className="font-semibold text-gray-900">
                        {update.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-2">
                        {update.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/supervisors"
                  className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition"
                >
                  Browse Supervisors
                </Link>
                <Link
                  href="/student/idea"
                  className="block w-full px-4 py-2 border border-gray-300 text-gray-700 text-center rounded-lg hover:bg-gray-50 transition"
                >
                  Submit Idea
                </Link>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-left">
                  Schedule Meeting
                </button>
              </div>
            </div>

            {/* Project Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Project Status
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Assigned Supervisor</span>
                  <span className="font-medium text-green-600">✓</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">1st Meeting Done</span>
                  <span className="font-medium text-green-600">✓</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Progress Update</span>
                  <span className="font-medium text-gray-400">○</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
