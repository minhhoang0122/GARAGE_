'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { useBlogPosts, useDeleteBlogPost } from '@/modules/admin/hooks/useCms';
import { Search, Plus, RefreshCw, Edit, Trash2, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { useConfirm } from '@/modules/shared/components/ui/ConfirmModal';
import { BlogPost } from '@/modules/landing/types/cms';
import Link from 'next/link';

export default function AdminBlogPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const confirm = useConfirm();
    
    const { data: posts = [], isLoading, refetch } = useBlogPosts();
    const deleteMutation = useDeleteBlogPost();

    const handleDelete = async (id: number, title: string) => {
        const confirmed = await confirm({
            title: 'Xác nhận xóa',
            message: `Bạn có chắc chắn muốn xóa bài viết "${title}"? Thao tác này không thể hoàn tác.`,
            type: 'danger'
        });
        if (confirmed) deleteMutation.mutate(id);
    };

    const filteredPosts = posts.filter((p: BlogPost) => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout title="Quản lý Bài viết" subtitle="Biên tập và xuất bản nội dung lên Blog">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm bài viết..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => refetch()} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <Link 
                            href="/admin/cms/blog/new" 
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all"
                        >
                            <Plus size={18} /> Viết bài mới
                        </Link>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Bài viết</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase hidden sm:table-cell">Trạng thái</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Ngày tạo</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isLoading ? (
                                <tr><td colSpan={4} className="p-10 text-center text-slate-400">Đang tải...</td></tr>
                            ) : filteredPosts.length === 0 ? (
                                <tr><td colSpan={4} className="p-10 text-center text-slate-400">Chưa có bài viết nào.</td></tr>
                            ) : filteredPosts.map((post: BlogPost) => (
                                <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-8 sm:w-16 sm:h-10 bg-slate-100 rounded overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-800">
                                                <img src={post.thumbnailUrl || ''} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[150px] sm:max-w-[300px]">{post.title}</div>
                                                <div className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">/{post.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        {post.status === 'PUBLISHED' ? (
                                            new Date(post.publishedAt) > new Date() ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase dark:bg-amber-900/30 dark:text-amber-400">
                                                    <RefreshCw size={10} className="animate-spin-slow" /> <span className="hidden lg:inline">Hẹn giờ</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    <Eye size={10} /> <span className="hidden lg:inline">Đã đăng</span>
                                                </span>
                                            )
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase dark:bg-slate-800 dark:text-slate-400">
                                                <EyeOff size={10} /> <span className="hidden lg:inline">Nháp</span>
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell">
                                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 text-slate-400">
                                            <Link href={`/blog/${post.slug}`} target="_blank" className="p-2 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg">
                                                <ExternalLink size={18} />
                                            </Link>
                                            <Link href={`/admin/cms/blog/${post.id}`} className="p-2 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg">
                                                <Edit size={18} />
                                            </Link>
                                            <button 
                                                onClick={() => handleDelete(post.id, post.title)}
                                                className="p-2 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
