'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ArrowRight, MapPin, PhoneCall, Clock, ShieldCheck, Wrench, Settings, Search, CheckCircle2, Menu, User, CarFront, LayoutDashboard, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { getHomeRoute } from '@/lib/routes';

export default function LandingPage() {
    const { data: session, status } = useSession();
    const [trackingPlate, setTrackingPlate] = useState('');
    const [trackingResult, setTrackingResult] = useState<any>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [trackError, setTrackError] = useState('');

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackingPlate.trim()) return;
        setIsTracking(true);
        setTrackError('');
        try {
            // Use getCached with SWR support
            const data = await api.getCached(`/public/tracking?bienSo=${trackingPlate}`, undefined);
            if (data && data.success) {
                setTrackingResult(data);
            } else {
                setTrackError((data as any)?.message || 'Không tìm thấy dữ liệu.');
                setTrackingResult(null);
            }
        } catch (error) {
            setTrackError('Lỗi kết nối hoặc mất mạng.');
        } finally {
            setIsTracking(false);
        }
    }

    // Định nghĩa các variant motion theo phong cách "Cơ khí": Nhanh, có độ nảy mạnh, dứt khoát
    // Khác với Thagore lả lướt mỏng manh
    const mechanicalSpring = {
        type: "spring" as const,
        stiffness: 400,
        damping: 25 // Độ nảy thấp, dừng lại nhanh
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1, // Chữ xuất hiện rất nhanh
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },   // Thay vì trượt dài từ dưới lên, chỉ scale và opacity
        show: { opacity: 1, scale: 1, transition: mechanicalSpring }
    };

    const hardSlideInLeft = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: mechanicalSpring }
    };

    const hardSlideInRight = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0, transition: mechanicalSpring }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#fafaf8] selection:bg-orange-200 overflow-x-hidden">
            {/* Top Bar - Trust Signal First */}
            <div className="bg-[#1C1917] text-stone-400 py-1.5 px-4 text-xs font-medium border-b border-white/10 hidden md:block">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-orange-500" /> 123 Đường Láng, Đống Đa, HN</span>
                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-orange-500" /> T2 - T7: 8:00 - 18:00 | CN: Nghỉ</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {status === 'authenticated' ? (
                            <div className="flex items-center gap-4">
                                <Link href={getHomeRoute((session?.user as any)?.roles || [])} className="text-orange-400 hover:text-white transition-colors flex items-center gap-1.5 font-bold uppercase">
                                    <LayoutDashboard size={14} /> Đi tới Hệ thống
                                </Link>
                                <button onClick={() => signOut()} className="text-stone-400 hover:text-red-400 transition-colors text-xs font-bold uppercase flex items-center gap-1">
                                    <LogOut size={12} /> Thoát
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/customer/login" className="text-orange-400 hover:text-white transition-colors font-bold">Khách hàng</Link>
                                <span className="text-stone-600">|</span>
                                <Link href="/login" className="text-stone-500 hover:text-white transition-colors">Nội bộ xưởng</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Bar */}
            <nav className="bg-[#111] text-white/90 sticky top-0 z-50 border-b border-white/10 shadow-xl">
                <div className="container mx-auto px-4 lg:px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-orange-600 rounded flex items-center justify-center font-black text-white text-xl border-b-4 border-orange-800">
                            GM
                        </div>
                        <span className="font-extrabold text-xl tracking-tight uppercase">Garage Master</span>
                    </Link>

                    <div className="hidden lg:flex items-center gap-8 font-semibold text-sm">
                        <Link href="/services" className="hover:text-orange-500 transition-colors">BẢNG GIÁ DỊCH VỤ</Link>
                        <a href="#quy-trinh" className="hover:text-orange-500 transition-colors">QUY TRÌNH</a>
                        <a href="#co-so" className="hover:text-orange-500 transition-colors">CƠ SỞ VẬT CHẤT</a>
                        <div className="flex items-center gap-2 text-orange-500 ml-4 font-bold text-lg">
                            <PhoneCall size={20} className="animate-pulse" /> 098.765.4321
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {status === 'authenticated' ? (
                            <div className="flex items-center gap-2">
                                <Link href={getHomeRoute((session?.user as any)?.roles || [])} className="hidden sm:flex items-center gap-2 bg-orange-600 hover:bg-orange-500 border border-orange-700 px-5 py-2.5 rounded text-sm font-bold transition-colors shadow-lg">
                                    <LayoutDashboard size={16} /> TRANG CHỦ LÀM VIỆC
                                </Link>
                                <button onClick={() => signOut()} className="hidden sm:flex items-center justify-center p-2.5 bg-stone-800 hover:bg-red-900/40 text-stone-400 hover:text-red-400 rounded transition-colors border border-stone-700">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center gap-2">
                                <Link href="/customer/login" className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 border border-orange-700 px-5 py-2.5 rounded text-sm font-bold transition-colors shadow-lg text-white">
                                    <User size={16} /> Đăng Nhập
                                </Link>
                                <Link href="/login" className="flex items-center gap-2 bg-[#1C1917] hover:bg-stone-800 border border-stone-700 px-4 py-2.5 rounded text-xs font-medium transition-colors text-stone-400 hover:text-white">
                                    Nội bộ
                                </Link>
                            </div>
                        )}
                        <button className="lg:hidden p-2 text-stone-400 hover:text-white"><Menu size={24} /></button>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Visceral Impact with Tracking Widget */}
            <header className="relative w-full min-h-[85vh] flex items-center py-20 pb-20">
                {/* Background Image - Real Photography */}
                <div className="absolute inset-0 z-0 bg-[#0a0a0a]">
                    <motion.img
                        initial={{ scale: 1.05, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.6 }}
                        transition={{ duration: 0.8 }}
                        src="https://images.unsplash.com/photo-1625047509168-a7026f36de04?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
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
                                <span className="text-orange-400 text-xs font-bold tracking-widest uppercase">Trung tâm chăm sóc xe hiện đại</span>
                            </motion.div>

                            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-white leading-[1.1] tracking-tight">
                                Minh bạch quy trình.<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">
                                    Chi phí hợp lý.
                                </span>
                            </motion.h1>

                            <motion.p variants={itemVariants} className="text-lg md:text-xl mb-10 text-stone-300 max-w-xl leading-relaxed font-light">
                                Chẩn đoán chuyên sâu bằng thiết bị hiện đại. Báo giá chi tiết phụ tùng và nhân công. Cam kết chất lượng, tiến hành sửa chữa sau khi Khách hàng chốt phương án.
                            </motion.p>

                            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-4 lg:mb-0">
                                <Link href="/booking" className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-sm font-bold transition-all flex items-center justify-center gap-3 w-fit text-lg">
                                    Đặt Lịch Mang Xe Tới Xưởng
                                    <ArrowRight size={20} />
                                </Link>
                                <Link href="/services" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-sm font-bold transition-all flex items-center justify-center w-fit text-lg">
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
                                <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Kiểm tra tiến độ dịch vụ</h2>
                                <p className="text-stone-400 text-sm mb-6 relative z-10">Vui lòng nhập biển số xe để tra cứu trạng thái sửa chữa hiện tại.</p>

                                <form onSubmit={handleTrack} className="space-y-4 relative z-10">
                                    <div>
                                        <div className="flex bg-[#111] border border-stone-700 focus-within:border-orange-500 transition-colors p-1">
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
                                    </div>
                                </form>

                                {/* Tracking Results Modal */}
                                <AnimatePresence>
                                    {trackingResult && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-6 pt-6 border-t border-stone-800 relative z-10 overflow-hidden"
                                        >
                                            <div className="flex justify-between items-start mb-5">
                                                <div>
                                                    <span className="text-stone-500 text-xs uppercase tracking-wider block mb-1">Cần check</span>
                                                    <span className="text-white font-mono font-bold text-xl">{trackingResult.bienSo}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-stone-500 text-xs uppercase tracking-wider block mb-1">Dòng xe</span>
                                                    <span className="text-white font-medium">{trackingResult.modelXe}</span>
                                                </div>
                                            </div>
                                            <div className="bg-orange-900/30 border border-orange-500/30 p-4 mb-5 rounded shadow-inner">
                                                <span className="text-orange-500 text-[10px] sm:text-xs uppercase font-bold tracking-widest block mb-2">Trạng thái công việc</span>
                                                <span className="text-orange-100 font-bold sm:text-lg flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse ring-4 ring-orange-500/30"></div>
                                                    {trackingResult.trangThaiLabel}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-end bg-black/40 p-4 rounded border border-white/5">
                                                <div>
                                                    <span className="text-stone-500 text-xs uppercase tracking-wider block mb-1">Đã trả KH</span>
                                                    <span className="text-stone-400 font-medium">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(trackingResult.daThanhToan || 0)}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-stone-500 text-xs uppercase tracking-wider block mb-1">Hoá đơn tạm tính</span>
                                                    <span className="text-white font-black text-xl text-green-400">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(trackingResult.tongTien || 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="mt-8 pt-6 border-t border-stone-800 text-center relative z-10">
                                    <p className="text-stone-500 text-sm mb-3">Chủ xe cần xem chi tiết hạng mục, phụ tùng?</p>
                                    <Link href="/customer/login" className="inline-flex items-center gap-2 text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 px-4 py-2 rounded transition-colors text-sm font-medium">
                                        {status === 'authenticated' ? 'Đi tới trang quản lý' : 'Đăng nhập xem hoá đơn'} <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </header>

            {/* Visual Storytelling Section - Asymmetric Layout (Anti-Grid) */}
            <section className="py-24 md:py-32 bg-white relative overflow-hidden">
                <div className="container mx-auto px-6">
                    {/* Story Block 1 */}
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24 mb-32">
                        <motion.div
                            variants={hardSlideInLeft}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            className="w-full lg:w-1/2 order-2 lg:order-1 relative"
                        >
                            {/* Real Image, Imperfect Shape */}
                            <div className="relative z-10 before:absolute before:inset-0 before:-translate-x-4 before:translate-y-4 before:bg-stone-100 before:-z-10">
                                <img
                                    src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                    alt="Sửa chữa gầm xe thực tế"
                                    className="w-full h-auto object-cover shadow-2xl"
                                />
                            </div>

                            {/* Floating Stats Block */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={mechanicalSpring}
                                className="absolute -bottom-8 -right-8 bg-[#1C1917] text-white p-6 shadow-xl z-20 max-w-xs border-l-4 border-orange-500 cursor-default"
                            >
                                <div className="flex items-start gap-4">
                                    <CheckCircle2 size={32} className="text-orange-500 shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">Kiểm tra xe miễn phí</h4>
                                        <p className="text-stone-400 text-sm">Sử dụng máy test OBD chuyên hãng để báo lỗi nhanh nhất.</p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, amount: 0.3 }}
                            className="w-full lg:w-1/2 order-1 lg:order-2"
                        >
                            <motion.h2 variants={itemVariants} className="text-sm font-bold text-orange-600 tracking-widest uppercase mb-4 uppercase">Các Hạng Mục Trọng Tâm</motion.h2>
                            <motion.h3 variants={itemVariants} className="text-4xl md:text-5xl font-extrabold text-[#111] mb-8 leading-tight">
                                Giải pháp toàn diện cho xế hộp của bạn
                            </motion.h3>

                            <ul className="space-y-8">
                                <motion.li variants={itemVariants} className="flex items-start gap-5">
                                    <div className="w-12 h-12 shrink-0 bg-stone-100 border border-stone-200 flex items-center justify-center text-xl font-bold text-stone-800">01</div>
                                    <div>
                                        <h4 className="text-xl font-bold text-stone-900 mb-2">Bảo dưỡng máy gầm, điện & phần mềm</h4>
                                        <p className="text-stone-600 leading-relaxed">Đại tu động cơ, hộp số. Khắc phục triệt để tiếng kêu gầm, xử lý hệ thống treo, thước lái. Chẩn đoán và xóa lỗi hệ thống điện tử nhanh chóng.</p>
                                    </div>
                                </motion.li>
                                <motion.li variants={itemVariants} className="flex items-start gap-5">
                                    <div className="w-12 h-12 shrink-0 bg-stone-100 border border-stone-200 flex items-center justify-center text-xl font-bold text-stone-800">02</div>
                                    <div>
                                        <h4 className="text-xl font-bold text-stone-900 mb-2">Đồng sơn gò hàn & Phục hồi bề mặt</h4>
                                        <p className="text-stone-600 leading-relaxed">Xử lý móp méo cản trước sau, trầy xước nước sơn. Sơn quây toàn bộ xe, đánh bóng phủ ceramic giúp xe lấy lại vẻ đẹp nguyên bản.</p>
                                    </div>
                                </motion.li>
                                <motion.li variants={itemVariants} className="flex items-start gap-5">
                                    <div className="w-12 h-12 shrink-0 bg-orange-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-orange-600/20">03</div>
                                    <div>
                                        <h4 className="text-xl font-bold text-stone-900 mb-2">Bảo dưỡng điều hòa & Thay dầu định kỳ</h4>
                                        <p className="text-stone-600 leading-relaxed">Thông rửa giàn lạnh, thay lốc lạnh, nạp gas bổ sung. Thay dầu nhớt nhập khẩu Castrol, Mobil 1 tiêu chuẩn, làm sạch buồng đốt tẩy muội than.</p>
                                    </div>
                                </motion.li>
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Working Process - Raw & Transparent */}
            <section id="quy-trinh" className="py-24 bg-stone-100 border-y border-stone-200">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-4">Các Bước Thực Hiện</h2>
                        <h3 className="text-4xl md:text-5xl font-extrabold text-stone-900 leading-tight">Quy trình 4 bước <br className="hidden md:block" /> bảo dưỡng chuyên sâu</h3>
                        <p className="mt-6 text-stone-600 text-lg">Khách hàng chốt phương án trước khi thi công. Trung tâm cam kết chất lượng phụ tùng chính hãng và minh bạch tuyệt đối về chi phí.</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 md:gap-8">
                        {[
                            { step: '01', title: 'Khảo Sát Nhu Cầu', desc: 'Cố vấn dịch vụ tiếp nhận xe, lắng nghe yêu cầu của Quý khách và sử dụng máy chẩn đoán chuyên sâu để xác định tình trạng.' },
                            { step: '02', title: 'Tư Vấn & Báo Giá', desc: 'Đưa ra phương án sửa chữa tối ưu, minh bạch báo giá phụ tùng và nhân công. Chỉ tiến hành khi Quý khách chốt phương án.' },
                            { step: '03', title: 'Thực Hiện Dịch Vụ', desc: 'Đội ngũ Kỹ thuật viên chuyên nghiệp tiến hành bảo dưỡng chuyên sâu, thay thế phụ tùng chính hãng tại khu vực cầu nâng.' },
                            { step: '04', title: 'Quy Trình KCS', desc: 'Kiểm tra chất lượng (KCS) toàn diện, vệ sinh buồng đốt/khoang máy, vận hành thử xe trên đường thực tế trước khi bàn giao.' }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-8 md:p-10 border-t-4 border-stone-300 hover:border-orange-500 hover:shadow-2xl transition-all relative group cursor-default">
                                <div className="text-6xl md:text-7xl font-black text-stone-100 absolute top-4 right-4 z-0 transition-colors group-hover:text-orange-50">
                                    {item.step}
                                </div>
                                <h4 className="text-xl font-bold mb-4 mt-6 relative z-10 text-stone-900 group-hover:text-orange-600 transition-colors">{item.title}</h4>
                                <p className="text-stone-600 text-sm leading-relaxed relative z-10">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Facilities & Tools - Real Proof */}
            <section id="co-so" className="py-24 bg-white overflow-hidden relative">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={mechanicalSpring}
                            className="w-full lg:w-5/12"
                        >
                            <h2 className="text-4xl md:text-5xl font-extrabold text-[#111] mb-6 leading-tight">Hệ thống trang thiết bị<br /> hiện đại, toàn diện.</h2>
                            <p className="text-lg text-stone-600 mb-10 leading-relaxed">Được đầu tư bài bản với máy móc nhập khẩu chuyên dụng, Trung tâm chúng tôi cam kết đáp ứng mọi tiêu chuẩn khắt khe nhất trong quá trình chẩn đoán và sửa chữa, đem lại sự an tâm tuyệt đối cho Quý khách.</p>

                            <div className="grid grid-cols-2 gap-x-8 gap-y-10">
                                <div>
                                    <div className="text-4xl font-black text-orange-600 mb-2">10+</div>
                                    <div className="font-bold text-stone-800 text-lg uppercase tracking-wide">Cầu Nâng Sức Mẻo</div>
                                    <p className="text-stone-500 text-sm mt-3 leading-relaxed">Hệ thống cầu nâng 2 trụ, 4 trụ cân chỉnh thước lái phục vụ gầm cao lẫn sedan hạng D.</p>
                                </div>
                                <div>
                                    <div className="text-4xl font-black text-orange-600 mb-2">02</div>
                                    <div className="font-bold text-stone-800 text-lg uppercase tracking-wide">Phòng Sơn Sấy</div>
                                    <p className="text-stone-500 text-sm mt-3 leading-relaxed">Cách ly hoàn toàn hạt bụi, hệ thống khò sấy bằng hồng ngoại giúp sơn chín tiệp màu 100%.</p>
                                </div>
                                <div>
                                    <div className="text-4xl font-black text-orange-600 mb-2">100%</div>
                                    <div className="font-bold text-stone-800 text-lg uppercase tracking-wide">Test Lỗi Hãng</div>
                                    <p className="text-stone-500 text-sm mt-3 leading-relaxed">Có đủ máy VCI chẩn đoán hộp đen cho Mercedes, BMW, Audi, Lexus đến xe phổ thông.</p>
                                </div>
                                <div>
                                    <div className="text-4xl font-black text-orange-600 mb-2">30+</div>
                                    <div className="font-bold text-stone-800 text-lg uppercase tracking-wide">Đội Ngũ Kỹ Thuật</div>
                                    <p className="text-stone-500 text-sm mt-3 leading-relaxed">Kỹ thuật viên chuyên nghiệp, giàu kinh nghiệm, phân bổ độc lập chuyên môn theo từng mảng: máy-gầm, điện, đồng sơn.</p>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, ...mechanicalSpring }}
                            className="w-full lg:w-7/12 grid grid-cols-2 gap-4 h-[500px] md:h-[600px] lg:h-[700px]"
                        >
                            {/* Raw Real Images from Garage */}
                            <div className="col-span-1 p-2 bg-stone-100 shadow-xl overflow-hidden group">
                                <img src="https://images.unsplash.com/photo-1504222490345-c075b6008014?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Thợ cơ khí chuyên nghiệp" />
                            </div>
                            <div className="col-span-1 grid grid-rows-2 gap-4 h-full">
                                <div className="p-2 bg-stone-100 shadow-xl overflow-hidden group">
                                    <img src="https://images.unsplash.com/photo-1493238792000-8113da705763?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Cầu nâng xe gầm" />
                                </div>
                                <div className="p-2 bg-stone-100 shadow-xl overflow-hidden group">
                                    <img src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Sơn xe chuyên nghiệp buồng sấy" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Social Proof - Raw Typography style, No sliders */}
            <section className="py-24 bg-[#1C1917] text-stone-300">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={mechanicalSpring}
                        viewport={{ once: true, amount: 0.8 }}
                        className="text-center max-w-2xl mx-auto mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Đánh giá từ khách hàng</h2>
                        <p className="text-lg text-stone-400">Gara đã đón nhận sự tin tưởng của đông đảo các hội nhóm xe tại Hà Nội.</p>
                    </motion.div>

                    {/* Infinite Marquee Container */}
                    <div className="relative w-full overflow-hidden flex py-4">
                        {/* Gradient Masks for smooth fading edges */}
                        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-[#1C1917] to-transparent z-10 pointer-events-none"></div>
                        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-[#1C1917] to-transparent z-10 pointer-events-none"></div>

                        <motion.div
                            className="flex gap-8 whitespace-nowrap min-w-max"
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
                        >
                            {/* Duplicate items 2 times to create seamless infinite loop */}
                            {[1, 2].map((loopIndex) => (
                                <div key={loopIndex} className="flex gap-8">
                                    <div className="w-[350px] md:w-[450px] whitespace-normal p-8 border-l-4 border-stone-700 bg-stone-900/50 hover:bg-stone-800/80 transition-colors shrink-0">
                                        <p className="text-lg md:text-xl text-stone-300 italic font-light mb-6 leading-relaxed">
                                            "Xe CRV của tôi gặp sự cố lên dốc bị giật cục. Mặc dù tình trạng khá nan giải nhưng kỹ thuật viên tại Garage Master đã chẩn đoán chính xác bằng thiết bị chuyên dùng. Thay thế cụm bướm ga theo đúng khuyến cáo giúp xe hoạt động êm ái trở lại. Cố vấn dịch vụ tư vấn rất chuẩn xác."
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <h4 className="font-bold text-white">Anh Dũng - Thanh Xuân</h4>
                                                <p className="text-sm text-stone-500">Khách vãng lai • Honda CR-V 2020</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-[350px] md:w-[450px] whitespace-normal p-8 border-l-4 border-stone-700 bg-stone-900/50 hover:bg-stone-800/80 transition-colors shrink-0">
                                        <p className="text-lg md:text-xl text-stone-300 italic font-light mb-6 leading-relaxed">
                                            "Không gian xưởng rất chuyên nghiệp, quy trình tiếp nhận và đưa xe lên cầu nâng rõ ràng, bài bản. Bề mặt sơn sau khi xử lý tại phòng sấy tiêu chuẩn cho màu sắc tiệp 99% so với nguyên bản. Rất đáng tin cậy."
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <h4 className="font-bold text-white">Chú Cường - Đống Đa</h4>
                                                <p className="text-sm text-stone-500">Làm đồng sơn mâm xe • GLC 200</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-[350px] md:w-[450px] whitespace-normal p-8 border-l-4 border-stone-700 bg-stone-900/50 hover:bg-stone-800/80 transition-colors shrink-0">
                                        <p className="text-lg md:text-xl text-stone-300 italic font-light mb-6 leading-relaxed">
                                            "Tới bảo dưỡng mốc 4 vạn km. Cố vấn dịch vụ báo giá công khai minh bạch ngay từ đầu. Thao tác tháo lắp của đội ngũ kỹ thuật rất chuẩn xác. Chắc chắn tôi sẽ tiếp tục ủng hộ Trung tâm vào lần tới."
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <h4 className="font-bold text-white">Anh Việt - Long Biên</h4>
                                                <p className="text-sm text-stone-500">Bảo dưỡng định kỳ • Mazda CX-5</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-24 bg-orange-600 text-white relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-10 mix-blend-multiply">
                    <img src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" alt="garage texture" className="w-full h-full object-cover" />
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={mechanicalSpring}
                    viewport={{ once: true, amount: 0.5 }}
                    className="container mx-auto px-6 relative z-10 text-center"
                >
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-8">Xe cần bảo dưỡng? Đội ngũ chuyên gia luôn sẵn sàng.</h2>
                    <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90">Quý khách vui lòng gọi Hotline để được tư vấn hoặc đặt lịch hẹn trực tiếp. Chúng tôi hỗ trợ chẩn đoán tổng quát miễn phí bằng máy chuyên dụng.</p>

                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <Link href="/booking" className="bg-[#111] hover:bg-black text-white px-10 py-5 font-bold shadow-2xl transition-transform active:scale-95 text-lg shrink-0">
                            Mang xe qua xưởng ngay
                        </Link>
                        <a href="tel:0987654321" className="bg-transparent border-2 border-white/30 hover:border-white text-white px-10 py-5 font-bold text-lg flex items-center justify-center gap-3 transition-transform active:scale-95">
                            <PhoneCall size={20} />
                            Gọi 098.765.4321
                        </a>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="py-16 bg-[#111] text-stone-500">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-6 text-white text-xl font-bold">
                                GARAGEMASTER
                            </div>
                            <p className="max-w-md mb-6 leading-relaxed">
                                Xưởng dịch vụ ô tô cung cấp giải pháp sửa chữa thực dụng, chính xác với chi phí cực kỳ hợp lý cho chủ xe tại Hà Nội.
                            </p>
                            <div className="space-y-2">
                                <p className="flex items-center gap-3"><MapPin size={18} /> 123 Đường Láng, Đống Đa, Hà Nội</p>
                                <p className="flex items-center gap-3"><PhoneCall size={18} /> 098.765.4321</p>
                            </div>
                        </div>
                        <div className="md:text-right">
                            {/* Empty or secondary links */}
                        </div>
                    </div>
                    <div className="pt-8 border-t border-stone-800 text-sm flex justify-between items-center">
                        <p>© 2026 Garage Master. Cung cấp dịch vụ chăm sóc ô tô toàn diện và đẳng cấp.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
