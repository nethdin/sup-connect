import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

// GET - Get all active project categories
export async function GET() {
    try {
        const categories = await query(`
            SELECT id, name, description
            FROM project_categories
            WHERE is_active = TRUE
            ORDER BY sort_order ASC, name ASC
        `);

        return NextResponse.json({ categories });
    } catch (error) {
        console.error('Get categories error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

export const dynamic = 'force-dynamic';
