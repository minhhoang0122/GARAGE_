'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/modules/common/components/layout';
import PrintLayout from '@/modules/shared/components/common/PrintLayout';
import { getStatusBadge } from '@/lib/status';
import { useReceptionDetail } from '@/modules/reception/hooks/useReception';
import { Printer, Car, User, Clock, MapPin, Phone, Fuel, ShieldCheck, Clipboard, ArrowLeft, AlertTriangle, RefreshCw } from 'lucide-react';
import ImageGallery from '@/modules/shared/components/common/ImageGallery';
import Link from 'next/link';

export default function ReceptionDetailPage() {
    const { id } = useParams();
    const { data: reception, isLoading: loading, error: queryError } = useReceptionDetail(id as string);

    useEffect(() => {
        if (reception && typeof window !== 'undefined' && window.location.search.includes('print=true')) {
            setTimeout(() => window.print(), 800);
        }
    }, [reception]);

    const error = queryError ? (queryError as any).message : null;

    if (loading) return (
        <DashboardLayout title="Đang tải...">
            <div className="flex flex-col items-center justify-center p-12 min-h-[40vh]">
                <div className="animate-spin w-8 h-8 border-4 border-slate-600 border-t-transparent rounded-full mb-4"></div>
                <p className="text-slate-500 font-medium">Đang tải thông tin phiếu tiếp nhận...</p>
            </div>
        </DashboardLayout>
    );

    if (error) return (
        <DashboardLayout title="Lỗi">
            <div className="max-w-md mx-auto mt-12 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-red-100 dark:border-red-900 p-8 text-center">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Đã xảy ra lỗi</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-left text-xs font-mono text-slate-600 dark:text-slate-300 mb-6 overflow-auto">
                    backend check: ensure ReceptionRepository has findByIdWithDetails
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
                >
                    <RefreshCw className="w-4 h-4" /> Thử lại
                </button>
            </div>
        </DashboardLayout>
    );

    if (!reception) return (
        <DashboardLayout title="Không tìm thấy">
            <div className="max-w-md mx-auto mt-12 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Car className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Không tìm thấy phiếu</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">Phiếu tiếp nhận này không tồn tại hoặc đã bị xóa.</p>
                <Link href="/sale/reception" className="text-slate-600 hover:text-slate-900 hover:underline">Quay lại danh sách</Link>
            </div>
        </DashboardLayout>
    );

    const handlePrint = () => {
        window.print();
    };

    return (
        <DashboardLayout title="Hồ sơ Tiếp nhận xe" subtitle={`Mã phiếu #${reception.id}`}>
            <div className="mb-6 flex items-center justify-between no-print">
                <Link
                    href="/sale/reception"
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
                </Link>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-all font-medium"
                    >
                        <Printer className="w-4 h-4" />
                        In phiếu
                    </button>
                </div>
            </div>

            <PrintLayout title="PHIẾU TIẾP NHẬN XE">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Customer & Vehicle Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                                <User className="w-5 h-5" /> Thông tin Chủ sở hữu
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <User className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-500 w-20">Họ tên:</span>
                                        <span className="font-bold">{reception.tenKhach}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-500 w-20">Điện thoại:</span>
                                        <span className="font-bold">{reception.sdtKhach}</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-500 w-20">Địa chỉ:</span>
                                        <span className="font-bold italic">{reception.diaChiKhach || '—'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-500 w-20">Thời gian:</span>
                                        <span className="font-bold">{reception.ngayGio ? new Date(reception.ngayGio).toLocaleString('vi-VN') : '—'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">
                                <Car className="w-5 h-5" /> Dữ liệu Phương tiện
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                        <span className="text-sm text-slate-500 font-medium">Biển số xe:</span>
                                        <span className="text-xl font-black text-blue-700 dark:text-blue-400 tracking-wider">
                                            {reception.bienSo}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm items-center px-1">
                                        <span className="text-slate-500">Hãng & Model:</span>
                                        <span className="font-bold">{reception.nhanHieu} {reception.model}</span>
                                    </div>
                                    <div className="flex justify-between text-sm items-center px-1">
                                        <span className="text-slate-500">Số ODO:</span>
                                        <span className="font-bold text-amber-600">{reception.odo?.toLocaleString()} km</span>
                                    </div>
                                </div>
                                <div className="space-y-3 pt-1">
                                    <div className="flex justify-between text-sm items-center border-b border-dashed pb-2">
                                        <div className="flex items-center gap-2">
                                            <Fuel className="w-4 h-4 text-amber-500" />
                                            <span className="text-slate-500">Mức nhiên liệu:</span>
                                        </div>
                                        <span className="font-bold text-lg">{reception.mucXang}%</span>
                                    </div>
                                    <div className="flex justify-between text-sm items-center border-b border-dashed pb-2">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                            <span className="text-slate-500">Vỏ xe:</span>
                                        </div>
                                        <span className="font-bold">{reception.tinhTrangVoXe || 'Bình thường'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                            <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-slate-800 dark:text-slate-200 italic">
                                <Clipboard className="w-5 h-5" /> Yêu cầu dịch vụ & Tình trạng xe
                            </h3>
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-400 rounded-r-lg">
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium italic">
                                    "{reception.yeuCauSoBo || 'Không có yêu cầu cụ thể'}"
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors h-full">
                            <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-200">Hình ảnh hiện trạng</h3>
                            {reception.hinhAnh ? (
                                <div className="no-print">
                                    <ImageGallery images={reception.hinhAnh} />
                                </div>
                            ) : (
                                <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400">
                                    <Car className="w-10 h-10 opacity-20 mb-2" />
                                    <span className="text-sm italic">Không có hình ảnh</span>
                                </div>
                            )}

                            {/* Print Version of Images */}
                            <div className="hidden print:block mt-4">
                                <p className="text-xs text-slate-500 italic mb-2">* Hình ảnh chi tiết lưu trữ trên hệ thống</p>
                                {reception.hinhAnh && (
                                    <div className="grid grid-cols-2 gap-2">
                                        {reception.hinhAnh.split(',').slice(0, 2).map((url: string, idx: number) => (
                                            <div key={idx} className="aspect-video rounded border overflow-hidden">
                                                <img src={url} className="w-full h-full object-cover grayscale" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </PrintLayout>
        </DashboardLayout>
    );
}
