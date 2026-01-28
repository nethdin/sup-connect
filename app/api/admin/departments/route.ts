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

// GET - List all departments (admin can see inactive, others only active)
export async function GET(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        const url = new URL(request.url);
        const includeInactive = url.searchParams.get('all') === 'true';

        let sql = `
            SELECT id, name, code, is_active, sort_order, created_at
            FROM departments
        `;

        // Only admins can see inactive departments
        if (!auth || !isAdmin(auth.role) || !includeInactive) {
            sql += ' WHERE is_active = 1';
        }

        sql += ' ORDER BY sort_order ASC, name ASC';

        const departments = await query(sql);

        return NextResponse.json({ departments });
    } catch (error) {
        console.error('Get departments error:', error);
        return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
    }
}

// POST - Create a new department (admin only)
export async function POST(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth || !isAdmin(auth.role)) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { name, code } = body;

        if (!name?.trim()) {
            return NextResponse.json({ error: 'Department name is required' }, { status: 400 });
        }

        // Check for duplicate
        const existing = await query('SELECT id FROM departments WHERE LOWER(name) = LOWER(?)', [name.trim()]);
        if ((existing as any[]).length > 0) {
            return NextResponse.json({ error: 'Department already exists' }, { status: 409 });
        }

        const id = uuidv4();
        await query(
            'INSERT INTO departments (id, name, code, is_active, sort_order) VALUES (?, ?, ?, TRUE, 100)',
            [id, name.trim(), code?.trim() || null]
        );

        return NextResponse.json({
            message: 'Department created successfully',
            department: { id, name: name.trim(), code: code?.trim() || null, is_active: true }
        }, { status: 201 });
    } catch (error) {
        console.error('Create department error:', error);
        return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
    }
}

// PUT - Update a department (admin only)
export async function PUT(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth || !isAdmin(auth.role)) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { id, name, code, is_active, sort_order } = body;

        if (!id) {
            return NextResponse.json({ error: 'Department ID is required' }, { status: 400 });
        }

        const updates: string[] = [];
        const params: any[] = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name.trim());
        }
        if (code !== undefined) {
            updates.push('code = ?');
            params.push(code?.trim() || null);
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
        await query(`UPDATE departments SET ${updates.join(', ')} WHERE id = ?`, params);

        return NextResponse.json({ message: 'Department updated successfully' });
    } catch (error) {
        console.error('Update department error:', error);
        return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
    }
}

// DELETE - Soft delete (deactivate) a department (admin only)
export async function DELETE(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth || !isAdmin(auth.role)) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Department ID is required' }, { status: 400 });
        }

        await query('UPDATE departments SET is_active = FALSE WHERE id = ?', [id]);

        return NextResponse.json({ message: 'Department deactivated successfully' });
    } catch (error) {
        console.error('Delete department error:', error);
        return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
