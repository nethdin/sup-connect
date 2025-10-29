import { NextRequest } from 'next/server';
import { getAllSupervisors } from '@/app/api/api-handlers';

export async function GET(request: NextRequest) {
  return getAllSupervisors(request);
}
