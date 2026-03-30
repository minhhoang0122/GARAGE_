'use client';

import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/modules/shared/components/ui/badge';
import { CreditCard, Banknote, Clock, User } from 'lucide-react';

interface Transaction {
    id: number;
    amount: number;
    type: 'DEPOSIT' | 'PAYMENT' | 'REFUND';
    method: 'CASH' | 'TRANSFER';
    referenceCode?: string;
    note?: string;
    createdAt: string;
    createdBy: string;
}

interface TransactionHistoryProps {
    transactions: Transaction[];
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
    if (!transactions || transactions.length === 0) {
        return <div className="text-sm text-slate-500 italic p-4 text-center">Chưa có giao dịch nào.</div>;
    }

    return (
        <div className="space-y-3">
            {transactions.map((t) => (
                <div
                    key={t.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700"
                >
                    {/* Header: Type + Amount */}
                    <div className="flex items-center justify-between mb-2">
                        <Badge
                            variant="outline"
                            className={
                                t.type === 'DEPOSIT' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' :
                                    t.type === 'PAYMENT' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                                        'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                            }
                        >
                            {t.type === 'DEPOSIT' ? 'Đặt cọc' : t.type === 'PAYMENT' ? 'Thanh toán' : 'Hoàn tiền'}
                        </Badge>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            +{formatCurrency(t.amount)}
                        </span>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                            {t.method === 'CASH' ? (
                                <Banknote className="w-3.5 h-3.5" />
                            ) : (
                                <CreditCard className="w-3.5 h-3.5" />
                            )}
                            <span>{t.method === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            <span className="truncate">{t.createdBy || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500 mt-2">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(t.createdAt).toLocaleString('vi-VN')}</span>
                    </div>

                    {/* Note */}
                    {t.note && (
                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic border-t border-slate-200 dark:border-slate-700 pt-2">
                            {t.note}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
