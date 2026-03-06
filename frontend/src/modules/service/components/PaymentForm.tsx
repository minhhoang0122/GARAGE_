'use client';

import { useState } from 'react';
import { CreditCard, Banknote, Wallet, CheckCircle } from 'lucide-react';
import { processPayment, PaymentMethod } from '@/modules/finance/payment';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import CurrencyInput from '@/modules/shared/components/ui/CurrencyInput';
import { Button } from '@/modules/shared/components/ui/button';
import { Input } from '@/modules/shared/components/ui/input';
import { Label } from '@/modules/shared/components/ui/label';

interface PaymentFormProps {
    orderId: number;
    grandTotal: number;
    amountPaid: number;
    debt: number;
}

export default function PaymentForm({ orderId, grandTotal, amountPaid, debt }: PaymentFormProps) {
    const [amount, setAmount] = useState<number>(debt);
    const [method, setMethod] = useState<PaymentMethod>('TIEN_MAT');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (amount <= 0) {
            showToast('warning', 'Vui lòng nhập số tiền hợp lệ');
            return;
        }

        if (amount > debt) {
            showToast('warning', 'Số tiền không được vượt quá số nợ');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await processPayment(orderId, amount, method);

            if (result.success) {
                if (result.isCompleted) {
                    showToast('success', 'Thanh toán hoàn tất! Đơn hàng đã hoàn thành.');
                } else {
                    showToast('success', `Đã ghi nhận ${formatCurrency(amount)}. Còn nợ: ${formatCurrency(result.debt || 0)}`);
                }
                router.refresh();
            } else {
                showToast('error', result.error || 'Lỗi thanh toán');
            }
        } catch (error: any) {
            showToast('error', 'Lỗi hệ thống');
        } finally {
            setIsSubmitting(false);
        }
    };

    const payFullAmount = () => {
        setAmount(debt);
    };

    const methods: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
        { value: 'TIEN_MAT', label: 'Tiền mặt', icon: <Banknote className="w-4 h-4" /> },
        { value: 'CHUYEN_KHOAN', label: 'Chuyển khoản', icon: <CreditCard className="w-4 h-4" /> },
        { value: 'HON_HOP', label: 'Hỗn hợp', icon: <Wallet className="w-4 h-4" /> },
    ];

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Thanh toán đơn hàng
            </h3>

            {/* Summary */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg mb-4 space-y-2 transition-colors">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Tổng tiền:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrency(grandTotal)}</span>
                </div>
                {amountPaid > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Đã thanh toán:</span>
                        <span className="font-medium text-green-600 dark:text-green-500">{formatCurrency(amountPaid)}</span>
                    </div>
                )}
                <div className="flex justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-800 dark:text-slate-200 font-medium">Còn phải thu:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(debt)}</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Amount */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Số tiền thanh toán
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <CurrencyInput
                                value={amount}
                                onChange={setAmount}
                                min={0}
                                max={debt}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={payFullAmount}
                            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium transition-colors"
                        >
                            Trả hết
                        </button>
                    </div>
                </div>

                {/* Payment Method */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Phương thức thanh toán
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {methods.map((m) => (
                            <button
                                key={m.value}
                                type="button"
                                onClick={() => setMethod(m.value)}
                                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${method === m.value
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {m.icon}
                                <span className="hidden sm:inline">{m.label}</span>
                                <span className="sm:hidden">{m.label.split(' ')[0]}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 dark:hover:from-green-500 dark:hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 dark:shadow-none"
                >
                    {isSubmitting ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Đang xử lý...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            Xác nhận thanh toán
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
