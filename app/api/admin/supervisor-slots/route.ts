import { NextRequest, NextResponse } from 'next/server';
import { validateSupervisorSlots, getUserFromRequest } from '@/app/api/api-handlers';

/**
 * GET: View supervisor slot validation report
 * POST: Repair supervisor slots (SUPER_ADMIN only)
 * 
 * Request body (POST):
 * {
 *   "repair": true|false
 * }
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

    const validation = await validateSupervisorSlots(false);

    return NextResponse.json(validation);
  } catch (error) {
    console.error('Supervisor slots validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate supervisor slots' },
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

    const body = await request.json();
    const shouldRepair = body.repair === true;

    const validation = await validateSupervisorSlots(shouldRepair);

    return NextResponse.json({
      ...validation,
      action: shouldRepair ? 'repair' : 'validate',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Supervisor slots repair error:', error);
    return NextResponse.json(
      { error: 'Failed to repair supervisor slots' },
      { status: 500 }
    );
  }
}
