import { NextRequest } from 'next/server';
import { declineBookingRequest } from '@/app/api/api-handlers';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return declineBookingRequest(id, request);
}
