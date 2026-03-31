'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { api, API_URL } from '@/lib/api';
import { useSSEContext } from '@/modules/common/contexts/SSEContext';
import { ROLE_DISPLAY_NAMES } from '@/config/menu';

// Rich global store
let onlineUsersGlobal: Map<number, any> = new Map();
let allStaffGlobal: any[] = [];
let hookListeners: Array<(online: Map<number, any>, all: any[]) => void> = [];

const normalizeUser = (u: any) => {
    if (!u) return { id: 0, fullName: 'Người dùng', avatar: null, vaiTro: 'Nhân viên' };
    
    const roleKey = u.vaiTro || (u.roles?.[0]?.name || u.roles?.[0]) || 'Nhân viên';
    const roleDisplayName = ROLE_DISPLAY_NAMES[roleKey] || roleKey;

    // Tìm trường tên có giá trị nhất
    let nameData = u.fullName || u.hoTen || u.HoTen || u.displayName || u.name;
    
    // Nếu không có tên thật, hoặc tên thật trùng khớp với vai trò (thường là dữ liệu mẫu)
    // thì ưu tiên hiển thị username để phân biệt các tài khoản
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
    
    // Chỉ lấy nhân viên, lọc bỏ khách hàng (KHACH_HANG, CUSTOMER)
    const normalizedStaff = allStaffGlobal
        .map(normalizeUser)
        .filter(u => u.vaiTro !== 'KHACH_HANG' && u.vaiTro !== 'CUSTOMER');

    hookListeners.forEach(fn => fn(normalizedOnline, normalizedStaff));
};

/**
 * Cập nhật thông tin thành viên trong danh sách toàn cục và thông báo cho các hook đang lắng nghe.
 * Dùng cho cập nhật tức thời (Optimistic UI) khi user tự đổi profile hoặc nhận từ SSE.
 */
export const updateStaffMember = (userId: number, data: any) => {
    const id = Number(userId);
    let changed = false;

    // Cập nhật trong allStaffGlobal
    allStaffGlobal = allStaffGlobal.map(member => {
        if (Number(member.id) === id) {
            changed = true;
            return { ...member, ...data };
        }
        return member;
    });

    // Cập nhật trong onlineUsersGlobal nếu đang online
    if (onlineUsersGlobal.has(id)) {
        const currentUser = onlineUsersGlobal.get(id);
        onlineUsersGlobal.set(id, { ...currentUser, ...data });
        changed = true;
    }

    if (changed) {
        notifyHookListeners();
    }
};

// WebSocket singleton to persist across component lifecycles
let wsInstance: WebSocket | null = null;
let wsConnecting = false;
let currentWsUserId: number | null = null;

export const usePresence = () => {
    const { data: session } = useSession();
    const { addListener, removeListener } = useSSEContext();
    const [onlineUsers, setOnlineUsers] = useState<Map<number, any>>(onlineUsersGlobal);
    const [allStaff, setAllStaff] = useState<any[]>(allStaffGlobal);

    useEffect(() => {
        const handleUpdate = (updatedMap: Map<number, any>, updatedStaff: any[]) => {
            setOnlineUsers(updatedMap);
            setAllStaff(updatedStaff);
        };
        hookListeners.push(handleUpdate);
        return () => {
            hookListeners = hookListeners.filter(fn => fn !== handleUpdate);
        };
    }, []);

    // 1. WebSocket Presence Connection (Singleton Pattern)
    useEffect(() => {
        const user = session?.user as any;
        const userId = Number(user?.id);
        const token = user?.accessToken;

        if (!userId || !token) {
            if (wsInstance) {
                wsInstance.close();
                wsInstance = null;
                currentWsUserId = null;
            }
            return;
        }

        // Reconnect if user identity changed
        if (currentWsUserId && currentWsUserId !== userId) {
            if (wsInstance) wsInstance.close();
            wsInstance = null;
            wsConnecting = false;
        }

        // Prevent redundant connections
        if (wsInstance && (wsInstance.readyState === WebSocket.OPEN || wsInstance.readyState === WebSocket.CONNECTING)) return;
        if (wsConnecting) return;

        wsConnecting = true;
        currentWsUserId = userId;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = API_URL.replace(/^https?:\/\//, '');
        const wsUrl = `${protocol}//${host}/ws/presence?token=${token}`;

        console.log('[Presence] Connecting WS...');
        const socket = new WebSocket(wsUrl);
        wsInstance = socket;

        socket.onopen = () => {
            wsConnecting = false;
            console.log('[Presence] WS Connected');
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                // Full Directory Sync (No Fetch Strategy)
                if (data.type === 'directory_sync' && Array.isArray(data.staff)) {
                    allStaffGlobal = data.staff;
                    onlineUsersGlobal.clear();
                    data.staff.forEach((u: any) => {
                        if (u.isOnline) onlineUsersGlobal.set(Number(u.id), u);
                    });
                    notifyHookListeners();
                }
            } catch (err) {
                console.error('[Presence] WS Message Parse Error:', err);
            }
        };

        socket.onclose = () => {
            console.log('[Presence] WS Disconnected');
            wsConnecting = false;
            if (wsInstance === socket) wsInstance = null;
        };

        socket.onerror = (err) => {
            console.error('[Presence] WS Error:', err);
            wsConnecting = false;
        };

        // Important: No socket.close() in cleanup to keep connection alive across pages
    }, [session?.user]);

    // 2. Listen to SSE for real-time updates from others
    useEffect(() => {
        const handlePresenceChange = (data: any) => {
            const userId = Number(data.userId);
            if (data.status === 'online') {
                onlineUsersGlobal.set(userId, data.meta || { id: userId, fullName: 'Unknown' });
            } else {
                onlineUsersGlobal.delete(userId);
            }
            notifyHookListeners();
        };

        addListener('user_presence', handlePresenceChange);

        const handleUserUpdate = (data: any) => {
            console.log('[Presence] User update received via SSE:', data);
            if (data.userId) {
                updateStaffMember(Number(data.userId), data);
            }
        };
        addListener('user_updated', handleUserUpdate);

        return () => {
            removeListener('user_presence', handlePresenceChange);
            removeListener('user_updated', handleUserUpdate);
        };
    }, [addListener, removeListener]);

    // Phase 3: Initial fetch removed (Deprecated - WS Push preferred)

    return {
        onlineUsers,
        allStaff,
        isOnline: (userId: number | string | undefined) => !!userId && onlineUsers.has(Number(userId)),
        updateStaffMember
    };
};
