'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hand } from 'lucide-react';
import { claimJob } from '@/modules/service/mechanic';
import { useToast } from '@/contexts/ToastContext';
import { api } from '@/lib/api';

type ClaimJobButtonProps = {
    orderId: number;
    claimedByName: string | null;
    isClaimedByMe: boolean;
};

export default function ClaimJobButton({ orderId, claimedByName, isClaimedByMe }: ClaimJobButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();

    // Already claimed by current user
    if (isClaimedByMe) {
        return (
            <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                ✓ Bạn đang phụ trách
            </div>
        );
    }

    // Claimed by someone else
    if (claimedByName) {
        return (
            <div className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm">
                🔧 Đang làm bởi: <strong>{claimedByName}</strong>
            </div>
        );
    }

    // Not claimed - show button
    const handleClaim = async () => {
        setLoading(true);
        const result = await claimJob(orderId);
        if (result.success) {
            // Invalidate mechanic dashboard and stats
            api.invalidateCache('/mechanic/jobs');
            api.invalidateCache('/mechanic/stats');

            showToast('success', 'Nhận việc thành công!');
            router.refresh();
        } else {
            showToast('error', result.error || 'Thao tác thất bại');
        }
        setLoading(false);
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
