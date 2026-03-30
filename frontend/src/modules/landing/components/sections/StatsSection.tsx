'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, Clock, Award } from 'lucide-react';

interface StatsSectionProps {
    title?: string;
    content?: string;
}

const statsData = [
    {
        icon: Users,
        number: "5000+",
        label: "Khách hàng tin tưởng",
        desc: "Đã phục vụ trên khắp Hà Nội."
    },
    {
        icon: ShieldCheck,
        number: "100%",
        label: "Phụ tùng chính hãng",
        desc: "Bảo hành dài hạn cho mọi linh kiện."
    },
    {
        icon: Clock,
        number: "10+",
        label: "Năm kinh nghiệm",
        desc: "Đội ngũ chuyên gia dày dạn bản lĩnh."
    },
    {
        icon: Award,
        number: "99%",
        label: "Đánh giá 5 sao",
        desc: "Tỷ lệ khách hàng quay lại tuyệt đối."
    }
];

export default function StatsSection({
    title,
    content
}: StatsSectionProps) {
    const displayTitle = title || "Tại sao chọn Garage Master?";
    const displaySubtitle = content || "Chúng tôi xây dựng niềm tin từ chất lượng thực tế và sự minh bạch.";

    return (
        <section className="py-24 bg-[#1C1917] text-white overflow-hidden relative">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 blur-[120px] rounded-full -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-900/10 blur-[120px] rounded-full -ml-48 -mb-48" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                    {/* Header Side */}
                    <div className="lg:col-span-5">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="max-w-md"
                        >
                            <span className="text-orange-500 font-black uppercase text-xs tracking-widest mb-4 block">
                                Niềm tin & Chất lượng
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tight text-white">
                                {displayTitle}
                            </h2>
                            <p className="text-lg !text-stone-200 leading-relaxed mb-10 font-medium">
                                {displaySubtitle}
                            </p>
                            <div className="h-1.5 w-24 bg-gradient-to-r from-orange-600 to-orange-400 rounded-full shadow-lg shadow-orange-600/20" />
                        </motion.div>
                    </div>

                    {/* Stats Grid Side */}
                    <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {statsData.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                viewport={{ once: true }}
                                className="bg-stone-800/40 backdrop-blur-sm p-8 rounded-2xl border border-white/5 hover:border-orange-500/30 hover:bg-stone-800/60 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                    <stat.icon size={80} />
                                </div>
                                <div className="bg-orange-600/10 w-14 h-14 rounded-xl flex items-center justify-center border border-orange-500/20 mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                                    <stat.icon className="text-orange-500 group-hover:text-white" size={28} />
                                </div>
                                <div className="text-5xl font-bold text-white mb-2 tracking-tight group-hover:text-orange-400 transition-colors">
                                    {stat.number}
                                </div>
                                <div className="font-bold text-sm text-orange-500/80 mb-3 group-hover:text-orange-400">
                                    {stat.label}
                                </div>
                                <p className="!text-stone-100 text-sm leading-relaxed relative z-10 font-semibold italic translate-y-0 opacity-100 group-hover:text-white transition-colors">
                                    {stat.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
