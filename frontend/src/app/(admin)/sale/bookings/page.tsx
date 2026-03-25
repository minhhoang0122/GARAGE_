'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import {
    CalendarCheck, Clock, Car, Phone, User, Eye, CheckCircle, Loader2,
    ArrowRight, List, CalendarDays, ChevronLeft, ChevronRight, GripVertical, X
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import { Card } from '@/modules/shared/components/ui/card';
import { EmptyState } from '@/modules/shared/components/ui/empty-state';
import Link from 'next/link';
import {
    startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, format, isSameMonth, isSameDay, isToday,
    addMonths, subMonths, parseISO
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ─── Status helpers ───
const bookingStatusMap = (booking: any): { label: string; color: string; dot: string } => {
    if (booking.hasOrder && booking.orderStatus) {
        return { label: 'Đã tiếp nhận', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', dot: 'bg-green-500' };
    }
    if (booking.ngayHen) {
        const hen = new Date(booking.ngayHen);
        if (!isNaN(hen.getTime()) && hen < new Date()) {
            return { label: 'Quá hẹn', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', dot: 'bg-red-500' };
        }
    }
    return { label: 'Chờ tiếp nhận', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-500' };
};

const getBookingDate = (b: any): string => {
    if (b.ngayHen) {
        // ngayHen may be "2026-03-25" or "25/03/2026"
        const parsed = parseBookingDate(b.ngayHen);
        if (parsed) return format(parsed, 'yyyy-MM-dd');
    }
    if (b.ngayGio) {
        const d = new Date(b.ngayGio);
        if (!isNaN(d.getTime())) return format(d, 'yyyy-MM-dd');
    }
    return '';
};

const parseBookingDate = (s: string): Date | null => {
    if (!s) return null;
    // Try ISO first
    try {
        const d = parseISO(s);
        if (!isNaN(d.getTime())) return d;
    } catch { }
    // Try dd/MM/yyyy
    const parts = s.split('/');
    if (parts.length === 3) {
        const d = new Date(+parts[2], +parts[1] - 1, +parts[0]);
        if (!isNaN(d.getTime())) return d;
    }
    return null;
};

// ─── Calendar View Component ───
function CalendarView({ bookings, onReschedule, token }: {
    bookings: any[]; onReschedule: (id: number, newDate: string) => void; token: string;
}) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [dragOverDate, setDragOverDate] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [draggingId, setDraggingId] = useState<number | null>(null);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: calStart, end: calEnd });

    const bookingsByDate = useMemo(() => {
        const map: Record<string, any[]> = {};
        bookings.forEach(b => {
            const key = getBookingDate(b);
            if (key) {
                if (!map[key]) map[key] = [];
                map[key].push(b);
            }
        });
        return map;
    }, [bookings]);

    const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    const selectedBookings = selectedDate ? (bookingsByDate[selectedDate] || []) : [];

    return (
        <div className="space-y-4">
            {/* Calendar header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400" />
                    </button>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white  text-center">
                        {format(currentMonth, 'MMMM yyyy', { locale: vi })}
                    </h3>
                    <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ChevronRight size={18} className="text-slate-600 dark:text-slate-400" />
                    </button>
                </div>
                <button
                    onClick={() => setCurrentMonth(new Date())}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                >
                    Hôm nay
                </button>
            </div>

            {/* Calendar grid */}
            <Card className="overflow-hidden">
                {/* Week day headers */}
                <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
                    {weekDays.map(d => (
                        <div key={d} className="py-2.5 text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7">
                    {days.map((day, i) => {
                        const key = format(day, 'yyyy-MM-dd');
                        const dayBookings = bookingsByDate[key] || [];
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isTodayDate = isToday(day);
                        const isSelected = selectedDate === key;
                        const isDragOver = dragOverDate === key;

                        return (
                            <div
                                key={i}
                                onClick={() => setSelectedDate(isSelected ? null : key)}
                                onDragOver={(e) => { e.preventDefault(); setDragOverDate(key); }}
                                onDragLeave={() => setDragOverDate(null)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragOverDate(null);
                                    const bookingId = parseInt(e.dataTransfer.getData('bookingId'));
                                    if (bookingId && !isNaN(bookingId)) {
                                        onReschedule(bookingId, key);
                                    }
                                }}
                                className={`
                                    min-h-[90px] p-1.5 border-b border-r border-slate-100 dark:border-slate-800 cursor-pointer
                                    transition-all duration-150
                                    ${!isCurrentMonth ? 'bg-slate-50/50 dark:bg-slate-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}
                                    ${isSelected ? 'ring-2 ring-indigo-500 ring-inset bg-indigo-50/50 dark:bg-indigo-900/10' : ''}
                                    ${isDragOver ? 'bg-indigo-100 dark:bg-indigo-900/30 ring-2 ring-indigo-400 ring-dashed ring-inset scale-[1.02]' : ''}
                                `}
                            >
                                <div className={`
                                    text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1
                                    ${isTodayDate ? 'bg-indigo-600 text-white' : ''}
                                    ${!isCurrentMonth ? 'text-slate-300 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300'}
                                `}>
                                    {format(day, 'd')}
                                </div>

                                {/* Booking dots / chips */}
                                <div className="space-y-0.5">
                                    {dayBookings.slice(0, 3).map((b: any) => {
                                        const st = bookingStatusMap(b);
                                        return (
                                            <div
                                                key={b.id}
                                                draggable={!b.hasOrder}
                                                onDragStart={(e) => {
                                                    e.dataTransfer.setData('bookingId', b.id.toString());
                                                    setDraggingId(b.id);
                                                }}
                                                onDragEnd={() => setDraggingId(null)}
                                                className={`
                                                    text-[9px] font-semibold px-1.5 py-0.5 rounded truncate flex items-center gap-1
                                                    ${st.color}
                                                    ${!b.hasOrder ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
                                                    ${draggingId === b.id ? 'opacity-40' : ''}
                                                    transition-opacity
                                                `}
                                                title={`${b.customer} - ${b.plate}`}
                                            >
                                                {!b.hasOrder && <GripVertical size={8} className="shrink-0 opacity-50" />}
                                                <span className="truncate">{b.plate || b.customer}</span>
                                            </div>
                                        );
                                    })}
                                    {dayBookings.length > 3 && (
                                        <div className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold pl-1">
                                            +{dayBookings.length - 3} khác
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Selected date detail panel */}
            {selectedDate && (
                <Card className="overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                            📅 {format(parseISO(selectedDate), 'EEEE, dd/MM/yyyy', { locale: vi })}
                            <span className="ml-2 text-xs font-normal text-slate-500">({selectedBookings.length} lịch hẹn)</span>
                        </h4>
                        <button onClick={() => setSelectedDate(null)} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <X size={14} className="text-slate-400" />
                        </button>
                    </div>
                    {selectedBookings.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-400">Không có lịch hẹn nào trong ngày này</div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {selectedBookings.map((booking: any) => {
                                const st = bookingStatusMap(booking);
                                return (
                                    <div key={booking.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-8 rounded-full ${st.dot}`} />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">LH#{booking.id}</span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                                    <span className="flex items-center gap-1"><Car size={11} />{booking.plate}</span>
                                                    <span className="flex items-center gap-1"><User size={10} />{booking.customer}</span>
                                                    <span className="flex items-center gap-1"><Phone size={10} />{booking.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {booking.hasOrder ? (
                                            <Link
                                                href={`/sale/orders/${booking.orderId}`}
                                                className="text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
                                            >
                                                <Eye size={12} /> Xem đơn
                                            </Link>
                                        ) : (
                                            <Link
                                                href={`/sale/reception/${booking.id}`}
                                                className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-500 transition-colors flex items-center gap-1"
                                            >
                                                Tiếp nhận <ArrowRight size={12} />
                                            </Link>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            )}

            {/* Drag hint */}
            <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <GripVertical size={12} /> Kéo thả lịch hẹn <span className="font-bold">"Chờ tiếp nhận"</span> sang ngày khác để đổi lịch nhanh
            </p>
        </div>
    );
}

// ─── Main Page Component ───
export default function SaleBookingsPage() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    // @ts-ignore
    const token = session?.user?.accessToken;

    const { data: bookings = [], isLoading } = useQuery({
        queryKey: ['bookings'],
        queryFn: async () => {
            return await api.get('/sale/bookings', token);
        },
        enabled: !!token
    });

    const rescheduleMutation = useMutation({
        mutationFn: async ({ bookingId, newDate }: { bookingId: number, newDate: string }) => {
            return await api.patch(`/sale/bookings/${bookingId}/reschedule`, { newDate }, token);
        },
        onSuccess: (data, variables) => {
            setToastMsg(`Đã đổi lịch LH#${variables.bookingId} sang ${variables.newDate}`);
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            setTimeout(() => setToastMsg(null), 3000);
        },
        onError: (err: any) => {
            setToastMsg(`Lỗi: ${err.message || 'Không thể đổi lịch'}`);
            setTimeout(() => setToastMsg(null), 3000);
        }
    });

    const handleReschedule = (bookingId: number, newDate: string) => {
        rescheduleMutation.mutate({ bookingId, newDate });
    };

    const filteredBookings = useMemo(() => {
        if (filter === 'pending') return bookings.filter((b: any) => !b.hasOrder);
        if (filter === 'done') return bookings.filter((b: any) => b.hasOrder);
        return bookings;
    }, [bookings, filter]);

    const pendingCount = useMemo(() => bookings.filter((b: any) => !b.hasOrder).length, [bookings]);
    const doneCount = useMemo(() => bookings.filter((b: any) => b.hasOrder).length, [bookings]);

    if (isLoading) {
        return (
            <DashboardLayout title="Quản lý đặt lịch" subtitle="Lịch hẹn từ khách hàng đặt online">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="animate-spin text-slate-400" size={28} />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Quản lý đặt lịch" subtitle="Lịch hẹn từ khách hàng đặt online">
            {/* Toast notification */}
            {toastMsg && (
                <div className="fixed top-4 right-4 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-xl shadow-xl text-sm font-semibold animate-in slide-in-from-right-5 duration-200 flex items-center gap-2">
                    <CalendarCheck size={16} /> {toastMsg}
                </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
                    <div className="flex items-center gap-3">
                        <CalendarCheck className="text-blue-600 dark:text-blue-400" size={20} />
                        <div>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{bookings.length}</p>
                            <p className="text-xs text-blue-500 dark:text-blue-400">Tổng lịch hẹn</p>
                        </div>
                    </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-800/30">
                    <div className="flex items-center gap-3">
                        <Clock className="text-amber-600 dark:text-amber-400" size={20} />
                        <div>
                            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{pendingCount}</p>
                            <p className="text-xs text-amber-500 dark:text-amber-400">Chờ tiếp nhận</p>
                        </div>
                    </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800/30">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                        <div>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{doneCount}</p>
                            <p className="text-xs text-green-500 dark:text-green-400">Đã tiếp nhận</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* View mode toggle + Filter */}
            <div className="flex items-center justify-between mb-4">
                {/* Filter tabs (only for list view) */}
                <div className="flex gap-2">
                    {viewMode === 'list' && (['all', 'pending', 'done'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${filter === f
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            {f === 'all' ? `Tất cả (${bookings.length})` : f === 'pending' ? `Chờ (${pendingCount})` : `Đã nhận (${doneCount})`}
                        </button>
                    ))}
                </div>

                {/* View mode toggle */}
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md transition-all ${viewMode === 'list'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <List size={14} /> Danh sách
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md transition-all ${viewMode === 'calendar'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <CalendarDays size={14} /> Lịch
                    </button>
                </div>
            </div>

            {/* Content based on view mode */}
            {viewMode === 'calendar' ? (
                <CalendarView bookings={bookings} onReschedule={handleReschedule} token={token || ''} />
            ) : (
                /* List view */
                <Card className="overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight text-sm">Danh sách lịch hẹn</h3>
                    </div>
                    {filteredBookings.length === 0 ? (
                        <div className="p-12">
                            <EmptyState
                                title="Không có lịch hẹn"
                                description="Khi khách hàng đặt lịch online, lịch hẹn sẽ hiển thị tại đây."
                                icon={CalendarCheck}
                                className="border-none bg-transparent shadow-none"
                            />
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredBookings.map((booking: any) => {
                                const st = bookingStatusMap(booking);
                                return (
                                    <div key={booking.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${booking.hasOrder ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                                                <CalendarCheck className={booking.hasOrder ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'} size={18} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">LH#{booking.id}</span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                    <span className="flex items-center gap-1"><Car size={12} />{booking.plate}</span>
                                                    <span className="flex items-center gap-1"><User size={10} />{booking.customer}</span>
                                                    <span className="flex items-center gap-1"><Phone size={10} />{booking.phone}</span>
                                                </div>
                                                {booking.ngayHen && (
                                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
                                                        📅 Ngày hẹn: {booking.ngayHen}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {booking.ngayGio ? new Date(booking.ngayGio).toLocaleDateString('vi-VN') : ''}
                                                </p>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                                    {booking.ngayGio ? new Date(booking.ngayGio).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </p>
                                            </div>
                                            {booking.hasOrder ? (
                                                <Link
                                                    href={`/sale/orders/${booking.orderId}`}
                                                    className="text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
                                                >
                                                    <Eye size={12} /> Xem đơn
                                                </Link>
                                            ) : (
                                                <Link
                                                    href={`/sale/reception/${booking.id}`}
                                                    className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-500 transition-colors flex items-center gap-1"
                                                >
                                                    Tiếp nhận <ArrowRight size={12} />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            )}
        </DashboardLayout>
    );
}
