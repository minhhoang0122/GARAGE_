'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Tag, ChevronRight, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { Announcement } from '@/modules/landing/types/cms';

interface AnnouncementSectionProps {
    title?: string;
    content?: string;
    announcements?: Announcement[];
}

export default function AnnouncementSection({
    title,
    content,
    announcements = []
}: AnnouncementSectionProps) {
    const displayTitle = title || "Bản tin & Thông báo";
    const displaySubtitle = content || "Cập nhật mới nhất từ Garage Master";

    // Mock data if empty for demonstration as requested "cực chuyên nghiệp"
    const displayAnnouncements = announcements.length > 0 ? announcements : [
        {
            id: 1,
            title: "Chương trình bảo dưỡng xe đón hè 2024",
            summary: "Giảm ngay 20% các gói bảo dưỡng định kỳ và kiểm tra hệ thống điều hòa miễn phí.",
            type: "PROMO",
            publishedAt: new Date().toISOString(),
            slug: "khuyen-mai-he-2024"
        },
        {
            id: 2,
            title: "Thông báo lịch nghỉ lễ Giỗ Tổ Hùng Vương",
            summary: "Hệ thống Garage sẽ tạm nghỉ từ ngày 18/04 đến hết ngày 19/04.",
            type: "INFO",
            publishedAt: new Date().toISOString(),
            slug: "thong-bao-nghi-le"
        },
        {
            id: 3,
            title: "Cập nhật công nghệ chẩn đoán lỗi chuyên sâu",
            summary: "Chúng tôi vừa nhập khẩu bộ thiết bị chẩn đoán từ Đức cho các dòng xe châu Âu.",
            type: "URGENT",
            publishedAt: new Date().toISOString(),
            slug: "cong-nghe-moi"
        }
    ];

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'URGENT': return 'bg-red-50 text-red-600 border-red-100';
            case 'PROMO': return 'bg-orange-50 text-orange-600 border-orange-100';
            default: return 'bg-blue-50 text-blue-600 border-blue-100';
        }
    };

    const getTypeText = (type: string) => {
        switch (type) {
            case 'URGENT': return 'Khẩn cấp';
            case 'PROMO': return 'Khuyến mãi';
            default: return 'Thông tin';
        }
    };

    return (
        <section id="tin-tuc" className="py-24 bg-[#FDFCFB] relative overflow-hidden border-y border-stone-100">
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#ea580c 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} 
            />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-6"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
                            News Center
                        </motion.div>
                        <h2 className="text-4xl md:text-5xl font-black !text-stone-900 tracking-tight leading-tight mb-6">
                            {displayTitle}
                        </h2>
                        <p className="text-stone-600 text-lg leading-relaxed font-medium">
                            {displaySubtitle}
                        </p>
                    </div>
                    
                    <motion.div
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <Link 
                            href="/announcements" 
                            className="group flex items-center gap-3 text-orange-600 font-black text-xs uppercase tracking-widest bg-white px-8 py-4 rounded-full shadow-md border border-stone-100 hover:shadow-lg transition-all"
                        >
                            Xem tất cả bản tin
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                    {displayAnnouncements.map((item, idx) => (
                        <motion.article
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="group bg-white p-1 rounded-[2.5rem] overflow-hidden border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 h-full flex flex-col"
                        >
                            <Link href={`/announcements/${item.slug}`} className="flex flex-col h-full ring-inset focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-[2.5rem]">
                                <div className="bg-stone-50 rounded-[2.2rem] p-8 flex flex-col h-full border border-transparent group-hover:bg-white group-hover:border-orange-100 transition-colors duration-500">
                                    <div className="flex justify-between items-start mb-10">
                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm ${getTypeColor(item.type || 'INFO')}`}>
                                            {getTypeText(item.type || 'INFO')}
                                        </span>
                                        <div className="flex items-center gap-2 text-stone-600 font-bold text-xs">
                                            <Calendar size={14} className="text-stone-400" />
                                            {new Date(item.publishedAt).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>

                                    <div className="flex-grow">
                                        <h3 className="text-2xl font-bold !text-stone-900 mb-6 group-hover:text-orange-600 transition-colors line-clamp-2 leading-[1.3]">
                                            {item.title}
                                        </h3>
                                        
                                        <p className="text-stone-700 text-sm mb-10 line-clamp-3 leading-relaxed font-bold">
                                            {item.summary || (item as any).content?.substring(0, 100)}
                                        </p>
                                    </div>

                                    <div className="pt-8 border-t border-stone-200 mt-auto flex items-center justify-between">
                                        <span className="inline-flex items-center gap-2 text-stone-900 font-black text-xs group-hover:text-orange-600 transition-all uppercase tracking-tight">
                                            Khám phá ngay
                                        </span>
                                        <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 shadow-inner">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}

