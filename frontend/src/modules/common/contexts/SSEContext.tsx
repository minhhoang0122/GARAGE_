'use client';

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

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
    fetchNotifications: () => Promise<void>;
    setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
}

const SSEContext = createContext<SSEContextType | undefined>(undefined);

export const SSEProvider = ({ children }: { children: ReactNode }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const eventSourceRef = useRef<EventSource | null>(null);
    const listenersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());
    const abortRef = useRef<AbortController | null>(null);

    const fetchNotifications = async () => {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const response = await fetch('/api/notifications/unread?t=' + Date.now(), {
                signal: controller.signal
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data || []);
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') return;
            console.error('[SSE] Failed to fetch notifications', error);
        } finally {
            if (!controller.signal.aborted) setLoading(false);
        }
    };

    useEffect(() => {
        const token = getCookie('token');
        if (!token) {
            setLoading(false);
            return;
        }

        // 1. Initial Fetch
        fetchNotifications();

        // 2. Setup SSE
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
        const url = `${backendUrl}/api/sse/stream?token=${token}`;

        const es = new EventSource(url);
        eventSourceRef.current = es;

        es.onopen = () => setIsConnected(true);
        es.onerror = () => {
            setIsConnected(false);
            es.close();
        };

        // Re-attach all existing listeners if EventSource re-opens
        listenersRef.current.forEach((callbacks, event) => {
            es.addEventListener(event, (e: MessageEvent) => {
                try {
                    const data = JSON.parse(e.data);
                    callbacks.forEach(cb => cb(data));
                } catch (err) { console.error('[SSE] Event parse error', err); }
            });
        });

        // Tự động cập nhật danh sách thông báo khi có event 'notification'
        es.addEventListener('notification', (e: MessageEvent) => {
            try {
                const newNotif = JSON.parse(e.data);
                setNotifications(prev => {
                    if (prev.some(n => n.id === newNotif.id)) return prev;
                    return [{ ...newNotif, createdAt: new Date(newNotif.createdAt) }, ...prev];
                });
            } catch (err) { console.error('[SSE] Notification parse error', err); }
        });

        return () => {
            es.close();
            eventSourceRef.current = null;
            if (abortRef.current) abortRef.current.abort();
        };
    }, []);

    // --- Logic Dynamic Page Title (Tab Notification) ---
    useEffect(() => {
        if (typeof document === 'undefined') return;

        const count = notifications.length;
        const originalTitle = 'GaraMaster - Quản lý Garage';
        let flashInterval: NodeJS.Timeout | null = null;
        let isFocused = true;

        const handleFocus = () => { isFocused = true; if (flashInterval) { clearInterval(flashInterval); document.title = count > 0 ? `(${count}) ${originalTitle}` : originalTitle; } };
        const handleBlur = () => { isFocused = false; };

        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);

        // Cập nhật Title cơ bản
        if (count > 0) {
            document.title = `(${count}) ${originalTitle}`;

            // Nếu không focused thì nhấp nháy để nhắc nhở
            if (!isFocused) {
                let showNew = true;
                flashInterval = setInterval(() => {
                    document.title = showNew ? `🔔 (${count}) Thông báo mới!` : `(${count}) ${originalTitle}`;
                    showNew = !showNew;
                }, 1000);
            }
        } else {
            document.title = originalTitle;
        }

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
            if (flashInterval) clearInterval(flashInterval);
        };
    }, [notifications.length]);

    const addListener = (event: string, callback: (data: any) => void) => {
        let callbacks = listenersRef.current.get(event);
        if (!callbacks) {
            callbacks = new Set();
            listenersRef.current.set(event, callbacks);

            if (eventSourceRef.current) {
                eventSourceRef.current.addEventListener(event, (e: MessageEvent) => {
                    try {
                        const data = JSON.parse(e.data);
                        listenersRef.current.get(event)?.forEach(cb => cb(data));
                    } catch (err) {
                        console.error('[SSE] Parse error:', err);
                    }
                });
            }
        }
        callbacks.add(callback);
    };

    const removeListener = (event: string, callback: (data: any) => void) => {
        listenersRef.current.get(event)?.delete(callback);
    };

    return (
        <SSEContext.Provider value={{
            isConnected,
            notifications,
            loading,
            addListener,
            removeListener,
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
