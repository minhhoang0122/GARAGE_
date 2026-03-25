'use client';

import { useState, useEffect } from 'react';
import { toggleItemCompletion } from '@/modules/service/mechanic';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface JobItemCheckboxProps {
    itemId: number;
    isCompleted: boolean;
    disabled?: boolean;
}

export default function JobItemCheckbox({ itemId, isCompleted, disabled }: JobItemCheckboxProps) {
    const [checked, setChecked] = useState(isCompleted);
    const router = useRouter();
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    // Sync with props if they change
    useEffect(() => {
        setChecked(isCompleted);
    }, [isCompleted]);

    const mutation = useMutation({
        mutationFn: () => toggleItemCompletion(itemId),
        onMutate: async () => {
            const nextChecked = !checked;
            setChecked(nextChecked); // Instant local feedback

            // Also try to update any existing query cache for job details
            // We don't know the orderId easily here, but we can look for any 'job-details' keys
            const queryCache = queryClient.getQueryCache();
            const jobDetailQueries = queryCache.findAll({ queryKey: ['job-details'] });
            
            const previousStates = jobDetailQueries.map(query => {
                const queryKey = query.queryKey;
                const previousData = queryClient.getQueryData(queryKey);
                
                queryClient.setQueryData(queryKey, (old: any) => {
                    if (!old || !old.items) return old;
                    return {
                        ...old,
                        items: old.items.map((item: any) => 
                            item.id === itemId ? { ...item, isCompleted: nextChecked } : item
                        )
                    };
                });
                
                return { queryKey, previousData };
            });

            return { previousStates, originalChecked: !nextChecked };
        },
        onError: (err, variables, context) => {
            if (context?.previousStates) {
                context.previousStates.forEach(({ queryKey, previousData }) => {
                    queryClient.setQueryData(queryKey, previousData);
                });
            }
            setChecked(context?.originalChecked ?? checked);
            showToast('error', 'Lỗi kết nối máy chủ. Đã hoàn tác.');
        },
        onSuccess: (result) => {
            if (result.success) {
                showToast('success', 'Đã cập nhật trạng thái hạng mục!');
                if (result.completed !== undefined) setChecked(result.completed);
            } else {
                showToast('error', result.error || 'Thao tác thất bại');
                // Revert is handled by error logic or onSuccess with failure
                setChecked(!checked);
            }
        },
        onSettled: () => {
            // Invalidate to ensure consistency
            queryClient.invalidateQueries({ queryKey: ['job-details'] });
            router.refresh();
        }
    });

    const handleToggle = () => {
        if (disabled || mutation.isPending) return;
        mutation.mutate();
    };

    return (
        <input
            type="checkbox"
            checked={checked}
            onChange={handleToggle}
            disabled={mutation.isPending || disabled}
            className="w-6 h-6 rounded border-2 border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        />
    );
}
