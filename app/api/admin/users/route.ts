import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { query, queryOne } from '@/app/lib/db';
import { getUserFromRequest } from '@/app/api/api-handlers';

const SALT_ROUNDS = 10;

// POST - Create a new user (admin only)
export async function POST(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth || !['ADMIN', 'SUPER_ADMIN'].includes(auth.role)) {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { email, password, name, role, department, registrationNo, tags, bio, maxSlots, yearsOfExperience } = body;

        // Validation
        if (!email || !password || !name || !role) {
            return NextResponse.json(
                { error: 'Missing required fields: email, password, name, role' },
                { status: 400 }
            );
        }

        // Validate role - SUPER_ADMIN cannot be created, only transferred
        if (!['STUDENT', 'SUPERVISOR', 'ADMIN'].includes(role)) {
            return NextResponse.json(
                { error: 'Invalid role. SUPER_ADMIN cannot be created directly.' },
                { status: 400 }
            );
        }

        // Role-specific validation
        if (role === 'STUDENT' && (!department || !registrationNo)) {
            return NextResponse.json(
                { error: 'Department and registration number are required for students' },
                { status: 400 }
            );
        }

        if (role === 'SUPERVISOR' && (!tags || !bio)) {
            return NextResponse.json(
                { error: 'Tags and bio are required for supervisors' },
                { status: 400 }
            );
        }

        // Check if email exists
        const existingUser = await queryOne('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 409 }
            );
        }

        // Check registration number for students
        if (role === 'STUDENT') {
            const existingReg = await queryOne('SELECT id FROM student_profiles WHERE registration_no = ?', [registrationNo]);
            if (existingReg) {
                return NextResponse.json(
                    { error: 'Registration number already exists' },
                    { status: 409 }
                );
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const userId = uuidv4();
        await query(
            'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
            [userId, email, hashedPassword, name, role]
        );

        // Create role-specific profile
        if (role === 'STUDENT') {
            const profileId = uuidv4();
            await query(
                'INSERT INTO student_profiles (id, user_id, registration_no, department) VALUES (?, ?, ?, ?)',
                [profileId, userId, registrationNo, department]
            );
        } else if (role === 'SUPERVISOR') {
            const profileId = uuidv4();
            // Convert tag names to IDs
            const { getTagIdsByNames } = await import('@/app/api/api-handlers');
            const tagIds = await getTagIdsByNames(tags || []);
            await query(
                'INSERT INTO supervisor_profiles (id, user_id, department, tags, bio, years_of_experience, max_slots, current_slots) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [profileId, userId, department || null, JSON.stringify(tagIds), bio, yearsOfExperience || 0, maxSlots || 5, 0]
            );
        }

        return NextResponse.json({
            message: 'User created successfully',
            user: { id: userId, email, name, role }
        }, { status: 201 });
    } catch (error) {
        console.error('Admin create user error:', error);
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}

// GET - List all users (admin only)
export async function GET(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth || !['ADMIN', 'SUPER_ADMIN'].includes(auth.role)) {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 401 }
            );
        }

        const url = new URL(request.url);
        const role = url.searchParams.get('role');

        let sql = 'SELECT id, email, name, role, created_at FROM users WHERE deleted_at IS NULL';
        const params: any[] = [];

        if (role) {
            sql += ' AND role = ?';
            params.push(role);
        }

        sql += ' ORDER BY created_at DESC';

        const users = await query(sql, params);

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Admin list users error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

export const dynamic = 'force-dynamic';
