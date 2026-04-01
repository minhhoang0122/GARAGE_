'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import { useRealtime } from '@/modules/common/contexts/RealtimeContext';
import { ROLE_DISPLAY_NAMES } from '@/config/menu';

/**
 * Global store for presence data to share across all usePresence hooks.
 * This ensures consistency and avoids redundant state updates.
 */
let onlineUsersGlobal: Map<number, any> = new Map();
let allStaffGlobal: any[] = [];
let hookListeners: Array<(online: Map<number, any>, all: any[]) => void> = [];

const normalizeUser = (u: any) => {
    if (!u) return { id: 0, fullName: 'Người dùng', avatar: null, vaiTro: 'Nhân viên' };
    
    const roleKey = u.vaiTro || (u.roles?.[0]?.name || u.roles?.[0]) || 'Nhân viên';
    const roleDisplayName = ROLE_DISPLAY_NAMES[roleKey] || roleKey;

    let nameData = u.fullName || u.hoTen || u.HoTen || u.displayName || u.name;
    
    if (!nameData || nameData === roleDisplayName || nameData === roleKey) {
        nameData = u.username || u.email?.split('@')[0] || roleDisplayName;
    }

    const avatarData = u.avatar || u.anhDaiDien || u.hinhAnh || u.image || null;

    return {
        ...u,
        id: Number(u.id),
        fullName: nameData,
        avatar: avatarData,
        vaiTro: roleKey,
    };
};

const notifyHookListeners = () => {
    const normalizedOnline = new Map();
    onlineUsersGlobal.forEach((u, id) => normalizedOnline.set(id, normalizeUser(u)));
    
    const normalizedStaff = allStaffGlobal
        .map(normalizeUser)
        .filter(u => u.vaiTro !== 'KHACH_HANG' && u.vaiTro !== 'CUSTOMER');

    hookListeners.forEach(fn => fn(normalizedOnline, normalizedStaff));
};

export const updateStaffMember = (userId: number, data: any) => {
    const id = Number(userId);
    let changed = false;

    allStaffGlobal = allStaffGlobal.map(member => {
        if (Number(member.id) === id) {
            changed = true;
            return { ...member, ...data };
        }
        return member;
    });

    if (onlineUsersGlobal.has(id)) {
        const currentUser = onlineUsersGlobal.get(id);
        onlineUsersGlobal.set(id, { ...currentUser, ...data });
        changed = true;
    }

    if (changed) {
        notifyHookListeners();
    }
};

/**
 * Hook usePresence: Quản lý trạng thái Online/Offline của nhân viên.
 * Đã refactor để sử dụng RealtimeContext (STOMP/SockJS) thay cho WebSocket thuần.
 */
export const usePresence = () => {
    const { addListener, removeListener } = useRealtime();
    const [onlineUsers, setOnlineUsers] = useState<Map<number, any>>(onlineUsersGlobal);
    const [allStaff, setAllStaff] = useState<any[]>(allStaffGlobal);

    useEffect(() => {
        const handleUpdate = (updatedMap: Map<number, any>, updatedStaff: any[]) => {
            setOnlineUsers(updatedMap);
            setAllStaff(updatedStaff);
        };
        hookListeners.push(handleUpdate);

        // --- QUICK SYNC (Bổ sung để tránh trễ 10-15s) ---
        const fetchInitialPresence = async () => {
            try {
                // Gọi song song để tối ưu tốc độ
                const [staffRes, statusRes] = await Promise.all([
                    api.get('/users/staff'),
                    api.get('/users/online-status')
                ]);

                if (Array.isArray(staffRes)) {
                    allStaffGlobal = staffRes;
                    
                    const onlineIds = new Set(statusRes?.onlineUsers || []);
                    onlineUsersGlobal.clear();
                    
                    allStaffGlobal.forEach(u => {
                        if (onlineIds.has(Number(u.id))) {
                            onlineUsersGlobal.set(Number(u.id), u);
                        }
                    });
                    
                    console.log('[Presence] Quick sync completed via REST API');
                    notifyHookListeners();
                }
            } catch (err) {
                console.error('[Presence] Quick sync failed:', err);
            }
        };

        // Chỉ thực hiện sync nếu chưa có dữ liệu hoặc để cập nhật mới nhất
        fetchInitialPresence();

        return () => {
            hookListeners = hookListeners.filter(fn => fn !== handleUpdate);
        };
    }, []);

    useEffect(() => {
        // 1. Đồng bộ danh sách nhân sự ban đầu (Directory Sync)
        const handleDirectorySync = (data: any) => {
            console.log('[Presence] Directory sync received:', data);
            if (data && Array.isArray(data.staff)) {
                allStaffGlobal = data.staff;
                onlineUsersGlobal.clear();
                data.staff.forEach((u: any) => {
                    if (u.isOnline) onlineUsersGlobal.set(Number(u.id), u);
                });
                notifyHookListeners();
            }
        };

        // 2. Lắng nghe thay đổi trạng thái (Presence Change)
        const handlePresenceChange = (data: any) => {
            const userId = Number(data.userId);
            const isOnline = data.isOnline; // New boolean flag from STOMP
            
            if (isOnline) {
                // Nếu online, tìm thông tin user trong allStaffGlobal để gán vào onlineUsersGlobal
                const staffInfo = allStaffGlobal.find(s => Number(s.id) === userId);
                onlineUsersGlobal.set(userId, staffInfo || { id: userId, fullName: 'Unknown' });
                console.log(`[Presence] User ${userId} is Online`);
            } else {
                onlineUsersGlobal.delete(userId);
                console.log(`[Presence] User ${userId} is Offline`);
            }
            notifyHookListeners();
        };

        // 3. Lắng nghe cập nhật thông tin user
        const handleUserUpdate = (data: any) => {
            if (data.userId) {
                updateStaffMember(Number(data.userId), data);
            }
        };

        // Đăng ký các listeners với RealtimeContext
        addListener('directory_sync', handleDirectorySync);
        addListener('user_presence', handlePresenceChange);
        addListener('user_updated', handleUserUpdate);

        return () => {
            removeListener('directory_sync', handleDirectorySync);
            removeListener('user_presence', handlePresenceChange);
            removeListener('user_updated', handleUserUpdate);
        };
    }, [addListener, removeListener]);

    return {
        onlineUsers,
        allStaff,
        isOnline: (userId: number | string | undefined) => !!userId && onlineUsers.has(Number(userId)),
        updateStaffMember
    };
};
