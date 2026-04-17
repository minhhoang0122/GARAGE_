'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import {
    Info, Clock, ArrowLeft,
    CarFront, FileText, Wrench,
    CheckCircle2, CreditCard, ShieldCheck,
    Phone, QrCode,
    Calendar, Search, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useSSEContext } from '@/modules/common/contexts/RealtimeContext';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

// --- Helpers ---
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
const capitalize = (str: string) => {
    if (!str) return '';
    const lower = str.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
};

// --- Progress Stepper ---
const ProgressStepper = ({ currentStatus }: { currentStatus: string }) => {
    const steps = [
        { id: 'RECEPTION', label: 'Tiếp nhận', icon: CarFront },
        { id: 'DIAGNOSIS', label: 'Chẩn đoán', icon: Search },
        { id: 'REPAIRING', label: 'Sửa chữa', icon: Wrench },
        { id: 'QC', label: 'Kiểm tra', icon: ShieldCheck },
        { id: 'COMPLETED', label: 'Bàn giao', icon: CheckCircle2 },
    ];

    const getActiveIndex = () => {
        const s = (currentStatus || '').toUpperCase();
        if (s.includes('BÀN GIAO') || s.includes('HOÀN THÀNH')) return 4;
        if (s.includes('KIỂM TRA') || s.includes('QC')) return 3;
        if (s.includes('THI CÔNG') || s.includes('SỬA CHỮA') || s.includes('REPAIR')) return 2;
        if (s.includes('CHẨN ĐOÁN') || s.includes('PROPOSAL')) return 1;
        return 0;
    };

    const activeIndex = getActiveIndex();
    const N = steps.length;

    const wrapRef = useRef<HTMLDivElement>(null);
    const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
    const doneRef = useRef<HTMLDivElement>(null);
    const segRef = useRef<HTMLDivElement>(null);
    const wormRef = useRef<HTMLDivElement>(null);

    const buildTracks = () => {
        const wrap = wrapRef.current;
        if (!wrap || !doneRef.current || !segRef.current || !wormRef.current) return;

        const wrapLeft = wrap.getBoundingClientRect().left;
        const cx = dotRefs.current.map(el => {
            if (!el) return 0;
            const r = el.getBoundingClientRect();
            return r.left + r.width / 2 - wrapLeft;
        });

        // Solid track: dot[0] → dot[activeIndex - 1]
        if (activeIndex > 0) {
            doneRef.current.style.left = cx[0] + 'px';
            doneRef.current.style.width = (cx[activeIndex - 1] - cx[0]) + 'px';
            doneRef.current.style.display = 'block';
        } else {
            doneRef.current.style.display = 'none';
        }

        // Animated worm: dot[activeIndex - 1] → dot[activeIndex]
        if (activeIndex > 0 && activeIndex < N) {
            segRef.current.style.left = cx[activeIndex - 1] + 'px';
            segRef.current.style.width = (cx[activeIndex] - cx[activeIndex - 1]) + 'px';
            segRef.current.style.display = 'block';
            // restart animation cleanly
            wormRef.current.style.animation = 'none';
            void wormRef.current.offsetHeight; // force reflow
            wormRef.current.style.animation = 'gmWorm 4s cubic-bezier(.4,0,.2,1) infinite';
        } else {
            segRef.current.style.display = 'none';
        }
    };

    useEffect(() => {
        const id = requestAnimationFrame(() => requestAnimationFrame(buildTracks));
        window.addEventListener('resize', buildTracks);
        return () => {
            cancelAnimationFrame(id);
            window.removeEventListener('resize', buildTracks);
        };
    }, [activeIndex]);

    return (
        <>
            <style>{`
                @keyframes gmWorm {
                    0%   { transform: scaleX(0); }
                    55%  { transform: scaleX(1); }
                    80%  { transform: scaleX(1); }
                    99%  { transform: scaleX(0); }
                    100% { transform: scaleX(0); }
                }
            `}</style>

            <div className="w-full py-6 overflow-x-auto">
                <div
                    ref={wrapRef}
                    className="relative flex justify-between items-start min-w-[520px] md:min-w-0"
                >
                    {/* Base track */}
                    <div className="absolute top-[17px] left-0 right-0 h-[2px] bg-stone-200 rounded-full" />

                    {/* Solid completed portion */}
                    <div
                        ref={doneRef}
                        className="absolute top-[17px] h-[2px] bg-amber-500 rounded-full"
                        style={{ display: 'none' }}
                    />

                    {/* Animated last segment */}
                    <div
                        ref={segRef}
                        className="absolute top-[17px] h-[2px] rounded-full overflow-hidden"
                        style={{ display: 'none' }}
                    >
                        <div
                            ref={wormRef}
                            className="w-full h-full bg-amber-500 rounded-full"
                            style={{ transformOrigin: 'left center', transform: 'scaleX(0)' }}
                        />
                    </div>

                    {/* Step dots */}
                    {steps.map((step, idx) => {
                        const isCompleted = idx < activeIndex;
                        const isActive = idx === activeIndex;
                        const Icon = step.icon;

                        return (
                            <div
                                key={idx}
                                className="relative z-10 flex flex-col items-center gap-3"
                                style={{ width: `${100 / N}%` }}
                            >
                                <motion.div
                                    ref={el => { dotRefs.current[idx] = el; }}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: idx * 0.08 + 0.2 }}
                                    className={cn(
                                        'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300',
                                        isCompleted && 'bg-amber-500 border-2 border-amber-500',
                                        isActive && 'bg-white border-2 border-amber-500 ring-4 ring-amber-500/10',
                                        !isCompleted && !isActive && 'bg-white border-2 border-stone-200'
                                    )}
                                >
                                    {isCompleted
                                        ? <CheckCircle2 size={16} className="text-white" />
                                        : <Icon size={15} className={isActive ? 'text-amber-500' : 'text-stone-300'} />
                                    }
                                </motion.div>

                                <span className={cn(
                                    'text-[10px] font-semibold tracking-wide text-center whitespace-nowrap',
                                    isActive ? 'text-amber-600' :
                                        isCompleted ? 'text-stone-600' : 'text-stone-300'
                                )}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

// --- Status Badge ---
const StatusBadge = ({ label }: { label: string }) => (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        <span className="text-xs font-semibold text-amber-700 tracking-wide">{capitalize(label)}</span>
    </div>
);

// --- Timeline Item ---
const TimelineItem = ({ step, isFirst, idx }: { step: any; isFirst: boolean; idx: number }) => (
    <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: idx * 0.07, ease: [0.22, 1, 0.36, 1] }}
        className="relative pl-8"
    >
        <div className={cn(
            'absolute left-0 top-1 w-3 h-3 rounded-full border-2 border-white ring-1',
            isFirst ? 'bg-amber-500 ring-amber-400' : 'bg-stone-200 ring-stone-200'
        )} />
        <div className={cn(
            'rounded-2xl p-5 transition-all',
            isFirst
                ? 'bg-stone-900 text-white'
                : 'bg-stone-50 hover:bg-white hover:shadow-sm border border-transparent hover:border-stone-100'
        )}>
            <div className="flex justify-between items-start gap-4 mb-1.5">
                <p className={cn('text-sm font-medium leading-snug', isFirst ? 'text-white' : 'text-stone-800')}>
                    {capitalize(step.content)}
                </p>
                <span className="text-[10px] font-mono tabular-nums shrink-0 mt-0.5 text-stone-400">
                    {step.time.split(' ')[1] || step.time}
                </span>
            </div>
            <div className="flex items-center gap-2">
                {isFirst && (
                    <span className="text-[9px] font-bold tracking-widest bg-amber-500 text-white px-2 py-0.5 rounded-full">
                        MỚI NHẤT
                    </span>
                )}
                <span className={cn('text-[10px]', isFirst ? 'text-stone-500' : 'text-stone-400')}>
                    {step.time.split(' ')[0]}
                </span>
            </div>
        </div>
    </motion.div>
);

// --- Work Item Card ---
const WorkItemCard = ({ item, idx }: { item: any; idx: number }) => {
    const isDone = item.status === 'COMPLETED';
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center gap-4 p-4 rounded-xl border border-stone-100 bg-white hover:shadow-sm transition-all"
        >
            <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                isDone ? 'bg-emerald-50 text-emerald-500' : 'bg-stone-50 text-stone-300'
            )}>
                {isDone ? <CheckCircle2 size={18} /> : <Wrench size={16} />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-800 truncate">{capitalize(item.name)}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-stone-400">×{item.quantity}</span>
                    <span className="w-0.5 h-0.5 bg-stone-300 rounded-full" />
                    <span className={cn('text-[10px] font-semibold', isDone ? 'text-emerald-600' : 'text-amber-500')}>
                        {isDone ? 'Hoàn tất' : 'Đang thực hiện'}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

// --- Main Content ---
function TraCuuContent() {
    const searchParams = useSearchParams();
    const urlUuid = searchParams.get('uuid');
    const { addListener, removeListener } = useSSEContext();
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => { setIsHydrated(true); }, []);

    const {
        data: uuidResult,
        isLoading: isUuidLoading,
        error: uuidError,
        refetch: refetchByUuid,
    } = useQuery({
        queryKey: ['publicTrackingUuid', urlUuid],
        queryFn: async () => {
            if (!urlUuid) return null;
            return await api.get(`/public/tracking/${urlUuid}`);
        },
        enabled: !!urlUuid,
        retry: false,
    });

    const trackingResult = uuidResult ? {
        id: uuidResult.id,
        bienSo: uuidResult.licensePlate,
        modelXe: uuidResult.model,
        ngayTiepNhan: uuidResult.receptionDate,
        yeuCauSoBo: uuidResult.preliminaryRequest,
        trangThaiLabel: uuidResult.statusLabel,
        tongTien: uuidResult.totalAmount || 0,
        daThanhToan: uuidResult.paidAmount || 0,
        items: uuidResult.items || [],
        timeline: [...(uuidResult.timeline || [])].reverse(),
    } : null;

    useEffect(() => {
        if (!trackingResult) return;
        const handle = (data: any) => {
            if (data.orderId === trackingResult.id || data.uuid === urlUuid) refetchByUuid();
        };
        addListener('order_updated', handle);
        addListener('order_item_status_changed', handle);
        addListener('order_qc_passed', handle);
        addListener('order_qc_failed', handle);
        return () => {
            removeListener('order_updated', handle);
            removeListener('order_item_status_changed', handle);
            removeListener('order_qc_passed', handle);
            removeListener('order_qc_failed', handle);
        };
    }, [trackingResult, urlUuid, addListener, removeListener, refetchByUuid]);

    const formatCurrency = (val: number) => {
        if (!isHydrated) return '—';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
    };

    const trackError = (uuidError as any)?.message || '';

    if (!urlUuid) {
        return (
            <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-xs w-full">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-stone-100 flex items-center justify-center mx-auto mb-8">
                        <QrCode size={36} className="text-amber-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-stone-900 mb-3 tracking-tight">Quét mã QR để theo dõi xe</h1>
                    <p className="text-stone-500 text-sm mb-10 leading-relaxed">
                        Sử dụng camera điện thoại quét mã QR trên phiếu tiếp nhận của Quý khách.
                    </p>
                    <Link href="/" className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-700 text-sm font-medium transition-colors group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                        Trở về trang chủ
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (isUuidLoading) {
        return (
            <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-[3px] border-stone-200 border-t-amber-500 rounded-full animate-spin" />
                <p className="text-xs text-stone-400 font-medium tracking-widest animate-pulse">Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (trackError || !trackingResult) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
                <div className="bg-white p-10 rounded-3xl shadow-sm border border-stone-100 text-center max-w-sm">
                    <div className="w-16 h-16 bg-red-50 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Info size={28} />
                    </div>
                    <h2 className="text-xl font-bold text-stone-900 mb-2">Không tìm thấy đơn hàng</h2>
                    <p className="text-sm text-stone-500 mb-8 leading-relaxed">
                        Mã QR không tồn tại hoặc đã hết hạn. Vui lòng liên hệ cố vấn dịch vụ.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-stone-900 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-black transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    const remainingAmount = trackingResult.tongTien - trackingResult.daThanhToan;
    const paidPct = Math.min(100, (trackingResult.daThanhToan / (trackingResult.tongTien || 1)) * 100);

    return (
        <div className="min-h-screen bg-stone-50 pb-20 font-sans antialiased text-stone-900 selection:bg-amber-100">

            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-100 px-4 py-3.5">
                <div className="container mx-auto max-w-4xl flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-stone-500 hover:text-stone-800 text-sm font-medium transition-colors group">
                        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                        Trang chủ
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-semibold text-stone-400 tracking-widest">LIVE</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-4xl px-4 mt-8 space-y-6">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ease: [0.22, 1, 0.36, 1] }}
                    className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden"
                >
                    <div className="h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400" />
                    <div className="p-7 md:p-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 pb-8 border-b border-stone-100">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-stone-900 rounded-2xl flex items-center justify-center shrink-0">
                                    <CarFront size={28} className="text-amber-400" />
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-black font-mono tracking-tighter leading-none text-stone-900 mb-2">
                                        {trackingResult.bienSo}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                        <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full">
                                            {trackingResult.modelXe}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-stone-400 text-xs">
                                            <Calendar size={11} />
                                            <span>{trackingResult.ngayTiepNhan}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <StatusBadge label={trackingResult.trangThaiLabel} />
                        </div>
                        <ProgressStepper currentStatus={trackingResult.trangThaiLabel} />
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 space-y-6">

                        <motion.section
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-white rounded-3xl border border-stone-100 shadow-sm p-7"
                        >
                            <div className="flex items-center justify-between mb-7">
                                <h3 className="flex items-center gap-2.5 text-sm font-bold text-stone-900">
                                    <Clock size={16} className="text-amber-500" />
                                    Lịch trình xử lý
                                </h3>
                                <span className="text-[10px] font-bold text-stone-400 tracking-widest">
                                    {trackingResult.timeline.length} MỐC
                                </span>
                            </div>
                            <div className="relative space-y-4 before:absolute before:left-[5px] before:top-3 before:bottom-3 before:w-px before:bg-stone-100">
                                {trackingResult.timeline.map((step: any, idx: number) => (
                                    <TimelineItem key={idx} step={step} isFirst={idx === 0} idx={idx} />
                                ))}
                            </div>
                        </motion.section>

                        {trackingResult.items.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                className="bg-white rounded-3xl border border-stone-100 shadow-sm p-7"
                            >
                                <div className="flex items-center gap-2.5 mb-6">
                                    <Wrench size={16} className="text-amber-500" />
                                    <h3 className="text-sm font-bold text-stone-900">Chi tiết hạng mục</h3>
                                    <span className="ml-auto text-[10px] font-bold text-stone-400 tracking-widest">
                                        {trackingResult.items.filter((i: any) => i.status === 'COMPLETED').length}/{trackingResult.items.length} HOÀN TẤT
                                    </span>
                                </div>
                                <div className="h-1 bg-stone-100 rounded-full mb-5 overflow-hidden">
                                    <motion.div
                                        className="h-full bg-emerald-500 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(trackingResult.items.filter((i: any) => i.status === 'COMPLETED').length / trackingResult.items.length) * 100}%` }}
                                        transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {trackingResult.items.map((item: any, idx: number) => (
                                        <WorkItemCard key={idx} item={item} idx={idx} />
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </div>

                    <div className="lg:col-span-4 space-y-4">

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-stone-900 rounded-3xl p-7 text-white"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <CreditCard size={14} className="text-stone-500" />
                                <span className="text-[10px] font-semibold text-stone-500 tracking-widest">CHI PHÍ TẠM TÍNH</span>
                            </div>
                            <div className="text-3xl font-black tabular-nums tracking-tight mt-2 mb-6">
                                {formatCurrency(trackingResult.tongTien)}
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-4">
                                <motion.div
                                    className="h-full bg-emerald-400 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${paidPct}%` }}
                                    transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                />
                            </div>
                            <div className="space-y-3 pt-4 border-t border-white/5">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-stone-500">Đã thanh toán</span>
                                    <span className="text-xs font-semibold text-emerald-400 tabular-nums">{formatCurrency(trackingResult.daThanhToan)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-stone-500">Còn lại</span>
                                    <span className="text-xs font-semibold text-red-400 tabular-nums">{formatCurrency(remainingAmount)}</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-amber-50 rounded-3xl p-6 border border-amber-100"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <FileText size={14} className="text-amber-500" />
                                <span className="text-[10px] font-bold text-amber-700 tracking-widest">GHI CHÚ CỐ VẤN</span>
                            </div>
                            <p className="text-sm text-stone-600 leading-relaxed italic">
                                {trackingResult.yeuCauSoBo
                                    ? `"${capitalize(trackingResult.yeuCauSoBo)}"`
                                    : 'Đội ngũ kỹ thuật đang thực hiện chẩn đoán chính xác nhất cho xe của Quý khách.'
                                }
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm"
                        >
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
                                    <Phone size={20} className="text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-stone-900">Cố vấn hỗ trợ</p>
                                    <p className="text-xs text-stone-400">Kỹ thuật viên 24/7</p>
                                </div>
                            </div>
                            <a
                                href="tel:0987654321"
                                className="flex items-center justify-center gap-2 w-full bg-stone-900 text-white py-3.5 rounded-2xl text-sm font-semibold hover:bg-black transition-colors group"
                            >
                                Gọi 098.765.4321
                                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                            </a>
                        </motion.div>
                    </div>
                </div>
            </main>

            <footer className="mt-16 text-center">
                <div className="inline-flex items-center gap-2 opacity-30 hover:opacity-60 transition-opacity">
                    <ShieldCheck size={14} className="text-stone-500" />
                    <span className="text-[10px] text-stone-500 font-semibold tracking-widest">Mã hóa 256-bit · Garage Master</span>
                </div>
            </footer>
        </div>
    );
}

export default function TraCuuPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 gap-4">
                <div className="w-10 h-10 border-[3px] border-stone-200 border-t-amber-500 rounded-full animate-spin" />
            </div>
        }>
            <TraCuuContent />
        </Suspense>
    );
}