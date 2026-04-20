import { NextRequest, NextResponse } from 'next/server';
import { validateDataIntegrity, validateSupervisorSlots } from '@/app/api/api-handlers';
import { getUserFromRequest } from '@/app/lib/auth';

/**
 * GET: Validate data integrity
 * POST: Validate and repair supervisor slots (ADMIN only)
 * 
 * Query params:
 * - action: 'validate' | 'repair' (default: 'validate')
 */
export async function GET(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    
    // Only ADMIN/SUPER_ADMIN can access
    if (!auth || !['ADMIN', 'SUPER_ADMIN'].includes(auth.role)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const validation = await validateDataIntegrity();

    return NextResponse.json(validation);
  } catch (error) {
    console.error('Data integrity validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate data integrity' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    
    // Only SUPER_ADMIN can repair
    if (!auth || auth.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Super admin access required for repairs.' },
        { status: 403 }
      );
    }

    const { action } = await request.json();
    const shouldRepair = action === 'repair';

    const validation = await validateDataIntegrity();
    const slotRepair = await validateSupervisorSlots(shouldRepair);

    return NextResponse.json({
      ...validation,
      slotValidation: slotRepair,
      repairsApplied: shouldRepair,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Data integrity repair error:', error);
    return NextResponse.json(
      { error: 'Failed to repair data integrity' },
      { status: 500 }
    );
  }
}
