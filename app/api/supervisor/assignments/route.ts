import { NextRequest } from 'next/server';
import { getSupervisorAssignments } from '@/app/api/api-handlers';

export async function GET(request: NextRequest) {
  return getSupervisorAssignments(request);
}

export const dynamic = 'force-dynamic';
