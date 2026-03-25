'use client';

import { Assignment, approveJoinTask } from '@/modules/service/mechanic';
import { Button } from '@/modules/shared/components/ui/button';
import { Check, Clock, User, Loader2 } from 'lucide-react';
import { useToast } from '@/modules/shared/components/ui/use-toast';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface AssignmentListProps {
    itemId: number;
    assignments: Assignment[];
    maxLimit: number;
    isLead: boolean;
    currentUserId: number | null;
    isItemCompleted?: boolean;
}

export default function AssignmentList({ itemId, assignments, maxLimit, isLead, currentUserId, isItemCompleted }: AssignmentListProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const approveMutation = useMutation({
        mutationFn: (id: number) => approveJoinTask(id),
        onMutate: async (id) => {
            // Cancel any outgoing refetches for this job
            await queryClient.cancelQueries({ queryKey: ['job-details', itemId] });

            // Snapshot the previous value
            const previousJob = queryClient.getQueryData(['job-details', itemId]);

            // Optimistically update the assignment status
            if (previousJob) {
                queryClient.setQueryData(['job-details', itemId], (old: any) => ({
                    ...old,
                    items: old.items.map((item: any) => 
                        item.id === itemId 
                        ? {
                            ...item,
                            assignments: item.assignments.map((a: any) => 
                                a.id === id ? { ...a, status: 'APPROVED' } : a
                            )
                          }
                        : item
                    )
                }));
            }

            return { previousJob };
        },
        onError: (err, id, context) => {
            if (context?.previousJob) {
                queryClient.setQueryData(['job-details', itemId], context.previousJob);
            }
            toast({
                title: "Lỗi",
                description: "Không thể phê duyệt. Đã hoàn tác.",
                variant: "destructive"
            });
        },
        onSuccess: () => {
            toast({
                title: "Đã phê duyệt",
                className: "bg-emerald-50 border-emerald-200 text-emerald-800"
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['job-details', itemId] });
        }
    });

    const isWorking = approveMutation.isPending;

    // Filter out pending assignments if item is completed
    const visibleAssignments = assignments.filter(a => !(isItemCompleted && a.status === 'PENDING'));
    const activeCount = assignments.filter(a => a.status === 'APPROVED' || a.status === 'COMPLETED').length;

    return (
        <div className="flex flex-wrap items-center gap-2 mt-2">
            {visibleAssignments.map((assign) => (
                <div key={assign.id}
                    className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border text-xs font-medium transition-colors
                        ${assign.status === 'APPROVED'
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-semibold'
                            : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                        }`}
                >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-slate-900
                        ${assign.status === 'APPROVED' ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100' : 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-100'}`}>
                        {assign.mechanicName.charAt(0)}
                    </div>

                    <div className="flex flex-col leading-tight">
                        <span className="truncate max-w-[100px]">{assign.mechanicName} {assign.mechanicId === currentUserId ? '(Bạn)' : ''}</span>
                        <span className="text-[10px] opacity-80 flex items-center gap-1">
                            {assign.status === 'PENDING' ? (
                                <>
                                    <Clock className="w-3 h-3" /> Đợi duyệt
                                </>
                            ) : (
                                <>
                                    {assign.isMain ? 'Thợ chính' : 'Thợ phụ'} • {assign.percentage}%
                                </>
                            )}
                        </span>
                    </div>

                    {/* Approve Button for Lead */}
                    {isLead && assign.status === 'PENDING' && (
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 rounded-full hover:bg-emerald-200 hover:text-emerald-800 -mr-1"
                            onClick={() => approveMutation.mutate(assign.id)}
                            disabled={isWorking}
                            title="Phê duyệt"
                        >
                            <Check className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            ))}
        </div>
    );
}
