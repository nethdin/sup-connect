import { NextRequest } from 'next/server';
import { cancelBookingRequest } from '@/app/api/api-handlers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return cancelBookingRequest(params.id, request);
}
