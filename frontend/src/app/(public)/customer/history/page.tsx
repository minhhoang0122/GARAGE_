'use client';

import Link from 'next/link';
import { ArrowLeft, Car, CheckCircle, Loader2, Calendar, Hash, FileText, Download, ShieldCheck, ChevronRight } from 'lucide-react';
import { useMyOrders } from '@/modules/customer/hooks/useCustomer';
import { useMemo } from 'react';

export default function CustomerHistoryPage() {
    const { data: allOrders = [], isLoading: dataLoading } = useMyOrders();
    
    // Lọc các đơn đã hoàn thành hoặc đã đóng
    const historyOrders = useMemo(() => 
        allOrders
            .filter((o: any) => ['HOAN_THANH', 'DONG'].includes(o.status || o.TrangThai))
            .sort((a: any, b: any) => new Date(b.createdAt || b.NgayTao).getTime() - new Date(a.createdAt || a.NgayTao).getTime())
    , [allOrders]);

    if (dataLoading) {
        return (
            <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-orange-500" size={40} />
                <span className="text-stone-500 font-mono text-[10px] uppercase tracking-widest">Đang truy xuất hồ sơ bảo trì...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-950 text-stone-200 selection:bg-orange-500/30">
            {/* Header Journal Style */}
            <header className="sticky top-0 z-50 bg-stone-950/80 backdrop-blur-xl border-b border-white/5 px-4 py-6">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <Link href="/customer/home" className="w-10 h-10 rounded-xl bg-stone-900 border border-white/5 flex items-center justify-center hover:border-orange-500/50 transition-all group">
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-black text-white tracking-tight leading-none mb-1">Hồ sơ dịch vụ</h1>
                            <p className="text-[10px] text-stone-500 font-mono uppercase tracking-widest">Digital Service Booklet</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-10">
                {historyOrders.length === 0 ? (
                    <div className="text-center py-24 bg-stone-900/20 rounded-[32px] border border-dashed border-white/10">
                        <div className="w-20 h-20 bg-stone-800/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                            <FileText size={32} className="text-stone-700" />
                        </div>
                        <h3 className="text-stone-400 font-bold mb-2">Chưa có dữ liệu bảo trì</h3>
                        <p className="text-stone-500 text-sm max-w-xs mx-auto">Các hóa đơn và biên bản kiểm tra sẽ xuất hiện ở đây sau khi dịch vụ hoàn tất.</p>
                    </div>
                ) : (
                    <div className="relative space-y-12">
                        {/* Trục Timeline */}
                        <div className="absolute left-6 top-4 bottom-4 w-px bg-gradient-to-b from-orange-500/50 via-stone-800 to-stone-900/10" />

                        {historyOrders.map((order: any, idx: number) => (
                            <div key={order.id} className="relative pl-14 group">
                                {/* Điểm mốc trên Timeline */}
                                <div className="absolute left-[21px] top-1.5 w-[11px] h-[11px] rounded-full bg-stone-950 border-2 border-orange-500 z-10 group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(249,115,22,0.4)]" />
                                
                                {/* Header của mốc thời gian */}
                                <div className="mb-4">
                                    <div className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] mb-1">
                                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Không rõ ngày'}
                                    </div>
                                </div>

                                {/* Thẻ biên bản "Certified Paper" Style */}
                                <div className="bg-[#161616] border border-white/5 rounded-[24px] p-6 shadow-xl group-hover:border-white/10 transition-colors">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-stone-800 rounded-lg flex items-center justify-center border border-white/5">
                                                <Car size={20} className="text-stone-400" />
                                            </div>
                                            <div>
                                                <div className="text-white font-bold text-sm tracking-tight">{order.plateNumber || order.plate || '---'}</div>
                                                <div className="text-[10px] text-stone-500 font-mono tracking-tighter uppercase">Dịch vụ sửa chữa chung</div>
                                            </div>
                                        </div>
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <ShieldCheck size={10} /> Certified
                                        </div>
                                    </div>

                                    {/* Nội dung hóa đơn tóm tắt */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-stone-900/50 rounded-xl p-3 border border-white/5">
                                            <div className="text-[9px] text-stone-500 font-bold uppercase tracking-widest mb-1.5">Mã số hóa đơn</div>
                                            <div className="text-stone-300 font-mono text-xs italic">#INV-{order.id}</div>
                                        </div>
                                        <div className="bg-stone-900/50 rounded-xl p-3 border border-white/5">
                                            <div className="text-[9px] text-stone-500 font-bold uppercase tracking-widest mb-1.5">Tổng chi phí</div>
                                            <div className="text-white font-black text-sm">
                                                {Number(order.totalAmount || order.total || 0).toLocaleString('vi-VN')} đ
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer thẻ */}
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="text-[10px] text-stone-500 italic">
                                            Phụ tùng chính hãng bảo hành 06 tháng
                                        </div>
                                        <Link 
                                            href={`/customer/orders/${order.id}`}
                                            className="flex items-center gap-2 text-xs font-bold text-orange-500 hover:text-orange-400 transition-colors uppercase tracking-widest"
                                        >
                                            Chi tiết <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Cam kết chất lượng ở cuối sổ */}
                <div className="mt-20 p-8 rounded-[32px] bg-gradient-to-br from-stone-900 to-[#111] border border-white/5 text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                        <ShieldCheck size={120} />
                    </div>
                    <h3 className="text-white font-black text-lg mb-4 tracking-tight">Cam kết Garage Master</h3>
                    <p className="text-stone-400 text-xs leading-relaxed max-w-sm mx-auto mb-6">
                        Mọi lần bảo dưỡng đều được lưu trữ vĩnh viễn trên hệ thống đám mây để đảm bảo giá trị xe và quyền lợi bảo hành tối đa cho quý khách.
                    </p>
                    <div className="flex justify-center gap-8">
                        <div className="flex flex-col items-center">
                            <span className="text-white font-bold text-sm leading-tight">100%</span>
                            <span className="text-stone-600 text-[10px] uppercase tracking-tighter">Phụ tùng chuẩn</span>
                        </div>
                        <div className="w-px h-8 bg-white/5 self-center" />
                        <div className="flex flex-col items-center">
                            <span className="text-white font-bold text-sm leading-tight">24/7</span>
                            <span className="text-stone-600 text-[10px] uppercase tracking-tighter">Hỗ trợ hotline</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

