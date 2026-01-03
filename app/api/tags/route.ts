import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

// GET - Get all active tags
export async function GET() {
    try {
        const tags = await query(`
            SELECT id, name, category
            FROM tags
            WHERE is_active = TRUE
            ORDER BY category ASC, sort_order ASC, name ASC
        `);

        return NextResponse.json({ tags });
    } catch (error) {
        console.error('Get tags error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tags' },
            { status: 500 }
        );
    }
}

export const dynamic = 'force-dynamic';
