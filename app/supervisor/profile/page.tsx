'use client';

import SupervisorProfileForm from '@/app/components/supervisor/ProfileForm';
import RouteGuard from '@/app/components/RouteGuard';

export default function SupervisorProfilePage() {
  return (
    <RouteGuard allowedRoles={['SUPERVISOR']}>
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </h1>
            <p className="text-gray-600 mb-8">
              Help students find you by sharing your expertise and supervision details
            </p>

            <SupervisorProfileForm />
          </div>
        </div>
      </main>
    </RouteGuard>
  );
}
