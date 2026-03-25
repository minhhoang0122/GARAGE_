'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Package, Wrench, Trash2, Send, Loader2, CheckCircle2, PlusCircle, Minus, Plus, AlertCircle, Clock, X, Users, ChevronRight } from 'lucide-react';
import ProductSearchMechanic from './ProductSearchMechanic';
import { submitProposal, removeItemFromProposal } from '@/modules/service/mechanic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';
import { useConfirm } from '@/modules/shared/components/ui/ConfirmModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type Product = {
    id: number;
    code: string;
    name: string;
    isService: boolean;
    stock: number;
};

type ProposalItem = {
    product: Product;
    quantity: number;
    note: string;
};

type SavedItem = {
    id: number;
    productId: number;
    productCode: string;
    productName: string;
    quantity: number;
    isService: boolean;
    isTechnicalAddition?: boolean;
    note?: string;
    status?: string;
    proposedById?: number;
    proposedByName?: string;
    proposedByRole?: string;
    proposedAt?: string;
    assignments?: Array<{
        id: number;
        mechanicId: number;
        mechanicName: string;
        isMain: boolean;
    }>;
};

interface ProposalListProps {
    receptionId: number;
    initialItems: SavedItem[];
    readOnly?: boolean;
    currentUser?: any;
    receptionStatus?: string;
}

