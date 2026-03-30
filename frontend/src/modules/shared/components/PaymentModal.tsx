'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/modules/shared/components/ui/button';
import { Input } from '@/modules/shared/components/ui/input';
import { Label } from '@/modules/shared/components/ui/label';
import { Badge } from '@/modules/shared/components/ui/badge';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/modules/shared/components/ui/dialog';
import { useCreateTransaction, useProcessPayment } from '@/modules/finance/hooks/useFinance';
import { useToast } from '@/modules/shared/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import CurrencyInput from '@/modules/shared/components/ui/CurrencyInput';
import { Check, AlertTriangle, Package, Wrench, FileText, Wallet, CreditCard, ArrowLeftRight } from 'lucide-react';
import { 
    isPostApproval, 
    isWaitingPayment, 
    isCompleted, 
    isClosed, 
    isReceived, 
    isQuoting, 
    isWaitingForCustomer, 
    isApproved 
} from '@/lib/status';

interface PaymentModalProps {
    orderId: number;
    grandTotal: number;
    isOpen: boolean;
    onClose: () => void;
    remainAmount: number;
    amountPaid: number;
    orderStatus: string;
    items?: any[];
}

// Format currency for display
const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

// Determine which transaction types are available based on business rules
function getAvailableTypes(orderStatus: string, amountPaid: number, remainAmount: number) {
    const types: { value: string; label: string; icon?: JSX.Element }[] = [];

    const isApprovedStatus = isPostApproval(orderStatus);

    // Chốt: Chỉ cho cọc/thanh toán khi đã DUYET báo giá
    if (isApprovedStatus) {
        if (remainAmount > 0) {
            if (amountPaid === 0) {
                types.push({ value: 'DEPOSIT', label: 'Đặt cọc', icon: <Wallet className="w-4 h-4" /> });
            }
            types.push({ value: 'PAYMENT', label: 'Thanh toán', icon: <CreditCard className="w-4 h-4" /> });
        }
    }

    if (amountPaid > 0) {
        types.push({ value: 'REFUND', label: 'Hoàn tiền', icon: <ArrowLeftRight className="w-4 h-4" /> });
    }

    return types;
}

// Smart default type based on order status
function getDefaultType(orderStatus: string, amountPaid: number, remainAmount: number) {
    if (remainAmount < 0) return 'REFUND'; // Overpaid → refund mode

    // Nếu đã duyệt báo giá trở đi, mặc định là Thanh toán (PAYMENT)
    if (isPostApproval(orderStatus)) return 'PAYMENT';

    // Nếu đang ở giai đoạn Tiếp nhận/Báo giá, mặc định là Tạm ứng (DEPOSIT)
    return 'DEPOSIT';
}

