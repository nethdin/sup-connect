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
// USER PROFILE API
// ============================================

export const userAPI = {
  getProfile: async (): Promise<{
    user: { id: string; email: string; name: string; role: string; createdAt: string };
    profile: any;
  }> => {
    return apiRequest('/user/profile');
  },

  updateProfile: async (data: {
    name?: string;
    email?: string;
    password?: string;
    profile?: any;
  }): Promise<{ message: string }> => {
    return apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteProfile: async (): Promise<{ message: string }> => {
    return apiRequest('/user/profile', {
      method: 'DELETE',
    });
  },
};

// ============================================
// SUPERVISOR API
// ============================================

export interface SupervisorProfile {
  id: string;
  userId: string;
  department?: string;
  tags: string[];
  bio: string;
  yearsOfExperience: number;
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
    available?: boolean;
  }): Promise<{ supervisors: SupervisorProfile[]; total: number }> => {
    const queryParams = new URLSearchParams();
    if (params?.available !== undefined) queryParams.set('available', params.available.toString());

    const query = queryParams.toString();
    return apiRequest(`/supervisors${query ? `?${query}` : ''}`);
  },

  getById: async (id: string): Promise<{ supervisor: SupervisorProfile }> => {
    return apiRequest(`/supervisors/${id}`);
  },

  createProfile: async (data: {
    tags: string[];
    bio: string;
    maxSlots: number;
  }): Promise<{ message: string; profile: SupervisorProfile }> => {
    return apiRequest('/profile', {
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
      department: string;
      tags: string[];
    };
  }> => {
    return apiRequest('/supervisor/stats');
  },

  toggleStudentEditPermission: async (studentId: string): Promise<{
    message: string;
    canEditIdea: boolean;
  }> => {
    return apiRequest(`/supervisor/assignments/${studentId}/toggle-edit`, {
      method: 'POST',
    });
  },

  getSuggestedTags: async (): Promise<{
    suggestedTags: { id: string; name: string; category: string }[];
    recentTags?: { id: string; name: string; category: string }[];
    currentTagCount: number;
    categories?: string[];
  }> => {
    return apiRequest('/supervisor/suggested-tags');
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
  tags: string[];
  attachments: string[];
  createdAt: string;
}

export const studentAPI = {
  getIdea: async (): Promise<{
    projectIdea: ProjectIdea | null;
    message?: string;
  }> => {
    return apiRequest('/student/idea');
  },

  submitIdea: async (data: {
    title: string;
    description: string;
    tags: string[];
    attachments?: string[];
  }): Promise<{ message: string; idea: ProjectIdea }> => {
    return apiRequest('/student/idea', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMatches: async (sortBy: 'match_count' | 'experience' | 'availability' = 'match_count'): Promise<{
    recommendations: Array<{
      supervisor: SupervisorProfile;
      matchedTags: string[];
      matchCount: number;
      isFullMatch: boolean;
      score: number;
    }>;
    projectIdea: ProjectIdea;
    studentTags: string[];
    sortedBy: string;
    totalMatches: number;
    fullMatchCount: number;
    partialMatchCount: number;
  }> => {
    return apiRequest(`/student/matches?sortBy=${sortBy}`);
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

  getRequests: async (): Promise<{
    requests: Array<{
      id: string;
      status: string;
      created_at: string;
      responded_at: string | null;
      supervisor_id: string;
      supervisor_name: string;
      supervisor_email: string;
      department: string;
    }>;
  }> => {
    return apiRequest('/student/requests');
  },

  cancelRequest: async (requestId: string): Promise<{ message: string }> => {
    return apiRequest(`/student/request/${requestId}/cancel`, {
      method: 'POST',
    });
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
// MESSAGE API
// ============================================

export interface Conversation {
  user_id: string;
  user_name: string;
  user_email: string;
  user_role: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_name: string;
}

export const messageAPI = {
  getConversations: async (): Promise<{ conversations: Conversation[] }> => {
    return apiRequest('/messages');
  },

  getMessages: async (recipientId: string): Promise<{ messages: Message[] }> => {
    return apiRequest(`/messages/${recipientId}`);
  },

  sendMessage: async (receiverId: string, content: string): Promise<{ message: string; messageId: string }> => {
    return apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content }),
    });
  },

  markAsRead: async (recipientId: string): Promise<{ message: string }> => {
    return apiRequest(`/messages/${recipientId}`, {
      method: 'PUT',
    });
  },
};

// ============================================
// NOTIFICATION API
// ============================================

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

export const notificationAPI = {
  getNotifications: async (options?: { unreadOnly?: boolean; limit?: number }): Promise<{
    notifications: Notification[];
    unreadCount: number;
  }> => {
    const params = new URLSearchParams();
    if (options?.unreadOnly) params.set('unread', 'true');
    if (options?.limit) params.set('limit', options.limit.toString());
    const query = params.toString();
    return apiRequest(`/notifications${query ? `?${query}` : ''}`);
  },

  markAsRead: async (notificationId?: string): Promise<{ message: string }> => {
    return apiRequest('/notifications', {
      method: 'PUT',
      body: JSON.stringify(notificationId ? { notificationId } : { markAllRead: true }),
    });
  },

  delete: async (notificationId?: string): Promise<{ message: string }> => {
    const query = notificationId ? `?id=${notificationId}` : '?all=true';
    return apiRequest(`/notifications${query}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// CONFIG API (Tags)
// ============================================

export interface Tag {
  id: string;
  name: string;
}

export const configAPI = {
  getTags: async (): Promise<{ tags: Tag[] }> => {
    return apiRequest('/tags');
  },

  suggestTags: async (description: string): Promise<{
    suggestedTags: string[];
    existingTagsUsed: number;
    newTagsCreated: number;
    createdTags: string[];
  }> => {
    return apiRequest('/ai/suggest-tags', {
      method: 'POST',
      body: JSON.stringify({ description }),
    });
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
// DEPARTMENT API
// ============================================

export interface Department {
  id: string;
  name: string;
  code?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export const departmentAPI = {
  getDepartments: async (includeInactive = false): Promise<{ departments: Department[] }> => {
    const query = includeInactive ? '?all=true' : '';
    return apiRequest(`/admin/departments${query}`);
  },

  createDepartment: async (data: { name: string; code?: string }): Promise<{
    message: string;
    department: Department;
  }> => {
    return apiRequest('/admin/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateDepartment: async (data: {
    id: string;
    name?: string;
    code?: string;
    is_active?: boolean;
    sort_order?: number;
  }): Promise<{ message: string }> => {
    return apiRequest('/admin/departments', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteDepartment: async (id: string): Promise<{ message: string }> => {
    return apiRequest(`/admin/departments?id=${id}`, {
      method: 'DELETE',
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
