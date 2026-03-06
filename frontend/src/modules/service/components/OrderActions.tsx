'use client';

import { finalizeOrder, submitToCustomer, cancelOrder, closeOrder, submitReplenishmentQuote } from '@/modules/service/order';
import { FileCheck, Printer, Loader2, Send, XCircle, CheckCircle, PlusCircle, AlertTriangle, DollarSign, Wrench } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useConfirm } from '@/modules/shared/components/ui/ConfirmModal';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/modules/shared/components/ui/dialog";

interface OrderActionsProps {
    orderId: number;
    status: string;
    hasProposedItems?: boolean;
    amountPaid?: number;
    depositAmount?: number;
}

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

export default function OrderActions({ orderId, status, hasProposedItems = false, amountPaid = 0, depositAmount = 0 }: OrderActionsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role;
    const confirm = useConfirm();

    const isEditable = ['TIEP_NHAN', 'CHO_CHAN_DOAN', 'BAO_GIA_LAI', 'BAO_GIA'].includes(status);
    const isWaitingApproval = status === 'CHO_KH_DUYET';
    const canClose = status === 'HOAN_THANH' || status === 'CHO_THANH_TOAN';
    const isClosed = status === 'DONG' || status === 'HUY';
    const isRepairing = ['DANG_SUA', 'CHO_SUA_CHUA', 'DA_DUYET'].includes(status);

    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelReason, setCancelReason] = useState("");

    const handleAction = async (actionFn: (id: number) => Promise<any>, title: string, message: string, type: 'warning' | 'info' = 'warning') => {
        const confirmed = await confirm({ title, message, type });
        if (!confirmed) return;

        setIsLoading(true);
        try {
            const result = await actionFn(orderId);
            if (!result.success) {
                await confirm({ title: 'Lỗi', message: result.error, type: 'danger', confirmText: 'Đóng', cancelText: '' });
            } else {
                router.refresh();
            }
        } catch (error) {
            await confirm({ title: 'Lỗi', message: 'Có lỗi xảy ra', type: 'danger', confirmText: 'Đóng', cancelText: '' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelClick = () => {
        setCancelReason("");
        setShowCancelDialog(true);
    };

    const confirmCancel = async () => {
        setShowCancelDialog(false);
        setIsLoading(true);
        try {
            const result = await cancelOrder(orderId, cancelReason);
            if (!result.success) {
                await confirm({ title: 'Lỗi', message: result.error, type: 'danger', confirmText: 'Đóng', cancelText: '' });
            } else {
                router.refresh();
            }
        } catch (error) {
            await confirm({ title: 'Lỗi', message: 'Có lỗi xảy ra', type: 'danger', confirmText: 'Đóng', cancelText: '' });
        } finally {
            setIsLoading(false);
        }
    };

    // Build warnings for cancel dialog
    const warnings: { icon: React.ReactNode; text: string; severity: 'red' | 'amber' | 'blue' }[] = [];

    if (isRepairing) {
        warnings.push({
            icon: <Wrench className="w-4 h-4" />,
            text: 'Đơn hàng đang được thợ sửa chữa. Hủy đơn sẽ dừng toàn bộ công việc.',
            severity: 'red'
        });
    }

    if (depositAmount > 0 || amountPaid > 0) {
        const totalPaid = Math.max(depositAmount, amountPaid);
        warnings.push({
            icon: <DollarSign className="w-4 h-4" />,
            text: `Khách đã thanh toán ${formatCurrency(totalPaid)}. Cần hoàn tiền cho khách sau khi hủy.`,
            severity: 'red'
        });
    }

    return (
        <>
            <div className="flex flex-wrap gap-2 items-center">
                <button
                    className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors"
                    onClick={() => window.open(`/sale/orders/${orderId}/print`, '_blank')}
                >
                    <Printer className="w-4 h-4" /> In báo giá
                </button>

                {isEditable && (
                    <button
                        onClick={() => handleAction(submitToCustomer, 'Gửi báo giá', 'Xác nhận gửi báo giá cho khách?\n\nPhụ tùng sẽ được TẠM GIỮ trong kho.', 'info')}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Gửi báo giá
                    </button>
                )}

                {hasProposedItems && !isEditable && !isClosed && (
                    <button
                        onClick={() => handleAction(submitReplenishmentQuote, 'Báo giá bổ sung', 'Gửi báo giá bổ sung cho các hạng mục phát sinh kỹ thuật?', 'warning')}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                        Báo giá bổ sung
                    </button>
                )}

                {isWaitingApproval && (
                    <button
                        onClick={() => handleAction(finalizeOrder, 'Duyệt báo giá', 'Xác nhận khách hàng ĐÃ DUYỆT báo giá?\n\nLệnh sửa chữa sẽ được chuyển cho thợ.', 'info')}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Duyệt báo giá
                    </button>
                )}

                {canClose && (
                    <button
                        onClick={() => handleAction(closeOrder, 'Đóng đơn hàng', 'Xác nhận ĐÓNG ĐƠN HÀNG?\n\nChỉ thực hiện khi đã thanh toán đủ hoặc được Admin cho phép.', 'warning')}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                        Đóng đơn
                    </button>
                )}

                {!isClosed && (
                    <button
                        onClick={handleCancelClick}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-sm font-medium transition-colors"
                    >
                        <XCircle className="w-4 h-4" /> Hủy đơn
                    </button>
                )}
            </div>

            {/* Cancel Modal - Enhanced with smart warnings */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-600">
                            <AlertTriangle className="w-5 h-5" /> Hủy đơn hàng
                        </DialogTitle>
                        <div className="text-sm text-slate-500 mt-2">
                            Hành động này không thể hoàn tác.
                        </div>
                    </DialogHeader>

                    {/* Smart Warnings */}
                    {warnings.length > 0 && (
                        <div className="space-y-2 my-2">
                            {warnings.map((w, i) => (
                                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg text-sm ${w.severity === 'red'
                                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                        : w.severity === 'amber'
                                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                                    }`}>
                                    <span className="mt-0.5 flex-shrink-0">{w.icon}</span>
                                    <span>{w.text}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="py-2">
                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                            Lý do hủy đơn <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500"
                            rows={3}
                            placeholder="Nhập lý do hủy (bắt buộc)..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <DialogFooter>
                        <button
                            onClick={() => setShowCancelDialog(false)}
                            className="px-4 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                            Đóng
                        </button>
                        <button
                            onClick={confirmCancel}
                            disabled={!cancelReason.trim()}
                            className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {warnings.length > 0 ? 'Xác nhận Hủy (Rủi ro cao)' : 'Xác nhận Hủy'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
