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

// GET - Get all appointments for the supervisor with their assigned students
export async function GET(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (auth.role !== 'SUPERVISOR') {
      return NextResponse.json({ error: 'Only supervisors can access this endpoint' }, { status: 403 });
    }

    const url = new URL(request.url);
    const statusParam = url.searchParams.get('status');
    const upcoming = url.searchParams.get('upcoming') === 'true';

    // Build query to get appointments for this supervisor
    let sql = `
      SELECT 
        a.id,
        a.date_time as dateTime,
        a.duration,
        a.status,
        a.notes,
        u.name as student_name,
        u.email as student_email
      FROM appointments a
      JOIN users u ON a.student_id = u.id
      WHERE a.supervisor_id = ?
    `;

    const params: any[] = [];
    
    // Get supervisor profile to get supervisor_profiles.id
    const profile = await queryOne<any>(
      'SELECT id FROM supervisor_profiles WHERE user_id = ?',
      [auth.userId]
    );

    if (!profile) {
      return NextResponse.json({ error: 'Supervisor profile not found' }, { status: 404 });
    }

    params.push(profile.id);

    if (statusParam) {
      sql += ' AND a.status = ?';
      params.push(statusParam);
    }

    if (upcoming) {
      sql += ' AND a.date_time >= NOW()';
    }

    sql += ' ORDER BY a.date_time ASC';

    const appointments = await query<any[]>(sql, params);

    // Transform the data to match frontend expectations
    const formattedAppointments = appointments.map(apt => ({
      id: apt.id,
      dateTime: apt.dateTime,
      duration: apt.duration,
      status: apt.status,
      notes: apt.notes,
      student: {
        name: apt.student_name,
        email: apt.student_email,
      },
    }));

    return NextResponse.json({ appointments: formattedAppointments });
  } catch (error) {
    console.error('Get supervisor appointments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

