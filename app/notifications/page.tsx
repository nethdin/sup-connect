'use client';

import { useState, useEffect } from 'react';
import { notificationAPI, Notification } from '@/app/lib/api-client';
import { useToast } from '@/app/context/ToastContext';
import NotificationDetailModal from '@/app/components/common/NotificationDetailModal';

export default function NotificationsPage() {
    const { addToast } = useToast();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationAPI.getNotifications({ limit: 100 });
            setNotifications(response.notifications);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
            addToast('Failed to load notifications', 'error');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            await notificationAPI.markAsRead(notificationId);
            setNotifications(prev => prev.map(n =>
                n.id === notificationId ? { ...n, is_read: true } : n
            ));
        } catch (err) {
            console.error('Failed to mark as read:', err);
            addToast('Failed to mark as read', 'error');
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationAPI.markAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            addToast('All notifications marked as read', 'success');
        } catch (err) {
            console.error('Failed to mark all as read:', err);
            addToast('Failed to mark all as read', 'error');
        }
    };

    const deleteNotification = async (notificationId: string) => {
        try {
            setDeleting(notificationId);
            await notificationAPI.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            addToast('Notification deleted', 'success');
        } catch (err) {
            console.error('Failed to delete notification:', err);
            addToast('Failed to delete notification', 'error');
        } finally {
            setDeleting(null);
        }
    };

    const deleteAllNotifications = async () => {
        if (!confirm('Are you sure you want to delete all notifications?')) return;

        try {
            await notificationAPI.deleteNotification(undefined, true);
            setNotifications([]);
            addToast('All notifications deleted', 'success');
        } catch (err) {
            console.error('Failed to delete all notifications:', err);
            addToast('Failed to delete all notifications', 'error');
        }
    };

    const handleViewDetails = (notification: Notification) => {
        setSelectedNotification(notification);
        setIsModalOpen(true);
    };

    const getNotificationIcon = (type: string) => {
        const iconClasses: Record<string, string> = {
            'NEW_MESSAGE': 'fa-solid fa-message text-blue-500',
            'BOOKING_REQUEST': 'fa-solid fa-user-plus text-purple-500',
            'BOOKING_ACCEPTED': 'fa-solid fa-check-circle text-green-500',
            'BOOKING_DECLINED': 'fa-solid fa-times-circle text-red-500',
            'ASSIGNMENT': 'fa-solid fa-briefcase text-indigo-500',
            'REQUEST_UPDATED': 'fa-solid fa-sync text-orange-500',
            'PROFILE_VIEWED': 'fa-solid fa-eye text-cyan-500',
        };
        return iconClasses[type] || 'fa-solid fa-bell text-gray-500';
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const locale = typeof navigator !== 'undefined' ? navigator.language || 'en-US' : 'en-US';
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        };
        return date.toLocaleDateString(locale, options);
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                        <p className="mt-4 text-gray-600">Loading notifications...</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        <i className="fa-solid fa-bell mr-3 text-brand-600"></i>
                        Notifications
                    </h1>
                    <p className="text-gray-600">Stay updated with important events and activities</p>
                </div>

                {/* Action Buttons */}
                {notifications.length > 0 && (
                    <div className="mb-6 flex gap-3">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="px-4 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition"
                            >
                                <i className="fa-solid fa-check mr-2"></i>
                                Mark all as read
                            </button>
                        )}
                        <button
                            onClick={deleteAllNotifications}
                            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
                        >
                            <i className="fa-solid fa-trash mr-2"></i>
                            Delete all
                        </button>
                    </div>
                )}

                {/* Notifications List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {notifications.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <i className="fa-solid fa-bell-slash text-5xl mb-4 text-gray-300"></i>
                            <p className="text-lg">No notifications</p>
                            <p className="text-sm mt-1">You're all caught up!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-6 transition hover:bg-gray-50 ${!notification.is_read ? 'bg-brand-50' : ''}`}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className="flex-shrink-0">
                                            <i
                                                className={`${getNotificationIcon(notification.type)} text-2xl`}
                                            ></i>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className={`font-semibold text-gray-900 ${!notification.is_read ? 'font-bold' : ''}`}>
                                                        {notification.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        {formatTime(notification.created_at)}
                                                    </p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <button
                                                        onClick={() => handleViewDetails(notification)}
                                                        className="p-2 text-gray-400 hover:text-brand-600 transition rounded-lg hover:bg-gray-100"
                                                        title="View details"
                                                    >
                                                        <i className="fa-solid fa-arrow-up-right"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => deleteNotification(notification.id)}
                                                        disabled={deleting === notification.id}
                                                        className="p-2 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-gray-100 disabled:text-gray-300"
                                                        title="Delete notification"
                                                    >
                                                        {deleting === notification.id ? (
                                                            <i className="fa-solid fa-spinner fa-spin"></i>
                                                        ) : (
                                                            <i className="fa-solid fa-trash"></i>
                                                        )}
                                                    </button>
                                                    {!notification.is_read && (
                                                        <div className="w-3 h-3 bg-brand-600 rounded-full"></div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Type Badge */}
                                            <div className="mt-3">
                                                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                                    {notification.type.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stats */}
                {notifications.length > 0 && (
                    <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-900">{unreadCount}</span> unread notification{unreadCount !== 1 ? 's' : ''} • <span className="font-semibold text-gray-900">{notifications.length}</span> total
                        </p>
                    </div>
                )}
            </div>

            {/* Notification Detail Modal */}
            <NotificationDetailModal
                notification={selectedNotification}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedNotification(null);
                }}
                onMarkAsRead={markAsRead}
            />
        </main>
    );
}
