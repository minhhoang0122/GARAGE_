'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/modules/common/components/layout';
import { useBlogPost, useUpdateBlogPost } from '@/modules/admin/hooks/useCms';
import { ArrowLeft, Save, Eye, Layout, Type, Image as ImageIcon, Link as LinkIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';
import dynamic from 'next/dynamic';

const TiptapEditor = dynamic(() => import('@/modules/common/components/TiptapEditor'), { ssr: false });
import { BlogPost } from '@/modules/landing/types/cms';

export default function EditBlogPostPage() {
    const router = useRouter();
    const { id } = useParams() as { id: string };
    const { showToast } = useToast();
    // Preview format removed. Tiptap is WYSIWYG.

    const { data: post, isLoading } = useBlogPost(id);
    const updateMutation = useUpdateBlogPost(id);

    const [form, setForm] = useState<{
        title: string;
        slug: string;
        excerpt: string;
        content: string;
        thumbnailUrl: string;
        status: 'DRAFT' | 'PUBLISHED';
        publishedAt: string;
    }>({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        thumbnailUrl: '',
        status: 'DRAFT',
        publishedAt: ''
    });

    useEffect(() => {
        if (post) {
            setForm({
                title: post.title || '',
                slug: post.slug || '',
                excerpt: post.excerpt || '',
                content: post.content || '',
                thumbnailUrl: post.thumbnailUrl || '',
                status: post.status || 'DRAFT',
                publishedAt: post.publishedAt ? post.publishedAt.slice(0, 16) : ''
            });
        }
    }, [post]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        const slug = title.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .trim();
        setForm(prev => ({ ...prev, title, slug }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.slug || !form.content) {
            showToast('error', 'Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }
        updateMutation.mutate(form, {
            onSuccess: () => {
                router.push('/admin/cms/blog');
            }
        });
    };

    if (isLoading) return <DashboardLayout title="Đang tải..." subtitle=""><div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div></DashboardLayout>;

    return (
        <DashboardLayout title="Chỉnh sửa bài viết" subtitle={`Biên tập bài viết: ${post?.title}`}>
            <div className="max-w-6xl mx-auto pb-20">
                <div className="flex justify-between items-center mb-8">
                    <Link href="/admin/cms/blog" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm uppercase">
                        <ArrowLeft size={18} /> Quay lại
                    </Link>
                    <div className="flex gap-3">
                        
                        <button 
                            onClick={handleSubmit}
                            disabled={updateMutation.isPending}
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md shadow-indigo-100 disabled:opacity-50"
                        >
                            <Save size={18} /> {updateMutation.isPending ? 'Đang lưu...' : 'Cập nhật bài viết'}
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest"><Type size={14} /> Tiêu đề bài viết</label>
                                <input 
                                    type="text" 
                                    className="w-full text-3xl font-black bg-transparent border-none focus:ring-0 placeholder:text-slate-200 p-0"
                                    placeholder="Nhập tiêu đề ấn tượng..."
                                    value={form.title}
                                    onChange={handleTitleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest"><LinkIcon size={14} /> Đường dẫn (Slug)</label>
                                <div className="flex items-center gap-1 text-sm bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-400">/blog/</span>
                                    <input 
                                        type="text" 
                                        className="flex-1 bg-transparent border-none focus:ring-0 p-0 font-mono text-indigo-600"
                                        value={form.slug}
                                        onChange={e => setForm({ ...form, slug: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-4">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest"><Layout size={14} /> Tóm tắt bài viết</label>
                                <textarea 
                                    rows={3}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-600 resize-none"
                                    placeholder="Đoạn giới thiệu ngắn thu hút người đọc..."
                                    value={form.excerpt}
                                    onChange={e => setForm({ ...form, excerpt: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2 pt-4">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Nội dung bài viết <span className="text-rose-500">*</span></label>
                                <TiptapEditor 
                                    value={form.content}
                                    onChange={(val) => {
                                        // Auto excerpt
                                        let excerpt = form.excerpt;
                                        if (!excerpt || excerpt.length < 10) {
                                            const bodyText = val.replace(/<[^>]+>/g, ' ');
                                            excerpt = bodyText.substring(0, 160).trim();
                                            if (bodyText.length > 160) excerpt += '...';
                                        }
                                        setForm(prev => ({...prev, content: val, excerpt}));
                                    }}
                                />
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">Thiết lập bài đăng</h4>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Trạng thái</label>
                                    <select 
                                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500/20"
                                        value={form.status}
                                        onChange={e => setForm({ ...form, status: e.target.value as 'DRAFT' | 'PUBLISHED' })}
                                    >
                                        <option value="DRAFT">Bản nháp</option>
                                        <option value="PUBLISHED">Xuất bản</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ngày đăng (Hẹn giờ)</label>
                                    <input 
                                        type="datetime-local" 
                                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500/20"
                                        value={form.publishedAt}
                                        onChange={e => setForm({ ...form, publishedAt: e.target.value })}
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1 italic">Mặc định là thời điểm hiện tại nếu không chọn.</p>
                                </div>

                                <div className="pt-4">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><ImageIcon size={14} /> Ảnh đại diện (Thumbnail URL)</label>
                                    <div className="space-y-3">
                                        <div className="aspect-video bg-slate-50 dark:bg-slate-950 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center relative">
                                            {form.thumbnailUrl ? (
                                                <img src={form.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <div className="text-center p-4">
                                                    <div className="inline-block p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm text-slate-300 mb-2">
                                                        <ImageIcon size={24} />
                                                    </div>
                                                    <p className="text-[10px] text-slate-400">Trống</p>
                                                </div>
                                            )}
                                        </div>
                                        <input 
                                            type="text" 
                                            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none"
                                            placeholder="URL ảnh..."
                                            value={form.thumbnailUrl}
                                            onChange={e => setForm({ ...form, thumbnailUrl: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
