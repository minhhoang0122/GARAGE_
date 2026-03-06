'use client';

import { useState } from 'react';
import { requestJoinTask } from '@/modules/service/mechanic';
import { Button } from '@/modules/shared/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/modules/shared/components/ui/use-toast';

interface JoinItemButtonProps {
    itemId: number;
    disabled?: boolean;
    isLead?: boolean;
}

export default function JoinItemButton({ itemId, disabled, isLead }: JoinItemButtonProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleJoin = async () => {
        setLoading(true);
        try {
            const res = await requestJoinTask(itemId);
            if (res.success) {
                toast({
                    title: isLead ? "Thành công" : "Đã gửi yêu cầu",
                    description: isLead ? "Đã tự nhận hạng mục này." : "Vui lòng đợi Thợ chính phê duyệt.",
                    className: "bg-emerald-50 border-emerald-200 text-emerald-800"
                });
            } else {
                toast({
                    title: "Lỗi",
                    description: res.error,
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể gửi yêu cầu.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            size="sm"
            variant="outline"
            className={`h-8 gap-1 border-slate-200 ${isLead ? 'text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200' : 'text-slate-600 hover:text-slate-700 hover:bg-slate-50'}`}
            onClick={handleJoin}
            disabled={disabled || loading}
        >
            <UserPlus className="w-3.5 h-3.5" />
            {loading ? 'Đang xử lý...' : (isLead ? 'Tự nhận làm' : 'Xin làm cùng')}
        </Button>
    );
}
