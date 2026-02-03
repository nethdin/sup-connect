import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/app/lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '@/app/lib/config';

const JWT_SECRET = config.auth.jwtSecret;
const SALT_ROUNDS = 10;

const getUserFromRequest = (request: NextRequest) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    try {
        return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    } catch {
        return null;
    }
};

// GET - Any authenticated user views their own profile
export async function GET(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await queryOne<any>(
            `SELECT id, email, name, role, created_at 
             FROM users WHERE id = ? AND deleted_at IS NULL`,
            [auth.userId]
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get role-specific profile data
        let profileData = null;

        if (user.role === 'SUPERVISOR') {
            profileData = await queryOne<any>(
                `SELECT id, department, tags, bio, 
                        years_of_experience, max_slots, current_slots, profile_picture
                 FROM supervisor_profiles WHERE user_id = ?`,
                [auth.userId]
            );
            if (profileData?.tags) {
                try {
                    let tagIds: string[] = JSON.parse(profileData.tags);
                    // Resolve tag IDs to names for profile form
                    const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
                    if (tagIds.some(isUuid)) {
                        const placeholders = tagIds.map(() => '?').join(',');
                        const rows = await query<{ id: string; name: string }[]>(
                            `SELECT id, name FROM tags WHERE id IN (${placeholders})`,
                            tagIds
                        );
                        const idToName = new Map(rows.map(r => [r.id, r.name]));
                        profileData.tags = tagIds.map(id => idToName.get(id)).filter((n): n is string => !!n);
                    } else {
                        // Already names (backward compatibility)
                        profileData.tags = tagIds;
                    }
                } catch {
                    profileData.tags = [];
                }
            }
            // Convert profile picture blob to base64
            if (profileData?.profile_picture) {
                const buffer = Buffer.from(profileData.profile_picture);
                profileData.profile_picture = buffer.toString('utf-8');
            }
        } else if (user.role === 'STUDENT') {
            profileData = await queryOne<any>(
                `SELECT id, registration_no, department, profile_picture
                 FROM student_profiles WHERE user_id = ?`,
                [auth.userId]
            );
            // Convert profile picture blob to base64
            if (profileData?.profile_picture) {
                const buffer = Buffer.from(profileData.profile_picture);
                profileData.profile_picture = buffer.toString('utf-8');
            }
        }

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                createdAt: user.created_at,
            },
            profile: profileData,
        });
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json({ error: 'Failed to get profile' }, { status: 500 });
    }
}

