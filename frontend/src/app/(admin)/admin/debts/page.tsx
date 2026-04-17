'use client';

import { Suspense, useState, useMemo } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { useDebts, useDebtDetails } from '@/modules/finance/hooks/useFinance';
import { Debtor } from '@/modules/finance/services/finance';
import { Search, RefreshCw, AlertCircle, DollarSign, User, Phone, X, LayoutList, Calendar, Car, ArrowRight } from 'lucide-react';
import { useToast } from '@/modules/shared/components/ui/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/modules/shared/components/ui/sheet';
import { ScrollArea } from '@/modules/shared/components/ui/scroll-area';
import { Badge } from '@/modules/shared/components/ui/badge';

function DebtDetailDrawer({ customer, onClose }: { customer: Debtor | null, onClose: () => void }) {
    const { data: detail = [], isLoading } = useDebtDetails(customer?.customerId || 0);

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    return (
        <Sheet open={!!customer} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-xl bg-white dark:bg-slate-950 p-0 border-l dark:border-slate-800">
                <SheetHeader className="p-6 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <SheetTitle className="text-xl font-bold flex items-center gap-2">
                                <LayoutList className="w-5 h-5 text-blue-600" />
                                Chi Tiết Công Nợ
                            </SheetTitle>
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                <span className="font-semibold text-slate-900 dark:text-slate-200">{customer?.customerName}</span>
                                <span>•</span>
                                <span>{customer?.phoneNumber}</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-85px)] p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                            <RefreshCw className="w-8 h-8 animate-spin" />
                            <p className="font-medium">Đang tải chi tiết...</p>
                        </div>
                    ) : detail.length === 0 ? (
                        <div className="text-center py-20 text-slate-500 italic">
                            Không tìm thấy dữ liệu hóa đơn nợ.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {detail.map((order: any) => (
                                <div key={order.id} className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-blue-500/50 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">#{order.id}</span>
                                                <Badge variant="outline" className="text-[10px] font-bold uppercase bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                                                    Đang nợ
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {formatDate(order.createdAt)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Còn nợ</p>
                                            <p className="text-lg font-black text-red-600 dark:text-red-400">{formatMoney(order.balanceDue)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl mb-4 border border-dashed border-slate-200 dark:border-slate-800">
                                        <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center border border-slate-100 dark:border-slate-800">
                                            <Car className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase leading-none mb-1">Xe xử lý</p>
                                            <p className="font-bold text-slate-900 dark:text-white">{order.reception?.vehicle?.licensePlate || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div className="space-y-1">
                                            <p className="text-slate-400 uppercase font-bold tracking-wider">Tổng tiền</p>
                                            <p className="font-bold text-slate-700 dark:text-slate-300">{formatMoney(order.totalAmount)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-slate-400 uppercase font-bold tracking-wider">Đã trả</p>
                                            <p className="font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(order.amountPaid)}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t dark:border-slate-800 flex justify-end">
                                        <a 
                                            href={`/sale/orders/${order.id}`}
                                            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group/btn"
                                        >
                                            XEM PHIẾU XUẤT
                                            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                
                <div className="p-6 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <button 
                        onClick={onClose}
                        className="w-full h-12 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity"
                    >
                        Đóng
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export function DebtsContent() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);

    const { data: debtors = [], isLoading, isError, refetch } = useDebts();

    const filteredDebtors = useMemo(() => {
        const lower = searchTerm.toLowerCase();
        return debtors.filter((d: Debtor) =>
            d.customerName.toLowerCase().includes(lower) ||
            d.phoneNumber.includes(lower)
        );
    }, [searchTerm, debtors]);

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const totalDebt = (filteredDebtors as Debtor[]).reduce((sum: number, d: Debtor) => sum + d.totalDebt, 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors">
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Tổng Công Nợ</p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatMoney(totalDebt)}</p>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                        <DollarSign className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between md:col-span-2 transition-colors">
                    <div className="flex gap-4 w-full">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Tìm khách nợ (Tên, SĐT)..."
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm text-slate-900 dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                            <span className="text-sm font-medium hidden sm:inline">Tải lại</span>
                        </button>
                    </div>
                </div>
            </div>

            {isError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-3 transition-colors">
                    <AlertCircle className="w-5 h-5" />
                    Lỗi tải danh sách công nợ
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-x-auto transition-colors">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            <th className="px-6 py-4">Khách Hàng</th>
                            <th className="px-6 py-4">Số Điện Thoại</th>
                            <th className="px-6 py-4 text-center">Số Đơn Nợ</th>
                            <th className="px-6 py-4 text-right">Tổng Nợ</th>
                            <th className="px-6 py-4 text-right">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {isLoading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">Loading...</td></tr>
                        ) : filteredDebtors.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">Không có dữ liệu công nợ</td></tr>
                        ) : (
                            filteredDebtors.map((d: Debtor) => (
                                <tr key={d.customerId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                        <User className="w-4 h-4 text-slate-400" />
                                        {d.customerName}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-3 h-3 text-slate-400" />
                                            {d.phoneNumber}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300 font-medium transition-colors">
                                            {d.orderCount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-red-600 dark:text-red-400">
                                        {formatMoney(d.totalDebt)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-xs border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition-all"
                                            onClick={() => setSelectedDebtor(d)}
                                        >
                                            Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <DebtDetailDrawer 
                customer={selectedDebtor} 
                onClose={() => setSelectedDebtor(null)} 
            />
        </div>
    );
}

export default function DebtsPage() {
    return (
        <DashboardLayout title="Quản lý công nợ" subtitle="Danh sách khách hàng đang nợ">
            <Suspense fallback={<div>Loading...</div>}>
                <DebtsContent />
            </Suspense>
        </DashboardLayout>
    );
}
