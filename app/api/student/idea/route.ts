import { NextRequest } from 'next/server';
import { submitProjectIdea, getStudentProjectIdea } from '@/app/api/api-handlers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return getStudentProjectIdea(request);
}

export async function POST(request: NextRequest) {
  return submitProjectIdea(request);
}
