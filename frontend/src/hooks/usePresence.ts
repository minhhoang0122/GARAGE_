'use client';

import { useSession } from 'next-auth/react';
import { usePresenceContext } from '@/providers/PresenceProvider';

/**
 * Hook để lấy trạng thái online của nhân viên
 * @returns { isOnline: (id: number|string) => boolean, allStaff: any[], onlineCount: number, isCurrentUserOnline: boolean }
 */
export const usePresence = () => {
    const { data: session } = useSession();
    const { staff, onlineUsers, isLoading, refresh, updateStaff } = usePresenceContext();

    // Lấy trạng thái của user hiện tại (trả về boolean)
    const currentUserId = session?.user?.id ? parseInt(session.user.id) : null;
    const isCurrentUserOnline = currentUserId ? onlineUsers.has(currentUserId) : false;

    // Helper: kiểm tra xem một userId cụ thể có online không (trả về boolean)
    // Giữ tên isOnline cho hàm này để tương thích với UserAvatar.tsx: const online = isOnline(user?.id)
    const isOnline = (id: number | string | undefined | null) => {
        if (!id) return false;
        const numId = typeof id === 'string' ? parseInt(id) : id;
        return onlineUsers.has(numId);
    };

    return {
        isOnline, // Hàm (number|string) => boolean
        isCurrentUserOnline, // Boolean
        allStaff: staff,
        onlineCount: onlineUsers.size,
        isLoading,
        isUserOnline: isOnline, // Alias
        onlineUsers, 
        refresh,
        updateStaffMember: updateStaff // Alias nội bộ
    };
};

/**
 * Export rời để tương thích với các component dùng import { updateStaffMember }
 */
export const updateStaffMember = (userId: number, data: any) => {
    // Lưu ý: Hàm này chỉ thực sự hoạt động khi được gọi từ bên trong một component 
    // hoặc thông qua context. 
    // Ở đây chúng ta export một placeholder hoặc hướng dẫn dùng usePresence().updateStaffMember
    console.warn('updateStaffMember rời đang được gọi. Khuyến khích dùng usePresence().updateStaffMember để đảm bảo tính phản ứng.');
};
