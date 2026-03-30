'use client';
import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { ArrowLeft, AlertCircle, Loader2, Car, User, Clock, Fuel, ShieldCheck, Clipboard, RefreshCw, FileText } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import ImageGallery from '@/modules/shared/components/common/ImageGallery';
import { useToast } from '@/contexts/ToastContext';
import ProposalList from './ProposalList';
import { useQuery } from '@tanstack/react-query';
import { mechanicService } from '@/modules/mechanic/services/mechanic';
import { useRealtimeUpdate } from '@/hooks/useRealtimeUpdate';
import Timeline from '@/modules/shared/components/common/Timeline';
import { getStatusBadge, isReceived, isWaitingDiagnosis } from '@/lib/status';

interface ReceptionDetail {
    id: number;
    plate: string;
    customerName: string;
    customerPhone: string;
    vehicleBrand: string;
    vehicleModel: string;
    request: string;
    odo: number;
    fuelLevel: string;
    bodyCondition: string;
    imageUrl?: string;
    status?: string;
    existingItems: any[];
    pendingReviewCount?: number;
}

export default function InspectPage() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const { showToast } = useToast();

    const source = searchParams.get('source');

    const { data: reception, isLoading, error: queryError } = useQuery<ReceptionDetail>({
        queryKey: ['reception', id],
        queryFn: async () => mechanicService.getReceptionForInspect(Number(id)),
        enabled: !!session?.user && !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Realtime Sync
    useRealtimeUpdate(['reception', id]);

    const errorHandled = useRef(false);
    useEffect(() => {
        if (queryError && !errorHandled.current) {
            errorHandled.current = true;
            showToast('error', "Không thể tải thông tin xe. Vui lòng thử lại sau.");
            router.replace('/mechanic');
        }
    }, [queryError, router, showToast]);

    if (isLoading || !reception) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="font-bold text-slate-400 animate-pulse">Đang tải dữ liệu xe...</p>
            </div>
        </div>
    );

    const backLink = source === 'history' ? '/mechanic/history' : '/mechanic/inspect';
    const representsReadOnly = !isReceived(reception.status) && !isWaitingDiagnosis(reception.status);

    return (
        <DashboardLayout title="Chẩn đoán & Đề xuất" subtitle={`Kiểm tra xe: ${reception.plate}`}>
            <div className="max-w-[1600px] mx-auto pb-20 px-4 lg:px-8">

                <div className="flex items-center justify-between mb-8">
                    <Link
                        href={backLink}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors font-semibold text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" /> {source === 'history' ? 'Quay lại lịch sử' : 'Quay lại danh sách'}
                    </Link>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <RefreshCw className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    {/* Main Content Area (8/12) */}
                    <div className="xl:col-span-8 space-y-6 min-w-0">
                        {/* Vehicle Header Card */}
                        <div className="relative bg-white dark:bg-slate-900 p-4 md:p-8 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/50 transition-all">
                            {/* Background decoration */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-transparent blur-3xl rounded-full -mr-32 -mt-32"></div>
                            </div>

                            <div className="flex flex-col xl:flex-row flex-wrap justify-between items-center xl:items-start gap-8 relative z-10 w-full">
                                <div className="flex flex-col md:flex-row flex-wrap items-center gap-6 w-full xl:w-auto xl:max-w-[70%]">
                                    {/* Realistic License Plate Visual */}
                                    <div className="flex flex-col items-center shrink-0">
                                        <div className="bg-white dark:bg-slate-50 border-2 border-slate-900 dark:border-white rounded-xl px-4 md:px-6 py-2 md:py-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transform hover:-rotate-1 transition-all duration-300 group cursor-default">
                                            <span className="text-xl md:text-3xl font-black text-slate-900 tracking-[0.15em] font-mono leading-none block">
                                                {reception.plate}
                                            </span>
                                        </div>
                                        <div className="mt-3 px-3 py-1 bg-slate-900 dark:bg-slate-800 text-white rounded text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] max-w-[200px] truncate text-center">
                                            {reception.vehicleBrand} {reception.vehicleModel}
                                        </div>
                                    </div>

                                    <div className="text-center md:text-left space-y-2 min-w-[200px] flex-1">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Khách hàng</p>
                                            <h3 className="text-lg md:text-2xl font-bold text-slate-800 dark:text-white flex items-center justify-center md:justify-start gap-2 break-words">
                                                {reception.customerName}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium">{reception.customerPhone || 'Không có số điện thoại'}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center sm:items-end gap-3 shrink-0 min-w-fit">
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-center sm:text-right">Trạng thái phiếu</p>
                                    <div className="flex items-center justify-center sm:justify-end w-full">
                                        {getStatusBadge(reception.status || 'TIEP_NHAN')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                                <div className="flex items-center gap-3 mb-2 text-slate-400">
                                    <Clipboard className="w-5 h-5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Yêu cầu khách hàng</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 italic line-clamp-2 leading-relaxed">
                                    "{reception.request || 'Không có yêu cầu cụ thể'}"
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                                <div className="flex items-center gap-3 mb-2 text-slate-400">
                                    <Car className="w-5 h-5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Thông số vận hành</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xl font-black text-slate-800 dark:text-slate-100">{reception.odo?.toLocaleString()} <small className="text-[10px] text-slate-400 uppercase">km</small></span>
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded text-xs font-bold border border-amber-100 dark:border-amber-800">
                                        <Fuel className="w-3.5 h-3.5" /> {reception.fuelLevel || '—'}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                                <div className="flex items-center gap-3 mb-2 text-slate-400">
                                    <ShieldCheck className="w-5 h-5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Tình trạng thân vỏ</span>
                                </div>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">
                                    {reception.bodyCondition || 'Bình thường, không trầy xước'}
                                </p>
                            </div>
                        </div>

                        {/* Proposal List Section */}
                        <div className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/50 transition-all">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">Danh sách Hạng mục & Đề xuất</h3>
                                    <p className="text-xs text-slate-500">Chẩn đoán hư hỏng và đề xuất phương án xử lý</p>
                                </div>
                            </div>
                            
                            <ProposalList 
                                receptionId={Number(id)} 
                                initialItems={reception.existingItems || []} 
                                readOnly={representsReadOnly || source === 'history'}
                                currentUser={session?.user}
                            />
                        </div>

                        {representsReadOnly && (
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-sm flex gap-3 items-center">
                                <AlertCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                <p className="font-medium italic">Hồ sơ này đã được gửi báo cáo chẩn đoán. Mọi thay đổi sẽ cần sự phê duyệt của Quản lý dịch vụ.</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Area (4/12) */}
                    <div className="xl:col-span-4 space-y-8 xl:sticky xl:top-8 self-start">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                             <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-widest flex items-center gap-2">
                                <Car className="w-4 h-4 text-indigo-500" /> Hình ảnh hiện trạng
                             </h3>
                             <div className="min-h-[200px]">
                                <ImageGallery images={reception.imageUrl} />
                             </div>
                        </div>
                        <Timeline receptionId={Number(id)} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
