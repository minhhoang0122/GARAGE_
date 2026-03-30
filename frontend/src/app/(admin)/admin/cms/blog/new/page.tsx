'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/modules/common/components/layout';
import { useCreateBlogPost } from '@/modules/admin/hooks/useCms';
import { ArrowLeft, Save, Eye, Layout, Type, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const TiptapEditor = dynamic(() => import('@/modules/common/components/TiptapEditor'), { ssr: false });

export default function NewBlogPostPage() {
    const router = useRouter();
    const { showToast } = useToast();
    // Preview format removed. Tiptap is WYSIWYG.
    const createMutation = useCreateBlogPost();

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
        publishedAt: new Date().toISOString().slice(0, 16) // Default to now
    });

    
    // Restore logic
    useEffect(() => {
        const draft = localStorage.getItem('draft_blog_post');
        if (draft) {
            if (window.confirm('Quý khách có một bản nháp bài viết chưa lưu. Cố vấn Dịch vụ muốn khôi phục lại không?')) {
                try {
                    const parsed = JSON.parse(draft);
                    setForm(parsed);
                } catch(e) {}
            }
        }
    }, [setForm]);

    // Auto-save logic
    useEffect(() => {
        const timer = setTimeout(() => {
            if (form.title || form.content) {
                localStorage.setItem('draft_blog_post', JSON.stringify(form));
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [form]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.slug || !form.content) {
            showToast('error', 'Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        createMutation.mutate(form, { onSuccess: () => { localStorage.removeItem('draft_blog_post'); router.push('/admin/cms/blog'); } });
    };

    return (
        <DashboardLayout title="Viết bài mới" subtitle="Tạo nội dung mới cho Blog">
            <div className="max-w-6xl mx-auto pb-20">
                <div className="flex justify-between items-center mb-8">
                    <Link href="/admin/cms/blog" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm uppercase">
                        <ArrowLeft size={18} /> Quay lại
                    </Link>
                    <div className="flex gap-3">
                        
                        <button 
                            onClick={handleSubmit}
                            disabled={createMutation.isPending}
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md shadow-indigo-100 disabled:opacity-50"
                        >
                            <Save size={18} /> {createMutation.isPending ? 'Đang lưu...' : 'Lưu bài viết'}
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest"><Type size={14} /> Tiêu đề bài viết <span className="text-rose-500">*</span></label>
                                <input 
                                    type="text" 
                                    className="w-full text-3xl font-black bg-transparent border-none focus:ring-0 placeholder:text-slate-200 p-0"
                                    placeholder="Nhập tiêu đề ấn tượng..."
                                    value={form.title}
                                    onChange={handleTitleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest"><LinkIcon size={14} /> Đường dẫn (Slug) <span className="text-rose-500">*</span></label>
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

                    {/* Sidebar Area */}
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
                                                    <p className="text-[10px] text-slate-400">Nhập đường dẫn ảnh bên dưới</p>
                                                </div>
                                            )}
                                        </div>
                                        <input 
                                            type="text" 
                                            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none"
                                            placeholder="https://images.unsplash.com/..."
                                            value={form.thumbnailUrl}
                                            onChange={e => setForm({ ...form, thumbnailUrl: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="p-6 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100 dark:shadow-none">
                            <h5 className="font-bold mb-2">Mẹo viết bài tốt:</h5>
                            <ul className="text-xs text-indigo-100 space-y-2 list-disc pl-4">
                                <li>Tiêu đề chứa từ khóa chính.</li>
                                <li>Slug ngắn gọn, nhiều dấu gạch ngang.</li>
                                <li>Sử dụng thẻ h2, h3 cho các tiêu điểm.</li>
                                <li>Ảnh Thumbnail nên là 16:9 chất lượng cao.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
