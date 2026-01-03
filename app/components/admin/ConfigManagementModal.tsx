'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/app/context/ToastContext';
import { useModal } from '@/app/context/ModalContext';

interface Item {
    id: string;
    name: string;
    category?: string;
    description?: string;
    is_active: boolean;
    sort_order?: number;
}

interface ConfigManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'tags' | 'specializations' | 'categories';
    title: string;
}

export default function ConfigManagementModal({
    isOpen,
    onClose,
    type,
    title,
}: ConfigManagementModalProps) {
    const { addToast } = useToast();
    const { confirm } = useModal();
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showInactive, setShowInactive] = useState(false);

    // Form state
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [formData, setFormData] = useState({ name: '', category: '', description: '' });

    const apiEndpoint = `/api/admin/${type}`;

    useEffect(() => {
        if (isOpen) {
            fetchItems();
        }
    }, [isOpen]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await fetch(apiEndpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            setItems(data[type] || []);
        } catch (err) {
            addToast('Failed to load items', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            addToast('Name is required', 'error');
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('authToken');
            const method = editingItem ? 'PUT' : 'POST';
            const body = editingItem
                ? { id: editingItem.id, ...formData }
                : formData;

            const response = await fetch(apiEndpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to save');
            }

            addToast(editingItem ? 'Updated successfully' : 'Created successfully', 'success');
            setEditingItem(null);
            setFormData({ name: '', category: '', description: '' });
            fetchItems();
        } catch (err) {
            addToast(err instanceof Error ? err.message : 'Failed to save', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (item: Item) => {
        try {
            const token = localStorage.getItem('authToken');
            await fetch(apiEndpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id: item.id, is_active: !item.is_active }),
            });

            addToast(item.is_active ? 'Deactivated' : 'Activated', 'success');
            fetchItems();
        } catch (err) {
            addToast('Failed to update', 'error');
        }
    };

    const handleEdit = (item: Item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            category: item.category || '',
            description: item.description || '',
        });
    };

    const handleCancel = () => {
        setEditingItem(null);
        setFormData({ name: '', category: '', description: '' });
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesActive = showInactive || item.is_active;
        return matchesSearch && matchesActive;
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900">
                        <i className={`fa-solid fa-${type === 'tags' ? 'tags' : type === 'specializations' ? 'flask' : 'folder'} mr-2 text-brand-600`}></i>
                        {title}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <i className="fa-solid fa-times text-xl"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {/* Add/Edit Form */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-gray-800 mb-3">
                            {editingItem ? 'Edit Item' : 'Add New'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                    placeholder="Enter name..."
                                />
                            </div>
                            {type === 'tags' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                        placeholder="e.g., AI, Web, Cloud..."
                                    />
                                </div>
                            )}
                            {type !== 'tags' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                        placeholder="Optional description..."
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:bg-gray-400 transition"
                            >
                                {saving ? (
                                    <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Saving...</>
                                ) : editingItem ? (
                                    <><i className="fa-solid fa-save mr-2"></i>Update</>
                                ) : (
                                    <><i className="fa-solid fa-plus mr-2"></i>Add</>
                                )}
                            </button>
                            {editingItem && (
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex gap-4 mb-4">
                        <div className="relative flex-1">
                            <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                placeholder="Search..."
                            />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                                type="checkbox"
                                checked={showInactive}
                                onChange={(e) => setShowInactive(e.target.checked)}
                                className="rounded"
                            />
                            Show inactive
                        </label>
                    </div>

                    {/* Items List */}
                    {loading ? (
                        <div className="text-center py-8">
                            <i className="fa-solid fa-spinner fa-spin text-2xl text-brand-600"></i>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No items found
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredItems.map(item => (
                                <div
                                    key={item.id}
                                    className={`flex items-center justify-between p-3 rounded-lg border ${item.is_active ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-300 opacity-60'
                                        }`}
                                >
                                    <div className="flex-1">
                                        <span className={`font-medium ${!item.is_active ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                            {item.name}
                                        </span>
                                        {item.category && (
                                            <span className="ml-2 text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                                                {item.category}
                                            </span>
                                        )}
                                        {item.description && (
                                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            title="Edit"
                                        >
                                            <i className="fa-solid fa-pen"></i>
                                        </button>
                                        <button
                                            onClick={() => handleToggleActive(item)}
                                            className={`p-2 rounded-lg transition ${item.is_active
                                                    ? 'text-red-600 hover:bg-red-50'
                                                    : 'text-green-600 hover:bg-green-50'
                                                }`}
                                            title={item.is_active ? 'Deactivate' : 'Activate'}
                                        >
                                            <i className={`fa-solid fa-${item.is_active ? 'ban' : 'check-circle'}`}></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                            {filteredItems.length} item(s) {showInactive && '(including inactive)'}
                        </span>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
