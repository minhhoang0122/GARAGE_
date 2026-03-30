'use client';

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { api, API_URL } from '@/lib/api';
import { useSession } from 'next-auth/react';

const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
};

interface SSEContextType {
    isConnected: boolean;
    notifications: any[];
    loading: boolean;
    addListener: (event: string, callback: (data: any) => void) => void;
    removeListener: (event: string, callback: (data: any) => void) => void;
    subscribeToTopic: (topic: string) => Promise<void>;
    unsubscribeFromTopic: (topic: string) => Promise<void>;
    fetchNotifications: () => Promise<void>;
    setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
}

const SSEContext = createContext<SSEContextType | undefined>(undefined);

export const SSEProvider = ({ children }: { children: ReactNode }) => {
    const { data: session } = useSession();
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const eventSourceRef = useRef<EventSource | null>(null);
    const listenersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());
    const abortRef = useRef<AbortController | null>(null);
    const subscribedTopics = useRef<Set<string>>(new Set());

    const fetchNotifications = React.useCallback(async () => {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const data = await api.get('/notifications', getCookie('token') || undefined);
            setNotifications(data || []);
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') return;
            console.error('[SSE] Failed to fetch notifications', error);
        } finally {
            if (!controller.signal.aborted) setLoading(false);
        }
    }, []);

    const subscribeToTopic = React.useCallback(async (topic: string) => {
        if (subscribedTopics.current.has(topic)) return;
        try {
            await api.post(`/sse/subscribe/${topic}`, {}, getCookie('token') || undefined);
            subscribedTopics.current.add(topic);
            console.log(`[SSE] Subscribed to topic: ${topic}`);
        } catch (err) {
            console.error(`[SSE] Failed to subscribe to topic: ${topic}`, err);
        }
    }, []);

    const unsubscribeFromTopic = React.useCallback(async (topic: string) => {
        if (!subscribedTopics.current.has(topic)) return;
        try {
            await api.post(`/sse/unsubscribe/${topic}`, {}, getCookie('token') || undefined);
            subscribedTopics.current.delete(topic);
            console.log(`[SSE] Unsubscribed from topic: ${topic}`);
        } catch (err) {
            console.error(`[SSE] Failed to unsubscribe from topic: ${topic}`, err);
        }
    }, []);

    const addListener = React.useCallback((event: string, callback: (data: any) => void) => {
        let callbacks = listenersRef.current.get(event);
        if (!callbacks) {
            callbacks = new Set();
            listenersRef.current.set(event, callbacks);

            if (eventSourceRef.current) {
                eventSourceRef.current.addEventListener(event, (e: MessageEvent) => {
                    try {
                        const data = JSON.parse(e.data);
                        console.log(`[SSE] Received event '${event}':`, data);
                        
                        // Dispatch global update for useRealtimeUpdate
                        window.dispatchEvent(new CustomEvent('sse-update', { 
                            detail: { ...data, sseType: event } 
                        }));

                        // Call specific listeners
                        listenersRef.current.get(event)?.forEach(cb => cb(data));

                        // Special handling for notifications to update state
                        if (event === 'notification') {
                            // Play notification sound (Facebook-style Pop)
                            const playSound = async () => {
                                try {
                                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                                    audio.volume = 0.5;
                                    await audio.play();
                                } catch (e) {
                                    console.warn('[SSE] Audio play blocked or aborted by browser:', e);
                                }
                            };
                            playSound();
                             // Parse date from ISO string or Jackson array [y, m, d, h, m, s]
                            let dateValue: Date;
                            if (Array.isArray(data.createdAt)) {
                                const [y, m, d, h, min, s] = data.createdAt;
                                dateValue = new Date(y, m - 1, d, h || 0, min || 0, s || 0);
                            } else {
                                dateValue = new Date(data.createdAt);
                            }

                            setNotifications(prev => {
                                if (prev.some(n => n.id === data.id)) return prev;
                                return [{ ...data, createdAt: dateValue }, ...prev];
                            });
                        }
                    } catch (err) {
                        console.error('[SSE] Parse error:', err);
                    }
                });
            }
        }
        callbacks.add(callback);
    }, []);

    const removeListener = React.useCallback((event: string, callback: (data: any) => void) => {
        listenersRef.current.get(event)?.delete(callback);
    }, []);

    useEffect(() => {
        // Sử dụng một proxy ổn định cho token
        const token = (session?.user as any)?.accessToken || getCookie('token');
        
        if (!token) {
            console.log('[SSE] No active token, skipping connection');
            setLoading(false);
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
                setIsConnected(false);
            }
            return;
        }

        // 1. Initial Fetch
        fetchNotifications();

        // 2. Setup SSE
        const url = `${API_URL}/sse/stream?token=${token}`;

        // Tránh tạo nhiều connection nếu token không đổi
        if (eventSourceRef.current && eventSourceRef.current.url === url) {
            return;
        }

        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        console.log('[SSE] Attempting to connect to:', url);
        const es = new EventSource(url);
        eventSourceRef.current = es;

        es.onopen = () => {
            setIsConnected(true);
            console.log('[SSE] Stream connected successfully');
            // Re-subscribe to all active roles/topics on reconnect
            const activeRole = localStorage.getItem('active_role');
            if (activeRole) {
                subscribeToTopic(`role:${activeRole}`);
            }
        };

        es.onerror = (e) => {
            console.error('[SSE] Connection error', e);
            setIsConnected(false);
            // Browser will auto-reconnect based on EventSource spec
        };

        // Re-attach all existing listeners
        listenersRef.current.forEach((callbacks, event) => {
            es.addEventListener(event, (e: MessageEvent) => {
                try {
                    const data = JSON.parse(e.data);
                    window.dispatchEvent(new CustomEvent('sse-update', { 
                        detail: { ...data, sseType: event } 
                    }));
                    callbacks.forEach(cb => cb(data));
                } catch (err) { console.error('[SSE] Event parse error', err); }
            });
        });

        // Ensure default 'notification' listener is active
        addListener('notification', () => {});

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            if (abortRef.current) abortRef.current.abort();
        };
    }, [(session?.user as any)?.accessToken, API_URL, fetchNotifications, subscribeToTopic, addListener]);

    // --- Logic Dynamic Page Title (Facebook-style Blinking) ---
    useEffect(() => {
        if (typeof document === 'undefined') return;

        const unreadCount = notifications.length;
        const originalTitle = 'GaraMaster - Quản lý Garage';
        let flashInterval: NodeJS.Timeout | null = null;

        if (unreadCount > 0) {
            // Nhấp nháy qua lại giữa tiêu đề gốc và thông báo mới (giống Facebook)
            let toggle = false;
            flashInterval = setInterval(() => {
                document.title = toggle
                    ? `(${unreadCount}) Thông báo mới!`
                    : originalTitle;
                toggle = !toggle;
            }, 1500);
        } else {
            document.title = originalTitle;
        }

        return () => {
            if (flashInterval) clearInterval(flashInterval);
            document.title = originalTitle;
        };
    }, [notifications.length]);

    return (
        <SSEContext.Provider value={{
            isConnected,
            notifications,
            loading,
            addListener,
            removeListener,
            subscribeToTopic,
            unsubscribeFromTopic,
            fetchNotifications,
            setNotifications
        }}>
            {children}
        </SSEContext.Provider>
    );
};

export const useSSEContext = () => {
    const context = useContext(SSEContext);
    if (!context) {
        throw new Error('useSSEContext must be used within an SSEProvider');
    }
    return context;
};
