'use client';

import { useState, useEffect } from 'react';
import RouteGuard from '@/app/components/RouteGuard';
import { schedulingAPI } from '@/app/lib/api-client';
import { useToast } from '@/app/context/ToastContext';
import { formatDate } from '@/app/lib/utils';

interface Availability {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    slot_duration: number;
    booked_slots: number;
}

export default function AvailabilityPage() {
    const { addToast } = useToast();
    const [availability, setAvailability] = useState<Availability[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        date: '',
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 30
    });

    useEffect(() => {
        fetchAvailability();
    }, []);

    const fetchAvailability = async () => {
        try {
            setLoading(true);
            const data = await schedulingAPI.getAvailability();
            setAvailability(data.availability || []);
        } catch (err) {
            console.error('Error fetching availability:', err);
            addToast('Failed to fetch availability', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await schedulingAPI.createAvailability({
                date: formData.date,
                startTime: formData.startTime,
                endTime: formData.endTime,
                slotDuration: formData.slotDuration
            });
            addToast('Availability created successfully', 'success');
            setShowForm(false);
            setFormData({ date: '', startTime: '09:00', endTime: '17:00', slotDuration: 30 });
            fetchAvailability();
        } catch (err: any) {
            addToast(err.message || 'Failed to create availability', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this availability slot?')) return;
        try {
            await schedulingAPI.deleteAvailability(id);
            addToast('Availability deleted', 'success');
            fetchAvailability();
        } catch (err: any) {
            addToast(err.message || 'Failed to delete availability', 'error');
        }
    };

    // Get min/max dates (today to 30 days ahead)
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    const maxDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return (
        <RouteGuard allowedRoles={['SUPERVISOR']}>
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 pt-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Availability Management</h1>
                            <p className="text-gray-600 mt-1">Set your available time slots for student appointments</p>
                        </div>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            <i className={`fa-solid ${showForm ? 'fa-times' : 'fa-plus'}`}></i>
                            {showForm ? 'Cancel' : 'Add Availability'}
                        </button>
                    </div>

                    {/* Add Form */}
                    {showForm && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Availability Slot</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            min={minDate}
                                            max={maxDate}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration (mins)</label>
                                        <select
                                            value={formData.slotDuration}
                                            onChange={(e) => setFormData({ ...formData, slotDuration: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value={15}>15 minutes</option>
                                            <option value={30}>30 minutes</option>
                                            <option value={45}>45 minutes</option>
                                            <option value={60}>60 minutes</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            value={formData.startTime}
                                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                        <input
                                            type="time"
                                            value={formData.endTime}
                                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                                    >
                                        {saving ? 'Saving...' : 'Add Availability'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Availability List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Your Availability (Next 30 Days)</h2>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-600 mt-2">Loading availability...</p>
                            </div>
                        ) : availability.length === 0 ? (
                            <div className="p-8 text-center">
                                <i className="fa-solid fa-calendar-xmark text-4xl text-gray-300 mb-4"></i>
                                <p className="text-gray-600">No availability slots set</p>
                                <p className="text-gray-500 text-sm mt-1">Click "Add Availability" to create time slots for student appointments</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {availability.map((slot) => (
                                    <div key={slot.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <i className="fa-solid fa-calendar text-blue-600"></i>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{formatDate(slot.date)}</p>
                                                <p className="text-sm text-gray-600">
                                                    {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                                                    <span className="mx-2">•</span>
                                                    {slot.slot_duration} min slots
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {slot.booked_slots > 0 && (
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                                    {slot.booked_slots} booked
                                                </span>
                                            )}
                                            <button
                                                onClick={() => handleDelete(slot.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                title="Delete"
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </RouteGuard>
    );
}
