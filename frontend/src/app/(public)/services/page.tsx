'use client';

import React, { useState, useEffect } from 'react';
import { Search, Info, Tag, Clock, ArrowRight, Wrench, FileText, CheckCircle2, Settings } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

export default function ServicesPage() {
    const [services, setServices] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        api.getCached('/public/services')
            .then(data => {
                setServices(data || []);
            })
            .catch(err => console.error('Error fetching services:', err))
            .finally(() => setIsLoading(false));
    }, []);

    const filteredServices = services.filter(s =>
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
                        <Link href="/" className="text-stone-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2 w-fit">
                            Quay lại Trang Chủ <ArrowRight size={16} />
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
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {filteredServices.length > 0 ? (
                                filteredServices.map((s, idx) => (
                                    <motion.div key={idx} variants={itemVariants} className="bg-white border hover:border-orange-500 transition-colors duration-300 shadow-sm hover:shadow-xl group relative overflow-hidden flex flex-col">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                                            <Wrench size={80} className="rotate-45" />
                                        </div>

                                        <div className="p-6 md:p-8 flex flex-col h-full relative z-10">
                                            <div className="flex justify-between items-start mb-6">
                                                <h3 className="font-bold text-stone-900 text-xl leading-tight pr-4 group-hover:text-orange-600 transition-colors uppercase">{s.tenHang}</h3>
                                                <div className="p-2 bg-stone-100 text-stone-600 rounded-sm shrink-0">
                                                    <Tag size={18} />
                                                </div>
                                            </div>

                                            <div className="mt-auto space-y-5 pt-4 border-t border-stone-100">
                                                <div>
                                                    <div className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1">Đơn giá tham khảo</div>
                                                    <div className="text-3xl font-black text-[#111]">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(s.giaBanNiemYet || 0)}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 text-xs font-medium text-stone-500 bg-stone-50 p-3 rounded-sm">
                                                    <div className="flex items-center gap-1.5" title="Bảo hành">
                                                        <Clock size={14} className="text-orange-500" />
                                                        <span>BH {s.baoHanhSoThang || 0} tháng</span>
                                                    </div>
                                                    <div className="w-px h-4 bg-stone-300"></div>
                                                    <div className="flex items-center gap-1.5" title="Thuế GTGT">
                                                        <FileText size={14} className="text-orange-500" />
                                                        <span>VAT {s.thueVat || 0}%</span>
                                                    </div>
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
