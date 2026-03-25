'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { ArrowUpRight, ArrowDownRight, Wallet, Calendar, Loader2, CreditCard, Banknote, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import { useQuery } from '@tanstack/react-query';

interface TransactionStats {
    currentBalance: number;
    totalRevenueThisMonth: number;
    totalRefundThisMonth: number;
}

interface Transaction {
    id: number;
    amount: number;
    type: 'DEPOSIT' | 'PAYMENT' | 'REFUND';
    method: 'CASH' | 'TRANSFER' | 'CARD';
    referenceCode: string;
    note: string;
    createdAt: string;
    createdBy: string;
}

export default function FinancePage() {
    const { data: session } = useSession();
    // @ts-ignore
    const token = session?.user?.accessToken;

    const { data: stats, isLoading: statsLoading } = useQuery<TransactionStats>({
        queryKey: ['transactions', 'stats'],
        queryFn: () => api.get('/transactions/stats', token),
        enabled: !!token
    });

    const { data: transactions = [], isLoading: transactionsLoading, refetch } = useQuery<Transaction[]>({
        queryKey: ['transactions', 'recent'],
        queryFn: () => api.get('/transactions/recent', token),
        enabled: !!token
    });

    const loading = statsLoading || transactionsLoading;

    async function handleRefresh() {
        refetch();
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'DEPOSIT': return { label: 'Đặt cọc', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
            case 'PAYMENT': return { label: 'Thanh toán', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
            case 'REFUND': return { label: 'Hoàn tiền', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
            default: return { label: type, class: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' };
        }
    };

    const getMethodIcon = (method: string) => {
        switch (method) {
            case 'CASH': return <Banknote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
            case 'TRANSFER': return <RefreshCw className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
            case 'CARD': return <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
            default: return <Wallet className="w-5 h-5 text-slate-400" />;
        }
    };

    return (
        <DashboardLayout title="Tài chính" subtitle="Quản lý dòng tiền và Thu/Chi">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-slate-100 text-slate-600 rounded-xl dark:bg-slate-800 dark:text-slate-400">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Số dư quỹ (Tiền mặt / CK)</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {loading ? '...' : formatCurrency(stats?.currentBalance || 0)}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl dark:bg-green-900/20 dark:text-green-400">
                            <ArrowUpRight className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Tổng thu (Tháng này)</p>
                            <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {loading ? '...' : '+' + formatCurrency(stats?.totalRevenueThisMonth || 0)}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl dark:bg-red-900/20 dark:text-red-400">
                            <ArrowDownRight className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Tổng chi / Hoàn tiền (Tháng này)</p>
                            <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {loading ? '...' : '-' + formatCurrency(stats?.totalRefundThisMonth || 0)}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Giao dịch gần đây</h3>
                    <button onClick={handleRefresh} disabled={loading} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {loading ? (
                        <div className="text-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400 mb-4" />
                            <p className="text-slate-500 dark:text-slate-400">Đang tải biểu đồ giao dịch...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Chưa có dữ liệu giao dịch.</p>
                            <p className="text-xs mt-2 opacity-60">Dữ liệu sẽ hiển thị khi có phát sinh Phiếu thu/chi.</p>
                        </div>
                    ) : (
                        transactions.map((t) => {
                            const typeInfo = getTypeLabel(t.type);
                            const isNegative = t.type === 'REFUND';

                            return (
                                <div key={t.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                            {getMethodIcon(t.method)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {t.note || (t.type === 'REFUND' ? 'Hoàn tiền Khách hàng' : 'Khách hàng thanh toán')}
                                                </p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeInfo.class}`}>
                                                    {typeInfo.label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {format(new Date(t.createdAt), "HH:mm - dd/MM/yyyy", { locale: vi })}
                                                <span className="text-slate-300 dark:text-slate-600">|</span>
                                                <span className="font-medium">#{t.referenceCode || `TX-${t.id}`}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-bold ${isNegative ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                            {isNegative ? '-' : '+'}{formatCurrency(t.amount)}
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                            Bởi: <span className="font-medium text-slate-700 dark:text-slate-300">{t.createdBy}</span>
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
