'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { DashboardLayout } from '@/modules/common/components/layout';
import { Plus, FileText, Car, Printer, RefreshCw, Eye, ExternalLink } from 'lucide-react';
import { EmptyState } from '@/modules/shared/components/ui/empty-state';
import Link from 'next/link';
import { api } from '@/lib/api';

import { StatusBadge } from '@/modules/shared/components/ui/StatusBadge';
import { AdvancedDataTable } from '../../../../modules/shared/components/ui/AdvancedDataTable';
import { ReceptionListSkeleton } from '@/modules/reception/components/ReceptionListSkeleton';
import BaseAvatar from '@/modules/shared/components/common/BaseAvatar';
import { useToast } from '@/contexts/ToastContext';
import { useReceptions, useUpdateReceptionStatus } from '@/modules/reception/hooks/useReception';
import { queryKeys } from '@/lib/query-keys';
import { useRealtimeUpdate } from '@/hooks/useRealtimeUpdate';
import { Reception } from '@/modules/reception/services/reception';
import { formatFullName } from '@/lib/utils';
import { ROLE_DISPLAY_NAMES } from '@/config/menu';

import { useRef } from 'react';

export default function ReceptionListPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { showToast } = useToast();

    const searchKeyword = searchParams.get('q') || '';

    const { data: receptions = [], isLoading: loading, refetch: loadReceptions } = useReceptions();
    useRealtimeUpdate(queryKeys.reception.all);

    const updateStatusMutation = useUpdateReceptionStatus();

    const [activeTab, setActiveTab] = useState('ALL');

    const tabs = [
        { id: 'ALL', label: 'Tất cả' },
        { id: 'WAITING_FOR_DIAGNOSIS', label: 'Chờ chẩn đoán' },
        { id: 'IN_PROGRESS', label: 'Đang sửa chữa' },
        { id: 'COMPLETED', label: 'Đã bàn giao' },
    ];

    const filteredReceptions = (receptions || []).filter((r: Reception) => {
        const matchesSearch = 
            r.plate?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            r.customerName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            r.customerPhone?.includes(searchKeyword);
        
        const currentStatus = r.orderStatus || r.status || 'RECEIVED';
        const matchesTab = activeTab === 'ALL' || currentStatus === activeTab;
        
        return matchesSearch && matchesTab;
    });

    const columns: any[] = [
        {
            header: 'Biển số & Thời gian',
            accessorKey: 'plate',
            render: (value: any, r: Reception) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Car className="w-5 h-5" />
                    </div>
                    <div>
                        <Link href={`/sale/reception/${r.id}`} className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 transition-colors">
                            {r.plate}
                        </Link>
                        <div className="text-[11px] text-slate-500">
                            {new Date(r.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • {new Date(r.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Khách hàng',
            accessorKey: 'customerName',
            render: (value: any, r: Reception) => (
                <div className="flex flex-col">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{formatFullName(r.customerName)}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{r.customerPhone}</div>
                </div>
            )
        },
        {
            header: 'Thông tin xe',
            accessorKey: 'vehicleBrand',
            render: (value: any, r: Reception) => (
                <div className="text-slate-600 dark:text-slate-300">
                    {r.vehicleBrand} {r.vehicleModel}
                </div>
            )
        },
        {
            header: ROLE_DISPLAY_NAMES.SALE,
            accessorKey: 'advisorName',
            className: 'w-[140px]',
            render: (value: any, r: Reception) => (
                <div className="flex items-center gap-2 group/sa">
                    <BaseAvatar 
                        name={r.advisorName} 
                        id={r.advisorId} 
                        src={r.advisorAvatar}
                        size="xs" 
                        showStatus={false}
                        showBorder={false}
                        className="transition-all shadow-sm"
                    />
                    <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate leading-none mb-0.5">{r.advisorName}</span>
                        <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-tighter">{ROLE_DISPLAY_NAMES.SALE}</span>
                    </div>
                </div>
            )
        },
        {
            header: ROLE_DISPLAY_NAMES.QUAN_LY_XUONG,
            accessorKey: 'thoChanDoanName',
            className: 'w-[140px]',
            render: (value: any, r: Reception) => (
                <div className="flex items-center gap-2 group/foreman">
                    <BaseAvatar 
                        name={r.thoChanDoanName || 'Chưa chỉ định'} 
                        id={r.thoChanDoanId}
                        src={r.foremanAvatar}
                        isUnassigned={!r.thoChanDoanName}
                        size="xs" 
                        showStatus={false}
                        showBorder={false}
                        className="transition-all shadow-sm"
                    />
                    <div className="flex flex-col min-w-0">
                        <span className={`text-[11px] font-bold truncate leading-none mb-0.5 ${!r.thoChanDoanName ? 'text-slate-400 italic font-medium' : 'text-slate-700 dark:text-slate-200'}`}>
                            {r.thoChanDoanName || 'Chưa chỉ định'}
                        </span>
                        <span className={`text-[8px] font-semibold uppercase tracking-tighter ${!r.thoChanDoanName ? 'text-slate-300' : 'text-emerald-500 dark:text-emerald-400'}`}>
                            {ROLE_DISPLAY_NAMES.QUAN_LY_XUONG}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Trạng thái',
            accessorKey: 'status',
            render: (value: any, r: Reception) => (
                <StatusBadge status={r.orderStatus || r.status || 'RECEIVED'} />
            )
        },
        {
            header: 'Thao tác',
            accessorKey: 'id',
            className: 'text-right',
            render: (value: any, r: Reception) => (
                <div className="flex items-center justify-end gap-2">
                    <Link
                        href={`/sale/reception/${r.id}`}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
                        title="Xem chi tiết"
                    >
                        <Eye className="w-4 h-4" />
                    </Link>
                    {r.orderId && (
                        <Link
                            href={`/sale/orders/${r.orderId}?source=reception`}
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-all"
                        >
                            Đơn hàng
                        </Link>
                    )}
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="Tiếp nhận xe" subtitle="Danh sách xe đã tiếp nhận">
            <div className="space-y-4">
                <AdvancedDataTable
                    data={filteredReceptions}
                    columns={columns}
                    isLoading={loading}
                    searchPlaceholder="Tìm theo biển số, tên khách hàng..."
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onSearch={(val: string) => {
                        const params = new URLSearchParams(searchParams);
                        if (val) params.set('q', val);
                        else params.delete('q');
                        router.push(`${pathname}?${params.toString()}`);
                    } }
                    emptyState={{
                        title: searchKeyword ? 'Không tìm thấy kết quả nào' : 'Chưa có phiếu tiếp nhận nào',
                        description: searchKeyword ? `Không tìm thấy phiếu nào khớp với từ khóa "${searchKeyword}"` : "Bắt đầu bằng cách tạo phiếu tiếp nhận mới cho khách hàng đến sửa chữa.",
                        icon: <FileText className="w-12 h-12" />
                    }}
                    actionButton={
                        <div className="flex gap-2">
                             <button
                                onClick={() => loadReceptions()}
                                className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                disabled={loading}
                            >
                                <RefreshCw className={`w-5 h-5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                            <Link
                                href="/sale/reception/new"
                                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-sm font-bold hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 transition-all shadow-premium-sm"
                            >
                                <Plus className="w-5 h-5" />
                                Tiếp nhận xe mới
                            </Link>
                        </div>
                    }
                />
            </div>
        </DashboardLayout>
    );
}

