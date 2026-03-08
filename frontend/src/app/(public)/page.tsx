'use client';

import Link from 'next/link';
import { Wrench, Calendar, ClipboardCheck, LayoutDashboard } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function LandingPage() {
    const { data: session } = useSession();

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Hero Section */}
            <header className="relative py-20 bg-indigo-900 text-white overflow-hidden">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-5xl font-bold mb-6 tracking-tight">GARAGEMASTER</h1>
                    <p className="text-xl mb-10 text-indigo-100 max-w-2xl mx-auto leading-relaxed">
                        Hệ thống sửa chữa ô tô thông minh, minh bạch và tận tâm.
                        Chúng tôi chăm sóc xe của bạn như chăm sóc chính gia đình mình.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        {session?.user ? (
                            <Link href="/admin" className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2">
                                <LayoutDashboard size={20} />
                                Vào bảng điều khiển
                            </Link>
                        ) : (
                            <Link href="/booking" className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg">
                                Đặt lịch sửa chữa ngay
                            </Link>
                        )}
                        <Link href="/services" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-xl font-bold transition-all">
                            Xem bảng giá dịch vụ
                        </Link>
                    </div>
                </div>
            </header>

            {/* Features */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                                <Calendar size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Đặt lịch dễ dàng</h3>
                            <p className="text-slate-600">Chọn dịch vụ và thời gian phù hợp ngay trên website. Không cần chờ đợi.</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                                <ClipboardCheck size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Theo dõi tiến độ</h3>
                            <p className="text-slate-600">Tra cứu trạng thái sửa chữa xe của bạn mọi lúc, mọi nơi chỉ với số điện thoại.</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                                <Wrench size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Bảng giá minh bạch</h3>
                            <p className="text-slate-600">Mọi dịch vụ và phụ tùng đều được niêm yết giá công khai, không lo bị "chặt chém".</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto py-10 bg-slate-900 text-slate-400 border-t border-slate-800">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4 text-white">
                        <Wrench size={20} />
                        <span className="font-bold">GARAGEMASTER</span>
                    </div>
                    <p>© 2026 Garage Management System. All rights reserved.</p>
                    <div className="mt-4 flex justify-center gap-6">
                        <Link href="/admin" className="hover:text-white transition-colors">Cổng nhân viên</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
