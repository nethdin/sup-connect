'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProjectIdeaForm from '@/app/components/student/ProjectIdeaForm';
import RouteGuard from '@/app/components/RouteGuard';
import { studentAPI } from '@/app/lib/api-client';

export default function StudentIdeaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasIdea, setHasIdea] = useState(false);

  useEffect(() => {
    checkExistingIdea();
  }, []);

  const checkExistingIdea = async () => {
    try {
      const { projectIdea } = await studentAPI.getIdea();
      if (projectIdea) {
        setHasIdea(true);
        // Redirect to dashboard with a message
        setTimeout(() => {
          router.push('/student/dashboard');
        }, 2000);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking project idea:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <RouteGuard allowedRoles={['STUDENT']}>
        <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        </main>
      </RouteGuard>
    );
  }

  if (hasIdea) {
    return (
      <RouteGuard allowedRoles={['STUDENT']}>
        <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Project Idea Already Submitted
                </h1>
                <p className="text-gray-600 mb-4">
                  You have already submitted a project idea. You can edit it from your dashboard.
                </p>
                <p className="text-sm text-gray-500">
                  Redirecting to dashboard...
                </p>
              </div>
            </div>
          </div>
        </main>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={['STUDENT']}>
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Submit Your Project Idea
            </h1>
            <p className="text-gray-600 mb-8">
              Tell us about your final-year project and get matched with the perfect supervisor
            </p>

            <ProjectIdeaForm onSubmit={() => router.push('/student/dashboard')} />
          </div>
        </div>
      </main>
    </RouteGuard>
  );
}
