'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RouteGuard from '@/app/components/RouteGuard';
import { formatDate } from '@/app/lib/utils';
import { useToast } from '@/app/context/ToastContext';
import { useModal } from '@/app/context/ModalContext';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    created_at: string;
}

interface UserFormData {
    name: string;
    email: string;
    password: string;
    role: string;
    // Student-specific
    department: string;
    registrationNo: string;
    // Supervisor-specific
    tags: string[];
    bio: string;
    maxSlots: number;
    yearsOfExperience: number;
}

interface DepartmentOption {
    id: string;
    name: string;
}

interface TagOption {
    id: string;
    name: string;
    category: string | null;
}

const INITIAL_FORM: UserFormData = {
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    department: '',
    registrationNo: '',
    tags: [],
    bio: '',
    maxSlots: 5,
    yearsOfExperience: 0,
};

// User Form Modal Component
function UserFormModal({
    isOpen,
    onClose,
    onSuccess,
    editUser,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editUser: User | null;
}) {
    const { addToast } = useToast();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<UserFormData>({ ...INITIAL_FORM });
    const [departments, setDepartments] = useState<DepartmentOption[]>([]);
    const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);

    const isEditMode = !!editUser;

    // Fetch departments and tags when modal opens
    useEffect(() => {
        if (!isOpen) return;

        const fetchOptions = async () => {
            setLoadingOptions(true);
            try {
                const token = localStorage.getItem('authToken');
                const headers = { Authorization: `Bearer ${token}` };

                const [deptRes, tagRes] = await Promise.all([
                    fetch('/api/admin/departments', { headers }),
                    fetch('/api/tags'),
                ]);

                if (deptRes.ok) {
                    const deptData = await deptRes.json();
                    setDepartments(deptData.departments || []);
                }
                if (tagRes.ok) {
                    const tagData = await tagRes.json();
                    setAvailableTags(tagData.tags || []);
                }
            } catch {
                // Non-blocking — form still works, dropdowns just empty
            } finally {
                setLoadingOptions(false);
            }
        };

        fetchOptions();
    }, [isOpen]);

    useEffect(() => {
        if (editUser) {
            setFormData({
                ...INITIAL_FORM,
                name: editUser.name,
                email: editUser.email,
                role: editUser.role,
            });
        } else {
            setFormData({ ...INITIAL_FORM });
        }
    }, [editUser, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTagToggle = (tagName: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tagName)
                ? prev.tags.filter(t => t !== tagName)
                : [...prev.tags, tagName],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isEditMode && !formData.password) {
            addToast('Password is required for new users', 'error');
            return;
        }

        // Client-side role-specific validation
        if (!isEditMode) {
            if (formData.role === 'STUDENT') {
                if (!formData.department) {
                    addToast('Department is required for students', 'error');
                    return;
                }
                if (!formData.registrationNo.trim()) {
                    addToast('Registration number is required for students', 'error');
                    return;
                }
            }
            if (formData.role === 'SUPERVISOR') {
                if (formData.tags.length === 0) {
                    addToast('At least one tag is required for supervisors', 'error');
                    return;
                }
                if (!formData.bio.trim()) {
                    addToast('Bio is required for supervisors', 'error');
                    return;
                }
            }
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('authToken');
            const url = isEditMode
                ? `/api/admin/users/${editUser.id}`
                : '/api/admin/users';
            const method = isEditMode ? 'PUT' : 'POST';

            const payload: any = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            // Attach role-specific fields for new users
            if (!isEditMode) {
                if (formData.role === 'STUDENT') {
                    payload.department = formData.department;
                    payload.registrationNo = formData.registrationNo;
                } else if (formData.role === 'SUPERVISOR') {
                    payload.department = formData.department || null;
                    payload.tags = formData.tags;
                    payload.bio = formData.bio;
                    payload.maxSlots = Number(formData.maxSlots) || 5;
                    payload.yearsOfExperience = Number(formData.yearsOfExperience) || 0;
                }
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Failed to ${isEditMode ? 'update' : 'create'} user`);
            }

            addToast(`User ${isEditMode ? 'updated' : 'created'} successfully`, 'success');
            onSuccess();
            onClose();
        } catch (err) {
            addToast(err instanceof Error ? err.message : 'Operation failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    // Group tags by category for display
    const tagsByCategory: Record<string, TagOption[]> = {};
    availableTags.forEach(tag => {
        const cat = tag.category || 'Other';
        if (!tagsByCategory[cat]) tagsByCategory[cat] = [];
        tagsByCategory[cat].push(tag);
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 animate-fade-in max-h-[90vh] flex flex-col">
                <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-gray-200 shrink-0">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {isEditMode ? 'Edit User' : 'Create New User'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {isEditMode
                                ? 'Update user information'
                                : 'Add a new user to the system'}
                        </p>
                    </div>

                    <div className="p-6 space-y-4 overflow-y-auto">
                        {/* Base fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password {isEditMode && <span className="text-gray-400">(leave blank to keep)</span>}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required={!isEditMode}
                                    placeholder={isEditMode ? '••••••••' : ''}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    disabled={isEditMode}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    <option value="STUDENT">Student</option>
                                    <option value="SUPERVISOR">Supervisor</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                        </div>

                        {/* ── Student-specific fields ── */}
                        {!isEditMode && formData.role === 'STUDENT' && (
                            <div className="border-t border-gray-200 pt-4 space-y-4">
                                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Student Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Department <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="department"
                                            value={formData.department}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                        >
                                            <option value="">Select department...</option>
                                            {departments.map(d => (
                                                <option key={d.id} value={d.name}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Registration No <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="registrationNo"
                                            value={formData.registrationNo}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g. IT21012345"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Supervisor-specific fields ── */}
                        {!isEditMode && formData.role === 'SUPERVISOR' && (
                            <div className="border-t border-gray-200 pt-4 space-y-4">
                                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Supervisor Details</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                        <select
                                            name="department"
                                            value={formData.department}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                        >
                                            <option value="">Select department...</option>
                                            {departments.map(d => (
                                                <option key={d.id} value={d.name}>{d.name}</option>
                                            ))}
                                        </select>
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
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Years of Exp.</label>
                                        <input
                                            type="number"
                                            name="yearsOfExperience"
                                            value={formData.yearsOfExperience}
                                            onChange={handleChange}
                                            min={0}
                                            max={50}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bio <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        required
                                        rows={3}
                                        placeholder="Brief professional biography..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Expertise Tags <span className="text-red-500">*</span>
                                        <span className="text-gray-400 font-normal ml-1">({formData.tags.length} selected)</span>
                                    </label>
                                    {loadingOptions ? (
                                        <p className="text-sm text-gray-400">Loading tags...</p>
                                    ) : (
                                        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-3">
                                            {Object.entries(tagsByCategory).map(([category, tags]) => (
                                                <div key={category}>
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{category}</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {tags.map(tag => (
                                                            <button
                                                                key={tag.id}
                                                                type="button"
                                                                onClick={() => handleTagToggle(tag.name)}
                                                                className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                                                                    formData.tags.includes(tag.name)
                                                                        ? 'bg-brand-600 text-white border-brand-600'
                                                                        : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'
                                                                }`}
                                                            >
                                                                {tag.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-xl shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 disabled:bg-gray-400 transition"
                        >
                            {saving ? 'Saving...' : isEditMode ? 'Update User' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Transfer SUPER_ADMIN Modal Component
function TransferModal({
    isOpen,
    onClose,
    onConfirm,
    targetUser,
    isTransferring,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (password: string, confirmationPhrase: string) => void;
    targetUser: User | null;
    isTransferring: boolean;
}) {
    const { addToast } = useToast();
    const [password, setPassword] = useState('');
    const [confirmationPhrase, setConfirmationPhrase] = useState('');
    const [step, setStep] = useState(1);
    const [verifyingPassword, setVerifyingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    const REQUIRED_PHRASE = 'TRANSFER SUPER ADMIN';

    useEffect(() => {
        if (!isOpen) {
            setPassword('');
            setConfirmationPhrase('');
            setStep(1);
            setPasswordError('');
        }
    }, [isOpen]);

    if (!isOpen || !targetUser) return null;

    const handleNextStep = async () => {
        if (step === 1 && password) {
            setVerifyingPassword(true);
            setPasswordError('');

            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch('/api/auth/verify-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ password }),
                });

                const data = await response.json();

                if (!response.ok || !data.valid) {
                    setPasswordError(data.error || 'Invalid password');
                    return;
                }

                // Password verified, proceed to step 2
                setStep(2);
            } catch (err) {
                setPasswordError('Failed to verify password');
            } finally {
                setVerifyingPassword(false);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirmationPhrase === REQUIRED_PHRASE) {
            onConfirm(password, confirmationPhrase);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 animate-fade-in">
                <div className="p-6 border-b border-gray-200 bg-red-50 rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <i className="fa-solid fa-triangle-exclamation text-2xl text-red-600"></i>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-red-800">
                                Transfer SUPER_ADMIN Role
                            </h2>
                            <p className="text-sm text-red-600">
                                This action is irreversible
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <p className="text-sm text-amber-800">
                                <strong>Warning:</strong> You are about to transfer SUPER_ADMIN to{' '}
                                <strong>{targetUser.name}</strong>. You will be demoted to ADMIN and logged out.
                            </p>
                        </div>

                        {step === 1 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Step 1: Enter Your Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setPasswordError('');
                                    }}
                                    placeholder="Your current password"
                                    autoFocus
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none ${passwordError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                />
                                {passwordError && (
                                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                                        <i className="fa-solid fa-circle-xmark"></i> {passwordError}
                                    </p>
                                )}
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Step 2: Type the confirmation phrase exactly
                                </label>
                                <div className="bg-gray-100 px-4 py-2 rounded-lg mb-3 font-mono text-center text-lg font-bold text-gray-700">
                                    {REQUIRED_PHRASE}
                                </div>
                                <input
                                    type="text"
                                    value={confirmationPhrase}
                                    onChange={(e) => setConfirmationPhrase(e.target.value.toUpperCase())}
                                    placeholder="Type the phrase above"
                                    autoFocus
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none font-mono"
                                />
                                {confirmationPhrase && confirmationPhrase !== REQUIRED_PHRASE && (
                                    <p className="text-sm text-red-600 mt-2">
                                        Phrase doesn't match. Please type exactly: {REQUIRED_PHRASE}
                                    </p>
                                )}
                                {confirmationPhrase === REQUIRED_PHRASE && (
                                    <p className="text-sm text-green-600 mt-2">
                                        <i className="fa-solid fa-circle-check"></i> Phrase matches
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between gap-3 px-6 py-4 bg-gray-50 rounded-b-xl">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                        >
                            Cancel
                        </button>

                        {step === 1 && (
                            <button
                                type="button"
                                onClick={handleNextStep}
                                disabled={!password || verifyingPassword}
                                className="px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 disabled:bg-gray-400 transition flex items-center gap-2"
                            >
                                {verifyingPassword ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin"></i>
                                        Verifying...
                                    </>
                                ) : (
                                    'Next Step →'
                                )}
                            </button>
                        )}

                        {step === 2 && (
                            <button
                                type="submit"
                                disabled={confirmationPhrase !== REQUIRED_PHRASE || isTransferring}
                                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition"
                            >
                                {isTransferring ? 'Transferring...' : 'Transfer SUPER_ADMIN'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

// Main Page Component
export default function AdminUsersPage() {
    const { addToast } = useToast();
    const { confirm } = useModal();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [roleFilter, setRoleFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
    const [transferringId, setTransferringId] = useState<string | null>(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Transfer modal state
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [transferTarget, setTransferTarget] = useState<User | null>(null);

    useEffect(() => {
        fetchUsers();
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsed = JSON.parse(userData);
            setCurrentUserId(parsed.id);
            setCurrentUserRole(parsed.role);
        }
    }, []);

    useEffect(() => {
        let filtered = users;

        if (roleFilter) {
            filtered = filtered.filter(u => u.role === roleFilter);
        }

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(
                u => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)
            );
        }

        setFilteredUsers(filtered);
    }, [users, roleFilter, searchTerm]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Failed to fetch users');

            const data = await response.json();
            setUsers(data.users || []);
            setFilteredUsers(data.users || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId: string, userName: string) => {
        const confirmed = await confirm({
            title: 'Delete User',
            message: `Are you sure you want to delete "${userName}"? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'danger',
        });

        if (!confirmed) return;

        setDeletingId(userId);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete user');
            }

            addToast('User deleted successfully', 'success');
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            addToast(err instanceof Error ? err.message : 'Failed to delete user', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const openTransferModal = (user: User) => {
        setTransferTarget(user);
        setIsTransferModalOpen(true);
    };

    const closeTransferModal = () => {
        setIsTransferModalOpen(false);
        setTransferTarget(null);
    };

    const executeTransfer = async (password: string, confirmationPhrase: string) => {
        if (!transferTarget) return;

        setTransferringId(transferTarget.id);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/admin/transfer-super-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    targetUserId: transferTarget.id,
                    password,
                    confirmationPhrase,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to transfer role');
            }

            addToast(`SUPER_ADMIN transferred to ${transferTarget.name}. Logging out...`, 'success');
            closeTransferModal();

            // Clear auth and redirect to login
            setTimeout(() => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }, 2000);
        } catch (err) {
            addToast(err instanceof Error ? err.message : 'Failed to transfer role', 'error');
        } finally {
            setTransferringId(null);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'SUPER_ADMIN': return 'bg-red-100 text-red-700';
            case 'ADMIN': return 'bg-orange-100 text-orange-700';
            case 'SUPERVISOR': return 'bg-purple-100 text-purple-700';
            case 'STUDENT': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const canModifyUser = (targetRole: string, targetId: string) => {
        if (targetId === currentUserId) return false;
        if (targetRole === 'SUPER_ADMIN') return false;
        return true;
    };

    return (
        <RouteGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
            <main className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
                            <p className="text-gray-600">View and manage all users in the system</p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="px-4 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition"
                        >
                            + Create User
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by name or email..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                >
                                    <option value="">All Roles</option>
                                    <option value="STUDENT">Student</option>
                                    <option value="SUPERVISOR">Supervisor</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                </select>
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-gray-600">
                            Showing {filteredUsers.length} of {users.length} users
                        </p>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                                <p className="text-gray-600 mt-4">Loading users...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12">
                                <p className="text-red-600 mb-4">{error}</p>
                                <button
                                    onClick={fetchUsers}
                                    className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600">No users found</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {user.name}
                                                        {user.id === currentUserId && (
                                                            <span className="ml-2 text-xs text-brand-600">(You)</span>
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                                                    {user.role.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDate(user.created_at)}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                {canModifyUser(user.role, user.id) ? (
                                                    <>
                                                        {/* Transfer button - only SUPER_ADMIN can see, only for ADMIN users */}
                                                        {currentUserRole === 'SUPER_ADMIN' && user.role === 'ADMIN' && (
                                                            <button
                                                                onClick={() => openTransferModal(user)}
                                                                disabled={transferringId === user.id}
                                                                className="text-amber-600 hover:text-amber-700 text-sm font-medium disabled:opacity-50"
                                                            >
                                                                {transferringId === user.id ? 'Transferring...' : 'Transfer SA'}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => openEditModal(user)}
                                                            className="text-brand-600 hover:text-brand-700 text-sm font-medium"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user.id, user.name)}
                                                            disabled={deletingId === user.id}
                                                            className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                                                        >
                                                            {deletingId === user.id ? 'Deleting...' : 'Delete'}
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-gray-400">
                                                        {user.id === currentUserId ? 'Use Profile' : 'Protected'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Back Link */}
                    <div className="mt-6">
                        <Link href="/admin/dashboard" className="text-brand-600 hover:text-brand-700 font-medium">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </main>

            {/* User Form Modal */}
            <UserFormModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSuccess={fetchUsers}
                editUser={editingUser}
            />

            {/* Transfer Modal */}
            <TransferModal
                isOpen={isTransferModalOpen}
                onClose={closeTransferModal}
                onConfirm={executeTransfer}
                targetUser={transferTarget}
                isTransferring={transferringId !== null}
            />
        </RouteGuard>
    );
}
