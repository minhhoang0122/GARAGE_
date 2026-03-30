'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { BlogPost } from '@/modules/landing/types/cms';

interface BlogSectionProps {
    title?: string;
    content?: string;
    recentPosts: BlogPost[];
}

export default function BlogSection({
    title,
    content,
    recentPosts
}: BlogSectionProps) {

    const displayTitle = title || "Cố vấn dịch vụ chia sẻ";
    const displaySubtitle = content || "Kiến Thức Xe";

    return (
        <section className="py-24 bg-white border-t border-stone-100">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-end mb-16">
                    <div className="max-w-xl">
                        <h2 className="text-sm font-bold !text-orange-600 tracking-widest uppercase mb-4">{displaySubtitle}</h2>
                        <h3 className="text-4xl font-extrabold !text-[#111]">{displayTitle}</h3>
                    </div>
                    <Link href="/blog" className="hidden md:flex items-center gap-2 text-stone-900 font-bold hover:text-orange-600 transition-colors uppercase text-sm tracking-wider underline decoration-orange-500 decoration-2 underline-offset-8">
                        Xem tất cả bài viết <ChevronRight size={16} />
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-10">
                    {recentPosts.length > 0 ? (
                        recentPosts.map((post) => (
                            <motion.article key={post.id} whileHover={{ y: -5 }} className="flex flex-col h-full group bg-white border border-stone-100 shadow-sm hover:shadow-xl transition-all">
                                <div className="aspect-[16/10] overflow-hidden relative">
                                    <img 
                                        src={post.thumbnailUrl || "https://images.unsplash.com/photo-1507702744604-046772719602?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                                        alt={post.title} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-orange-600 text-white text-[10px] font-black px-2 py-1 uppercase tracking-widest">Bài viết mới</span>
                                    </div>
                                </div>
                                <div className="p-8 flex flex-col flex-1">
                                    <h4 className="text-xl font-bold !text-stone-900 mb-4 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                    </h4>
                                    <p className="text-stone-700 text-sm line-clamp-3 mb-6 leading-relaxed flex-1 font-medium italic">
                                        {post.excerpt}
                                    </p>
                                    <Link href={`/blog/${post.slug}`} className="text-stone-900 font-black text-xs uppercase tracking-widest flex items-center gap-2 group/btn">
                                        Đọc tiếp <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform text-orange-600" />
                                    </Link>
                                </div>
                            </motion.article>
                        ))
                    ) : (
                        // Professional skeleton placeholders
                        [1, 2, 3].map((i) => (
                            <div key={i} className="flex flex-col h-[450px] bg-stone-50/50 border border-stone-100 relative overflow-hidden group">
                                <div className="aspect-[16/10] bg-stone-200 animate-pulse relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-[2px]" />
                                </div>
                                <div className="p-8 flex flex-col flex-1 gap-4">
                                    <div className="h-6 w-3/4 bg-stone-200 animate-pulse rounded" />
                                    <div className="h-4 w-full bg-stone-100 animate-pulse rounded" />
                                    <div className="h-4 w-full bg-stone-100 animate-pulse rounded" />
                                    <div className="h-4 w-2/3 bg-stone-100 animate-pulse rounded mt-auto" />
                                </div>
                                {/* Decorative elements */}
                                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-orange-500/5 rounded-full blur-3xl" />
                            </div>
                        ))
                    )}
                </div>

            </div>
        </section>
    );
}
