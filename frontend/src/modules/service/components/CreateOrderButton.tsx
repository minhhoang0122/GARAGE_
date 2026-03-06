'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/modules/shared/components/ui/button';
import { useToast } from '@/modules/shared/components/ui/use-toast';
import { createOrder } from '@/modules/service/order';

interface CreateOrderButtonProps {
    receptionId: number;
}

export default function CreateOrderButton({ receptionId }: CreateOrderButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleCreateOrder = async () => {
        setLoading(true);
        try {
            const result = await createOrder(receptionId);
            if (result.success) {
                toast({
                    title: "Thành công",
                    description: "Đã tạo đơn hàng mới",
                    className: "bg-emerald-50 text-emerald-800 border-emerald-200"
                });
                router.push(`/sale/orders/${result.orderId}?source=reception`);
            } else {
                toast({
                    title: "Lỗi",
                    description: result.error,
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể kết nối server",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleCreateOrder}
            disabled={loading}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-sm disabled:opacity-50 transition-colors"
        >
            {loading ? 'Đang tạo...' : 'Tạo đơn hàng'}
        </button>
    );
}
