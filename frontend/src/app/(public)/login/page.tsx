'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Wrench, ArrowRight, LayoutDashboard, Home, Moon, Sun, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

export default function RoleSelectorPage() {
    const { theme, toggleTheme } = useTheme();

    const roles = [
        {
            id: 'customer',
            title: 'Khách hàng',
            subtitle: 'Dành cho chủ sở hữu phương tiện',
            description: 'Quản lý lịch bảo dưỡng, theo dõi tiến độ sửa chữa và tra cứu lịch sử dịch vụ mọi lúc, mọi nơi.',
            icon: <User className="w-6 h-6" />,
            href: '/customer/login',
            features: [
                'Đặt lịch dịch vụ 24/7',
                'Theo dõi thời gian thực',
                'Thoanh toán & Hóa đơn điện tử'
            ],
            color: 'blue',
        },
        {
            id: 'staff',
            title: 'Nhân viên & Quản lý',
            subtitle: 'Hệ thống điều hành nội bộ',
            description: 'Công cụ dành cho Cố vấn dịch vụ, Kỹ thuật viên và Ban quản lý để tối ưu hóa quy trình vận hành.',
            icon: <Wrench className="w-6 h-6" />,
            href: '/admin/login',
            features: [
                'Quản lý lệnh sửa chữa',
                'Kiểm kê kho phụ tùng',
                'Báo cáo & Phân tích chuyên sâu'
            ],
            color: 'indigo'
        }
    ];

    return (
        <div className="h-screen flex bg-white dark:bg-[#0a0a0a] transition-colors duration-300 overflow-hidden">
            {/* Left Side: Branding & Visuals (Desktop Only) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 border-r border-slate-200 dark:border-slate-800">
                <div
                    className="absolute inset-0 bg-cover bg-center grayscale-[20%] opacity-60 mix-blend-overlay transition-transform duration-[10s] hover:scale-105"
                    style={{ backgroundImage: 'url("/images/login-bg.png")' }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/40 to-transparent" />

                <div className="relative z-10 p-12 flex flex-col justify-between h-full w-full">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <LayoutDashboard className="text-white" size={20} />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">
                            Garage<span className="text-blue-400">Master</span>
                        </span>
                    </div>

                    <div className="max-w-md">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-4xl font-semibold !text-white mb-6 leading-tight tracking-tight">
                                Giải pháp quản trị Gara <br />
                                <span className="!text-blue-400">Thế Hệ Mới.</span>
                            </h2>
                            <p className="!text-white text-lg leading-relaxed mb-8 opacity-90">
                                Hệ thống hóa quy trình, tối ưu hóa hiệu suất và nâng tầm trải nghiệm dịch vụ khách hàng chuyên nghiệp.
                            </p>

                            <div className="space-y-4">
                                {[
                                    'Tiêu chuẩn quản lý quốc tế',
                                    'Bảo mật dữ liệu tuyệt đối',
                                    'Hỗ trợ kỹ thuật 24/7'
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 !text-white">
                                        <CheckCircle2 size={18} className="!text-blue-400" />
                                        <span className="text-sm font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    © 2026 GarageMaster Enterprise
                </div>
            </div>

            {/* Right Side: Role Selector */}
            <div className="w-full lg:w-1/2 flex flex-col relative h-full overflow-y-auto scrollbar-hide">
                {/* Top Nav for Mobile & Actions */}
                <div className="p-6 flex items-center justify-between">
                    <Link href="/" className="lg:hidden flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                            <LayoutDashboard className="text-white" size={16} />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">GM</span>
                    </Link>

                    <div className="flex items-center gap-4 ml-auto">
                        <Link href="/" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors group">
                            <Home size={16} />
                            <span>Về trang chủ</span>
                        </Link>
                        <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-slate-500 hover:text-blue-600 transition-colors"
                        >
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
                    <div className="w-full max-w-md">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 text-center lg:text-left"
                        >
                            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white mb-2 tracking-tight">
                                Chào mừng quay trở lại
                            </h1>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                Vui lòng chọn vai trò để tiếp tục truy cập.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 gap-3">
                            {roles.map((role, idx) => (
                                <motion.div
                                    key={role.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * (idx + 1) }}
                                >
                                    <Link href={role.href} className="flex group">
                                        <div className="w-full p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl transition-all duration-300 hover:border-blue-500/50 hover:bg-white dark:hover:bg-slate-900 hover:shadow-lg hover:shadow-blue-500/5">
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className={`p-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-blue-600 dark:text-blue-400 shadow-sm group-hover:scale-110 transition-transform`}>
                                                    {role.icon}
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block uppercase tracking-wider">
                                                        {role.subtitle}
                                                    </span>
                                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight leading-none">
                                                        {role.title}
                                                    </h3>
                                                </div>
                                                <div className="ml-auto w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ArrowRight size={12} className="text-blue-600" />
                                                </div>
                                            </div>

                                            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-4 font-medium line-clamp-2">
                                                {role.description}
                                            </p>

                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {role.features.map((f, fi) => (
                                                    <div key={fi} className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                                        <div className="w-1 h-1 rounded-full bg-blue-500" />
                                                        {f}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                                                {role.demoInfo ? (
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                                                        {role.demoInfo}
                                                    </span>
                                                ) : <div />}
                                                <div className="flex items-center gap-1 text-slate-900 dark:text-white font-bold text-[10px] uppercase tracking-tighter">
                                                    Truy cập <ArrowRight size={12} />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-12 text-center">
                            <p className="text-xs text-slate-400 font-medium">
                                Cần hỗ trợ kỹ thuật? <a href="#" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Liên hệ bộ phận IT</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
