import { NextRequest } from 'next/server';
import { getSupervisorRequests } from '@/app/api/api-handlers';

export async function GET(request: NextRequest) {
  return getSupervisorRequests(request);
}
