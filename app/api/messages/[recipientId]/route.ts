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

interface Params {
    params: Promise<{ recipientId: string }>;
}

// GET - Get messages in a conversation with a specific user
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const { recipientId } = resolvedParams;

        // Get all messages between the two users
        const messages = await query<any[]>(`
            SELECT 
                m.id,
                m.sender_id,
                m.receiver_id,
                m.content,
                m.is_read,
                m.created_at,
                u.name as sender_name
            FROM messages m
            JOIN users u ON u.id = m.sender_id
            WHERE (m.sender_id = ? AND m.receiver_id = ?)
               OR (m.sender_id = ? AND m.receiver_id = ?)
            ORDER BY m.created_at ASC
        `, [auth.userId, recipientId, recipientId, auth.userId]);

        // Mark messages from the other user as read
        await query(
            'UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0',
            [recipientId, auth.userId]
        );

        return NextResponse.json({ messages });
    } catch (error) {
        console.error('Get messages error:', error);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

// PUT - Mark messages as read
export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const { recipientId } = resolvedParams;

        // Mark all messages from this user as read
        await query(
            'UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?',
            [recipientId, auth.userId]
        );

        return NextResponse.json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Mark read error:', error);
        return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
