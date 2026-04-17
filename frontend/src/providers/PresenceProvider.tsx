'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import { useRealtime } from '@/modules/common/contexts/RealtimeContext';

export interface PresenceUser {
    id: number;
    fullName: string;
    username: string;
    avatar?: string;
    role: string;
    lastActive?: string;
    isOnline?: boolean;
}

interface PresenceContextType {
    staff: PresenceUser[];
    onlineUsers: Set<number>;
    isLoading: boolean;
    refresh: () => Promise<void>;
    updateStaff: (userId: number, data: Partial<PresenceUser>) => void;
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export const PresenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: session, status } = useSession();
    const [staff, setStaff] = useState<PresenceUser[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const { addListener, removeListener, isConnected } = useRealtime();
    const lastFetchRef = useRef<number>(0);

    const updateStaff = useCallback((userId: number, data: Partial<PresenceUser>) => {
        setStaff(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
    }, []);

    const fetchInitialData = useCallback(async () => {
        // Tránh fetch quá nhiều lần (throttle 30s)
        const now = Date.now();
        if (now - lastFetchRef.current < 30000) return;
        
        if (status !== 'authenticated') return;

        setIsLoading(true);
        try {
            console.log('[Presence] Khởi tạo dữ liệu tập trung...');
            const [staffRes, onlineRes] = await Promise.all([
                api.get('/users/staff'),
                api.get('/users/online-status')
            ]);

            if (Array.isArray(staffRes)) {
                // Normalize roles to match auth.ts and ROLE_MENUS keys
                const mappedStaff = staffRes.map((u: any) => {
                    const rawRole = u.role || u.vaiTro || 'N/A';
                    let roleName = typeof rawRole === 'string' ? rawRole : (rawRole?.name || rawRole?.code || 'N/A');
                    
                    // Force UPPERCASE and strip ROLE_ prefix
                    roleName = roleName.toUpperCase();
                    if (roleName.startsWith('ROLE_')) {
                        roleName = roleName.substring(5);
                    }
                    
                    return {
                        ...u,
                        role: roleName
                    };
                });
                setStaff(mappedStaff);
            }

            // Backend trả về { onlineUsers: [1, 2, 3] }
            if (onlineRes && Array.isArray(onlineRes.onlineUsers)) {
                const onlineIds = new Set<number>(onlineRes.onlineUsers.map((id: any) => Number(id)));
                setOnlineUsers(onlineIds);
            } else if (Array.isArray(onlineRes)) {
                // Fallback nếu backend trả về mảng trực tiếp
                const onlineIds = new Set<number>(onlineRes.map((id: any) => Number(id)));
                setOnlineUsers(onlineIds);
            }
            
            lastFetchRef.current = now;
        } catch (err: any) {
            console.error('[Presence] Lỗi khi load dữ liệu ban đầu:', err.message || err);
            if (err.status === 403) {
                console.warn('[Presence] 403 Forbidden detected. Check SecurityConfig matchers order.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [status]);

    // Fetch khi Auth thành công
    useEffect(() => {
        if (status === 'authenticated') {
            fetchInitialData();
        }
    }, [status, fetchInitialData]);

    // Đồng bộ Realtime
    useEffect(() => {
        if (status !== 'authenticated') return;

        console.log('[Presence] Đăng ký lắng nghe trạng thái Online/Offline...');

        const handlePresenceUpdate = (msg: any) => {
            const { userId, status: userStatus } = msg;
            if (!userId) return;

            setOnlineUsers(prev => {
                const next = new Set(prev);
                if (userStatus === 'ONLINE') {
                    next.add(Number(userId));
                } else {
                    next.delete(Number(userId));
                }
                return next;
            });
        };

        let syncTimeout: NodeJS.Timeout;

        const handleDirectorySync = (data: any) => {
            console.log('[Presence] Nhận dữ liệu đồng bộ thư mục:', data);
            if (syncTimeout) clearTimeout(syncTimeout);
            
            if (data && Array.isArray(data.staff)) {
                const onlineIds = new Set<number>(
                    data.staff
                        .filter((u: any) => u.isOnline)
                        .map((u: any) => Number(u.id))
                );
                setOnlineUsers(onlineIds);
            }
        };

        // Fallback: Nếu sau 3s kể từ khi có connection mà chưa nhận được directory_sync, 
        // thực hiện fetch thủ công để đảm bảo trạng thái chính xác.
        if (isConnected) {
            syncTimeout = setTimeout(() => {
                console.log('[Presence] Fallback: Không nhận được sync event, thực hiện fetch thủ công...');
                api.get('/users/online-status').then(res => {
                    if (res && (Array.isArray(res.onlineUsers) || Array.isArray(res))) {
                        const list = Array.isArray(res) ? res : res.onlineUsers;
                        setOnlineUsers(new Set(list.map((id: any) => Number(id))));
                    }
                }).catch(err => console.error('[Presence] Fallback fetch failed:', err));
            }, 3000);
        }

        addListener('user_presence', handlePresenceUpdate);
        addListener('directory_sync', handleDirectorySync);

        return () => {
            if (syncTimeout) clearTimeout(syncTimeout);
            removeListener('user_presence', handlePresenceUpdate);
            removeListener('directory_sync', handleDirectorySync);
        };
    }, [status, isConnected, addListener, removeListener]);

    const value = {
        staff,
        onlineUsers,
        isLoading,
        refresh: fetchInitialData,
        updateStaff
    };

    return (
        <PresenceContext.Provider value={value}>
            {children}
        </PresenceContext.Provider>
    );
};

export const usePresenceContext = () => {
    const context = useContext(PresenceContext);
    if (context === undefined) {
        throw new Error('usePresenceContext must be used within a PresenceProvider');
    }
    return context;
};
