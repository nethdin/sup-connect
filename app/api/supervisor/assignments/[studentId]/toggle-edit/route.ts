import { NextRequest } from 'next/server';
import { toggleStudentEditPermission } from '@/app/api/api-handlers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await params;
  return toggleStudentEditPermission(studentId, request);
}