// PUT - Any authenticated user updates their own profile
export async function PUT(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, email, password, profile } = body;

        // Get current user
        const user = await queryOne<any>(
            'SELECT id, role FROM users WHERE id = ? AND deleted_at IS NULL',
            [auth.userId]
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update user basic info
        const userUpdates: string[] = [];
        const userValues: any[] = [];

        if (name) {
            userUpdates.push('name = ?');
            userValues.push(name);
        }
        if (email) {
            // Check if email is already taken
            const existing = await queryOne<any>(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [email, auth.userId]
            );
            if (existing) {
                return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
            }
            userUpdates.push('email = ?');
            userValues.push(email);
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            userUpdates.push('password_hash = ?');
            userValues.push(hashedPassword);
        }

        if (userUpdates.length > 0) {
            userUpdates.push('updated_at = NOW()');
            userValues.push(auth.userId);
            await query(
                `UPDATE users SET ${userUpdates.join(', ')} WHERE id = ?`,
                userValues
            );
        }

        // Update role-specific profile
        if (profile) {
            if (user.role === 'SUPERVISOR') {
                const { department, tags, bio, yearsOfExperience, maxSlots, profilePicture } = profile;
                const profUpdates: string[] = [];
                const profValues: any[] = [];

                if (department !== undefined) {
                    profUpdates.push('department = ?');
                    profValues.push(department);
                }
                if (tags !== undefined) {
                    // Convert tag names to IDs for storage
                    let tagIdsToStore: string[] = [];
                    if (tags.length > 0) {
                        const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
                        if (tags.some(isUuid)) {
                            // Already IDs
                            tagIdsToStore = tags;
                        } else {
                            // Convert names to IDs (case-insensitive)
                            const placeholders = tags.map(() => 'LOWER(?) = LOWER(name)').join(' OR ');
                            const rows = await query<{ id: string; name: string }[]>(
                                `SELECT id, name FROM tags WHERE ${placeholders}`,
                                tags
                            );
                            const nameToId = new Map(rows.map(r => [r.name.toLowerCase(), r.id]));
                            tagIdsToStore = tags
                                .map((name: string) => nameToId.get(name.toLowerCase()))
                                .filter((id: string | undefined): id is string => id !== undefined);
                        }
                    }
                    profUpdates.push('tags = ?');
                    profValues.push(JSON.stringify(tagIdsToStore));
                }
                if (bio !== undefined) {
                    profUpdates.push('bio = ?');
                    profValues.push(bio);
                }
                if (yearsOfExperience !== undefined) {
                    profUpdates.push('years_of_experience = ?');
                    profValues.push(yearsOfExperience);
                }
                if (maxSlots !== undefined) {
                    profUpdates.push('max_slots = ?');
                    profValues.push(maxSlots);
                }
                if (profilePicture !== undefined) {
                    profUpdates.push('profile_picture = ?');
                    // Store base64 string directly as blob
                    profValues.push(profilePicture);
                }

                if (profUpdates.length > 0) {
                    profUpdates.push('updated_at = NOW()');
                    profValues.push(auth.userId);
                    await query(
                        `UPDATE supervisor_profiles SET ${profUpdates.join(', ')} WHERE user_id = ?`,
                        profValues
                    );
                }
            } else if (user.role === 'STUDENT') {
                const { registrationNo, department, profilePicture } = profile;
                const profUpdates: string[] = [];
                const profValues: any[] = [];

                if (registrationNo !== undefined) {
                    profUpdates.push('registration_no = ?');
                    profValues.push(registrationNo);
                }
                if (department !== undefined) {
                    profUpdates.push('department = ?');
                    profValues.push(department);
                }
                if (profilePicture !== undefined) {
                    profUpdates.push('profile_picture = ?');
                    // Store base64 string directly as blob
                    profValues.push(profilePicture);
                }

                if (profUpdates.length > 0) {
                    profUpdates.push('updated_at = NOW()');
                    profValues.push(auth.userId);
                    await query(
                        `UPDATE student_profiles SET ${profUpdates.join(', ')} WHERE user_id = ?`,
                        profValues
                    );
                }
            }
        }

        return NextResponse.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}

// DELETE - Soft delete user account
export async function DELETE(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get current user
        const user = await queryOne<any>(
            'SELECT id, role FROM users WHERE id = ? AND deleted_at IS NULL',
            [auth.userId]
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // For supervisors, check if they have active assignments
        if (user.role === 'SUPERVISOR') {
            const supervisorProfile = await queryOne<any>(
                'SELECT id FROM supervisor_profiles WHERE user_id = ?',
                [auth.userId]
            );

            if (supervisorProfile) {
                const activeAssignments = await query<any[]>(
                    'SELECT id FROM assignments WHERE supervisor_id = ?',
                    [supervisorProfile.id]
                );

                if (activeAssignments && activeAssignments.length > 0) {
                    return NextResponse.json({
                        error: 'Cannot delete account with active student assignments. Please transfer or remove assignments first.'
                    }, { status: 400 });
                }

                // Cancel any pending booking requests
                await query(
                    `UPDATE booking_requests SET status = 'CANCELLED', updated_at = NOW() 
                     WHERE supervisor_id = ? AND status = 'PENDING'`,
                    [supervisorProfile.id]
                );
            }
        }

        // For students, cancel pending booking requests
        if (user.role === 'STUDENT') {
            await query(
                `UPDATE booking_requests SET status = 'CANCELLED', updated_at = NOW() 
                 WHERE student_id = ? AND status = 'PENDING'`,
                [auth.userId]
            );
        }

        // Soft delete the user
        await query(
            'UPDATE users SET deleted_at = NOW(), updated_at = NOW() WHERE id = ?',
            [auth.userId]
        );

        return NextResponse.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete profile error:', error);
        return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
