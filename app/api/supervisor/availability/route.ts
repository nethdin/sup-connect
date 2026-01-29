import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/app/lib/db';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
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

// GET - Get supervisor's availability (next 30 days)
export async function GET(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(request.url);
        const supervisorProfileId = url.searchParams.get('supervisorId');

        let profileId = supervisorProfileId;

        // If supervisor viewing their own availability
        if (auth.role === 'SUPERVISOR' && !supervisorProfileId) {
            const profile = await queryOne<any>(
                'SELECT id FROM supervisor_profiles WHERE user_id = ?',
                [auth.userId]
            );
            if (!profile) {
                return NextResponse.json({ error: 'Supervisor profile not found' }, { status: 404 });
            }
            profileId = profile.id;
        }

        if (!profileId) {
            return NextResponse.json({ error: 'Supervisor ID required' }, { status: 400 });
        }

        // Get availability for next 30 days
        const availability = await query<any[]>(`
            SELECT 
                sa.*,
                (SELECT COUNT(*) FROM appointments a 
                 WHERE a.supervisor_id = sa.supervisor_id 
                 AND DATE(a.date_time) = sa.date 
                 AND a.status != 'CANCELLED') as booked_slots
            FROM supervisor_availability sa
            WHERE sa.supervisor_id = ?
            AND sa.date >= CURDATE()
            AND sa.date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
            AND sa.is_available = TRUE
            ORDER BY sa.date, sa.start_time
        `, [profileId]);

        return NextResponse.json({ availability });
    } catch (error) {
        console.error('Get availability error:', error);
        return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
    }
}

// POST - Create availability slot (supervisor only)
export async function POST(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth || auth.role !== 'SUPERVISOR') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const profile = await queryOne<any>(
            'SELECT id FROM supervisor_profiles WHERE user_id = ?',
            [auth.userId]
        );
        if (!profile) {
            return NextResponse.json({ error: 'Supervisor profile not found' }, { status: 404 });
        }

        const body = await request.json();
        const { date, startTime, endTime, slotDuration = 30 } = body;

        if (!date || !startTime || !endTime) {
            return NextResponse.json({ error: 'Date, start time, and end time are required' }, { status: 400 });
        }

        // Validate date is within next 30 days
        const slotDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + 30);

        if (slotDate < today || slotDate > maxDate) {
            return NextResponse.json({ error: 'Date must be within the next 30 days' }, { status: 400 });
        }

        // Check for overlapping availability
        const existing = await queryOne<any>(`
            SELECT id FROM supervisor_availability 
            WHERE supervisor_id = ? 
            AND date = ? 
            AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))
        `, [profile.id, date, startTime, startTime, endTime, endTime]);

        if (existing) {
            return NextResponse.json({ error: 'Overlapping availability exists' }, { status: 409 });
        }

        const id = uuidv4();
        await query(
            `INSERT INTO supervisor_availability (id, supervisor_id, date, start_time, end_time, slot_duration) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, profile.id, date, startTime, endTime, slotDuration]
        );

        return NextResponse.json({
            message: 'Availability created successfully',
            availability: { id, supervisorId: profile.id, date, startTime, endTime, slotDuration }
        }, { status: 201 });
    } catch (error) {
        console.error('Create availability error:', error);
        return NextResponse.json({ error: 'Failed to create availability' }, { status: 500 });
    }
}

// DELETE - Remove availability slot (supervisor only)
export async function DELETE(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth || auth.role !== 'SUPERVISOR') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const profile = await queryOne<any>(
            'SELECT id FROM supervisor_profiles WHERE user_id = ?',
            [auth.userId]
        );
        if (!profile) {
            return NextResponse.json({ error: 'Supervisor profile not found' }, { status: 404 });
        }

        const url = new URL(request.url);
        const availabilityId = url.searchParams.get('id');

        if (!availabilityId) {
            return NextResponse.json({ error: 'Availability ID required' }, { status: 400 });
        }

        // Verify ownership
        const availability = await queryOne<any>(
            'SELECT id FROM supervisor_availability WHERE id = ? AND supervisor_id = ?',
            [availabilityId, profile.id]
        );

        if (!availability) {
            return NextResponse.json({ error: 'Availability not found' }, { status: 404 });
        }

        // Check if there are pending appointments
        const pendingAppointments = await queryOne<any>(`
            SELECT COUNT(*) as count FROM appointments 
            WHERE availability_id = ? AND status IN ('PENDING', 'CONFIRMED')
        `, [availabilityId]);

        if (pendingAppointments?.count > 0) {
            return NextResponse.json({
                error: 'Cannot delete availability with pending appointments'
            }, { status: 400 });
        }

        await query('DELETE FROM supervisor_availability WHERE id = ?', [availabilityId]);

        return NextResponse.json({ message: 'Availability deleted successfully' });
    } catch (error) {
        console.error('Delete availability error:', error);
        return NextResponse.json({ error: 'Failed to delete availability' }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
