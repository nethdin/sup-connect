'use client';

import { useState, useEffect, useMemo } from 'react';
import { configAPI, Specialization, Tag } from '@/app/lib/api-client';

interface ProfileFormData {
  specialization: string;
  tags: string[];
  bio: string;
  maxSlots: number;
}

export default function SupervisorProfileForm() {
  const [formData, setFormData] = useState<ProfileFormData>({
    specialization: '',
    tags: [],
    bio: '',
    maxSlots: 5,
  });
  const [originalData, setOriginalData] = useState<ProfileFormData | null>(null);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [success, setSuccess] = useState(false);

  // Fetch existing profile and specializations on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsFetching(true);
      const token = localStorage.getItem('authToken');

      // Fetch profile, specializations and tags in parallel
      const [profileRes, specsRes, tagsRes] = await Promise.all([
        fetch('/api/supervisor/profile', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        configAPI.getSpecializations(),
        configAPI.getTags(),
      ]);

      setSpecializations(specsRes.specializations);
      setAvailableTags(tagsRes.tags);

      if (profileRes.ok) {
        const data = await profileRes.json();
        if (data.profile) {
          const profileData: ProfileFormData = {
            specialization: data.profile.specialization || '',
            tags: data.profile.tags || [],
            bio: data.profile.bio || '',
            maxSlots: data.profile.maxSlots || 5,
          };
          setFormData(profileData);
          setOriginalData(profileData);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsFetching(false);
    }
  };

  // Check if form has changes compared to original data
  const hasChanges = useMemo(() => {
    if (!originalData) {
      // No original data means it's a new profile - enable if form is valid
      return formData.specialization !== '' &&
        formData.tags.length > 0 &&
        formData.bio.trim() !== '';
    }

    // Compare current form data with original
    return (
      formData.specialization !== originalData.specialization ||
      formData.bio !== originalData.bio ||
      formData.maxSlots !== originalData.maxSlots ||
      formData.tags.length !== originalData.tags.length ||
      !formData.tags.every((tag, index) => tag === originalData.tags[index])
    );
  }, [formData, originalData]);

  const handleSpecializationChange = (value: string) => {
    setFormData((prev) => ({ ...prev, specialization: value }));
    setSuccess(false);
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, bio: e.target.value }));
    setSuccess(false);
  };

  const handleMaxSlotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0) {
      setFormData((prev) => ({ ...prev, maxSlots: value }));
      setSuccess(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
      setSuccess(false);
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
    setSuccess(false);
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
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/supervisor/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        setErrors({ submit: error.message || 'Failed to save profile' });
        return;
      }

      setSuccess(true);
      setErrors({});
      // Update original data to current form data after successful save
      setOriginalData({ ...formData });
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading profile...</span>
      </div>
    );
  }

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
          className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.specialization ? 'border-red-500' : 'border-gray-300'
            }`}
        >
          <option value="">Select a specialization</option>
          {specializations.map((spec) => (
            <option key={spec.id} value={spec.name}>
              {spec.name}
            </option>
          ))}
        </select>
        {errors.specialization && (
          <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Research Tags / Expertise</label>
        <p className="text-sm text-gray-500 mb-3">Select tags that match your expertise (required):</p>

        {/* Group tags by category */}
        {Object.entries(
          availableTags.reduce((acc, tag) => {
            const cat = tag.category || 'Other';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(tag);
            return acc;
          }, {} as Record<string, Tag[]>)
        ).map(([category, tags]) => (
          <div key={category} className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{category}</h4>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <label
                  key={tag.id}
                  className={`cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium border transition ${formData.tags.includes(tag.name)
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'
                    }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.tags.includes(tag.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag.name] }));
                      } else {
                        setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag.name) }));
                      }
                    }}
                  />
                  {formData.tags.includes(tag.name) && <i className="fa-solid fa-check mr-1"></i>}
                  {tag.name}
                </label>
              ))}
            </div>
          </div>
        ))}

        {formData.tags.length > 0 && (
          <p className="text-sm text-brand-600 mt-2">
            <i className="fa-solid fa-check-circle mr-1"></i>
            {formData.tags.length} tag(s) selected
          </p>
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
          className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.bio ? 'border-red-500' : 'border-gray-300'
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
          className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.maxSlots ? 'border-red-500' : 'border-gray-300'
            }`}
        />
        {errors.maxSlots && (
          <p className="mt-1 text-sm text-red-600">{errors.maxSlots}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {hasChanges && originalData && (
          <button
            type="button"
            onClick={() => {
              setFormData({ ...originalData });
              setErrors({});
              setSuccess(false);
            }}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
          >
            Revert Changes
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || !hasChanges}
          className={`flex-1 px-4 py-2 font-medium rounded-lg transition ${hasChanges
            ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          {isLoading ? 'Saving...' : hasChanges ? 'Save Changes' : 'No Changes'}
        </button>
      </div>
    </form>
  );
}
