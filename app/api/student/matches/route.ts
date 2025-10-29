import { NextRequest } from 'next/server';
import { getRecommendationMatches } from '@/app/api/api-handlers';

export async function GET(request: NextRequest) {
  return getRecommendationMatches(request);
}
