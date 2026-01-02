import { NextRequest } from 'next/server';
import { getStudentAssignment } from '@/app/api/api-handlers';

export async function GET(request: NextRequest) {
  return getStudentAssignment(request);
}

export const dynamic = 'force-dynamic';
