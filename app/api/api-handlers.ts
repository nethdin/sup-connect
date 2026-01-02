import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, getPool } from '@/app/lib/db';
import {
  User,
  UserRole,
  SupervisorProfile,
  StudentProjectIdea,
  BookingRequest,
  BookingRequestStatus,
  Meeting,
  RecommendedSupervisor,
} from '@/app/lib/types';

// ============================================
// CONFIGURATION
// ============================================

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';
const SALT_ROUNDS = 10;

// ============================================
// HELPER FUNCTIONS
// ============================================

// Generate unique ID
const generateId = () => uuidv4();

// Hash password
const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

// Verify password
const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Create JWT token
const createToken = (userId: string, role: UserRole): string => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRY } as jwt.SignOptions);
};

// Verify JWT token
const verifyToken = (token: string): { userId: string; role: UserRole } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: UserRole };
    return decoded;
  } catch {
    return null;
  }
};

// Get user from request
export const getUserFromRequest = (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyToken(token);
};

// Helper function to safely parse tags from database
// Handles both JSON array format and comma-separated string format
const parseTags = (tagsData: any): string[] => {
  if (!tagsData) return [];

  // If it's already an array, return it
  if (Array.isArray(tagsData)) return tagsData;

  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(tagsData);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // If JSON parsing fails, treat as comma-separated string
  }

  // Handle comma-separated string
  if (typeof tagsData === 'string') {
    return tagsData
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }

  return [];
};

// ============================================
// AUTH ENDPOINTS
// ============================================

