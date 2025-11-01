'use client';

import { useState } from 'react';
import { PROJECT_CATEGORIES } from '@/app/lib/utils';
import { studentAPI } from '@/app/lib/api-client';

interface ProjectIdeaFormProps {
  onSubmit?: (data: ProjectIdeaData) => void;
}

interface ProjectIdeaData {
  title: string;
  description: string;
  category: string;
  keywords: string[];
  attachments: File[];
}

export default function ProjectIdeaForm({ onSubmit }: ProjectIdeaFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    keywords: [] as string[],
    attachments: [] as File[],
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()],
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles],
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    else if (formData.description.length < 150)
      newErrors.description = 'Description must be at least 150 characters';
    else if (formData.description.length > 300)
      newErrors.description = 'Description must not exceed 300 characters';

    if (!formData.category) newErrors.category = 'Category is required';
    if (formData.keywords.length === 0)
      newErrors.keywords = 'Add at least one keyword';

    return newErrors;
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
      // Use the API client which includes authentication
      await studentAPI.submitIdea({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        keywords: formData.keywords,
        attachments: [], // TODO: Handle file uploads separately
      });

      // Success! Clear form and call onSubmit callback
      onSubmit?.(formData);
      setFormData({
        title: '',
        description: '',
        category: '',
        keywords: [],
        attachments: [],
      });
      setErrors({});
      
      // Show success message
      alert('Project idea submitted successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit idea';
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const charCount = formData.description.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {errors.submit}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Project Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Plant Disease Detection using CNN"
          className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <span className={`text-xs ${charCount > 300 ? 'text-red-600' : 'text-gray-500'}`}>
            {charCount} / 300
          </span>
        </div>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={6}
          placeholder="Describe your project idea in 150-300 characters. Include main goals, approach, and expected outcomes..."
          className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700"
        >
          Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.category ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select a category</option>
          {PROJECT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
        )}
      </div>

      {/* Keywords */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Keywords
        </label>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyPress={(e) =>
              e.key === 'Enter' && (e.preventDefault(), addKeyword())
            }
            placeholder="e.g., CNN, image processing, agriculture"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
          <button
            type="button"
            onClick={addKeyword}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Add
          </button>
        </div>
        {formData.keywords.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {formData.keywords.map((keyword) => (
              <span
                key={keyword}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => removeKeyword(keyword)}
                  className="text-blue-700 hover:text-blue-900 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        {errors.keywords && (
          <p className="mt-1 text-sm text-red-600">{errors.keywords}</p>
        )}
      </div>

      {/* File Upload */}
      <div>
        <label
          htmlFor="attachments"
          className="block text-sm font-medium text-gray-700"
        >
          Attachments (Optional)
        </label>
        <input
          type="file"
          id="attachments"
          multiple
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-medium
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {formData.attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {formData.attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <span className="text-sm text-gray-700">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-900 font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
      >
        {isLoading ? 'Submitting...' : 'Submit Project Idea'}
      </button>
    </form>
  );
}
