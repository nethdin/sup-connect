'use client';

import { useState, useEffect } from 'react';
import RouteGuard from '@/app/components/RouteGuard';
import { supervisorAPI } from '@/app/lib/api-client';
import { useToast } from '@/app/context/ToastContext';
import { formatDate } from '@/app/lib/utils';

interface ProjectIdea {
  id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
}

interface BookingRequest {
  id: string;
  status: string;
  created_at: string;
  responded_at: string | null;
  student_user_id: string;
  student_name: string;
  student_email: string;
  projectIdea?: ProjectIdea;
}

export default function SupervisorRequestsPage() {
  const { addToast } = useToast();
  const [allRequests, setAllRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'SLOT_FULL'>('ALL');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await supervisorAPI.getRequests();
      setAllRequests(data.requests);
    } catch (err) {
      console.error('Error fetching requests:', err);
      addToast(err instanceof Error ? err.message : 'Failed to fetch requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      setProcessing(requestId);
      await supervisorAPI.acceptRequest(requestId);
      addToast('Request accepted successfully!', 'success');
      fetchRequests();
    } catch (err) {
      console.error('Error accepting request:', err);
      addToast(err instanceof Error ? err.message : 'Failed to accept request', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (requestId: string) => {
    if (!confirm('Are you sure you want to decline this request?')) {
      return;
    }

    try {
      setProcessing(requestId);
      await supervisorAPI.declineRequest(requestId);
      addToast('Request declined successfully', 'info');
      fetchRequests();
    } catch (err) {
      console.error('Error declining request:', err);
      addToast(err instanceof Error ? err.message : 'Failed to decline request', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const filteredRequests =
    filterStatus === 'ALL'
      ? allRequests
      : allRequests.filter((r) => r.status === filterStatus);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      DECLINED: 'bg-red-100 text-red-800',
      SLOT_FULL: 'bg-orange-100 text-orange-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      PENDING: '⏳',
      ACCEPTED: '✅',
      DECLINED: '❌',
      SLOT_FULL: '⚠️',
    };
    return icons[status] || '•';
  };

  const toggleExpand = (requestId: string) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  return (
    <RouteGuard allowedRoles={['SUPERVISOR']}>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 pt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Booking Requests</h1>
            <p className="text-gray-600 mt-1">Manage student supervision requests</p>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading requests...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-blue-600">{allRequests.length}</div>
                  <div className="text-sm text-gray-600">Total Requests</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-yellow-600">
                    {allRequests.filter((r) => r.status === 'PENDING').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-green-600">
                    {allRequests.filter((r) => r.status === 'ACCEPTED').length}
                  </div>
                  <div className="text-sm text-gray-600">Accepted</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-red-600">
                    {allRequests.filter((r) => r.status === 'DECLINED').length}
                  </div>
                  <div className="text-sm text-gray-600">Declined</div>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 flex-wrap">
                {(['ALL', 'PENDING', 'ACCEPTED', 'DECLINED', 'SLOT_FULL'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      filterStatus === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Requests List */}
              {filteredRequests.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <i className="fa-solid fa-inbox text-4xl text-gray-300 mb-4"></i>
                  <p className="text-gray-600">
                    {filterStatus === 'ALL'
                      ? 'No requests yet'
                      : `No ${filterStatus.toLowerCase()} requests`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition overflow-hidden"
                    >
                      {/* Request Header */}
                      <div className="p-6">
                        {/* Student & Status Information */}
                        <div className="flex items-start justify-between gap-4 mb-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {request.student_name}
                                </h3>
                                <p className="text-sm text-gray-500">{request.student_email}</p>
                              </div>
                            </div>
                            
                            {/* Request Status & Dates */}
                            <div className="flex items-center gap-4 flex-wrap">
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(request.status)}`}
                              >
                                <span>{getStatusIcon(request.status)}</span>
                                {request.status}
                              </span>
                              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                <span>📅 {formatDate(request.created_at)}</span>
                                {request.responded_at && (
                                  <span>⏱️ {formatDate(request.responded_at)}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex gap-2 flex-wrap">
                            {request.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleAccept(request.id)}
                                  disabled={processing === request.id}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                                >
                                  {processing === request.id ? (
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                  ) : (
                                    <>
                                      <i className="fa-solid fa-check"></i>
                                      Accept
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDecline(request.id)}
                                  disabled={processing === request.id}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                                >
                                  {processing === request.id ? (
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                  ) : (
                                    <>
                                      <i className="fa-solid fa-times"></i>
                                      Decline
                                    </>
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Project Idea Section - Collapsible */}
                        {request.projectIdea && (
                          <div className="border-t border-gray-200 pt-4">
                            <button
                              onClick={() => toggleExpand(request.id)}
                              className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 mb-3 w-full"
                            >
                              <i
                                className={`fa-solid fa-chevron-${expandedRequest === request.id ? 'down' : 'right'} text-gray-400`}
                              ></i>
                              <span>📋 Project Idea</span>
                            </button>

                            {expandedRequest === request.id && (
                              <div className="ml-4 space-y-3 text-sm">
                                <div>
                                  <h5 className="font-semibold text-gray-900 mb-1">
                                    {request.projectIdea.title}
                                  </h5>
                                  <p className="text-gray-600 whitespace-pre-wrap">
                                    {request.projectIdea.description}
                                  </p>
                                </div>

                                {request.projectIdea.tags?.length > 0 && (
                                  <div>
                                    <p className="text-gray-700 font-medium mb-2">Tags / Tech Stack:</p>
                                    <div className="flex flex-wrap gap-2">
                                      {request.projectIdea.tags.map((tag, idx) => (
                                        <span
                                          key={idx}
                                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                                  Submitted: {formatDate(request.projectIdea.createdAt)}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {!request.projectIdea && (
                          <div className="border-t border-gray-200 pt-4">
                            <p className="text-sm text-gray-500">
                              <i className="fa-solid fa-info-circle mr-2 text-gray-400"></i>
                              No project idea submitted yet
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Info Box */}
              {allRequests.some((r) => r.status === 'PENDING') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <i className="fa-solid fa-circle-info text-blue-600 mr-2"></i>
                    <span className="font-semibold">Accepting a request</span> will assign the student to you and create a supervision assignment. You can then schedule appointments with them.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}
