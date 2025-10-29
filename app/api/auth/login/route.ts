import { NextRequest } from 'next/server';
import { loginUser } from '@/app/api/api-handlers';

export async function POST(request: NextRequest) {
  return loginUser(request);
}
