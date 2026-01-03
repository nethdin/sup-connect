import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
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

const isAdmin = (role: string) => role === 'ADMIN' || role === 'SUPER_ADMIN';

// GET - List all specializations (including inactive for admin)
export async function GET(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth || !isAdmin(auth.role)) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const specializations = await query(`
            SELECT id, name, description, is_active, sort_order, created_at
            FROM specializations
            ORDER BY sort_order ASC, name ASC
        `);

        return NextResponse.json({ specializations });
    } catch (error) {
        console.error('Get admin specializations error:', error);
        return NextResponse.json({ error: 'Failed to fetch specializations' }, { status: 500 });
    }
}

// POST - Create a new specialization
export async function POST(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth || !isAdmin(auth.role)) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { name, description } = body;

        if (!name?.trim()) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Check for duplicate
        const existing = await query('SELECT id FROM specializations WHERE LOWER(name) = LOWER(?)', [name.trim()]);
        if ((existing as any[]).length > 0) {
            return NextResponse.json({ error: 'Specialization already exists' }, { status: 409 });
        }

        const id = uuidv4();
        await query(
            'INSERT INTO specializations (id, name, description, is_active, sort_order) VALUES (?, ?, ?, TRUE, 100)',
            [id, name.trim(), description || null]
        );

        return NextResponse.json({
            message: 'Specialization created successfully',
            specialization: { id, name: name.trim(), description, is_active: true }
        }, { status: 201 });
    } catch (error) {
        console.error('Create specialization error:', error);
        return NextResponse.json({ error: 'Failed to create specialization' }, { status: 500 });
    }
}

// PUT - Update a specialization
export async function PUT(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth || !isAdmin(auth.role)) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { id, name, description, is_active, sort_order } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updates: string[] = [];
        const params: any[] = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name.trim());
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (is_active !== undefined) {
            updates.push('is_active = ?');
            params.push(is_active);
        }
        if (sort_order !== undefined) {
            updates.push('sort_order = ?');
            params.push(sort_order);
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        params.push(id);
        await query(`UPDATE specializations SET ${updates.join(', ')} WHERE id = ?`, params);

        return NextResponse.json({ message: 'Specialization updated successfully' });
    } catch (error) {
        console.error('Update specialization error:', error);
        return NextResponse.json({ error: 'Failed to update specialization' }, { status: 500 });
    }
}

// DELETE - Soft delete (deactivate)
export async function DELETE(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth || !isAdmin(auth.role)) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await query('UPDATE specializations SET is_active = FALSE WHERE id = ?', [id]);

        return NextResponse.json({ message: 'Specialization deactivated successfully' });
    } catch (error) {
        console.error('Delete specialization error:', error);
        return NextResponse.json({ error: 'Failed to delete specialization' }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
