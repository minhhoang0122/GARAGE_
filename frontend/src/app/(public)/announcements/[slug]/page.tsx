'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, Tag, ChevronLeft, ArrowRight, Share2, Printer, MapPin } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Announcement } from '@/modules/landing/types/cms';
import { api } from '@/lib/api';

export default function AnnouncementDetailPage() {
    const { slug } = useParams();
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const data = await api.get(`/public/cms/announcements/${slug}`);
                setAnnouncement(data);
            } catch (err: any) {
                console.error('Failed to fetch announcement:', err);
                // err.message thường chứa nội dung từ api.ts reject
            } finally {
                setIsLoading(false);
            }
        };

        if (slug) fetchAnnouncement();
    }, [slug]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!announcement) {
        return (
            <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-6xl font-black text-stone-200 mb-4">404</h1>
                <p className="text-xl text-stone-600 mb-8">Xin lỗi, bản tin này không tồn tại hoặc đã hết hạn.</p>
                <Link href="/" className="bg-[#111] text-white px-8 py-3 rounded-sm font-bold uppercase tracking-widest text-sm transition-all hover:bg-orange-600">
                    Quay lại trang chủ
                </Link>
            </div>
        );
    }

    const getTypeText = (type: string) => {
        switch (type) {
            case 'URGENT': return 'Khẩn cấp';
            case 'PROMO': return 'Khuyến mãi';
            default: return 'Thông tin';
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 selection:bg-orange-200">
            {/* Header / Breadcrumb */}
            <div className="bg-white border-b border-stone-200 py-6">
                <div className="container mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
                    <Link href="/" className="flex items-center gap-2 text-stone-400 hover:text-[#111] transition-colors font-bold uppercase text-[10px] tracking-widest">
                        <ChevronLeft size={16} /> Quay lại trang chủ
                    </Link>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-stone-400 hover:text-orange-600 transition-colors"><Share2 size={18} /></button>
                        <button className="p-2 text-stone-400 hover:text-[#111] transition-colors" onClick={() => window.print()}><Printer size={18} /></button>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-6 py-12 lg:py-20">
                <div className="max-w-4xl mx-auto">
                    {/* Meta Info */}
                    <div className="flex items-center gap-4 mb-8">
                        <span className="bg-orange-600 text-white text-[10px] font-black px-2 py-1 uppercase tracking-widest">
                            {getTypeText(announcement.type)}
                        </span>
                        <div className="flex items-center gap-1.5 text-stone-400 text-sm font-medium">
                            <Calendar size={14} />
                            {new Date(announcement.publishedAt || announcement.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-stone-900 leading-tight mb-8">
                        {announcement.title}
                    </h1>

                    {announcement.summary && (
                        <p className="text-xl font-medium text-stone-500 italic mb-12 border-l-4 border-orange-600 pl-6 py-2">
                            {announcement.summary}
                        </p>
                    )}

                    {announcement.thumbnailUrl && (
                        <div className="aspect-video mb-12 rounded-lg overflow-hidden border border-stone-200 shadow-xl">
                            <img 
                                src={announcement.thumbnailUrl} 
                                alt={announcement.title} 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <article className="prose prose-stone prose-lg max-w-none prose-headings:font-black prose-headings:text-stone-900 prose-p:text-stone-600 prose-strong:text-stone-900 prose-img:rounded-xl">
                        <div dangerouslySetInnerHTML={{ __html: announcement.content }} />
                    </article>

                    {/* Contact CTA */}
                    <div className="mt-20 p-12 bg-[#111] text-white rounded-lg overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Bạn có thắc mắc về bản tin này?</h3>
                                <p className="text-stone-400">Liên hệ ngay với bộ phận cố vấn để được hỗ trợ giải đáp trực tiếp.</p>
                            </div>
                            <Link href="/booking" className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-sm font-bold uppercase tracking-widest text-sm transition-all shadow-xl shadow-orange-600/20 text-center whitespace-nowrap">
                                Đặt lịch tư vấn ngay
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
