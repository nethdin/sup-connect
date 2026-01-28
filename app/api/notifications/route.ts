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

// GET - Get all notifications for the authenticated user
export async function GET(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(request.url);
        const unreadOnly = url.searchParams.get('unread') === 'true';
        const limit = Math.min(Math.max(1, parseInt(url.searchParams.get('limit') || '50')), 100);

        let sql = `
            SELECT id, type, title, message, data, is_read, created_at
            FROM notifications
            WHERE user_id = ?
        `;

        if (unreadOnly) {
            sql += ' AND is_read = 0';
        }

        sql += ` ORDER BY created_at DESC LIMIT ${limit}`;

        const notifications = await query<any[]>(sql, [auth.userId]);

        // Get unread count
        const unreadCount = await query<any[]>(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
            [auth.userId]
        );

        return NextResponse.json({
            notifications,
            unreadCount: unreadCount[0]?.count || 0
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

// PUT - Mark notification(s) as read
export async function PUT(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { notificationId, markAllRead } = body;

        if (markAllRead) {
            // Mark all notifications as read
            await query(
                'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
                [auth.userId]
            );
            return NextResponse.json({ message: 'All notifications marked as read' });
        } else if (notificationId) {
            // Mark specific notification as read
            await query(
                'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
                [notificationId, auth.userId]
            );
            return NextResponse.json({ message: 'Notification marked as read' });
        }

        return NextResponse.json({ error: 'No notification specified' }, { status: 400 });
    } catch (error) {
        console.error('Mark notification read error:', error);
        return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 });
    }
}

// DELETE - Delete notification(s)
export async function DELETE(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(request.url);
        const notificationId = url.searchParams.get('id');
        const deleteAll = url.searchParams.get('all') === 'true';

        if (deleteAll) {
            await query('DELETE FROM notifications WHERE user_id = ?', [auth.userId]);
            return NextResponse.json({ message: 'All notifications deleted' });
        } else if (notificationId) {
            await query(
                'DELETE FROM notifications WHERE id = ? AND user_id = ?',
                [notificationId, auth.userId]
            );
            return NextResponse.json({ message: 'Notification deleted' });
        }

        return NextResponse.json({ error: 'No notification specified' }, { status: 400 });
    } catch (error) {
        console.error('Delete notification error:', error);
        return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
