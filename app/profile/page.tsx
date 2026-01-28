'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/context/ToastContext';
import { configAPI, userAPI, authAPI, Tag } from '@/app/lib/api-client';

interface UserProfile {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
}

interface SupervisorProfile {
    department?: string;
    tags?: string[];
    bio?: string;
    years_of_experience?: number;
    max_slots?: number;
    current_slots?: number;
    profile_picture?: string;
}

interface StudentProfile {
    registration_no?: string;
    department?: string;
    profile_picture?: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const { addToast } = useToast();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [profile, setProfile] = useState<SupervisorProfile | StudentProfile | null>(null);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        // Student fields
        registrationNo: '',
        department: '',
        // Supervisor fields
        tags: [] as string[],
        bio: '',
        yearsOfExperience: 0,
        maxSlots: 5,
        // Profile picture (base64)
        profilePicture: '',
    });

    useEffect(() => {
        fetchProfile();
        fetchDepartments();
    }, []);

    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

    const fetchDepartments = async () => {
        try {
            const response = await fetch('/api/admin/departments');
            const data = await response.json();
            setDepartments(data.departments || []);
        } catch (err) {
            console.error('Failed to fetch departments:', err);
        }
    };

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');

            // Fetch profile and tags in parallel
            const [profileRes, tagsRes] = await Promise.all([
                fetch('/api/user/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                configAPI.getTags(),
            ]);

            if (!profileRes.ok) {
                throw new Error('Failed to load profile');
            }

            const data = await profileRes.json();
            setUser(data.user);
            setProfile(data.profile);
            setAvailableTags(tagsRes.tags);

            // Initialize form data
            setFormData(prev => ({
                ...prev,
                name: data.user.name || '',
                email: data.user.email || '',
                // Student fields
                registrationNo: data.profile?.registration_no || '',
                department: data.profile?.department || '',
                // Supervisor fields
                tags: data.profile?.tags || [],
                bio: data.profile?.bio || '',
                yearsOfExperience: data.profile?.years_of_experience || 0,
                maxSlots: data.profile?.max_slots || 5,
                // Profile picture
                profilePicture: data.profile?.profile_picture || '',
            }));
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            addToast('Failed to load profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate password match
        if (formData.password && formData.password !== formData.confirmPassword) {
            addToast('Passwords do not match', 'error');
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('authToken');
            const payload: any = {
                name: formData.name,
                email: formData.email,
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            // Add role-specific profile data
            if (user?.role === 'STUDENT') {
                payload.profile = {
                    registrationNo: formData.registrationNo,
                    department: formData.department,
                    profilePicture: formData.profilePicture || undefined,
                };
            } else if (user?.role === 'SUPERVISOR') {
                payload.profile = {
                    department: formData.department,
                    tags: formData.tags,
                    bio: formData.bio,
                    yearsOfExperience: Number(formData.yearsOfExperience),
                    maxSlots: Number(formData.maxSlots),
                    profilePicture: formData.profilePicture || undefined,
                };
            }

            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            // Update local storage user data
            const userData = localStorage.getItem('user');
            if (userData) {
                const parsed = JSON.parse(userData);
                parsed.name = formData.name;
                parsed.email = formData.email;
                localStorage.setItem('user', JSON.stringify(parsed));
            }

            addToast('Profile updated successfully!', 'success');
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } catch (err) {
            console.error('Failed to update profile:', err);
            addToast(err instanceof Error ? err.message : 'Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') {
            addToast('Please type DELETE to confirm', 'error');
            return;
        }

        setDeleting(true);
        try {
            await userAPI.deleteProfile();
            addToast('Account deleted successfully', 'success');
            authAPI.logout();
            router.push('/login');
        } catch (err) {
            console.error('Failed to delete account:', err);
            addToast(err instanceof Error ? err.message : 'Failed to delete account', 'error');
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                        <p className="mt-4 text-gray-600">Loading profile...</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
                    <p className="text-gray-600">Manage your account settings and preferences</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <span className="inline-block px-3 py-1 bg-brand-100 text-brand-700 text-sm font-medium rounded-full">
                                {user?.role}
                            </span>
                            <span className="ml-3 text-sm text-gray-500">
                                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                    </div>

                    {/* Profile Picture */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                {formData.profilePicture ? (
                                    <img
                                        src={formData.profilePicture}
                                        alt="Profile"
                                        className="w-24 h-24 rounded-full object-cover border-4 border-brand-100"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-2xl font-bold">
                                        {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload a new photo
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            if (file.size > 5 * 1024 * 1024) {
                                                addToast('Image must be less than 5MB', 'error');
                                                return;
                                            }
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                const base64 = event.target?.result as string;
                                                setFormData(prev => ({ ...prev, profilePicture: base64 }));
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                                />
                                <p className="mt-2 text-xs text-gray-500">
                                    JPG, PNG, or GIF. Max 5MB.
                                </p>
                                {formData.profilePicture && (
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, profilePicture: '' }))}
                                        className="mt-2 text-sm text-red-600 hover:text-red-700"
                                    >
                                        <i className="fa-solid fa-trash mr-1"></i>
                                        Remove photo
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Password Change */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
                        <p className="text-sm text-gray-500 mb-4">Leave blank to keep current password</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Student Profile */}
                    {user?.role === 'STUDENT' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
                                    <input
                                        type="text"
                                        name="registrationNo"
                                        value={formData.registrationNo}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.name}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Supervisor Profile */}
                    {user?.role === 'SUPERVISOR' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Supervisor Details</h2>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                        <select
                                            name="department"
                                            value={formData.department}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map((dept) => (
                                                <option key={dept.id} value={dept.name}>{dept.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                                        <input
                                            type="number"
                                            name="yearsOfExperience"
                                            value={formData.yearsOfExperience}
                                            onChange={handleChange}
                                            min={0}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Slots</label>
                                        <input
                                            type="number"
                                            name="maxSlots"
                                            value={formData.maxSlots}
                                            onChange={handleChange}
                                            min={1}
                                            max={20}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                        placeholder="Tell students about your expertise..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags / Research Interests</label>
                                    <p className="text-sm text-gray-500 mb-3">Select tags that match your expertise:</p>

                                    {/* Flat list of tags */}
                                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                                        {availableTags.map((tag) => (
                                            <label
                                                key={tag.id}
                                                className={`cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium border transition ${formData.tags.includes(tag.name)
                                                    ? 'bg-brand-600 text-white border-brand-600'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={formData.tags.includes(tag.name)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag.name] }));
                                                        } else {
                                                            setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag.name) }));
                                                        }
                                                    }}
                                                />
                                                {formData.tags.includes(tag.name) && <i className="fa-solid fa-check mr-1"></i>}
                                                {tag.name}
                                            </label>
                                        ))}
                                    </div>

                                    {formData.tags.length > 0 && (
                                        <p className="text-sm text-brand-600 mt-2">
                                            <i className="fa-solid fa-check-circle mr-1"></i>
                                            {formData.tags.length} tag(s) selected
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 disabled:bg-gray-400 transition"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>

                {/* Danger Zone */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-red-200 p-6">
                    <h2 className="text-lg font-semibold text-red-600 mb-4">
                        <i className="fa-solid fa-exclamation-triangle mr-2"></i>
                        Danger Zone
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
                    >
                        <i className="fa-solid fa-trash mr-2"></i>
                        Delete Account
                    </button>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                <i className="fa-solid fa-exclamation-circle text-red-600 mr-2"></i>
                                Confirm Account Deletion
                            </h3>
                            <p className="text-gray-600 mb-4">
                                This action <strong>cannot be undone</strong>. This will permanently delete your account and remove all associated data.
                            </p>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Type <span className="font-bold text-red-600">DELETE</span> to confirm:
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                                    placeholder="Type DELETE here"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteConfirmText('');
                                    }}
                                    className="px-4 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteAccount}
                                    disabled={deleting || deleteConfirmText !== 'DELETE'}
                                    className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                                >
                                    {deleting ? 'Deleting...' : 'Delete My Account'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
