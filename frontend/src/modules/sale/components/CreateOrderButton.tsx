'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/modules/shared/components/ui/button';
import { useToast } from '@/modules/shared/components/ui/use-toast';
import { useCreateOrderFromReception } from '@/modules/sale/hooks/useSale';

interface CreateOrderButtonProps {
    receptionId: number;
}

export default function CreateOrderButton({ receptionId }: CreateOrderButtonProps) {
    const router = useRouter();
    const { toast } = useToast();
    const { mutate: createOrderMatch, isPending: loading } = useCreateOrderFromReception();

    const handleCreateOrder = () => {
        createOrderMatch(receptionId, {
            onSuccess: (result: any) => {
                toast({
                    title: "Thành công",
                    description: "Đã tạo đơn hàng mới",
                    className: "bg-emerald-50 text-emerald-800 border-emerald-200"
                });
                router.push(`/sale/orders/${result.id || result.orderId}?source=reception`);
            },
            onError: (error: any) => {
                toast({
                    title: "Lỗi",
                    description: error.message || "Thao tác thất bại",
                    variant: "destructive"
                });
            }
        });
    };

    return (
        <button
            onClick={handleCreateOrder}
            disabled={loading}
            className="px-2.5 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-[11px] rounded-lg flex items-center hover:bg-slate-800 dark:hover:bg-white transition-colors disabled:opacity-50 whitespace-nowrap"
        >
            {loading ? 'Đang tạo...' : 'Tạo đơn'}
        </button>
    );
}

