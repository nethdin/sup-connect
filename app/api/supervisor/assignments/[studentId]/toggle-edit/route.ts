import { NextRequest } from 'next/server';
import { toggleStudentEditPermission } from '@/app/api/api-handlers';

export async function POST(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  return toggleStudentEditPermission(params.studentId, request);
}
