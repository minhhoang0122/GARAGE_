'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/modules/common/components/layout';
import { Button } from '@/modules/shared/components/ui/button';
import { Badge } from '@/modules/shared/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { 
    CreditCard, 
    Clock, 
    Loader2, 
    RefreshCw, 
    Search,
    ChevronRight,
    LayoutGrid,
    Inbox
} from 'lucide-react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
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
    const { data: orders = [], isLoading: loadingOrders, refetch } = useOrders({
        status: 'COMPLETED' // Assuming we have a way to filter or just filter on client
    });

    // Filter orders with remaining debt
    const pendingOrders = useMemo(() => {
        return orders
            .filter((o: any) => (o.remainingAmount || o.debt || 0) > 0)
            .map((o: any) => ({
                ...o,
                id: o.id,
                plate: o.plate || 'N/A',
                customerName: o.customerName || 'Khách vãng lai',
                remainingAmount: o.remainingAmount || o.debt || 0,
                createdAt: o.createdAt || o.subTime
            }))
            .filter((o: any) => 
                o.plate.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                o.customerName.toLowerCase().includes(searchKeyword.toLowerCase())
            );
    }, [orders, searchKeyword]);

    const totalDebt = useMemo(() => orders.reduce((sum, o: any) => sum + (o.remainingAmount || o.debt || 0), 0), [orders]);

    // Fetch details for the selected order
    const { data: selectedOrder, isLoading: loadingDetail } = useOrderDetail(selectedOrderId || 0);

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
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
        <DashboardLayout title="Thu ngân" subtitle="Trung tâm thanh toán tập trung (POS)">
            <div className="flex h-[calc(100vh-130px)] -m-4 lg:-m-6 overflow-hidden bg-white dark:bg-slate-950">
                
                {/* Left Side: Order Queue (The List) */}
                <div className="w-full md:w-[380px] border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/10">
                    
                    {/* Queue Header & Search */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-4 bg-white dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-500" />
                                <h2 className="font-black uppercase tracking-tighter text-slate-800 dark:text-slate-100 italic">Hàng chờ thanh toán</h2>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleRefresh} className="h-8 w-8">
                                <RefreshCw className={cn("w-3.5 h-3.5", loadingOrders && "animate-spin")} />
                            </Button>
                        </div>
                        
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                placeholder="Biển số, tên khách..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className="w-full h-10 pl-9 pr-4 bg-slate-100 dark:bg-slate-800 border-none rounded-sm text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none font-medium"
                            />
                        </div>

                        {/* Summary Micro-card */}
                        <div className="bg-blue-600 rounded-sm p-3 text-white shadow-lg shadow-blue-500/20">
                            <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Tổng nợ hàng chờ</p>
                            <p className="text-xl font-black font-mono leading-none tracking-tight">{formatCurrency(totalDebt)}</p>
                        </div>
                    </div>

                    {/* Queue List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {loadingOrders && orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 opacity-50">
                                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                            </div>
                        ) : pendingOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <Inbox className="w-8 h-8 mb-2 opacity-20" />
                                <p className="text-xs uppercase font-black tracking-widest italic">Trống</p>
                            </div>
                        ) : (
                            pendingOrders.map((order: any) => (
                                <button
                                    key={order.id}
                                    onClick={() => setSelectedOrderId(order.id)}
                                    className={cn(
                                        "w-full text-left p-3 rounded-sm transition-all border group relative overflow-hidden",
                                        selectedOrderId === order.id
                                            ? "bg-white dark:bg-slate-800 border-blue-500 shadow-md ring-1 ring-blue-500/20"
                                            : "bg-transparent border-transparent hover:bg-white dark:hover:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-lg font-black font-mono tracking-wider text-slate-900 dark:text-white uppercase leading-none">
                                            {order.plate}
                                        </span>
                                        <Badge variant="outline" className="text-[9px] h-4 font-bold uppercase tracking-tighter px-1 rounded-none border-blue-200 text-blue-600 bg-blue-50/50">
                                            #{order.id}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 line-clamp-1">{order.customerName}</span>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black uppercase text-rose-500 leading-none mb-0.5 tracking-tighter">Cần thu</p>
                                            <p className={cn(
                                                "text-sm font-black font-mono leading-none tracking-tight",
                                                selectedOrderId === order.id ? "text-blue-600" : "text-slate-900 dark:text-slate-200"
                                            )}>
                                                {formatCurrency(order.remainingAmount)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Indicator for selection */}
                                    {selectedOrderId === order.id && (
                                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-600"></div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Side: Live Invoice Display */}
                <div className="flex-1 relative overflow-hidden flex flex-col bg-slate-100 dark:bg-slate-950/20">
                    {!selectedOrderId ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                            <div className="w-20 h-20 rounded-full bg-slate-200/50 dark:bg-slate-800/50 flex items-center justify-center mb-6">
                                <LayoutGrid className="w-10 h-10 opacity-20" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-slate-100 italic">Hóa Đơn Đang Chờ</h3>
                            <p className="max-w-xs text-sm font-medium mt-2">Vui lòng chọn một xe từ hàng chờ bên trái để bắt đầu quy trình thu tiền chuyên nghiệp.</p>
                        </div>
                    ) : loadingDetail ? (
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Đang tải dữ liệu hóa đơn...</p>
                        </div>
                    ) : selectedOrder ? (
                        <LiveInvoice 
                            order={{
                                ...selectedOrder,
                                phone: selectedOrder.customerPhone || 'N/A',
                                odo: selectedOrder.odo || 0,
                                items: (selectedOrder.items || []).map(item => ({
                                    ...item,
                                    discountAmount: (item.unitPrice * item.quantity * (item.discountPercent || 0)) / 100
                                }))
                            }}
                            onConfirmPayment={handleConfirmPayment}
                            isProcessing={paymentMutation.isPending}
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-rose-400">
                             Lỗi khi tải thông tin đơn hàng
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
                        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
                        <p className="text-slate-500 font-medium italic uppercase tracking-widest text-xs">Đang chuẩn bị hệ thống thu ngân...</p>
                    </div>
                </div>
            </DashboardLayout>
        }>
            <SaleCheckoutPageContent />
        </Suspense>
    );
}
