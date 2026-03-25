'use client';

import { useState, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { DashboardLayout } from '@/modules/common/components/layout';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
    Clock, ArrowDownCircle, ArrowUpCircle,
    User, Truck, FileText, ChevronDown, ChevronUp, Package, Calendar, Printer,
    CheckCircle2, XCircle, AlertCircle, Search, RefreshCw, Filter,
    CalendarDays
} from 'lucide-react';
import PrintImportNote from '@/modules/inventory/components/PrintImportNote';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/modules/shared/components/ui/button';
import { Input } from '@/modules/shared/components/ui/input';
import { toast } from 'sonner';

export default function WarehouseHistoryPage() {
    const { data: session } = useSession();
    // @ts-ignore
    const token = session?.user?.accessToken;

    const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
    const [printData, setPrintData] = useState<any>(null);
    const parentRef = useRef<HTMLDivElement>(null);

    const { data: historyData = [], isLoading, refetch } = useQuery<any[]>({
        queryKey: ['warehouse', 'history', activeTab],
        queryFn: () => api.get(`/warehouse/history/${activeTab}`, token),
        enabled: !!token
    });

    const filteredData = historyData.filter(item => {
        const searchStr = searchTerm.toLowerCase();
        const code = activeTab === 'import' ? (item.code || '') : `XK${item.id.toString().padStart(6, '0')}`;
        const person = item.creator || '';
        const entity = activeTab === 'import' ? (item.supplier || '') : (item.vehicle || '');
        
        return code.toLowerCase().includes(searchStr) || 
               person.toLowerCase().includes(searchStr) || 
               entity.toLowerCase().includes(searchStr);
    });

    const rowVirtualizer = useVirtualizer({
        count: filteredData.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 64,
        overscan: 10,
    });

    const toggleRow = (id: number) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handlePrint = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        try {
            const detail = await api.get(`/warehouse/import/${id}`, token);
            setPrintData(detail);
        } catch (error) {
            console.error('Failed to fetch note for printing', error);
            toast.error("Không thể tải phiếu nhập. Vui lòng thử lại.");
        }
    };

    return (
        <DashboardLayout title="Lịch sử Kho" subtitle="Theo dõi chi tiết nhập xuất hàng hóa">
            {printData && (
                <PrintImportNote data={printData} onClose={() => setPrintData(null)} />
            )}

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Control Bar */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        <button
                            onClick={() => { setActiveTab('import'); setExpandedRows({}); }}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${activeTab === 'import'
                                ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400'
                                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                                }`}
                        >
                            <ArrowDownCircle className="w-4 h-4" />
                            Nhập kho
                        </button>
                        <button
                            onClick={() => { setActiveTab('export'); setExpandedRows({}); }}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${activeTab === 'export'
                                ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                                }`}
                        >
                            <ArrowUpCircle className="w-4 h-4" />
                            Xuất kho
                        </button>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Tìm theo mã, tên, đối tác..."
                                className="pl-10 h-10 border-none bg-slate-50 dark:bg-slate-800/50 focus-visible:ring-1 focus-visible:ring-blue-500 rounded-lg"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading} className="h-10 w-10">
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                    <div 
                        ref={parentRef}
                        className="h-[calc(100vh-280px)] overflow-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800"
                    >
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                                <RefreshCw className="w-8 h-8 animate-spin" />
                                <p className="text-sm font-medium">Đang tải lịch sử...</p>
                            </div>
                        ) : filteredData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400 p-12">
                                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <Clock className="w-8 h-8" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Chưa có dữ liệu</h3>
                                    <p className="text-sm">Không tìm thấy bản ghi lịch sử nào phù hợp.</p>
                                </div>
                            </div>
                        ) : (
                                <div
                                    style={{
                                        height: `${rowVirtualizer.getTotalSize() + 48}px`,
                                        width: '100%',
                                        position: 'relative',
                                    }}
                                >
                                <table className="w-full border-collapse">
                                    <thead className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <th className="text-left px-6 py-4 w-[200px]">Mã / Thời gian</th>
                                            <th className="text-left px-6 py-4">
                                                {activeTab === 'import' ? 'Nhà cung cấp' : 'Xe / Khách hàng'}
                                            </th>
                                            <th className="text-left px-6 py-4">Thủ kho</th>
                                            <th className="text-right px-6 py-4 w-[150px]">Tổng giá trị</th>
                                            <th className="text-center px-6 py-4 w-[150px]">Trạng thái</th>
                                            <th className="w-[80px]"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                            const item = filteredData[virtualRow.index];
                                            const isExpanded = expandedRows[item.id];

                                            return (
                                                <tr 
                                                    key={item.id}
                                                    onClick={() => toggleRow(item.id)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: `${virtualRow.size}px`,
                                                        transform: `translateY(${virtualRow.start + 48}px)`,
                                                    }}
                                                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-50 dark:border-slate-800/50 cursor-pointer group ${isExpanded ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''}`}
                                                >
                                                    <td className="px-6 py-3">
                                                        <div className="font-mono text-sm font-bold text-slate-800 dark:text-slate-100">
                                                            {activeTab === 'import' ? item.code : `XK${item.id.toString().padStart(6, '0')}`}
                                                        </div>
                                                        <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5 uppercase">
                                                            <CalendarDays className="w-3 h-3" />
                                                            {formatDate(item.date)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <div className="flex items-center gap-2">
                                                            {activeTab === 'import' ? (
                                                                <>
                                                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                                                                        <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                                    </div>
                                                                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{item.supplier || 'N/A'}</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                                                                        <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                                    </div>
                                                                    <span className="font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-200 dark:border-slate-700">
                                                                        {item.vehicle}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                                                                {item.creator?.charAt(0)}
                                                            </div>
                                                            <span className="font-medium">{item.creator}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 text-right">
                                                        <div className="font-mono font-black text-slate-900 dark:text-white">
                                                            {formatCurrency(item.total)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <div className="flex justify-center">
                                                            {activeTab === 'import' ? (
                                                                <>
                                                                    {item.status === 'COMPLETED' && (
                                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                                                                            <CheckCircle2 className="w-3 h-3" />
                                                                            Đã Duyệt
                                                                        </span>
                                                                    )}
                                                                    {item.status === 'PENDING' && (
                                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
                                                                            <AlertCircle className="w-3 h-3" />
                                                                            Chờ Duyệt
                                                                        </span>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Giao xe</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {activeTab === 'import' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                                    onClick={(e) => handlePrint(e, item.id)}
                                                                >
                                                                    <Printer className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                            <div className="p-1 text-slate-400">
                                                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
