'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface IntroSectionProps {
    title?: string;
    content?: string;
    imageUrl?: string;
    hotServices: any[];
}

const mechanicalSpring = {
    type: "spring",
    stiffness: 120,
    damping: 14,
    mass: 1.2
} as const;

const hardSlideInLeft = {
    hidden: { x: -60, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
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

export default function IntroSection({
    title,
    content,
    imageUrl,
    hotServices
}: IntroSectionProps) {
    const displayTitle = title || "Giải pháp toàn diện cho xế hộp của bạn";
    const displaySubtitle = content || "Các Hạng Mục Trọng Tâm";
    const displayImage = imageUrl || "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";

    return (
        <section className="py-24 md:py-32 bg-white relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24 mb-32">
                    <motion.div
                        variants={hardSlideInLeft}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        className="w-full lg:w-1/2 order-2 lg:order-1 relative"
                    >
                        <div className="relative z-10 before:absolute before:inset-0 before:-translate-x-4 before:translate-y-4 before:bg-stone-100 before:-z-10">
                            <img
                                src={displayImage}
                                alt="Sửa chữa gầm xe thực tế"
                                className="w-full h-auto object-cover shadow-2xl"
                            />
                        </div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={mechanicalSpring}
                            className="absolute -bottom-8 -right-8 bg-[#1C1917] text-white p-6 shadow-xl z-20 max-w-xs border-l-4 border-orange-500 cursor-default"
                        >
                            <div className="flex items-start gap-4">
                                <CheckCircle2 size={32} className="text-orange-500 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-lg mb-1">Kiểm tra xe miễn phí</h4>
                                    <p className="!text-stone-100 text-sm italic font-medium">Sử dụng máy test OBD chuyên hãng để báo lỗi nhanh nhất.</p>
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
                        <motion.h2 variants={itemVariants} className="text-sm font-bold !text-orange-600 mb-4">{displaySubtitle}</motion.h2>
                        <motion.h3 variants={itemVariants} className="text-4xl md:text-5xl font-extrabold !text-[#111] mb-8 leading-tight">
                            {displayTitle}
                        </motion.h3>

                        <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
                            {hotServices.length > 0 ? (
                                hotServices.map((service, idx) => (
                                    <motion.li key={service.id} variants={itemVariants} className="flex items-start gap-4 group">
                                        <div className={`w-10 h-10 shrink-0 ${idx % 2 === 1 ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-stone-100 border border-stone-200 text-stone-800'} flex items-center justify-center text-lg font-bold group-hover:scale-110 transition-transform`}>
                                            0{idx + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold !text-stone-900 mb-1 group-hover:text-orange-600 transition-colors line-clamp-1">{service.tenHang}</h4>
                                            <p className="!text-stone-700 text-sm leading-relaxed font-medium">
                                                Giá niêm yết: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.giaBanNiemYet || 0)}. 
                                                {service.baoHanhSoThang > 0 && ` Bảo hành ${service.baoHanhSoThang} tháng.`}
                                            </p>
                                        </div>
                                    </motion.li>
                                ))
                            ) : (
                                [1, 2, 3, 4].map((i) => (
                                    <motion.li key={i} variants={itemVariants} className="flex items-start gap-4 opacity-40">
                                        <div className="w-10 h-10 shrink-0 bg-stone-100 border border-stone-200 flex items-center justify-center text-lg font-bold">0{i}</div>
                                        <div className="h-10 w-32 bg-stone-100 rounded" />
                                    </motion.li>
                                ))
                            )}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
