'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RouteGuard from '@/app/components/RouteGuard';
import ConfigManagementModal from '@/app/components/admin/ConfigManagementModal';

interface DashboardStats {
    totalUsers: number;
    students: number;
    supervisors: number;
    admins: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        students: 0,
        supervisors: 0,
        admins: 0,
    });
    const [activeModal, setActiveModal] = useState<'tags' | 'specializations' | 'categories' | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();

            if (data.users) {
                const users = data.users;
                setStats({
                    totalUsers: users.length,
                    students: users.filter((u: any) => u.role === 'STUDENT').length,
                    supervisors: users.filter((u: any) => u.role === 'SUPERVISOR').length,
                    admins: users.filter((u: any) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length,
                });
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <RouteGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
            <main className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-600">
                            Manage users, supervisors, and system settings
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">
                                        {loading ? '...' : stats.totalUsers}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Students</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">
                                        {loading ? '...' : stats.students}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Supervisors</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">
                                        {loading ? '...' : stats.supervisors}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Admins</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">
                                        {loading ? '...' : stats.admins}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Configuration Management */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Configuration Management</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Tags */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition cursor-pointer" onClick={() => setActiveModal('tags')}>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                        <i className="fa-solid fa-tags text-purple-600 text-xl"></i>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
                                        <p className="text-sm text-gray-500">Manage research tags</p>
                                    </div>
                                </div>
                                <button className="w-full py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition font-medium">
                                    Manage Tags
                                </button>
                            </div>

                            {/* Specializations */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition cursor-pointer" onClick={() => setActiveModal('specializations')}>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <i className="fa-solid fa-flask text-indigo-600 text-xl"></i>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Specializations</h3>
                                        <p className="text-sm text-gray-500">Supervisor specializations</p>
                                    </div>
                                </div>
                                <button className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition font-medium">
                                    Manage Specializations
                                </button>
                            </div>

                            {/* Categories */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition cursor-pointer" onClick={() => setActiveModal('categories')}>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                                        <i className="fa-solid fa-folder text-teal-600 text-xl"></i>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                                        <p className="text-sm text-gray-500">Project categories</p>
                                    </div>
                                </div>
                                <button className="w-full py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition font-medium">
                                    Manage Categories
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-blue-900 mb-2">User Management</h3>
                                <p className="text-sm text-blue-700 mb-4">
                                    View and manage student and supervisor accounts.
                                </p>
                                <Link
                                    href="/admin/users"
                                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Manage Users
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Config Management Modals */}
            {activeModal && (
                <ConfigManagementModal
                    isOpen={!!activeModal}
                    onClose={() => setActiveModal(null)}
                    type={activeModal}
                    title={
                        activeModal === 'tags' ? 'Manage Tags' :
                            activeModal === 'specializations' ? 'Manage Specializations' : 'Manage Categories'
                    }
                />
            )}
        </RouteGuard>
    );
}
