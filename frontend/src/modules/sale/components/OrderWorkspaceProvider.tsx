'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { OrderDetailItem } from '@/modules/sale/services/sale';
import { useRouter } from 'next/navigation';

interface OrderWorkspaceContextType {
    items: OrderDetailItem[];
    updateItemStatusLocal: (itemId: number, newStatus: string) => void;
    
    isCalculating: boolean;
    startCalculation: (apiCall: () => Promise<void>) => void;
}

const OrderWorkspaceContext = createContext<OrderWorkspaceContextType | null>(null);

export function useOrderWorkspaceOptional() {
    return useContext(OrderWorkspaceContext);
}

export function OrderWorkspaceProvider({
    orderId,
    initialItems,
    children
}: {
    orderId: number;
    initialItems: OrderDetailItem[];
    children: ReactNode;
}) {
    const queryClient = useQueryClient();
    const [items, setItems] = useState<OrderDetailItem[]>(initialItems);
    const [isApiLoading, setIsApiLoading] = useState(false);

    // Khi dữ liệu server thục sự thay đổi qua router.refresh, cập nhật lại ds
    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    const updateItemStatusLocal = (itemId: number, newStatus: string) => {
        setItems(prev => prev.map(item => item.id === itemId 
            ? { ...item, itemStatus: newStatus } 
            : item
        ));
    };

    const startCalculation = async (apiCall: () => Promise<void>) => {
        setIsApiLoading(true);
        try {
            await apiCall();
            // Server xử lý xong, yêu cầu invalidate để re-fetch detail
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(orderId) });
        } finally {
            setIsApiLoading(false);
        }
    };

    return (
        <OrderWorkspaceContext.Provider value={{
            items, 
            updateItemStatusLocal,
            isCalculating: isApiLoading,
            startCalculation
        }}>
            {children}
        </OrderWorkspaceContext.Provider>
    );
}

