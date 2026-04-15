import { NextRequest } from 'next/server';
import { cancelBookingRequest } from '@/app/api/api-handlers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return cancelBookingRequest(id, request);
}
