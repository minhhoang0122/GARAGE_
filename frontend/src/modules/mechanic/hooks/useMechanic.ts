import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { mechanicService } from '../services/mechanic';
import { queryKeys } from '@/lib/query-keys';
import { toast } from '@/modules/shared/components/ui/use-toast';

export const useInspectJobs = (enabled = true) => {
    return useQuery({
        queryKey: queryKeys.mechanic.inspect(),
        queryFn: mechanicService.getInspectJobs,
        enabled
    });
};

export const useRepairJobs = (enabled = true) => {
    return useQuery({
        queryKey: queryKeys.mechanic.jobs(),
        queryFn: mechanicService.getRepairJobs,
        enabled
    });
};

export const useMechanicStats = (enabled = true) => {
    return useQuery({
        queryKey: queryKeys.mechanic.stats(),
        queryFn: mechanicService.getStats,
        enabled
    });
};

export const useJobDetails = (orderId: number) => {
    return useQuery({
        queryKey: queryKeys.mechanic.job(orderId),
        queryFn: () => mechanicService.getJobDetails(orderId),
        enabled: !!orderId
    });
};

// --- Mutations ---

export const useClaimJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ orderId }: { orderId: number; userName: string }) => mechanicService.claimJob(orderId),
        onMutate: async ({ orderId, userName }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.mechanic.job(orderId) });
            const previousJob = queryClient.getQueryData(queryKeys.mechanic.job(orderId));
            queryClient.setQueryData(queryKeys.mechanic.job(orderId), (old: any) => {
                if (!old) return old;
                return { ...old, status: 'IN_PROGRESS', claimedByName: userName };
            });
            return { previousJob };
        },
        onError: (err, { orderId }, context) => {
            queryClient.setQueryData(queryKeys.mechanic.job(orderId), context?.previousJob);
        },
        onSettled: (data, err, { orderId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.job(orderId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.assigned() });
            queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.jobs() });
            queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.stats() });
        }
    });
};


export const useUnclaimJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (orderId: number) => mechanicService.unclaimJob(orderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.assigned() });
            queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.jobs() });
            queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.stats() });
        }
    });
};

export const useToggleItem = (orderId?: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (itemId: number) => mechanicService.toggleItem(itemId),
        onMutate: async (itemId) => {
            if (!orderId) return;
            await queryClient.cancelQueries({ queryKey: queryKeys.mechanic.job(orderId) });
            const previousJob = queryClient.getQueryData(queryKeys.mechanic.job(orderId));
            queryClient.setQueryData(queryKeys.mechanic.job(orderId), (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    items: old.items.map((it: any) => 
                        it.id === itemId ? { ...it, isCompleted: !it.isCompleted } : it
                    )
                };
            });
            return { previousJob };
        },
        onError: (err, itemId, context) => {
            if (orderId) queryClient.setQueryData(queryKeys.mechanic.job(orderId), context?.previousJob);
        },
        onSettled: () => {
            if (orderId) queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.job(orderId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.assigned() });
            queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.jobs() });
        }
    });
};


export const useCompleteJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (orderId: number) => mechanicService.completeJob(orderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.jobs() });
            queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.stats() });
        }
    });
};

export const useQCPass = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (orderId: number) => mechanicService.qcPass(orderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.jobs() });
        }
    });
};

export const useQCFail = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (orderId: number) => mechanicService.qcFail(orderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.jobs() });
        }
    });
};

// Inspection Proposals
export const useSubmitProposal = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ receptionId, items }: { receptionId: number; items: any[] }) =>
            mechanicService.submitProposal(receptionId, items),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.inspect() });
        }
    });
};

export const useRemoveProposalItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (itemId: number) => mechanicService.removeItemFromProposal(itemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.inspect() });
        }
    });
};

// Assignment Hooks
export const useAvailableMechanics = () => {
    return useQuery({
        queryKey: queryKeys.mechanic.available(),
        queryFn: mechanicService.getAvailableMechanics
    });
};

export const useAssignMechanic = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ itemId, mechanicId }: { itemId: number; mechanicId: number; orderId?: number; mechanicName?: string }) =>
            mechanicService.assignMechanic(itemId, mechanicId),
        onMutate: async ({ itemId, mechanicId, orderId, mechanicName }) => {
            if (!orderId) return;
            await queryClient.cancelQueries({ queryKey: queryKeys.mechanic.job(orderId) });
            const previousJob = queryClient.getQueryData(queryKeys.mechanic.job(orderId));
            queryClient.setQueryData(queryKeys.mechanic.job(orderId), (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    items: old.items.map((item: any) => {
                        if (item.id !== itemId) return item;
                        return {
                            ...item,
                            assignments: [...(item.assignments || []), { 
                                id: -(Date.now()), // Temporary ID
                                mechanicId, 
                                mechanicName: mechanicName || 'Đang gán...' 
                            }]
                        };
                    })
                };
            });
            return { previousJob };
        },
        onError: (err, variables, context) => {
            if (variables.orderId) queryClient.setQueryData(queryKeys.mechanic.job(variables.orderId), context?.previousJob);
        },
        onSettled: (data, err, variables) => {
            if (variables.orderId) queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.job(variables.orderId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.assigned() });
            queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.jobs() });
            queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.available() });
        }
    });
};


export const useUnassignItem = (orderId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (assignmentId: number) => mechanicService.unassignItem(assignmentId),
        onMutate: async (assignmentId) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.mechanic.job(orderId) });
            const previousJob = queryClient.getQueryData(queryKeys.mechanic.job(orderId));
            queryClient.setQueryData(queryKeys.mechanic.job(orderId), (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    items: old.items.map((item: any) => ({
                        ...item,
                        assignments: item.assignments.filter((a: any) => a.id !== assignmentId)
                    }))
                };
            });
            return { previousJob };
        },
        onError: (err, assignmentId, context) => {
            queryClient.setQueryData(queryKeys.mechanic.job(orderId), context?.previousJob);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.job(orderId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.assigned() });
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(orderId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.available() });
        }
    });
};


export const useSubmitAssignments = (orderId: number) => {
    const queryClient = useQueryClient();
    const router = useRouter(); // Wait, I need to import useRouter
    return useMutation({
        mutationFn: () => mechanicService.submitAssignments(orderId),
        onSuccess: () => {
            // Invalidate current job details
            queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.job(orderId) });
            // Invalidate general order detail
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(orderId) });
            // Invalidate the overview list
            queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.assigned() });
            
            toast({
                title: "Thành công",
                description: "Đã xác nhận phân công và bắt đầu quy trình sửa chữa.",
                variant: "success"
            } as any);
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi",
                description: error.response?.data?.message || "Không thể xác nhận phân công.",
                variant: "destructive"
            } as any);
        }
    });
};

export const useReportIssue = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ orderId, items }: { orderId: number; items: any[] }) =>
            mechanicService.reportTechnicalIssue(orderId, items),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.jobs() });
        }
    });
};

export const useApproveJoinTask = (orderId?: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (assignmentId: number) => mechanicService.approveJoinTask(assignmentId),
        onSuccess: () => {
            if (orderId) {
                queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(orderId) });
            }
            queryClient.invalidateQueries({ queryKey: queryKeys.mechanic.jobs() });
        }
    });
};
