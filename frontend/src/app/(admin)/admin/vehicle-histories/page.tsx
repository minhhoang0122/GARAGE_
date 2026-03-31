'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/modules/common/components/layout';
import { AdvancedDataTable } from '@/modules/shared/components/ui/AdvancedDataTable';
import { Button } from '@/modules/shared/components/ui/button';
import { Badge } from '@/modules/shared/components/ui/badge';
import { Car, User, Wrench, AlertTriangle, CalendarClock, Gauge, ChevronRight, ShieldCheck, Clock } from 'lucide-react';
import { format, isPast, isBefore, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { usePermission } from '@/hooks/usePermission';
import { vehicleHistoryService, type VehicleHistoryItem, type VehicleTimelineResponse, type ServiceVisit, type TimelineEvent } from '@/modules/reception/services/vehicleHistory';
import BaseAvatar from '@/modules/shared/components/common/BaseAvatar';
import { getStatusBadge } from '@/lib/status';
import { ROLE_DISPLAY_NAMES } from '@/config/menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/modules/shared/components/ui/sheet';
import {
    PlusCircle,
    Trash2,
    RefreshCcw,
    CheckCircle2,
    MessageSquare,
    Filter,
} from 'lucide-react';

export default function VehicleHistoriesPage() {
    const { isAdmin, hasRole } = usePermission();
    const isSale = hasRole('SALE');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

    // Main vehicle list query
    const { data: vehicles = [], isLoading } = useQuery({
        queryKey: ['admin_vehicles', searchTerm],
        queryFn: () => vehicleHistoryService.getVehicles(searchTerm || undefined),
    });

    // Vehicle timeline detail query (only when a vehicle is selected)
    const { data: vehicleTimeline, isLoading: isTimelineLoading } = useQuery({
        queryKey: ['vehicle_timeline', selectedVehicleId],
        queryFn: () => vehicleHistoryService.getVehicleTimeline(selectedVehicleId!),
        enabled: !!selectedVehicleId,
    });

    // Maintenance status helpers
    const getMaintenanceStatus = (vehicle: VehicleHistoryItem) => {
        const now = new Date();
        let isOverdue = false;
        let isWarning = false;

        if (vehicle.nextMaintenanceDate) {
            const nextDate = new Date(vehicle.nextMaintenanceDate);
            if (isPast(nextDate)) isOverdue = true;
            else if (isBefore(nextDate, addDays(now, 30))) isWarning = true;
        }
        if (vehicle.nextMaintenanceOdo && vehicle.currentOdo) {
            const remaining = vehicle.nextMaintenanceOdo - vehicle.currentOdo;
            if (remaining <= 0) isOverdue = true;
            else if (remaining <= 500) isWarning = true;
        }

        if (isOverdue) return 'overdue';
        if (isWarning) return 'warning';
        return 'ok';
    };

    const getMaintenanceBadge = (vehicle: VehicleHistoryItem) => {
        const status = getMaintenanceStatus(vehicle);
        if (status === 'overdue') return <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-[10px] font-bold gap-1"><AlertTriangle className="w-3 h-3" />Quá hạn</Badge>;
        if (status === 'warning') return <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] font-bold gap-1"><CalendarClock className="w-3 h-3" />Sắp đến hạn</Badge>;
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] font-bold gap-1"><ShieldCheck className="w-3 h-3" />Bình thường</Badge>;
    };

    const columns = [
        {
            header: 'Biển số',
            accessorKey: 'licensePlate',
            render: (value: string, row: VehicleHistoryItem) => (
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <Car className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="font-black font-mono text-blue-700 dark:text-blue-300 text-[13px] tracking-wider">{value}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{row.brand} {row.model}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Chủ xe',
            accessorKey: 'customerName',
            className: 'hidden sm:table-cell',
            render: (value: string, row: VehicleHistoryItem) => (
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-[12px]">{value}</p>
                        <p className="text-[10px] text-slate-500">{row.customerPhone || '---'}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'ODO hiện tại',
            accessorKey: 'currentOdo',
            className: 'hidden md:table-cell text-center',
            render: (value: number) => (
                <div className="flex items-center justify-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">{value?.toLocaleString() || 0} km</span>
                </div>
            )
        },
        {
            header: 'Lần vào gần nhất',
            accessorKey: 'lastServiceDate',
            className: 'hidden lg:table-cell',
            render: (value: string | null) => (
                <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {value ? format(new Date(value), 'dd/MM/yyyy', { locale: vi }) : 'Chưa có'}
                    </span>
                </div>
            )
        },
        {
            header: 'Bảo dưỡng',
            accessorKey: 'nextMaintenanceDate',
            className: 'hidden xl:table-cell',
            render: (_: any, row: VehicleHistoryItem) => (
                <div className="flex flex-col gap-1">
                    {getMaintenanceBadge(row)}
                    {row.nextMaintenanceOdo && (
                        <span className="text-[9px] text-slate-400 font-medium">
                            Tiếp theo: {row.nextMaintenanceOdo.toLocaleString()} km
                        </span>
                    )}
                </div>
            )
        },
        {
            header: '',
            accessorKey: 'id',
            className: 'text-right',
            render: (value: number) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); setSelectedVehicleId(value); }}
                    className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs font-bold gap-1"
                >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Hồ sơ</span>
                    <ChevronRight className="w-3 h-3" />
                </Button>
            )
        },
    ];

    // Permission guard
    if (!isAdmin && !isSale) {
        return (
            <DashboardLayout title="Hồ sơ Xe" subtitle="Tra cứu lịch sử bảo dưỡng">
                <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur rounded-3xl border border-slate-200">
                    <Car className="w-16 h-16 text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-800">Không có quyền truy cập</h3>
                    <p className="text-slate-500 mt-2">Chỉ Quản trị viên và Cố vấn dịch vụ mới có quyền truy cập tính năng này.</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Hồ sơ Lịch sử Xe" subtitle="Tra cứu lịch sử bảo dưỡng và nhắc lịch chăm sóc định kỳ">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SummaryCard
                        icon={<Car className="w-5 h-5 text-blue-600" />}
                        label="Tổng số xe"
                        value={vehicles.length}
                        bg="bg-blue-50"
                    />
                    <SummaryCard
                        icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
                        label="Quá hạn bảo dưỡng"
                        value={vehicles.filter((v: VehicleHistoryItem) => getMaintenanceStatus(v) === 'overdue').length}
                        bg="bg-rose-50"
                        textColor="text-rose-700"
                    />
                    <SummaryCard
                        icon={<CalendarClock className="w-5 h-5 text-amber-600" />}
                        label="Sắp đến hạn"
                        value={vehicles.filter((v: VehicleHistoryItem) => getMaintenanceStatus(v) === 'warning').length}
                        bg="bg-amber-50"
                        textColor="text-amber-700"
                    />
                </div>

                {/* Data Table */}
                <AdvancedDataTable
                    data={vehicles}
                    columns={columns}
                    isLoading={isLoading}
                    searchPlaceholder="Tìm theo biển số, tên chủ xe..."
                    onSearch={setSearchTerm}
                    emptyState={{
                        title: 'Chưa có dữ liệu xe',
                        description: 'Xe sẽ xuất hiện sau khi có đơn tiếp nhận đầu tiên.',
                    }}
                />
            </div>

            {/* Vehicle History Drawer (Sheet) */}
            <Sheet open={!!selectedVehicleId} onOpenChange={(open: boolean) => !open && setSelectedVehicleId(null)}>
                <SheetContent side="right" className="w-full sm:max-w-lg lg:max-w-xl p-0 flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden">
                    {/* Header */}
                    <SheetHeader className="p-6 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex-none">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-100 flex-shrink-0">
                                <Car className="w-5.5 h-5.5 text-white" />
                            </div>
                            <div>
                                <SheetTitle className="text-lg font-black text-slate-900 dark:text-white">
                                    {vehicleTimeline?.vehicle.licensePlate || 'Đang tải...'}
                                </SheetTitle>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    {vehicleTimeline?.vehicle.brand} {vehicleTimeline?.vehicle.model} • {vehicleTimeline?.vehicle.customerName}
                                </p>
                            </div>
                        </div>
                    </SheetHeader>

                    {/* Maintenance Reminder Widget */}
                    {vehicleTimeline && (
                        <div className="mx-6 mt-4 p-4 rounded-xl bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-100 dark:border-indigo-800">
                            <div className="flex items-center gap-2 mb-3">
                                <CalendarClock className="w-4 h-4 text-indigo-600" />
                                <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Nhắc bảo dưỡng định kỳ</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-indigo-100 dark:border-indigo-700">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Mốc km tiếp theo</p>
                                    <p className="text-lg font-black text-indigo-700 dark:text-indigo-300">
                                        {vehicleTimeline.nextMaintenanceOdo
                                            ? `${vehicleTimeline.nextMaintenanceOdo.toLocaleString()} km`
                                            : '---'}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        ODO hiện tại: {vehicleTimeline.vehicle.currentOdo?.toLocaleString() || 0} km
                                    </p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-indigo-100 dark:border-indigo-700">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Ngày tiếp theo</p>
                                    <p className="text-lg font-black text-indigo-700 dark:text-indigo-300">
                                        {vehicleTimeline.nextMaintenanceDate
                                            ? format(new Date(vehicleTimeline.nextMaintenanceDate), 'dd/MM/yyyy')
                                            : '---'}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        Chu kỳ: 6 tháng / 5,000 km
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Grouped Timeline */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-200">
                        {isTimelineLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="animate-spin w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full" />
                            </div>
                        ) : vehicleTimeline?.serviceVisits.length === 0 ? (
                            <div className="text-center py-16 text-slate-400 italic text-sm">
                                Xe chưa có lịch sử bảo dưỡng nào.
                            </div>
                        ) : (
                            vehicleTimeline?.serviceVisits.map((visit: ServiceVisit, visitIdx: number) => (
                                <div key={visit.receptionId} className="relative">
                                    {/* Visit Header - Divider */}
                                    <div className="sticky top-0 z-10 flex items-center gap-3 mb-3">
                                        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                                            <div className={`w-2.5 h-2.5 rounded-full ${visitIdx === 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                            <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                                                Đợt {vehicleTimeline!.serviceVisits.length - visitIdx}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-medium">
                                                {visit.receptionDate ? format(new Date(visit.receptionDate), 'dd/MM/yyyy HH:mm', { locale: vi }) : ''}
                                            </span>
                                            {visit.orderStatus && getStatusBadge(visit.orderStatus)}
                                        </div>
                                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                    </div>

                                    {/* ODO info */}
                                    {visit.odo && (
                                        <div className="ml-4 mb-2 text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
                                            <Gauge className="w-3 h-3" />
                                            ODO khi vào: <span className="font-bold text-slate-600">{visit.odo.toLocaleString()} km</span>
                                        </div>
                                    )}

                                    {/* Events */}
                                    <div className="space-y-2 ml-2 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                                        {visit.events.map((event: TimelineEvent, idx: number) => {
                                            const isNote = event.actionType === 'NOTE';
                                            return (
                                                <div key={event.id || idx} className={`p-3 rounded-xl border transition-all duration-200 ${
                                                    isNote
                                                        ? 'bg-white border-indigo-200 ring-1 ring-indigo-50 shadow-sm'
                                                        : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                                                }`}>
                                                    <div className="flex justify-between items-start gap-2 mb-2">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="p-1 px-2 rounded-md bg-slate-50 border border-slate-100 text-[9px] font-bold text-slate-500 flex items-center gap-1">
                                                                {getActionIcon(event.actionType)}
                                                                {event.actionType}
                                                            </span>
                                                        </div>
                                                        <time className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                                                            {format(new Date(event.createdAt), 'HH:mm - dd/MM', { locale: vi })}
                                                        </time>
                                                    </div>
                                                    <p className={`text-[12px] leading-relaxed mb-2.5 ${isNote ? 'text-slate-900 font-semibold' : 'text-slate-600 font-medium'}`}>
                                                        {event.content}
                                                    </p>
                                                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100/80">
                                                        <BaseAvatar
                                                            id={event.actorId}
                                                            src={event.actorAvatar}
                                                            name={event.actorName || 'Hệ thống'}
                                                            size="xs"
                                                            showStatus={false}
                                                            showBorder={false}
                                                        />
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-[10px] font-bold text-slate-800 dark:text-slate-100 truncate">{event.actorName || 'Hệ thống'}</span>
                                                            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium truncate">
                                                                {ROLE_DISPLAY_NAMES[String(event.actorRole || '').toUpperCase()] || event.actorRole || 'Nhân viên'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </DashboardLayout>
    );
}

// --- Helper Components ---

function SummaryCard({ icon, label, value, bg, textColor }: { icon: React.ReactNode; label: string; value: number; bg: string; textColor?: string }) {
    return (
        <div className={`${bg} rounded-xl p-4 border border-slate-200/50 flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center shadow-sm">{icon}</div>
            <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                <p className={`text-2xl font-black ${textColor || 'text-slate-800'}`}>{value}</p>
            </div>
        </div>
    );
}

function getActionIcon(type: string) {
    switch (type) {
        case 'ADD_ITEM': return <PlusCircle className="w-3 h-3 text-emerald-500" />;
        case 'DELETE_ITEM': return <Trash2 className="w-3 h-3 text-rose-500" />;
        case 'UPDATE_ITEM': return <RefreshCcw className="w-3 h-3 text-sky-500" />;
        case 'STATUS_CHANGE': return <Clock className="w-3 h-3 text-amber-500" />;
        case 'NOTE': return <MessageSquare className="w-3 h-3 text-indigo-500" />;
        default: return <Clock className="w-3 h-3 text-slate-400" />;
    }
}
