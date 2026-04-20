import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/app/lib/db';
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

export async function GET(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get student's assignment
    const assignment = await queryOne<any>(
      'SELECT * FROM assignments WHERE student_id = ?',
      [auth.userId]
    );

    // Get all appointments for this student
    const appointments = await query<any[]>(
      'SELECT id, student_id, supervisor_id, date_time, status FROM appointments WHERE student_id = ?',
      [auth.userId]
    );

    // Get all available slots for the supervisor (if assigned)
    let availabilitySlots: any[] = [];
    if (assignment) {
      availabilitySlots = await query<any[]>(
        'SELECT id, date, start_time, end_time, is_available FROM supervisor_availability WHERE supervisor_id = ? ORDER BY date DESC LIMIT 5',
        [assignment.supervisor_id]
      );
    }

    return NextResponse.json({
      studentId: auth.userId,
      assignment,
      appointmentCount: appointments.length,
      appointments,
      availabilityCount: availabilitySlots.length,
      recentAvailabilitySlots: availabilitySlots,
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
