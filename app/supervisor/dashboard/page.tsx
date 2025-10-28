'use client';

import { useState } from 'react';
import { BookingRequest, Assignment } from '@/app/lib/types';
import RequestList from '@/app/components/student/RequestList';

export default function SupervisorDashboard() {
  const [pendingRequests, setPendingRequests] = useState<BookingRequest[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<Assignment[]>([]);

  // TODO: Fetch real data from API
  const mockRequests: BookingRequest[] = [
    {
      id: '1',
      studentId: 'student1',
      supervisorId: 'sup1',
      status: 'PENDING',
      createdAt: new Date(),
      student: {
        id: 'student1',
        email: 'student1@uni.edu',
        name: 'John Doe',
        role: 'STUDENT',
        createdAt: new Date(),
      },
    },
    {
      id: '2',
      studentId: 'student2',
      supervisorId: 'sup1',
      status: 'PENDING',
      createdAt: new Date(Date.now() - 86400000),
      student: {
        id: 'student2',
        email: 'student2@uni.edu',
        name: 'Jane Smith',
        role: 'STUDENT',
        createdAt: new Date(),
      },
    },
  ];

  const mockAssignedStudents: Assignment[] = [
    {
      id: '1',
      studentId: 'student3',
      supervisorId: 'sup1',
      assignedAt: new Date(Date.now() - 86400000 * 30),
      student: {
        id: 'student3',
        email: 'student3@uni.edu',
        name: 'Alice Johnson',
        role: 'STUDENT',
        createdAt: new Date(),
      },
    },
  ];

  const handleAccept = (requestId: string) => {
    // TODO: Call API to accept request
    alert(`Accepted request ${requestId}`);
  };

  const handleDecline = (requestId: string) => {
    // TODO: Call API to decline request
    alert(`Declined request ${requestId}`);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Supervisor Dashboard
          </h1>
          <p className="text-gray-600">
            Manage student requests and supervision
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pending Requests */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Pending Requests
                </h2>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  {mockRequests.length}
                </span>
              </div>

              <RequestList
                requests={mockRequests}
                onAccept={handleAccept}
                onDecline={handleDecline}
                isSupervisor={true}
              />
            </div>

            {/* Assigned Students */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Assigned Students
              </h2>

              {mockAssignedStudents.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  No students assigned yet
                </p>
              ) : (
                <div className="space-y-4">
                  {mockAssignedStudents.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {assignment.student?.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {assignment.student?.email}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Assigned on{' '}
                            {new Date(assignment.assignedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockRequests.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Assigned Students</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockAssignedStudents.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Max Slots</p>
                  <p className="text-2xl font-bold text-gray-900">5</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                  Manage Availability
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                  View Schedule
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
