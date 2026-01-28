import { NextRequest } from 'next/server';
import { removeStudentAssignment } from '@/app/api/api-handlers';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ studentId: string }> }
) {
    const { studentId } = await params;
    return removeStudentAssignment(studentId, request);
}
