'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/modules/common/components/layout';
import { AdvancedDataTable } from '@/modules/shared/components/ui/AdvancedDataTable';
import { Button } from '@/modules/shared/components/ui/button';
import { Activity, Car, User, Clock, ArrowRight } from 'lucide-react';
import { getStatusBadge } from '@/lib/status';
import { formatCurrency } from '@/lib/utils';
import { receptionService } from '@/modules/reception/services/reception';
import Timeline from '@/modules/shared/components/common/Timeline';
import { usePermission } from '@/hooks/usePermission';
import BaseAvatar from '@/modules/shared/components/common/BaseAvatar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/modules/shared/components/ui/dialog';

export default function OrderTimelinesPage() {
    const { isAdmin } = usePermission();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    // Queries
    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['admin_timelines'],
        queryFn: () => receptionService.getReceptions()
    });

    const filteredOrders = orders.filter((o: any) => 
        o.code?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            header: 'Mã đơn',
            accessorKey: 'code',
            render: (value: string) => (
                <div className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    #{value}
                </div>
            )
        },
        {
            header: 'Khách hàng',
            accessorKey: 'customerName',
            className: 'hidden sm:table-cell',
            render: (value: string, order: any) => (
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{value}</p>
                        <p className="text-[10px] text-slate-500">{order.customerPhone || 'N/A'}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Phương tiện',
            accessorKey: 'plate',
            className: 'hidden md:table-cell',
            render: (value: string, order: any) => (
                <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-slate-400" />
                    <div>
                        <p className="font-bold font-mono text-slate-800 dark:text-slate-100 text-[13px]">{value}</p>
                        <p className="text-[10px] text-slate-500">{order.vehicleBrand} {order.vehicleModel}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Nhân sự phụ trách',
            accessorKey: 'advisorName',
            className: 'hidden lg:table-cell',
            render: (value: string, order: any) => (
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <BaseAvatar src={order.advisorAvatar} name={value} size="sm" showStatus={false} showBorder={false} />
                        <div>
                            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{value}</p>
                            <p className="text-[9px] text-slate-400">Cố vấn dịch vụ</p>
                        </div>
                    </div>
                    {order.thoChanDoanName && (
                        <div className="flex items-center gap-2">
                            <BaseAvatar src={order.foremanAvatar} name={order.thoChanDoanName} size="sm" showStatus={false} showBorder={false} />
                            <div>
                                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{order.thoChanDoanName}</p>
                                <p className="text-[9px] text-slate-400">Quản đốc</p>
                            </div>
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Trạng thái',
            accessorKey: 'orderStatus',
            className: 'text-center',
            render: (value: string) => {
                return getStatusBadge(value);
            }
        },
        {
            header: 'Thao tác',
            accessorKey: 'id',
            className: 'text-right',
            render: (value: any, order: any) => (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }} 
                    className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 gap-1.5 text-xs font-bold"
                >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Timeline</span>
                    <ArrowRight className="w-3 h-3" />
                </Button>
            )
        }
    ];

    if (!isAdmin) {
        return (
            <DashboardLayout title="Tiến trình đơn" subtitle="Giám sát luồng hoạt động đơn hàng">
                <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur rounded-3xl border border-slate-200">
                    <Activity className="w-16 h-16 text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-800">Không có quyền truy cập</h3>
                    <p className="text-slate-500 mt-2">Chỉ Quản trị viên (ADMIN) mới có quyền truy cập tính năng giám sát này.</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Giám sát Tiến trình đơn" subtitle="Theo dõi toàn bộ lịch sử hoạt động và ghi chú của các đơn hàng">
            <div className="max-w-7xl mx-auto space-y-6">
                <AdvancedDataTable
                    data={filteredOrders}
                    columns={columns}
                    isLoading={isLoading}
                    searchPlaceholder="Tìm theo mã đơn, biển số, tên khách hàng..."
                    onSearch={setSearchTerm}
                    emptyState={{
                        title: 'Không có đơn hàng nào',
                        description: 'Chưa có dữ liệu đơn hàng hiển thị.'
                    }}
                />
            </div>

            {/* Timeline Dialog Viewer */}
            <Dialog open={!!selectedOrder} onOpenChange={(open: boolean) => !open && setSelectedOrder(null)}>
                <DialogContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl p-0 flex flex-col bg-slate-50 dark:bg-slate-900 border-none shadow-2xl h-[90vh] sm:h-[80vh] overflow-hidden">
                    <div className="p-6 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex-none sticky top-0 z-10">
                        <DialogHeader className="text-left space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                                        <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                            Lịch sử Đơn #{selectedOrder?.code}
                                            {selectedOrder && getStatusBadge(selectedOrder.orderStatus)}
                                        </DialogTitle>
                                        <p className="text-xs font-medium mt-1 text-slate-500">
                                            {selectedOrder?.plate} • {selectedOrder?.customerName}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm relative h-full">
                            {selectedOrder && (
                                <Timeline 
                                    receptionId={selectedOrder.id} 
                                    readOnly={true} // ADMIN chỉ xem, không thêm note để tránh nhiễu luồng nghiệp vụ
                                />
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
