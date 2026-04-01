'use client';

import React, { useState, useEffect } from 'react';
import { Search, Info, Tag, Clock, ArrowRight, ArrowLeft, Wrench, FileText, CheckCircle2, Settings } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSSEContext } from '@/modules/common/contexts/RealtimeContext';

export default function ServicesPage() {
    const [search, setSearch] = useState('');
    const queryClient = useQueryClient();
    const { addListener, removeListener } = useSSEContext();

    const { data: services = [], isLoading } = useQuery({
        queryKey: ['public-services'],
        queryFn: () => api.getCached('/public/services'),
        staleTime: 1000 * 60 * 5, // Cache for 5 mins
    });

    // SSE Listener để đồng bộ bảng giá khi Admin cập nhật
    useEffect(() => {
        const handleRefresh = (data: any) => {
            console.log('[Public SSE] Services/Inventory Update received:', data);
            queryClient.invalidateQueries({ queryKey: ['public-services'] });
        };

        addListener('inventory_updated', handleRefresh);

        return () => {
            removeListener('inventory_updated', handleRefresh);
        };
    }, [addListener, removeListener, queryClient]);

    const filteredServices = services.filter((s: any) =>
        s?.tenHang?.toLowerCase().includes(search.toLowerCase())
    );

    const mechanicalSpring = {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: mechanicalSpring }
    };

    return (
        <div className="min-h-screen bg-[#fafaf8] selection:bg-orange-200">
            {/* Header chuyên biệt cho trang Bảng Giá */}
            <div className="bg-[#1C1917] p-4 border-b-4 border-orange-600">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-600 text-white flex items-center justify-center rounded-sm font-black text-xl">
                                $
                            </div>
                            <div>
                                <h1 className="text-white font-bold text-lg uppercase tracking-widest">Báo giá dịch vụ sửa chữa</h1>
                                <p className="text-stone-400 text-xs">Phụ tùng chính hãng - Bảo hành tiêu chuẩn</p>
                            </div>
                        </div>
                        <Link href="/" className="text-stone-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2 w-fit group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Quay lại Trang Chủ
                        </Link>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-12 md:py-20">
                <div className="max-w-6xl mx-auto">

                    {/* Thanh lọc/tìm kiếm */}
                    <div className="bg-white p-6 md:p-8 shadow-xl border-t-4 border-stone-800 mb-12 flex flex-col md:flex-row gap-6 items-center justify-between relative z-10">
                        <div className="w-full md:w-1/2">
                            <h2 className="text-2xl font-black text-stone-900 mb-2">Tra cứu nhanh hạng mục</h2>
                            <p className="text-stone-500 text-sm">Nhập tên hạng mục bảo dưỡng, sửa chữa hoặc phụ tùng cần tìm kiếm.</p>
                        </div>
                        <div className="w-full md:w-1/2 relative">
                            <div className="flex bg-[#fafaf8] border-2 border-stone-200 focus-within:border-orange-500 transition-colors p-1">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Ví dụ: Thay dầu, Bảo dưỡng phanh..."
                                    className="w-full bg-transparent text-stone-900 pl-14 pr-4 py-3 outline-none font-medium text-lg"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vùng Bảng Giá / Dịch Vụ */}
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin text-orange-600 mb-4">
                                <Settings size={40} />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-16">
                            {/* Featured Services Section if any */}
                            {filteredServices.length >= 2 && search === '' && (
                                <section>
                                    <h3 className="text-xl font-bold text-stone-900 mb-8 flex items-center gap-3">
                                        <div className="w-8 h-1 bg-orange-600"></div>
                                        Dịch vụ phổ biến nhất
                                    </h3>
                                    <div className="grid lg:grid-cols-2 gap-8">
                                        {filteredServices.slice(0, 2).map((s: any, idx: number) => (
                                            <motion.div 
                                                key={`featured-${idx}`}
                                                initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="bg-[#1C1917] text-white p-8 md:p-10 border-b-8 border-orange-600 shadow-2xl relative group overflow-hidden"
                                            >
                                                <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-125 transition-transform duration-700 pointer-events-none">
                                                    <Wrench size={200} className="rotate-12" />
                                                </div>
                                                <div className="relative z-10">
                                                    <span className="inline-block bg-orange-600 text-[10px] font-black uppercase tracking-[3px] px-3 py-1 mb-6">Hot Service</span>
                                                    <h4 className="text-3xl font-black mb-4 group-hover:text-orange-400 transition-colors uppercase">{s.tenHang}</h4>
                                                    <div className="text-4xl font-black text-orange-500 mb-6">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(s.giaBanNiemYet || 0)}
                                                    </div>
                                                    <p className="text-stone-400 text-sm mb-6 max-w-md">Bao gồm công thợ tay nghề cao, kiểm tra tổng quát các hạng mục liên quan và bảo hành {s.baoHanhSoThang || 0} tháng chính hãng.</p>
                                                    <Link href="/booking" className="inline-flex items-center gap-2 text-orange-500 font-bold hover:gap-4 transition-all">
                                                        ĐẶT LỊCH NGAY <ArrowRight size={18} />
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* All Services Grid */}
                            <section>
                                <h3 className="text-xl font-bold text-stone-900 mb-8 flex items-center gap-3">
                                    <div className="w-8 h-1 bg-stone-300"></div>
                                    {search ? `Kết quả cho "${search}"` : 'Tất cả hạng mục dịch vụ'}
                                </h3>
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="show"
                                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                                >
                                    {filteredServices.length > 0 ? (
                                        filteredServices.map((s: any, idx: number) => (
                                            <motion.div key={idx} variants={itemVariants} className="bg-white border-2 border-transparent hover:border-stone-800 transition-all duration-300 shadow-sm hover:shadow-xl group relative overflow-hidden flex flex-col">
                                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                                                    <Settings size={80} className="rotate-45" />
                                                </div>

                                                <div className="p-6 md:p-8 flex flex-col h-full relative z-10">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <h3 className="font-bold text-stone-900 text-lg leading-tight pr-4 group-hover:text-orange-600 transition-colors uppercase">{s.tenHang}</h3>
                                                        <div className="p-2 bg-stone-100 text-stone-400 rounded-sm shrink-0">
                                                            <Tag size={18} />
                                                        </div>
                                                    </div>

                                                    <div className="mt-auto space-y-4 pt-4 border-t border-stone-100">
                                                        <div className="flex justify-between items-end">
                                                            <div>
                                                                <div className="text-stone-400 text-[10px] font-black uppercase tracking-widest">Giá Niêm Yết</div>
                                                                <div className="text-2xl font-black text-[#111]">
                                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(s.giaBanNiemYet || 0)}
                                                                </div>
                                                            </div>
                                                            <div className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-1 uppercase">BH {s.baoHanhSoThang || 0}T</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-16 text-center border-2 border-dashed border-stone-300 bg-stone-50">
                                            <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-200 text-stone-500 rounded-full mb-4">
                                                <Search size={24} />
                                            </div>
                                            <h3 className="text-lg font-bold text-stone-700 mb-2">Không tìm thấy hạng mục phù hợp</h3>
                                            <p className="text-stone-500">Quý khách vui lòng thử lại với từ khóa khác hoặc liên hệ Hotline.</p>
                                        </div>
                                    )}
                                </motion.div>
                            </section>
                        </div>
                    )}

                    {/* Footer / CTA của Bảng Giá */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-16 bg-[#1C1917] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 border-l-4 border-orange-600 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <CheckCircle2 size={150} />
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-2xl md:text-3xl font-black mb-3 text-white">Bảng giá trên mang tính tham khảo</h2>
                            <p className="text-stone-400 text-lg leading-relaxed max-w-2xl">Chi phí thực tế có thể thay đổi tùy thuộc vào tình trạng hao mòn cụ thể của xe. Cố vấn dịch vụ sẽ lên Báo Giá Chi Tiết và chỉ thi công khi Quý khách chốt phương án.</p>
                        </div>

                        <div className="relative z-10 shrink-0 w-full md:w-auto">
                            <Link href="/booking" className="flex items-center justify-center gap-3 bg-orange-600 hover:bg-orange-500 text-white px-8 py-5 font-bold transition-all w-full text-lg shadow-xl shadow-orange-900/50">
                                Đặt lịch kiểm tra xe <ArrowRight size={20} />
                            </Link>
                        </div>
                    </motion.div>

                </div>
            </main>
        </div>
    );
}
