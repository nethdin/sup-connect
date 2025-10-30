import { NextRequest } from 'next/server';
import { createSupervisorProfile } from '@/app/api/api-handlers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return createSupervisorProfile(request);
}
