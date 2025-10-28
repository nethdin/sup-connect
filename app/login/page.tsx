import LoginForm from '@/app/components/auth/LoginForm';

export const metadata = {
  title: 'Login | Sup-Connect',
  description: 'Sign in to your Sup-Connect account',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600 mb-8">
            Sign in to your Sup-Connect account
          </p>

          <LoginForm />
        </div>
      </div>
    </main>
  );
}
