'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supervisorAPI, studentAPI, configAPI, SupervisorProfile as ApiSupervisorProfile, Specialization } from '@/app/lib/api-client';
import SupervisorCard from '@/app/components/supervisor/SupervisorCard';
import { SupervisorProfile } from '@/app/lib/types';
import RouteGuard from '@/app/components/RouteGuard';
import { useToast } from '@/app/context/ToastContext';

export default function SupervisorsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [supervisors, setSupervisors] = useState<SupervisorProfile[]>([]);
  const [filteredSupervisors, setFilteredSupervisors] = useState<
    SupervisorProfile[]
  >([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch supervisors and specializations in parallel
      const [supervisorsRes, specsRes] = await Promise.all([
        supervisorAPI.getAll(),
        configAPI.getSpecializations(),
      ]);

      setSupervisors(supervisorsRes.supervisors as SupervisorProfile[]);
      setFilteredSupervisors(supervisorsRes.supervisors as SupervisorProfile[]);
      setSpecializations(specsRes.specializations);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = supervisors;

    if (selectedSpecialization) {
      filtered = filtered.filter(
        (s) => s.specialization === selectedSpecialization
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    setFilteredSupervisors(filtered);
  }, [selectedSpecialization, searchTerm, supervisors]);

  const handleRequest = async (supervisorId: string) => {
    try {
      setIsSubmitting(true);
      await studentAPI.sendRequest(supervisorId);
      addToast('Request sent successfully!', 'success');
      // Optionally redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to send request:', err);
      addToast(err instanceof Error ? err.message : 'Failed to send request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewProfile = (supervisorId: string) => {
    router.push(`/supervisors/${supervisorId}`);
  };

  const content = () => (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Browse Supervisors
          </h1>
          <p className="text-gray-600">
            Find the perfect supervisor for your final-year project
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search */}
            <div>
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Search
              </label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, specialization, or tags..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Specialization Filter */}
            <div>
              <label
                htmlFor="specialization"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Specialization
              </label>
              <select
                id="specialization"
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec.id} value={spec.name}>
                    {spec.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <p className="mt-4 text-sm text-gray-600">
            Showing {filteredSupervisors.length} of {supervisors.length}{' '}
            supervisor{supervisors.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Supervisors Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading supervisors...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : filteredSupervisors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No supervisors found matching your criteria</p>
            {(selectedSpecialization || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedSpecialization('');
                  setSearchTerm('');
                }}
                className="mt-4 text-blue-600 hover:text-blue-700 underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSupervisors.map((supervisor) => (
              <SupervisorCard
                key={supervisor.id}
                supervisor={supervisor}
                onViewClick={() => handleViewProfile(supervisor.id)}
                onRequestClick={handleRequest}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );

  return (
    <RouteGuard allowedRoles={['STUDENT']}>
      {content()}
    </RouteGuard>
  );
}
