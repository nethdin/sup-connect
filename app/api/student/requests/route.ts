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

// GET - Get all booking requests for the current student
export async function GET(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);

        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (auth.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Only students can access this endpoint' }, { status: 403 });
        }

        // Fetch all booking requests with supervisor info
        // Note: br.supervisor_id stores supervisor_profiles.id, not users.id
        const requests = await query(`
            SELECT 
                br.id,
                br.status,
                br.created_at,
                br.responded_at,
                sp.user_id as supervisor_id,
                u.name as supervisor_name,
                u.email as supervisor_email,
                sp.specialization,
                sp.department
            FROM booking_requests br
            JOIN supervisor_profiles sp ON br.supervisor_id = sp.id
            JOIN users u ON sp.user_id = u.id
            WHERE br.student_id = ?
            ORDER BY br.created_at DESC
        `, [auth.userId]);

        return NextResponse.json({ requests });
    } catch (error) {
        console.error('Get student requests error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch requests' },
            { status: 500 }
        );
    }
}

export const dynamic = 'force-dynamic';
