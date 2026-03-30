'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PhoneCall } from 'lucide-react';

interface CTASectionProps {
    title?: string;
    content?: string;
    imageUrl?: string;
    status: string;
    isStaff: boolean;
}

const mechanicalSpring = {
    type: "spring",
    stiffness: 120,
    damping: 14,
    mass: 1.2
} as const;

export default function CTASection({
    title,
    content,
    imageUrl,
    status,
    isStaff
}: CTASectionProps) {
    const displayTitle = title || "Xe cần bảo dưỡng? Đội ngũ chuyên gia luôn sẵn sàng.";
    const displayDesc = content || "Quý khách vui lòng gọi Hotline để được tư vấn hoặc đặt lịch hẹn trực tiếp. Chúng tôi hỗ trợ chẩn đoán tổng quát miễn phí bằng máy chuyên dụng.";
    const displayImage = imageUrl || "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80";

    return (
        <section className="py-24 bg-orange-600 text-white relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-10 mix-blend-multiply">
                <img src={displayImage} alt="garage texture" className="w-full h-full object-cover" />
            </div>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={mechanicalSpring}
                viewport={{ once: true, amount: 0.5 }}
                className="container mx-auto px-6 relative z-10 text-center"
            >
                <h2 className="text-4xl md:text-5xl font-extrabold mb-8 transition-all hover:scale-[1.01] text-white">
                    {displayTitle}
                </h2>
                <p className="text-xl mb-12 max-w-2xl mx-auto !text-stone-100 leading-relaxed font-bold italic">
                    {displayDesc}
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-6">
                    {status === 'unauthenticated' ? (
                        <Link href="/customer/login" className="bg-[#111] hover:bg-black text-white px-10 py-5 font-bold shadow-2xl transition-all active:scale-95 text-lg shrink-0">
                            Đăng nhập & Đặt lịch
                        </Link>
                    ) : isStaff ? (
                        <Link href="/admin/sale/reception" className="bg-stone-800 hover:bg-stone-900 text-white px-10 py-5 font-bold shadow-2xl transition-all active:scale-95 text-lg shrink-0">
                            Đi tới Trang Tiếp nhận
                        </Link>
                    ) : (
                        <Link href="/booking" className="bg-[#111] hover:bg-black text-white px-10 py-5 font-bold shadow-2xl transition-all active:scale-95 text-lg shrink-0">
                            Mang xe qua xưởng ngay
                        </Link>
                    )}
                    <a href="tel:0987654321" className="bg-transparent border-2 border-white/30 hover:border-white text-white px-10 py-5 font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95">
                        <PhoneCall size={20} />
                        Gọi 098.765.4321
                    </a>
                </div>
            </motion.div>
        </section>
    );
}
