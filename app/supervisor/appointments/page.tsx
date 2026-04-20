'use client';

import { useState, useEffect } from 'react';
import RouteGuard from '@/app/components/RouteGuard';
import { schedulingAPI } from '@/app/lib/api-client';
import { useToast } from '@/app/context/ToastContext';
import { formatDateTime } from '@/app/lib/utils';

interface Appointment {
  id: string;
  dateTime: string;
  duration: number;
  status: string;
  notes: string;
  student: {
    name: string;
    email: string;
  };
}

export default function SupervisorAppointmentsPage() {
  const { addToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('ALL');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await schedulingAPI.getSupervisorAppointments();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      addToast('Failed to fetch appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      await schedulingAPI.updateAppointmentStatus(appointmentId, newStatus);
      addToast(`Appointment marked as ${newStatus}`, 'success');
      fetchAppointments();
    } catch (err: any) {
      addToast(err.message || 'Failed to update appointment', 'error');
    }
  };

  const handleCancel = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    await handleUpdateStatus(appointmentId, 'CANCELLED');
  };

  const filteredAppointments =
    filterStatus === 'ALL'
      ? appointments
      : appointments.filter(apt => apt.status === filterStatus);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
      COMPLETED: 'bg-gray-100 text-gray-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      PENDING: '⏳',
      CONFIRMED: '✅',
      CANCELLED: '❌',
      COMPLETED: '✓',
    };
    return icons[status] || '•';
  };

  return (
    <RouteGuard allowedRoles={['SUPERVISOR']}>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-600 mt-1">View and manage appointments with your assigned students</p>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading appointments...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-blue-600">{appointments.length}</div>
                  <div className="text-sm text-gray-600">Total Appointments</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-yellow-600">
                    {appointments.filter(a => a.status === 'PENDING').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-green-600">
                    {appointments.filter(a => a.status === 'CONFIRMED').length}
                  </div>
                  <div className="text-sm text-gray-600">Confirmed</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-gray-600">
                    {appointments.filter(a => a.status === 'COMPLETED').length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 flex-wrap">
                {(['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map((status) => (
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

              {/* Appointments List */}
              {filteredAppointments.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <i className="fa-solid fa-calendar text-4xl text-gray-300 mb-4"></i>
                  <p className="text-gray-600">
                    {filterStatus === 'ALL'
                      ? 'No appointments yet'
                      : `No ${filterStatus.toLowerCase()} appointments`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments.map(apt => (
                    <div
                      key={apt.id}
                      className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {apt.student.name}
                            </h3>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(apt.status)}`}>
                              <span>{getStatusIcon(apt.status)}</span>
                              {apt.status}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600">{apt.student.email}</p>

                          <div className="mt-3 space-y-2">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">📅 Date & Time:</span> {formatDateTime(apt.dateTime)}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">⏱️ Duration:</span> {apt.duration} minutes
                            </p>
                            {apt.notes && (
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">📝 Notes:</span> {apt.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          {apt.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2"
                              >
                                <i className="fa-solid fa-check"></i>
                                Confirm
                              </button>
                              <button
                                onClick={() => handleCancel(apt.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm flex items-center gap-2"
                              >
                                <i className="fa-solid fa-times"></i>
                                Cancel
                              </button>
                            </>
                          )}

                          {apt.status === 'CONFIRMED' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center gap-2"
                              >
                                <i className="fa-solid fa-check-double"></i>
                                Mark Complete
                              </button>
                              <button
                                onClick={() => handleCancel(apt.id)}
                                className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition text-sm flex items-center gap-2"
                              >
                                <i className="fa-solid fa-times"></i>
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Info Box */}
              {appointments.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <i className="fa-solid fa-circle-info text-blue-600 mr-2"></i>
                    <span className="font-semibold">Confirm appointments</span> as students book them, and mark them as <span className="font-semibold">completed</span> after they occur.
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
