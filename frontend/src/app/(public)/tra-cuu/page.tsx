'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Info, Tag, Clock, ArrowRight, ArrowLeft, CarFront, FileText, Wrench, Settings, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useSSEContext } from '@/modules/common/contexts/SSEContext';

export default function TraCuuPage() {
    const { addListener, removeListener } = useSSEContext();
    const [trackingPlate, setTrackingPlate] = useState('');
    const [trackingResult, setTrackingResult] = useState<any>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [trackError, setTrackError] = useState('');

    const handleTrack = useCallback(async (plateToTrack?: string) => {
        const plate = plateToTrack || trackingPlate;
        if (!plate.trim()) return;
        
        setIsTracking(true);
        setTrackError('');
        try {
            const data = await api.getCached(`/public/tracking?bienSo=${plate}`);
            if (data && data.success) {
                setTrackingResult(data);
            } else {
                setTrackError(data?.message || 'Không tìm thấy dữ liệu.');
                setTrackingResult(null);
            }
        } catch (error) {
            setTrackError('Lỗi kết nối mạng. Vui lòng thử lại sau.');
        } finally {
            setIsTracking(false);
        }
    }, [trackingPlate]);

    // SSE Listener cho cập nhật tiến độ
    useEffect(() => {
        const handleOrderUpdate = (data: any) => {
            console.log('[Public SSE] Order Update received:', data);
            // Nếu biển số khớp với xe đang tra cứu, cập nhật lại dữ liệu
            if (trackingResult && (data.plate === trackingResult.bienSo || data.orderId === trackingResult.id)) {
                handleTrack(trackingResult.bienSo);
            }
        };

        addListener('order_updated', handleOrderUpdate);
        addListener('order_item_status_changed', handleOrderUpdate);
        addListener('order_qc_passed', handleOrderUpdate);
        addListener('order_qc_failed', handleOrderUpdate);

        return () => {
            removeListener('order_updated', handleOrderUpdate);
            removeListener('order_item_status_changed', handleOrderUpdate);
            removeListener('order_qc_passed', handleOrderUpdate);
            removeListener('order_qc_failed', handleOrderUpdate);
        };
    }, [trackingResult, addListener, removeListener, handleTrack]);

    const onSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleTrack();
    }

    const mechanicalSpring = {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
    };

    return (
        <div className="min-h-screen bg-[#fafaf8] selection:bg-orange-200">
            {/* Header đơn giản của trang Tra Cứu */}
            <div className="bg-[#1C1917] p-4 flex items-center justify-between border-b-4 border-orange-600">
                <div className="container mx-auto flex items-center gap-4">
                    <Link href="/" className="text-stone-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
                        <ArrowLeft size={16} /> Quay lại Trang Chủ
                    </Link>
                    <div className="h-6 w-px bg-stone-700 mx-2"></div>
                    <span className="text-white font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                        <Search size={16} className="text-orange-500" />
                        Tra cứu tiến độ dịch vụ
                    </span>
                </div>
            </div>

            <main className="container mx-auto px-4 py-12 md:py-24">
                <div className="max-w-3xl mx-auto">
                    {/* Tiêu đề */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={mechanicalSpring}
                        className="mb-10 text-center"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6 text-orange-600">
                            <CarFront size={32} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-stone-900 mb-4 tracking-tight">Kiểm tra thông tin <span className="text-orange-600">Bảo dưỡng</span></h1>
                        <p className="text-stone-600 text-lg">Hệ thống tra cứu tiến độ sửa chữa chuẩn Gara. Minh bạch thông tin, cập nhật theo thời gian thực.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, ...mechanicalSpring }}
                        className="bg-white p-8 md:p-12 shadow-2xl border-t-4 border-stone-800 relative z-10"
                    >
                        <form onSubmit={onSearchSubmit} className="mb-8">
                            <label className="block text-sm font-bold text-stone-700 uppercase tracking-widest mb-3">Nhập biển số xe của Quý khách</label>
                            <div className="flex bg-[#fafa-f8] border-2 border-stone-200 focus-within:border-orange-500 transition-colors p-1">
                                <input
                                    type="text"
                                    placeholder="Ví dụ: 30A-123.45"
                                    className="w-full bg-white text-stone-900 px-6 py-4 outline-none uppercase font-mono text-xl"
                                    value={trackingPlate}
                                    onChange={e => setTrackingPlate(e.target.value)}
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={isTracking || !trackingPlate.trim()}
                                    className="bg-stone-900 hover:bg-orange-600 disabled:bg-stone-300 text-white px-8 md:px-12 font-bold flex items-center justify-center transition-colors shrink-0 text-lg"
                                >
                                    {isTracking ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "TRA CỨU"}
                                </button>
                            </div>
                            {trackError && <div className="text-red-500 font-medium text-sm mt-3 flex items-center gap-2 animate-pulse"><Search size={14} /> {trackError}</div>}
                        </form>

                        {/* Kết quả trả về */}
                        <AnimatePresence>
                            {trackingResult && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden border-t border-stone-200 pt-8"
                                >
                                    <div className="bg-[#1C1917] text-white p-6 md:p-8 rounded-sm shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                            <Wrench size={120} />
                                        </div>

                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 relative z-10 border-b border-stone-700 pb-6">
                                            <div>
                                                <span className="text-stone-400 text-xs font-bold uppercase tracking-widest block mb-2">Thông tin tiếp nhận</span>
                                                <div className="text-3xl md:text-4xl font-black font-mono text-orange-500 mb-1">{trackingResult.bienSo}</div>
                                                <div className="text-lg font-medium text-stone-300">{trackingResult.modelXe}</div>
                                            </div>
                                            <div className="md:text-right">
                                                <span className="text-stone-400 text-xs font-bold uppercase tracking-widest block mb-2">Thời gian vào xưởng</span>
                                                <div className="text-xl font-bold">{trackingResult.ngayTiepNhan}</div>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6 relative z-10 mb-8">
                                            <div className="bg-stone-800/50 p-5 border-l-4 border-orange-600">
                                                <span className="text-stone-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-3">
                                                    <FileText size={14} /> Yêu cầu sửa chữa
                                                </span>
                                                <p className="text-stone-200 leading-relaxed font-medium">
                                                    {trackingResult.yeuCauSoBo || "Bảo dưỡng tổng quát"}
                                                </p>
                                            </div>

                                            <div className="bg-stone-800/50 p-5 border-l-4 border-orange-600">
                                                <span className="text-stone-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-3">
                                                    <Settings size={14} /> Trạng thái hiện tại
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-4 h-4 rounded-full bg-orange-500 animate-pulse ring-4 ring-orange-500/30"></div>
                                                    <span className="text-white font-bold text-lg">{trackingResult.trangThaiLabel}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-stone-900 border border-stone-700 p-6 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
                                            <div className="w-full sm:w-auto text-center sm:text-left">
                                                <span className="text-stone-500 text-xs font-bold uppercase tracking-widest block mb-1">Chi phí dự kiến / Báo giá</span>
                                                <span className="text-white font-black text-2xl text-green-400">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(trackingResult.tongTien || 0)}
                                                </span>
                                            </div>
                                            <div className="w-full sm:w-auto text-center sm:text-right">
                                                <span className="text-stone-500 text-xs font-bold uppercase tracking-widest block mb-1">Đã thanh toán</span>
                                                <span className="text-stone-300 font-bold text-lg">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(trackingResult.daThanhToan || 0)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-6 text-center text-sm text-stone-500 relative z-10">
                                            <p className="flex justify-center items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> Dữ liệu tra cứu được cập nhật trực tiếp từ hệ thống phần mềm của Gara.</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    <div className="text-center mt-12 text-stone-500 text-sm">
                        <p>Trung tâm sẽ liên hệ trực tiếp với Khách hàng nếu có bất kì phát sinh nào trong quá trình thi công.</p>
                        <p className="mt-2 text-stone-400 font-medium">Hotline hỗ trợ kỹ thuật: 098.765.4321</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
