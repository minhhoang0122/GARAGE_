'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
    Clock, ArrowDownCircle, ArrowUpCircle,
    User, Truck, FileText, ChevronDown, ChevronUp, Package, Calendar, Printer,
    CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import PrintImportNote from '@/modules/inventory/components/PrintImportNote';

import { useToast } from '@/modules/shared/components/ui/use-toast';

export default function WarehouseHistoryPage() {
    const { toast } = useToast();
    const { data: session } = useSession();
    // @ts-ignore
    const token = session?.user?.accessToken;

    const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
    const [imports, setImports] = useState<any[]>([]);
    const [exports, setExports] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
    const [printData, setPrintData] = useState<any>(null);

    useEffect(() => {
        if (token) {
            loadData();
        }
    }, [token, activeTab]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'import') {
                const data = await api.get('/warehouse/history/import', token);
                setImports(data);
            } else {
                const data = await api.get('/warehouse/history/export', token);
                setExports(data);
            }
        } catch (error) {
            console.error('Failed to load history', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleRow = (id: number) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('vi-VN');
    };

    const handlePrint = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        try {
            const detail = await api.get(`/warehouse/import/${id}`, token);
            setPrintData(detail);
        } catch (error) {
            console.error('Failed to fetch note for printing', error);
            // @ts-ignore
            toast({ title: "Lỗi", description: "Không thể tải phiếu nhập. Vui lòng thử lại.", variant: "destructive" });
        }
    };

    const handleApprove = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!confirm('Bạn có chắc chắn muốn duyệt phiếu nhập này? Tồn kho sẽ được cộng thêm ngay lập tức.')) return;
        
        try {
            await api.post(`/warehouse/import/${id}/approve`, {}, token);
            toast({ title: "Thành công", description: "Đã duyệt phiếu nhập kho." });
            loadData();
        } catch (error: any) {
            toast({ title: "Lỗi", description: error.message || "Không thể duyệt phiếu.", variant: "destructive" });
        }
    };

    const handleReject = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!confirm('Bạn có chắc chắn muốn từ chối phiếu nhập này?')) return;
        
        try {
            await api.post(`/warehouse/import/${id}/reject`, {}, token);
            toast({ title: "Đã từ chối", description: "Phiếu nhập đã bị hủy." });
            loadData();
        } catch (error: any) {
            toast({ title: "Lỗi", description: error.message || "Không thể thực hiện.", variant: "destructive" });
        }
    };

    return (
        <DashboardLayout title="Lịch sử Kho" subtitle="Theo dõi chi tiết nhập xuất hàng hóa">
            {printData && (
                <PrintImportNote data={printData} onClose={() => setPrintData(null)} />
            )}

            <div className="max-w-6xl mx-auto space-y-6 pb-20">

                {/* Tabs */}
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('import')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'import'
                            ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                            }`}
                    >
                        <ArrowDownCircle className="w-4 h-4" />
                        Lịch sử Nhập kho
                    </button>
                    <button
                        onClick={() => setActiveTab('export')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'export'
                            ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-indigo-400'
                            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                            }`}
                    >
                        <ArrowUpCircle className="w-4 h-4" />
                        Lịch sử Xuất kho
                    </button>
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center text-slate-500">Đang tải dữ liệu...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Mã / Thời gian</th>
                                        <th className="px-6 py-4">
                                            {activeTab === 'import' ? 'Nhà cung cấp' : 'Xe / Khách hàng'}
                                        </th>
                                        <th className="px-6 py-4">Người thực hiện</th>
                                        <th className="px-6 py-4 text-right">Tổng giá trị</th>
                                        <th className="px-6 py-4 text-center">Trạng thái</th>
                                        <th className="px-6 py-4 text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {(activeTab === 'import' ? imports : exports).map((item) => (
                                        <>
                                            <tr
                                                key={item.id}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                                                onClick={() => toggleRow(item.id)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-800 dark:text-slate-200">
                                                        {activeTab === 'import' ? item.code : `XK${item.id.toString().padStart(6, '0')}`}
                                                    </div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDate(item.date)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {activeTab === 'import' ? (
                                                        <div className="flex items-center gap-2">
                                                            <Truck className="w-4 h-4 text-slate-400" />
                                                            <span>{item.supplier || 'N/A'}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <div className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700">
                                                                {item.vehicle}
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-slate-400" />
                                                        <span>{item.creator}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-slate-100">
                                                    {formatCurrency(item.total)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {activeTab === 'import' ? (
                                                        <div className="flex justify-center">
                                                            {item.status === 'COMPLETED' && (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    Đã duyệt
                                                                </span>
                                                            )}
                                                            {item.status === 'PENDING' && (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                                                    <AlertCircle className="w-3 h-3" />
                                                                    Chờ duyệt
                                                                </span>
                                                            )}
                                                            {(item.status === 'REJECTED' || item.status === 'CANCELLED') && (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                                                                    <XCircle className="w-3 h-3" />
                                                                    Từ chối
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {activeTab === 'import' && item.status === 'PENDING' && (
                                                            <>
                                                                <button
                                                                    onClick={(e) => handleApprove(e, item.id)}
                                                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                                                    title="Duyệt phiếu"
                                                                >
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => handleReject(e, item.id)}
                                                                    className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                                                    title="Từ chối"
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                        {activeTab === 'import' && (
                                                            <button
                                                                onClick={(e) => handlePrint(e, item.id)}
                                                                className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors"
                                                                title="In phiếu nhập"
                                                            >
                                                                <Printer className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button 
                                                            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg transition-colors"
                                                            title="Chi tiết"
                                                        >
                                                            {expandedRows[item.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedRows[item.id] && (
                                                <tr className="bg-slate-50 dark:bg-slate-800/30">
                                                    <td colSpan={5} className="px-6 py-4">
                                                        <div className="space-y-2 pl-4 border-l-2 border-slate-300 dark:border-slate-700">
                                                            <p className="text-xs font-bold text-slate-500 uppercase">Danh sách hàng hóa</p>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                                {item.items.map((prod: any, idx: number) => (
                                                                    <div key={idx} className="flex justify-between items-center text-sm bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                                                        <div className="flex flex-col min-w-0">
                                                                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={prod.productName}>
                                                                                {prod.productName}
                                                                            </span>
                                                                            <div className="flex items-center gap-1.5 mt-1">
                                                                                <span className="text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-medium">x{prod.quantity}</span>
                                                                                {activeTab === 'import' && (
                                                                                    <span className="text-slate-400 text-[11px]">{formatCurrency(prod.price)}</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-col items-end gap-1.5 shrink-0 ml-4">
                                                                            {activeTab === 'import' && (
                                                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                                                                                    <Package className="w-3.5 h-3.5" />
                                                                                    <span className="font-bold text-xs uppercase tracking-wider">Lô {prod.batchId}</span>
                                                                                </div>
                                                                            )}
                                                                            {activeTab === 'import' && prod.expiryDate && (
                                                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-lg border border-rose-100 dark:border-rose-800/50">
                                                                                    <Calendar className="w-3.5 h-3.5" />
                                                                                    <span className="font-medium text-xs">
                                                                                        HSD: {new Date(prod.expiryDate).toLocaleDateString('vi-VN')}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                    {(activeTab === 'import' ? imports : exports).length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                                Chưa có dữ liệu lịch sử
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
