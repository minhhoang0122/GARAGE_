'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ArrowRight, MapPin, PhoneCall, Clock, ShieldCheck, Wrench, Settings, Search, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
    const { data: session } = useSession();

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
            <div className="bg-[#1C1917] text-stone-300 py-2.5 px-4 text-xs md:text-sm font-medium">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2"><MapPin size={16} className="text-orange-500" /> 123 Đường Láng, Hà Nội</span>
                        <span className="flex items-center gap-2 hidden sm:flex"><Clock size={16} className="text-orange-500" /> T2 - T7: 8:00 - 18:00</span>
                    </div>
                    <div className="flex items-center gap-2 text-white bg-orange-600/20 px-3 py-1 rounded-full border border-orange-500/30">
                        <PhoneCall size={14} className="text-orange-500" />
                        <span className="tracking-wide">Hotline Kỹ Thuật: <strong className="text-orange-400">098.765.4321</strong></span>
                    </div>
                </div>
            </div>

            {/* Hero Section - Visceral Impact */}
            <header className="relative w-full h-[85vh] min-h-[600px] flex items-center">
                {/* Background Image - Real Photography */}
                <div className="absolute inset-0 z-0">
                    <motion.img
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8 }} // Ảnh nền hơi chậm để tạo chiều sâu
                        src="https://images.unsplash.com/photo-1625047509168-a7026f36de04?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                        alt="Mechanic working on car engine"
                        className="w-full h-full object-cover object-center grayscale-[20%]"
                    />
                    {/* Dark gradient overlay so text is readable, stronger on the left */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10 w-full pt-10">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="max-w-3xl"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-sm mb-8">
                            <ShieldCheck size={18} className="text-orange-500" />
                            <span className="text-white text-sm font-medium tracking-wide uppercase">Trung Tâm Chăm Sóc & Sửa Chữa Ô Tô Toàn Diện</span>
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-white leading-[1.1] tracking-tight">
                            Bảo dưỡng định kỳ.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">
                                Đại tu động cơ.
                            </span><br />
                            Phục hồi thân vỏ.
                        </motion.h1>

                        <motion.p variants={itemVariants} className="text-lg md:text-xl mb-12 text-stone-300 max-w-xl leading-relaxed font-light">
                            Hệ thống xưởng dịch vụ quy mô lớn, kỹ thuật viên giàu kinh nghiệm cùng trang thiết bị chẩn đoán hiện đại nhập khẩu. Cam kết phụ tùng chính hãng, bảo hành dài hạn.
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5">
                            {session?.user ? (
                                <Link href="/admin" className="group bg-orange-600 hover:bg-orange-500 text-white px-8 py-5 rounded-sm font-bold transition-all shadow-[0_8px_30px_rgb(234,88,12,0.3)] hover:shadow-[0_8px_30px_rgb(234,88,12,0.5)] flex items-center justify-center gap-3 w-fit">
                                    Vào Hệ Thống Quản Lý
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ) : (
                                <Link href="/booking" className="group bg-orange-600 hover:bg-orange-500 text-white px-8 py-5 rounded-sm font-bold transition-all shadow-[0_8px_30px_rgb(234,88,12,0.3)] hover:shadow-[0_8px_30px_rgb(234,88,12,0.5)] flex items-center justify-center gap-3 w-fit text-lg">
                                    Đặt Lịch Dịch Vụ
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}

                            <div className="flex items-center gap-4 text-stone-400 mt-4 sm:mt-0">
                                <div className="flex -space-x-4">
                                    <img className="w-12 h-12 border-2 border-black rounded-full object-cover" src="https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=100&q=80" alt="Customer" />
                                    <img className="w-12 h-12 border-2 border-black rounded-full object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Customer" />
                                    <img className="w-12 h-12 border-2 border-black rounded-full object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" alt="Customer" />
                                </div>
                                <div className="text-sm font-medium leading-tight">
                                    <strong className="text-white">Uy tín lâu năm</strong><br />
                                    Hàng ngàn lượt xe/năm
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
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
                                        <p className="text-lg md:text-xl text-white font-serif italic mb-6 leading-relaxed">
                                            "Xe tôi CRV lên dốc bị giật cục, vào hãng báo giá mười mấy củ. Ra đây các thợ check bằng máy xong bổ ga ra thay cụm bướm ga và buri vệ sinh cổ hút là hết bệnh ngay. Chi phí bằng một góc."
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <h4 className="font-bold text-white">Anh Dũng - Thanh Xuân</h4>
                                                <p className="text-sm text-stone-500">Khách vãng lai • Honda CR-V 2020</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-[350px] md:w-[450px] whitespace-normal p-8 border-l-4 border-stone-700 bg-stone-900/50 hover:bg-stone-800/80 transition-colors shrink-0">
                                        <p className="text-lg md:text-xl text-white font-serif italic mb-6 leading-relaxed">
                                            "Xưởng rộng rãi, xe nằm chờ có cầu nâng đo đàng hoàng chứ ko phải kích tay ngắm bằng mắt. Bộ phận đồng sơn bên này tôi đánh giá làm kỹ, sơn xong vào buồng sấy đàng hoàng màu lên tiệp 99%."
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <h4 className="font-bold text-white">Chú Cường - Đống Đa</h4>
                                                <p className="text-sm text-stone-500">Làm đồng sơn mâm xe • GLC 200</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-[350px] md:w-[450px] whitespace-normal p-8 border-l-4 border-stone-700 bg-stone-900/50 hover:bg-stone-800/80 transition-colors shrink-0">
                                        <p className="text-lg md:text-xl text-white font-serif italic mb-6 leading-relaxed">
                                            "Thay dầu bảo dưỡng 4 vạn. Báo giá công khai trước khi làm, ko phát sinh lằng nhằng. Thợ trẻ nhưng tháo lắp đồ nhựa dứt khoát không gãy ngàm. Lần sau đến kỳ sẽ quay lại tiếp tục."
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
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-8">Xe đang bệnh? Để thợ chúng tôi khám.</h2>
                    <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90">Gọi hotline báo tình trạng hoặc đặt lịch mang xe qua xưởng. Chúng tôi cắm máy đọc lỗi miễn phí.</p>

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
                            <a href="/admin" className="text-orange-500 hover:text-orange-400 font-medium underline underline-offset-4 decoration-orange-500/30">Cổng đăng nhập hệ thống (Nội bộ)</a>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-stone-800 text-sm flex justify-between items-center">
                        <p>© 2026 Garage Master. Coder bằng cơm, hỏng xe bằng mỏ lết.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
