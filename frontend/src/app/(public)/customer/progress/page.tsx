'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Car, Wrench, Clock, CheckCircle, AlertCircle, Loader2, ChevronRight, Gauge, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMyOrders } from '@/modules/customer/hooks/useCustomer';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { useSSE } from '@/hooks/useSSE';

// 5 Giai đoạn chính của quy trình sửa chữa
const STEPS = [
    { id: 'RECEPTION', label: 'Tiếp nhận', icon: Clock },
    { id: 'DIAGNOSIS', label: 'Chẩn đoán', icon: Search },
    { id: 'REPAIRING', label: 'Sửa chữa', icon: Wrench },
    { id: 'QUALITY', label: 'Kiểm tra (KCS)', icon: Activity },
    { id: 'READY', label: 'Sẵn sàng', icon: CheckCircle },
];

// Mapping từ Status Backend sang Giai đoạn Step
const MAP_STATUS_TO_STEP: Record<string, number> = {
    'TIEP_NHAN': 0,
    'CHO_CHAN_DOAN': 1,
    'CHO_KH_DUYET': 1,
    'BAO_GIA_LAI': 1,
    'DA_DUYET': 2,
    'CHO_SUA_CHUA': 2,
    'DANG_SUA': 2,
    'CHO_KCS': 3,
    'CHO_THANH_TOAN': 4,
    'HOAN_THANH': 4,
};

const mapStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        'TIEP_NHAN': 'Đã tiếp nhận xe',
        'CHO_CHAN_DOAN': 'Đang chờ chẩn đoán lỗi',
        'CHO_KH_DUYET': 'Chờ báo giá & duyệt',
        'DA_DUYET': 'Đã duyệt phương án',
        'CHO_SUA_CHUA': 'Đang chuẩn bị phụ tùng',
        'DANG_SUA': 'Kỹ thuật viên đang xử lý',
        'CHO_KCS': 'Đang kiểm tra chất lượng cuối',
        'CHO_THANH_TOAN': 'Xe đã sẵn sàng bàn giao',
        'BAO_GIA_LAI': 'Đang cập nhật báo giá bổ sung',
    };
    return labels[status] || 'Đang xử lý';
};

