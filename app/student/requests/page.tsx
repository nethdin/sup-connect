'use client';

import { useState, useEffect } from 'react';
import RouteGuard from '@/app/components/RouteGuard';
import { studentAPI } from '@/app/lib/api-client';
import { useToast } from '@/app/context/ToastContext';
import { formatDate } from '@/app/lib/utils';

interface BookingRequest {
  id: string;
  status: string;
  created_at: string;
  responded_at: string | null;
  supervisor_id: string;
  supervisor_name: string;
  supervisor_email: string;
  department: string;
}

export default function StudentRequestsPage() {
  const { addToast } = useToast();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await studentAPI.getRequests();
      setRequests(data.requests);
    } catch (err) {
      console.error('Error fetching requests:', err);
      addToast(err instanceof Error ? err.message : 'Failed to fetch requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (requestId: string) => {
    if (!confirm('Are you sure you want to cancel this request?')) {
      return;
    }

    try {
      setCancelling(requestId);
      await studentAPI.cancelRequest(requestId);
      addToast('Request cancelled successfully', 'success');
      fetchRequests();
    } catch (err) {
      console.error('Error cancelling request:', err);
      addToast(err instanceof Error ? err.message : 'Failed to cancel request', 'error');
    } finally {
      setCancelling(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      DECLINED: 'bg-red-100 text-red-800',
      SLOT_FULL: 'bg-orange-100 text-orange-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      PENDING: '⏳',
      ACCEPTED: '✅',
      DECLINED: '❌',
      SLOT_FULL: '⚠️',
      CANCELLED: '🚫',
    };
    return icons[status] || '•';
  };

  return (
    <RouteGuard allowedRoles={['STUDENT']}>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Supervision Requests</h1>
            <p className="text-gray-600 mt-1">View and manage your booking requests</p>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <i className="fa-solid fa-inbox text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-600 mb-4">You have not sent any supervision requests yet</p>
              <a
                href="/student/recommendations"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Find Supervisors
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-blue-600">{requests.length}</div>
                  <div className="text-sm text-gray-600">Total Requests</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-yellow-600">
                    {requests.filter((r) => r.status === 'PENDING').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-green-600">
                    {requests.filter((r) => r.status === 'ACCEPTED').length}
                  </div>
                  <div className="text-sm text-gray-600">Accepted</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-red-600">
                    {requests.filter((r) => r.status === 'DECLINED').length}
                  </div>
                  <div className="text-sm text-gray-600">Declined</div>
                </div>
              </div>

              {/* Requests List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="p-6 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left side - Supervisor info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.supervisor_name}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(request.status)}`}
                          >
                            <span>{getStatusIcon(request.status)}</span>
                            {request.status}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600">{request.supervisor_email}</p>
                        {request.department && (
                          <p className="text-sm text-gray-600 mt-1">
                            Department: <span className="font-medium">{request.department}</span>
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                          <span>📅 Requested: {formatDate(request.created_at)}</span>
                          {request.responded_at && (
                            <span>⏱️ Responded: {formatDate(request.responded_at)}</span>
                          )}
                        </div>
                      </div>

                      {/* Right side - Actions */}
                      <div className="flex flex-col gap-2">
                        {request.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleCancel(request.id)}
                              disabled={cancelling === request.id}
                              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 hover:border-red-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {cancelling === request.id ? (
                                <i className="fa-solid fa-spinner fa-spin"></i>
                              ) : (
                                <>
                                  <i className="fa-solid fa-trash text-sm"></i>
                                  <span className="ml-2">Cancel</span>
                                </>
                              )}
                            </button>
                          </>
                        )}

                        {request.status === 'ACCEPTED' && (
                          <div className="flex flex-col gap-2">
                            <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                              ✅ You are now assigned to this supervisor
                            </div>
                            <a
                              href="/student/appointments"
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center gap-2 justify-center"
                            >
                              <i className="fa-solid fa-calendar-plus"></i>
                              Schedule Appointment
                            </a>
                            <a
                              href="/student/dashboard"
                              className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition text-sm flex items-center gap-2 justify-center"
                            >
                              <i className="fa-solid fa-user"></i>
                              View Supervisor
                            </a>
                          </div>
                        )}

                        {request.status === 'DECLINED' && (
                          <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            ❌ Request was declined
                          </div>
                        )}

                        {request.status === 'SLOT_FULL' && (
                          <div className="px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
                            ⚠️ Supervisor slots are full
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <i className="fa-solid fa-circle-info text-blue-600 mr-2"></i>
                  Once a request is <span className="font-semibold">accepted</span>, you'll be assigned to that supervisor and can start booking appointments.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}
