'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/app/components/auth/LoginForm';
import { getLoggedInUser, getUserDashboardUrl } from '@/app/lib/utils';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect if user is already logged in
    const user = getLoggedInUser();
    if (user) {
      router.push(getUserDashboardUrl(user.role));
    }
  }, [router]);

  return (
    <main className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 overflow-hidden pt-20">
      <div className="flex h-[600px] max-w-6xl w-full rounded-3xl shadow-2xl overflow-hidden bg-white">
        {/* Left Side - Branding & Welcome */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex-col justify-center items-center px-12 xl:px-16 relative overflow-hidden">
          {/* Animated Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400 rounded-full blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2"></div>

          <div className="relative z-10 text-center">
            {/* Logo/Brand */}
            <div className="mb-12">
              <div className="text-5xl font-bold text-white mb-4 tracking-tight">Sup-Connect</div>
              <p className="text-xl text-blue-100 leading-relaxed max-w-md mx-auto">
                Connecting supervisors and students for better mentorship experiences
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-5 text-left max-w-sm mx-auto">
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-lg text-white font-medium">Fast & secure authentication</span>
              </div>

              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <span className="text-lg text-white font-medium">Streamlined supervision</span>
              </div>

              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-lg text-white font-medium">Collaboration made easy</span>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="mt-12 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <svg className="w-5 h-5 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-blue-100 font-medium">Trusted by 500+ institutions</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex lg:w-1/2 w-full flex-col justify-center items-center bg-gradient-to-b from-white to-gray-50/50 px-6 sm:px-8 lg:px-8 py-4 overflow-hidden">
          <div className="w-full max-w-sm">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Sup-Connect</h1>
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 relative overflow-hidden">
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-50"></div>
              
              <div className="relative z-10">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h2>
                  <p className="text-sm text-gray-600">
                    Sign in to your account to continue
                  </p>
                </div>

                <LoginForm />

                {/* Divider */}
                <div className="my-6 relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500 text-xs font-medium">New to Sup-Connect?</span>
                  </div>
                </div>

                {/* Sign Up Link */}
                <a
                  href="/register"
                  className="group w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-white text-sm text-gray-700 font-semibold hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  Create an account
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}