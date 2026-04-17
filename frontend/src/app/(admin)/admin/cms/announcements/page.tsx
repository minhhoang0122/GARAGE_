'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { 
    useAnnouncements, 
    useCreateAnnouncement, 
    useUpdateAnnouncement, 
    useDeleteAnnouncement 
} from '@/modules/admin/hooks/useCms';
import { 
    Search, Plus, RefreshCw, Edit, Trash2, 
    Bell, Pin, Calendar, Clock, AlertCircle,
    CheckCircle2, XCircle
} from 'lucide-react';
import { useConfirm } from '@/modules/shared/components/ui/ConfirmModal';
import { Announcement } from '@/modules/landing/types/cms';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export function AnnouncementsContent() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Partial<Announcement> | null>(null);
    const confirm = useConfirm();
    
    const { data: announcements = [], isLoading, refetch } = useAnnouncements();
    const createMutation = useCreateAnnouncement();
    const updateMutation = useUpdateAnnouncement(editingAnnouncement?.id || '');
    const deleteMutation = useDeleteAnnouncement();

    const handleDelete = async (ann: Announcement) => {
        const confirmed = await confirm({
            title: 'Xóa thông báo',
            message: `Bạn có chắc chắn muốn xóa thông báo "${ann.title}" không? Thao tác này không thể hoàn tác.`,
            type: 'danger'
        });
        if (confirmed) deleteMutation.mutate(ann.id!);
    };

    const handleOpenModal = (ann?: Announcement) => {
        if (ann) {
            setEditingAnnouncement(ann);
        } else {
            setEditingAnnouncement({
                title: '',
                content: '',
                type: 'INFO',
                isPinned: false,
                publishedAt: new Date().toISOString(),
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAnnouncement) return;

        if (editingAnnouncement.id) {
            updateMutation.mutate(editingAnnouncement as Announcement, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    refetch();
                }
            });
        } else {
            createMutation.mutate({
                ...editingAnnouncement,
                publishedAt: new Date().toISOString()
            } as any, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    refetch();
                }
            });
        }
    };

    const filteredAnnouncements = announcements.filter((ann: Announcement) => 
        ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ann.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getIconByType = (type: string) => {
        switch (type) {
            case 'URGENT': return <AlertCircle className="text-rose-500" size={20} />;
            case 'PROMO': return <Plus className="text-emerald-500" size={20} />;
            default: return <Bell className="text-indigo-500" size={20} />;
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm thông báo..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={() => refetch()} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                    >
                        <Plus size={18} /> Tạo thông báo
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl border border-slate-200 dark:border-slate-700" />
                    ))
                ) : filteredAnnouncements.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed">
                        Chưa có thông báo nào được tạo.
                    </div>
                ) : filteredAnnouncements.map((ann: Announcement) => (
                    <div 
                        key={ann.id}
                        className={`group relative bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${ann.status === 'DRAFT' ? 'border-slate-100 dark:border-slate-800 border-dashed opacity-80' : 'border-slate-200 dark:border-slate-800 shadow-sm'}`}
                    >
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2 rounded-xl bg-opacity-10 ${ann.type === 'URGENT' ? 'bg-rose-500' : ann.type === 'PROMO' ? 'bg-emerald-500' : 'bg-indigo-500'}`}>
                                    {getIconByType(ann.type)}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleOpenModal(ann)}
                                        className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(ann)}
                                        className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    {ann.isPinned && <Pin size={14} className="text-amber-500 fill-amber-500" />}
                                    <h3 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{ann.title}</h3>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                                    {ann.content}
                                </p>
                            </div>

                            <div className="mt-5 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={12} />
                                    {ann.publishedAt && format(new Date(ann.publishedAt), 'dd/MM/yyyy', { locale: vi })}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock size={12} />
                                    {ann.publishedAt && format(new Date(ann.publishedAt), 'HH:mm', { locale: vi })}
                                </span>
                            </div>
                        </div>
                        {ann.status === 'DRAFT' && (
                            <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-500 text-white text-[8px] rounded font-black tracking-tighter">DRAFT</div>
                        )}
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl scale-in-center overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-indigo-50/30 dark:bg-indigo-950/20">
                            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                {editingAnnouncement?.id ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors">
                                <XCircle className="text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Tiêu đề thông báo</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-900 dark:text-white"
                                        value={editingAnnouncement?.title || ''}
                                        onChange={e => setEditingAnnouncement({...editingAnnouncement, title: e.target.value})}
                                        placeholder="Nhập tiêu đề..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Loại thông báo</label>
                                        <select 
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold"
                                            value={editingAnnouncement?.type || 'INFO'}
                                            onChange={e => setEditingAnnouncement({...editingAnnouncement, type: e.target.value as any})}
                                        >
                                            <option value="INFO">Thông tin</option>
                                            <option value="URGENT">Khẩn cấp</option>
                                            <option value="PROMO">Khuyến mãi</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Trạng thái</label>
                                        <select 
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold"
                                            value={editingAnnouncement?.status || 'PUBLISHED'}
                                            onChange={e => setEditingAnnouncement({...editingAnnouncement, status: e.target.value as any})}
                                        >
                                            <option value="PUBLISHED">Xuất bản ngay</option>
                                            <option value="DRAFT">Lưu bản nháp</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Nội dung chi tiết</label>
                                    <textarea 
                                        required
                                        rows={4}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-600 dark:text-slate-300"
                                        value={editingAnnouncement?.content || ''}
                                        onChange={e => setEditingAnnouncement({...editingAnnouncement, content: e.target.value})}
                                        placeholder="Nhập nội dung thông báo..."
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <input 
                                        type="checkbox" 
                                        id="pinned"
                                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={editingAnnouncement?.isPinned || false}
                                        onChange={e => setEditingAnnouncement({...editingAnnouncement, isPinned: e.target.checked})}
                                    />
                                    <label htmlFor="pinned" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Ghim thông báo lên đầu</label>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-black uppercase rounded-lg transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button 
                                    type="submit"
                                    className="px-8 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase rounded-lg shadow-lg transition-all"
                                >
                                    Lưu thông báo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminAnnouncementsPage() {
    return (
        <DashboardLayout title="Thông báo hệ thống" subtitle="Quản lý và hiển thị thông báo đến toàn bộ khách hàng">
            <AnnouncementsContent />
        </DashboardLayout>
    );
}
