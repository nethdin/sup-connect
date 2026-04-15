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
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {request.student_name}
                              </h3>
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(request.status)}`}
                              >
                                <span>{getStatusIcon(request.status)}</span>
                                {request.status}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600">{request.student_email}</p>

                            <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                              <span>📅 Requested: {formatDate(request.created_at)}</span>
                              {request.responded_at && (
                                <span>⏱️ Responded: {formatDate(request.responded_at)}</span>
                              )}
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex gap-2">
                            {request.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleAccept(request.id)}
                                  disabled={processing === request.id}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition disabled:cursor-not-allowed flex items-center gap-2"
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
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition disabled:cursor-not-allowed flex items-center gap-2"
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

                            {request.projectIdea && (
                              <button
                                onClick={() => toggleExpand(request.id)}
                                className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition flex items-center gap-2"
                              >
                                <i
                                  className={`fa-solid fa-chevron-${expandedRequest === request.id ? 'up' : 'down'}`}
                                ></i>
                                Project Details
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Project Idea Preview */}
                        {request.projectIdea && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">📋</span>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">
                                  {request.projectIdea.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {request.projectIdea.description}
                                </p>
                                {request.projectIdea.tags?.length > 0 && (
                                  <div className="flex gap-2 mt-2 flex-wrap">
                                    {request.projectIdea.tags.slice(0, 3).map((tag, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                    {request.projectIdea.tags.length > 3 && (
                                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                        +{request.projectIdea.tags.length - 3}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Expanded Details */}
                        {expandedRequest === request.id && request.projectIdea && (
                          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg space-y-4">
                            <div>
                              <h5 className="text-sm font-semibold text-gray-700 uppercase mb-2">
                                Description
                              </h5>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {request.projectIdea.description}
                              </p>
                            </div>

                            {request.projectIdea.tags?.length > 0 && (
                              <div>
                                <h5 className="text-sm font-semibold text-gray-700 uppercase mb-2">
                                  Tags / Tech Stack
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                  {request.projectIdea.tags.map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div>
                              <h5 className="text-sm font-semibold text-gray-700 uppercase mb-1">
                                Submitted On
                              </h5>
                              <p className="text-sm text-gray-600">
                                {formatDate(request.projectIdea.createdAt)}
                              </p>
                            </div>
                          </div>
                        )}

                        {!request.projectIdea && (
                          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              <i className="fa-solid fa-exclamation-triangle mr-2"></i>
                              This student has not submitted a project idea yet.
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
