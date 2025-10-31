'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supervisorAPI, studentAPI, SupervisorProfile } from '@/app/lib/api-client';

export default function SupervisorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supervisorId = params.id as string;

  const [supervisor, setSupervisor] = useState<SupervisorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSupervisorDetails();
  }, [supervisorId]);

  const fetchSupervisorDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await supervisorAPI.getById(supervisorId);
      setSupervisor(response.supervisor);
    } catch (err) {
      console.error('Failed to fetch supervisor details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load supervisor details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!supervisor) return;

    try {
      setIsSubmitting(true);
      await studentAPI.sendRequest(supervisor.id);
      alert('Request sent successfully!');
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to send request:', err);
      alert(err instanceof Error ? err.message : 'Failed to send request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading supervisor details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !supervisor) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error || 'Supervisor not found'}</p>
            <button
              onClick={() => router.push('/supervisors')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Back to Supervisors
            </button>
          </div>
        </div>
      </main>
    );
  }

  const availableSlots = supervisor.maxSlots - supervisor.currentSlots;
  const isAvailable = availableSlots > 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.push('/supervisors')}
          className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Supervisors
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {supervisor.user?.name || 'Unknown'}
                </h1>
                <p className="text-blue-100 text-lg mb-1">
                  {supervisor.user?.email}
                </p>
                <div className="inline-block bg-blue-500 bg-opacity-50 px-3 py-1 rounded-full text-sm font-medium">
                  {supervisor.specialization}
                </div>
              </div>

              {/* Availability Badge */}
              <div className="text-right">
                <div
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                    isAvailable
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {isAvailable ? '● Available' : '● Full'}
                </div>
                <p className="text-blue-100 text-sm mt-2">
                  {availableSlots} / {supervisor.maxSlots} slots available
                </p>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Bio */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                About
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {supervisor.bio}
              </p>
            </div>

            {/* Tags/Expertise */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Research Interests & Expertise
              </h2>
              <div className="flex flex-wrap gap-2">
                {supervisor.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {supervisor.maxSlots}
                </p>
                <p className="text-sm text-gray-600">Max Slots</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {supervisor.currentSlots}
                </p>
                <p className="text-sm text-gray-600">Current Students</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {availableSlots}
                </p>
                <p className="text-sm text-gray-600">Available</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleSendRequest}
                disabled={!isAvailable || isSubmitting}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                  isAvailable && !isSubmitting
                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting
                  ? 'Sending Request...'
                  : isAvailable
                  ? 'Send Supervision Request'
                  : 'No Slots Available'}
              </button>
              <button
                onClick={() => router.push('/supervisors')}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Browse Others
              </button>
            </div>

            {!isAvailable && (
              <p className="mt-4 text-sm text-gray-600 text-center">
                This supervisor has reached their maximum capacity. Please check
                back later or browse other supervisors.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
