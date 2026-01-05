'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Tag } from '@/app/lib/api-client';

interface TagSelectorProps {
    availableTags: Tag[];
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    placeholder?: string;
    maxSelections?: number;
    disabled?: boolean;
    error?: string;
    showAIButton?: boolean;
    onAISuggest?: () => void;
    aiLoading?: boolean;
}

export default function TagSelector({
    availableTags,
    selectedTags,
    onTagsChange,
    placeholder = 'Search tags...',
    maxSelections,
    disabled = false,
    error,
    showAIButton = false,
    onAISuggest,
    aiLoading = false,
}: TagSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter tags based on search
    const filteredTags = useMemo(() => {
        if (!searchTerm) return availableTags;
        return availableTags.filter(tag =>
            tag.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [availableTags, searchTerm]);

    const toggleTag = (tagName: string) => {
        if (selectedTags.includes(tagName)) {
            onTagsChange(selectedTags.filter(t => t !== tagName));
        } else {
            if (maxSelections && selectedTags.length >= maxSelections) return;
            onTagsChange([...selectedTags, tagName]);
        }
    };

    const removeTag = (tagName: string) => {
        onTagsChange(selectedTags.filter(t => t !== tagName));
    };

    return (
        <div className="relative" ref={containerRef}>
            {/* Selected Tags as Chips */}
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {selectedTags.map(tagName => (
                        <span
                            key={tagName}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm font-medium"
                        >
                            {tagName}
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => removeTag(tagName)}
                                    className="ml-1 hover:text-brand-900"
                                >
                                    <i className="fa-solid fa-times text-xs"></i>
                                </button>
                            )}
                        </span>
                    ))}
                </div>
            )}

            {/* Search Input and AI Button */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fa-solid fa-search text-gray-400"></i>
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsOpen(true)}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition ${error ? 'border-red-500' : 'border-gray-300'
                            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                    {selectedTags.length > 0 && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <span className="text-xs text-gray-500">{selectedTags.length} selected</span>
                        </div>
                    )}
                </div>

                {showAIButton && (
                    <button
                        type="button"
                        onClick={onAISuggest}
                        disabled={disabled || aiLoading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition flex items-center gap-2"
                    >
                        {aiLoading ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin"></i>
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-wand-magic-sparkles"></i>
                                AI Suggest
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Dropdown - Flat list of tags */}
            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                    {filteredTags.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            {searchTerm ? 'No tags found' : 'No tags available'}
                        </div>
                    ) : (
                        <div className="p-3 flex flex-wrap gap-2">
                            {filteredTags.map(tag => {
                                const isSelected = selectedTags.includes(tag.name);
                                const isDisabled = !isSelected && maxSelections && selectedTags.length >= maxSelections;
                                return (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => !isDisabled && toggleTag(tag.name)}
                                        disabled={isDisabled as boolean}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${isSelected
                                            ? 'bg-brand-600 text-white border-brand-600'
                                            : isDisabled
                                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400 hover:bg-brand-50'
                                            }`}
                                    >
                                        {isSelected && <i className="fa-solid fa-check mr-1"></i>}
                                        {tag.name}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}
