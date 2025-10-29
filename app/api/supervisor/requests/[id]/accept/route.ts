import { NextRequest } from 'next/server';
import { acceptBookingRequest } from '@/app/api/api-handlers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return acceptBookingRequest(params.id, request);
}
