import { NextRequest, NextResponse } from 'next/server';
import { createSupervisorProfile, getUserFromRequest } from '@/app/api/api-handlers';
import { query, queryOne } from '@/app/lib/db';

export const dynamic = 'force-dynamic';

// GET - Fetch current supervisor's profile
export async function GET(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth || auth.role !== 'SUPERVISOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get supervisor profile for the logged-in user
    const profile = await queryOne<any>(
      `SELECT 
        sp.*,
        u.name as user_name,
        u.email as user_email
      FROM supervisor_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.user_id = ?`,
      [auth.userId]
    );

    if (!profile) {
      return NextResponse.json({
        profile: null,
        message: 'No profile found. Please create one.',
      });
    }

    // Parse tags if stored as JSON string
    let tagIds: string[] = [];
    if (typeof profile.tags === 'string') {
      try {
        tagIds = JSON.parse(profile.tags);
      } catch {
        tagIds = [];
      }
    } else if (Array.isArray(profile.tags)) {
      tagIds = profile.tags;
    }

    // Resolve tag IDs to names for ProfileForm (which uses tag names for selection)
    let tagNames: string[] = [];
    if (tagIds.length > 0) {
      const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
      if (tagIds.some(isUuid)) {
        const placeholders = tagIds.map(() => '?').join(',');
        const rows = await query<{ id: string; name: string }[]>(
          `SELECT id, name FROM tags WHERE id IN (${placeholders})`,
          tagIds
        );
        const idToName = new Map(rows.map(r => [r.id, r.name]));
        tagNames = tagIds.map(id => idToName.get(id)).filter((n): n is string => !!n);
      } else {
        // Already names (backward compatibility)
        tagNames = tagIds;
      }
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        userId: profile.user_id,
        department: profile.department,
        tags: tagNames,  // Return tag names for ProfileForm
        bio: profile.bio,
        maxSlots: profile.max_slots,
        currentSlots: profile.current_slots,
        profilePicture: profile.profile_picture,
        user: {
          name: profile.user_name,
          email: profile.user_email,
        },
      },
    });
  } catch (error) {
    console.error('Get supervisor profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return createSupervisorProfile(request);
}
