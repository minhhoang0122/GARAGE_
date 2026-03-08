'use client';

import React, { useState, useEffect } from 'react';
import { Search, Info, Tag, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ServicesPage() {
    const [services, setServices] = useState<any[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/public/services')
            .then(res => res.json())
            .then(data => setServices(data))
            .catch(err => console.error('Error fetching services:', err));
    }, []);

    const filteredServices = services.filter(s =>
        s.tenHang.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">Bảng giá dịch vụ</h1>
                        <p className="text-slate-600">Báo giá minh bạch, cam kết không phát sinh chi phí ẩn.</p>
                    </div>
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm dịch vụ..."
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServices.map(s => (
                        <div key={s.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-slate-900 text-lg leading-tight">{s.tenHang}</h3>
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Tag size={18} />
                                </div>
                            </div>

                            <div className="mt-auto space-y-3">
                                <div className="text-2xl font-bold text-indigo-600">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(s.giaBanNiemYet)}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <Clock size={16} />
                                        <span>BH {s.baoHanhSoThang} tháng</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Info size={16} />
                                        <span>VAT {s.thueVat}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredServices.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-slate-500 text-lg">Không tìm thấy dịch vụ nào phù hợp.</p>
                    </div>
                )}

                <div className="mt-16 bg-indigo-900 rounded-3xl p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Bạn cần tư vấn chi tiết hơn?</h2>
                        <p className="text-indigo-200">Liên hệ ngay để nhận báo giá chính xác cho dòng xe của bạn.</p>
                    </div>
                    <Link href="/booking" className="whitespace-nowrap bg-white text-indigo-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition-colors">
                        Đăng ký tư vấn ngay
                    </Link>
                </div>
            </div>
        </div>
    );
}
