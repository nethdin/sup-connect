import { NextRequest, NextResponse } from 'next/server';
import {
  User,
  UserRole,
  SupervisorProfile,
  StudentProjectIdea,
  BookingRequest,
  BookingRequestStatus,
  Meeting,
  RecommendedSupervisor,
  AvailabilitySlot,
} from '@/app/lib/types';

// ============================================
// MOCK DATABASE (Replace with actual database)
// ============================================

// In-memory storage for demonstration
let users: User[] = [];
let supervisorProfiles: SupervisorProfile[] = [];
let projectIdeas: StudentProjectIdea[] = [];
let bookingRequests: BookingRequest[] = [];
let meetings: Meeting[] = [];
let availabilitySlots: AvailabilitySlot[] = [];

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper to simulate password hashing (use bcrypt in production)
const hashPassword = (password: string) => `hashed_${password}`;
const verifyPassword = (password: string, hashedPassword: string) => 
  hashedPassword === `hashed_${password}`;

// Helper to create JWT token (use proper JWT library in production)
const createToken = (userId: string, role: UserRole) => {
  return Buffer.from(JSON.stringify({ userId, role, exp: Date.now() + 86400000 })).toString('base64');
};

// Helper to verify token
const verifyToken = (token: string): { userId: string; role: UserRole } | null => {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    if (decoded.exp < Date.now()) return null;
    return { userId: decoded.userId, role: decoded.role };
  } catch {
    return null;
  }
};

// Helper to get user from request
const getUserFromRequest = (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyToken(token);
};

// ============================================
// AUTH ENDPOINTS
// ============================================

