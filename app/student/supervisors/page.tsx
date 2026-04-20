'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { studentAPI, supervisorAPI } from '@/app/lib/api-client';
import { Tag, SupervisorProfile } from '@/app/lib/types';
import RecommendationList from '@/app/components/student/RecommendationList';
import SupervisorCard from '@/app/components/supervisor/SupervisorCard';
import RouteGuard from '@/app/components/RouteGuard';
import Link from 'next/link';
import { useToast } from '@/app/context/ToastContext';

interface RecommendationItem {
    supervisor: SupervisorProfile;
    matchedTags: Tag[];
    matchCount: number;
    isFullMatch: boolean;
    score: number;
}

type SortOption = 'score' | 'match_count' | 'experience' | 'availability';
type TabType = 'recommended' | 'browse';

function StudentSupervisorsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { addToast } = useToast();
    
    // Tab management
    const [activeTab, setActiveTab] = useState<TabType>(
        (searchParams.get('tab') as TabType) || 'recommended'
    );

    // Recommendations state
    const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
    const [studentTags, setStudentTags] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>('score');
    const [fullMatchCount, setFullMatchCount] = useState(0);
    const [partialMatchCount, setPartialMatchCount] = useState(0);
    const [hasProjectIdea, setHasProjectIdea] = useState(true);

    // Browse all state
    const [supervisors, setSupervisors] = useState<SupervisorProfile[]>([]);
    const [filteredSupervisors, setFilteredSupervisors] = useState<SupervisorProfile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Common state
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load data based on active tab
    useEffect(() => {
        if (activeTab === 'recommended') {
            fetchRecommendations(sortBy);
        } else {
            fetchAllSupervisors();
        }
    }, [activeTab, sortBy]);

    const fetchRecommendations = async (sort: SortOption) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await studentAPI.getMatches(sort);

            if (!response.recommendations || response.recommendations.length === 0) {
                setHasProjectIdea(!!response.projectIdea);
            }

            setRecommendations(response.recommendations as unknown as RecommendationItem[]);
            setStudentTags(response.studentTags || []);
            setFullMatchCount(response.fullMatchCount || 0);
            setPartialMatchCount(response.partialMatchCount || 0);
        } catch (err) {
            console.error('Failed to fetch recommendations:', err);
            setError(err instanceof Error ? err.message : 'Failed to load recommendations');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAllSupervisors = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const supervisorsRes = await supervisorAPI.getAll();

            setSupervisors(supervisorsRes.supervisors as SupervisorProfile[]);
            setFilteredSupervisors(supervisorsRes.supervisors as SupervisorProfile[]);
        } catch (err) {
            console.error('Failed to fetch supervisors:', err);
            setError(err instanceof Error ? err.message : 'Failed to load supervisors');
        } finally {
            setIsLoading(false);
        }
    };

    // Filter supervisors based on search term
    useEffect(() => {
        if (activeTab !== 'browse') return;

        let filtered = supervisors;

        if (searchTerm) {
            filtered = filtered.filter(
                (s) =>
                    s.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.tags.some((tag) =>
                        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
            );
        }

        setFilteredSupervisors(filtered);
    }, [searchTerm, supervisors, activeTab]);

    const handleSortChange = (newSort: SortOption) => {
        setSortBy(newSort);
    };

    const handleRequest = async (supervisorId: string) => {
        try {
            setIsSubmitting(true);
            await studentAPI.sendRequest(supervisorId);
            addToast('Request sent successfully!', 'success');
            router.push('/student/dashboard');
        } catch (err) {
            console.error('Failed to send request:', err);
            addToast(err instanceof Error ? err.message : 'Failed to send request', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewProfile = (supervisorId: string) => {
        router.push(`/student/supervisors/${supervisorId}`);
    };

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        router.push(`?tab=${tab}`);
    };

    return (
        <RouteGuard allowedRoles={['STUDENT']}>
            <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Find Your Supervisor
                        </h1>
                        <p className="text-gray-600">
                            Browse recommended supervisors or search through all available options
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-4 mb-8 border-b border-gray-200">
                        <button
                            onClick={() => handleTabChange('recommended')}
                            className={`px-4 py-2 font-semibold border-b-2 transition ${activeTab === 'recommended'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Recommended for You
                        </button>
                        <button
                            onClick={() => handleTabChange('browse')}
                            className={`px-4 py-2 font-semibold border-b-2 transition ${activeTab === 'browse'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Browse All
                        </button>
                    </div>

                    {/* Recommended Tab Content */}
                    {activeTab === 'recommended' && (
                        <div>
                            {/* Keywords Display */}
                            {studentTags.length > 0 && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                                    <p className="text-sm text-gray-600 mb-2">Your project keywords:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {studentTags.map((keyword, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full"
                                            >
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Content */}
                            {isLoading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <p className="text-gray-600 mt-4">Finding matching supervisors...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-12">
                                    <p className="text-red-600 mb-4">{error}</p>
                                    <button
                                        onClick={() => fetchRecommendations(sortBy)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : !hasProjectIdea ? (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                        No Project Idea Found
                                    </h2>
                                    <p className="text-gray-600 mb-4">
                                        Submit a project idea first to get personalized supervisor recommendations.
                                    </p>
                                    <Link
                                        href="/student/idea"
                                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Submit Project Idea
                                    </Link>
                                </div>
                            ) : recommendations.length === 0 ? (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                        No Matches Found
                                    </h2>
                                    <p className="text-gray-600 mb-4">
                                        No supervisors match your project keywords. Try browsing all supervisors instead.
                                    </p>
                                    <button
                                        onClick={() => handleTabChange('browse')}
                                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Browse All Supervisors
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <RecommendationList
                                        recommendations={recommendations}
                                        sortBy={sortBy}
                                        onSortChange={handleSortChange}
                                        onRequest={handleRequest}
                                        fullMatchCount={fullMatchCount}
                                        partialMatchCount={partialMatchCount}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Browse All Tab Content */}
                    {activeTab === 'browse' && (
                        <div>
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
                                            placeholder="Search by name, bio, or tags..."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        />
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
                                        onClick={fetchAllSupervisors}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : filteredSupervisors.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600">No supervisors found matching your criteria</p>
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="mt-4 text-blue-600 hover:text-blue-700 underline"
                                        >
                                            Clear search
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
                    )}
                </div>
            </main>
        </RouteGuard>
    );
}

export default function StudentSupervisorsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 mt-4">Loading...</p>
                </div>
            </div>
        }>
            <StudentSupervisorsContent />
        </Suspense>
    );
}
