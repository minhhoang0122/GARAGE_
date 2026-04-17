'use client';

import React from 'react';
import { Car, FileText, CheckCircle, Shield, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatProps {
    label: string;
    value: string | number;
    icon: React.ElementType;
    color: 'blue' | 'yellow' | 'green' | 'purple';
    trend?: string;
    delay?: number;
}

const StatCard = ({ label, value, icon: Icon, color, trend, delay = 0 }: StatProps) => {
    const colorMap = {
        blue: 'from-blue-600 to-indigo-700 shadow-blue-500/20 text-white',
        yellow: 'from-amber-400 to-orange-500 shadow-orange-500/20 text-white',
        green: 'from-emerald-500 to-teal-600 shadow-emerald-500/20 text-white',
        purple: 'from-violet-500 to-purple-600 shadow-purple-500/20 text-white',
    };

    const iconBgMap = {
        blue: 'bg-white/20',
        yellow: 'bg-white/20',
        green: 'bg-white/20',
        purple: 'bg-white/20',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${colorMap[color]} shadow-xl group cursor-default`}
        >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Icon size={120} />
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-xl ${iconBgMap[color]} backdrop-blur-sm`}>
                        <Icon size={20} className="text-white" />
                    </div>
                    {trend && (
                        <div className="flex items-center gap-1 text-[10px] font-black bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                            <TrendingUp size={12} />
                            {trend}
                        </div>
                    )}
                </div>

                <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] opacity-80 mb-1">{label}</h4>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black tracking-tighter tabular-nums drop-shadow-md">
                            {value}
                        </span>
                        <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest leading-none">đơn hiện tại</span>
                    </div>
                </div>
            </div>

            {/* Bottom Glow */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left mx-5 mb-2" />
        </motion.div>
    );
};

export default function SaleBentoStats({ 
    countWaiting = 0, 
    countPendingQuotes = 0, 
    countPendingPayment = 0, 
    countWarranty = 0 
}: {
    countWaiting?: number;
    countPendingQuotes?: number;
    countPendingPayment?: number;
    countWarranty?: number;
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 h-full">
            <StatCard 
                label="Xe đang trong xưởng" 
                value={countWaiting} 
                icon={Car} 
                color="blue" 
                trend="+2 xe mới"
                delay={0.1}
            />
            <StatCard 
                label="Báo giá chờ duyệt" 
                value={countPendingQuotes} 
                icon={FileText} 
                color="yellow" 
                trend="Gấp"
                delay={0.2}
            />
            <StatCard 
                label="Chờ thanh toán" 
                value={countPendingPayment} 
                icon={CheckCircle} 
                color="green" 
                trend="Ưu tiên"
                delay={0.3}
            />
            <StatCard 
                label="Yêu cầu bảo hành" 
                value={countWarranty} 
                icon={Shield} 
                color="purple" 
                delay={0.4}
            />
        </div>
    );
}
