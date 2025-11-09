// Auth & User types
export type UserRole = 'STUDENT' | 'SUPERVISOR' | 'ADMIN';

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

// Availability Slot
export interface AvailabilitySlot {
  id: string;
  supervisorId: string;
  date: Date;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  bookedBy?: string;
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
  slot?: AvailabilitySlot;
}

// Progress Update
export interface ProgressUpdate {
  id: string;
  studentId: string;
  supervisorId: string;
  title: string;
  description: string;
  attachments: string[];
  createdAt: Date;
}

// Notification
export type NotificationType =
  | 'REQUEST_SUBMITTED'
  | 'REQUEST_ACCEPTED'
  | 'REQUEST_DECLINED'
  | 'SLOT_BOOKED'
  | 'MEETING_SCHEDULED'
  | 'FEEDBACK_POSTED'
  | 'PROGRESS_UPDATE';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  body: string;
  relatedId?: string;
  read: boolean;
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
