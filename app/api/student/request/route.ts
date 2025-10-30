import { NextRequest } from 'next/server';
import { sendBookingRequest } from '@/app/api/api-handlers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return sendBookingRequest(request);
}
