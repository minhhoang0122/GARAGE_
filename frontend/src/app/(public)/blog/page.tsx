'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, User, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { BlogPost } from '@/modules/landing/types/cms';

export default function BlogListPage() {
    const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
        queryKey: ['public', 'cms', 'blog'],
        queryFn: () => api.getCached('/public/cms/blog')
    });

    const mechanicalSpring = {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
    };

    return (
        <div className="min-h-screen bg-[#fafaf8] py-20 px-6">
            <div className="container mx-auto max-w-6xl">
                {/* Header Section */}
                <div className="mb-16">
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2 text-stone-500 hover:text-orange-600 transition-colors mb-8 group"
                    >
                        <ChevronRight className="rotate-180 transition-transform group-hover:-translate-x-1" size={18} />
                        <span className="text-sm font-medium">Quay lại Trang chủ</span>
                    </Link>

                    <div className="flex items-center gap-2 text-orange-600 font-bold text-xs tracking-widest uppercase mb-4">
                        <div className="w-8 h-[2px] bg-orange-600"></div>
                        Tin tức & Kinh nghiệm
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-stone-900 mb-6 tracking-tight">
                        Cẩm nang chăm sóc xe <br className="hidden md:block" /> từ chuyên gia
                    </h1>
                    <p className="text-stone-600 text-lg max-w-2xl leading-relaxed">
                        Chia sẻ kiến thức về bảo dưỡng, mẹo lái xe an toàn và các công nghệ mới nhất trong ngành dịch vụ ô tô hiện đại.
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid md:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-stone-200 aspect-video mb-4"></div>
                                <div className="h-6 bg-stone-200 w-3/4 mb-2"></div>
                                <div className="h-4 bg-stone-100 w-full mb-4"></div>
                                <div className="h-10 bg-stone-200 w-32"></div>
                            </div>
                        ))}
                    </div>
                ) : posts.length > 0 ? (
                    <div className="grid md:grid-cols-3 gap-8">
                        {posts.map((post, idx) => (
                            <motion.article 
                                key={post.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, ...mechanicalSpring }}
                                className="group bg-white border border-stone-200 overflow-hidden hover:shadow-2xl transition-all"
                            >
                                <Link href={`/blog/${post.slug}`} className="block relative aspect-video overflow-hidden">
                                    <img 
                                        src={post.thumbnailUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1000'} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        alt={post.title}
                                    />
                                    <div className="absolute top-4 left-4 bg-orange-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                                        Bài viết
                                    </div>
                                </Link>
                                <div className="p-6">
                                    <div className="flex items-center gap-4 text-stone-400 text-xs mb-4">
                                        <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                                        <span className="flex items-center gap-1 font-medium text-stone-600"><Clock size={14} /> 5 phút đọc</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-stone-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2 leading-tight">
                                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                    </h2>
                                    <p className="text-stone-500 text-sm leading-relaxed mb-6 line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                    <Link 
                                        href={`/blog/${post.slug}`}
                                        className="inline-flex items-center gap-2 text-orange-600 font-bold text-sm uppercase group/btn"
                                    >
                                        Đọc tiếp
                                        <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                                    </Link>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-20 text-center border border-stone-200">
                        <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock size={40} className="text-stone-300" />
                        </div>
                        <h3 className="text-xl font-bold text-stone-900 mb-2">Đang cập nhật bài viết</h3>
                        <p className="text-stone-500">Chúng tôi đang chuẩn bị những nội dung hữu ích dành cho bạn. Quay lại sau nhé!</p>
                        <Link href="/" className="inline-block mt-8 text-orange-600 font-bold border-b-2 border-orange-600 pb-1">Trở về Trang chủ</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
