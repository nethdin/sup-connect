// Auth & User types
export type UserRole = 'STUDENT' | 'SUPERVISOR' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

// Student Profile
export interface StudentProfile {
  id: string;
  userId: string;
  registrationNo: string;
  department: string;
  researchInterests?: string;
  preferredFields?: string[];
  profilePicture?: string;
  user?: User;
}

// Supervisor Profile
export interface SupervisorProfile {
  id: string;
  userId: string;
  department?: string;
  specialization: string;
  tags: string[];
  bio: string;
  yearsOfExperience: number;
  maxSlots: number;
  currentSlots: number;
  profilePicture?: string;
  user?: User;
}

// Student Project Idea
export interface StudentProjectIdea {
  id: string;
  studentId: string;
  title: string;
  description: string;
  category: string;
  keywords: string[];
  attachments: string[];
  createdAt: Date;
  recommendations?: RecommendedSupervisor[];
}

// Booking Request
export type BookingRequestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'SLOT_FULL';

export interface BookingRequest {
  id: string;
  studentId: string;
  supervisorId: string;
  status: BookingRequestStatus;
  createdAt: Date;
  respondedAt?: Date;
  student?: User;
  supervisor?: SupervisorProfile;
  projectIdea?: StudentProjectIdea;
}

// Assignment
export interface Assignment {
  id: string;
  studentId: string;
  supervisorId: string;
  assignedAt: Date;
  canEditIdea: boolean;
  student?: User;
  supervisor?: SupervisorProfile;
}

// Meeting
export interface Meeting {
  id: string;
  studentId: string;
  supervisorId: string;
  dateTime: Date;
  mode: 'IN_PERSON' | 'ONLINE';
  notes?: string;
  feedback?: string;
  createdAt: Date;
}

// Recommendation
export interface RecommendedSupervisor {
  supervisor: SupervisorProfile;
  score: number;
  matchedTags: string[];
}

// Form states
export interface RegisterFormData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface SupervisorProfileFormData {
  specialization: string;
  tags: string[];
  bio: string;
  maxSlots: number;
}

export interface ProjectIdeaFormData {
  title: string;
  description: string;
  category: string;
  keywords: string[];
  attachments: File[];
}
