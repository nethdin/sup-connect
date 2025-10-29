import { NextRequest } from 'next/server';
import { getSupervisorById } from '@/app/api/api-handlers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return getSupervisorById(params.id);
}
