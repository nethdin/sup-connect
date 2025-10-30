'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserRole } from '@/app/lib/types';

export default function RegisterForm() {
  const [step, setStep] = useState(1); // Step 1: Basic Info, Step 2: Role-Specific Info
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'STUDENT' as UserRole,
    // Student-specific fields
    department: '',
    registrationNo: '',
    researchInterests: '',
    preferredFields: [] as string[],
    // Supervisor-specific fields
    specialization: '',
    tags: '',
    bio: '',
    maxSlots: '5',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Step 1 validation
    if (step === 1) {
      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!formData.email.includes('@'))
        newErrors.email = 'Invalid email format';
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8)
        newErrors.password = 'Password must be at least 8 characters';
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = 'Passwords do not match';
    }

    // Step 2 validation
    if (step === 2) {
      // Student-specific validation
      if (formData.role === 'STUDENT') {
        if (!formData.department) newErrors.department = 'Department is required';
        if (!formData.registrationNo) newErrors.registrationNo = 'Registration number is required';
      }

      // Supervisor-specific validation
      if (formData.role === 'SUPERVISOR') {
        if (!formData.department) newErrors.department = 'Department is required';
        if (!formData.specialization) newErrors.specialization = 'Specialization is required';
        if (!formData.tags) newErrors.tags = 'Tags are required';
        if (!formData.bio) newErrors.bio = 'Bio is required';
        if (!formData.maxSlots || parseInt(formData.maxSlots) < 1) 
          newErrors.maxSlots = 'Max slots must be at least 1';
      }
    }

    return newErrors;
  };

  const handleNext = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();

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

      // Add role-specific fields
      if (formData.role === 'STUDENT') {
        payload.department = formData.department;
        payload.registrationNo = formData.registrationNo;
        if (formData.researchInterests) payload.researchInterests = formData.researchInterests;
        if (formData.preferredFields.length > 0) payload.preferredFields = formData.preferredFields;
      } else if (formData.role === 'SUPERVISOR') {
        payload.department = formData.department;
        payload.specialization = formData.specialization;
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
        setErrors({ submit: error.message || 'Registration failed' });
        return;
      }

      // TODO: Redirect to login or dashboard
      alert('Registration successful! Please log in.');
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-2">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className={`h-1 w-12 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
        </div>
      </div>

      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {errors.submit}
        </div>
      )}

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              I am a...
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
              <option value="STUDENT">Student</option>
              <option value="SUPERVISOR">Supervisor</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={handleNext}
            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Next
          </button>
        </>
      )}

      {/* Step 2: Role-Specific Information */}
      {step === 2 && (
        <>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {formData.role === 'STUDENT' ? 'Student Information' : 'Supervisor Profile'}
          </h2>

          {/* Department (Common for both) */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                errors.department ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Computer Science"
            />
            {errors.department && (
              <p className="mt-1 text-sm text-red-600">{errors.department}</p>
            )}
          </div>

          {/* Student-specific fields */}
          {formData.role === 'STUDENT' && (
            <>
              {/* Registration Number */}
              <div>
                <label htmlFor="registrationNo" className="block text-sm font-medium text-gray-700">
                  Registration Number
                </label>
                <input
                  type="text"
                  id="registrationNo"
                  name="registrationNo"
                  value={formData.registrationNo}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                    errors.registrationNo ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="2021/CS/001"
                />
                {errors.registrationNo && (
                  <p className="mt-1 text-sm text-red-600">{errors.registrationNo}</p>
                )}
              </div>

              {/* Research Interests (Optional) */}
              <div>
                <label htmlFor="researchInterests" className="block text-sm font-medium text-gray-700">
                  Research Interests <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <textarea
                  id="researchInterests"
                  name="researchInterests"
                  value={formData.researchInterests}
                  onChange={handleChange}
                  rows={2}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                  placeholder="Your research interests..."
                />
              </div>

              {/* Preferred Fields (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Fields <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['AI/ML', 'Web Dev', 'Mobile', 'Security', 'Data Sci', 'IoT'].map((field) => {
                    const fullField = field === 'Web Dev' ? 'Web Development' 
                      : field === 'Security' ? 'Cybersecurity'
                      : field === 'Data Sci' ? 'Data Science'
                      : field === 'Mobile' ? 'Mobile Apps' : field;
                    return (
                      <label key={field} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.preferredFields.includes(fullField)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData(prev => ({
                              ...prev,
                              preferredFields: checked
                                ? [...prev.preferredFields, fullField]
                                : prev.preferredFields.filter(f => f !== fullField)
                            }));
                          }}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{field}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Supervisor-specific fields */}
          {formData.role === 'SUPERVISOR' && (
            <>
              {/* Specialization */}
              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                  Specialization
                </label>
                <select
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                    errors.specialization ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select specialization</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile Apps">Mobile Apps</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Data Science">Data Science</option>
                  <option value="IoT">IoT</option>
                  <option value="Other">Other</option>
                </select>
                {errors.specialization && (
                  <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                  Keywords/Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                    errors.tags ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., ML, Python, CV"
                />
                {errors.tags && (
                  <p className="mt-1 text-sm text-red-600">{errors.tags}</p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none ${
                    errors.bio ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Your expertise and research areas..."
                />
                {errors.bio && (
                  <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
                )}
              </div>

              {/* Max Slots */}
              <div>
                <label htmlFor="maxSlots" className="block text-sm font-medium text-gray-700">
                  Maximum Students
                </label>
                <input
                  type="number"
                  id="maxSlots"
                  name="maxSlots"
                  value={formData.maxSlots}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                    errors.maxSlots ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.maxSlots && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxSlots}</p>
                )}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {isLoading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </>
      )}

      {/* Login Link */}
      <p className="text-center text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline font-medium">
          Log in
        </Link>
      </p>
    </form>
  );
}
