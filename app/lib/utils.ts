// Utility functions

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export async function fetcher<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'An error occurred');
  }

  return res.json();
}

// Legacy constants removed - now using tags from database

export function calculateRecommendationScore(
  idea: { tags: string[] },
  supervisor: { tags: string[]; yearsOfExperience?: number }
): { score: number; matchedTags: string[] } {
  const matchedTags: string[] = [];

  // Tag matches: +10 each
  idea.tags.forEach((ideaTag) => {
    supervisor.tags.forEach((supTag) => {
      if (
        ideaTag.toLowerCase() === supTag.toLowerCase() ||
        ideaTag.toLowerCase().includes(supTag.toLowerCase()) ||
        supTag.toLowerCase().includes(ideaTag.toLowerCase())
      ) {
        if (!matchedTags.includes(supTag)) {
          matchedTags.push(supTag);
        }
      }
    });
  });

  // Score formula: (tag overlap * 10) + (years of experience * 2)
  const tagScore = matchedTags.length * 10;
  const experienceScore = (supervisor.yearsOfExperience || 0) * 2;
  const score = tagScore + experienceScore;

  return { score, matchedTags };
}

export function sortRecommendations<T extends { score: number }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => b.score - a.score);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get the user's default dashboard URL based on their role
 */
export function getUserDashboardUrl(role: string): string {
  if (role === 'SUPERVISOR') {
    return '/supervisor/dashboard';
  } else if (role === 'STUDENT') {
    return '/student/dashboard';
  } else {
    return '/';
  }
}

/**
 * Check if user is logged in and return their info
 */
export function getLoggedInUser(): { role: string; id: string; name: string; email: string } | null {
  if (typeof window === 'undefined') return null;

  try {
    const authToken = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');

    if (authToken && userStr) {
      return JSON.parse(userStr);
    }
  } catch (error) {
    console.error('Error getting logged in user:', error);
  }

  return null;
}
