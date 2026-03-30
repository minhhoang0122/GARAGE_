'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { Shield, Clock, Car, Phone, Eye, CheckCircle, AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import { Card } from '@/modules/shared/components/ui/card';
import { EmptyState } from '@/modules/shared/components/ui/empty-state';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

const statusMap: Record<string, { label: string; color: string }> = {
    TIEP_NHAN: { label: 'Tiếp nhận', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    KHAM_XE: { label: 'Khám xe', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
    BAO_GIA: { label: 'Báo giá', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
    DANG_SUA: { label: 'Đang sửa', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
    HOAN_THANH: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    DONG: { label: 'Đã đóng', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400' },
};


export default function SaleWarrantyClaimsPage() {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const { data: claims = [], isLoading } = useQuery({
        queryKey: ['warranty-claims'],
        queryFn: async () => {
            return await api.get('/sale/warranty-claims');
        }
    });

    if (isLoading) {
        return (
            <DashboardLayout title="Quản lý bảo hành" subtitle="Yêu cầu bảo hành từ khách hàng">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="animate-spin text-slate-400" size={28} />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Quản lý bảo hành" subtitle="Yêu cầu bảo hành từ khách hàng">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800/30">
                    <div className="flex items-center gap-3">
                        <Shield className="text-purple-600 dark:text-purple-400" size={20} />
                        <div>
                            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{claims.length}</p>
                            <p className="text-xs text-purple-500 dark:text-purple-400">Tổng đơn bảo hành</p>
                        </div>
                    </div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-100 dark:border-orange-800/30">
                    <div className="flex items-center gap-3">
                        <Clock className="text-orange-600 dark:text-orange-400" size={20} />
                        <div>
                            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                                {claims.filter((c: any) => !['HOAN_THANH', 'DONG'].includes(c.trangThai)).length}
                            </p>
                            <p className="text-xs text-orange-500 dark:text-orange-400">Đang xử lý</p>
                        </div>
                    </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800/30">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                        <div>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                {claims.filter((c: any) => ['HOAN_THANH', 'DONG'].includes(c.trangThai)).length}
                            </p>
                            <p className="text-xs text-green-500 dark:text-green-400">Đã hoàn thành</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Claims list */}
            <Card className="overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight text-sm">Danh sách đơn bảo hành</h3>
                </div>
                {claims.length === 0 ? (
                    <div className="p-12">
                        <EmptyState
                            title="Chưa có yêu cầu bảo hành"
                            description="Khi khách hàng gửi yêu cầu bảo hành, đơn sẽ hiển thị tại đây."
                            icon={Shield}
                            className="border-none bg-transparent shadow-none"
                        />
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {claims.map((claim: any) => {
                            const st = statusMap[claim.trangThai] || { label: claim.trangThai, color: 'bg-slate-100 text-slate-600' };
                            const isExpanded = expandedId === claim.id;
                            return (
                                <div key={claim.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <div
                                        className="px-6 py-4 flex items-center justify-between cursor-pointer"
                                        onClick={() => setExpandedId(isExpanded ? null : claim.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                                <Shield className="text-purple-600 dark:text-purple-400" size={18} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">ĐBH#{claim.id}</span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                    <span className="flex items-center gap-1"><Car size={12} />{claim.plate}</span>
                                                    <span>{claim.customer}</span>
                                                    <span className="flex items-center gap-1"><Phone size={10} />{claim.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {claim.ngayTao ? new Date(claim.ngayTao).toLocaleDateString('vi-VN') : ''}
                                                </p>
                                                <p className="text-xs text-slate-400">{claim.warrantyItemCount} hạng mục BH</p>
                                            </div>
                                            {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                        </div>
                                    </div>
                                    {isExpanded && (
                                        <div className="px-6 pb-4">
                                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 flex items-center justify-between">
                                                <div className="text-sm text-slate-600 dark:text-slate-300">
                                                    <p>Số hạng mục bảo hành: <strong>{claim.warrantyItemCount}</strong></p>
                                                    <p>Tổng cộng: <strong>{claim.tongCong ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(claim.tongCong) : '0 ₫'}</strong></p>
                                                </div>
                                                <Link
                                                    href={`/sale/orders/${claim.id}`}
                                                    className="text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
                                                >
                                                    <Eye size={14} /> Xem chi tiết
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </DashboardLayout>
    );
}
