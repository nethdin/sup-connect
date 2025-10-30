import { NextRequest } from 'next/server';
import { loginUser } from '@/app/api/api-handlers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return loginUser(request);
}
