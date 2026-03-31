'use client';

import { useState } from 'react';
import { Settings, Check, X, Users, Loader2 } from 'lucide-react';
import { Button } from '@/modules/shared/components/ui/button';
import { useUpdateItemLimit } from '@/modules/mechanic/hooks/useMechanic';
import { useToast } from '@/modules/shared/components/ui/use-toast';

interface MechanicLimitSelectorProps {
    orderId: number;
    itemId: number;
    currentCount: number;
    maxLimit: number;
    isLead: boolean;
}

export default function MechanicLimitSelector({ orderId, itemId, currentCount, maxLimit = 4, isLead }: MechanicLimitSelectorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [limit, setLimit] = useState(maxLimit);
    const [displayLimit, setDisplayLimit] = useState(maxLimit);
    const { toast } = useToast();
    const updateLimitMutation = useUpdateItemLimit(orderId);

    const handleSave = async () => {
        if (updateLimitMutation.isPending) return;
        try {
            await updateLimitMutation.mutateAsync({ itemId, limit });
            toast({
                title: "Thành công",
                description: `Đã cập nhật giới hạn thợ thành ${limit}`,
                className: "bg-emerald-50 border-emerald-200 text-emerald-800"
            });
            setDisplayLimit(limit);
            setIsEditing(false);
        } catch (error: any) {
            console.error("Lỗi cập nhật số lượng thợ:", error);
            toast({
                title: "Lỗi",
                description: error?.message || 'Không thể cập nhật giới hạn thợ',
                variant: 'destructive'
            });
        }
    };

    if (!isLead) {
        return (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${currentCount >= displayLimit ? "bg-red-50 text-red-600 border-red-200" : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"}`}>
                <Users className="w-3.5 h-3.5" />
                <span>{currentCount}/{displayLimit}</span>
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border rounded-md p-1 animate-in fade-in zoom-in duration-200 shadow-sm">
                <span className="text-xs text-slate-500 pl-1">Max:</span>
                <input
                    type="number"
                    min="1"
                    max="10"
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value) || 1)}
                    className="w-10 h-6 text-sm text-center border rounded bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                />
                <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-6 w-6 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer" 
                    onClick={handleSave} 
                    disabled={updateLimitMutation.isPending}
                >
                    {updateLimitMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                </Button>
                <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-6 w-6 text-slate-400 hover:text-slate-500 hover:bg-slate-50" 
                    onClick={() => setIsEditing(false)}
                    disabled={updateLimitMutation.isPending}
                >
                    <X className="w-3 h-3" />
                </Button>
            </div>
        );
    }

    return (
        <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer transition-all hover:shadow-sm group ${currentCount >= displayLimit ? "bg-red-50 text-red-600 border-red-200" : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-white hover:border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700"}`}
            onClick={() => setIsEditing(true)}
            title="Bấm để chỉnh sửa giới hạn thợ"
        >
            <Users className="w-3.5 h-3.5" />
            <span>{currentCount}/{displayLimit}</span>
            <Settings className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
        </div>
    );
}
