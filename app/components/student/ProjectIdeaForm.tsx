'use client';

import { useState, useEffect } from 'react';
import { studentAPI, ProjectIdea, configAPI, ProjectCategory, Tag } from '@/app/lib/api-client';
import { useToast } from '@/app/context/ToastContext';
import TagSelector from '@/app/components/common/TagSelector';

interface ProjectIdeaFormProps {
  onSubmit?: (data: ProjectIdeaData) => void;
  initialData?: ProjectIdea | null;
  isEditing?: boolean;
}

interface ProjectIdeaData {
  title: string;
  description: string;
  category: string;
  keywords: string[];
  attachments: File[];
}

export default function ProjectIdeaForm({ onSubmit, initialData, isEditing = false }: ProjectIdeaFormProps) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    keywords: [] as string[],
    attachments: [] as File[],
  });
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Load categories and tags on mount
  useEffect(() => {
    Promise.all([
      configAPI.getCategories(),
      configAPI.getTags(),
    ]).then(([catRes, tagsRes]) => {
      setCategories(catRes.categories);
      setAvailableTags(tagsRes.tags);
    });
  }, []);

  // Load initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || '',
        keywords: initialData.keywords || [],
        attachments: [],
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    else if (formData.description.length < 200)
      newErrors.description = 'Description must be at least 200 characters';
    else if (formData.description.length > 1000)
      newErrors.description = 'Description must not exceed 1000 characters';

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
      const result = await studentAPI.submitIdea({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        keywords: formData.keywords,
        attachments: [], // TODO: Handle file uploads separately
      });

      // Success! Clear form and call onSubmit callback
      onSubmit?.(formData);

      if (!isEditing) {
        // Only clear form on new submission
        setFormData({
          title: '',
          description: '',
          category: '',
          keywords: [],
          attachments: [],
        });
      }

      setErrors({});

      // Show success message
      addToast(isEditing ? 'Project idea updated successfully!' : 'Project idea submitted successfully!', 'success');
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
          className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.title ? 'border-red-500' : 'border-gray-300'
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
          <span className={`text-xs ${charCount > 1000 ? 'text-red-600' : 'text-gray-500'}`}>
            {charCount} / 1000
          </span>
        </div>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={8}
          placeholder="Describe your project idea in 200-1000 characters. Include main goals, approach, and expected outcomes..."
          className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.description ? 'border-red-500' : 'border-gray-300'
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
          className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
        )}
      </div>

      {/* Keywords (Select from predefined tags) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Keywords
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Select keywords that describe your project, or use AI to suggest tags based on your description.
        </p>

        <TagSelector
          availableTags={availableTags}
          selectedTags={formData.keywords}
          onTagsChange={(keywords) => setFormData(prev => ({ ...prev, keywords }))}
          placeholder="Search or browse tags..."
          error={errors.keywords}
          showAIButton={formData.description.length >= 30}
          onAISuggest={async () => {
            if (formData.description.length < 30) {
              addToast('Please write at least 30 characters in description first', 'warning');
              return;
            }
            setAiLoading(true);
            try {
              const result = await configAPI.suggestTags(formData.description);
              setFormData(prev => ({ ...prev, keywords: result.suggestedTags }));
              if (result.newTagsCreated > 0) {
                // Refresh tags list to include new ones
                const tagsRes = await configAPI.getTags();
                setAvailableTags(tagsRes.tags);
                addToast(`AI suggested ${result.suggestedTags.length} tags (${result.newTagsCreated} new created)`, 'success');
              } else {
                addToast(`AI suggested ${result.suggestedTags.length} tags`, 'success');
              }
            } catch (err) {
              addToast(err instanceof Error ? err.message : 'Failed to get AI suggestions', 'error');
            } finally {
              setAiLoading(false);
            }
          }}
          aiLoading={aiLoading}
        />
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
        {isLoading ? (isEditing ? 'Updating...' : 'Submitting...') : (isEditing ? 'Update Project Idea' : 'Submit Project Idea')}
      </button>
    </form>
  );
}
