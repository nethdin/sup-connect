'use client';

import { Tag } from '@/app/lib/types';

interface TagDisplayProps {
    tags: Tag[];
    showCategory?: boolean;  // Supervisors see categories, students don't
    variant?: 'default' | 'compact';
    maxDisplay?: number;
}

/**
 * Role-based tag display component.
 * - Students see: just tag names
 * - Supervisors see: tag names with category badges
 */
export default function TagDisplay({
    tags,
    showCategory = false,
    variant = 'default',
    maxDisplay
}: TagDisplayProps) {
    const displayTags = maxDisplay ? tags.slice(0, maxDisplay) : tags;
    const remaining = maxDisplay && tags.length > maxDisplay ? tags.length - maxDisplay : 0;

    if (displayTags.length === 0) {
        return <span className="text-gray-400 text-sm italic">No tags</span>;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {displayTags.map((tag) => (
                <span
                    key={tag.id}
                    className={`inline-flex items-center gap-1 ${variant === 'compact'
                            ? 'px-2 py-0.5 text-xs'
                            : 'px-2.5 py-1 text-sm'
                        } bg-blue-100 text-blue-700 rounded-full`}
                >
                    <span className="font-medium">{tag.name}</span>
                    {showCategory && tag.category && (
                        <span className="text-blue-500 text-xs">
                            [{tag.category}]
                        </span>
                    )}
                </span>
            ))}
            {remaining > 0 && (
                <span className={`inline-flex items-center ${variant === 'compact' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
                    } bg-gray-100 text-gray-500 rounded-full`}>
                    +{remaining} more
                </span>
            )}
        </div>
    );
}
