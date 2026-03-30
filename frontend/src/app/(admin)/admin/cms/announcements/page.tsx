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

export default function AdminAnnouncementsPage() {
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
            updateMutation.mutate(editingAnnouncement, {
                onSuccess: () => setIsModalOpen(false)
            });
        } else {
            createMutation.mutate(editingAnnouncement, {
                onSuccess: () => setIsModalOpen(false)
            });
        }
    };

    const filteredAnnouncements = announcements.filter(ann => 
        ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ann.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout title="Quản lý Thông báo" subtitle="Tạo và điều chỉnh các bản tin, thông báo khẩn cấp">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Actions Header */}
                <div className="flex justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm thông báo..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => refetch()} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button 
                            onClick={() => handleOpenModal()} 
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-indigo-500/20"
                        >
                            <Plus size={18} /> Thông báo mới
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Thông báo</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Loại</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Lịch trình</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isLoading ? (
                                <tr><td colSpan={4} className="p-10 text-center text-slate-400">Đang tải...</td></tr>
                            ) : filteredAnnouncements.length === 0 ? (
                                <tr><td colSpan={4} className="p-10 text-center text-slate-400">Chưa có thông báo nào.</td></tr>
                            ) : filteredAnnouncements.map((ann) => {
                                const isScheduled = ann.publishedAt && new Date(ann.publishedAt) > new Date();
                                const isExpired = ann.expiredAt && new Date(ann.expiredAt) < new Date();
                                
                                return (
                                    <tr key={ann.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-1 p-2 rounded-lg ${
                                                    ann.type === 'IMPORTANT' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 
                                                    ann.type === 'URGENT' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30' : 
                                                    'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                                                }`}>
                                                    <Bell size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-slate-900 dark:text-slate-100">{ann.title}</span>
                                                        {ann.isPinned && <Pin size={14} className="text-indigo-500 fill-indigo-500" />}
                                                    </div>
                                                    <p className="text-xs text-slate-400 line-clamp-1">{ann.content}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                                                ann.type === 'IMPORTANT' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' : 
                                                ann.type === 'URGENT' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30' : 
                                                'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30'
                                            }`}>
                                                {ann.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <div className="space-y-1">
                                                {isScheduled ? (
                                                    <div className="flex items-center gap-1.5 text-amber-600 text-[10px] font-bold">
                                                        <Clock size={12} /> Hẹn giờ: {format(new Date(ann.publishedAt!), 'dd/MM HH:mm')}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold">
                                                        <CheckCircle2 size={12} /> Đã đăng: {format(new Date(ann.publishedAt!), 'dd/MM HH:mm')}
                                                    </div>
                                                )}
                                                {ann.expiredAt && (
                                                    <div className={`flex items-center gap-1.5 text-[10px] font-bold ${isExpired ? 'text-rose-600' : 'text-slate-400'}`}>
                                                        <XCircle size={12} /> Hết hạn: {format(new Date(ann.expiredAt), 'dd/MM HH:mm')}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 text-slate-400">
                                                <button 
                                                    onClick={() => handleOpenModal(ann)}
                                                    className="p-2 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(ann)}
                                                    className="p-2 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal - Simplified Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <form onSubmit={handleSave}>
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                    {editingAnnouncement?.id ? 'Chỉnh sửa thông báo' : 'Thêm thông báo mới'}
                                </h3>
                            </div>
                            
                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tiêu đề</label>
                                    <input 
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold"
                                        value={editingAnnouncement?.title || ''}
                                        onChange={e => setEditingAnnouncement({...editingAnnouncement!, title: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nội dung</label>
                                    <textarea 
                                        required
                                        rows={4}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
                                        value={editingAnnouncement?.content || ''}
                                        onChange={e => setEditingAnnouncement({...editingAnnouncement!, content: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Loại thông báo</label>
                                        <select 
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-bold"
                                            value={editingAnnouncement?.type || 'INFO'}
                                            onChange={e => setEditingAnnouncement({...editingAnnouncement!, type: e.target.value as any})}
                                        >
                                            <option value="INFO">Thông tin chung</option>
                                            <option value="IMPORTANT">Quan trọng</option>
                                            <option value="URGENT">Khẩn cấp</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Trạng thái ghim</label>
                                        <div className="flex items-center gap-2 h-10 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                                            <input 
                                                type="checkbox"
                                                id="isPinned"
                                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                                                checked={editingAnnouncement?.isPinned || false}
                                                onChange={e => setEditingAnnouncement({...editingAnnouncement!, isPinned: e.target.checked})}
                                            />
                                            <label htmlFor="isPinned" className="text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer">Ghim ưu tiên</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Thời điểm đăng (Hẹn giờ)</label>
                                        <input 
                                            type="datetime-local"
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none text-xs font-bold"
                                            value={editingAnnouncement?.publishedAt ? format(new Date(editingAnnouncement.publishedAt), "yyyy-MM-dd'T'HH:mm") : ''}
                                            onChange={e => setEditingAnnouncement({...editingAnnouncement!, publishedAt: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Thời điểm hết hạn</label>
                                        <input 
                                            type="datetime-local"
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none text-xs font-bold"
                                            value={editingAnnouncement?.expiredAt ? format(new Date(editingAnnouncement.expiredAt), "yyyy-MM-dd'T'HH:mm") : ''}
                                            onChange={e => setEditingAnnouncement({...editingAnnouncement!, expiredAt: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 text-xs font-bold uppercase text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                >
                                    Hủy
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
        </DashboardLayout>
    );
}
