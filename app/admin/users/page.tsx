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
}

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
    const [formData, setFormData] = useState<UserFormData>({
        name: '',
        email: '',
        password: '',
        role: 'STUDENT',
    });

    const isEditMode = !!editUser;

    useEffect(() => {
        if (editUser) {
            setFormData({
                name: editUser.name,
                email: editUser.email,
                password: '',
                role: editUser.role,
            });
        } else {
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'STUDENT',
            });
        }
    }, [editUser, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isEditMode && !formData.password) {
            addToast('Password is required for new users', 'error');
            return;
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 animate-fade-in">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {isEditMode ? 'Edit User' : 'Create New User'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {isEditMode
                                ? 'Update user information'
                                : 'Add a new user to the system'}
                        </p>
                    </div>

                    <div className="p-6 space-y-4">
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                >
                                    <option value="STUDENT">Student</option>
                                    <option value="SUPERVISOR">Supervisor</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-xl">
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

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    useEffect(() => {
        fetchUsers();
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsed = JSON.parse(userData);
            setCurrentUserId(parsed.id);
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
        </RouteGuard>
    );
}
