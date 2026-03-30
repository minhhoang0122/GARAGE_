'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { useLandingSections, useUpdateLandingSection } from '@/modules/admin/hooks/useCms';
import { RefreshCw, Save, AlertCircle, CheckCircle2, GripVertical, Power, Edit, X } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { LandingSection } from '@/modules/landing/types/cms';

export default function AdminLandingPage() {
    const { showToast } = useToast();
    
    const { data: sections = [], isLoading, refetch } = useLandingSections();
    const updateMutation = useUpdateLandingSection();

    const [editingSection, setEditingSection] = useState<LandingSection | null>(null);

    const toggleActive = (section: LandingSection) => {
        updateMutation.mutate({ ...section, isActive: !section.isActive });
    };

    return (
        <DashboardLayout title="Thiết lập Trang chủ" subtitle="Tùy chỉnh các khối nội dung hiển thị bên ngoài">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                            <RefreshCw className={`text-indigo-600 ${isLoading ? 'animate-spin' : ''}`} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">Cấu trúc Trang chủ</h4>
                            <p className="text-sm text-slate-500">Các khối nội dung được quản lý tập trung và cho phép bật/tắt linh hoạt.</p>
                        </div>
                    </div>
                    <button onClick={() => refetch()} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-all">
                        Làm mới dữ liệu
                    </button>
                </div>

                <div className="space-y-4">
                    {isLoading ? (
                        <div className="p-10 text-center text-slate-400">Đang tải cấu trúc...</div>
                    ) : sections.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 bg-white border rounded-xl">Không tìm thấy section nào. Có lỗi trong việc seed dữ liệu hoặc API.</div>
                    ) : [...sections].sort((a: any, b: any) => a.orderIndex - b.orderIndex).map((section: LandingSection) => (
                        <div 
                            key={section.id} 
                            className={`flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-2xl border transition-all ${section.isActive ? 'border-slate-200 dark:border-slate-800 shadow-sm' : 'border-slate-100 dark:border-slate-800/50 opacity-60 grayscale'}`}
                        >
                            <div className="flex items-center gap-5">
                                <div className="p-2 cursor-grab active:cursor-grabbing text-slate-300">
                                    <GripVertical size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h5 className="font-bold text-slate-900 dark:text-slate-100">{section.title}</h5>
                                        <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase tracking-tighter text-slate-500">ID: {section.sectionId}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 max-w-md line-clamp-1">{section.content}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setEditingSection(section)}
                                    className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all" 
                                    title="Chỉnh sửa nội dung"
                                >
                                    <Edit size={18} />
                                </button>
                                <button 
                                    onClick={() => toggleActive(section)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all border ${section.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                                >
                                    <Power size={14} />
                                    {section.isActive ? 'Bật' : 'Tắt'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 flex gap-3">
                    <AlertCircle className="text-amber-600 shrink-0" size={20} />
                    <p className="text-xs text-amber-700 leading-relaxed">
                        <strong>Lưu ý:</strong> Việc thay đổi trạng thái các khối nội dung sẽ ảnh hưởng trực tiếp đến Trang chủ ngay lập tức. Hãy kiểm tra kỹ trước khi thực hiện.
                    </p>
                </div>
            </div>

            {/* Edit Modal */}
            {editingSection && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <div>
                                <h3 className="font-bold text-xl text-slate-900 dark:text-white">Chỉnh sửa nội dung</h3>
                                <p className="text-xs text-slate-500 font-mono tracking-tighter uppercase mt-1">Section ID: {editingSection.sectionId}</p>
                            </div>
                            <button onClick={() => setEditingSection(null)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-all text-slate-400">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tiêu đề Section</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold"
                                    value={editingSection.title}
                                    onChange={e => setEditingSection({ ...editingSection, title: e.target.value })}
                                />
                            </div>

                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nội dung chi tiết</label>
                                <textarea 
                                    rows={5}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-600 resize-none leading-relaxed font-mono text-sm"
                                    value={typeof editingSection.content === 'string' ? editingSection.content : JSON.stringify(editingSection.content, null, 2)}
                                    onChange={e => {
                                        try {
                                            // Thử parse nếu nội dung là JSON hợp lệ, nếu không thì lưu dạng string
                                            const val = e.target.value;
                                            setEditingSection({ ...editingSection, content: val });
                                        } catch (err) {
                                            setEditingSection({ ...editingSection, content: e.target.value });
                                        }
                                    }}
                                />
                                <p className="text-[10px] text-slate-400">Gợi ý: Nếu đây là khối dữ liệu cấu trúc (JSON), hãy đảm bảo đúng định dạng.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setEditingSection(null)}
                                    className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button 
                                    onClick={() => {
                                        updateMutation.mutate(editingSection);
                                        setEditingSection(null);
                                    }}
                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none transition-all"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
