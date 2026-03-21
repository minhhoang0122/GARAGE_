'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useTransition } from 'react';
import { OrderDetailItem } from '@/modules/service/order';
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
    initialItems,
    children
}: {
    initialItems: OrderDetailItem[];
    children: ReactNode;
}) {
    const router = useRouter();
    const [items, setItems] = useState<OrderDetailItem[]>(initialItems);
    const [isPending, startTransition] = useTransition();
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
            // Server xử lý xong, yêu cầu refresh RSC
            startTransition(() => {
                router.refresh();
            });
        } finally {
            setIsApiLoading(false);
        }
    };

    return (
        <OrderWorkspaceContext.Provider value={{
            items, 
            updateItemStatusLocal,
            isCalculating: isPending || isApiLoading,
            startCalculation
        }}>
            {children}
        </OrderWorkspaceContext.Provider>
    );
}