export async function registerUser(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role, department, registrationNo, researchInterests, preferredFields, specialization, tags, bio, maxSlots } = body;

    // Validation
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Role-specific validation
    if (role === 'STUDENT' && (!department || !registrationNo)) {
      return NextResponse.json(
        { error: 'Department and registration number are required for students' },
        { status: 400 }
      );
    }

    if (role === 'SUPERVISOR' && (!department || !specialization || !tags || !bio || !maxSlots)) {
      return NextResponse.json(
        { error: 'Department, specialization, tags, bio, and max slots are required for supervisors' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await queryOne<User>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Check if registration number exists (for students)
    if (role === 'STUDENT') {
      const existingRegNo = await queryOne(
        'SELECT * FROM student_profiles WHERE registration_no = ?',
        [registrationNo]
      );

      if (existingRegNo) {
        return NextResponse.json(
          { error: 'Registration number already exists' },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userId = generateId();

    // Create basic user record (same for all roles)
    await query(
      'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
      [userId, email, hashedPassword, name, role]
    );

    // Create role-specific profile
    if (role === 'STUDENT') {
      const studentProfileId = generateId();
      await query(
        'INSERT INTO student_profiles (id, user_id, registration_no, department, research_interests, preferred_fields) VALUES (?, ?, ?, ?, ?, ?)',
        [
          studentProfileId,
          userId,
          registrationNo,
          department,
          researchInterests || null,
          preferredFields ? JSON.stringify(preferredFields) : null
        ]
      );
    } else if (role === 'SUPERVISOR') {
      const supervisorProfileId = generateId();
      await query(
        'INSERT INTO supervisor_profiles (id, user_id, department, specialization, tags, bio, max_slots, current_slots) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [supervisorProfileId, userId, department, specialization, JSON.stringify(tags), bio, maxSlots, 0]
      );
    }

    // Create token
    const token = createToken(userId, role as UserRole);

    return NextResponse.json({
      message: 'User registered successfully',
      user: { id: userId, email, name, role },
      token,
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
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

    console.log('Login attempt for email:', email);

    // Validation
    if (!email || !password) {
      console.log('Login failed: Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find user
    const user = await queryOne<User & { password: string }>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      console.log('Login failed: User not found for email:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('User found:', { id: user.id, email: user.email, name: user.name, role: user.role });
    console.log('Password hash from DB:', user.password);

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    console.log('Password verification result:', isValidPassword);

    if (!isValidPassword) {
      console.log('Login failed: Invalid password for email:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create token
    const token = createToken(user.id, user.role);
    console.log('Login successful for:', email);
    console.log('Response data:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    return NextResponse.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
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
    // BUSINESS RULE: Must be authenticated (student or supervisor can view)
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const specialization = url.searchParams.get('specialization');
    const available = url.searchParams.get('available');

    let sql = `
      SELECT 
        sp.*,
        u.id as user_id,
        u.email as user_email,
        u.name as user_name,
        u.role as user_role
      FROM supervisor_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Filter by specialization
    if (specialization) {
      sql += ' AND sp.specialization LIKE ?';
      params.push(`%${specialization}%`);
    }

    // Filter by availability
    if (available === 'true') {
      sql += ' AND sp.current_slots < sp.max_slots';
    }

    const rows = await query<any[]>(sql, params);

    const supervisors = rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      specialization: row.specialization,
      tags: parseTags(row.tags),
      bio: row.bio,
      maxSlots: row.max_slots,
      currentSlots: row.current_slots,
      profilePicture: row.profile_picture,
      user: {
        id: row.user_id,
        email: row.user_email,
        name: row.user_name,
        role: row.user_role,
      },
    }));

    return NextResponse.json({
      supervisors,
      total: supervisors.length,
    });
  } catch (error) {
    console.error('Get supervisors error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supervisors' },
      { status: 500 }
    );
  }
}

export async function getSupervisorById(id: string) {
  try {
    const row = await queryOne<any>(
      `
      SELECT 
        sp.*,
        u.id as user_id,
        u.email as user_email,
        u.name as user_name,
        u.role as user_role
      FROM supervisor_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.id = ?
      `,
      [id]
    );

    if (!row) {
      return NextResponse.json(
        { error: 'Supervisor not found' },
        { status: 404 }
      );
    }

    const supervisor = {
      id: row.id,
      userId: row.user_id,
      specialization: row.specialization,
      tags: parseTags(row.tags),
      bio: row.bio,
      maxSlots: row.max_slots,
      currentSlots: row.current_slots,
      profilePicture: row.profile_picture,
      user: {
        id: row.user_id,
        email: row.user_email,
        name: row.user_name,
        role: row.user_role,
      },
    };

    return NextResponse.json({ supervisor });
  } catch (error) {
    console.error('Get supervisor error:', error);
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
    const existingProfile = await queryOne(
      'SELECT * FROM supervisor_profiles WHERE user_id = ?',
      [auth.userId]
    );

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already exists' },
        { status: 409 }
      );
    }

    const profileId = generateId();
    await query(
      'INSERT INTO supervisor_profiles (id, user_id, specialization, tags, bio, max_slots, current_slots) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [profileId, auth.userId, specialization, JSON.stringify(tags), bio, maxSlots, 0]
    );

    const profile = {
      id: profileId,
      userId: auth.userId,
      specialization,
      tags,
      bio,
      maxSlots: parseInt(maxSlots),
      currentSlots: 0,
    };

    return NextResponse.json({
      message: 'Profile created successfully',
      profile,
    }, { status: 201 });
  } catch (error) {
    console.error('Create profile error:', error);
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

    // BUSINESS RULE: Check if student has an assignment and if they can edit
    const assignment = await queryOne<any>(
      'SELECT id, supervisor_id, can_edit_idea FROM assignments WHERE student_id = ?',
      [auth.userId]
    );

    // If student has an assignment and editing is not allowed, prevent update
    if (assignment && !assignment.can_edit_idea) {
      return NextResponse.json(
        { error: 'You cannot edit your project idea after supervisor acceptance. Please contact your supervisor for permission.' },
        { status: 403 }
      );
    }

    // Check if student already has an active project idea
    const existingIdea = await queryOne<any>(
      'SELECT * FROM project_ideas WHERE student_id = ?',
      [auth.userId]
    );

    if (existingIdea) {
      // Update existing idea instead of creating a new one
      await query(
        'UPDATE project_ideas SET title = ?, description = ?, category = ?, keywords = ?, attachments = ?, created_at = NOW() WHERE id = ?',
        [
          title,
          description,
          category,
          JSON.stringify(keywords || []),
          JSON.stringify(attachments || []),
          existingIdea.id
        ]
      );

      const updatedIdea = {
        id: existingIdea.id,
        studentId: auth.userId,
        title,
        description,
        category,
        keywords: keywords || [],
        attachments: attachments || [],
        createdAt: new Date(),
      };

      return NextResponse.json({
        message: 'Project idea updated successfully',
        idea: updatedIdea,
      }, { status: 200 });
    }

    // Create new idea if none exists
    const ideaId = generateId();
    await query(
      'INSERT INTO project_ideas (id, student_id, title, description, category, keywords, attachments) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        ideaId,
        auth.userId,
        title,
        description,
        category,
        JSON.stringify(keywords || []),
        JSON.stringify(attachments || [])
      ]
    );

    const idea = {
      id: ideaId,
      studentId: auth.userId,
      title,
      description,
      category,
      keywords: keywords || [],
      attachments: attachments || [],
      createdAt: new Date(),
    };

    return NextResponse.json({
      message: 'Project idea submitted successfully',
      idea,
    }, { status: 201 });
  } catch (error) {
    console.error('Submit idea error:', error);
    return NextResponse.json(
      { error: 'Failed to submit project idea' },
      { status: 500 }
    );
  }
}

export async function getStudentProjectIdea(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth || auth.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get student's project idea
    const studentIdea = await queryOne<any>(
      'SELECT * FROM project_ideas WHERE student_id = ?',
      [auth.userId]
    );

    if (!studentIdea) {
      return NextResponse.json({
        projectIdea: null,
        message: 'No project idea found',
      });
    }

    const idea = {
      id: studentIdea.id,
      studentId: studentIdea.student_id,
      title: studentIdea.title,
      description: studentIdea.description,
      category: studentIdea.category,
      keywords: parseTags(studentIdea.keywords),
      attachments: parseTags(studentIdea.attachments),
      createdAt: studentIdea.created_at,
    };

    return NextResponse.json({
      projectIdea: idea,
    });
  } catch (error) {
    console.error('Get project idea error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project idea' },
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
    const studentIdea = await queryOne<any>(
      'SELECT * FROM project_ideas WHERE student_id = ? ORDER BY created_at DESC LIMIT 1',
      [auth.userId]
    );

    if (!studentIdea) {
      return NextResponse.json({
        recommendations: [],
        message: 'No project idea found. Please submit a project idea first.',
      });
    }

    const keywords = JSON.parse(studentIdea.keywords);

    // Get available supervisors
    const supervisors = await query<any[]>(
      `
      SELECT 
        sp.*,
        u.id as user_id,
        u.email as user_email,
        u.name as user_name
      FROM supervisor_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.current_slots < sp.max_slots
      `
    );

    // Calculate matches
    const recommendations = supervisors
      .map(supervisor => {
        const tags = parseTags(supervisor.tags);
        const matchedTags = tags.filter((tag: string) =>
          keywords.some((keyword: string) =>
            keyword.toLowerCase().includes(tag.toLowerCase()) ||
            tag.toLowerCase().includes(keyword.toLowerCase())
          ) || studentIdea.category.toLowerCase().includes(tag.toLowerCase())
        );

        const score = matchedTags.length * 10 +
          (supervisor.specialization.toLowerCase().includes(studentIdea.category.toLowerCase()) ? 20 : 0);

        return {
          supervisor: {
            id: supervisor.id,
            userId: supervisor.user_id,
            specialization: supervisor.specialization,
            tags,
            bio: supervisor.bio,
            maxSlots: supervisor.max_slots,
            currentSlots: supervisor.current_slots,
            user: {
              id: supervisor.user_id,
              email: supervisor.user_email,
              name: supervisor.user_name,
              role: 'SUPERVISOR' as UserRole,
              createdAt: new Date(),
            },
          } as SupervisorProfile,
          score,
          matchedTags,
        } as RecommendedSupervisor;
      })
      .filter(rec => rec.score > 0)
      .sort((a, b) => b.score - a.score);

    return NextResponse.json({
      recommendations,
      projectIdea: {
        id: studentIdea.id,
        studentId: studentIdea.student_id,
        title: studentIdea.title,
        description: studentIdea.description,
        category: studentIdea.category,
        keywords,
        createdAt: studentIdea.created_at,
      },
    });
  } catch (error) {
    console.error('Get matches error:', error);
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

    // BUSINESS RULE: Check if student already has ANY pending request
    const existingPendingRequest = await queryOne(
      'SELECT * FROM booking_requests WHERE student_id = ? AND status = ?',
      [auth.userId, 'PENDING']
    );

    if (existingPendingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending request. Please wait for a response or cancel it first.' },
        { status: 409 }
      );
    }

    // BUSINESS RULE: Check if student already has an assignment
    const existingAssignment = await queryOne(
      'SELECT * FROM assignments WHERE student_id = ?',
      [auth.userId]
    );

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'You already have a supervisor assigned. Cannot send new requests.' },
        { status: 409 }
      );
    }

    // Check if supervisor exists
    const supervisor = await queryOne(
      'SELECT * FROM supervisor_profiles WHERE id = ?',
      [supervisorId]
    );

    if (!supervisor) {
      return NextResponse.json(
        { error: 'Supervisor not found' },
        { status: 404 }
      );
    }

    // Check availability
    const profile = await queryOne<any>(
      'SELECT * FROM supervisor_profiles WHERE id = ?',
      [supervisorId]
    );

    if (profile.current_slots >= profile.max_slots) {
      return NextResponse.json(
        { error: 'Supervisor slots are full' },
        { status: 409 }
      );
    }

    const requestId = generateId();
    await query(
      'INSERT INTO booking_requests (id, student_id, supervisor_id, status) VALUES (?, ?, ?, ?)',
      [requestId, auth.userId, supervisorId, 'PENDING']
    );

    const bookingRequest = {
      id: requestId,
      studentId: auth.userId,
      supervisorId,
      status: 'PENDING' as BookingRequestStatus,
      createdAt: new Date(),
    };

    return NextResponse.json({
      message: 'Booking request sent successfully',
      request: bookingRequest,
    }, { status: 201 });
  } catch (error) {
    console.error('Send request error:', error);
    return NextResponse.json(
      { error: 'Failed to send booking request' },
      { status: 500 }
    );
  }
}

export async function cancelBookingRequest(requestId: string, request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth || auth.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find booking request belonging to the student
    const bookingRequest = await queryOne<any>(
      'SELECT * FROM booking_requests WHERE id = ? AND student_id = ?',
      [requestId, auth.userId]
    );

    if (!bookingRequest) {
      return NextResponse.json(
        { error: 'Booking request not found' },
        { status: 404 }
      );
    }

    if (bookingRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only cancel pending requests' },
        { status: 400 }
      );
    }

    // Cancel the request
    await query(
      'UPDATE booking_requests SET status = ?, responded_at = NOW() WHERE id = ?',
      ['CANCELLED', requestId]
    );

    const cancelledRequest = await queryOne<any>(
      'SELECT * FROM booking_requests WHERE id = ?',
      [requestId]
    );

    return NextResponse.json({
      message: 'Request cancelled successfully',
      request: cancelledRequest,
    });
  } catch (error) {
    console.error('Cancel request error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking request' },
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
    const profile = await queryOne<any>(
      'SELECT * FROM supervisor_profiles WHERE user_id = ?',
      [auth.userId]
    );

    if (!profile) {
      return NextResponse.json(
        { error: 'Supervisor profile not found' },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    let sql = `
      SELECT 
        br.*,
        u.id as student_user_id,
        u.email as student_email,
        u.name as student_name,
        pi.id as project_id,
        pi.title as project_title,
        pi.description as project_description,
        pi.category as project_category,
        pi.keywords as project_keywords,
        pi.attachments as project_attachments,
        pi.created_at as project_created_at
      FROM booking_requests br
      JOIN users u ON br.student_id = u.id
      LEFT JOIN project_ideas pi ON pi.student_id = br.student_id
      WHERE br.supervisor_id = ?
    `;
    const params: any[] = [profile.id];

    if (status) {
      sql += ' AND br.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY br.created_at DESC';

    const rows = await query<any[]>(sql, params);

    const requests = rows.map(row => ({
      id: row.id,
      studentId: row.student_id,
      supervisorId: row.supervisor_id,
      status: row.status,
      createdAt: row.created_at,
      respondedAt: row.responded_at,
      student: {
        id: row.student_user_id,
        email: row.student_email,
        name: row.student_name,
      },
      projectIdea: row.project_id ? {
        id: row.project_id,
        title: row.project_title,
        description: row.project_description,
        category: row.project_category,
        keywords: parseTags(row.project_keywords),
        attachments: parseTags(row.project_attachments),
        createdAt: row.project_created_at,
      } : null,
    }));

    return NextResponse.json({
      requests,
      total: requests.length,
    });
  } catch (error) {
    console.error('Get requests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

export async function acceptBookingRequest(requestId: string, request: NextRequest) {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();

    const auth = getUserFromRequest(request);
    if (!auth || auth.role !== 'SUPERVISOR') {
      await connection.rollback();
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get supervisor profile with row lock
    const [profileRows] = await connection.query<any[]>(
      'SELECT * FROM supervisor_profiles WHERE user_id = ? FOR UPDATE',
      [auth.userId]
    );

    if (!profileRows || profileRows.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: 'Supervisor profile not found' },
        { status: 404 }
      );
    }

    const profile = profileRows[0];

    // Find booking request with lock
    const [bookingRows] = await connection.query<any[]>(
      'SELECT * FROM booking_requests WHERE id = ? AND supervisor_id = ? FOR UPDATE',
      [requestId, profile.id]
    );

    if (!bookingRows || bookingRows.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: 'Booking request not found' },
        { status: 404 }
      );
    }

    const bookingRequest = bookingRows[0];

    if (bookingRequest.status !== 'PENDING') {
      await connection.rollback();
      return NextResponse.json(
        { error: 'Request has already been processed' },
        { status: 400 }
      );
    }

    // BUSINESS RULE: Check if slots are available (with locked data)
    if (profile.current_slots >= profile.max_slots) {
      await connection.query(
        'UPDATE booking_requests SET status = ?, responded_at = NOW() WHERE id = ?',
        ['SLOT_FULL', requestId]
      );
      await connection.commit();
      return NextResponse.json(
        { error: 'No slots available' },
        { status: 409 }
      );
    }

    // Accept the request
    await connection.query(
      'UPDATE booking_requests SET status = ?, responded_at = NOW() WHERE id = ?',
      ['ACCEPTED', requestId]
    );

    // Increment supervisor slots
    await connection.query(
      'UPDATE supervisor_profiles SET current_slots = current_slots + 1 WHERE id = ?',
      [profile.id]
    );

    // BUSINESS RULE: Create assignment for the student
    // can_edit_idea is set to 0 (false) by default, preventing edits after assignment
    const assignmentId = generateId();
    await connection.query(
      'INSERT INTO assignments (id, student_id, supervisor_id, can_edit_idea, created_at) VALUES (?, ?, ?, 0, NOW())',
      [assignmentId, bookingRequest.student_id, profile.id]
    );

    // BUSINESS RULE: Auto-decline all other pending requests from this student
    await connection.query(
      'UPDATE booking_requests SET status = ?, responded_at = NOW() WHERE student_id = ? AND status = ? AND id != ?',
      ['DECLINED', bookingRequest.student_id, 'PENDING', requestId]
    );

    await connection.commit();

    const [updatedRows] = await connection.query<any[]>(
      'SELECT * FROM booking_requests WHERE id = ?',
      [requestId]
    );

    return NextResponse.json({
      message: 'Request accepted successfully',
      request: updatedRows[0],
      assignmentId: assignmentId,
    });
  } catch (error) {
    await connection.rollback();
    console.error('Accept request error:', error);
    return NextResponse.json(
      { error: 'Failed to accept request' },
      { status: 500 }
    );
  } finally {
    connection.release();
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
    const profile = await queryOne<any>(
      'SELECT * FROM supervisor_profiles WHERE user_id = ?',
      [auth.userId]
    );

    if (!profile) {
      return NextResponse.json(
        { error: 'Supervisor profile not found' },
        { status: 404 }
      );
    }

    // Find booking request
    const bookingRequest = await queryOne<any>(
      'SELECT * FROM booking_requests WHERE id = ? AND supervisor_id = ?',
      [requestId, profile.id]
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
    await query(
      'UPDATE booking_requests SET status = ?, responded_at = NOW() WHERE id = ?',
      ['DECLINED', requestId]
    );

    const updatedRequest = await queryOne<any>(
      'SELECT * FROM booking_requests WHERE id = ?',
      [requestId]
    );

    return NextResponse.json({
      message: 'Request declined successfully',
      request: updatedRequest,
    });
  } catch (error) {
    console.error('Decline request error:', error);
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

    let sql = `
      SELECT 
        m.*,
        s.id as student_user_id,
        s.name as student_name,
        s.email as student_email,
        sp.id as supervisor_profile_id,
        sp.specialization,
        su.id as supervisor_user_id,
        su.name as supervisor_name,
        su.email as supervisor_email
      FROM meetings m
      JOIN users s ON m.student_id = s.id
      JOIN supervisor_profiles sp ON m.supervisor_id = sp.id
      JOIN users su ON sp.user_id = su.id
      WHERE m.student_id = ? OR sp.user_id = ?
    `;
    const params: any[] = [auth.userId, auth.userId];

    if (upcoming === 'true') {
      sql += ' AND m.date_time > NOW()';
    }

    sql += ' ORDER BY m.date_time ASC';

    const rows = await query<any[]>(sql, params);

    const meetings = rows.map(row => ({
      id: row.id,
      studentId: row.student_id,
      supervisorId: row.supervisor_id,
      dateTime: row.date_time,
      mode: row.mode,
      notes: row.notes,
      feedback: row.feedback,
      createdAt: row.created_at,
      student: {
        id: row.student_user_id,
        name: row.student_name,
        email: row.student_email,
      },
      supervisor: {
        id: row.supervisor_profile_id,
        specialization: row.specialization,
        user: {
          id: row.supervisor_user_id,
          name: row.supervisor_name,
          email: row.supervisor_email,
        },
      },
    }));

    return NextResponse.json({
      meetings,
      total: meetings.length,
    });
  } catch (error) {
    console.error('Get meetings error:', error);
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
    const supervisor = await queryOne(
      'SELECT * FROM supervisor_profiles WHERE id = ?',
      [supervisorId]
    );

    if (!supervisor) {
      return NextResponse.json(
        { error: 'Supervisor not found' },
        { status: 404 }
      );
    }

    // Check if user has accepted booking with supervisor
    if (auth.role === 'STUDENT') {
      const hasAcceptedBooking = await queryOne(
        'SELECT * FROM booking_requests WHERE student_id = ? AND supervisor_id = ? AND status = ?',
        [auth.userId, supervisorId, 'ACCEPTED']
      );

      if (!hasAcceptedBooking) {
        return NextResponse.json(
          { error: 'You must have an accepted booking request with this supervisor' },
          { status: 403 }
        );
      }
    }

    const meetingId = generateId();
    await query(
      'INSERT INTO meetings (id, student_id, supervisor_id, date_time, mode, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [
        meetingId,
        auth.role === 'STUDENT' ? auth.userId : body.studentId,
        supervisorId,
        dateTime,
        mode,
        notes
      ]
    );

    const meeting = await queryOne<any>(
      'SELECT * FROM meetings WHERE id = ?',
      [meetingId]
    );

    return NextResponse.json({
      message: 'Meeting booked successfully',
      meeting,
    }, { status: 201 });
  } catch (error) {
    console.error('Book meeting error:', error);
    return NextResponse.json(
      { error: 'Failed to book meeting' },
      { status: 500 }
    );
  }
}

// ============================================
// ASSIGNMENT ENDPOINTS
// ============================================

export async function getStudentAssignment(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth || auth.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get student's assignment
    const assignment = await queryOne<any>(
      `
      SELECT 
        a.*,
        sp.id as supervisor_profile_id,
        sp.specialization,
        sp.tags,
        sp.bio,
        sp.max_slots,
        sp.current_slots,
        sp.profile_picture,
        u.id as supervisor_user_id,
        u.name as supervisor_name,
        u.email as supervisor_email
      FROM assignments a
      JOIN supervisor_profiles sp ON a.supervisor_id = sp.id
      JOIN users u ON sp.user_id = u.id
      WHERE a.student_id = ?
      `,
      [auth.userId]
    );

    if (!assignment) {
      return NextResponse.json({
        assignment: null,
        message: 'No supervisor assigned yet',
      });
    }

    const formattedAssignment = {
      id: assignment.id,
      studentId: assignment.student_id,
      supervisorId: assignment.supervisor_id,
      assignedAt: assignment.created_at,
      canEditIdea: Boolean(assignment.can_edit_idea),
      supervisor: {
        id: assignment.supervisor_profile_id,
        userId: assignment.supervisor_user_id,
        specialization: assignment.specialization,
        tags: parseTags(assignment.tags),
        bio: assignment.bio,
        maxSlots: assignment.max_slots,
        currentSlots: assignment.current_slots,
        profilePicture: assignment.profile_picture,
        user: {
          id: assignment.supervisor_user_id,
          email: assignment.supervisor_email,
          name: assignment.supervisor_name,
          role: 'SUPERVISOR' as UserRole,
        },
      },
    };

    return NextResponse.json({
      assignment: formattedAssignment,
    });
  } catch (error) {
    console.error('Get student assignment error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignment' },
      { status: 500 }
    );
  }
}

export async function getSupervisorAssignments(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth || auth.role !== 'SUPERVISOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get supervisor profile
    const profile = await queryOne<any>(
      'SELECT * FROM supervisor_profiles WHERE user_id = ?',
      [auth.userId]
    );

    if (!profile) {
      return NextResponse.json(
        { error: 'Supervisor profile not found' },
        { status: 404 }
      );
    }

    // Get all assignments for this supervisor
    const rows = await query<any[]>(
      `
      SELECT 
        a.*,
        u.id as student_user_id,
        u.name as student_name,
        u.email as student_email,
        u.role as student_role
      FROM assignments a
      JOIN users u ON a.student_id = u.id
      WHERE a.supervisor_id = ?
      ORDER BY a.created_at DESC
      `,
      [profile.id]
    );

    const assignments = rows.map(row => ({
      id: row.id,
      studentId: row.student_id,
      supervisorId: row.supervisor_id,
      assignedAt: row.created_at,
      canEditIdea: Boolean(row.can_edit_idea),
      student: {
        id: row.student_user_id,
        email: row.student_email,
        name: row.student_name,
        role: row.student_role,
      },
    }));

    return NextResponse.json({
      assignments,
      total: assignments.length,
    });
  } catch (error) {
    console.error('Get supervisor assignments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

export async function getSupervisorStats(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth || auth.role !== 'SUPERVISOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get supervisor profile
    const profile = await queryOne<any>(
      'SELECT * FROM supervisor_profiles WHERE user_id = ?',
      [auth.userId]
    );

    if (!profile) {
      return NextResponse.json(
        { error: 'Supervisor profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      stats: {
        maxSlots: profile.max_slots,
        currentSlots: profile.current_slots,
        availableSlots: profile.max_slots - profile.current_slots,
        specialization: profile.specialization,
        tags: parseTags(profile.tags),
      },
    });
  } catch (error) {
    console.error('Get supervisor stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

// Toggle student's project idea edit permission
export async function toggleStudentEditPermission(studentId: string, request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth || auth.role !== 'SUPERVISOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get supervisor profile
    const profile = await queryOne<any>(
      'SELECT * FROM supervisor_profiles WHERE user_id = ?',
      [auth.userId]
    );

    if (!profile) {
      return NextResponse.json(
        { error: 'Supervisor profile not found' },
        { status: 404 }
      );
    }

    // Get the assignment
    const assignment = await queryOne<any>(
      'SELECT * FROM assignments WHERE student_id = ? AND supervisor_id = ?',
      [studentId, profile.id]
    );

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Toggle the can_edit_idea flag
    const newValue = assignment.can_edit_idea ? 0 : 1;
    await query(
      'UPDATE assignments SET can_edit_idea = ? WHERE id = ?',
      [newValue, assignment.id]
    );

    return NextResponse.json({
      message: `Edit permission ${newValue ? 'granted' : 'revoked'} successfully`,
      canEditIdea: Boolean(newValue),
    });
  } catch (error) {
    console.error('Toggle edit permission error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle edit permission' },
      { status: 500 }
    );
  }
}
