'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Search, Clock, QrCode, CalendarPlus, ShieldCheck, LogOut, Car, Wrench } from 'lucide-react';

const menuItems = [
    {
        title: 'Tra cứu tiến độ',
        description: 'Xem xe đang sửa đến đâu',
        icon: Search,
        href: '/customer/progress',
        color: 'from-blue-600 to-blue-800',
        borderColor: 'border-blue-700',
    },
    {
        title: 'Lịch sử sửa chữa',
        description: 'Xem lại các lần sửa trước',
        icon: Clock,
        href: '/customer/history',
        color: 'from-emerald-600 to-emerald-800',
        borderColor: 'border-emerald-700',
    },
    {
        title: 'Thanh toán nhanh',
        description: 'Quét mã QR để thanh toán',
        icon: QrCode,
        href: '/customer/payment',
        color: 'from-orange-600 to-orange-800',
        borderColor: 'border-orange-700',
    },
    {
        title: 'Đặt lịch hẹn',
        description: 'Đặt lịch sửa chữa, bảo dưỡng',
        icon: CalendarPlus,
        href: '/customer/booking',
        color: 'from-purple-600 to-purple-800',
        borderColor: 'border-purple-700',
    },
    {
        title: 'Bảo hành',
        description: 'Xem và yêu cầu bảo hành',
        icon: ShieldCheck,
        href: '/customer/warranty',
        color: 'from-cyan-600 to-cyan-800',
        borderColor: 'border-cyan-700',
    },
];

export default function CustomerHomePage() {
    const { data: session } = useSession();
    const router = useRouter();



    const userName = session?.user?.name || 'Quý khách';

    return (
        <div className="min-h-screen bg-stone-950">
            {/* Top bar */}
            <header className="bg-stone-900 border-b border-stone-800">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                            <Wrench size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">Garage Master</p>
                            <p className="text-stone-500 text-xs">Xin chào, <span className="text-stone-300">{userName}</span></p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="text-stone-500 hover:text-red-400 transition-colors p-2"
                        title="Đăng xuất"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            {/* Menu Grid */}
            <main className="max-w-2xl mx-auto px-4 py-8">
                <h2 className="text-lg font-bold text-stone-200 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
                    Mục lục chức năng
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group bg-gradient-to-br ${item.color} border ${item.borderColor} rounded-2xl p-6 hover:scale-[1.03] transition-all duration-200 shadow-lg hover:shadow-xl`}
                            >
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                                    <Icon size={24} className="text-white" />
                                </div>
                                <h3 className="text-white font-bold text-base">{item.title}</h3>
                                <p className="text-white/60 text-xs mt-1">{item.description}</p>
                            </Link>
                        );
                    })}
                </div>

                {/* Quick info */}
                <div className="mt-8 bg-stone-900 border border-stone-800 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-stone-400 text-sm">
                        <Car size={16} />
                        <span>Quý khách cần hỗ trợ? Liên hệ <strong className="text-orange-400">0900.000.000</strong></span>
                    </div>
                </div>
            </main>
        </div>
    );
}
