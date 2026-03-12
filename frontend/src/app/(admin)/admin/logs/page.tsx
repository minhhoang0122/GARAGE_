'use client';

import { useState, useEffect, Fragment } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { Search, History, Filter, User, Calendar, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Card } from '@/modules/shared/components/ui/card';

type AuditLog = {
    id: number;
    table: string;
    recordId: number;
    action: string;
    oldData: string | null;
    newData: string | null;
    reason: string | null;
    timestamp: string;
    user: string;
};

export default function AuditLogsPage() {
    const { data: session } = useSession();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedLog, setExpandedLog] = useState<number | null>(null);

    const loadLogs = async () => {
        try {
            setIsLoading(true);
            const token = (session?.user as any)?.accessToken;
            const res = await api.get('/admin/audit-logs', token);
            setLogs(res);
            setFilteredLogs(res);
        } catch (error) {
            console.error('Failed to load logs', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (session) loadLogs();
    }, [session]);

    useEffect(() => {
        const lowerSearch = searchTerm.toLowerCase();
        const filtered = logs.filter(log =>
            log.user.toLowerCase().includes(lowerSearch) ||
            log.action.toLowerCase().includes(lowerSearch) ||
            log.table.toLowerCase().includes(lowerSearch) ||
            (log.reason?.toLowerCase() || '').includes(lowerSearch)
        );
        setFilteredLogs(filtered);
    }, [searchTerm, logs]);

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'INSERT': return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-bold">THÊM MỚI</span>;
            case 'UPDATE': return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-xs font-bold">CẬP NHẬT</span>;
            case 'DELETE': return <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-bold">XÓA</span>;
            case 'CREATE_WARRANTY': return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-bold">TẠO BẢO HÀNH</span>;
            default: return <span className="px-2 py-0.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 rounded-full text-xs font-bold">{action}</span>;
        }
    };

    return (
        <DashboardLayout title="Nhật Ký Hệ Thống" subtitle="Ghi lại toàn bộ lịch sử thao tác của người dùng">
            <div className="max-w-6xl mx-auto space-y-6 pb-20">
                {/* Search & Stats */}
                <Card className="flex flex-col md:flex-row gap-4 justify-between items-center p-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm theo nhân viên, hành động, bảng..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 dark:text-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <History className="w-4 h-4" />
                            Tổng số: <strong>{filteredLogs.length}</strong> bản ghi
                        </span>
                    </div>
                </Card>

                {/* Logs Table */}
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thời gian</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Người thực hiện</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hành động</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Đối tượng</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">Đang tải nhật ký...</td>
                                    </tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">Không tìm thấy bản ghi nào</td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <Fragment key={log.id}>
                                            <tr
                                                className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors ${expandedLog === log.id ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-800 dark:text-slate-200">{new Date(log.timestamp).toLocaleDateString('vi-VN')}</span>
                                                        <span className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleTimeString('vi-VN')}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-bold">
                                                            {log.user.charAt(0)}
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{log.user}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getActionBadge(log.action)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{log.table}</span>
                                                        <span className="text-[10px] text-slate-400 uppercase tracking-tighter">ID: {log.recordId}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
                                                    >
                                                        {expandedLog === log.id ? <ChevronUp className="w-4 h-4 text-slate-600 dark:text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-400" />}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedLog === log.id && (
                                                <tr className="bg-slate-50/80 dark:bg-slate-800/50">
                                                    <td colSpan={5} className="px-8 py-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div className="space-y-2">
                                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dữ liệu cũ</h4>
                                                                <div className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-300 overflow-x-auto max-h-40">
                                                                    {log.oldData ? (
                                                                        <pre className="whitespace-pre-wrap">{log.oldData}</pre>
                                                                    ) : (
                                                                        <span className="italic text-slate-300 dark:text-slate-600">Không có dữ liệu</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dữ liệu mới</h4>
                                                                <div className="p-3 bg-white dark:bg-slate-950 border border-blue-200 dark:border-blue-900/30 rounded-lg text-xs font-mono text-blue-700 dark:text-blue-400 overflow-x-auto max-h-40">
                                                                    {log.newData ? (
                                                                        <pre className="whitespace-pre-wrap">{log.newData}</pre>
                                                                    ) : (
                                                                        <span className="italic text-slate-300 dark:text-slate-600">Không có dữ liệu</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {log.reason && (
                                                            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-lg flex items-start gap-2">
                                                                <Info className="w-4 h-4 text-amber-500 dark:text-amber-400 mt-0.5" />
                                                                <div className="text-sm">
                                                                    <span className="font-bold text-amber-800 dark:text-amber-300">Lý do: </span>
                                                                    <span className="text-amber-700 dark:text-amber-400">{log.reason}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
