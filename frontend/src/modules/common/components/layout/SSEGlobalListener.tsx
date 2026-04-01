'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSSEContext } from '@/modules/common/contexts/RealtimeContext';
import { useSession, signOut } from 'next-auth/react';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';

export function SSEGlobalListener() {
    const queryClient = useQueryClient();
    const { addListener, removeListener } = useSSEContext();
    const { showToast } = useToast();
    const router = useRouter();
    const { data: session, update } = useSession();
    const currentUserId = (session?.user as any)?.id;

    useEffect(() => {
        // 1. Khi có người nhận đơn (Sale Claim)
        const handleOrderClaimed = (data: any) => {
            console.log('[SSE] Order Claimed:', data);
            // Invalidate danh sách đơn hàng và chi tiết đơn hàng cụ thể
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order', data.orderId] });
            
            showToast('info', `Nhân viên ${data.claimedBy} đã tiếp nhận đơn hàng #${data.orderId}`);
        };

        // 2. Khi có cập nhật trạng thái đơn hàng chung
        const handleOrderUpdated = (data: any) => {
            console.log('[SSE] Order updated, invalidating order and checkout queries...');
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['reception'] });
            queryClient.invalidateQueries({ queryKey: ['checkout'] });
        };

        // 3. Khi có thay đổi trạng thái hạng mục (duyệt/bỏ duyệt)
        const handleItemStatusChanged = (data: any) => {
            console.log('[SSE] Item Status Changed:', data);
            queryClient.invalidateQueries({ queryKey: ['order', data.orderId] });
            queryClient.invalidateQueries({ queryKey: ['sale'] });
        };

        // 4. Khi có tiếp nhận xe mới
        const handleReceptionCreated = (data: any) => {
            console.log('[SSE] New Reception:', data);
            queryClient.invalidateQueries({ queryKey: ['reception'] });
            showToast('info', `Có xe mới vừa vào xưởng: ${data.plate || 'Chưa rõ biển số'}`);
        };

        // 5. Khi có thay đổi tồn kho
        const handleInventoryUpdated = (data: any) => {
            console.log('[SSE] Inventory Updated:', data);
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['warehouse'] });
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            queryClient.invalidateQueries({ queryKey: ['sale'] });
        };

        // 6. Khi thợ cập nhật tiến độ hạng mục
        const handleTaskUpdated = (data: any) => {
            console.log('[SSE] Task Updated:', data);
            if (data.orderId) {
                queryClient.invalidateQueries({ queryKey: ['order', data.orderId] });
            }
        };

        // 7. Khi Quản đốc duyệt KCS (QC Pass/Fail)
        const handleQCPassed = (data: any) => {
            console.log('[SSE] QC Passed:', data);
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            if (data.orderId) {
                queryClient.invalidateQueries({ queryKey: ['order', data.orderId] });
            }
            showToast('success', `Đơn hàng #${data.orderId} đã vượt qua kiểm tra KCS!`);
        };

        const handleQCFailed = (data: any) => {
            console.log('[SSE] QC Failed:', data);
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            if (data.orderId) {
                queryClient.invalidateQueries({ queryKey: ['order', data.orderId] });
            }
            showToast('error', `Đơn hàng #${data.orderId} KHÔNG vượt qua kiểm tra KCS. Cần xử lý lại.`);
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

        // 8.1 Bảo mật: Khi quyền hạn hoặc thông tin bảo mật thay đổi
        const handleSecurityUpdated = (data: any) => {
            console.log('[SSE] User Security Updated:', data);
            
            // Nếu là chính user hiện tại, cập nhật lại Session
            if (data.userId && String(data.userId) === String(currentUserId)) {
                console.log('[SSE] Syncing Session for current user...');
                update(); 
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

        // 10. Khi có thay đổi về Giá/Thuế/Dữ liệu Master
        const handleMetadataUpdated = (data: any) => {
            console.log('[SSE] Metadata Updated:', data);
            
            // Invalidate các query liên quan đến sản phẩm và đơn hàng
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['repair-orders'] });
            queryClient.invalidateQueries({ queryKey: ['sale'] });
            
            // Hiển thị thông báo Toast nổi bật
            showToast('info', data.message || 'Hệ thống vừa cập nhật bảng giá/thuế mới.');
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
        addListener('user_security_updated', handleSecurityUpdated);
        addListener('notification', handleNotification);
        addListener('metadata_updated', handleMetadataUpdated);

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
            removeListener('user_security_updated', handleSecurityUpdated);
            removeListener('notification', handleNotification);
            removeListener('metadata_updated', handleMetadataUpdated);
        };
    }, [addListener, removeListener, queryClient, showToast]);

    return null;
}
