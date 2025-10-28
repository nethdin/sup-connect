import RegisterForm from '@/app/components/auth/RegisterForm';

export const metadata = {
  title: 'Register | Sup-Connect',
  description: 'Create your Sup-Connect account',
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create an Account
          </h1>
          <p className="text-gray-600 mb-8">
            Join Sup-Connect and find your perfect supervisor
          </p>

          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
