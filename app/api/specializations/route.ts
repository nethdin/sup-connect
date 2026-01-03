import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

// GET - Get all active specializations
export async function GET() {
    try {
        const specializations = await query(`
            SELECT id, name, description
            FROM specializations
            WHERE is_active = TRUE
            ORDER BY sort_order ASC, name ASC
        `);

        return NextResponse.json({ specializations });
    } catch (error) {
        console.error('Get specializations error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch specializations' },
            { status: 500 }
        );
    }
}

export const dynamic = 'force-dynamic';
