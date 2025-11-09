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

export const SPECIALIZATIONS = [
  'AI/ML',
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Cloud Computing',
  'Cybersecurity',
  'DevOps',
  'Database Design',
  'Software Architecture',
  'UI/UX Design',
  'Blockchain',
  'IoT',
  'Computer Vision',
  'Natural Language Processing',
];

export const PROJECT_CATEGORIES = [
  'AI/ML',
  'Web Application',
  'Mobile App',
  'Data Analytics',
  'Cloud Platform',
  'Security Tool',
  'DevOps Tool',
  'Database System',
  'Game Development',
  'Computer Vision',
  'NLP Application',
  'IoT System',
];

export function calculateRecommendationScore(
  idea: { category: string; keywords: string[] },
  supervisor: { specialization: string; tags: string[] }
): { score: number; matchedTags: string[] } {
  let score = 0;
  const matchedTags: string[] = [];

  // Category match: +5
  if (idea.category.toLowerCase() === supervisor.specialization.toLowerCase()) {
    score += 5;
  }

  // Keyword-tag matches: +2 each
  idea.keywords.forEach((keyword) => {
    supervisor.tags.forEach((tag) => {
      if (
        keyword.toLowerCase().includes(tag.toLowerCase()) ||
        tag.toLowerCase().includes(keyword.toLowerCase())
      ) {
        if (!matchedTags.includes(tag)) {
          matchedTags.push(tag);
          score += 2;
        }
      }
    });
  });

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
    return '/dashboard';
  } else {
    return '/dashboard';
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
