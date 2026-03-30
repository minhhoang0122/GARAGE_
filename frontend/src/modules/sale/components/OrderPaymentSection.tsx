'use client';

import { useOrderWorkspaceOptional } from './OrderWorkspaceProvider';
import PaymentButton from '@/modules/shared/components/PaymentButton';
import TransactionHistory from '@/modules/sale/components/TransactionHistory';
import { isRejected, isCancelled, isQuoting, isWaitingForCustomer, isClosed } from '@/lib/status';

export default function OrderPaymentSection({ 
    order, 
    transactions,
    isCompleted 
}: { 
    order: any, 
    transactions: any[],
    isCompleted: boolean 
}) {
    const workspace = useOrderWorkspaceOptional();
    
    // Khách đồng ý hoặc đề xuất đều tính vào tổng tiền, vì mục tiêu là hiển thị tổng tiền dự kiến
    // Nhưng nếu Khách từ chối hoặc Hủy thì không tính. (Giống logic OrderSummary)
    const activeItems = workspace?.items.filter(i => !isRejected(i.itemStatus) && !isCancelled(i.itemStatus)) || [];

    const totalParts = workspace 
        ? activeItems.filter(i => !i.isService).reduce((sum, item) => sum + (item.total || 0), 0)
        : order.totalParts;

    const totalLabor = workspace
        ? activeItems.filter(i => i.isService).reduce((sum, item) => sum + (item.total || 0), 0)
        : order.totalLabor;

    const subtotal = totalParts + totalLabor - (order.totalDiscount || 0);
    const finalSubtotal = subtotal > 0 ? subtotal : 0;
    
    // Thuế VAT
    const vat = workspace
        ? Math.round(finalSubtotal * (order.vatPercent || 0) / 100)
        : order.vat;

    // Thành tiền được tính toán trực tiếp thay vì chờ SSR để UI mượt mà hơn
    const grandTotal = workspace
        ? finalSubtotal + vat
        : order.grandTotal;

    const debt = grandTotal - (order.amountPaid || 0);
    
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    return (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/50 transition-all">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 pb-2 border-b border-slate-100 dark:border-slate-800">Thanh toán</h3>

            <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-800/50">
                    <span className="text-red-700 dark:text-red-400 font-medium">Còn nợ:</span>
                    <span className="font-bold text-red-700 dark:text-red-400 text-lg">
                        {formatCurrency(debt)}
                    </span>
                </div>

                {!isCompleted && (
                    <PaymentButton
                        orderId={order.id}
                        grandTotal={grandTotal}
                        remainAmount={debt}
                        amountPaid={order.amountPaid ?? 0}
                        orderStatus={order.status}
                        disabled={isQuoting(order.status) || isWaitingForCustomer(order.status) || isCancelled(order.status) || isClosed(order.status)}
                        items={workspace ? workspace.items : order.items}
                    />
                )}
            </div>

            {/* History */}
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Lịch sử giao dịch</h4>
            <TransactionHistory transactions={transactions} />
        </div>
    );
}

