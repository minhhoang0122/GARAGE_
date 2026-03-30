'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hand, ShieldCheck, Wrench, Clock } from 'lucide-react';
import { useClaimJob } from '@/modules/mechanic/hooks/useMechanic';
import { useToast } from '@/contexts/ToastContext';
import { useSession } from 'next-auth/react';
 
type ClaimJobButtonProps = {
    orderId: number;
    claimedByName: string | null;
    isClaimedByMe: boolean;
};
 
export default function ClaimJobButton({ orderId, claimedByName, isClaimedByMe }: ClaimJobButtonProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const { showToast } = useToast();
    const { mutate: claimMatch, isPending: loading } = useClaimJob();

 
    // Already claimed by current user - Premium Glassmorphism UI
    if (isClaimedByMe) {
        return (
            <div className="w-full bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between group transition-all hover:bg-emerald-500/15">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-pulse-slow">
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-emerald-900 tracking-tight">Trạng thái công việc</h4>
                        <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Bạn đang trực tiếp phụ trách</p>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] font-black text-emerald-700 uppercase">Đang ưu tiên</span>
                </div>
            </div>
        );
    }
 
    // Claimed by someone else - Professional Slate UI
    if (claimedByName) {
        return (
            <div className="w-full bg-slate-100/50 backdrop-blur-sm border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                    <Wrench className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                    <h4 className="text-sm font-black text-slate-800 tracking-tight">Hệ thống ghi nhận</h4>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                        Nhân viên phụ trách: <span className="text-blue-600">{claimedByName}</span>
                    </p>
                </div>
            </div>
        );
    }

    // Not claimed - show button
    const handleClaim = () => {
        claimMatch({ orderId, userName: session?.user?.name || 'Kỹ thuật viên' }, {
            onSuccess: () => {
                showToast('success', 'Nhận việc thành công!');
            },
            onError: (error: any) => {
                showToast('error', error.message || 'Thao tác thất bại');
            }
        });
    };


    return (
        <button
            onClick={handleClaim}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
            <Hand className="w-4 h-4" />
            {loading ? 'Đang xử lý...' : 'Nhận việc này'}
        </button>
    );
}
