import { NextRequest } from 'next/server';
import { acceptBookingRequest } from '@/app/api/api-handlers';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return acceptBookingRequest(id, request);
}
