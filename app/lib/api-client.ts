// API Client Utilities for sup-connect
// This file contains helper functions to interact with the REST API

const API_BASE_URL = '/api';

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Helper function to set auth token
export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
    // Also set as cookie for server-side middleware (7 days expiry)
    document.cookie = `authToken=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
  }
};

// Helper function to remove auth token
export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    // Also clear cookie
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
  }
};

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============================================
// AUTH API
// ============================================

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'STUDENT' | 'SUPERVISOR' | 'ADMIN';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
}

export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAuthToken(response.token);
    return response;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAuthToken(response.token);
    return response;
  },

  logout: () => {
    removeAuthToken();
    // Clear cookie as well
    if (typeof window !== 'undefined') {
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    }
  },
};

// ============================================
// SUPERVISOR API
// ============================================

export interface SupervisorProfile {
  id: string;
  userId: string;
  specialization: string;
  tags: string[];
  bio: string;
  maxSlots: number;
  currentSlots: number;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const supervisorAPI = {
  getAll: async (params?: {
    specialization?: string;
    available?: boolean;
  }): Promise<{ supervisors: SupervisorProfile[]; total: number }> => {
    const queryParams = new URLSearchParams();
    if (params?.specialization) queryParams.set('specialization', params.specialization);
    if (params?.available !== undefined) queryParams.set('available', params.available.toString());
    
    const query = queryParams.toString();
    return apiRequest(`/supervisors${query ? `?${query}` : ''}`);
  },

  getById: async (id: string): Promise<{ supervisor: SupervisorProfile }> => {
    return apiRequest(`/supervisors/${id}`);
  },

  createProfile: async (data: {
    specialization: string;
    tags: string[];
    bio: string;
    maxSlots: number;
  }): Promise<{ message: string; profile: SupervisorProfile }> => {
    return apiRequest('/supervisor/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getRequests: async (status?: string): Promise<{
    requests: any[];
    total: number;
  }> => {
    const query = status ? `?status=${status}` : '';
    return apiRequest(`/supervisor/requests${query}`);
  },

  acceptRequest: async (requestId: string): Promise<{ message: string; request: any }> => {
    return apiRequest(`/supervisor/requests/${requestId}/accept`, {
      method: 'POST',
    });
  },

  declineRequest: async (requestId: string): Promise<{ message: string; request: any }> => {
    return apiRequest(`/supervisor/requests/${requestId}/decline`, {
      method: 'POST',
    });
  },

  getStats: async (): Promise<{
    stats: {
      maxSlots: number;
      currentSlots: number;
      availableSlots: number;
      specialization: string;
      tags: string[];
    };
  }> => {
    return apiRequest('/supervisor/stats');
  },
};

// ============================================
// STUDENT API
// ============================================

export interface ProjectIdea {
  id: string;
  studentId: string;
  title: string;
  description: string;
  category: string;
  keywords: string[];
  attachments: string[];
  createdAt: string;
}

export const studentAPI = {
  submitIdea: async (data: {
    title: string;
    description: string;
    category: string;
    keywords: string[];
    attachments?: string[];
  }): Promise<{ message: string; idea: ProjectIdea }> => {
    return apiRequest('/student/idea', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMatches: async (): Promise<{
    recommendations: Array<{
      supervisor: SupervisorProfile;
      score: number;
      matchedTags: string[];
    }>;
    projectIdea: ProjectIdea;
  }> => {
    return apiRequest('/student/matches');
  },

  sendRequest: async (supervisorId: string): Promise<{
    message: string;
    request: any;
  }> => {
    return apiRequest('/student/request', {
      method: 'POST',
      body: JSON.stringify({ supervisorId }),
    });
  },

  getAssignment: async (): Promise<{
    assignment: any | null;
    message?: string;
  }> => {
    return apiRequest('/student/assignment');
  },
};

// ============================================
// ASSIGNMENT API
// ============================================

export const assignmentAPI = {
  getStudentAssignment: async (): Promise<{
    assignment: any | null;
    message?: string;
  }> => {
    return apiRequest('/student/assignment');
  },

  getSupervisorAssignments: async (): Promise<{
    assignments: any[];
    total: number;
  }> => {
    return apiRequest('/supervisor/assignments');
  },
};

// ============================================
// MEETING API
// ============================================

export interface Meeting {
  id: string;
  studentId: string;
  supervisorId: string;
  dateTime: string;
  mode: 'IN_PERSON' | 'ONLINE';
  notes?: string;
  feedback?: string;
  createdAt: string;
}

export const meetingAPI = {
  getAll: async (upcoming?: boolean): Promise<{
    meetings: Meeting[];
    total: number;
  }> => {
    const query = upcoming ? '?upcoming=true' : '';
    return apiRequest(`/meetings${query}`);
  },

  bookSlot: async (data: {
    supervisorId: string;
    dateTime: string;
    mode: 'IN_PERSON' | 'ONLINE';
    notes?: string;
  }): Promise<{ message: string; meeting: Meeting }> => {
    return apiRequest('/availability/book', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// Example 1: Register and Login
async function registerUser() {
  try {
    const result = await authAPI.register({
      email: 'student@test.com',
      password: 'password123',
      name: 'John Doe',
      role: 'STUDENT'
    });
    console.log('Registered:', result.user);
  } catch (error) {
    console.error('Registration failed:', error);
  }
}

// Example 2: Get all supervisors
async function fetchSupervisors() {
  try {
    const { supervisors } = await supervisorAPI.getAll({ available: true });
    console.log('Available supervisors:', supervisors);
  } catch (error) {
    console.error('Failed to fetch supervisors:', error);
  }
}

// Example 3: Submit project idea
async function submitProjectIdea() {
  try {
    const result = await studentAPI.submitIdea({
      title: 'AI Chatbot Project',
      description: 'Build an intelligent chatbot using NLP',
      category: 'Artificial Intelligence',
      keywords: ['NLP', 'chatbot', 'machine learning']
    });
    console.log('Idea submitted:', result.idea);
  } catch (error) {
    console.error('Failed to submit idea:', error);
  }
}

// Example 4: Get recommendation matches
async function getRecommendations() {
  try {
    const { recommendations } = await studentAPI.getMatches();
    console.log('Recommended supervisors:', recommendations);
  } catch (error) {
    console.error('Failed to get recommendations:', error);
  }
}

// Example 5: Send booking request
async function sendBookingRequest(supervisorId: string) {
  try {
    const result = await studentAPI.sendRequest(supervisorId);
    console.log('Request sent:', result.message);
  } catch (error) {
    console.error('Failed to send request:', error);
  }
}

// Example 6: Accept/Decline requests (Supervisor)
async function handleRequest(requestId: string, accept: boolean) {
  try {
    const result = accept 
      ? await supervisorAPI.acceptRequest(requestId)
      : await supervisorAPI.declineRequest(requestId);
    console.log('Request handled:', result.message);
  } catch (error) {
    console.error('Failed to handle request:', error);
  }
}

// Example 7: Book a meeting
async function bookMeeting() {
  try {
    const result = await meetingAPI.bookSlot({
      supervisorId: 'sup123',
      dateTime: '2025-11-01T14:00:00.000Z',
      mode: 'ONLINE',
      notes: 'Discuss project proposal'
    });
    console.log('Meeting booked:', result.meeting);
  } catch (error) {
    console.error('Failed to book meeting:', error);
  }
}

// Example 8: Get upcoming meetings
async function getUpcomingMeetings() {
  try {
    const { meetings } = await meetingAPI.getAll(true);
    console.log('Upcoming meetings:', meetings);
  } catch (error) {
    console.error('Failed to fetch meetings:', error);
  }
}
*/
