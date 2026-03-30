'use client';

import { useState } from 'react';
import { Button } from '@/modules/shared/components/ui/button';
import { CreditCard } from 'lucide-react';
import PaymentModal from './PaymentModal';
import { isPostApproval } from '@/lib/status';

interface PaymentButtonProps {
    orderId: number;
    grandTotal: number;
    remainAmount: number;
    amountPaid: number;
    orderStatus: string;
    disabled?: boolean;
    items: any[];
}

export default function PaymentButton({ orderId, grandTotal, remainAmount, amountPaid, orderStatus, disabled, items }: PaymentButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isPreApproval = !isPostApproval(orderStatus);

    return (
        <>
            <Button
                onClick={() => setIsModalOpen(true)}
                disabled={disabled || remainAmount <= 0 || isPreApproval}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10"
            >
                <CreditCard className="w-4 h-4 mr-2" />
                Thanh toán / Đặt cọc
            </Button>

            <PaymentModal
                orderId={orderId}
                grandTotal={grandTotal}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                remainAmount={remainAmount}
                amountPaid={amountPaid}
                orderStatus={orderStatus}
                items={items}
            />
        </>
    );
}
