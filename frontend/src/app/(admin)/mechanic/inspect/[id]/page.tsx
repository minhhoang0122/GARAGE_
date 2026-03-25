'use client';
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import ImageGallery from '@/modules/shared/components/common/ImageGallery';
import { useToast } from '@/contexts/ToastContext';
import ProposalList from './ProposalList';
import { useQuery } from '@tanstack/react-query';

interface ReceptionDetail {
    id: number;
    plate: string;
    customerName: string;
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
        queryFn: async () => {
             // @ts-ignore
            const token = session?.user?.accessToken;
            if (!token) throw new Error("Unauthorized");
            return api.get(`/mechanic/inspect/${id}`, token);
        },
        enabled: !!session?.user && !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    useEffect(() => {
        if (queryError) {
            showToast('error', "Không thể tải thông tin xe");
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
    const representsReadOnly = reception.status !== 'TIEP_NHAN' && reception.status !== 'CHO_CHAN_DOAN';

    return (
        <DashboardLayout title="Chẩn đoán & Đề xuất" subtitle={`Kiểm tra xe: ${reception.plate}`}>
            <div className="max-w-6xl mx-auto space-y-6 pb-20">
                {/* Header with Back Button & Stage Tabs */}
                <div className="flex items-center gap-4">
                    <Link href={backLink} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors font-semibold text-sm">
                        <ArrowLeft className="w-4 h-4" /> {source === 'history' ? 'Quay lại lịch sử' : 'Quay lại danh sách'}
                    </Link>
                </div>

                {/* Info Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                        {/* Gallery - Left side on Desktop */}
                        {reception.imageUrl && (
                            <div className="w-full md:w-[300px] bg-slate-50 border-r border-slate-100 p-4">
                                <ImageGallery images={reception.imageUrl} />
                            </div>
                        )}

                        <div className="flex-1 p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{reception.plate}</h2>
                                    <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600 uppercase tracking-widest">{reception.vehicleBrand}</span>
                                        {reception.vehicleModel} • {reception.customerName}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${representsReadOnly ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                        <div className={`w-2 h-2 rounded-full animate-pulse ${representsReadOnly ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                        {representsReadOnly ? "Đã gửi báo cáo" : "Đang chẩn đoán"}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Yêu cầu của khách</p>
                                    <p className="text-sm font-semibold text-slate-700 leading-relaxed">{reception.request || "Không có yêu cầu cụ thể"}</p>
                                </div>
                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Thông số tiếp nhận</p>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">ODO:</span>
                                        <span className="font-bold text-slate-800">{reception.odo} km</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm mt-1">
                                        <span className="text-slate-500">Nhiên liệu:</span>
                                        <span className="font-bold text-slate-800">{reception.fuelLevel}</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tình trạng thân vỏ</p>
                                    <p className="text-sm font-semibold text-slate-700 italic">"{reception.bodyCondition || "Tình trạng bình thường, không trầy xước"}"</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Proposal Component */}
                <div className="mt-8">
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <div className="w-1 h-6 bg-blue-600 rounded-full" />
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Quy trình Chẩn đoán & Đề xuất</h3>
                    </div>
                    
                    <ProposalList 
                        receptionId={Number(id)} 
                        initialItems={reception.existingItems || []} 
                        readOnly={representsReadOnly || source === 'history'}
                        currentUser={session?.user}
                    />
                </div>

                {representsReadOnly && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-sm flex gap-3 items-center">
                        <AlertCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <p className="font-medium">Hồ sơ này đã được gửi báo cáo chẩn đoán. Mọi thay đổi sẽ cần sự phê duyệt của Quản lý dịch vụ.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
