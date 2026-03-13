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
            className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
        >
            {loading ? 'Đang tạo...' : 'Tạo đơn hàng'}
        </button>
    );
}
