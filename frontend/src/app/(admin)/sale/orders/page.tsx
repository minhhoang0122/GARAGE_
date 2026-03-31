'use client';

import { useState, Suspense } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import Link from 'next/link';
import { ArrowRight, FileText, Banknote, Calendar, Car } from 'lucide-react';
import { formatCurrency, formatFullName } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOrders } from '@/modules/sale/hooks/useSale';
import { useRealtimeUpdate } from '@/hooks/useRealtimeUpdate';
import { queryKeys } from '@/lib/query-keys';
import { AdvancedDataTable } from '../../../../modules/shared/components/ui/AdvancedDataTable';
import { StatusBadge } from '@/modules/shared/components/ui/StatusBadge';
import BaseAvatar from '@/modules/shared/components/common/BaseAvatar';
import { ROLE_DISPLAY_NAMES } from '@/config/menu';

function OrderListPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState('Tất cả');

    const { data: orders = [], isLoading: loading } = useOrders();

    useRealtimeUpdate(queryKeys.order.all);
    useRealtimeUpdate(['sale', 'stats']);

    // Status Tabs definition
    const tabs = [
        { id: 'Tất cả', label: 'Tất cả' },
        { id: 'NEW', label: 'Mới' },
        { id: 'IN_PROGRESS', label: 'Đang sửa' },
        { id: 'WAITING_FOR_PAYMENT', label: 'Chờ thanh toán' },
        { id: 'COMPLETED', label: 'Hoàn thành' },
        { id: 'CANCELLED', label: 'Đã hủy' },
    ];

    // Filter logic
    const filteredOrders = orders.filter((o: any) => {
        if (activeTab === 'Tất cả') return true;
        return o.status === activeTab;
    });

    // Column definitions
    const columns: any[] = [
        {
            header: 'Đơn hàng',
            accessorKey: 'id',
            className: 'w-[120px]',
            render: (value: any, row: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-blue-600 dark:text-blue-400">#{value}</span>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(row.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                </div>
            )
        },
        {
            header: 'Xe & Khách hàng',
            accessorKey: 'plate',
            render: (value: any, row: any) => (
                <div className="flex flex-col sm:min-w-[200px] min-w-0 break-words items-end md:items-start text-right md:text-left">
                    <div className="flex items-center justify-end md:justify-start gap-2">
                        <Car className="w-4 h-4 text-slate-400" />
                        <span className="font-bold text-slate-900 dark:text-slate-100 uppercase break-all">{value}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 whitespace-normal text-right md:text-left">{formatFullName(row.customerName)}</span>
                    <span className="text-[10px] text-slate-400 italic font-medium whitespace-normal text-right md:text-left">{row.vehicleBrand} {row.vehicleModel}</span>
                </div>
            )
        },
        {
            header: ROLE_DISPLAY_NAMES.SALE,
            accessorKey: 'saleName',
            className: 'w-[140px]',
            render: (value: any, row: any) => (
                <div className="flex items-center gap-2 group/sale">
                    <BaseAvatar 
                        name={value} 
                        id={row.nguoiPhuTrachId} 
                        src={row.saleAvatar}
                        size="xs" 
                        showStatus={false}
                        showBorder={false}
                        className="transition-all shadow-sm"
                    />
                    <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate leading-none mb-0.5">{value}</span>
                        <span className="text-[8px] font-semibold text-blue-500 uppercase tracking-tighter">{ROLE_DISPLAY_NAMES.SALE}</span>
                    </div>
                </div>
            )
        },
        {
            header: ROLE_DISPLAY_NAMES.QUAN_LY_XUONG,
            accessorKey: 'thoChanDoanName',
            className: 'w-[140px]',
            render: (value: any, row: any) => (
                <div className="flex items-center gap-2 group/mgr">
                    <BaseAvatar 
                        name={row.thoChanDoanName || 'Chưa chỉ định'} 
                        id={row.thoChanDoanId}
                        src={row.foremanAvatar}
                        isUnassigned={!row.thoChanDoanId}
                        size="xs" 
                        showStatus={false}
                        showBorder={false}
                        className="transition-all shadow-sm"
                    />
                    <div className="flex flex-col min-w-0">
                        <span className={`text-[11px] font-bold truncate leading-none mb-0.5 ${!row.thoChanDoanId ? 'text-slate-400 italic font-medium' : 'text-slate-700 dark:text-slate-200'}`}>
                            {row.thoChanDoanName || 'Chưa chỉ định'}
                        </span>
                        <span className={`text-[8px] font-semibold uppercase tracking-tighter ${!row.thoChanDoanId ? 'text-slate-300' : 'text-emerald-500'}`}>
                            {ROLE_DISPLAY_NAMES.QUAN_LY_XUONG}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Trạng thái',
            accessorKey: 'status',
            className: 'w-[160px]',
            render: (value: any) => <StatusBadge status={value} />
        },
        {
            header: 'Tổng tiền',
            accessorKey: 'grandTotal',
            className: 'text-right font-bold',
            render: (value: any) => (
                <div className="flex flex-col items-end">
                    <span className="text-slate-900 dark:text-slate-100">
                        {formatCurrency(Number(value))}
                    </span>
                </div>
            )
        },
        {
            header: 'Còn nợ',
            accessorKey: 'debt',
            className: 'text-right',
            render: (value: any) => {
                const debt = Number(value);
                if (debt > 0) {
                    return (
                        <div className="flex flex-col items-end">
                            <span className="text-rose-600 font-bold">{formatCurrency(debt)}</span>
                            <div className="flex items-center gap-1 text-[9px] text-rose-400 font-bold uppercase">
                                <Banknote className="w-3 h-3" />
                                Unpaid
                            </div>
                        </div>
                    );
                }
                return (
                    <div className="flex flex-col items-end">
                        <span className="text-emerald-500 font-bold uppercase text-[10px] bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">Paid</span>
                    </div>
                );
            }
        },
        {
            header: '',
            accessorKey: 'id',
            className: 'w-[50px] text-right',
            render: (value: any) => (
                <Link
                    href={`/sale/orders/${value}?source=list`}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-all"
                >
                    <ArrowRight className="w-5 h-5" />
                </Link>
            )
        }
    ];

    return (
        <DashboardLayout 
            title="Danh sách đơn hàng" 
            subtitle="Quản lý chi tiết các đơn hàng dịch vụ và trạng thái thanh toán"
        >
            <AdvancedDataTable
                data={filteredOrders}
                columns={columns}
                isLoading={loading}
                searchPlaceholder="Tìm theo biển số, tên khách hàng..."
                searchFields={['plate', 'customerName', 'id']}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                emptyState={{
                    title: 'Không tìm thấy đơn hàng nào',
                    description: 'Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem kết quả khác.',
                    icon: <FileText className="w-12 h-12" />
                }}
            />
        </DashboardLayout>
    );
}

export default function OrderListPage() {
    return (
        <Suspense fallback={
            <DashboardLayout title="Danh sách đơn hàng" subtitle="Đang tải dữ liệu...">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex flex-col items-center gap-4">
                        <FileText className="w-10 h-10 text-blue-600 animate-pulse opacity-20" />
                        <p className="text-slate-500 font-medium">Đang chuẩn bị danh sách đơn hàng...</p>
                    </div>
                </div>
            </DashboardLayout>
        }>
            <OrderListPageContent />
        </Suspense>
    );
}
