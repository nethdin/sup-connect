import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/app/lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const CONFIRMATION_PHRASE = 'TRANSFER SUPER ADMIN';

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

// POST - Transfer SUPER_ADMIN role to another ADMIN
// Requires: password verification + confirmation phrase
export async function POST(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);

        // Only current SUPER_ADMIN can transfer the role
        if (!auth || auth.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Only the current SUPER_ADMIN can transfer this role' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { targetUserId, password, confirmationPhrase } = body;

        // Validate required fields
        if (!targetUserId) {
            return NextResponse.json(
                { error: 'Target user ID is required' },
                { status: 400 }
            );
        }

        if (!password) {
            return NextResponse.json(
                { error: 'Password verification is required' },
                { status: 400 }
            );
        }

        if (!confirmationPhrase) {
            return NextResponse.json(
                { error: 'Confirmation phrase is required' },
                { status: 400 }
            );
        }

        // Verify confirmation phrase
        if (confirmationPhrase !== CONFIRMATION_PHRASE) {
            return NextResponse.json(
                { error: `Invalid confirmation phrase. Please type exactly: "${CONFIRMATION_PHRASE}"` },
                { status: 400 }
            );
        }

        // Cannot transfer to self
        if (auth.userId === targetUserId) {
            return NextResponse.json(
                { error: 'You cannot transfer SUPER_ADMIN to yourself' },
                { status: 400 }
            );
        }

        // Get current user to verify password
        const currentUser = await queryOne<any>(
            'SELECT id, password FROM users WHERE id = ? AND deleted_at IS NULL',
            [auth.userId]
        );

        if (!currentUser) {
            return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, currentUser.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid password. Transfer denied.' },
                { status: 401 }
            );
        }

        // Get target user
        const targetUser = await queryOne<any>(
            'SELECT id, role, name, deleted_at FROM users WHERE id = ?',
            [targetUserId]
        );

        if (!targetUser || targetUser.deleted_at) {
            return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
        }

        // Target must be an ADMIN
        if (targetUser.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'SUPER_ADMIN can only be transferred to an existing ADMIN' },
                { status: 400 }
            );
        }

        // Perform the transfer
        // 1. Demote current SUPER_ADMIN to ADMIN
        await query(
            'UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?',
            ['ADMIN', auth.userId]
        );

        // 2. Promote target ADMIN to SUPER_ADMIN
        await query(
            'UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?',
            ['SUPER_ADMIN', targetUserId]
        );

        return NextResponse.json({
            message: `SUPER_ADMIN role transferred to ${targetUser.name} successfully`,
            note: 'You are now an ADMIN. Please log out and log back in.'
        });
    } catch (error) {
        console.error('Transfer SUPER_ADMIN error:', error);
        return NextResponse.json(
            { error: 'Failed to transfer SUPER_ADMIN role' },
            { status: 500 }
        );
    }
}

// GET - Get the confirmation phrase (for UI to display)
export async function GET(request: NextRequest) {
    const auth = getUserFromRequest(request);

    if (!auth || auth.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ confirmationPhrase: CONFIRMATION_PHRASE });
}

export const dynamic = 'force-dynamic';
