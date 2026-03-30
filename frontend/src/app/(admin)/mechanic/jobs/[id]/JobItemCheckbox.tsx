'use client';

import { useState, useEffect } from 'react';
import { useToggleItem } from '@/modules/mechanic/hooks/useMechanic';
import { useToast } from '@/contexts/ToastContext';

interface JobItemCheckboxProps {
    itemId: number;
    orderId: number;
    isCompleted: boolean;
    disabled?: boolean;
}

export default function JobItemCheckbox({ itemId, orderId, isCompleted, disabled }: JobItemCheckboxProps) {
    const [checked, setChecked] = useState(isCompleted);
    const { showToast } = useToast();
    const { mutate: toggleMatch, isPending: loading } = useToggleItem(orderId);


    // Sync with props if they change
    useEffect(() => {
        setChecked(isCompleted);
    }, [isCompleted]);

    const handleToggle = () => {
        if (disabled || loading) return;
        
        const nextChecked = !checked;
        setChecked(nextChecked);

        toggleMatch(itemId, {
            onSuccess: (result: any) => {
                showToast('success', 'Đã cập nhật trạng thái hạng mục!');
                if (result.completed !== undefined) setChecked(result.completed);
            },
            onError: (error: any) => {
                showToast('error', error.message || 'Thao tác thất bại. Đã hoàn tác.');
                setChecked(!nextChecked);
            }
        });
    };

    return (
        <input
            type="checkbox"
            checked={checked}
            onChange={handleToggle}
            disabled={loading || disabled}
            className="w-6 h-6 rounded border-2 border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        />
    );
}
