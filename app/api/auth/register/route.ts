import { NextRequest } from 'next/server';
import { registerUser } from '@/app/api/api-handlers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return registerUser(request);
}
