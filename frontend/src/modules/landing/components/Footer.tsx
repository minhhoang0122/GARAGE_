'use client';

import React from 'react';
import { MapPin, PhoneCall, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="py-16 bg-[#111] text-stone-400 border-t border-stone-800/50">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-12 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-6 text-white text-xl font-black tracking-tighter uppercase">
                            <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center text-white text-sm border-b-2 border-orange-800">GM</div>
                            Garage Master
                        </div>
                        <p className="max-w-md mb-6 leading-relaxed text-stone-300 font-medium">
                            Xưởng dịch vụ ô tô cung cấp giải pháp sửa chữa thực dụng, chính xác với chi phí cực kỳ hợp lý cho chủ xe tại Hà Nội.
                        </p>
                        <div className="space-y-4">
                            <p className="flex items-center gap-3 transition-colors hover:text-white text-stone-400 font-medium"><MapPin size={18} className="text-orange-600" /> 120 Yên Lãng, Đống Đa, Hà Nội</p>
                            <p className="flex items-center gap-3 transition-colors hover:text-white text-stone-400 font-medium"><PhoneCall size={18} className="text-orange-600" /> 098.765.4321</p>
                            <Link href="/login" className="flex items-center gap-3 text-stone-400 hover:text-orange-500 transition-colors pt-4 border-t border-stone-800/50 w-fit">
                                <LogIn size={16} /> <span className="text-xs uppercase font-black tracking-widest whitespace-nowrap">Hệ thống quản trị nội bộ</span>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="pt-8 border-t border-stone-800 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>© 2026 Garage Master. Cung cấp dịch vụ chăm sóc ô tô toàn diện và đẳng cấp.</p>
                    <div className="flex gap-6 text-stone-600">
                        <span className="hover:text-stone-400 cursor-help transition-colors">Chất lượng là danh dự</span>
                        <span className="hover:text-stone-400 cursor-help transition-colors">Tận tâm phục vụ</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
