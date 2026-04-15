import { NextRequest } from 'next/server';
import { getSupervisorById } from '@/app/api/api-handlers';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return getSupervisorById(id);
}
