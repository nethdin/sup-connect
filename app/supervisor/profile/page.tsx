import SupervisorProfileForm from '@/app/components/supervisor/ProfileForm';

export const metadata = {
  title: 'Create Profile | Sup-Connect',
  description: 'Complete your supervisor profile',
};

export default function SupervisorProfilePage() {
  return (
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
  );
}
