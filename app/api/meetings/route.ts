import { NextRequest } from 'next/server';
import { getMeetings } from '@/app/api/api-handlers';

export async function GET(request: NextRequest) {
  return getMeetings(request);
}
