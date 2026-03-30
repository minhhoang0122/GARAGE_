'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, User, ArrowLeft, Share2, Facebook, Twitter, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { BlogPost } from '@/modules/landing/types/cms';

export default function BlogDetailPage() {
    const { slug } = useParams();
    const router = useRouter();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;
        api.getCached(`/public/cms/blog/${slug}`)
            .then(data => {
                if (data) setPost(data);
                else router.push('/blog');
            })
            .catch(err => {
                console.error('Error fetching blog detail:', err);
                router.push('/blog');
            })
            .finally(() => setIsLoading(false));
    }, [slug]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fafaf8] animate-pulse py-24">
                <div className="container mx-auto max-w-4xl px-6">
                    <div className="h-10 bg-stone-200 w-3/4 mb-6"></div>
                    <div className="h-6 bg-stone-100 w-1/4 mb-12"></div>
                    <div className="bg-stone-200 aspect-video mb-12"></div>
                    <div className="space-y-4">
                        <div className="h-4 bg-stone-100 w-full"></div>
                        <div className="h-4 bg-stone-100 w-full"></div>
                        <div className="h-4 bg-stone-100 w-2/3"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!post) return null;

    return (
        <article className="min-h-screen bg-white">
            {/* Simple Progress Bar */}
            <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                className="fixed top-0 left-0 right-0 h-1 bg-orange-600 z-[100] origin-left"
            ></motion.div>

            {/* Post Header */}
            <header className="bg-stone-100 py-20 border-b border-stone-200">
                <div className="container mx-auto max-w-4xl px-6">
                    <Link 
                        href="/blog" 
                        className="inline-flex items-center gap-2 text-stone-500 hover:text-orange-600 transition-colors font-bold text-xs uppercase mb-8"
                    >
                        <ArrowLeft size={16} /> Quay lại danh sách
                    </Link>
                    
                    <div className="flex items-center gap-3 text-orange-600 text-xs font-bold tracking-widest uppercase mb-4">
                        Cẩm nang chuyên gia
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-stone-900 mb-8 leading-[1.1] tracking-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-stone-500 text-sm border-t border-stone-200 pt-8">
                        <div className="flex items-center gap-2">
                             <div className="w-10 h-10 bg-orange-600 rounded flex items-center justify-center font-black text-white text-lg">G</div>
                             <div>
                                <span className="block text-stone-900 font-bold">Ban biên tập Garage Mater</span>
                                <span className="text-xs">Cố vấn kỹ thuật</span>
                             </div>
                        </div>
                        <div className="flex items-center gap-2"><Calendar size={16} /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}</div>
                        <div className="flex items-center gap-2 border-l border-stone-300 pl-6 hidden sm:flex">
                             <Share2 size={16} /> 
                             <div className="flex gap-3">
                                <Facebook size={16} className="cursor-pointer hover:text-orange-600" />
                                <Twitter size={16} className="cursor-pointer hover:text-orange-600" />
                             </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Post Content */}
            <main className="py-20">
                <div className="container mx-auto max-w-4xl px-6">
                    {/* Featured Image */}
                    {post.thumbnailUrl && (
                        <div className="mb-16 -mx-6 md:mx-0">
                            <img 
                                src={post.thumbnailUrl} 
                                className="w-full h-auto shadow-2xl grayscale-[20%] hover:grayscale-0 transition-all duration-500" 
                                alt={post.title} 
                            />
                        </div>
                    )}

                    {/* Simple Excerpt / Lead */}
                    <p className="text-2xl font-light text-stone-600 mb-12 leading-relaxed italic border-l-4 border-orange-500 pl-8">
                        {post.excerpt}
                    </p>

                    {/* HTML Content Rendered from CMS */}
                    <div 
                        className="prose prose-lg prose-stone max-w-none 
                        prose-headings:font-black prose-headings:text-stone-900 
                        prose-p:text-stone-600 prose-p:leading-relaxed
                        prose-img:shadow-xl prose-img:border prose-img:border-stone-100
                        prose-strong:text-stone-900 prose-strong:font-bold
                        prose-a:text-orange-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline"
                        dangerouslySetInnerHTML={{ __html: post.content }} 
                    />

                    {/* Footer / CTA inside article */}
                    <div className="mt-20 pt-10 border-t-2 border-stone-100">
                        <div className="bg-[#1C1917] p-10 text-white relative overflow-hidden">
                             <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-4">Bạn có thắc mắc về tình trạng xe?</h3>
                                <p className="text-stone-400 mb-8 max-w-xl">Liên hệ ngay với đội ngũ kỹ thuật của chúng tôi để được tư vấn miễn phí.</p>
                                <Link 
                                    href="/booking" 
                                    className="bg-orange-600 hover:bg-orange-500 px-8 py-4 font-bold inline-block transition-colors"
                                >
                                    ĐẶT LỊCH HẸN NGAY
                                </Link>
                             </div>
                             <MessageSquare size={150} className="absolute -bottom-10 -right-10 opacity-5 text-white" />
                        </div>
                    </div>
                </div>
            </main>
        </article>
    );
}
