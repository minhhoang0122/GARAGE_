'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { Car, FileText, CheckCircle, Shield, ArrowRight, Plus, Clock, User } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import { getStatusBadge } from '@/lib/status';
import IndustrialStatCard from '@/modules/shared/components/common/IndustrialStatCard';
import { Card } from '@/modules/shared/components/ui/card';
import { EmptyState } from '@/modules/shared/components/ui/empty-state';
import { useRouter } from 'next/navigation';

// Vehicle Row Component - Artisanal Technical Redesign
function VehicleRow({ id, plate, customer, time, status, user, odo }: {
    id: number; plate: string; customer: string; time: string; status: string; user?: string; odo?: number;
}) {
    return (
        <Link href={`/sale/reception/${id}`} className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all border-l-4 border-transparent hover:border-slate-900 dark:hover:border-white group cursor-pointer block">
            <div className="flex items-center gap-4">
                {/* Mini License Plate Visual */}
                <div className="flex flex-col items-center">
                    <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1 transition-all">
                        <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">{plate}</span>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <h4 className="text-[13px] font-semibold text-slate-900 dark:text-white uppercase tracking-tight">{customer}</h4>
                            {user && (
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                    <User className="w-3 h-3" /> {user}
                                </p>
                            )}
                        </div>
                    </div>
                    {odo && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                            Technical Stat: <span className="text-slate-900 dark:text-slate-200">{odo.toLocaleString()} KM</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-2 text-[10px] font-black px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    <Clock className="w-3 h-3" /> {time}
                </div>
                {getStatusBadge(status)}
            </div>
        </Link>
    );
}

// Order Row Component - Modernized
function OrderRow({ id, plate, amount, status }: {
    id: string; plate: string; amount: string;
    status: string;
}) {
    return (
        <Link href={`/sale/orders/${id.replace('DH', '')}?source=dashboard`} className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all border-l-4 border-transparent hover:border-slate-900 group cursor-pointer block">
            <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-400 uppercase tracking-tighter group-hover:tracking-normal transition-all">{id}</p>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight">{plate}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
                <p className="text-base font-bold text-slate-900 dark:text-white tabular-nums">{amount}</p>
                {getStatusBadge(status)}
            </div>
        </Link>
    );
}

import { useQuery } from '@tanstack/react-query';

// CLIENT COMPONENT with TanStack Query
export default function SaleDashboard() {
    const { data: session } = useSession();
    const router = useRouter(); // Added router
    // @ts-ignore
    const token = session?.user?.accessToken;

    const { data: stats = {
        countWaiting: 0,
        countPendingQuotes: 0,
        countPendingPayment: 0,
        countWarranty: 0,
        waitingVehicles: [],
        recentOrders: []
    } } = useQuery({
        queryKey: ['sale', 'stats'],
        queryFn: () => api.get('/sale/stats', token),
        enabled: !!token
    });

    const {
        countWaiting,
        countPendingQuotes,
        countPendingPayment,
        countWarranty,
        waitingVehicles,
        recentOrders
    } = stats;

    return (
        <DashboardLayout title="Dashboard" subtitle="Quản lý bán hàng và khách hàng">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
                <IndustrialStatCard icon={<Car />} value={countWaiting.toString()} label="Xe trong xưởng" color="blue" />
                <IndustrialStatCard icon={<FileText />} value={countPendingQuotes.toString()} label="Báo giá chờ duyệt" color="yellow" />
                <IndustrialStatCard icon={<CheckCircle />} value={countPendingPayment.toString()} label="Chờ thanh toán" color="green" />
                <IndustrialStatCard icon={<Shield />} value={countWarranty.toString()} label="Yêu cầu bảo hành" color="purple" />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Waiting Vehicles List */}
                <Card className="overflow-hidden flex flex-col h-full">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight text-sm">Xe mới tiếp nhận</h3>
                        <Link
                            href="/sale/reception/new"
                            className="text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1.5 rounded shadow-sm hover:translate-y-[-1px] transition-transform flex items-center gap-1.5"
                        >
                            <Plus className="w-3.5 h-3.5" /> TIẾP NHẬN
                        </Link>
                    </div>
                    <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800 min-h-[300px]">
                        {waitingVehicles.length === 0 ? (
                            <div className="h-full flex items-center justify-center p-6">
                                <EmptyState
                                    title="Chưa có xe mới"
                                    description="Hôm nay chưa có xe nào được tiếp nhận vào xưởng."
                                    icon={Car}
                                    actionLabel="Tiếp nhận ngay"
                                    onAction={() => router.push('/sale/reception/new')}
                                    className="border-none bg-transparent shadow-none p-0"
                                />
                            </div>
                        ) : (
                            waitingVehicles.map((v: any) => (
                                <VehicleRow
                                    key={v.ID}
                                    id={v.ID}
                                    plate={v.XeBienSo}
                                    customer={v.KhachHangName || v.KhachHang}
                                    time={new Date(v.ThoiGian || v.NgayGio).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    status={v.TrangThai || "TIEP_NHAN"}
                                    odo={v.ODO}
                                    user={v.NguoiTiepNhanName}
                                />
                            ))
                        )}
                    </div>
                </Card>

                {/* Recent Orders */}
                <Card className="overflow-hidden flex flex-col h-full">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight text-sm">Đơn hàng gần đây</h3>
                        <Link href="/sale/orders" className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1 transition-colors">
                            XEM TẤT CẢ <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800 min-h-[300px]">
                        {recentOrders.length === 0 ? (
                            <div className="h-full flex items-center justify-center p-6">
                                <EmptyState
                                    title="Chưa có đơn hàng"
                                    description="Các đơn hàng mới nhất sẽ hiển thị tại đây."
                                    icon={FileText}
                                    className="border-none bg-transparent shadow-none p-0"
                                />
                            </div>
                        ) : (
                            recentOrders.map((order: any) => (
                                <OrderRow
                                    key={order.ID}
                                    id={`DH${order.ID}`}
                                    plate={order.XeBienSo}
                                    amount={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(order.TongCong))}
                                    status={order.TrangThai}
                                />
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
