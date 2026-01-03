import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/app/lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '@/app/lib/config';

const JWT_SECRET = config.auth.jwtSecret;
const SALT_ROUNDS = 10;

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

// DELETE - Admin deletes another user (soft delete)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth || (auth.role !== 'ADMIN' && auth.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const targetUserId = params.id;

        // Prevent admin from deleting themselves
        if (auth.userId === targetUserId) {
            return NextResponse.json(
                { error: 'You cannot delete your own account from here. Use the profile page.' },
                { status: 400 }
            );
        }

        // Get target user
        const targetUser = await queryOne<any>(
            'SELECT id, role, deleted_at FROM users WHERE id = ?',
            [targetUserId]
        );

        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (targetUser.deleted_at) {
            return NextResponse.json({ error: 'User already deleted' }, { status: 400 });
        }

        // Prevent deleting SUPER_ADMIN
        if (targetUser.role === 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'SUPER_ADMIN accounts cannot be deleted' },
                { status: 403 }
            );
        }

        // Regular ADMIN cannot delete other ADMINs
        if (auth.role === 'ADMIN' && targetUser.role === 'ADMIN') {
            return NextResponse.json(
                { error: 'Only SUPER_ADMIN can delete other admins' },
                { status: 403 }
            );
        }

        // Soft delete
        await query('UPDATE users SET deleted_at = NOW() WHERE id = ?', [targetUserId]);

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Admin delete user error:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}

// PUT - Admin updates another user
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth || (auth.role !== 'ADMIN' && auth.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const targetUserId = params.id;
        const body = await request.json();
        const { name, email, password, role } = body;

        // Prevent admin from editing themselves here
        if (auth.userId === targetUserId) {
            return NextResponse.json(
                { error: 'Use the profile page to edit your own account' },
                { status: 400 }
            );
        }

        // Get target user
        const targetUser = await queryOne<any>(
            'SELECT id, role, deleted_at FROM users WHERE id = ?',
            [targetUserId]
        );

        if (!targetUser || targetUser.deleted_at) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Prevent editing SUPER_ADMIN by non-SUPER_ADMIN
        if (targetUser.role === 'SUPER_ADMIN' && auth.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Only SUPER_ADMIN can edit SUPER_ADMIN accounts' },
                { status: 403 }
            );
        }

        // Regular ADMIN cannot edit other ADMINs
        if (auth.role === 'ADMIN' && targetUser.role === 'ADMIN') {
            return NextResponse.json(
                { error: 'Only SUPER_ADMIN can edit other admins' },
                { status: 403 }
            );
        }

        // SUPER_ADMIN role cannot be assigned via edit - must use transfer endpoint
        if (role === 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'SUPER_ADMIN role cannot be assigned. Use the transfer function instead.' },
                { status: 403 }
            );
        }

        // Build update query
        const updates: string[] = [];
        const values: any[] = [];

        if (name) {
            updates.push('name = ?');
            values.push(name);
        }
        if (email) {
            // Check if email is already taken
            const existing = await queryOne<any>(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [email, targetUserId]
            );
            if (existing) {
                return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
            }
            updates.push('email = ?');
            values.push(email);
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            updates.push('password_hash = ?');
            values.push(hashedPassword);
        }
        if (role && ['STUDENT', 'SUPERVISOR', 'ADMIN'].includes(role)) {
            updates.push('role = ?');
            values.push(role);
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        updates.push('updated_at = NOW()');
        values.push(targetUserId);

        await query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        return NextResponse.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Admin update user error:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

// GET - Admin gets single user details
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth || (auth.role !== 'ADMIN' && auth.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await queryOne<any>(
            `SELECT id, email, name, role, created_at, deleted_at 
             FROM users WHERE id = ?`,
            [params.id]
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Admin get user error:', error);
        return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
