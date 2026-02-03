'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserRole } from '@/app/lib/types';

export default function RegisterForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'STUDENT' as UserRole,
    department: '',
    registrationNo: '',
    tags: '',
    bio: '',
    maxSlots: '5',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  // Calculate total steps based on role
  const totalSteps = formData.role === 'STUDENT' ? 3 : 4;

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/admin/departments');
        const data = await response.json();
        setDepartments(data.departments || []);
      } catch (err) {
        console.error('Failed to fetch departments:', err);
      } finally {
        setLoadingDepartments(false);
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!formData.email.includes('@')) newErrors.email = 'Invalid email format';
    }

    if (currentStep === 2) {
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    if (currentStep === 3) {
      if (!formData.department) newErrors.department = 'Department is required';

      if (formData.role === 'STUDENT') {
        if (!formData.registrationNo) newErrors.registrationNo = 'Registration number is required';
      } else {
        if (!formData.maxSlots || parseInt(formData.maxSlots) < 1) newErrors.maxSlots = 'Max slots must be at least 1';
      }
    }

    if (currentStep === 4 && formData.role === 'SUPERVISOR') {
      if (!formData.tags) newErrors.tags = 'Tags are required';
      if (!formData.bio) newErrors.bio = 'Bio is required';
    }

    return newErrors;
  };

  const handleNext = () => {
    const newErrors = validateStep(step);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateStep(step);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
      };

      if (formData.role === 'STUDENT') {
        payload.department = formData.department;
        payload.registrationNo = formData.registrationNo;
      } else if (formData.role === 'SUPERVISOR') {
        payload.department = formData.department;
        payload.tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        payload.bio = formData.bio;
        payload.maxSlots = parseInt(formData.maxSlots);
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        setErrors({ submit: error.error || 'Registration failed' });
        return;
      }

      const data = await response.json();

      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        document.cookie = `authToken=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
      }

      if (data.user.role === 'SUPERVISOR') {
        window.location.href = '/supervisor/dashboard';
      } else if (data.user.role === 'STUDENT') {
        window.location.href = '/student/dashboard';
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 min-h-[280px]">
      {/* Step Indicators */}
      <div className="flex items-center justify-center space-x-2 mb-4">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${step > i ? 'w-6 bg-blue-600' : step === i + 1 ? 'w-6 bg-blue-600' : 'w-2 bg-gray-200'
              }`}
          />
        ))}
      </div>

      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
          {errors.submit}
        </div>
      )}

      {/* Step 1: Identity */}
      {step === 1 && (
        <div className="space-y-3 animate-fadeIn">
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              autoFocus
              className={`block w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="John Doe"
            />
            {errors.name && <p className="mt-0.5 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`block w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-0.5 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="role" className="block text-xs font-medium text-gray-700 mb-1">
              I am a...
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
              <option value="STUDENT">Student</option>
              <option value="SUPERVISOR">Supervisor</option>
            </select>
          </div>
        </div>
      )}

      {/* Step 2: Security */}
      {step === 2 && (
        <div className="space-y-3 animate-fadeIn">
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoFocus
              className={`block w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-0.5 text-xs text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`block w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="mt-0.5 text-xs text-red-600">{errors.confirmPassword}</p>}
          </div>
        </div>
      )}

      {/* Step 3: Academic Details */}
      {step === 3 && (
        <div className="space-y-3 animate-fadeIn">
          <div>
            <label htmlFor="department" className="block text-xs font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              disabled={loadingDepartments}
              autoFocus
              className={`block w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">{loadingDepartments ? 'Loading...' : 'Select Department'}</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
            {errors.department && <p className="mt-0.5 text-xs text-red-600">{errors.department}</p>}
          </div>

          {formData.role === 'STUDENT' ? (
            <div>
              <label htmlFor="registrationNo" className="block text-xs font-medium text-gray-700 mb-1">
                Registration Number
              </label>
              <input
                type="text"
                id="registrationNo"
                name="registrationNo"
                value={formData.registrationNo}
                onChange={handleChange}
                className={`block w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.registrationNo ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="2021/CS/001"
              />
              {errors.registrationNo && <p className="mt-0.5 text-xs text-red-600">{errors.registrationNo}</p>}
            </div>
          ) : (
            <div>
              <label htmlFor="maxSlots" className="block text-xs font-medium text-gray-700 mb-1">
                Max Students
              </label>
              <input
                type="number"
                id="maxSlots"
                name="maxSlots"
                value={formData.maxSlots}
                onChange={handleChange}
                min="1"
                max="10"
                className={`block w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.maxSlots ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.maxSlots && <p className="mt-0.5 text-xs text-red-600">{errors.maxSlots}</p>}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Supervisor Profile (Only for Supervisor) */}
      {step === 4 && formData.role === 'SUPERVISOR' && (
        <div className="space-y-3 animate-fadeIn">
          <div>
            <label htmlFor="tags" className="block text-xs font-medium text-gray-700 mb-1">
              Keywords/Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              autoFocus
              className={`block w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.tags ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., Machine Learning, IoT"
            />
            {errors.tags && <p className="mt-0.5 text-xs text-red-600">{errors.tags}</p>}
          </div>

          <div>
            <label htmlFor="bio" className="block text-xs font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className={`block w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none ${errors.bio ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Brief description of your research interests..."
            />
            {errors.bio && <p className="mt-0.5 text-xs text-red-600">{errors.bio}</p>}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        {step > 1 && (
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
          >
            Back
          </button>
        )}

        {step < totalSteps ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {isLoading ? 'Creating...' : 'Create Account'}
          </button>
        )}
      </div>
    </form>
  );
}
