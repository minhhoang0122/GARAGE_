'use client';

import { useState } from 'react';
import { toggleItemCompletion } from '@/modules/service/mechanic';
import { useRouter } from 'next/navigation';

interface JobItemCheckboxProps {
    itemId: number;
    isCompleted: boolean;
    disabled?: boolean;
}

export default function JobItemCheckbox({ itemId, isCompleted, disabled }: JobItemCheckboxProps) {
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(isCompleted);
    const router = useRouter();

    const handleToggle = async () => {
        if (disabled) return;
        setLoading(true);
        try {
            const result = await toggleItemCompletion(itemId);
            if (result.success) {
                setChecked(result.completed ?? !checked);
                router.refresh();
            } else {
                alert('Lỗi: ' + result.error);
            }
        } catch (error) {
            alert('Lỗi hệ thống');
        } finally {
            setLoading(false);
        }
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
