'use client';

import { useEffect } from 'react';
import { useSSEContext } from '@/modules/common/contexts/RealtimeContext';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook lắng nghe các thay đổi về dữ liệu Master (Giá, Thuế, Danh mục) 
 * từ hệ thống thông qua SSE và đưa ra cảnh báo Real-time.
 */
export const useMetadataSync = () => {
    const { addListener, removeListener } = useSSEContext();
    const queryClient = useQueryClient();

    useEffect(() => {
        const handleMetadataUpdate = (data: any) => {
            console.log('[MetadataSync] Received update:', data);
            
            // 1. Invalidate liên quan để UI cập nhật dữ liệu mới nếu cần
            if (data.type === 'PRODUCT') {
                queryClient.invalidateQueries({ queryKey: ['products'] });
                queryClient.invalidateQueries({ queryKey: ['repair-orders'] });
            }
            
            // 2. Hiển thị thông báo Toast
            toast.info(data.message || 'Dữ liệu hệ thống đã được cập nhật', {
                description: 'Vui lòng kiểm tra lại đơn giá/thuế nếu bạn đang lập đơn hàng.',
                duration: 10000,
                action: {
                    label: 'Xem thay đổi',
                    onClick: () => console.log('User clicked view changes')
                }
            });
        };

        addListener('metadata_updated', handleMetadataUpdate);
        
        return () => {
            removeListener('metadata_updated', handleMetadataUpdate);
        };
    }, [addListener, removeListener, queryClient]);

    return null;
};
