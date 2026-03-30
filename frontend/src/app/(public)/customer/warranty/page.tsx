'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, ShieldCheck, ShieldAlert, ShieldOff, Loader2, 
    AlertCircle, CheckCircle, Car, Calendar, Gauge, 
    History, Award, ChevronRight, FileCheck 
} from 'lucide-react';
import { useMyWarranty, useClaimWarranty } from '@/modules/customer/hooks/useCustomer';

const statusConfig: Record<string, { label: string; color: string; icon: any; bg: string }> = {
    CON_HAN: { 
        label: 'Đang Bảo Hành', 
        color: 'text-emerald-400', 
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        icon: ShieldCheck 
    },
    HET_HAN: { 
        label: 'Hết Hạn', 
        color: 'text-stone-500', 
        bg: 'bg-stone-800/50 border-stone-700',
        icon: ShieldOff 
    },
    DA_BAO_HANH: { 
        label: 'Chế Độ Đặc Biệt', 
        color: 'text-blue-400', 
        bg: 'bg-blue-500/10 border-blue-500/30',
        icon: ShieldAlert 
    },
};

export default function CustomerWarrantyPage() {
    const router = useRouter();
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const { data: items = [], isLoading } = useMyWarranty();
    const claimMutation = useClaimWarranty();

    const handleClaim = (orderId: number, itemId: number) => {
        setErrorMsg('');
        setSuccessMsg('');
        
        claimMutation.mutate({ 
            orderId, 
            itemIds: [itemId], 
            currentOdo: null 
        }, {
            onSuccess: (data: any) => {
                if (data.success) {
                    setSuccessMsg(data.message || 'Yêu cầu bảo hành đã được gửi tới Cố vấn dịch vụ!');
                } else {
                    setErrorMsg(data.message || 'Yêu cầu thất bại. Vui lòng liên hệ hotline.');
                }
            },
            onError: (err: any) => {
                setErrorMsg(err.message || 'Hệ thống bận. Vui lòng thử lại sau.');
            }
        });
    };

    const claimLoading = claimMutation.isPending ? (claimMutation.variables as any)?.itemIds[0] : null;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
                <p className="text-stone-400 font-mono text-sm tracking-widest uppercase">Đang đồng bộ dữ liệu bảo hành...</p>
            </div>
        );
    }

    // Group items by orderId
    const grouped: Record<number, any[]> = {};
    items.forEach((item: any) => {
        if (!grouped[item.orderId]) grouped[item.orderId] = [];
        grouped[item.orderId].push(item);
    });

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-orange-500/30">
            {/* Header Art */}
            <div className="relative h-48 bg-stone-900 overflow-hidden border-b border-stone-800">
                <div className="absolute inset-0 opacity-20">
                    <img 
                        src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
                        className="w-full h-full object-cover grayscale mix-blend-overlay"
                        alt="Warranty background"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
                
                <div className="container mx-auto px-6 h-full flex flex-col justify-end pb-8 relative z-10">
                    <Link href="/customer/home" className="flex items-center gap-2 text-stone-400 hover:text-white mb-4 transition-colors w-fit group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-widest">Trở về</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-600 rounded-xl shadow-lg shadow-orange-600/20">
                            <Award size={32} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight uppercase italic">Chứng nhận bảo hành</h1>
                            <p className="text-stone-400 text-xs font-medium uppercase tracking-widest">Digital Service Record • Garage Pro System</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-10 max-w-4xl">
                <AnimatePresence>
                    {successMsg && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-8 flex items-center gap-3 text-emerald-400 shadow-xl shadow-emerald-500/5"
                        >
                            <CheckCircle size={20} className="shrink-0" />
                            <span className="text-sm font-bold">{successMsg}</span>
                        </motion.div>
                    )}
                    {errorMsg && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8 flex items-center gap-3 text-red-400 shadow-xl shadow-red-500/5"
                        >
                            <AlertCircle size={20} className="shrink-0" />
                            <span className="text-sm font-bold">{errorMsg}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {items.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-stone-800 rounded-3xl">
                        <div className="w-20 h-20 bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-700">
                            <ShieldOff size={40} />
                        </div>
                        <h2 className="text-xl font-bold text-stone-400 mb-2">Chưa có dữ liệu bảo hành</h2>
                        <p className="text-stone-600 text-sm max-w-xs mx-auto">
                            Hệ thống sẽ tự động kích hoạt bảo hành sau khi lệnh sửa chữa hoàn tất và thanh toán thành công.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-12">
                        {Object.entries(grouped).map(([orderId, orderItems], groupIdx) => {
                            const first = orderItems[0];
                            return (
                                <motion.div 
                                    key={orderId}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: groupIdx * 0.1 }}
                                    viewport={{ once: true }}
                                    className="relative"
                                >
                                    {/* Order Badge */}
                                    <div className="absolute -top-4 left-6 z-20 px-4 py-1.5 bg-stone-800 border border-stone-700 rounded-full flex items-center gap-2 shadow-xl">
                                        <History size={12} className="text-orange-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-300">Hợp đồng #{orderId}</span>
                                    </div>

                                    <div className="bg-[#111] border border-stone-800 rounded-[2rem] overflow-hidden shadow-2xl">
                                        {/* Vehicle Info Bar */}
                                        <div className="bg-stone-900/50 px-8 py-6 border-b border-stone-800 flex flex-wrap items-center justify-between gap-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-black border border-stone-700 flex items-center justify-center text-orange-500">
                                                    <Car size={24} />
                                                </div>
                                                <div>
                                                    <div className="text-white font-mono font-black text-xl tracking-tighter uppercase">{first.plate}</div>
                                                    <div className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">Mã đăng ký phương tiện</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-10">
                                                <div className="text-right">
                                                    <div className="text-stone-300 font-bold text-sm">{first.ngaySuaChua ? new Date(first.ngaySuaChua).toLocaleDateString('vi-VN') : '---'}</div>
                                                    <div className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">Ngày thi công</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-white font-bold text-sm uppercase">Cố vấn dịch vụ</div>
                                                    <div className="text-orange-500 text-[10px] font-black uppercase tracking-widest underline decoration-2 underline-offset-4">Đã xác thực</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Warranty Items Grid */}
                                        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {orderItems.map((item: any) => {
                                                const st = statusConfig[item.warrantyStatus] || statusConfig.HET_HAN;
                                                const StatusIcon = st.icon;
                                                
                                                // Calculate progress percentage
                                                let progress = 0;
                                                let remainText = "";
                                                if (item.ngayHetHan && item.ngaySuaChua) {
                                                    const start = new Date(item.ngaySuaChua).getTime();
                                                    const end = new Date(item.ngayHetHan).getTime();
                                                    const now = new Date().getTime();
                                                    const total = end - start;
                                                    progress = Math.min(100, Math.max(0, ((end - now) / total) * 100));
                                                    
                                                    const remainDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
                                                    if (remainDays > 30) {
                                                        remainText = `${Math.floor(remainDays / 30)} tháng`;
                                                    } else {
                                                        remainText = `${remainDays} ngày`;
                                                    }
                                                }

                                                return (
                                                    <div 
                                                        key={item.orderItemId} 
                                                        className="bg-black/40 border border-stone-800 hover:border-stone-700 p-6 rounded-2xl transition-all group"
                                                    >
                                                        <div className="flex justify-between items-start mb-6">
                                                            <div className="flex-1 min-w-0 pr-4">
                                                                <h4 className="text-white font-bold text-lg leading-tight mb-2 group-hover:text-orange-100 transition-colors">
                                                                    {item.productName}
                                                                </h4>
                                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${st.bg} ${st.color}`}>
                                                                    <StatusIcon size={12} />
                                                                    {st.label}
                                                                </div>
                                                            </div>
                                                            <div className="w-12 h-12 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 group-hover:text-orange-500 transition-colors">
                                                                <FileCheck size={24} />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-6">
                                                            {/* Detailed Stats */}
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="bg-stone-900/30 p-3 rounded-xl border border-white/5">
                                                                    <div className="flex items-center gap-2 text-stone-500 scale-90 origin-left mb-1">
                                                                        <Calendar size={14} />
                                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Thời gian</span>
                                                                    </div>
                                                                    <div className="text-white font-mono font-bold text-sm">{item.baoHanhThang || 0} Tháng</div>
                                                                </div>
                                                                <div className="bg-stone-900/30 p-3 rounded-xl border border-white/5">
                                                                    <div className="flex items-center gap-2 text-stone-500 scale-90 origin-left mb-1">
                                                                        <Gauge size={14} />
                                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Quãng đường</span>
                                                                    </div>
                                                                    <div className="text-white font-mono font-bold text-sm">{(item.baoHanhKm || 0).toLocaleString()} KM</div>
                                                                </div>
                                                            </div>

                                                            {/* Progress Tracker */}
                                                            {item.warrantyStatus === 'CON_HAN' && (
                                                                <div>
                                                                    <div className="flex justify-between items-end mb-2">
                                                                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Thời hạn bảo hành còn lại</span>
                                                                        <span className="text-emerald-400 font-black text-sm uppercase">{remainText}</span>
                                                                    </div>
                                                                    <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
                                                                        <motion.div 
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: `${progress}%` }}
                                                                            transition={{ duration: 1, delay: 0.5 }}
                                                                            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Action Button */}
                                                            {item.warrantyStatus === 'CON_HAN' && (
                                                                <button
                                                                    onClick={() => handleClaim(item.orderId, item.orderItemId)}
                                                                    disabled={claimLoading === item.orderItemId}
                                                                    className="w-full bg-white hover:bg-orange-500 text-black hover:text-white font-black uppercase text-xs tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                                                >
                                                                    {claimLoading === item.orderItemId ? (
                                                                        <Loader2 size={16} className="animate-spin" />
                                                                    ) : (
                                                                        <>
                                                                            Gửi yêu cầu bảo hành <ChevronRight size={14} />
                                                                        </>
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Footer Style */}
            <footer className="container mx-auto px-6 py-20 border-t border-stone-800 text-center">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="h-px w-10 bg-stone-800"></div>
                    <ShieldCheck size={20} className="text-orange-600" />
                    <div className="h-px w-10 bg-stone-800"></div>
                </div>
                <p className="text-stone-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">Mọi quyền lợi của Quý khách được bảo vệ bởi</p>
                <h3 className="text-2xl font-black italic tracking-tighter text-stone-200">GARAGE PRO CERTIFIED SYSTEM</h3>
            </footer>
        </div>
    );
}
