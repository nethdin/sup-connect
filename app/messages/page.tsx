'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/app/context/ToastContext';
import { messageAPI, Conversation, Message } from '@/app/lib/api-client';

function MessagesContent() {
    const router = useRouter();
    const { addToast } = useToast();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const searchParams = useSearchParams();

    useEffect(() => {
        // Get current user ID from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setCurrentUserId(user.id);
        }
        fetchConversations();
    }, []);

    // Handle deep linking for starting a conversation
    useEffect(() => {
        if (!loading && conversations) {
            const userId = searchParams.get('userId');
            const userName = searchParams.get('userName');
            const userEmail = searchParams.get('userEmail');
            const userRole = searchParams.get('userRole');

            if (userId) {
                // Check if we already have a conversation with this user
                const existingConv = conversations.find(c => c.user_id === userId);

                if (existingConv) {
                    selectConversation(existingConv);
                } else if (userName) {
                    // Create an optimistic temporary conversation
                    const newConv: Conversation = {
                        user_id: userId,
                        user_name: userName,
                        user_email: userEmail || '',
                        user_role: userRole || 'USER',
                        last_message: '',
                        last_message_at: new Date().toISOString(),
                        unread_count: 0
                    };

                    // Don't add to list yet, just select it
                    setSelectedConversation(newConv);
                    setMessages([]);
                }
            }
        }
    }, [loading, conversations, searchParams]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await messageAPI.getConversations();
            setConversations(response.conversations);
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
            addToast('Failed to load conversations', 'error');
        } finally {
            setLoading(false);
        }
    };

    const selectConversation = async (conversation: Conversation) => {
        setSelectedConversation(conversation);
        try {
            const response = await messageAPI.getMessages(conversation.user_id);
            setMessages(response.messages);
            // Update unread count in local state
            setConversations(prev => prev.map(c =>
                c.user_id === conversation.user_id ? { ...c, unread_count: 0 } : c
            ));
        } catch (err) {
            console.error('Failed to fetch messages:', err);
            addToast('Failed to load messages', 'error');
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedConversation || !newMessage.trim()) return;

        setSendingMessage(true);
        try {
            await messageAPI.sendMessage(selectedConversation.user_id, newMessage.trim());
            setNewMessage('');
            // Refresh messages
            const response = await messageAPI.getMessages(selectedConversation.user_id);
            setMessages(response.messages);
            // Update last message in conversations list
            setConversations(prev => prev.map(c =>
                c.user_id === selectedConversation.user_id
                    ? { ...c, last_message: newMessage.trim(), last_message_at: new Date().toISOString() }
                    : c
            ));
        } catch (err) {
            console.error('Failed to send message:', err);
            addToast(err instanceof Error ? err.message : 'Failed to send message', 'error');
        } finally {
            setSendingMessage(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                        <p className="mt-4 text-gray-600">Loading messages...</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        <i className="fa-solid fa-comments mr-3 text-brand-600"></i>
                        Messages
                    </h1>
                    <p className="text-gray-600">Communicate with supervisors and students</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[600px] flex">
                    {/* Conversations List */}
                    <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                <i className="fa-solid fa-inbox text-4xl mb-3"></i>
                                <p>No conversations yet</p>
                                <p className="text-sm mt-1">Start a conversation from a profile or assignment page</p>
                            </div>
                        ) : (
                            conversations.map(conversation => (
                                <div
                                    key={conversation.user_id}
                                    onClick={() => selectConversation(conversation)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer transition hover:bg-gray-50 ${selectedConversation?.user_id === conversation.user_id ? 'bg-brand-50 border-l-4 border-l-brand-600' : ''
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {conversation.user_name}
                                                </h3>
                                                {conversation.unread_count > 0 && (
                                                    <span className="bg-brand-600 text-white text-xs px-2 py-0.5 rounded-full">
                                                        {conversation.unread_count}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mb-1">
                                                {conversation.user_role}
                                            </p>
                                            <p className="text-sm text-gray-600 truncate">
                                                {conversation.last_message}
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                                            {conversation.last_message_at && formatTime(conversation.last_message_at)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Messages View */}
                    <div className="flex-1 flex flex-col">
                        {selectedConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-gray-200 bg-gray-50">
                                    <h2 className="font-semibold text-gray-900">
                                        {selectedConversation.user_name}
                                    </h2>
                                    <p className="text-sm text-gray-500">{selectedConversation.user_email}</p>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.map(message => (
                                        <div
                                            key={message.id}
                                            className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[70%] rounded-xl px-4 py-2 ${message.sender_id === currentUserId
                                                    ? 'bg-brand-600 text-white'
                                                    : 'bg-gray-100 text-gray-900'
                                                    }`}
                                            >
                                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                                <p className={`text-xs mt-1 ${message.sender_id === currentUserId ? 'text-brand-200' : 'text-gray-400'
                                                    }`}>
                                                    {formatTime(message.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type a message..."
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={sendingMessage || !newMessage.trim()}
                                            className="px-6 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 disabled:bg-gray-400 transition"
                                        >
                                            {sendingMessage ? (
                                                <i className="fa-solid fa-spinner fa-spin"></i>
                                            ) : (
                                                <i className="fa-solid fa-paper-plane"></i>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <i className="fa-solid fa-message text-5xl mb-4 text-gray-300"></i>
                                    <p className="text-lg">Select a conversation to start messaging</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

// Wrapper component with Suspense boundary for useSearchParams
export default function MessagesPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Loading messages...</p>
                    </div>
                </div>
            </main>
        }>
            <MessagesContent />
        </Suspense>
    );
}
