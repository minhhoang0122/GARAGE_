'use client';

import { Suspense, useState, useEffect } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { Search, RefreshCw, AlertCircle, DollarSign, User, Phone, FileText } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

type Debtor = {
    customerId: number;
    customerName: string;
    phoneNumber: string;
    totalDebt: number;
    orderCount: number;
};

export default function DebtsPage() {
    return (
        <DashboardLayout title="Quản lý công nợ" subtitle="Danh sách khách hàng đang nợ">
            <Suspense fallback={<div>Loading...</div>}>
                <DebtsContent />
            </Suspense>
        </DashboardLayout>
    );
}

function DebtsContent() {
    const { data: session } = useSession();
    const token = (session?.user as any)?.accessToken;
    const { showToast } = useToast();

    const [debtors, setDebtors] = useState<Debtor[]>([]);
    const [filteredDebtors, setFilteredDebtors] = useState<Debtor[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;
        loadDebts();
    }, [token]);

    const loadDebts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.get('/debts', token); // Call /api/debts
            setDebtors(res);
            setFilteredDebtors(res);
        } catch (err: any) {
            console.error(err);
            setError('Lỗi tải danh sách công nợ');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const lower = searchTerm.toLowerCase();
        const filtered = debtors.filter(d =>
            d.customerName.toLowerCase().includes(lower) ||
            d.phoneNumber.includes(lower)
        );
        setFilteredDebtors(filtered);
    }, [searchTerm, debtors]);

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const totalDebt = filteredDebtors.reduce((sum, d) => sum + d.totalDebt, 0);

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Stats & Actions */}
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
                            onClick={loadDebts}
                            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                            <span className="text-sm font-medium hidden sm:inline">Tải lại</span>
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-3 transition-colors">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-x-auto transition-colors">
                <table className="w-full text-sm text-left ">
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
                            filteredDebtors.map(d => (
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
                                            onClick={() => showToast('info', 'Tính năng đang phát triển')}
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
        </div>
    );
}
