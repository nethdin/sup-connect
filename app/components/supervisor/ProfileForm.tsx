'use client';

import { useState } from 'react';
import { SPECIALIZATIONS } from '@/app/lib/utils';
import { SupervisorProfileFormData } from '@/app/lib/types';

export default function SupervisorProfileForm() {
  const [formData, setFormData] = useState<SupervisorProfileFormData>({
    specialization: '',
    tags: [],
    bio: '',
    maxSlots: 5,
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSpecializationChange = (value: string) => {
    setFormData((prev) => ({ ...prev, specialization: value }));
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, bio: e.target.value }));
  };

  const handleMaxSlotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0) {
      setFormData((prev) => ({ ...prev, maxSlots: value }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.specialization)
      newErrors.specialization = 'Specialization is required';
    if (formData.tags.length === 0) newErrors.tags = 'Add at least one tag';
    if (!formData.bio.trim()) newErrors.bio = 'Bio is required';
    if (formData.maxSlots < 1)
      newErrors.maxSlots = 'Must have at least 1 slot';

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/supervisor/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        setErrors({ submit: error.message || 'Failed to save profile' });
        return;
      }

      setSuccess(true);
      setErrors({});
      // TODO: Redirect to supervisor dashboard
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          Profile saved successfully!
        </div>
      )}

      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {errors.submit}
        </div>
      )}

      {/* Specialization */}
      <div>
        <label
          htmlFor="specialization"
          className="block text-sm font-medium text-gray-700"
        >
          Specialization
        </label>
        <select
          id="specialization"
          value={formData.specialization}
          onChange={(e) => handleSpecializationChange(e.target.value)}
          className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.specialization ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select a specialization</option>
          {SPECIALIZATIONS.map((spec) => (
            <option key={spec} value={spec}>
              {spec}
            </option>
          ))}
        </select>
        {errors.specialization && (
          <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Tags</label>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Add a tag (e.g., machine learning)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Add
          </button>
        </div>
        {formData.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-blue-700 hover:text-blue-900 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        {errors.tags && <p className="mt-1 text-sm text-red-600">{errors.tags}</p>}
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          id="bio"
          value={formData.bio}
          onChange={handleBioChange}
          rows={5}
          placeholder="Tell students about your expertise, research interests, and supervision style..."
          className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.bio ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio}</p>}
      </div>

      {/* Max Slots */}
      <div>
        <label
          htmlFor="maxSlots"
          className="block text-sm font-medium text-gray-700"
        >
          Maximum Student Slots
        </label>
        <input
          type="number"
          id="maxSlots"
          value={formData.maxSlots}
          onChange={handleMaxSlotsChange}
          min="1"
          max="20"
          className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.maxSlots ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.maxSlots && (
          <p className="mt-1 text-sm text-red-600">{errors.maxSlots}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
      >
        {isLoading ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}
