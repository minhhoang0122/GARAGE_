'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { User, Wrench, X, ShieldAlert, CheckCircle2, GripVertical, Plus, ChevronDown, Users, UserPlus, Loader2, Send, ShieldCheck, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { adminAssignItem, adminUnassignItem, submitAssignments, getJobDetails, getAvailableMechanics } from '@/modules/service/mechanic';

// Portal wrapper to fix drag offset in scrollable containers
function PortalAwareDraggable({ provided, snapshot, children }: { provided: DraggableProvided, snapshot: DraggableStateSnapshot, children: React.ReactNode }) {
    const child = (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
            {children}
        </div>
    );
    if (snapshot.isDragging) {
        return createPortal(child, document.body);
    }
    return child;
}

// Dropdown component for assigning mechanic via click (alternative to drag)
function MechanicDropdown({ itemId, mechanics, existingIds, onAssign, disabled }: {
    itemId: number,
    mechanics: any[],
    existingIds: number[],
    onAssign: (itemId: number, mechanicId: number) => void,
    disabled?: boolean
}) {
    const [isOpen, setIsOpen] = useState(false);
    const availableMechanics = mechanics.filter(m => !existingIds.includes(m.id));

    if (availableMechanics.length === 0 || disabled) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full px-2.5 py-1 transition-colors"
            >
                <Plus className="h-3 w-3" /> Thêm thợ
                <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
                    <div className="absolute left-0 top-full mt-1 z-40 bg-white border border-slate-200 rounded-lg shadow-xl py-1 min-w-[200px]">
                        {availableMechanics.map(m => (
                            <button
                                key={m.id}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors flex items-center justify-between gap-2"
                                onClick={() => {
                                    onAssign(itemId, m.id);
                                    setIsOpen(false);
                                }}
                            >
                                <span className="font-medium text-slate-700">{m.hoTen}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    m.soViecDangLam === 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {m.soViecDangLam} việc
                                </span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default function AssignBoard({ initialJob, mechanics: initialMechanics }: { initialJob: any, mechanics: any[] }) {
    const router = useRouter();
    const { data: session } = useSession();
    // @ts-ignore
    const token = session?.user?.accessToken || '';
    const queryClient = useQueryClient();
    const [error, setError] = useState<string | null>(null);

    // --- QUERIES ---
    const { data: job = initialJob, isLoading: isLoadingJob } = useQuery({
        queryKey: ['job-details', initialJob.id],
        queryFn: () => getJobDetails(initialJob.id),
        initialData: initialJob,
        enabled: !!initialJob.id,
    });

    const { data: mechanics = initialMechanics, isLoading: isLoadingMechanics } = useQuery({
        queryKey: ['available-mechanics'],
        queryFn: () => getAvailableMechanics(),
        initialData: initialMechanics,
    });

    // --- MUTATIONS ---
    const assignMutation = useMutation({
        mutationFn: ({ itemId, mechanicId }: { itemId: number, mechanicId: number }) => adminAssignItem(itemId, mechanicId),
        onMutate: async ({ itemId, mechanicId }) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['job-details', job.id] });
            await queryClient.cancelQueries({ queryKey: ['available-mechanics'] });

            // Snapshot the previous value
            const previousJob = queryClient.getQueryData(['job-details', job.id]);
            const previousMechanics = queryClient.getQueryData(['available-mechanics']);

            // Optimistically update to the new value
            const mechanic = (mechanics as any[]).find(m => m.id === mechanicId);
            if (previousJob && mechanic) {
                queryClient.setQueryData(['job-details', job.id], (old: any) => ({
                    ...old,
                    items: old.items.map((item: any) => 
                        item.id === itemId 
                        ? { 
                            ...item, 
                            assignments: [
                                ...item.assignments, 
                                { 
                                    id: -(Math.random() * 1000000), // Temp ID
                                    mechanicId, 
                                    mechanicName: mechanic.hoTen 
                                }
                            ] 
                          } 
                        : item
                    )
                }));
            }

            if (previousMechanics) {
                queryClient.setQueryData(['available-mechanics'], (old: any[]) => 
                    old.map(m => m.id === mechanicId ? { ...m, soViecDangLam: m.soViecDangLam + 1 } : m)
                );
            }

            return { previousJob, previousMechanics };
        },
        onError: (err, variables, context) => {
            if (context?.previousJob) {
                queryClient.setQueryData(['job-details', job.id], context.previousJob);
            }
            if (context?.previousMechanics) {
                queryClient.setQueryData(['available-mechanics'], context.previousMechanics);
            }
            setError('Lỗi kết nối khi phân công. Đã hoàn tác.');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['job-details', job.id] });
            queryClient.invalidateQueries({ queryKey: ['available-mechanics'] });
        },
    });

    const unassignMutation = useMutation({
        mutationFn: ({ assignmentId }: { assignmentId: number }) => adminUnassignItem(assignmentId),
        onMutate: async ({ assignmentId }) => {
            await queryClient.cancelQueries({ queryKey: ['job-details', job.id] });
            await queryClient.cancelQueries({ queryKey: ['available-mechanics'] });

            const previousJob = queryClient.getQueryData(['job-details', job.id]);
            const previousMechanics = queryClient.getQueryData(['available-mechanics']);

            let mechanicIdToRemove: number | null = null;

            if (previousJob) {
                queryClient.setQueryData(['job-details', job.id], (old: any) => {
                    const newItems = old.items.map((item: any) => {
                        const targetAssignment = item.assignments.find((a: any) => a.id === assignmentId);
                        if (targetAssignment) {
                            mechanicIdToRemove = targetAssignment.mechanicId;
                        }
                        return {
                            ...item,
                            assignments: item.assignments.filter((a: any) => a.id !== assignmentId)
                        };
                    });
                    return { ...old, items: newItems };
                });
            }

            if (previousMechanics && mechanicIdToRemove !== null) {
                queryClient.setQueryData(['available-mechanics'], (old: any[]) => 
                    old.map(m => m.id === mechanicIdToRemove ? { ...m, soViecDangLam: Math.max(0, m.soViecDangLam - 1) } : m)
                );
            }

            return { previousJob, previousMechanics };
        },
        onError: (err, variables, context) => {
            if (context?.previousJob) {
                queryClient.setQueryData(['job-details', job.id], context.previousJob);
            }
            if (context?.previousMechanics) {
                queryClient.setQueryData(['available-mechanics'], context.previousMechanics);
            }
            setError('Lỗi kết nối khi gỡ thợ. Đã hoàn tác.');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['job-details', job.id] });
            queryClient.invalidateQueries({ queryKey: ['available-mechanics'] });
        },
    });

    const submitMutation = useMutation({
        mutationFn: () => submitAssignments(job.id),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ['job-details', job.id] });
                router.push('/mechanic/assign');
                router.refresh();
            } else {
                setError(res.error || 'Lỗi xác nhận phân công');
            }
        },
        onError: () => setError('Lỗi kết nối khi xác nhận'),
    });

    // Shared assign logic (used by both drag-drop AND dropdown)
    const handleAssign = (itemId: number, mechanicId: number) => {
        const mechanic = mechanics.find((m: any) => m.id === mechanicId);
        if (!mechanic) return;

        // Check duplicate check locally for instant feedback
        const item = job.items.find((i: any) => i.id === itemId);
        if (item?.assignments.some((a: any) => a.mechanicId === mechanicId)) {
            setError(`${mechanic.hoTen} đã nhận hạng mục này rồi.`);
            return;
        }

        assignMutation.mutate({ itemId, mechanicId });
    };

    // Shared unassign logic
    const handleUnassign = (assignmentId: number) => {
        unassignMutation.mutate({ assignmentId });
    };

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;
        setError(null);
        if (!destination) return;

        const srcId = source.droppableId;
        const dstId = destination.droppableId;

        // CASE 1: Nguồn Lực → Hạng Mục (Gán mới)
        if (srcId === 'mechanics-list' && dstId.startsWith('item-')) {
            const itemId = parseInt(dstId.replace('item-', ''), 10);
            const mechanicId = parseInt(draggableId.replace('source-mechanic-', ''), 10);
            handleAssign(itemId, mechanicId);
            return;
        }

        // CASE 2: Chip Thợ → Hạng Mục khác (Di chuyển)
        if (srcId.startsWith('item-') && dstId.startsWith('item-') && srcId !== dstId) {
            const parts = draggableId.match(/assigned-([-\d]+)-mechanic-(\d+)-from-(\d+)/);
            if (!parts) return;
            const assignmentId = parseInt(parts[1], 10);
            const mechanicId = parseInt(parts[2], 10);
            const dstItemId = parseInt(dstId.replace('item-', ''), 10);

            // Xử lý di chuyển bằng cách gỡ cũ -> gán mới (TanStack Query xử lý tuần tự/song song qua mutation)
            unassignMutation.mutate({ assignmentId }, {
                onSuccess: (r) => {
                    if (r.success) assignMutation.mutate({ itemId: dstItemId, mechanicId });
                }
            });
            return;
        }

        // CASE 3: Chip Thợ → Nguồn Lực (Gỡ phân công)
        if (srcId.startsWith('item-') && dstId === 'mechanics-list') {
            const parts = draggableId.match(/assigned-([-\d]+)-mechanic-(\d+)-from-(\d+)/);
            if (!parts) return;
            const assignmentId = parseInt(parts[1], 10);
            handleUnassign(assignmentId);
            return;
        }
    };

    const isAlreadySubmitted = job.status === 'DANG_SUA';
    const isWorking = assignMutation.isPending || unassignMutation.isPending || submitMutation.isPending;

    return (
        <div className="max-w-7xl mx-auto">
            {error && (
                <div className="mb-4 bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                    <button onClick={() => setError(null)} className="hover:bg-red-100 p-1 rounded"><X className="h-4 w-4" /></button>
                </div>
            )}
            {isWorking && (
                <div className="mb-4 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg p-3 flex items-center justify-center gap-2 text-sm font-medium animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xử lý...
                </div>
            )}

            <DragDropContext onDragEnd={isAlreadySubmitted ? () => {} : onDragEnd}>
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
                    {/* === CỘT TRÁI: Danh Sách Hạng Mục === */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                        <div className="bg-slate-50/50 border-b border-slate-100 p-6 flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                                    <Wrench className="h-4 w-4 text-blue-600" />
                                    Hạng mục sửa chữa
                                </h3>
                                <p className="text-[12px] text-slate-500 font-medium ml-6">Tổng số {job.items.length} hạng mục cần điều phối</p>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 tracking-widest hidden sm:inline bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">Kéo thả để gán thợ</span>
                        </div>
                        <div className="bg-slate-100/30 p-5 space-y-4">
                            {job.items.map((item: any) => (
                                <Droppable key={`item-${item.id}`} droppableId={`item-${item.id}`}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`bg-white rounded-xl p-6 transition-all duration-300 ${
                                                snapshot.isDraggingOver
                                                ? 'bg-blue-50/80 border-2 border-dashed border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-4 ring-blue-50/50'
                                                : 'border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-slate-800 text-sm leading-tight">{item.productName}</h4>
                                                        {item.isTechnicalAddition && (
                                                            <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 text-[9px] font-black uppercase tracking-widest rounded border border-purple-100">Phát sinh</span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-widest">Mã: {item.productCode} • SL: {item.quantity}</p>
                                                </div>
                                                {item.isCompleted ? (
                                                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
                                                        <CheckCircle2 className="h-3 w-3" /> Hoàn thành
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-700 bg-blue-100/80 px-3 py-1 rounded-full border border-blue-200 shadow-sm">
                                                        Chờ làm
                                                    </span>
                                                )}
                                            </div>

                                            {/* Vùng thả + Chip Thợ đã gán */}
                                            <div className="min-h-[52px] bg-slate-50/30 rounded-xl border border-dashed border-slate-200 p-2.5 flex gap-2 flex-wrap items-center">
                                                {item.assignments.length === 0 && !snapshot.isDraggingOver && (
                                                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium px-2 italic">
                                                        <UserPlus className="w-3.5 h-3.5 opacity-50" />
                                                        Chưa có thợ được phân công
                                                    </div>
                                                )}
                                                {item.assignments.map((assignment: any, aIdx: number) => (
                                                    <Draggable
                                                        key={`assigned-${assignment.id}`}
                                                        draggableId={`assigned-${assignment.id}-mechanic-${assignment.mechanicId}-from-${item.id}`}
                                                        index={aIdx}
                                                        isDragDisabled={assignment.id < 0} // Disable drag for temp IDs
                                                    >
                                                        {(dragProv, dragSnap) => (
                                                            <PortalAwareDraggable provided={dragProv} snapshot={dragSnap}>
                                                                <div className={`inline-flex items-center bg-white border border-slate-100 rounded-lg shadow-sm pl-1.5 pr-1.5 py-1.5 transition-all group ${
                                                                    assignment.id < 0
                                                                    ? 'opacity-60 border-slate-200 cursor-wait'
                                                                    : dragSnap.isDragging
                                                                    ? 'border-blue-400 ring-4 ring-blue-50 shadow-xl scale-105 cursor-grabbing z-[999]'
                                                                    : 'hover:border-blue-200 hover:shadow-md cursor-grab active:scale-95'
                                                                }`}>
                                                                    <GripVertical className="h-3.5 w-3.5 text-slate-300 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                    <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mr-1.5 shadow-inner">
                                                                        <User className="h-3 w-3 text-slate-500" />
                                                                    </div>
                                                                    <span className="text-[11px] font-bold text-slate-700 mr-2">{assignment.mechanicName}</span>
                                                                    {assignment.id > 0 && (
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleUnassign(assignment.id); }}
                                                                            className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                                                            title="Gỡ thợ"
                                                                            disabled={isWorking}
                                                                        >
                                                                            <X className="h-3 w-3" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </PortalAwareDraggable>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>

                                            {/* Nút thêm thợ bằng dropdown (thay thế kéo thả) */}
                                            <div className="mt-2">
                                                <MechanicDropdown
                                                    itemId={item.id}
                                                    mechanics={mechanics}
                                                    existingIds={item.assignments.map((a: any) => a.mechanicId)}
                                                    onAssign={handleAssign}
                                                    disabled={isWorking || isAlreadySubmitted}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </Droppable>
                            ))}
                        </div>
                    </div>

                    {/* === CỘT PHẢI: Nguồn Lực === */}
                    <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] xl:sticky xl:top-4 xl:self-start overflow-hidden border border-slate-100/50">
                        <div className="p-6 bg-slate-900">
                            <h3 className="font-black text-white flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
                                <Users className="h-4 w-4 text-blue-400" />
                                Nguồn Lực
                                <span className="ml-auto bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-md font-black">{mechanics.length}</span>
                            </h3>
                            <p className="text-[10px] text-blue-200/60 mt-2 font-bold uppercase tracking-wider">Kéo thợ để gán việc</p>
                        </div>

                        <Droppable droppableId="mechanics-list">
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`p-3 space-y-2 transition-colors rounded-b-xl min-h-[60px] ${
                                        snapshot.isDraggingOver ? 'bg-red-50 ring-2 ring-red-200' : ''
                                    }`}
                                >
                                    {snapshot.isDraggingOver && (
                                        <div className="text-center text-xs text-red-500 font-medium py-1 animate-pulse">
                                            Thả để gỡ phân công
                                        </div>
                                    )}
                                    {mechanics.length === 0 ? (
                                        <div className="py-8 text-center text-slate-400 italic text-xs">
                                            Không tìm thấy nhân viên
                                        </div>
                                    ) : (
                                        mechanics.map((mechanic, index) => (
                                            <Draggable key={`source-mechanic-${mechanic.id}`} draggableId={`source-mechanic-${mechanic.id}`} index={index}>
                                                {(provided, snapshot) => (
                                                    <PortalAwareDraggable provided={provided} snapshot={snapshot}>
                                                        <div
                                                            className={`bg-white border p-5 rounded-2xl flex flex-col justify-center transition-all duration-300 cursor-grab active:cursor-grabbing group ${
                                                                snapshot.isDragging
                                                                ? 'border-blue-400 shadow-2xl ring-4 ring-blue-50/50 scale-105 z-[999]'
                                                                : 'border-slate-100 shadow-sm hover:border-blue-500/30 hover:shadow-xl hover:-translate-y-1'
                                                            } ${mechanic.soViecDangLam === 0 ? 'ring-1 ring-emerald-500/10 bg-emerald-50/5' : ''}`}
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex gap-3">
                                                                    <div className="relative">
                                                                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                                                            <User size={18} />
                                                                        </div>
                                                                        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
                                                                            mechanic.soViecDangLam === 0 ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                                                                        }`} />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-black text-slate-900 text-sm tracking-tight group-hover:text-blue-600 transition-colors">{mechanic.hoTen}</h4>
                                                                        <div className="flex items-center gap-2 mt-0.5">
                                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{mechanic.chuyenMonLabel}</span>
                                                                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                                            <span className={`text-[10px] font-black uppercase ${
                                                                                mechanic.soViecDangLam === 0 ? 'text-emerald-600' : 'text-amber-600'
                                                                            }`}>
                                                                                {mechanic.soViecDangLam === 0 ? 'Sẵn sàng' : `${mechanic.soViecDangLam} VIỆC`}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </PortalAwareDraggable>
                                                )}
                                            </Draggable>
                                        ))
                                    )}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                </div>
            </DragDropContext>

            {/* Sticky Bottom Bar - Xác nhận phân công */}
            {(() => {
                const assignedItemCount = job.items.filter((item: any) => item.assignments.length > 0).length;
                const totalItems = job.items.length;
                const uniqueMechanicIds = new Set<number>();
                job.items.forEach((item: any) => item.assignments.forEach((a: any) => uniqueMechanicIds.add(a.mechanicId)));
                const uniqueCount = uniqueMechanicIds.size;
                const allAssigned = assignedItemCount === totalItems;
                const hasAny = assignedItemCount > 0;
 
                if (!hasAny) return null;
 
                if (isAlreadySubmitted) {
                    return (
                        <div className="sticky bottom-6 left-0 right-0 mt-8 bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 shadow-xl px-8 py-5 z-20 rounded-2xl ring-1 ring-white/50 animate-in fade-in slide-in-from-bottom-5">
                            <div className="max-w-7xl mx-auto flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                        <ShieldCheck className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-emerald-900 tracking-tight">Quy trình đang vận hành</h4>
                                        <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Đã xác nhận phân công và bàn giao kỹ thuật</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white/60 px-4 py-2 rounded-xl border border-emerald-100 italic transition-all hover:bg-white/80">
                                    <Clock className="w-4 h-4 text-emerald-600 animate-spin-slow" />
                                    <span className="text-xs font-bold text-emerald-700 font-mono tracking-tighter">JOB_IN_PROGRESS</span>
                                </div>
                            </div>
                        </div>
                    );
                }
 
                return (
                    <div className="sticky bottom-6 left-0 right-0 mt-8 bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] px-8 py-5 z-20 rounded-2xl ring-1 ring-white/50 animate-in fade-in slide-in-from-bottom-5 duration-300">
                        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
                            {/* Tóm tắt */}
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${allAssigned ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className={`text-sm font-black ${allAssigned ? 'text-emerald-700' : 'text-slate-800'}`}>
                                            {assignedItemCount}/{totalItems} hạng mục
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            {uniqueCount} Kỹ thuật viên được phân công
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Nút chính */}
                            <button
                                onClick={() => {
                                    if (!hasAny) {
                                        setError('Chưa phân công thợ cho hạng mục nào!');
                                        return;
                                    }
                                    submitMutation.mutate();
                                }}
                                disabled={!hasAny || isWorking}
                                className={`flex items-center gap-3 px-8 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                                    !hasAny || submitMutation.isPending
                                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50'
                                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200 hover:shadow-slate-300'
                                }`}
                            >
                                {submitMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        {allAssigned ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Send className="w-4 h-4 border-slate-400" />}
                                        Xác nhận phân công
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
