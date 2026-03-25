'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSSEContext } from '@/modules/common/contexts/SSEContext';
import { useSession, signOut } from 'next-auth/react';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';

export function SSEGlobalListener() {
    const queryClient = useQueryClient();
    const { addListener, removeListener } = useSSEContext();
    const { showToast } = useToast();
    const router = useRouter();
    const { data: session } = useSession();
    const currentUserId = (session?.user as any)?.id;

    useEffect(() => {
        // 1. Khi có người nhận đơn (Sale Claim)
        const handleOrderClaimed = (data: any) => {
            console.log('[SSE] Order Claimed:', data);
            // Invalidate danh sách đơn hàng và chi tiết đơn hàng cụ thể
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order', data.orderId] });
            
            showToast('info', `Nhân viên ${data.claimedBy} đã tiếp nhận đơn hàng #${data.orderId}`);
            
            // Refresh Server Component state
            router.refresh();
        };

        // 2. Khi có cập nhật trạng thái đơn hàng chung
        const handleOrderUpdated = (data: any) => {
            console.log('[SSE] Order updated, invalidating order and checkout queries...');
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['reception'] });
            queryClient.invalidateQueries({ queryKey: ['checkout'] });
            router.refresh(); // Refresh Server Component lists (Dashboard, Quotes, Jobs)
        };

        // 3. Khi có thay đổi trạng thái hạng mục (duyệt/bỏ duyệt)
        const handleItemStatusChanged = (data: any) => {
            console.log('[SSE] Item Status Changed:', data);
            queryClient.invalidateQueries({ queryKey: ['order', data.orderId] });
            queryClient.invalidateQueries({ queryKey: ['sale'] });
            router.refresh();
        };

        // 4. Khi có tiếp nhận xe mới
        const handleReceptionCreated = (data: any) => {
            console.log('[SSE] New Reception:', data);
            queryClient.invalidateQueries({ queryKey: ['reception'] });
            showToast('info', `Có xe mới vừa vào xưởng: ${data.plate || 'Chưa rõ biển số'}`);
            router.refresh();
        };

        // 5. Khi có thay đổi tồn kho
        const handleInventoryUpdated = (data: any) => {
            console.log('[SSE] Inventory Updated:', data);
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['warehouse'] });
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            // Cập nhật Server Component (Dashboard)
            router.refresh();
            // Không cần toast vì tần suất thay đổi kho có thể cao
        };

        // 6. Khi thợ cập nhật tiến độ hạng mục
        const handleTaskUpdated = (data: any) => {
            console.log('[SSE] Task Updated:', data);
            if (data.orderId) {
                queryClient.invalidateQueries({ queryKey: ['order', data.orderId] });
            }
            router.refresh();
        };

        // 7. Khi Quản đốc duyệt KCS (QC Pass/Fail)
        const handleQCPassed = (data: any) => {
            console.log('[SSE] QC Passed:', data);
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            if (data.orderId) {
                queryClient.invalidateQueries({ queryKey: ['order', data.orderId] });
            }
            showToast('success', `Đơn hàng #${data.orderId} đã vượt qua kiểm tra KCS!`);
            router.refresh();
        };

        const handleQCFailed = (data: any) => {
            console.log('[SSE] QC Failed:', data);
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            if (data.orderId) {
                queryClient.invalidateQueries({ queryKey: ['order', data.orderId] });
            }
            showToast('error', `Đơn hàng #${data.orderId} KHÔNG vượt qua kiểm tra KCS. Cần xử lý lại.`);
            router.refresh();
        };

        // 8. Bảo mật: Khi trạng thái tài khoản thay đổi (Khóa/Mở)
        const handleUserStatusChanged = (data: any) => {
            console.log('[SSE] User Status Changed:', data);
            
            // Invalidate danh sách user để Admin thấy cập nhật
            queryClient.invalidateQueries({ queryKey: ['users'] });

            // Nếu chính user này bị khóa, thực hiện đăng xuất ngay lập tức
            if (data.userId && String(data.userId) === String(currentUserId)) {
                if (data.status === 'LOCKED' || data.active === false) {
                    showToast('error', 'Tài khoản của bạn đã bị khóa bởi Quản trị viên. Đang đăng xuất...');
                    setTimeout(() => {
                        signOut({ callbackUrl: '/login' });
                    }, 2000);
                }
            }
        };

        // 9. Thông báo chung (Notification) - Dùng cho Đặt lịch & Thu ngân
        const handleNotification = (data: any) => {
            console.log('[SSE] Notification Received:', data);
            
            // Invalidate số lượng thông báo trên Nav
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            
            // Nếu là thông báo đặt lịch
            if (data.link?.includes('/bookings')) {
                queryClient.invalidateQueries({ queryKey: ['bookings'] });
            }
            
            // Nếu là thông báo thu ngân (sẵn sàng thanh toán)
            if (data.link?.includes('/checkout')) {
                queryClient.invalidateQueries({ queryKey: ['checkout', 'orders'] });
            }

            // Hiển thị toast nếu có tiêu đề
            if (data.title) {
                showToast('info', data.title);
            }
        };

        addListener('order_claimed', handleOrderClaimed);
        addListener('order_updated', handleOrderUpdated);
        addListener('order_item_status_changed', handleItemStatusChanged);
        addListener('reception_created', handleReceptionCreated);
        addListener('inventory_updated', handleInventoryUpdated);
        addListener('task_updated', handleTaskUpdated);
        addListener('order_qc_passed', handleQCPassed);
        addListener('order_qc_failed', handleQCFailed);
        addListener('user_status_changed', handleUserStatusChanged);
        addListener('notification', handleNotification);

        return () => {
            removeListener('order_claimed', handleOrderClaimed);
            removeListener('order_updated', handleOrderUpdated);
            removeListener('order_item_status_changed', handleItemStatusChanged);
            removeListener('reception_created', handleReceptionCreated);
            removeListener('inventory_updated', handleInventoryUpdated);
            removeListener('task_updated', handleTaskUpdated);
            removeListener('order_qc_passed', handleQCPassed);
            removeListener('order_qc_failed', handleQCFailed);
            removeListener('user_status_changed', handleUserStatusChanged);
            removeListener('notification', handleNotification);
        };
    }, [addListener, removeListener, queryClient, showToast]);

    return null;
}
