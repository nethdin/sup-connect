'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { notificationAPI, Notification } from '@/app/lib/api-client';
import NotificationDetailModal from './common/NotificationDetailModal';

export default function NotificationBell() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await notificationAPI.getNotifications({ limit: 10 });
            setNotifications(response.notifications);
            setUnreadCount(response.unreadCount);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            await notificationAPI.markAsRead(notificationId);
            setNotifications(prev => prev.map(n =>
                n.id === notificationId ? { ...n, is_read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const markAllAsRead = async () => {
        setLoading(true);
        try {
            await notificationAPI.markAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (notification: Notification, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedNotification(notification);
        setIsModalOpen(true);
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }

        // Navigate based on notification type
        if (notification.data) {
            try {
                const data = typeof notification.data === 'string'
                    ? JSON.parse(notification.data)
                    : notification.data;

                if (notification.type === 'NEW_MESSAGE' && data.senderId) {
                    router.push('/messages');
                } else if (notification.type === 'BOOKING_REQUEST' || notification.type === 'BOOKING_ACCEPTED' || notification.type === 'BOOKING_DECLINED') {
                    router.push('/student/dashboard');
                }
            } catch {
                // Ignore parse errors
            }
        }
        setIsOpen(false);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
        return `${Math.floor(diffMinutes / 1440)}d ago`;
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'NEW_MESSAGE':
                return 'fa-solid fa-message text-blue-500';
            case 'BOOKING_REQUEST':
                return 'fa-solid fa-user-plus text-purple-500';
            case 'BOOKING_ACCEPTED':
                return 'fa-solid fa-check-circle text-green-500';
            case 'BOOKING_DECLINED':
                return 'fa-solid fa-times-circle text-red-500';
            default:
                return 'fa-solid fa-bell text-gray-500';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg transition"
            >
                <i className="fa-solid fa-bell text-xl"></i>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                disabled={loading}
                                className="text-sm text-brand-600 hover:text-brand-700 font-medium disabled:text-gray-400"
                            >
                                {loading ? 'Marking...' : 'Mark all read'}
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                <i className="fa-solid fa-bell-slash text-3xl mb-2"></i>
                                <p>No notifications</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-gray-100 transition hover:bg-gray-50 ${!notification.is_read ? 'bg-brand-50' : ''
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <i className={`${getNotificationIcon(notification.type)} mt-1`}></i>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!notification.is_read ? 'font-semibold' : ''} text-gray-900`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-gray-600 truncate">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatTime(notification.created_at)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={(e) => handleViewDetails(notification, e)}
                                                className="p-1.5 text-gray-400 hover:text-brand-600 transition"
                                                title="View details"
                                            >
                                                <i className="fa-solid fa-arrow-up-right text-sm"></i>
                                            </button>
                                            {!notification.is_read && (
                                                <div className="w-2 h-2 bg-brand-600 rounded-full"></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 text-center">
                            <button
                                onClick={() => {
                                    router.push('/notifications');
                                    setIsOpen(false);
                                }}
                                className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                            >
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}

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
        </div>
    );
}
