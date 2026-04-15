'use client';

import { Notification } from '@/app/lib/api-client';
import { useEffect, useRef } from 'react';

interface NotificationDetailModalProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead?: (notificationId: string) => void;
}

export default function NotificationDetailModal({
  notification,
  isOpen,
  onClose,
  onMarkAsRead,
}: NotificationDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    // Mark as read when modal opens
    if (isOpen && notification && !notification.is_read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  }, [isOpen, notification, onMarkAsRead]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !notification) {
    return null;
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('en-US', options);
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

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      'NEW_MESSAGE': 'blue',
      'BOOKING_REQUEST': 'purple',
      'BOOKING_ACCEPTED': 'green',
      'BOOKING_DECLINED': 'red',
      'ASSIGNMENT': 'indigo',
      'REQUEST_UPDATED': 'orange',
      'PROFILE_VIEWED': 'cyan',
    };
    return colors[type] || 'gray';
  };

  const notificationData = notification.data
    ? typeof notification.data === 'string'
      ? JSON.parse(notification.data)
      : notification.data
    : null;

  const color = getNotificationColor(notification.type);
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    indigo: 'bg-indigo-50 border-indigo-200',
    orange: 'bg-orange-50 border-orange-200',
    cyan: 'bg-cyan-50 border-cyan-200',
    gray: 'bg-gray-50 border-gray-200',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto animate-fade-in"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition"
          aria-label="Close modal"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        <div className="p-8">
          {/* Header with Icon */}
          <div className="flex items-start gap-4 mb-6">
            <div
              className={`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center border-2 ${colorClasses[color as keyof typeof colorClasses]}`}
            >
              <i className={`${getNotificationIcon(notification.type)} text-3xl`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {notification.title}
              </h2>
              <p className="text-sm text-gray-500">
                {formatTime(notification.created_at)}
              </p>
            </div>
          </div>

          {/* Message */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Message</h3>
            <p className="text-gray-700 leading-relaxed">
              {notification.message}
            </p>
          </div>

          {/* Additional Data */}
          {notificationData && Object.keys(notificationData).length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Details
              </h3>
              <div className="space-y-2">
                {Object.entries(notificationData).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-sm text-gray-600 font-medium">
                      {key.charAt(0).toUpperCase() + key.slice(1)}:
                    </span>
                    <span className="text-sm text-gray-900">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notification Type Badge */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
              {notification.type.replace(/_/g, ' ')}
            </span>
            <span className={`text-xs font-medium ${notification.is_read ? 'text-gray-500' : 'text-brand-600'}`}>
              {notification.is_read ? 'Read' : 'Unread'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
