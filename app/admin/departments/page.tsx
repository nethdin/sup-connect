'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/context/ToastContext';
import { departmentAPI, Department } from '@/app/lib/api-client';

export default function DepartmentsPage() {
    const router = useRouter();
    const { addToast } = useToast();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
    const [formData, setFormData] = useState({ name: '', code: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const response = await departmentAPI.getDepartments(true);
            setDepartments(response.departments);
        } catch (err) {
            console.error('Failed to fetch departments:', err);
            addToast('Failed to load departments', 'error');
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingDepartment(null);
        setFormData({ name: '', code: '' });
        setShowModal(true);
    };

    const openEditModal = (department: Department) => {
        setEditingDepartment(department);
        setFormData({ name: department.name, code: department.code || '' });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            addToast('Department name is required', 'error');
            return;
        }

        setSaving(true);
        try {
            if (editingDepartment) {
                await departmentAPI.updateDepartment({
                    id: editingDepartment.id,
                    name: formData.name.trim(),
                    code: formData.code.trim() || undefined,
                });
                addToast('Department updated successfully', 'success');
            } else {
                await departmentAPI.createDepartment({
                    name: formData.name.trim(),
                    code: formData.code.trim() || undefined,
                });
                addToast('Department created successfully', 'success');
            }
            setShowModal(false);
            fetchDepartments();
        } catch (err) {
            console.error('Failed to save department:', err);
            addToast(err instanceof Error ? err.message : 'Failed to save department', 'error');
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (department: Department) => {
        try {
            await departmentAPI.updateDepartment({
                id: department.id,
                is_active: !department.is_active,
            });
            addToast(
                department.is_active ? 'Department deactivated' : 'Department activated',
                'success'
            );
            fetchDepartments();
        } catch (err) {
            console.error('Failed to toggle department:', err);
            addToast('Failed to update department', 'error');
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                        <p className="mt-4 text-gray-600">Loading departments...</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            <i className="fa-solid fa-building mr-3 text-brand-600"></i>
                            Department Management
                        </h1>
                        <p className="text-gray-600">Manage departments for students and supervisors</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="px-6 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition flex items-center gap-2"
                    >
                        <i className="fa-solid fa-plus"></i>
                        Add Department
                    </button>
                </div>

                {/* Departments Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Code</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {departments.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        <i className="fa-solid fa-building text-4xl mb-3"></i>
                                        <p>No departments yet</p>
                                        <p className="text-sm">Click "Add Department" to create one</p>
                                    </td>
                                </tr>
                            ) : (
                                departments.map((department) => (
                                    <tr key={department.id} className={!department.is_active ? 'bg-gray-50 opacity-60' : ''}>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">{department.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {department.code || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${department.is_active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                {department.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(department)}
                                                    className="px-3 py-1 text-brand-600 hover:bg-brand-50 rounded-lg transition"
                                                >
                                                    <i className="fa-solid fa-edit"></i>
                                                </button>
                                                <button
                                                    onClick={() => toggleActive(department)}
                                                    className={`px-3 py-1 rounded-lg transition ${department.is_active
                                                            ? 'text-red-600 hover:bg-red-50'
                                                            : 'text-green-600 hover:bg-green-50'
                                                        }`}
                                                >
                                                    <i className={`fa-solid ${department.is_active ? 'fa-ban' : 'fa-check'}`}></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                {editingDepartment ? 'Edit Department' : 'Add Department'}
                            </h3>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Department Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                        placeholder="e.g., Computer Science"
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Department Code (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                        placeholder="e.g., CS"
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 disabled:bg-gray-400 transition"
                                    >
                                        {saving ? 'Saving...' : editingDepartment ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