export default function ProposalList({ receptionId, initialItems, readOnly = false, currentUser, receptionStatus }: ProposalListProps) {
    const [items, setItems] = useState<ProposalItem[]>([]);
    const queryClient = useQueryClient();
    const router = useRouter();
    const { showToast } = useToast();
    const confirm = useConfirm();

    // Mutations
    const removeMutation = useMutation({
        mutationFn: (itemId: number) => removeItemFromProposal(itemId, receptionId),
        onSuccess: (res) => {
            if (res.success) {
                showToast('success', 'Đã xóa hạng mục thành công');
                queryClient.invalidateQueries({ queryKey: ['reception', receptionId.toString()] });
            } else {
                showToast('error', 'Lỗi: ' + res.error);
            }
        },
        onError: () => showToast('error', 'Lỗi hệ thống khi xóa'),
    });

    const submitMutation = useMutation({
        mutationFn: (proposalItems: any[]) => submitProposal(receptionId, proposalItems),
        onSuccess: (res) => {
            if (res.success) {
                setItems([]);
                showToast('success', 'Đã gửi đề xuất thành công!');
                queryClient.invalidateQueries({ queryKey: ['reception', receptionId.toString()] });
            } else {
                showToast('error', 'Lỗi: ' + res.error);
            }
        },
        onError: () => showToast('error', 'Lỗi hệ thống khi gửi đề xuất'),
    });

    const isWorking = removeMutation.isPending || submitMutation.isPending;

    const isAssignmentReady = receptionStatus ? !['TIEP_NHAN', 'CHO_CHAN_DOAN', 'BAO_GIA', 'KHACH_TU_CHOI', 'HUY', 'DONG', 'HOAN_THANH'].includes(receptionStatus) : false;


    // Mapping trạng thái sang tiếng Việt và màu sắc
    const getStatusInfo = (status?: string) => {
        switch (status) {
            case 'DE_XUAT':
                return {
                    label: 'Chờ duyệt',
                    color: 'bg-blue-100/80 text-blue-700 border-blue-200/50 shadow-sm',
                    icon: <Clock className="w-3 h-3" />
                };
            case 'KHACH_DONG_Y':
                return {
                    label: 'Đã duyệt',
                    color: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 shadow-sm',
                    icon: <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                };
            case 'KHACH_TU_CHOI':
                return {
                    label: 'Từ chối',
                    color: 'bg-red-50 text-red-600 border-red-100',
                    icon: <X className="w-3 h-3" />
                };
            case 'DANG_SUA':
                return {
                    label: 'Đang sửa',
                    color: 'bg-blue-100/80 text-blue-700 border-blue-200/50 shadow-sm',
                    icon: <Wrench className="w-3 h-3" />
                };
            case 'HOAN_THANH':
                return {
                    label: 'Xong',
                    color: 'bg-emerald-600 text-white border-transparent shadow-sm',
                    icon: <CheckCircle2 className="w-3.5 h-3.5" />
                };
            case 'CHO_KY_THUAT_DUYET':
                return {
                    label: 'Tiếp nhận',
                    color: 'bg-purple-50 text-purple-600 border-purple-100',
                    icon: <Clock className="w-3 h-3" />
                };
            default:
                return {
                    label: status || 'N/A',
                    color: 'bg-slate-50 text-slate-500 border-slate-200',
                    icon: <AlertCircle className="w-3 h-3" />
                };
        }
    };

    // Sync state with props - though with React Query this is mostly for the drafting 'items'
    useEffect(() => {
        // We use initialItems directly in render logic
    }, [initialItems]);

    // ... (keep helper functions handleAddProduct, updateItemQuantity, handleRemoveItem, handleRemoveSavedItem, handleSubmit unchanged)
    const handleAddProduct = (product: Product) => {
        if (readOnly) return;
        // Kiểm tra đã có trong danh sách mới chưa
        if (items.some(i => i.product.id === product.id)) {
            showToast('error', "Hạng mục này đã có trong danh sách đề xuất mới");
            return;
        }

        // Kiểm tra đã có trong đơn hàng chưa
        if (initialItems.some(i => i.productId === product.id)) {
            showToast('error', "Hạng mục này đã tồn tại trong đơn hàng");
            return;
        }

        setItems([...items, { product, quantity: 1, note: '' }]);
    };

    const updateItemQuantity = (index: number, quantity: number) => {
        if (readOnly) return;
        if (quantity <= 0) {
            handleRemoveItem(index);
            return;
        }
        const newItems = [...items];
        newItems[index].quantity = quantity;
        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        if (readOnly) return;
        setItems(items.filter((_, i) => i !== index));
    };

    const handleRemoveSavedItem = async (itemId: number) => {
        if (readOnly) return;
        const confirmed = await confirm({
            title: 'Xóa hạng mục',
            message: 'Bạn có chắc muốn xóa hạng mục này?',
            type: 'danger',
            confirmText: 'Xóa'
        });
        if (!confirmed) return;

        removeMutation.mutate(itemId);
    };

    const handleSubmit = async () => {
        if (readOnly) return;
        if (items.length === 0) {
            showToast('warning', 'Vui lòng thêm ít nhất 1 hạng mục đề xuất');
            return;
        }

        submitMutation.mutate(items.map(i => ({
            productId: i.product.id,
            quantity: i.quantity,
            note: i.note
        })));
    };

    // Calculate all product IDs already in project (saved + drafting)
    const existingProductIds = useMemo(() => {
        const savedIds = initialItems.map(i => i.productId);
        const draftingIds = items.map(i => i.product.id);
        return [...savedIds, ...draftingIds];
    }, [initialItems, items]);

    // Helper to render a row (DRY)
    const renderRow = (item: SavedItem) => {
        const statusInfo = getStatusInfo(item.status);
        return (
            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${item.isService ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {item.isService ? <Wrench className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                            <p className="font-bold text-slate-800">{item.productName}</p>
                            <p className="text-[10px] text-slate-500 font-mono italic uppercase tracking-tighter">{item.productCode}</p>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 text-center font-black text-slate-600 text-base">
                    × {item.quantity}
                </td>
                <td className="px-6 py-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black border uppercase tracking-widest ${statusInfo.color}`}>
                                {statusInfo.label}
                            </span>
                            {item.isTechnicalAddition && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-50 text-purple-600 border border-purple-100 uppercase tracking-widest">
                                    Phát sinh
                                </span>
                            )}
                            {item.proposedByName && (
                                <span className="text-[10px] text-slate-400 font-medium">
                                    bởi <span className="text-slate-600 font-bold">{item.proposedByName}</span>
                                </span>
                            )}
                        </div>

                        {/* Danh sách thợ */}
                        {item.assignments && item.assignments.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {item.assignments.map(a => (
                                    <span key={a.id} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded text-[9px] font-bold border border-slate-100">
                                        {a.isMain && <div className="w-1 h-1 bg-blue-500 rounded-full" />}
                                        {a.mechanicName}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </td>
                <td className="px-6 py-4">
                    <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
                        {item.note || <span className="text-slate-300 italic">Không có ghi chú</span>}
                    </p>
                    {item.proposedAt && (
                        <p className="text-[9px] text-slate-300 mt-1 italic">
                            Lúc: {new Date(item.proposedAt).toLocaleString('vi-VN')}
                        </p>
                    )}
                </td>
                {!readOnly && (
                    <td className="px-6 py-4 text-right w-20">
                        <button
                            onClick={() => handleRemoveSavedItem(item.id)}
                            disabled={removeMutation.isPending}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Xóa"
                        >
                            {(removeMutation.variables === item.id && removeMutation.isPending) ? (
                                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                        </button>
                    </td>
                )}
            </tr>
        );
    };

    return (
        <div className="space-y-6">
            {/* 1. Thanh tìm kiếm và header - CHỈ HIỆN KHI KHÔNG PHẢI READONLY */}
            {!readOnly && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Thêm đề xuất mới</h3>
                        <p className="text-sm text-slate-500">Tìm kiếm và thêm phụ tùng hoặc dịch vụ cần thiết cho việc sửa chữa</p>
                    </div>
                    <div className="w-full md:w-[400px]">
                        <ProductSearchMechanic
                            onSelect={handleAddProduct}
                            excludeIds={existingProductIds}
                        />
                    </div>
                </div>
            )}

            {/* 2. Danh sách đã đề xuất (Đã lưu) */}
            {initialItems.length > 0 && (
                <div className="space-y-6">
                    {(() => {
                        // Phân loại hạng mục
                        const diagnosticItems = initialItems.filter(i =>
                            !i.isTechnicalAddition &&
                            i.proposedByRole !== 'SALE'
                        );
                        const additionItems = initialItems.filter(i =>
                            (i.isTechnicalAddition && i.status !== 'KHACH_DONG_Y') ||
                            i.proposedByRole === 'SALE'
                        );
                        const incidentalApprovedItems = initialItems.filter(i =>
                            i.isTechnicalAddition &&
                            i.status === 'KHACH_DONG_Y'
                        );

                        // Tổng hợp danh sách thợ tham gia từ tất cả hạng mục
                        const allAssignmentsMap = new Map<number, {
                            mechanicId: number;
                            mechanicName: string;
                            tasks: string[];
                            isMain: boolean;
                        }>();

                        initialItems.forEach(item => {
                            item.assignments?.forEach(a => {
                                if (!allAssignmentsMap.has(a.mechanicId)) {
                                    allAssignmentsMap.set(a.mechanicId, {
                                        mechanicId: a.mechanicId,
                                        mechanicName: a.mechanicName,
                                        tasks: [item.productName],
                                        isMain: a.isMain
                                    });
                                } else {
                                    const record = allAssignmentsMap.get(a.mechanicId)!;
                                    if (!record.tasks.includes(item.productName)) {
                                        record.tasks.push(item.productName);
                                    }
                                    if (a.isMain) record.isMain = true;
                                }
                            });
                        });

                        const mechanicList = Array.from(allAssignmentsMap.values());

                        const renderTable = (items: SavedItem[], title: string, icon: React.ReactNode, bgColor: string, borderLColor: string, iconBg: string, iconColor: string, description: string) => (
                            <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className={`px-8 py-6 border-b border-slate-100 border-l-[6px] ${borderLColor} ${bgColor} flex items-center justify-between`}>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-xl ${iconBg} shadow-sm border border-white/50 backdrop-blur-sm`}>
                                                {React.cloneElement(icon as React.ReactElement, { className: `w-5 h-5 ${iconColor}` })}
                                            </div>
                                            <h3 className="font-bold text-slate-900 text-base tracking-tight">
                                                {title} <span className="ml-1 text-slate-400 font-normal">({items.length})</span>
                                            </h3>
                                        </div>
                                        <p className="text-[12px] text-slate-500 font-medium ml-14">{description}</p>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    {items.length > 0 ? (
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-slate-50/30 border-b border-slate-100">
                                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left w-[35%]">Hạng mục</th>
                                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center w-[12%]">Số lượng</th>
                                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left w-[25%]">Người đề xuất & Trạng thái</th>
                                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left">Ghi chú kỹ thuật</th>
                                                    {!readOnly && <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right w-20"></th>}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {items.map(item => (
                                                    <tr key={item.id} className="bg-white/80 hover:bg-white border-b border-slate-100/80 last:border-0 transition-all group">
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`p-2.5 rounded-2xl ${item.isService ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'} border border-transparent group-hover:border-current/10 transition-all duration-300`}>
                                                                    {item.isService ? <Wrench className="w-4 h-4" strokeWidth={2.5} /> : <Package className="w-4 h-4" strokeWidth={2.5} />}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-slate-900 text-[15px] leading-tight group-hover:text-blue-600 transition-colors">{item.productName}</p>
                                                                    <p className="text-[12px] text-slate-500 font-semibold mt-1 tracking-widest uppercase">{item.productCode}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center font-black text-slate-600 text-base">
                                                            × {item.quantity}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col gap-1.5">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold border uppercase tracking-widest transition-all ${getStatusInfo(item.status).color}`}>
                                                                        {getStatusInfo(item.status).icon}
                                                                        {getStatusInfo(item.status).label}
                                                                    </span>
                                                                    {item.isTechnicalAddition && (
                                                                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-widest">
                                                                            Phát sinh
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {item.proposedByName && (
                                                                    <p className="text-[11px] text-slate-500">
                                                                        Đề xuất: <span className="text-slate-700 font-semibold">{item.proposedByName}</span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-[13px] text-slate-600 leading-relaxed font-normal">
                                                                {item.note || <span className="text-slate-400/60 italic">Không có ghi chú</span>}
                                                            </p>
                                                            {item.proposedAt && (
                                                                <p className="text-[11px] text-slate-400 mt-1.5 font-medium tabular-nums">
                                                                    {new Date(item.proposedAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                                                                </p>
                                                            )}
                                                        </td>
                                                        {!readOnly && (
                                                            <td className="px-6 py-4 text-right w-20">
                                                                {(currentUser?.role === 'ADMIN' ||
                                                                    currentUser?.role === 'MANAGER' ||
                                                                    currentUser?.id === item.proposedById) ? (
                                                                    <button
                                                                        onClick={() => handleRemoveSavedItem(item.id)}
                                                                        disabled={removeMutation.isPending}
                                                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                        title="Xóa"
                                                                    >
                                                                        {(removeMutation.variables === item.id && removeMutation.isPending) ? (
                                                                            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                                                                        ) : (
                                                                            <Trash2 className="w-4 h-4" />
                                                                        )}
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-8 h-8 flex items-center justify-center text-slate-200" title="Bạn không có quyền xóa hạng mục này">
                                                                        <Trash2 className="w-4 h-4 opacity-20" />
                                                                    </div>
                                                                )}
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30 italic text-xs">
                                            Chưa có hạng mục nào trong danh sách này
                                        </div>
                                    )}
                                </div>
                            </div>
                        );

                        return (
                            <>
                                <div className="space-y-8">
                                    {diagnosticItems.length > 0 && renderTable(
                                        diagnosticItems,
                                        "1. Chẩn đoán chuyên môn",
                                        <CheckCircle2 strokeWidth={2.5} />,
                                        "bg-emerald-500/[0.08]",
                                        "border-l-emerald-500",
                                        "bg-emerald-50",
                                        "text-emerald-600",
                                        "Các hạng mục do Quản đốc, Kỹ thuật viên hoặc AI đề xuất dựa trên tình trạng xe"
                                    )}

                                    {additionItems.length > 0 && renderTable(
                                        additionItems,
                                        "2. Yêu cầu của Khách hàng & Sale",
                                        <PlusCircle strokeWidth={2.5} />,
                                        "bg-blue-500/[0.08]",
                                        "border-l-blue-500",
                                        "bg-blue-50",
                                        "text-blue-600",
                                        "Các hạng mục do khách hàng yêu cầu thêm hoặc thợ báo phát sinh trong quá trình sửa chữa"
                                    )}

                                    {incidentalApprovedItems.length > 0 && renderTable(
                                        incidentalApprovedItems,
                                        "3. Hạng mục Phát sinh",
                                        <AlertCircle strokeWidth={2.5} />,
                                        "bg-amber-500/[0.08]",
                                        "border-l-amber-500",
                                        "bg-amber-50",
                                        "text-amber-600",
                                        "Các hạng mục do thợ báo phát sinh trong quá trình sửa chữa và đã được khách hàng duyệt"
                                    )}

                                    {(mechanicList.length > 0 || currentUser?.roles?.includes('QUAN_LY_XUONG')) && (
                                        <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-700">
                                            <div className="px-8 py-6 border-b border-slate-100 border-l-[6px] border-l-slate-400 bg-slate-500/[0.05] flex items-center justify-between">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2.5 rounded-xl bg-slate-100 shadow-sm border border-white/50 backdrop-blur-sm">
                                                            <Users className="w-5 h-5 text-slate-500" strokeWidth={2.5} />
                                                        </div>
                                                        <h3 className="font-bold text-slate-900 text-base tracking-tight">
                                                            4. Nhân sự thực hiện <span className="ml-1 text-slate-400 font-normal">({mechanicList.length})</span>
                                                        </h3>
                                                    </div>
                                                    <p className="text-[12px] text-slate-500 font-medium ml-14">Danh sách nhân viên được phân công thực hiện các hạng mục trên</p>
                                                </div>
                                                {/* Chỉ Quản đốc mới được chia việc & Chỉ khi đã duyệt */}
                                                {isAssignmentReady && currentUser?.roles?.includes('QUAN_LY_XUONG') && (
                                                    <Link
                                                        href={`/mechanic/assign/${receptionId}`}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                                                    >
                                                        <Wrench className="w-4 h-4" />
                                                        Vào Chia việc
                                                    </Link>
                                                )}
                                            </div>
                                            {mechanicList.length > 0 ? (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="bg-slate-50/30 border-b border-slate-100">
                                                                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left w-[35%]">Nhân viên</th>
                                                                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left">Hạng mục đảm nhận</th>
                                                                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center w-32">Vai trò</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {mechanicList.map(m => (
                                                                <tr key={m.mechanicId} className="hover:bg-slate-50/30 transition-colors">
                                                                    <td className="px-6 py-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">
                                                                                {m.mechanicName.charAt(0)}
                                                                            </div>
                                                                            <span className="font-bold text-slate-700">{m.mechanicName}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        <div className="flex flex-wrap gap-1.5">
                                                                            {m.tasks.map((t, idx) => (
                                                                                <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold border border-blue-100/50">
                                                                                    {t}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <span className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${m.isMain ? 'bg-blue-600 text-white border-blue-700' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                                            {m.isMain ? 'Thợ chính' : 'Hỗ trợ'}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="py-10 text-center">
                                                    <p className="text-slate-400 italic text-sm">Chưa có nhân viên nào được phân công cho các hạng mục này.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        );
                    })()}
                </div>
            )}

            {/* 3. Danh sách đang soạn - CHỈ HIỆN KHI KHÔNG PHẢI READONLY */}
            {!readOnly && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <PlusCircle className="w-5 h-5 text-blue-600" />
                            <h3 className="font-bold text-slate-900 text-sm">Danh sách đề xuất mới ({items.length})</h3>
                        </div>
                        {items.length > 0 && (
                            <button
                                onClick={() => setItems([])}
                                className="text-[10px] font-bold tracking-wider text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-100 transition-colors"
                            >
                                Xóa tất cả
                            </button>
                        )}
                    </div>

                    {items.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <Wrench className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="font-medium text-slate-600">Chưa có đề xuất mới nào</p>
                            <p className="text-sm mt-1">Sử dụng thanh tìm kiếm phía trên để bắt đầu thêm</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mục đề xuất</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center w-32">Số lượng</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ghi chú kỹ thuật</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right w-20"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {items.map((item, index) => (
                                            <tr key={index} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${item.product.isService ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                            {item.product.isService ? <Wrench className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800">{item.product.name}</p>
                                                            <p className="text-xs text-slate-500 font-mono tracking-tighter uppercase">{item.product.code}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {item.product.isService ? (
                                                        <div className="w-24 mx-auto text-center py-2 px-3 bg-slate-50 rounded-lg text-slate-400 font-bold border border-slate-100 text-[10px] uppercase">
                                                            Cố định: 1
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); updateItemQuantity(index, item.quantity - 1); }}
                                                                className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm disabled:opacity-30"
                                                                disabled={item.quantity <= 1}
                                                            >
                                                                <Minus className="w-3 h-3" />
                                                            </button>
                                                            <input
                                                                type="number"
                                                                value={item.quantity}
                                                                onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                                                className="w-10 text-center font-bold text-slate-700 bg-transparent border-none focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            />
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); updateItemQuantity(index, item.quantity + 1); }}
                                                                className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={item.note}
                                                        onChange={(e) => {
                                                            const newItems = [...items];
                                                            newItems[index].note = e.target.value;
                                                            setItems(newItems);
                                                        }}
                                                        placeholder="Lý do thay thế / sửa chữa..."
                                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleRemoveItem(index)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitMutation.isPending || items.length === 0}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-slate-200 transition-all active:scale-95 flex-shrink-0"
                                >
                                    {submitMutation.isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" /> Gửi báo cáo đề xuất
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
