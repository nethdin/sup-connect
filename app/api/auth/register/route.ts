import { NextRequest } from 'next/server';
import { registerUser } from '@/app/api/api-handlers';

export async function POST(request: NextRequest) {
  return registerUser(request);
}
