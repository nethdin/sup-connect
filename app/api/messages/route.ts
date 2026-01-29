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

// GET - Get all conversations for the authenticated user
export async function GET(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all unique conversations (users the authenticated user has messaged with)
        const conversations = await query<any[]>(`
            SELECT 
                CASE 
                    WHEN m.sender_id = ? THEN m.receiver_id 
                    ELSE m.sender_id 
                END as user_id,
                MAX(u.name) as user_name,
                MAX(u.email) as user_email,
                MAX(u.role) as user_role,
                (
                    SELECT content FROM messages m2
                    WHERE (m2.sender_id = ? AND m2.receiver_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END) 
                       OR (m2.sender_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END AND m2.receiver_id = ?)
                    ORDER BY m2.created_at DESC LIMIT 1
                ) as last_message,
                MAX(m.created_at) as last_message_at,
                (
                    SELECT COUNT(*) FROM messages m3
                    WHERE m3.sender_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END 
                      AND m3.receiver_id = ? AND m3.is_read = 0
                ) as unread_count
            FROM messages m
            JOIN users u ON u.id = CASE 
                WHEN m.sender_id = ? THEN m.receiver_id 
                ELSE m.sender_id 
            END
            WHERE (m.sender_id = ? OR m.receiver_id = ?)
              AND u.deleted_at IS NULL
            GROUP BY CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
            ORDER BY last_message_at DESC
        `, [
            auth.userId, auth.userId, auth.userId, auth.userId, auth.userId,
            auth.userId, auth.userId, auth.userId, auth.userId, auth.userId, auth.userId
        ]);

        return NextResponse.json({ conversations });
    } catch (error) {
        console.error('Get conversations error:', error);
        return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }
}

// POST - Send a new message
export async function POST(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { receiverId, content } = body;

        if (!receiverId || !content?.trim()) {
            return NextResponse.json({ error: 'Receiver ID and message content are required' }, { status: 400 });
        }

        // Verify receiver exists and is not deleted
        const receiver = await queryOne<any>(
            'SELECT id, name FROM users WHERE id = ? AND deleted_at IS NULL',
            [receiverId]
        );

        if (!receiver) {
            return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
        }

        // Cannot message yourself
        if (receiverId === auth.userId) {
            return NextResponse.json({ error: 'Cannot send message to yourself' }, { status: 400 });
        }

        const messageId = uuidv4();
        await query(
            'INSERT INTO messages (id, sender_id, receiver_id, content, is_read) VALUES (?, ?, ?, ?, 0)',
            [messageId, auth.userId, receiverId, content.trim()]
        );

        // Create notification for recipient
        const sender = await queryOne<any>('SELECT name FROM users WHERE id = ?', [auth.userId]);
        const notificationId = uuidv4();
        await query(
            `INSERT INTO notifications (id, user_id, type, title, message, data) 
             VALUES (?, ?, 'NEW_MESSAGE', 'New Message', ?, ?)`,
            [
                notificationId,
                receiverId,
                `You have a new message from ${sender?.name || 'Someone'}`,
                JSON.stringify({ senderId: auth.userId, messageId })
            ]
        );

        return NextResponse.json({
            message: 'Message sent successfully',
            messageId
        }, { status: 201 });
    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
