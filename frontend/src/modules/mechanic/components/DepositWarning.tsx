'use client';

import { AlertTriangle } from 'lucide-react';

interface DepositWarningProps {
    deposit: number;
    total: number;
}

export default function DepositWarning({ deposit, total }: DepositWarningProps) {
    const threshold = 5000000;
    const minRate = 0.3;

    if (!total || total <= threshold) return null;

    const minDeposit = total * minRate;
    if (deposit >= minDeposit) return null;

    return (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 flex items-start gap-3 shadow-sm animate-in slide-in-from-top-2 transition-colors">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div>
                <h3 className="font-semibold text-red-800 dark:text-red-300">Chưa đủ tiền cọc</h3>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    Đơn hàng giá trị lớn ({total.toLocaleString()} đ) yêu cầu đặt cọc tối thiểu 30% ({minDeposit.toLocaleString()} đ).
                </p>
                <p className="text-sm text-red-700 dark:text-red-400 font-medium mt-1">
                    Hiện tại: {deposit.toLocaleString()} đ.
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    * Kho không thể xuất hàng và Thợ không thể nhận việc cho đến khi thu đủ cọc.
                </p>
            </div>
        </div>
    );
}
