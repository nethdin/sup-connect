'use client';

import { useState, useEffect } from 'react';
import { BookingRequest, Assignment } from '@/app/lib/types';
import RequestList from '@/app/components/student/RequestList';
import { supervisorAPI, assignmentAPI } from '@/app/lib/api-client';
import Link from 'next/link';
import RouteGuard from '@/app/components/RouteGuard';

export default function SupervisorDashboard() {
  const [pendingRequests, setPendingRequests] = useState<BookingRequest[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    maxSlots: 0,
    currentSlots: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch pending requests
      const requestsData = await supervisorAPI.getRequests('PENDING');
      setPendingRequests(requestsData.requests);

      // Fetch assigned students
      const assignmentsData = await assignmentAPI.getSupervisorAssignments();
      setAssignedStudents(assignmentsData.assignments);

      // Fetch supervisor stats
      const statsData = await supervisorAPI.getStats();
      setStats({
        maxSlots: statsData.stats.maxSlots,
        currentSlots: statsData.stats.currentSlots,
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await supervisorAPI.acceptRequest(requestId);
      // Refresh data after accepting
      fetchDashboardData();
      alert('Request accepted successfully!');
    } catch (err) {
      console.error('Error accepting request:', err);
      alert(err instanceof Error ? err.message : 'Failed to accept request');
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await supervisorAPI.declineRequest(requestId);
      // Refresh data after declining
      fetchDashboardData();
      alert('Request declined successfully!');
    } catch (err) {
      console.error('Error declining request:', err);
      alert(err instanceof Error ? err.message : 'Failed to decline request');
    }
  };

  const content = () => {
    if (loading) {
      return (
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </main>
      );
    }

    if (error) {
      return (
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">Error: {error}</p>
              <button
                onClick={fetchDashboardData}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
          </div>
        </div>
      </main>
    );
    }

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
                  {pendingRequests.length}
                </span>
              </div>

              <RequestList
                requests={pendingRequests}
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

              {assignedStudents.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  No students assigned yet
                </p>
              ) : (
                <div className="space-y-4">
                  {assignedStudents.map((assignment) => (
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
                    {pendingRequests.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Assigned Students</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {assignedStudents.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available Slots</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.maxSlots - stats.currentSlots} / {stats.maxSlots}
                  </p>
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
                <Link
                  href="/supervisor/profile"
                  className="block w-full px-4 py-2 border border-gray-300 text-gray-700 text-center rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
  };

  return (
    <RouteGuard allowedRoles={['SUPERVISOR']}>
      {content()}
    </RouteGuard>
  );
}
