'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, ArrowRight, CarFront, Search } from 'lucide-react';

interface HeroSectionProps {
    title?: string;
    content?: string;
    imageUrl?: string;
    status: string;
    isStaff: boolean;
    trackingPlate: string;
    setTrackingPlate: (val: string) => void;
    handleTrack: (e: React.FormEvent) => void;
    isTracking: boolean;
    trackError: string;
    trackingResult: any;
}

const mechanicalSpring = {
    type: "spring",
    stiffness: 120,
    damping: 14,
    mass: 1.2
} as const;

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: mechanicalSpring }
};

export default function HeroSection({
    title,
    content,
    imageUrl,
    status,
    isStaff,
    trackingPlate,
    setTrackingPlate,
    handleTrack,
    isTracking,
    trackError,
    trackingResult
}: HeroSectionProps) {
    // Giá trị mặc định nếu ko có dữ liệu từ CMS
    const displayTitle = title || "Minh bạch quy trình.<br />Chi phí hợp lý.";
    const displayContent = content || "Chẩn đoán chuyên sâu bằng thiết bị hiện đại. Báo giá chi tiết phụ tùng và nhân công. Cam kết chất lượng, tiến hành sửa chữa sau khi Khách hàng chốt phương án.";
    const displayImage = imageUrl || "https://images.unsplash.com/photo-1625047509168-a7026f36de04?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80";

    return (
        <header className="relative w-full min-h-[85vh] flex items-center py-20 pb-20 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0 bg-[#0a0a0a]">
                <motion.img
                    initial={{ scale: 1.05, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.6 }}
                    transition={{ duration: 0.8 }}
                    src={displayImage}
                    alt="Mechanic working on car engine"
                    className="w-full h-full object-cover object-center grayscale-[30%] mix-blend-luminosity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10 w-full mt-10">
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="lg:col-span-7"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-600/20 border border-orange-500/30 rounded-sm mb-6">
                            <Wrench size={16} className="text-orange-500" />
                            <span className="text-orange-400 text-xs font-bold">Trung tâm chăm sóc xe hiện đại</span>
                        </motion.div>

                        <motion.h1 
                            variants={itemVariants} 
                            className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 !text-white leading-[1.1] tracking-tight"
                            dangerouslySetInnerHTML={{ __html: displayTitle }}
                        />

                        <motion.p variants={itemVariants} className="text-lg md:text-xl mb-10 !text-stone-100 max-w-xl leading-relaxed font-semibold">
                            {displayContent}
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-4 lg:mb-0">
                            {status === 'unauthenticated' ? (
                                <Link href="/customer/login" className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-sm font-bold transition-all flex items-center justify-center gap-3 w-fit text-lg shadow-lg shadow-orange-600/20">
                                    Đăng Nhập Để Đặt Lịch
                                    <ArrowRight size={20} />
                                </Link>
                            ) : isStaff ? (
                                <Link href="/admin/sale/reception" className="bg-stone-800 hover:bg-black text-white px-8 py-4 rounded-sm font-bold transition-all flex items-center justify-center gap-3 w-fit text-lg border border-stone-700">
                                    Hệ Thống Tiếp Nhận (Nội Bộ)
                                    <ArrowRight size={20} />
                                </Link>
                            ) : (
                                <Link href="/booking" className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-sm font-bold transition-all flex items-center justify-center gap-3 w-fit text-lg shadow-lg shadow-orange-600/20">
                                    Đặt Lịch Mang Xe Tới Xưởng
                                    <ArrowRight size={20} />
                                </Link>
                            )}
                            <Link href="/services" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-sm font-bold transition-all flex items-center justify-center w-fit text-lg backdrop-blur-sm">
                                Xem bảng giá sửa chữa
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Fast Track Widget */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, ...mechanicalSpring }}
                        className="lg:col-span-5 w-full max-w-[450px] mx-auto lg:ml-auto block shrink-0"
                    >
                        <div className="bg-[#1C1917] p-8 md:p-10 border-t-4 border-orange-600 shadow-2xl relative w-full">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <CarFront size={100} />
                            </div>
                            <h2 className="text-2xl font-bold !text-white mb-2 relative z-10">Kiểm tra tiến độ dịch vụ</h2>
                            <p className="!text-white/80 text-sm mb-6 relative z-10 font-medium italic">Vui lòng nhập biển số xe để tra cứu trạng thái sửa chữa hiện tại.</p>

                            <form onSubmit={handleTrack} className="space-y-4 relative z-10">
                                <div className="flex bg-[#111] border border-stone-700 focus-within:border-orange-500 transition-colors p-1 group">
                                    <input
                                        type="text"
                                        placeholder="Biển số VD: 30A-123.45"
                                        className="w-full bg-transparent text-white px-4 py-3 outline-none uppercase font-mono text-lg"
                                        value={trackingPlate}
                                        onChange={e => setTrackingPlate(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isTracking || !trackingPlate.trim()}
                                        className="bg-orange-600 hover:bg-orange-500 disabled:bg-stone-700 text-white px-6 font-bold flex items-center justify-center transition-colors shrink-0"
                                    >
                                        {isTracking ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={20} />}
                                    </button>
                                </div>
                                {trackError && <div className="text-red-400 text-sm mt-3 animate-pulse">{trackError}</div>}
                            </form>

                            {/* Tracking Results */}
                            <AnimatePresence>
                                {trackingResult && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        transition={{ type: "spring", stiffness: 100, damping: 20, mass: 1, delay: 1.5 } as const}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-6 pt-6 border-t border-stone-800 relative z-10 overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start mb-5">
                                            <div>
                                                <span className="!text-stone-200 text-xs font-black block mb-1 uppercase tracking-wider">Cần kiểm tra</span>
                                                <span className="!text-white font-mono font-bold text-xl">{trackingResult.plateNumber || trackingResult.plate || trackingResult.bienSo}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="!text-stone-200 text-xs font-black block mb-1 uppercase tracking-wider">Dòng xe</span>
                                                <span className="!text-white font-medium">{trackingResult.vehicleModel || trackingResult.modelXe || trackingResult.model}</span>
                                            </div>
                                        </div>
                                        <div className="bg-orange-900/30 border border-orange-500/30 p-4 mb-5 rounded shadow-inner">
                                            <span className="text-orange-500 text-[10px] sm:text-xs font-bold block mb-2">Trạng thái công việc</span>
                                            <span className="text-orange-100 font-bold sm:text-lg flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse ring-4 ring-orange-500/30"></div>
                                                <span className="!text-orange-100 font-bold sm:text-lg">
                                                    {trackingResult.statusLabel || trackingResult.trangThaiLabel || trackingResult.status}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-end bg-black/40 p-4 rounded border border-white/5">
                                            <div>
                                                <span className="!text-stone-200 text-xs font-black block mb-1 uppercase tracking-wider">Đã thanh toán</span>
                                                <span className="!text-stone-100 font-bold font-mono text-sm">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(trackingResult.paidAmount ?? trackingResult.daThanhToan ?? 0)}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-stone-200 text-xs font-black block mb-1 uppercase tracking-wider">Tổng tiền tạm tính</span>
                                                <span className="text-white font-bold text-xl text-green-400 font-mono">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(trackingResult.totalAmount ?? trackingResult.grandTotal ?? trackingResult.tongTien ?? 0)}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="mt-8 pt-6 border-t border-stone-800 text-center relative z-10">
                                <p className="text-stone-300 text-sm mb-3">Chủ xe cần xem chi tiết hạng mục, phụ tùng?</p>
                                <Link href="/customer/login" className="inline-flex items-center gap-2 text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 px-4 py-2 rounded transition-colors text-sm font-medium">
                                    {status === 'authenticated' ? 'Đi tới trang quản lý' : 'Đăng nhập xem hoá đơn'} <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </header>
    );
}
