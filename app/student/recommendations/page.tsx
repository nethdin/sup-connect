'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { studentAPI, SupervisorProfile } from '@/app/lib/api-client';
import RecommendationList from '@/app/components/student/RecommendationList';
import RouteGuard from '@/app/components/RouteGuard';
import Link from 'next/link';
import { useToast } from '@/app/context/ToastContext';

interface RecommendationItem {
    supervisor: SupervisorProfile;
    matchedTags: string[];
    matchCount: number;
    isFullMatch: boolean;
    score: number;
}

type SortOption = 'match_count' | 'experience' | 'availability';

export default function RecommendationsPage() {
    const router = useRouter();
    const { addToast } = useToast();
    const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
    const [studentTags, setStudentTags] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>('match_count');
    const [fullMatchCount, setFullMatchCount] = useState(0);
    const [partialMatchCount, setPartialMatchCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasProjectIdea, setHasProjectIdea] = useState(true);

    useEffect(() => {
        fetchRecommendations(sortBy);
    }, [sortBy]);

    const fetchRecommendations = async (sort: SortOption) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await studentAPI.getMatches(sort);

            if (!response.recommendations || response.recommendations.length === 0) {
                setHasProjectIdea(!!response.projectIdea);
            }

            setRecommendations(response.recommendations);
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

    const handleSortChange = (newSort: SortOption) => {
        setSortBy(newSort);
    };

    const handleRequest = async (supervisorId: string) => {
        try {
            await studentAPI.sendRequest(supervisorId);
            addToast('Request sent successfully!', 'success');
            router.push('/dashboard');
        } catch (err) {
            console.error('Failed to send request:', err);
            addToast(err instanceof Error ? err.message : 'Failed to send request', 'error');
        }
    };

    return (
        <RouteGuard allowedRoles={['STUDENT']}>
            <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Supervisor Recommendations
                        </h1>
                        <p className="text-gray-600">
                            Supervisors matched to your project keywords using our criteria-based algorithm
                        </p>
                    </div>

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
                            <Link
                                href="/supervisors"
                                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Browse All Supervisors
                            </Link>
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
            </main>
        </RouteGuard>
    );
}
