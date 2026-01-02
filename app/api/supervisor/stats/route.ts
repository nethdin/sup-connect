import { NextRequest } from 'next/server';
import { getSupervisorStats } from '@/app/api/api-handlers';

export async function GET(request: NextRequest) {
  return getSupervisorStats(request);
}

export const dynamic = 'force-dynamic';
