'use client';

import { useState, useMemo, Suspense } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { Button } from '@/modules/shared/components/ui/button';
import { Badge } from '@/modules/shared/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { 
    Clock, 
    Loader2, 
    RefreshCw, 
    Search,
    LayoutGrid,
    Inbox,
    History,
    Wallet
} from 'lucide-react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useOrders, useOrderDetail } from '@/modules/sale/hooks/useSale';
import { saleService } from '@/modules/sale/services/sale';
import LiveInvoice from '@/modules/sale/components/LiveInvoice';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function SaleCheckoutPageContent() {
    const queryClient = useQueryClient();
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [searchKeyword, setSearchKeyword] = useState('');

    // Fetch orders waiting for payment
    const { data: orders = [], isLoading: loadingOrders } = useOrders({
        status: 'IN_PROGRESS,WAITING_FOR_QC,WAITING_FOR_PAYMENT,COMPLETED'
    });

    // Filter orders with remaining debt
    const pendingOrders = useMemo(() => {
        return orders
            .map((o: any) => ({
                ...o,
                id: o.id,
                plate: o.plate || 'N/A',
                customerName: o.customerName || 'Khách vãng lai',
                remainingAmount: o.remainingAmount || o.debt || 0,
                createdAt: o.createdAt || o.subTime
            }))
            .filter((o: any) => 
                o.remainingAmount > 0 && // Chỉ hiện đơn còn nợ
                o.grandTotal > 0 &&      // Và đã có báo giá (tổng > 0)
                (o.plate.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                 o.customerName.toLowerCase().includes(searchKeyword.toLowerCase()))
            )
            .sort((a, b) => b.id - a.id);
    }, [orders, searchKeyword]);

    const totalDebt = useMemo(() => pendingOrders.reduce((sum, o: any) => sum + (o.remainingAmount || 0), 0), [pendingOrders]);

    // Fetch details for the selected order
    const { data: selectedOrder, isLoading: loadingDetail } = useOrderDetail(selectedOrderId || 0);

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        if (selectedOrderId) {
            queryClient.invalidateQueries({ queryKey: ['order-detail', selectedOrderId] });
        }
    };

    // Mutation to finalize payment
    const paymentMutation = useMutation({
        mutationFn: (id: number) => saleService.close(id),
        onSuccess: () => {
            toast.success('Thanh toán thành công');
            handleRefresh();
            setSelectedOrderId(null);
        },
        onError: (error: any) => {
            toast.error('Lỗi khi xác nhận thanh toán: ' + (error.message || 'Lỗi hệ thống'));
        }
    });

    const handleConfirmPayment = () => {
        if (!selectedOrderId) return;
        paymentMutation.mutate(selectedOrderId);
    };

    return (
        <DashboardLayout title="Thu ngân" subtitle="Hệ thống POS tập trung">
            <div className="flex h-[calc(100vh-140px)] -m-4 lg:-m-6 overflow-hidden bg-slate-50 dark:bg-slate-950">
                
                {/* Left Side: Order Queue (The List) */}
                <div className="w-full md:w-[350px] border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 shadow-sm z-10">
                    
                    {/* SEARCH & TOTALS */}
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-blue-500" />
                                Hàng chờ ({pendingOrders.length})
                            </h2>
                            <Button variant="ghost" size="icon" onClick={handleRefresh} className="h-8 w-8 text-slate-400">
                                <RefreshCw className={cn("w-3.5 h-3.5", loadingOrders && "animate-spin")} />
                            </Button>
                        </div>
                        
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                placeholder="Biển số hoặc Tên khách..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className="w-full h-11 pl-10 pr-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold italic placeholder:font-normal placeholder:not-italic"
                            />
                        </div>

                        <div className="bg-slate-900 dark:bg-slate-800 rounded-lg p-4 text-white shadow-lg shadow-slate-950/20">
                            <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">Tổng nợ hàng chờ</p>
                            <p className="text-xl font-black font-mono leading-none tracking-tight">{formatCurrency(totalDebt)}</p>
                        </div>
                    </div>

                    {/* Queue List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {loadingOrders && orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2 opacity-50" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đang tải...</span>
                            </div>
                        ) : pendingOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                                <History className="w-10 h-10 mb-4 opacity-10" />
                                <p className="text-[10px] uppercase font-black tracking-widest italic text-center">Không có đơn hàng<br/>đang chờ</p>
                            </div>
                        ) : (
                            pendingOrders.map((order: any) => (
                                <button
                                    key={order.id}
                                    onClick={() => setSelectedOrderId(order.id)}
                                    className={cn(
                                        "w-full text-left p-4 rounded-xl transition-all border-2 group relative mb-2",
                                        selectedOrderId === order.id
                                            ? "bg-blue-50/50 dark:bg-blue-500/5 border-blue-500 shadow-sm"
                                            : "bg-white dark:bg-slate-900 border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex flex-col">
                                            <span className="text-lg font-black font-mono tracking-tight text-slate-900 dark:text-white uppercase leading-none">
                                                {order.plate}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">
                                                #{order.id}
                                            </span>
                                        </div>
                                        <Badge variant={order.status === 'COMPLETED' ? 'default' : 'secondary'} className="text-[9px] px-1.5 h-5 font-black uppercase">
                                            {order.status === 'COMPLETED' ? 'Xong' : 'Đang làm'}
                                        </Badge>
                                    </div>
                                    
                                    <div className="flex justify-between items-end pt-2 border-t border-slate-50 dark:border-slate-800">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 italic line-clamp-1 uppercase">{order.customerName}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className={cn(
                                                "text-sm font-black font-mono leading-none tracking-tight",
                                                selectedOrderId === order.id ? "text-blue-600" : "text-slate-900 dark:text-slate-200"
                                            )}>
                                                {formatCurrency(order.remainingAmount)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {selectedOrderId === order.id && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-blue-600 rounded-r-full shadow-[2px_0_10px_rgba(37,99,235,0.4)]"></div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Side: Live Invoice Display */}
                <div className="flex-1 relative overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-950">
                    {!selectedOrderId ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-12 text-center bg-white dark:bg-slate-950 m-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-8 shadow-inner">
                                <Wallet className="w-10 h-10 text-slate-200 dark:text-slate-700" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Chưa chọn đơn hàng</h3>
                            <p className="max-w-xs text-sm font-medium mt-4 text-slate-400">Vui lòng chọn một xe đang chờ thanh toán ở bảng bên trái để xuất hóa đơn và thu tiền.</p>
                        </div>
                    ) : loadingDetail ? (
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-6" />
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 italic animate-pulse">Initializing Invoice System...</p>
                        </div>
                    ) : selectedOrder ? (
                        <LiveInvoice 
                            order={{
                                ...selectedOrder,
                                phone: selectedOrder.customerPhone || 'N/A',
                                odo: selectedOrder.odo || 0,
                                transactions: selectedOrder.transactions,
                                items: (selectedOrder.items || []).map(item => ({
                                    ...item,
                                    id: item.id,
                                    version: item.version,
                                    oldPartAction: item.oldPartAction,
                                    productName: item.productName || 'N/A',
                                    productCode: item.productCode || 'N/A',
                                    vatPercentage: item.vatPercentage || 0,
                                    vatAmount: item.vatAmount || 0,
                                    discountAmount: (item.unitPrice * item.quantity * (item.discountPercent || 0)) / 100
                                }))
                            }}
                            onConfirmPayment={handleConfirmPayment}
                            onRefresh={handleRefresh}
                            isProcessing={paymentMutation.isPending}
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-rose-500 gap-4">
                             <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center">
                                <Inbox className="w-8 h-8" />
                             </div>
                             <p className="font-black uppercase text-xs tracking-widest">Lỗi khi tải thông tin đơn hàng</p>
                             <Button variant="outline" size="sm" onClick={() => setSelectedOrderId(null)}>Quay lại</Button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function SaleCheckoutPage() {
    return (
        <Suspense fallback={
            <DashboardLayout title="Thu ngân" subtitle="Đang tải dữ liệu...">
                <div className="flex h-[calc(100vh-130px)] items-center justify-center bg-white dark:bg-slate-950">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Đang chuẩn bị hệ thống POS...</p>
                    </div>
                </div>
            </DashboardLayout>
        }>
            <SaleCheckoutPageContent />
        </Suspense>
    );
}
