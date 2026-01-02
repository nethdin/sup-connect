'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import RouteGuard from '@/app/components/RouteGuard';
import { useToast } from '@/app/context/ToastContext';

interface UserData {
    id: string;
    email: string;
    name: string;
    role: string;
}

export default function EditUserPage() {
    const router = useRouter();
    const params = useParams();
    const { addToast } = useToast();
    const userId = params.id as string;

    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: '',
    });

    useEffect(() => {
        fetchUser();
    }, [userId]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to load user');
            }

            const data = await response.json();
            setUser(data.user);
            setFormData({
                name: data.user.name || '',
                email: data.user.email || '',
                password: '',
                role: data.user.role || '',
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load user');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = localStorage.getItem('authToken');
            const payload: any = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update user');
            }

            addToast('User updated successfully', 'success');
            router.push('/admin/users');
        } catch (err) {
            addToast(err instanceof Error ? err.message : 'Failed to update user', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <RouteGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                <main className="min-h-screen bg-gray-50">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                            <p className="mt-4 text-gray-600">Loading user...</p>
                        </div>
                    </div>
                </main>
            </RouteGuard>
        );
    }

    if (error || !user) {
        return (
            <RouteGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                <main className="min-h-screen bg-gray-50">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="text-center py-12">
                            <p className="text-red-600 mb-4">{error || 'User not found'}</p>
                            <Link href="/admin/users" className="text-brand-600 hover:text-brand-700 font-medium">
                                ← Back to Users
                            </Link>
                        </div>
                    </div>
                </main>
            </RouteGuard>
        );
    }

    return (
        <RouteGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
            <main className="min-h-screen bg-gray-50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href="/admin/users" className="text-brand-600 hover:text-brand-700 font-medium mb-4 inline-block">
                            ← Back to Users
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit User</h1>
                        <p className="text-gray-600">Update user information</p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password <span className="text-gray-400">(leave blank to keep current)</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
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

                        <div className="mt-8 flex justify-end gap-4">
                            <Link
                                href="/admin/users"
                                className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 disabled:bg-gray-400"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </RouteGuard>
    );
}
