import { NextRequest } from 'next/server';
import { sendBookingRequest } from '@/app/api/api-handlers';

export async function POST(request: NextRequest) {
  return sendBookingRequest(request);
}
