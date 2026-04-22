'use client';

import { useState, useEffect } from 'react';
import RouteGuard from '@/app/components/RouteGuard';
import { schedulingAPI, assignmentAPI } from '@/app/lib/api-client';
import { useToast } from '@/app/context/ToastContext';
import { formatDate, formatDateTime } from '@/app/lib/utils';

interface Availability {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    slot_duration: number;
}

interface Appointment {
    id: string;
    dateTime: string;
    duration: number;
    status: string;
    notes: string;
    supervisor: {
        name: string;
        email: string;
        department: string;
    };
}

export default function AppointmentsPage() {
    const { addToast } = useToast();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [availability, setAvailability] = useState<Availability[]>([]);
    const [assignment, setAssignment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showBookForm, setShowBookForm] = useState(false);
    const [booking, setBooking] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ availabilityId: string; dateTime: string } | null>(null);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [appointmentsData, assignmentData] = await Promise.all([
                schedulingAPI.getAppointments({ upcoming: true }),
                assignmentAPI.getStudentAssignment()
            ]);
            setAppointments(appointmentsData.appointments || []);
            setAssignment(assignmentData.assignment);

            // Fetch supervisor's availability if assigned
            if (assignmentData.assignment?.supervisorId) {
                const availData = await schedulingAPI.getAvailability(assignmentData.assignment.supervisorId);
                setAvailability(availData.availability || []);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            addToast('Failed to fetch data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const generateTimeSlots = (slot: Availability) => {
        const slots: { time: string; dateTime: string }[] = [];
        const startParts = slot.start_time.split(':').map(Number);
        const endParts = slot.end_time.split(':').map(Number);
        const startMinutes = startParts[0] * 60 + startParts[1];
        const endMinutes = endParts[0] * 60 + endParts[1];

        // Extract just the date part (YYYY-MM-DD) in case slot.date has timezone info
        const datePart = slot.date.split('T')[0];

        for (let mins = startMinutes; mins + slot.slot_duration <= endMinutes; mins += slot.slot_duration) {
            const hours = Math.floor(mins / 60);
            const minutes = mins % 60;
            const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            const dateTime = `${datePart} ${timeStr}:00`;
            slots.push({ time: timeStr, dateTime });
        }
        return slots;
    };

    const handleBook = async () => {
        if (!selectedSlot) return;
        try {
            setBooking(true);
            await schedulingAPI.bookAppointment({
                availabilityId: selectedSlot.availabilityId,
                dateTime: selectedSlot.dateTime,
                notes: notes || undefined
            });
            addToast('Appointment booked successfully', 'success');
            setShowBookForm(false);
            setSelectedSlot(null);
            setNotes('');
            fetchData();
        } catch (err: any) {
            addToast(err.message || 'Failed to book appointment', 'error');
        } finally {
            setBooking(false);
        }
    };

    const handleCancel = async (appointmentId: string) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            await schedulingAPI.updateAppointmentStatus(appointmentId, 'CANCELLED');
            addToast('Appointment cancelled', 'success');
            fetchData();
        } catch (err: any) {
            addToast(err.message || 'Failed to cancel appointment', 'error');
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            PENDING: 'bg-yellow-100 text-yellow-700',
            CONFIRMED: 'bg-green-100 text-green-700',
            CANCELLED: 'bg-red-100 text-red-700',
            COMPLETED: 'bg-gray-100 text-gray-700'
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <RouteGuard allowedRoles={['STUDENT']}>
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 pt-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
                            <p className="text-gray-600 mt-1">Book and manage appointments with your supervisor</p>
                        </div>
                        {assignment && (
                            <button
                                onClick={() => setShowBookForm(!showBookForm)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                            >
                                <i className={`fa-solid ${showBookForm ? 'fa-times' : 'fa-calendar-plus'}`}></i>
                                {showBookForm ? 'Cancel' : 'Book Appointment'}
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600 mt-2">Loading...</p>
                        </div>
                    ) : !assignment ? (
                        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                            <i className="fa-solid fa-user-slash text-4xl text-gray-300 mb-4"></i>
                            <p className="text-gray-600">You need to be assigned to a supervisor to book appointments</p>
                        </div>
                    ) : (
                        <>
                            {/* Book Appointment Form */}
                            {showBookForm && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                        Book with {assignment.supervisor?.user?.name || 'your supervisor'}
                                    </h2>

                                    {availability.length === 0 ? (
                                        <p className="text-gray-600 text-center py-4">
                                            No available slots. Please check back later.
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-sm text-gray-600">Select an available time slot:</p>
                                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                                {availability.map((slot) => (
                                                    <div key={slot.id} className="border border-gray-200 rounded-lg p-3">
                                                        <p className="font-medium text-gray-900 mb-2">{formatDate(slot.date)}</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {generateTimeSlots(slot).map((timeSlot) => (
                                                                <button
                                                                    key={timeSlot.dateTime}
                                                                    onClick={() => setSelectedSlot({
                                                                        availabilityId: slot.id,
                                                                        dateTime: timeSlot.dateTime
                                                                    })}
                                                                    className={`px-3 py-1 rounded-lg text-sm transition ${selectedSlot?.dateTime === timeSlot.dateTime
                                                                        ? 'bg-blue-600 text-white'
                                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                        }`}
                                                                >
                                                                    {timeSlot.time}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {selectedSlot && (
                                                <div className="mt-4 space-y-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Notes (optional)
                                                        </label>
                                                        <textarea
                                                            value={notes}
                                                            onChange={(e) => setNotes(e.target.value)}
                                                            placeholder="What would you like to discuss?"
                                                            rows={2}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={handleBook}
                                                        disabled={booking}
                                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                                                    >
                                                        {booking ? 'Booking...' : 'Confirm Booking'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Appointments List */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900">Your Appointments</h2>
                                </div>

                                {appointments.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <i className="fa-solid fa-calendar text-4xl text-gray-300 mb-4"></i>
                                        <p className="text-gray-600">No upcoming appointments</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-200">
                                        {appointments.map((apt) => (
                                            <div key={apt.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                                        <i className="fa-solid fa-calendar-check text-blue-600"></i>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{formatDateTime(apt.dateTime)}</p>
                                                        <p className="text-sm text-gray-600">
                                                            with {apt.supervisor.name}
                                                            <span className="mx-2">•</span>
                                                            {apt.duration} minutes
                                                        </p>
                                                        {apt.notes && (
                                                            <p className="text-sm text-gray-500 mt-1">"{apt.notes}"</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(apt.status)}`}>
                                                        {apt.status}
                                                    </span>
                                                    {(apt.status === 'PENDING') && (
                                                        <button
                                                            onClick={() => handleCancel(apt.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                            title="Cancel"
                                                        >
                                                            <i className="fa-solid fa-times"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </RouteGuard>
    );
}