export default function CustomerProgressPage() {
    const queryClient = useQueryClient();
    const { data: allOrders = [], isLoading: dataLoading } = useMyOrders();
    
    // Chỉ lấy các đơn đang thực hiện (không lấy Hoàn thành/Đóng/Hủy)
    const activeOrders = useMemo(() => 
        allOrders.filter((o: any) => !['HOAN_THANH', 'DONG', 'HUY'].includes(o.status || o.TrangThai))
    , [allOrders]);

    useSSE('notification', () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.customer.me() });
    });

    if (dataLoading) {
        return (
            <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-orange-500" size={40} />
                <span className="text-stone-500 font-mono text-xs uppercase tracking-widest">Đang tải dữ liệu vận hành...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-950 text-stone-200 selection:bg-orange-500/30">
            {/* Header chuyên nghiệp */}
            <header className="sticky top-0 z-50 bg-stone-950/80 backdrop-blur-md border-b border-white/5 px-4 py-4">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/customer/home" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-white font-bold leading-none mb-1">Tiến độ sửa chữa</h1>
                            <p className="text-[10px] text-stone-500 font-mono uppercase tracking-tighter">Cập nhật thời gian thực</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
                {activeOrders.length === 0 ? (
                    <div className="text-center py-20 bg-stone-900/30 rounded-3xl border border-white/5">
                        <div className="w-20 h-20 bg-stone-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                            <Car size={32} className="text-stone-600" />
                        </div>
                        <p className="text-stone-400 font-medium italic">Hiện không có phương tiện nào đang thực hiện dịch vụ.</p>
                        <Link href="/customer/booking" className="mt-6 inline-block text-orange-500 text-sm font-bold hover:underline underline-offset-4">Đăng ký dịch vụ ngay →</Link>
                    </div>
                ) : (
                    activeOrders.map((order: any) => {
                        const currentStatus = order.status || 'TIEP_NHAN';
                        const currentStepIndex = MAP_STATUS_TO_STEP[currentStatus] || 0;
                        
                        return (
                            <div key={order.id} className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                                {/* Thông tin xe vách trên */}
                                <div className="p-6 pb-2">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-stone-800 rounded-2xl flex items-center justify-center border border-white/10">
                                                <Car size={28} className="text-stone-400" />
                                            </div>
                                            <div>
                                                <span className="bg-white text-black px-2 py-0.5 rounded text-[10px] font-black font-mono tracking-tighter mb-1 block w-fit">LICENSE PLATE</span>
                                                <span className="text-2xl font-black text-white tracking-tight font-mono">{order.plateNumber || order.plate || '---'}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mb-1">Mã vận hành</div>
                                            <div className="text-stone-300 font-mono text-sm">#{order.id}</div>
                                        </div>
                                    </div>
                                    
                                    {/* MÔ TẢ TRẠNG THÁI HIỆN TẠI */}
                                    <div className="flex items-center gap-2 mb-8 animate-pulse text-orange-400">
                                        <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                        <span className="text-xs font-bold uppercase tracking-wide italic">{mapStatusLabel(currentStatus)}</span>
                                    </div>
                                </div>

                                {/* THANH TIẾN ĐỘ LOOPING (NO SLOP DESIGN) */}
                                <div className="px-6 pb-10">
                                    <div className="relative pt-10">
                                        {/* Thanh nền (Track) */}
                                        <div className="absolute top-[52px] left-0 right-0 h-1 bg-stone-800 rounded-full overflow-hidden">
                                            {/* Phần đã hoàn thành */}
                                            <div 
                                                className="absolute top-0 left-0 h-full bg-orange-600 transition-all duration-1000 ease-out"
                                                style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                                            />
                                            {/* Phần đang chạy (Infinite Loop) - Chỉ hiện ở đoạn đang xử lý */}
                                            <motion.div 
                                                className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
                                                animate={{ x: ['-200%', '200%'] }}
                                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                            />
                                        </div>

                                        {/* Các điểm mốc (Nodes) */}
                                        <div className="relative flex justify-between">
                                            {STEPS.map((step, idx) => {
                                                const isActive = idx <= currentStepIndex;
                                                const isCurrent = idx === currentStepIndex;
                                                const StepIcon = step.icon;

                                                return (
                                                    <div key={step.id} className="flex flex-col items-center">
                                                        <div className={`
                                                            z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500
                                                            ${isActive 
                                                                ? 'bg-orange-600 border-orange-400 scale-110 shadow-[0_0_15px_rgba(234,88,12,0.4)]' 
                                                                : 'bg-stone-900 border-stone-800 scale-100'}
                                                            ${isCurrent ? 'ring-4 ring-orange-500/20' : ''}
                                                        `}>
                                                            {isActive ? <CheckCircle size={12} className="text-white" /> : <div className="w-1 h-1 bg-stone-700 rounded-full" />}
                                                        </div>
                                                        <div className={`mt-3 text-[9px] font-bold uppercase tracking-tight text-center max-w-[60px] ${isActive ? 'text-white' : 'text-stone-600'}`}>
                                                            {step.label}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer thẻ - Tài chính & Chi tiết */}
                                <div className="bg-stone-900/50 p-6 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex gap-6">
                                        <div>
                                            <div className="text-[10px] text-stone-600 font-bold uppercase tracking-widest mb-1">Tạm tính</div>
                                            <div className="text-white font-black text-sm">
                                                {Number(order.totalAmount || order.total || 0).toLocaleString('vi-VN')} đ
                                            </div>
                                        </div>
                                        { (order.paidAmount || 0) > 0 && (
                                            <div>
                                                <div className="text-[10px] text-stone-600 font-bold uppercase tracking-widest mb-1">Đã cọc</div>
                                                <div className="text-emerald-500 font-bold text-sm">
                                                    {Number(order.paidAmount || 0).toLocaleString('vi-VN')} đ
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <Link 
                                        href={`/customer/orders/${order.id}`}
                                        className="h-10 px-5 bg-white text-black text-xs font-black uppercase flex items-center gap-2 hover:bg-orange-500 hover:text-white transition-all rounded-full"
                                    >
                                        Báo giá chi tiết <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* FAQ nhanh */}
                <div className="p-6 bg-stone-900/20 rounded-3xl border border-white/5">
                    <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                        <Gauge size={16} className="text-orange-500" /> Giải thích quy trình
                    </h3>
                    <div className="space-y-4 text-xs leading-relaxed text-stone-500">
                        <p>• <strong className="text-stone-300">Tiếp nhận & Chẩn đoán:</strong> Xe được ghi nhận và quét lỗi qua máy chuyên dụng.</p>
                        <p>• <strong className="text-stone-300">Sửa chữa:</strong> Kỹ thuật viên thực hiện sau khi quý khách duyệt báo giá.</p>
                        <p>• <strong className="text-stone-300">Kiểm tra (KCS):</strong> Quản đốc chạy thử thực tế trước khi xuất xưởng.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

