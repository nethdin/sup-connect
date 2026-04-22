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

// GET - Get user's appointments
export async function GET(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(request.url);
        const status = url.searchParams.get('status');
        const upcoming = url.searchParams.get('upcoming') === 'true';

        let sql = `
            SELECT 
                a.*,
                s.name as student_name,
                s.email as student_email,
                sup.name as supervisor_name,
                sup.email as supervisor_email,
                sp.department as supervisor_department
            FROM appointments a
            JOIN users s ON a.student_id COLLATE utf8mb4_unicode_ci = s.id COLLATE utf8mb4_unicode_ci
            JOIN supervisor_profiles sp ON a.supervisor_id COLLATE utf8mb4_unicode_ci = sp.id COLLATE utf8mb4_unicode_ci
            JOIN users sup ON sp.user_id COLLATE utf8mb4_unicode_ci = sup.id COLLATE utf8mb4_unicode_ci
            WHERE (a.student_id COLLATE utf8mb4_unicode_ci = ? OR sp.user_id COLLATE utf8mb4_unicode_ci = ?)
        `;
        const params: any[] = [auth.userId, auth.userId];

        if (status) {
            sql += ' AND a.status = ?';
            params.push(status);
        }

        if (upcoming) {
            sql += ' AND DATE(a.date_time) >= CURDATE()';
        }

        sql += ' ORDER BY a.date_time ASC';

        const appointments = await query<any[]>(sql, params);
        
        console.log('DEBUG - Appointments Query:', {
            sql: sql.substring(0, 100),
            params,
            userId: auth.userId,
            resultCount: appointments.length,
            upcoming: upcoming,
            status: status
        });

        const formattedAppointments = appointments.map(apt => ({
            id: apt.id,
            dateTime: apt.date_time,
            duration: apt.duration,
            status: apt.status,
            notes: apt.notes,
            createdAt: apt.created_at,
            student: {
                id: apt.student_id,
                name: apt.student_name,
                email: apt.student_email
            },
            supervisor: {
                id: apt.supervisor_id,
                name: apt.supervisor_name,
                email: apt.supervisor_email,
                department: apt.supervisor_department
            }
        }));

        return NextResponse.json({ appointments: formattedAppointments });
    } catch (error) {
        console.error('Get appointments error:', error);
        return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
    }
}

