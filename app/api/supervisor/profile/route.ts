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
    let tags = profile.tags;
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch {
        tags = [];
      }
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        userId: profile.user_id,
        department: profile.department,
        specialization: profile.specialization,
        tags: tags || [],
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
