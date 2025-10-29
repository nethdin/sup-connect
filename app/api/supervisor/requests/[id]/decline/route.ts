import { NextRequest } from 'next/server';
import { declineBookingRequest } from '@/app/api/api-handlers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return declineBookingRequest(params.id, request);
}