// POST - Book an appointment (student only)
export async function POST(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth || auth.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { availabilityId, notes } = body;
        let { dateTime } = body;

        if (!availabilityId || !dateTime) {
            return NextResponse.json({ error: 'Availability ID and date/time are required' }, { status: 400 });
        }

        // Sanitize datetime - convert ISO format to MySQL datetime format
        // Handle malformed values like '2026-01-28T18:30:00.000ZT11:30:00'
        if (dateTime.includes('T')) {
            // Parse as Date and convert to MySQL format
            const dt = new Date(dateTime.split('T')[0] + 'T' + dateTime.split('T').pop()?.replace(/Z.*$/, '') + ':00');
            if (!isNaN(dt.getTime())) {
                dateTime = dt.toISOString().slice(0, 19).replace('T', ' ');
            } else {
                // Fallback: extract date and last time component
                const datePart = dateTime.split('T')[0];
                const timeParts = dateTime.match(/\d{2}:\d{2}(:\d{2})?/g);
                const timePart = timeParts ? timeParts[timeParts.length - 1] : '00:00:00';
                dateTime = `${datePart} ${timePart.length === 5 ? timePart + ':00' : timePart}`;
            }
        }

        // Get the availability slot
        const availability = await queryOne<any>(
            'SELECT * FROM supervisor_availability WHERE id = ? AND is_available = TRUE',
            [availabilityId]
        );

        if (!availability) {
            return NextResponse.json({ error: 'Availability slot not found' }, { status: 404 });
        }

        // Verify student is assigned to this supervisor
        const assignment = await queryOne<any>(
            'SELECT id FROM assignments WHERE student_id = ? AND supervisor_id = ?',
            [auth.userId, availability.supervisor_id]
        );

        if (!assignment) {
            return NextResponse.json({
                error: 'You must be assigned to this supervisor to book an appointment'
            }, { status: 403 });
        }

        // Check if the specific time slot is already booked
        const existingAppointment = await queryOne<any>(`
            SELECT id FROM appointments 
            WHERE supervisor_id = ? 
            AND date_time = ? 
            AND status != 'CANCELLED'
        `, [availability.supervisor_id, dateTime]);

        if (existingAppointment) {
            return NextResponse.json({ error: 'This time slot is already booked' }, { status: 409 });
        }

        // Create the appointment
        const id = uuidv4();
        console.log('DEBUG - Creating appointment:', {
            id,
            availabilityId,
            studentId: auth.userId,
            supervisorId: availability.supervisor_id,
            dateTime,
            duration: availability.slot_duration
        });
        await query(
            `INSERT INTO appointments (id, availability_id, student_id, supervisor_id, date_time, duration, notes) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, availabilityId, auth.userId, availability.supervisor_id, dateTime, availability.slot_duration, notes || null]
        );

        // Create notification for supervisor
        const student = await queryOne<any>('SELECT name FROM users WHERE id = ?', [auth.userId]);
        const supervisorUser = await queryOne<any>(
            'SELECT user_id FROM supervisor_profiles WHERE id = ?',
            [availability.supervisor_id]
        );
        if (supervisorUser) {
            const notificationId = uuidv4();
            await query(
                `INSERT INTO notifications (id, user_id, type, title, message, data) 
                 VALUES (?, ?, 'NEW_APPOINTMENT', 'New Appointment', ?, ?)`,
                [
                    notificationId,
                    supervisorUser.user_id,
                    `${student?.name || 'A student'} has booked an appointment with you.`,
                    JSON.stringify({ studentId: auth.userId, appointmentId: id })
                ]
            );
        }

        return NextResponse.json({
            message: 'Appointment booked successfully',
            appointmentId: id
        }, { status: 201 });
    } catch (error) {
        console.error('Book appointment error:', error);
        return NextResponse.json({ error: 'Failed to book appointment' }, { status: 500 });
    }
}

// PUT - Update appointment status
export async function PUT(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { appointmentId, status } = body;

        if (!appointmentId || !status) {
            return NextResponse.json({ error: 'Appointment ID and status are required' }, { status: 400 });
        }

        const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // Get the appointment
        const appointment = await queryOne<any>(`
            SELECT a.*, sp.user_id as supervisor_user_id 
            FROM appointments a
            JOIN supervisor_profiles sp ON a.supervisor_id = sp.id
            WHERE a.id = ?
        `, [appointmentId]);

        if (!appointment) {
            return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
        }

        // Check authorization
        const isStudent = appointment.student_id === auth.userId;
        const isSupervisor = appointment.supervisor_user_id === auth.userId;

        if (!isStudent && !isSupervisor) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Students can only cancel
        if (isStudent && status !== 'CANCELLED') {
            return NextResponse.json({ error: 'Students can only cancel appointments' }, { status: 403 });
        }

        await query('UPDATE appointments SET status = ? WHERE id = ?', [status, appointmentId]);

        // Create notification for the other party
        const notificationId = uuidv4();
        if (isStudent) {
            // Notify supervisor
            await query(
                `INSERT INTO notifications (id, user_id, type, title, message, data) 
                 VALUES (?, ?, 'APPOINTMENT_CANCELLED', 'Appointment Cancelled', ?, ?)`,
                [
                    notificationId,
                    appointment.supervisor_user_id,
                    'A student has cancelled their appointment with you.',
                    JSON.stringify({ appointmentId })
                ]
            );
        } else {
            // Notify student
            const statusMessages: Record<string, string> = {
                'CONFIRMED': 'Your appointment has been confirmed.',
                'CANCELLED': 'Your appointment has been cancelled by the supervisor.',
                'COMPLETED': 'Your appointment has been marked as completed.'
            };
            await query(
                `INSERT INTO notifications (id, user_id, type, title, message, data) 
                 VALUES (?, ?, 'APPOINTMENT_UPDATE', 'Appointment Update', ?, ?)`,
                [
                    notificationId,
                    appointment.student_id,
                    statusMessages[status] || 'Your appointment status has been updated.',
                    JSON.stringify({ appointmentId, status })
                ]
            );
        }

        return NextResponse.json({ message: 'Appointment updated successfully' });
    } catch (error) {
        console.error('Update appointment error:', error);
        return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
