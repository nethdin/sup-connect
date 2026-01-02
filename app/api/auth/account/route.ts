import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/app/lib/db';
import { getUserFromRequest } from '@/app/api/api-handlers';

// DELETE - Delete own account (soft delete)
export async function DELETE(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // SUPER_ADMIN cannot delete their own account
        if (auth.role === 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'SUPER_ADMIN accounts cannot be deleted for system stability.' },
                { status: 403 }
            );
        }

        // Verify user exists and not already deleted
        const user = await queryOne<any>(
            'SELECT id, role, deleted_at FROM users WHERE id = ?',
            [auth.userId]
        );

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        if (user.deleted_at) {
            return NextResponse.json(
                { error: 'Account already deleted' },
                { status: 400 }
            );
        }

        // Soft delete - set deleted_at timestamp
        await query(
            'UPDATE users SET deleted_at = NOW() WHERE id = ?',
            [auth.userId]
        );

        // Also handle cleanup based on role
        if (user.role === 'SUPERVISOR') {
            // Cancel pending booking requests
            await query(
                `UPDATE booking_requests 
         SET status = 'CANCELLED', updated_at = NOW() 
         WHERE supervisor_id IN (SELECT id FROM supervisor_profiles WHERE user_id = ?) 
         AND status = 'PENDING'`,
                [auth.userId]
            );
        } else if (user.role === 'STUDENT') {
            // Cancel pending booking requests
            await query(
                `UPDATE booking_requests 
         SET status = 'CANCELLED', updated_at = NOW() 
         WHERE student_id = ? AND status = 'PENDING'`,
                [auth.userId]
            );
        }

        return NextResponse.json({
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        return NextResponse.json(
            { error: 'Failed to delete account' },
            { status: 500 }
        );
    }
}

export const dynamic = 'force-dynamic';
