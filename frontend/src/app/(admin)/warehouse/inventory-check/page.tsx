'use client';

import { Suspense, useState, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { DashboardLayout } from '@/modules/common/components/layout';
import { 
    Search, 
    RefreshCw, 
    Save, 
    AlertCircle, 
    History, 
    Package, 
    CheckCircle2, 
    AlertTriangle,
    ArrowUpDown,
    Check
} from 'lucide-react';
import { useInventory, useInventoryCheck } from '@/modules/warehouse/hooks/useWarehouse';
import { Product } from '@/modules/warehouse/services/warehouse';
import { useConfirm } from '@/modules/shared/components/ui/ConfirmModal';
import { Button } from '@/modules/shared/components/ui/button';
import { Input } from '@/modules/shared/components/ui/input';
import { useToast } from '@/modules/shared/components/ui/use-toast';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';



export default function InventoryCheckPage() {
    return (
        <DashboardLayout title="Kiểm kê kho" subtitle="Đối soát tồn kho thực tế và hệ thống">
            <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><RefreshCw className="w-8 h-8 animate-spin text-blue-500" /></div>}>
                <InventoryCheckContent />
            </Suspense>
        </DashboardLayout>
    );
}

export function InventoryCheckContent() {
    const [searchTerm, setSearchTerm] = useState('');
    const [actuals, setActuals] = useState<Record<number, number>>({});
    const [reasons, setReasons] = useState<Record<number, string>>({});
    const confirm = useConfirm();
    const { toast } = useToast();
    const parentRef = useRef<HTMLDivElement>(null);

    const { data: products = [], isLoading, refetch } = useInventory();
    const adjustMutation = useInventoryCheck();

    const filteredProducts = products.filter((p: any) =>
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const rowVirtualizer = useVirtualizer({
        count: filteredProducts.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 80,
        overscan: 10,
    });

    const handleAdjust = async (p: any) => {
        const actual = actuals[p.id];
        const reason = reasons[p.id];

        if (actual === undefined || actual === p.stock) {
            toast({ title: "Thông báo", description: 'Số lượng thực tế chưa thay đổi', variant: "destructive" });
            return;
        }

        if (!reason || reason.trim().length < 5) {
            toast({ title: "Lỗi", description: 'Vui lòng nhập lý do điều chỉnh (tối thiểu 5 ký tự)', variant: "destructive" });
            return;
        }

        const confirmed = await confirm({
            title: 'Xác nhận điều chỉnh',
            message: `Bạn đang điều chỉnh tồn kho cho ${p.name} (${p.code}).\n\nHệ thống: ${p.stock}\nThực tế: ${actual}\nChênh lệch: ${actual - p.stock > 0 ? '+' : ''}${actual - p.stock}\nLý do: ${reason}`,
            type: 'warning',
            confirmText: 'Xác nhận thay đổi'
        });
        if (!confirmed) return;

        adjustMutation.mutate({ productId: p.id, actualQuantity: actual, reason }, {
            onSuccess: () => {
                toast({ title: "Thành công", description: 'Đã cập nhật tồn kho thành công' });
                setActuals(prev => {
                    const n = { ...prev };
                    delete n[p.id];
                    return n;
                });
                setReasons(prev => {
                    const n = { ...prev };
                    delete n[p.id];
                    return n;
                });
            },
            onError: (err: any) => {
                toast({ title: "Lỗi", description: err.message || 'Lỗi điều chỉnh', variant: "destructive" });
            }
        });
    };

    const hasChanges = Object.keys(actuals).length > 0;
    const processingId = adjustMutation.isPending ? (adjustMutation.variables as any)?.productId : null;

    return (
        <div className="max-w-[1400px] mx-auto flex flex-col h-[calc(100vh-100px)] space-y-5 pb-6">
            {/* Header Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 shrink-0">
                <div className="lg:col-span-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4 transition-all">
                    <div className="relative flex-1 w-full">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <Input
                            placeholder="Nhập mã hoặc tên phụ tùng để tìm kiếm nhanh..."
                            className="pl-12 h-14 w-full border-slate-200 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus-visible:ring-4 focus-visible:ring-blue-500/20 rounded-2xl text-base shadow-sm transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={() => refetch()} 
                        disabled={isLoading} 
                        className="h-14 px-8 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm w-full sm:w-auto font-bold text-[15px]"
                    >
                        <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </Button>
                </div>
                
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-[0_8px_30px_rgb(59,130,246,0.3)] p-5 flex items-center justify-between text-white relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="flex items-center gap-4 relative z-10 w-full">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                            <CheckCircle2 className="w-7 h-7 text-blue-50" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs uppercase font-extrabold text-blue-200 tracking-wider mb-1">Xử lý chờ lưu</p>
                            <div className="flex items-baseline gap-1.5">
                                <p className="text-4xl font-black tracking-tight">{Object.keys(actuals).length}</p>
                                <span className="text-sm font-semibold text-blue-100">mã kho</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col flex-1 min-h-0 relative">
                <div className="border-b border-slate-100 dark:border-slate-800 p-6 bg-gradient-to-r from-slate-50/80 to-white dark:from-slate-900 dark:to-slate-900/80 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-600 dark:text-blue-400 shadow-inner">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-xl text-slate-800 dark:text-slate-100">
                                Chi tiết Kiểm Kê
                            </h3>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                Danh sách {filteredProducts.length} phụ tùng trong kho
                            </p>
                        </div>
                    </div>
                    {hasChanges && (
                        <div className="flex items-center gap-2.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-xl border border-amber-200/60 dark:border-amber-800/60 transition-all">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                            </span>
                            <span className="text-sm font-bold uppercase tracking-widest">
                                Có thay đổi thiết lập
                            </span>
                        </div>
                    )}
                </div>

                {/* Header Row (Outside scroll to stay sticky cleanly) */}
                <div className="hidden lg:grid grid-cols-[150px_1fr_100px_140px_240px_140px] gap-4 px-6 items-center shrink-0 bg-slate-100/95 dark:bg-slate-800/95 backdrop-blur-lg border-y border-slate-200 dark:border-slate-700 w-full z-20">
                    <div className="py-4 text-[13px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-left">Mã VT</div>
                    <div className="py-4 text-[13px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-left">Tên Phụ Tùng</div>
                    <div className="py-4 text-[13px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Kho Web</div>
                    <div className="py-4 text-[13px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-left">Thực Tế</div>
                    <div className="py-4 text-[13px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-left">Lý Do Lệch</div>
                    <div className="py-4 text-[13px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Thao Tác</div>
                </div>

                <div 
                    ref={parentRef}
                    className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 bg-slate-50/30 dark:bg-slate-900/30"
                >
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-5 text-slate-400 min-h-[300px]">
                            <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                <RefreshCw className="w-10 h-10 animate-spin text-blue-500" />
                            </div>
                            <p className="text-base font-bold tracking-wide">Đang tải biểu mẫu dữ liệu...</p>
                        </div>
                    ) : (
                        <div
                            style={{
                                height: `${rowVirtualizer.getTotalSize()}px`,
                                width: '100%',
                                position: 'relative',
                            }}
                        >
                            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                const p = filteredProducts[virtualRow.index];
                                const actual = actuals[p.id];
                                const reason = reasons[p.id] || '';
                                const diff = actual !== undefined ? actual - p.stock : 0;
                                const hasDiff = diff !== 0 && actual !== undefined;
                                const isProcessing = processingId === p.id;
                                
                                const rowClass = hasDiff 
                                    ? "bg-amber-50/50 dark:bg-amber-900/10 shadow-[inset_4px_0_0_0_rgb(245,158,11)] hover:bg-amber-50/80 dark:hover:bg-amber-900/20 border-b border-amber-100" 
                                    : "bg-white dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 shadow-[inset_4px_0_0_0_transparent] border-b border-slate-100 dark:border-slate-800";

                                return (
                                    <div 
                                        key={p.id}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: `${virtualRow.size}px`,
                                            transform: `translateY(${virtualRow.start}px)`,
                                        }}
                                        className={`transition-all duration-300 hidden lg:grid grid-cols-[150px_1fr_100px_140px_240px_140px] gap-4 px-6 items-center group ${rowClass}`}
                                    >
                                        <div className="align-middle">
                                            <span className="font-mono text-[13px] font-black tracking-tight text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors group-hover:border-slate-300 w-full inline-block text-center overflow-hidden text-ellipsis">
                                                {p.code}
                                            </span>
                                        </div>
                                        <div className="align-middle pr-2">
                                            <div className="font-bold text-slate-900 dark:text-slate-100 text-[15px] line-clamp-2" title={p.name}>
                                                {p.name}
                                            </div>
                                        </div>
                                        <div className="align-middle text-center">
                                            <div className="inline-flex items-center justify-center w-full px-2 py-2 w-14 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black text-base border border-slate-200 dark:border-slate-700 shadow-inner">
                                                {p.stock}
                                            </div>
                                        </div>
                                        <div className="align-middle relative">
                                            <div className="group/actual flex items-center pr-6">
                                                <Input
                                                    type="number"
                                                    className={`h-11 w-full text-center font-black text-base shadow-inner transition-all rounded-xl ${
                                                        hasDiff 
                                                        ? 'border-amber-400 bg-white dark:bg-slate-800 focus-visible:ring-4 focus-visible:ring-amber-500/20 text-amber-900 dark:text-amber-100' 
                                                        : 'border-slate-200 bg-slate-50 dark:bg-slate-900 hover:bg-white hover:border-blue-300 focus-visible:ring-4 focus-visible:ring-blue-500/20'
                                                    }`}
                                                    placeholder={p.stock.toString()}
                                                    value={actual !== undefined ? actual : ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === '') {
                                                            setActuals(prev => {
                                                                const n = { ...prev };
                                                                delete n[p.id];
                                                                return n;
                                                            });
                                                        } else {
                                                            setActuals(prev => ({ ...prev, [p.id]: parseInt(val) }));
                                                        }
                                                    }}
                                                />
                                                {hasDiff && (
                                                    <div className={`absolute right-1 w-4 text-left font-black text-sm drop-shadow-sm transition-transform ${diff > 0 ? 'text-emerald-500 scale-110' : 'text-red-500 scale-110'}`}>
                                                        {diff > 0 ? '+' : ''}{diff}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="align-middle">
                                            <Input
                                                placeholder={hasDiff ? "Vui lòng nhập lý do (Bắt buộc)..." : "Không có chênh lệch"}
                                                className={`h-11 text-[13px] font-medium transition-all rounded-xl ${hasDiff && !reason ? 'border-red-300 focus-visible:ring-4 focus-visible:ring-red-500/20 bg-red-50/50' : 'border-slate-200 bg-slate-50 hover:bg-white focus-visible:ring-4 focus-visible:ring-blue-500/20'}`}
                                                value={reason}
                                                onChange={(e) => setReasons(prev => ({ ...prev, [p.id]: e.target.value }))}
                                                disabled={actual === undefined || actual === p.stock}
                                            />
                                        </div>
                                        <div className="align-middle text-right">
                                            <Button
                                                onClick={() => handleAdjust(p)}
                                                disabled={!hasDiff || !reason || isProcessing}
                                                className={`h-11 px-4 font-bold text-[14px] rounded-xl transition-all shadow-sm w-full ${
                                                    hasDiff && reason 
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-[0_4px_12px_rgb(37,99,235,0.4)] active:scale-95' 
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-700'
                                                }`}
                                            >
                                                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : <><Save className="w-4 h-4 mr-1" /> Cập nhật</>}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="fixed bottom-6 right-8 z-[60]">
                <Link href="/warehouse/inventory">
                    <Button variant="outline" className="h-[52px] px-6 rounded-full shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 hover:shadow-blue-500/20 transition-all group">
                        <History className="w-5 h-5 mr-2 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        <span className="font-extrabold text-[14px]">Lịch Sử & Quay Lại</span>
                    </Button>
                </Link>
            </div>
        </div>
    );
}
