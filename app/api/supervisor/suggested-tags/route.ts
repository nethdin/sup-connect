import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import jwt from 'jsonwebtoken';
import { config } from '@/app/lib/config';

const JWT_SECRET = config.auth.jwtSecret;

const getUserFromRequest = (request: NextRequest) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    try {
        return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    } catch {
        return null;
    }
};

interface Tag {
    id: string;
    name: string;
    category: string | null;
}

// GET - Get suggested tags for supervisor based on their current tags
export async function GET(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (auth.role !== 'SUPERVISOR') {
            return NextResponse.json({ error: 'Only supervisors can access this endpoint' }, { status: 403 });
        }

        // Get supervisor profile with their current tags
        const profile = await query<any[]>(
            'SELECT id, tags FROM supervisor_profiles WHERE user_id = ?',
            [auth.userId]
        );

        if (!profile || profile.length === 0) {
            return NextResponse.json({ error: 'Supervisor profile not found' }, { status: 404 });
        }

        const supervisorProfile = profile[0];

        // Parse supervisor's current tag IDs
        let currentTagIds: string[] = [];
        try {
            const parsed = JSON.parse(supervisorProfile.tags || '[]');
            currentTagIds = Array.isArray(parsed) ? parsed : [];
        } catch {
            currentTagIds = [];
        }

        // Get current tags with their categories
        let currentCategories: Set<string> = new Set();
        if (currentTagIds.length > 0) {
            const placeholders = currentTagIds.map(() => '?').join(',');
            const currentTags = await query<Tag[]>(
                `SELECT id, name, category FROM tags WHERE id IN (${placeholders})`,
                currentTagIds
            );
            currentTags.forEach(t => {
                if (t.category) currentCategories.add(t.category);
            });
        }

        // If supervisor has no tags, suggest popular tags from common categories 
        if (currentCategories.size === 0) {
            const popularTags = await query<Tag[]>(`
                SELECT id, name, category
                FROM tags
                WHERE is_active = TRUE
                ORDER BY category, sort_order, name
                LIMIT 20
            `);

            return NextResponse.json({
                suggestedTags: popularTags,
                currentTagCount: 0,
                message: 'Here are some popular tags to get started'
            });
        }

        // Find new tags in the same categories that supervisor doesn't have
        const categoryList = Array.from(currentCategories);
        const categoryPlaceholders = categoryList.map(() => '?').join(',');
        const idPlaceholders = currentTagIds.map(() => '?').join(',');

        const suggestedTags = await query<Tag[]>(`
            SELECT id, name, category
            FROM tags
            WHERE is_active = TRUE
              AND category IN (${categoryPlaceholders})
              AND id NOT IN (${idPlaceholders})
            ORDER BY category, sort_order, name
        `, [...categoryList, ...currentTagIds]);

        // Also get recently added tags (last 30 days) from any category
        const recentTags = await query<Tag[]>(`
            SELECT id, name, category
            FROM tags
            WHERE is_active = TRUE
              AND id NOT IN (${idPlaceholders})
              AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ORDER BY created_at DESC
            LIMIT 10
        `, currentTagIds);

        // Combine and dedupe
        const allSuggested = [...suggestedTags];
        const existingIds = new Set(allSuggested.map(t => t.id));
        for (const tag of recentTags) {
            if (!existingIds.has(tag.id)) {
                allSuggested.push(tag);
            }
        }

        return NextResponse.json({
            suggestedTags: allSuggested,
            recentTags: recentTags,
            currentTagCount: currentTagIds.length,
            categories: categoryList
        });

    } catch (error) {
        console.error('Get suggested tags error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch suggested tags' },
            { status: 500 }
        );
    }
}

export const dynamic = 'force-dynamic';
