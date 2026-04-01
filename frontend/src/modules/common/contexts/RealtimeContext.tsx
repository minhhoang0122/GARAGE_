'use client';

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { api, BASE_URL } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
};

interface RealtimeContextType {
    isConnected: boolean;
    notifications: any[];
    loading: boolean;
    addListener: (event: string, callback: (data: any) => void) => void;
    removeListener: (event: string, callback: (data: any) => void) => void;
    subscribeToTopic: (topic: string) => void;
    unsubscribeFromTopic: (topic: string) => void;
    setNotifications: (updater: any) => void;
    fetchNotifications: () => Promise<void>;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider = ({ children }: { children: ReactNode }) => {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [isConnected, setIsConnected] = useState(false);

    const stompClientRef = useRef<Client | null>(null);
    const listenersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());
    const subscriptionsRef = useRef<Map<string, any>>(new Map());

    const token = (session?.user as any)?.accessToken || getCookie('token');

    // Quản lý danh sách thông báo qua TanStack Query
    const { data: notifications = [], isLoading: loading, refetch: fetchNotifications } = useQuery<any[]>({
        queryKey: ['notifications'],
        queryFn: () => api.get('/notifications'),
        enabled: !!token,
        staleTime: 5 * 60 * 1000,
    });

    const setNotifications = React.useCallback((updater: any) => {
        queryClient.setQueryData(['notifications'], updater);
    }, [queryClient]);

    // Hiệu ứng nhấp nháy tiêu đề khi có thông báo mới (Facebook-style)
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const unreadCount = notifications.length;
        const originalTitle = 'GaraMaster - Quản lý Garage';
        let flashInterval: NodeJS.Timeout | null = null;

        if (unreadCount > 0) {
            let toggle = false;
            flashInterval = setInterval(() => {
                document.title = toggle ? `(${unreadCount}) Thông báo mới!` : originalTitle;
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

    const addListener = React.useCallback((event: string, callback: (data: any) => void) => {
        let callbacks = listenersRef.current.get(event);
        if (!callbacks) {
            callbacks = new Set();
            listenersRef.current.set(event, callbacks);
        }
        callbacks.add(callback);
    }, []);

    const removeListener = React.useCallback((event: string, callback: (data: any) => void) => {
        listenersRef.current.get(event)?.delete(callback);
    }, []);

    const triggerListeners = React.useCallback((event: string, data: any) => {
        // Dispatch window event for legacy hooks like useRealtimeUpdate
        window.dispatchEvent(new CustomEvent('sse-update', { 
            detail: { ...data, sseType: event } 
        }));

        listenersRef.current.get(event)?.forEach(cb => cb(data));

        // Global Invalidation logic
        if (event === 'user_updated' || event === 'user_presence') {
            queryClient.invalidateQueries({ queryKey: ['staff'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
        if (event === 'order_updated' || event === 'order_claimed') {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        }

        if (event === 'notification') {
            // Play notification sound
            try {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.volume = 0.5;
                audio.play().catch(() => {});
            } catch (e) {}

            // Update notifications cache
            queryClient.setQueryData(['notifications'], (prev: any[] | undefined) => {
                const current = prev || [];
                if (current.some(n => n.id === data.id)) return current;
                return [data, ...current];
            });
        }
    }, [queryClient]);

    const subscribeToTopic = React.useCallback((topic: string) => {
        if (!stompClientRef.current?.connected) return;
        if (subscriptionsRef.current.has(topic)) return;

        const sub = stompClientRef.current.subscribe(`/topic/${topic}`, (message) => {
            try {
                const payload = JSON.parse(message.body);
                // Payload structure: { event: string, data: any }
                triggerListeners(payload.event || topic, payload.data || payload);
            } catch (e) {
                console.error(`[STOMP] Failed to parse message from topic ${topic}`, e);
            }
        });
        subscriptionsRef.current.set(topic, sub);
        console.log(`[STOMP] Subscribed to topic: /topic/${topic}`);
    }, [triggerListeners]);

    const unsubscribeFromTopic = React.useCallback((topic: string) => {
        const sub = subscriptionsRef.current.get(topic);
        if (sub) {
            sub.unsubscribe();
            subscriptionsRef.current.delete(topic);
            console.log(`[STOMP] Unsubscribed from topic: ${topic}`);
        }
    }, []);

    useEffect(() => {
        if (!token) {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
            }
            setIsConnected(false);
            return;
        }

        // Initialize STOMP Client with SockJS
        // URL format: [BASE_URL]/api/garage-ws?token=[TOKEN]
        const socketUrl = `${BASE_URL}/api/garage-ws?token=${token}`;
        
        const client = new Client({
            webSocketFactory: () => new SockJS(socketUrl),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                setIsConnected(true);
                console.log('[STOMP] Connected successfully via SockJS');

                // Subscribe to default topics
                client.subscribe('/topic/global', (msg) => {
                    const body = JSON.parse(msg.body);
                    triggerListeners(body.event, body.data);
                });

                client.subscribe('/topic/presence', (msg) => {
                    const data = JSON.parse(msg.body);
                    triggerListeners('user_presence', data);
                });

                // User-specific queue (/user/queue/notifications)
                client.subscribe('/user/queue/notifications', (msg) => {
                    const body = JSON.parse(msg.body);
                    triggerListeners(body.event, body.data);
                });

                // Auto re-subscribe to dynamic topics from subscriptionsRef
                subscriptionsRef.current.forEach((_, topic) => {
                    const sub = client.subscribe(`/topic/${topic}`, (message) => {
                        try {
                            const payload = JSON.parse(message.body);
                            triggerListeners(payload.event || topic, payload.data || payload);
                        } catch (e) {
                            console.error(`[STOMP] Failed to parse message from topic ${topic}`, e);
                        }
                    });
                    subscriptionsRef.current.set(topic, sub);
                });

                // Auto re-subscribe to role topic if exists
                const activeRole = localStorage.getItem('active_role');
                if (activeRole) {
                    client.subscribe(`/topic/role:${activeRole}`, (msg) => {
                        const body = JSON.parse(msg.body);
                        triggerListeners(body.event, body.data);
                    });
                }
            },
            onDisconnect: () => {
                setIsConnected(false);
                console.log('[STOMP] Disconnected');
            },
            onStompError: (frame) => {
                console.error('[STOMP] Broker error: ' + frame.headers['message']);
                console.error('[STOMP] Additional details: ' + frame.body);
            }
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
            }
        };
    }, [token, triggerListeners]);

    return (
        <RealtimeContext.Provider value={{
            isConnected,
            notifications,
            loading,
            addListener,
            removeListener,
            subscribeToTopic,
            unsubscribeFromTopic,
            setNotifications,
            fetchNotifications: async () => { await fetchNotifications(); }
        }}>
            {children}
        </RealtimeContext.Provider>
    );
};

export const useRealtime = () => {
    const context = useContext(RealtimeContext);
    if (!context) {
        throw new Error('useRealtime must be used within a RealtimeProvider');
    }
    return context;
};

// Aliases for compatibility
export const useSSEContext = useRealtime;
export const SSEProvider = RealtimeProvider;