export default function PaymentModal({ orderId, grandTotal, isOpen, onClose, remainAmount, amountPaid, orderStatus, items = [] }: PaymentModalProps) {
    const isRefundMode = remainAmount < 0;
    const availableTypes = getAvailableTypes(orderStatus, amountPaid, remainAmount);

    const [method, setMethod] = useState<string>('CASH');
    const [type, setType] = useState<string>(getDefaultType(orderStatus, amountPaid, remainAmount));
    const [depositPercent, setDepositPercent] = useState<15 | 20>(15);
    const [paymentAmount, setPaymentAmount] = useState<number>(Math.abs(remainAmount));
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast: showToast } = useToast();
    const router = useRouter();

    const { mutateAsync: processPayment } = useProcessPayment();
    const { mutateAsync: createTransaction } = useCreateTransaction();

    // Calculate deposit amounts
    const deposit15 = Math.round(grandTotal * 0.15);
    const deposit20 = Math.round(grandTotal * 0.20);

    // Validate Items: check for "DE_XUAT" (Proposed) items which haven't been approved
    const unapprovedItems = items.filter(i => i.itemStatus === 'DE_XUAT');

    // Reset type when modal opens
    useEffect(() => {
        if (isOpen) {
            setType(getDefaultType(orderStatus, amountPaid, remainAmount));
            setPaymentAmount(Math.abs(remainAmount));
            setNote('');
        }
    }, [isOpen, orderStatus, amountPaid, remainAmount]);

    // Get actual amount based on type
    const getActualAmount = () => {
        if (type === 'DEPOSIT') {
            return depositPercent === 15 ? deposit15 : deposit20;
        }
        return paymentAmount;
    };

    // Reset payment amount when switching type
    useEffect(() => {
        if (type === 'PAYMENT') {
            setPaymentAmount(Math.abs(remainAmount));
        } else if (type === 'REFUND') {
            setPaymentAmount(amountPaid);
        }
    }, [type, remainAmount, amountPaid]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const finalAmount = getActualAmount();
        if (finalAmount <= 0) {
            showToast({
                title: "Lỗi",
                description: "Số tiền phải lớn hơn 0",
                variant: "destructive"
            });
            return;
        }

        if (unapprovedItems.length > 0) {
            if (!confirm(`CẢNH BÁO: Có ${unapprovedItems.length} hạng mục PHÁT SINH chưa được duyệt (Màu vàng). Bạn có chắc chắn muốn thu tiền không?`)) {
                return;
            }
        }

        setLoading(true);

        try {
            console.log("Submitting transaction:", { orderId, amount: finalAmount, type, method });

            // If it's a normal payment, use processPayment for status updates
            // Otherwise use createTransaction for general finance records
            const result = await processPayment({
                orderId,
                data: {
                    amount: finalAmount,
                    method,
                    type,
                    note
                }
            });

            console.log("Transaction result:", result);

            showToast({
                title: "Thành công",
                description: type === 'DEPOSIT'
                    ? `Đã ghi nhận đặt cọc ${depositPercent}% (${formatCurrency(finalAmount)})`
                    : type === 'REFUND'
                        ? `Đã hoàn lại ${formatCurrency(finalAmount)} cho khách`
                        : `Đã ghi nhận thanh toán ${formatCurrency(finalAmount)}`,
                variant: "default"
            });

            onClose();
            router.refresh();
        } catch (error: any) {
            console.error("PaymentModal ERROR:", error);
            showToast({
                title: "Lỗi",
                description: error.message || "Không thể xử lý thanh toán.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Ghi nhận Thu tiền</DialogTitle>
                    <DialogDescription>Kiểm tra kỹ các hạng mục trước khi thu tiền.</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                        {/* Left: Bill Preview */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 h-full overflow-y-auto border border-slate-200 dark:border-slate-700">
                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Chi tiết đơn hàng
                            </h4>

                            {/* Unapproved Warning */}
                            {unapprovedItems.length > 0 && (
                                <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-md flex gap-2 items-start">
                                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-500" />
                                    <div className="text-sm">
                                        <p className="font-semibold">Cảnh báo:</p>
                                        <p>Có {unapprovedItems.length} mục phát sinh chưa được duyệt.</p>
                                    </div>
                                </div>
                            )}

                            <div className="divide-y divide-slate-200 dark:divide-slate-700">
                                {items.map((item, i) => (
                                    <div key={i} className={`py-3 flex justify-between items-start ${item.itemStatus === 'DE_XUAT' ? 'bg-yellow-50 -mx-2 px-2 rounded' : ''}`}>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                {item.isService ? <Wrench className="w-3 h-3 text-purple-500" /> : <Package className="w-3 h-3 text-blue-500" />}
                                                <p className="font-medium text-sm text-slate-800 dark:text-slate-200">{item.productName}</p>
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1 flex gap-2">
                                                <span>{item.productCode}</span>
                                                <span>x{item.quantity}</span>
                                                {item.discountPercent > 0 && <span className="text-red-500">(-{item.discountPercent}%)</span>}
                                            </div>
                                            {item.itemStatus === 'DE_XUAT' && (
                                                <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1 py-0.5 rounded mt-1 inline-block">Chưa duyệt</span>
                                            )}
                                        </div>
                                        <p className="font-medium text-sm">{formatCurrency(item.total)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-slate-300 dark:border-slate-600 mt-4 pt-3 flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded shadow-sm">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">Tổng cộng:</span>
                                <span className="font-bold text-lg text-slate-900 dark:text-white">{formatCurrency(grandTotal)}</span>
                            </div>
                        </div>

                        {/* Right: Payment Form */}
                        <div className="space-y-5">
                            <form onSubmit={handleSubmit} className="space-y-5">

                                {/* Loại giao dịch */}
                                <div className="space-y-2">
                                    {isRefundMode ? (
                                        <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm border border-blue-200">
                                            Khách đã trả thừa {formatCurrency(Math.abs(remainAmount))}. Thực hiện hoàn tiền.
                                        </div>
                                    ) : (
                                        remainAmount <= 0 && !isRefundMode ? (
                                            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-md text-sm border border-emerald-200 flex gap-2">
                                                <Check className="w-4 h-4 mt-0.5" />
                                                Đơn hàng đã thanh toán đủ.
                                            </div>
                                        ) : (
                                            <>
                                                <Label>Loại giao dịch</Label>
                                                <select
                                                    className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
                                                    value={type}
                                                    onChange={(e) => setType(e.target.value)}
                                                >
                                                    {availableTypes.map(t => (
                                                        <option key={t.value} value={t.value}>{t.label}</option>
                                                    ))}
                                                </select>
                                            </>
                                        )
                                    )}
                                </div>

                                {/* Số tiền - khác nhau theo loại */}
                                <div className="space-y-2">
                                    <Label>Số tiền</Label>

                                    {type === 'DEPOSIT' ? (
                                        /* Đặt cọc: chọn 15% hoặc 20% */
                                        <div className="space-y-3">
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setDepositPercent(15)}
                                                    className={`flex-1 py-4 px-4 rounded-xl border-2 transition-all ${depositPercent === 15
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                                                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}
                                                >
                                                    <div className="text-lg font-bold text-slate-900 dark:text-white">15%</div>
                                                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{formatCurrency(deposit15)}</div>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDepositPercent(20)}
                                                    className={`flex-1 py-4 px-4 rounded-xl border-2 transition-all ${depositPercent === 20
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                                                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}
                                                >
                                                    <div className="text-lg font-bold text-slate-900 dark:text-white">20%</div>
                                                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{formatCurrency(deposit20)}</div>
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                                                Tổng tiền đơn hàng: {formatCurrency(grandTotal)}
                                            </p>
                                        </div>
                                    ) : type === 'REFUND' ? (
                                        /* Hoàn tiền: max = số tiền đã trả */
                                        <div className="space-y-2">
                                            <CurrencyInput
                                                value={paymentAmount}
                                                onChange={setPaymentAmount}
                                                min={1}
                                                max={amountPaid}
                                                className="text-lg"
                                            />
                                            <p className="text-xs text-slate-500">
                                                Tối đa: {formatCurrency(amountPaid)} (số tiền khách đã trả)
                                            </p>
                                        </div>
                                    ) : (
                                        /* Thanh toán: max = còn nợ */
                                        <CurrencyInput
                                            value={paymentAmount}
                                            onChange={setPaymentAmount}
                                            min={1}
                                            max={remainAmount}
                                            className="text-lg"
                                        />
                                    )}
                                </div>

                                {/* Phương thức */}
                                <div className="space-y-2">
                                    <Label>Phương thức</Label>
                                    <div className="flex gap-4">
                                        <label className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border cursor-pointer transition-all ${method === 'CASH' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                                            <input
                                                type="radio"
                                                name="method"
                                                value="CASH"
                                                checked={method === 'CASH'}
                                                onChange={(e) => setMethod(e.target.value)}
                                                className="sr-only"
                                            />
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">💵 Tiền mặt</span>
                                        </label>
                                        <label className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border cursor-pointer transition-all ${method === 'TRANSFER' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                                            <input
                                                type="radio"
                                                name="method"
                                                value="TRANSFER"
                                                checked={method === 'TRANSFER'}
                                                onChange={(e) => setMethod(e.target.value)}
                                                className="sr-only"
                                            />
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">🏦 Chuyển khoản</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Ghi chú */}
                                <div className="space-y-2">
                                    <Label>Ghi chú</Label>
                                    <Input
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Mã giao dịch ngân hàng / Lý do..."
                                    />
                                </div>

                                <DialogFooter className="gap-2">
                                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Hủy</Button>
                                    <Button type="submit" disabled={loading || getActualAmount() <= 0}>
                                        {loading ? 'Đang xử lý...' : `Xác nhận ${formatCurrency(getActualAmount())}`}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
