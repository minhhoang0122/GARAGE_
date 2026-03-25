'use client';
import Link from 'next/link';
import { ClipboardCheck, Wrench, ShieldCheck } from 'lucide-react';

interface JobStageTabsProps {
    orderId: number;
    currentStage: 'inspect' | 'assign' | 'qc';
    pendingQC?: number;
}

export default function JobStageTabs({ orderId, currentStage, pendingQC = 0 }: JobStageTabsProps) {
    const stages = [
        { id: 'inspect', label: 'CHẨN ĐOÁN', href: `/mechanic/inspect/${orderId}`, icon: ClipboardCheck, badge: 0 },
        { id: 'assign', label: 'ĐIỀU PHỐI', href: `/mechanic/assign/${orderId}`, icon: Wrench, badge: 0 },
        { id: 'qc', label: 'NGHIỆM THU', href: `/mechanic/qc/${orderId}`, icon: ShieldCheck, badge: pendingQC },
    ];

    return (
        <div className="flex items-center bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 w-fit shadow-sm backdrop-blur-sm">
            {stages.map((stage) => {
                const Icon = stage.icon;
                const isActive = currentStage === stage.id;
                return (
                    <Link
                        key={stage.id}
                        href={stage.href}
                        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all duration-300 tracking-wider group ${
                            isActive 
                            ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-200/50 translate-y-[-1px]' 
                            : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
                        }`}
                    >
                        <Icon size={14} className={`${isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-600'} transition-colors`} />
                        <span>{stage.label}</span>
                        {stage.badge > 0 && (
                            <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                                isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'
                            }`}>
                                {stage.badge}
                            </span>
                        )}
                    </Link>
                );
            })}
        </div>
    );
}
