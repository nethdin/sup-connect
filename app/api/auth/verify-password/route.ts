import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/app/lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
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

// POST - Verify current user's password
export async function POST(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);

        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { password } = body;

        if (!password) {
            return NextResponse.json(
                { error: 'Password is required' },
                { status: 400 }
            );
        }

        // Get current user's password hash
        const user = await queryOne<any>(
            'SELECT id, password FROM users WHERE id = ? AND deleted_at IS NULL',
            [auth.userId]
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid password', valid: false },
                { status: 401 }
            );
        }

        return NextResponse.json({ valid: true, message: 'Password verified' });
    } catch (error) {
        console.error('Password verification error:', error);
        return NextResponse.json(
            { error: 'Failed to verify password' },
            { status: 500 }
        );
    }
}

export const dynamic = 'force-dynamic';
