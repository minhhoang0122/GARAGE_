'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Tag, ChevronRight, Bell, Search, Filter, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Announcement } from '@/modules/landing/types/cms';
import Footer from '@/modules/landing/components/Footer';

export default function AnnouncementsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('ALL');

    const { data: announcements = [], isLoading } = useQuery<Announcement[]>({
        queryKey: ['public', 'cms', 'announcements'],
        queryFn: () => api.get('/public/cms/announcements')
    });

    const filteredAnnouncements = announcements.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.summary.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'ALL' || item.type === selectedType;
        return matchesSearch && matchesType;
    });

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
        <div className="min-h-screen bg-[#fafaf8] flex flex-col">
            {/* Header / Navigation placeholder (Simplified for this page) */}
            <nav className="bg-[#111] text-white py-4 sticky top-0 z-50">
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold uppercase tracking-widest text-xs">Quay lại trang chủ</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center font-black text-white text-sm">GM</div>
                        <span className="font-extrabold text-sm uppercase tracking-tight">Garage Master</span>
                    </div>
                </div>
            </nav>

            <main className="flex-grow py-20">
                <div className="container mx-auto px-6">
                    {/* Page Title */}
                    <div className="mb-12">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-orange-600 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-4"
                        >
                            <Bell size={12} /> News & Updates
                        </motion.div>
                        <h1 className="text-5xl font-black text-stone-900 mb-6 tracking-tight">Trung tâm Bản tin</h1>
                        <p className="text-stone-500 max-w-2xl text-lg leading-relaxed">
                            Cập nhật những thông tin mới nhất về dịch vụ, chương trình khuyến mãi và các hoạt động tại Garage Master.
                        </p>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="flex flex-col md:flex-row gap-4 mb-12">
                        <div className="relative flex-grow group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                            <input 
                                type="text"
                                placeholder="Tìm kiếm bản tin..."
                                className="w-full pl-12 pr-4 py-4 bg-white border border-stone-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all font-medium text-stone-900"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            {['ALL', 'INFO', 'PROMO', 'URGENT'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedType(type)}
                                    className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border ${
                                        selectedType === type 
                                        ? 'bg-[#111] text-white border-[#111]' 
                                        : 'bg-white text-stone-500 border-stone-200 hover:border-orange-500 hover:text-orange-500'
                                    }`}
                                >
                                    {type === 'ALL' ? 'Tất cả' : getTypeText(type)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Announcements Grid */}
                    {isLoading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-white border border-stone-100 p-8 animate-pulse">
                                    <div className="h-4 w-20 bg-stone-100 mb-6"></div>
                                    <div className="h-8 w-full bg-stone-100 mb-4"></div>
                                    <div className="h-4 w-full bg-stone-100 mb-2"></div>
                                    <div className="h-4 w-2/3 bg-stone-100 mb-8"></div>
                                    <div className="h-4 w-24 bg-stone-100"></div>
                                </div>
                            ))}
                        </div>
                    ) : filteredAnnouncements.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredAnnouncements.map((item, idx) => (
                                <motion.div 
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white border border-stone-200 shadow-sm hover:shadow-2xl hover:border-orange-200 transition-all group overflow-hidden"
                                >
                                    <Link href={`/announcements/${item.slug}`} className="p-8 flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-orange-500 ring-inset">
                                        <div className="flex justify-between items-start mb-6">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 border ${getTypeColor(item.type)}`}>
                                                {getTypeText(item.type)}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-stone-400 font-medium text-xs">
                                                <Calendar size={14} />
                                                {new Date(item.publishedAt).toLocaleDateString('vi-VN')}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-stone-900 mb-4 group-hover:text-orange-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                                            {item.title}
                                        </h3>
                                        
                                        <p className="text-stone-500 text-sm mb-8 line-clamp-3 leading-relaxed flex-grow">
                                            {item.summary}
                                        </p>

                                        <div className="inline-flex items-center gap-2 text-stone-900 font-black text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all">
                                            Đọc tiếp <ChevronRight size={14} className="text-orange-600" />
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center border-2 border-dashed border-stone-200 bg-white">
                            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
                                <Search size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-stone-900 mb-2">Không tìm thấy bản tin nào</h3>
                            <p className="text-stone-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc của bạn.</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
