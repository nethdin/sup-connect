'use client';

import { useState, useEffect } from 'react';
import { Assignment, Meeting } from '@/app/lib/types';
import MeetingList from '@/app/components/common/MeetingList';
import Link from 'next/link';
import { useToast } from '@/app/context/ToastContext';
import { assignmentAPI, meetingAPI, studentAPI, ProjectIdea } from '@/app/lib/api-client';
import RouteGuard from '@/app/components/RouteGuard';
import ProjectIdeaForm from '@/app/components/student/ProjectIdeaForm';

// Local type since progress updates feature is not yet implemented
interface ProgressUpdate {
  id: string;
  title: string;
  description: string;
}

// Request type
interface BookingRequest {
  id: string;
  status: string;
  created_at: string;
  responded_at: string | null;
  supervisor_id: string;
  supervisor_name: string;
  supervisor_email: string;
  specialization: string;
  department: string;
}

export default function StudentDashboard() {
  const { addToast } = useToast();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  const [projectIdea, setProjectIdea] = useState<ProjectIdea | null>(null);
  const [pendingRequest, setPendingRequest] = useState<BookingRequest | null>(null);
  const [cancellingRequest, setCancellingRequest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch assignment
      const assignmentData = await assignmentAPI.getStudentAssignment();
      setAssignment(assignmentData.assignment);

      // Fetch project idea
      const ideaData = await studentAPI.getIdea();
      setProjectIdea(ideaData.projectIdea);

      // Fetch booking requests (for pending status)
      const requestsData = await studentAPI.getRequests();
      const pending = requestsData.requests.find(r => r.status === 'PENDING');
      setPendingRequest(pending || null);

      // Fetch upcoming meetings
      const meetingsData = await meetingAPI.getAll(true);
      setMeetings(meetingsData.meetings as any);

      // TODO: Fetch progress updates when endpoint is ready
      // const progressData = await progressAPI.getAll();
      // setProgressUpdates(progressData.updates);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleIdeaUpdated = () => {
    setShowEditForm(false);
    fetchDashboardData(); // Refresh to show updated idea
  };

  const handleCancelRequest = async () => {
    if (!pendingRequest) return;

    setCancellingRequest(true);
    try {
      await studentAPI.cancelRequest(pendingRequest.id);
      addToast('Request cancelled successfully', 'success');
      setPendingRequest(null);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to cancel request', 'error');
    } finally {
      setCancellingRequest(false);
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
              Student Dashboard
            </h1>
            <p className="text-gray-600">Manage your final-year project supervision</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Assignment Status */}
              {assignment ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Assigned Supervisor
                  </h2>
                  <div className="flex items-start justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {assignment.supervisor?.user?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {assignment.supervisor?.specialization}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        {assignment.supervisor?.bio}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {assignment.supervisor?.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
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

                  {pendingRequest ? (
                    // Show pending request info
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full flex items-center gap-1">
                          <i className="fa-solid fa-clock"></i>
                          Pending Request
                        </span>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-sm text-amber-800 mb-3">
                          Your request to <strong>{pendingRequest.supervisor_name}</strong> is pending approval.
                        </p>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <i className="fa-solid fa-user w-4"></i>
                            <span className="font-medium">Supervisor:</span>
                            <Link
                              href={`/supervisors/${pendingRequest.supervisor_id}`}
                              className="text-brand-600 hover:underline"
                            >
                              {pendingRequest.supervisor_name}
                            </Link>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <i className="fa-solid fa-flask w-4"></i>
                            <span className="font-medium">Specialization:</span>
                            <span>{pendingRequest.specialization || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <i className="fa-solid fa-envelope w-4"></i>
                            <span className="font-medium">Email:</span>
                            <span>{pendingRequest.supervisor_email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <i className="fa-solid fa-calendar w-4"></i>
                            <span className="font-medium">Requested:</span>
                            <span>{new Date(pendingRequest.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-amber-200">
                          <button
                            onClick={handleCancelRequest}
                            disabled={cancellingRequest}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition"
                          >
                            {cancellingRequest ? (
                              <>
                                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <i className="fa-solid fa-times mr-2"></i>
                                Cancel Request
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // No pending request
                    <>
                      <p className="text-gray-600 mb-4">
                        You haven't been assigned a supervisor yet.
                        {!projectIdea && ' Submit your project idea to get started.'}
                        {projectIdea && ' Browse supervisors and send a request.'}
                      </p>
                      {!projectIdea ? (
                        <Link
                          href="/student/idea"
                          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          Submit Project Idea
                        </Link>
                      ) : (
                        <Link
                          href="/student/recommendations"
                          className="inline-block px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
                        >
                          <i className="fa-solid fa-search mr-2"></i>
                          Find Supervisors
                        </Link>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Project Idea Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    My Project Idea
                  </h2>
                  {projectIdea && !showEditForm && (
                    // Only show edit button if no assignment OR if assignment allows editing
                    (!assignment || assignment.canEditIdea) ? (
                      <button
                        onClick={() => setShowEditForm(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                      >
                        Edit Idea
                      </button>
                    ) : (
                      <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed">
                        🔒 Editing Locked
                      </span>
                    )
                  )}
                </div>

                {/* Show info banner if editing is locked */}
                {assignment && !assignment.canEditIdea && projectIdea && !showEditForm && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ℹ️ Your project idea is locked after supervisor acceptance. Contact your supervisor to request editing permission.
                    </p>
                  </div>
                )}

                {showEditForm ? (
                  <div>
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Update your project idea below. Changes will be saved immediately.
                      </p>
                    </div>
                    <ProjectIdeaForm
                      initialData={projectIdea}
                      isEditing={true}
                      onSubmit={handleIdeaUpdated}
                    />
                    <button
                      onClick={() => setShowEditForm(false)}
                      className="mt-4 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                ) : projectIdea ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {projectIdea.title}
                      </h3>
                      <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        {projectIdea.category}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Description</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {projectIdea.description}
                      </p>
                    </div>

                    {projectIdea.keywords && projectIdea.keywords.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {projectIdea.keywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Last updated: {new Date(projectIdea.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                      You haven't submitted a project idea yet.
                    </p>
                    <Link
                      href="/student/idea"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Submit Project Idea
                    </Link>
                  </div>
                )}
              </div>

              {/* Upcoming Meetings */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Upcoming Meetings
                </h2>
                {meetings.length > 0 ? (
                  <MeetingList
                    meetings={meetings}
                    onAddNotes={(id) => addToast(`Add notes to meeting ${id}`, 'info')}
                  />
                ) : (
                  <p className="text-gray-600 text-center py-8">
                    No upcoming meetings scheduled
                  </p>
                )}
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
                    href="/student/recommendations"
                    className="block w-full px-4 py-2 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition"
                  >
                    View Recommendations
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
                    <span className={`font-medium ${assignment ? 'text-green-600' : 'text-gray-400'}`}>
                      {assignment ? '✓' : '○'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Meetings Scheduled</span>
                    <span className={`font-medium ${meetings.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {meetings.length > 0 ? '✓' : '○'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Progress Updates</span>
                    <span className={`font-medium ${progressUpdates.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {progressUpdates.length > 0 ? '✓' : '○'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  };

  return (
    <RouteGuard allowedRoles={['STUDENT']}>
      {content()}
    </RouteGuard>
  );
}
