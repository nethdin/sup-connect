'use client';

import { useState, useEffect } from 'react';
import { SupervisorProfile } from '@/app/lib/types';
import { SPECIALIZATIONS } from '@/app/lib/utils';
import SupervisorCard from '@/app/components/supervisor/SupervisorCard';

export default function SupervisorsPage() {
  const [supervisors, setSupervisors] = useState<SupervisorProfile[]>([]);
  const [filteredSupervisors, setFilteredSupervisors] = useState<
    SupervisorProfile[]
  >([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    // Fetch supervisors from /api/supervisors
    const mockSupervisors: SupervisorProfile[] = [
      {
        id: '1',
        userId: 'user1',
        specialization: 'AI/ML',
        tags: ['deep learning', 'computer vision', 'NLP'],
        bio: 'Passionate about machine learning and AI. 10+ years experience in the field.',
        maxSlots: 5,
        currentSlots: 2,
        user: {
          id: 'user1',
          email: 'prof.smith@uni.edu',
          name: 'Prof. Smith',
          role: 'SUPERVISOR',
          createdAt: new Date(),
        },
      },
      {
        id: '2',
        userId: 'user2',
        specialization: 'Web Development',
        tags: ['React', 'Next.js', 'TypeScript'],
        bio: 'Full-stack web developer with focus on modern frameworks.',
        maxSlots: 4,
        currentSlots: 4,
        user: {
          id: 'user2',
          email: 'prof.jones@uni.edu',
          name: 'Prof. Jones',
          role: 'SUPERVISOR',
          createdAt: new Date(),
        },
      },
    ];

    setSupervisors(mockSupervisors);
    setFilteredSupervisors(mockSupervisors);
    setIsLoading(false);
  }, []);

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

  const handleRequest = (supervisorId: string) => {
    // TODO: Implement booking request logic
    alert(`Request sent to supervisor ${supervisorId}`);
  };

  return (
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
                {SPECIALIZATIONS.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
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
            <p className="text-gray-600">Loading supervisors...</p>
          </div>
        ) : filteredSupervisors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No supervisors found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSupervisors.map((supervisor) => (
              <SupervisorCard
                key={supervisor.id}
                supervisor={supervisor}
                onViewClick={() => {
                  // TODO: Navigate to supervisor detail page
                  alert(`View profile: ${supervisor.user?.name}`);
                }}
                onRequestClick={handleRequest}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
