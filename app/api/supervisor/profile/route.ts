import { NextRequest } from 'next/server';
import { createSupervisorProfile } from '@/app/api/api-handlers';

export async function POST(request: NextRequest) {
  return createSupervisorProfile(request);
}