export async function registerUser(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    // Validation
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    if (users.find(u => u.email === email)) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Create user
    const user: User = {
      id: generateId(),
      email,
      name,
      role: role as UserRole,
      createdAt: new Date(),
    };

    users.push(user);

    // Create token
    const token = createToken(user.id, user.role);

    return NextResponse.json({
      message: 'User registered successfully',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}

export async function loginUser(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find user (in production, verify password hash)
    const user = users.find(u => u.email === email);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create token
    const token = createToken(user.id, user.role);

    return NextResponse.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}

// ============================================
// SUPERVISOR ENDPOINTS
// ============================================

export async function getAllSupervisors(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const specialization = url.searchParams.get('specialization');
    const available = url.searchParams.get('available');

    let filteredProfiles = supervisorProfiles.map(profile => ({
      ...profile,
      user: users.find(u => u.id === profile.userId),
    }));

    // Filter by specialization
    if (specialization) {
      filteredProfiles = filteredProfiles.filter(p => 
        p.specialization.toLowerCase().includes(specialization.toLowerCase())
      );
    }

    // Filter by availability
    if (available === 'true') {
      filteredProfiles = filteredProfiles.filter(p => 
        p.currentSlots < p.maxSlots
      );
    }

    return NextResponse.json({
      supervisors: filteredProfiles,
      total: filteredProfiles.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch supervisors' },
      { status: 500 }
    );
  }
}

export async function getSupervisorById(id: string) {
  try {
    const profile = supervisorProfiles.find(p => p.id === id);
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Supervisor not found' },
        { status: 404 }
      );
    }

    const user = users.find(u => u.id === profile.userId);

    return NextResponse.json({
      supervisor: {
        ...profile,
        user,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch supervisor' },
      { status: 500 }
    );
  }
}

export async function createSupervisorProfile(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth || auth.role !== 'SUPERVISOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { specialization, tags, bio, maxSlots } = body;

    // Validation
    if (!specialization || !tags || !bio || !maxSlots) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if profile already exists
    if (supervisorProfiles.find(p => p.userId === auth.userId)) {
      return NextResponse.json(
        { error: 'Profile already exists' },
        { status: 409 }
      );
    }

    const profile: SupervisorProfile = {
      id: generateId(),
      userId: auth.userId,
      specialization,
      tags: Array.isArray(tags) ? tags : [],
      bio,
      maxSlots: parseInt(maxSlots),
      currentSlots: 0,
    };

    supervisorProfiles.push(profile);

    return NextResponse.json({
      message: 'Profile created successfully',
      profile,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}

// ============================================
// STUDENT ENDPOINTS
// ============================================

export async function submitProjectIdea(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth || auth.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, category, keywords, attachments } = body;

    // Validation
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const idea: StudentProjectIdea = {
      id: generateId(),
      studentId: auth.userId,
      title,
      description,
      category,
      keywords: Array.isArray(keywords) ? keywords : [],
      attachments: Array.isArray(attachments) ? attachments : [],
      createdAt: new Date(),
    };

    projectIdeas.push(idea);

    return NextResponse.json({
      message: 'Project idea submitted successfully',
      idea,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit project idea' },
      { status: 500 }
    );
  }
}

export async function getRecommendationMatches(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth || auth.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get student's latest project idea
    const studentIdea = projectIdeas
      .filter(idea => idea.studentId === auth.userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    if (!studentIdea) {
      return NextResponse.json({
        recommendations: [],
        message: 'No project idea found. Please submit a project idea first.',
      });
    }

    // Simple matching algorithm based on keywords and tags
    const recommendations: RecommendedSupervisor[] = supervisorProfiles
      .filter(profile => profile.currentSlots < profile.maxSlots)
      .map(profile => {
        const matchedTags = profile.tags.filter(tag =>
          studentIdea.keywords.some(keyword =>
            keyword.toLowerCase().includes(tag.toLowerCase()) ||
            tag.toLowerCase().includes(keyword.toLowerCase())
          ) || studentIdea.category.toLowerCase().includes(tag.toLowerCase())
        );

        const score = matchedTags.length * 10 + 
          (profile.specialization.toLowerCase().includes(studentIdea.category.toLowerCase()) ? 20 : 0);

        return {
          supervisor: {
            ...profile,
            user: users.find(u => u.id === profile.userId),
          },
          score,
          matchedTags,
        };
      })
      .filter(rec => rec.score > 0)
      .sort((a, b) => b.score - a.score);

    return NextResponse.json({
      recommendations,
      projectIdea: studentIdea,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

export async function sendBookingRequest(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth || auth.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { supervisorId } = body;

    // Validation
    if (!supervisorId) {
      return NextResponse.json(
        { error: 'Supervisor ID is required' },
        { status: 400 }
      );
    }

    // Check if supervisor exists
    const supervisor = supervisorProfiles.find(p => p.id === supervisorId);
    if (!supervisor) {
      return NextResponse.json(
        { error: 'Supervisor not found' },
        { status: 404 }
      );
    }

    // Check if student already has a pending request
    const existingRequest = bookingRequests.find(
      r => r.studentId === auth.userId && r.supervisorId === supervisorId && r.status === 'PENDING'
    );
    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending request with this supervisor' },
        { status: 409 }
      );
    }

    // Check availability
    if (supervisor.currentSlots >= supervisor.maxSlots) {
      return NextResponse.json(
        { error: 'Supervisor slots are full' },
        { status: 409 }
      );
    }

    const bookingRequest: BookingRequest = {
      id: generateId(),
      studentId: auth.userId,
      supervisorId,
      status: 'PENDING',
      createdAt: new Date(),
    };

    bookingRequests.push(bookingRequest);

    return NextResponse.json({
      message: 'Booking request sent successfully',
      request: bookingRequest,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send booking request' },
      { status: 500 }
    );
  }
}

// ============================================
// SUPERVISOR REQUEST MANAGEMENT
// ============================================

export async function getSupervisorRequests(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth || auth.role !== 'SUPERVISOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get supervisor profile
    const profile = supervisorProfiles.find(p => p.userId === auth.userId);
    if (!profile) {
      return NextResponse.json(
        { error: 'Supervisor profile not found' },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    let requests = bookingRequests.filter(r => r.supervisorId === profile.id);

    // Filter by status
    if (status) {
      requests = requests.filter(r => r.status === status);
    }

    // Populate with student data
    const populatedRequests = requests.map(req => ({
      ...req,
      student: users.find(u => u.id === req.studentId),
      supervisor: profile,
    }));

    return NextResponse.json({
      requests: populatedRequests,
      total: populatedRequests.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

export async function acceptBookingRequest(requestId: string, request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth || auth.role !== 'SUPERVISOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get supervisor profile
    const profile = supervisorProfiles.find(p => p.userId === auth.userId);
    if (!profile) {
      return NextResponse.json(
        { error: 'Supervisor profile not found' },
        { status: 404 }
      );
    }

    // Find booking request
    const bookingRequest = bookingRequests.find(
      r => r.id === requestId && r.supervisorId === profile.id
    );
    if (!bookingRequest) {
      return NextResponse.json(
        { error: 'Booking request not found' },
        { status: 404 }
      );
    }

    if (bookingRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Request has already been processed' },
        { status: 400 }
      );
    }

    // Check if slots are available
    if (profile.currentSlots >= profile.maxSlots) {
      bookingRequest.status = 'SLOT_FULL';
      bookingRequest.respondedAt = new Date();
      return NextResponse.json(
        { error: 'No slots available', request: bookingRequest },
        { status: 409 }
      );
    }

    // Accept request
    bookingRequest.status = 'ACCEPTED';
    bookingRequest.respondedAt = new Date();
    profile.currentSlots += 1;

    return NextResponse.json({
      message: 'Request accepted successfully',
      request: bookingRequest,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to accept request' },
      { status: 500 }
    );
  }
}

export async function declineBookingRequest(requestId: string, request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth || auth.role !== 'SUPERVISOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get supervisor profile
    const profile = supervisorProfiles.find(p => p.userId === auth.userId);
    if (!profile) {
      return NextResponse.json(
        { error: 'Supervisor profile not found' },
        { status: 404 }
      );
    }

    // Find booking request
    const bookingRequest = bookingRequests.find(
      r => r.id === requestId && r.supervisorId === profile.id
    );
    if (!bookingRequest) {
      return NextResponse.json(
        { error: 'Booking request not found' },
        { status: 404 }
      );
    }

    if (bookingRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Request has already been processed' },
        { status: 400 }
      );
    }

    // Decline request
    bookingRequest.status = 'DECLINED';
    bookingRequest.respondedAt = new Date();

    return NextResponse.json({
      message: 'Request declined successfully',
      request: bookingRequest,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to decline request' },
      { status: 500 }
    );
  }
}

// ============================================
// MEETING ENDPOINTS
// ============================================

export async function getMeetings(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const upcoming = url.searchParams.get('upcoming');

    let userMeetings = meetings.filter(
      m => m.studentId === auth.userId || 
           supervisorProfiles.find(p => p.id === m.supervisorId)?.userId === auth.userId
    );

    // Filter upcoming meetings
    if (upcoming === 'true') {
      const now = new Date();
      userMeetings = userMeetings.filter(m => m.dateTime > now);
    }

    // Sort by date
    userMeetings.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

    // Populate with user data
    const populatedMeetings = userMeetings.map(meeting => ({
      ...meeting,
      student: users.find(u => u.id === meeting.studentId),
      supervisor: supervisorProfiles.find(p => p.id === meeting.supervisorId),
    }));

    return NextResponse.json({
      meetings: populatedMeetings,
      total: populatedMeetings.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}

export async function bookMeetingSlot(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { supervisorId, dateTime, mode, notes } = body;

    // Validation
    if (!supervisorId || !dateTime || !mode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify supervisor exists
    const supervisor = supervisorProfiles.find(p => p.id === supervisorId);
    if (!supervisor) {
      return NextResponse.json(
        { error: 'Supervisor not found' },
        { status: 404 }
      );
    }

    // Check if user has accepted booking with supervisor
    const hasAcceptedBooking = bookingRequests.some(
      r => (r.studentId === auth.userId || supervisor.userId === auth.userId) &&
           (r.supervisorId === supervisorId || r.studentId === auth.userId) &&
           r.status === 'ACCEPTED'
    );

    if (!hasAcceptedBooking && auth.role === 'STUDENT') {
      return NextResponse.json(
        { error: 'You must have an accepted booking request with this supervisor' },
        { status: 403 }
      );
    }

    const meeting: Meeting = {
      id: generateId(),
      studentId: auth.role === 'STUDENT' ? auth.userId : body.studentId,
      supervisorId,
      dateTime: new Date(dateTime),
      mode: mode as 'IN_PERSON' | 'ONLINE',
      notes,
      createdAt: new Date(),
    };

    meetings.push(meeting);

    return NextResponse.json({
      message: 'Meeting booked successfully',
      meeting,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to book meeting' },
      { status: 500 }
    );
  }
}
