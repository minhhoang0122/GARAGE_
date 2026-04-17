'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { User, Wrench, X, ShieldAlert, CheckCircle2, GripVertical, Plus, ChevronDown, Users, UserPlus, Loader2, Send, ShieldCheck, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { queryKeys } from '@/lib/query-keys';
import { useJobDetails, useAvailableMechanics, useAssignMechanic, useSubmitAssignments, useUnassignItem } from '@/modules/mechanic/hooks/useMechanic';
import { isInProgress } from '@/lib/status';
import { useSSEContext } from '@/modules/common/contexts/RealtimeContext';
import { useRealtimeUpdate } from '@/hooks/useRealtimeUpdate';
import { toast } from '@/modules/shared/components/ui/use-toast';
import BaseAvatar from '@/modules/shared/components/common/BaseAvatar';

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
                                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors flex items-center justify-between gap-2 group/item"
                                onClick={() => {
                                    onAssign(itemId, m.id);
                                    setIsOpen(false);
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <BaseAvatar name={m.fullName} src={m.avatar} id={m.id} size="xs" showStatus={false} />
                                    <span className="font-medium text-slate-700 group-hover/item:text-blue-700 transition-colors">{m.fullName}</span>
                                </div>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    m.soViecDangLam === 0 ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                                }`}>
                                    {m.soViecDangLam} VIỆC
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
    const token = (session as any)?.accessToken || (session?.user as any)?.accessToken || '';
    const queryClient = useQueryClient();
    const { addListener, removeListener, subscribeToTopic, unsubscribeFromTopic } = useSSEContext();

    // Subscribe to order topic for very specific updates
    useEffect(() => {
        const topic = `order:${initialJob.id}`;
        subscribeToTopic(topic);
        return () => {
            unsubscribeFromTopic(topic);
        };
    }, [initialJob.id]);
 
    // Realtime update when someone else updates the assignment
    useRealtimeUpdate(queryKeys.mechanic.job(initialJob.id), { 
        refId: initialJob.id,
        filter: (data) => data.sseType === 'ORDER_UPDATED' || data.sseType === 'notification',
        onUpdate: (notif: any) => {
            if (notif.sseType === 'ORDER_UPDATED') {
                toast({
                    title: "Cập nhật trực tuyến",
                    description: notif.message || "Dữ liệu điều phối vừa được thay đổi bởi người khác.",
                });
            } else {
                toast({
                    title: "Cập nhật Phân công",
                    description: notif.content || "Dữ liệu phân công đã được cập nhật.",
                });
            }
        }
    });

    // --- QUERIES ---
    const { data: job = initialJob } = useJobDetails(initialJob.id);
    const { data: mechanics = initialMechanics } = useAvailableMechanics();

    // --- MUTATIONS ---
    const assignMutation = useAssignMechanic();
    const unassignMutation = useUnassignItem(job.id);
    const submitMutation = useSubmitAssignments(job.id);

    // Shared assign logic (used by both drag-drop AND dropdown)
    const handleAssign = (itemId: number, mechanicId: number) => {
        if (isAlreadySubmitted) {
            toast({
                title: "Thao tác bị khóa",
                description: "Đơn hàng này đã được chốt và đang trong quá trình sửa chữa.",
                variant: "destructive"
            });
            return;
        }

        const mechanic = mechanics.find((m: any) => m.id === mechanicId);
        if (!mechanic) return;

        // Check duplicate check locally for instant feedback
        const item = job?.items?.find((i: any) => i.id === itemId);
        if (item?.assignments?.some((a: any) => a.mechanicId === mechanicId)) {
            toast({
                title: "Gán trùng thợ",
                description: `${mechanic.fullName} đã nhận hạng mục này rồi.`,
                variant: "destructive"
            });
            return;
        }

        assignMutation.mutate({ 
            itemId, 
            mechanicId, 
            orderId: job.id, 
            mechanicName: mechanic.fullName 
        }, {
            onError: (err: any) => {
                toast({
                    title: "Lỗi phân công",
                    description: err.message || "Không thể thực hiện gán thợ.",
                    variant: "destructive"
                });
            }
        });
    };

    // Shared unassign logic - handles both real IDs and temp (optimistic) IDs
    const handleUnassign = (assignmentId: number) => {
        if (isAlreadySubmitted) {
            toast({
                title: "Thao tác bị khóa",
                description: "Không thể gỡ phân công sau khi đã chốt lệnh.",
                variant: "destructive"
            });
            return;
        }

        if (assignmentId < 0) {
            // Temp assignment (optimistic) - remove from cache only, no API call
            queryClient.setQueryData(queryKeys.mechanic.job(job.id), (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    items: old.items.map((item: any) => ({
                        ...item,
                        assignments: item.assignments.filter((a: any) => a.id !== assignmentId)
                    }))
                };
            });
            return;
        }
        unassignMutation.mutate(assignmentId);
    };

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;
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

            if (assignmentId < 0) {
                // Temp assignment: remove from cache then assign to new item
                handleUnassign(assignmentId);
                handleAssign(dstItemId, mechanicId);
            } else {
                // Real assignment: unassign via API then re-assign on success
                unassignMutation.mutate(assignmentId, {
                    onSuccess: () => {
                        assignMutation.mutate({ itemId: dstItemId, mechanicId, orderId: job.id });
                    }
                });
            }
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

    const isAlreadySubmitted = isInProgress(job?.status);
    const isWorking = unassignMutation.isPending || submitMutation.isPending;

    return (
        <div className="max-w-7xl mx-auto">
            {isWorking && (
                <div className="mb-4 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg p-3 flex items-center justify-center gap-2 text-sm font-medium animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xử lý...
                </div>
            )}

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
                    {/* === CỘT TRÁI: Danh Sách Hạng Mục === */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                        <div className="bg-slate-50/50 border-b border-slate-100 p-6 flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                                    <Wrench className="h-4 w-4 text-blue-600" />
                                    Hạng mục sửa chữa
                                </h3>
                                <div className="text-[12px] text-slate-500 font-medium ml-6">Tổng số {(job?.items || []).length} hạng mục cần điều phối</div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 tracking-widest hidden sm:inline bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">Kéo thả để gán thợ</span>
                        </div>
                        <div className="bg-slate-100/30 p-5 space-y-4">
                            {(job?.items || []).map((item: any) => (
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
                                                            <span className="px-2.5 py-0.5 bg-purple-50 text-purple-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-purple-100 shadow-sm">Phát sinh</span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-widest">Mã: {item.productCode} • SL: {item.quantity}</div>
                                                </div>
                                                {item.isCompleted ? (
                                                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
                                                        <CheckCircle2 className="h-3 w-3" /> Hoàn thành
                                                    </span>
                                                ) : (item.assignments || []).length === 0 ? (
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-red-700 bg-red-100 px-3 py-1 rounded-full border border-red-200 shadow-sm animate-pulse">
                                                        Chưa gán thợ
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-700 bg-blue-100/80 px-3 py-1 rounded-full border border-blue-200 shadow-sm">
                                                        Chờ làm
                                                    </span>
                                                )}
                                            </div>

                                            {/* Vùng thả + Chip Thợ đã gán */}
                                            <div className="min-h-[52px] bg-slate-50/30 rounded-xl border border-dashed border-slate-200 p-2.5 flex gap-2 flex-wrap items-center">
                                                {(item.assignments || []).length === 0 && !snapshot.isDraggingOver && (
                                                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium px-2 italic">
                                                        <UserPlus className="w-3.5 h-3.5 opacity-50" />
                                                        Chưa có thợ được phân công
                                                    </div>
                                                )}
                                                {(item.assignments || []).map((assignment: any, aIdx: number) => (
                                                    <Draggable
                                                        key={`assigned-${assignment.id}`}
                                                        draggableId={`assigned-${assignment.id}-mechanic-${assignment.mechanicId}-from-${item.id}`}
                                                        index={aIdx}
                                                        isDragDisabled={isAlreadySubmitted}
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
                                                                    <BaseAvatar 
                                                                        name={assignment.mechanicName} 
                                                                        src={assignment.mechanicAvatar}
                                                                        id={assignment.mechanicId} 
                                                                        size="xs" 
                                                                        showStatus={false}
                                                                        className="mr-1.5"
                                                                    />
                                                                    <span className="text-[11px] font-bold text-slate-700 mr-2">{assignment.mechanicName}</span>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleUnassign(assignment.id);
                                                                        }}
                                                                        disabled={isAlreadySubmitted}
                                                                        className={`p-1 rounded-md transition-all opacity-0 group-hover:opacity-100 ${
                                                                            isAlreadySubmitted 
                                                                            ? 'cursor-not-allowed text-slate-200' 
                                                                            : 'hover:bg-red-50 text-slate-400 hover:text-red-500'
                                                                        }`}
                                                                        title="Gỡ thợ"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </button>
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
                                                    existingIds={(item.assignments || []).map((a: any) => a.mechanicId)}
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
                                <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-between relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-500/20 transition-all duration-700" />
                                    <div className="relative z-10">
                                        <h3 className="font-black flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-white underline-offset-4">
                                            <span className="p-2 bg-blue-500 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] inline-flex ring-1 ring-blue-400/50">
                                                <Users className="h-4 w-4 text-white" />
                                            </span>
                                            <span className="drop-shadow-md">Nguồn Lực</span>
                                            <span className="bg-white/10 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-full font-black border border-white/20">{(mechanics || []).length}</span>
                                        </h3>
                                        <div className="text-[10px] text-blue-200/70 mt-3 font-bold uppercase tracking-widest flex items-center gap-2">
                                            <span className="flex h-1.5 w-1.5 relative">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                                            </span>
                                            {isAlreadySubmitted ? 'Hồ sơ đã chốt' : 'Kéo thợ để gán việc'}
                                        </div>
                                    </div>
                                    {isAlreadySubmitted && (
                                        <div className="bg-amber-500/20 p-2.5 rounded-xl border border-amber-500/30 shadow-inner group transition-all duration-300 hover:bg-amber-500/30" title="Đã khóa phân công">
                                            <ShieldAlert className="h-5 w-5 text-amber-500" />
                                        </div>
                                    )}
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
                                    {(mechanics || []).length === 0 ? (
                                        <div className="py-8 text-center text-slate-400 italic text-xs">
                                            Không tìm thấy nhân viên
                                        </div>
                                    ) : (
                                        (mechanics || []).map((mechanic: any, index: number) => (
                                            <Draggable 
                                                key={`source-mechanic-${mechanic.id}`} 
                                                draggableId={`source-mechanic-${mechanic.id}`} 
                                                index={index}
                                                isDragDisabled={isAlreadySubmitted}
                                            >
                                                {(provided, snapshot) => (
                                                    <PortalAwareDraggable provided={provided} snapshot={snapshot}>
                                                        <div
                                                            className={`bg-white border p-5 rounded-2xl flex flex-col justify-center transition-all duration-300 group ${
                                                                isAlreadySubmitted
                                                                ? 'cursor-not-allowed opacity-60 grayscale-[0.5]'
                                                                : 'cursor-grab active:cursor-grabbing'
                                                            } ${
                                                                snapshot.isDragging
                                                                ? 'border-blue-400 shadow-2xl ring-4 ring-blue-50/50 scale-105 z-[999]'
                                                                : 'border-slate-100 shadow-sm hover:border-blue-500/30 hover:shadow-xl hover:-translate-y-1'
                                                            } ${mechanic.soViecDangLam === 0 ? 'ring-1 ring-emerald-500/10 bg-emerald-50/5' : ''}`}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="relative">
                                                                    <BaseAvatar 
                                                                        name={mechanic.fullName || 'Nhân viên'} 
                                                                        src={mechanic.avatar}
                                                                        id={mechanic.id} 
                                                                        size="md" 
                                                                        showStatus={false}
                                                                        className="ring-2 ring-white shadow-md"
                                                                    />
                                                                    <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-colors duration-500 z-10 ${
                                                                        mechanic.soViecDangLam === 0 ? 'bg-emerald-500' : 'bg-amber-500'
                                                                    }`}>
                                                                        {mechanic.soViecDangLam === 0 && <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20" />}
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-bold text-slate-900 text-sm tracking-tight truncate group-hover:text-blue-600 transition-colors">
                                                                        {mechanic.fullName || 'Kỹ thuật viên'}
                                                                    </h4>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight bg-slate-100 px-2 py-0.5 rounded">
                                                                            {mechanic.chuyenMonLabel || 'Kỹ thuật'}
                                                                        </span>
                                                                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                                        <span className={`text-[10px] font-black uppercase tracking-tighter ${
                                                                            mechanic.soViecDangLam === 0 ? 'text-emerald-600' : 'text-amber-600'
                                                                        }`}>
                                                                            {mechanic.soViecDangLam === 0 ? 'Rảnh' : `${mechanic.soViecDangLam} việc`}
                                                                        </span>
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
                const assignedItemCount = (job?.items || []).filter((item: any) => (item.assignments || []).length > 0).length;
                const totalItems = job?.items?.length || 0;
                const uniqueMechanicIds = new Set<number>();
                (job?.items || []).forEach((item: any) => (item.assignments || []).forEach((a: any) => uniqueMechanicIds.add(a.mechanicId)));
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
                                        <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Đã xác nhận phân công và bàn giao kỹ thuật</div>
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
                    <div className="sticky bottom-4 md:bottom-6 left-0 right-0 mt-8 bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.12)] px-4 md:px-8 py-4 md:py-5 z-20 rounded-2xl ring-1 ring-white/50 animate-in fade-in slide-in-from-bottom-5 duration-300">
                        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 text-center md:text-left">
                            {/* Tóm tắt */}
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${allAssigned ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-emerald-600'}`}>
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className={`text-sm font-black ${allAssigned ? 'text-emerald-700' : 'text-slate-800'}`}>
                                            {assignedItemCount}/{totalItems} hạng mục
                                        </div>
                                        <div className="text-[11px] text-slate-500">
                                            {uniqueCount} Kỹ thuật viên được phân công
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Nút chính */}
                            <button
                                onClick={() => {
                                    if (!allAssigned) {
                                        toast({
                                            title: "Chưa đủ điều kiện",
                                            description: "Vui lòng gán thợ cho TẤT CẢ các hạng mục trước khi xác nhận bàn giao kỹ thuật.",
                                            variant: "destructive"
                                        });
                                        return;
                                    }
                                    submitMutation.mutate();
                                }}
                                disabled={!allAssigned || isWorking}
                                className={`w-full md:w-auto flex items-center justify-center gap-3 px-6 md:px-8 py-3 md:py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                                    !allAssigned || submitMutation.isPending
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
                                        {allAssigned ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-amber-500" />}
                                        Xác nhận
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
