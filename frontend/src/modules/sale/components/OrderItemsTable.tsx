'use client';

import { OrderDetailItem } from '@/modules/sale/services/sale';
import { useRemoveOrderItem, useUpdateItemStatus } from '@/modules/sale/hooks/useSale';
import { Trash2, Check, ChevronRight, Save, Loader2, ShieldCheck, PackageSearch } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConfirm } from '@/modules/shared/components/ui/ConfirmModal';
import { useToast } from '@/contexts/ToastContext';
import { useOrderWorkspaceOptional } from './OrderWorkspaceProvider';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { saleService } from '@/modules/sale/services/sale';
import { isItemRejected, isItemApproved } from '@/lib/status';

interface OrderItemsTableProps {
    items: OrderDetailItem[];
    orderId: number;
    readOnly?: boolean;
    token?: string;
}

export default function OrderItemsTable({ items: serverItems, orderId, readOnly = false, token }: OrderItemsTableProps) {
    const workspace = useOrderWorkspaceOptional();
    const displayItems = workspace ? workspace.items : serverItems;
    const router = useRouter();
    const { showToast } = useToast();
    
    const [isGlobalEditing, setIsGlobalEditing] = useState(false);
    const [editData, setEditData] = useState<Record<string, { quantity: string | number; discountPercent: number | string }>>({});

    const queryClient = useQueryClient();
    const [isSavingAll, setIsSavingAll] = useState(false);

    const handleUpdateLocal = (id: number, field: 'quantity' | 'discountPercent', value: string | number) => {
        const idKey = id.toString();
        setEditData(prev => {
            const current = prev[idKey] || { 
                quantity: displayItems.find(i => i.id === id)?.quantity || 1, 
                discountPercent: displayItems.find(i => i.id === id)?.discountPercent || 0 
            };
            return {
                ...prev,
                [idKey]: { ...current, [field]: value }
            };
        });
    };

    const handleSaveAll = async () => {
        setIsSavingAll(true);
        try {
            // Gọi trực tiếp saleService (bỏ qua mutation hook) để tránh xung đột Optimistic Update
            const entries = Object.entries(editData);
            for (const [id, data] of entries) {
                const originalItem = displayItems.find(i => i.id.toString() === id);
                await saleService.updateItem(Number(id), {
                    quantity: data.quantity === '' ? (originalItem?.quantity || 1) : Number(data.quantity),
                    discountPercent: data.discountPercent === '' ? (originalItem?.discountPercent || 0) : Number(data.discountPercent)
                });
            }

            // Invalidate cache 1 lần duy nhất sau khi tất cả đã lưu xong
            await queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(orderId) });

            setIsGlobalEditing(false);
            setEditData({});
            showToast('success', 'Đã lưu tất cả thay đổi');
        } catch (error: any) {
            console.error("Failed to save changes:", error);
            const errorMessage = error?.error || error?.message || 'Có lỗi khi lưu thay đổi. Vui lòng thử lại.';
            showToast('error', errorMessage);
            // Refetch để UI đồng bộ lại với server dù có lỗi
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(orderId) });
        } finally {
            setIsSavingAll(false);
        }
    };

    const handleCancel = () => {
        setEditData({});
        setIsGlobalEditing(false);
    };

    if (displayItems.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Chưa có hạng mục</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    Vui lòng chọn phụ tùng hoặc dịch vụ từ ô tìm kiếm phía trên để thêm vào báo giá.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-blue-600 rounded-full" />
                    <h2 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <PackageSearch className="w-5 h-5 text-blue-600" />
                        Danh sách vật tư & Dịch vụ
                        <span className="text-sm font-normal text-slate-400 italic">({displayItems.length} món)</span>
                    </h2>
                </div>
                
                {!readOnly && (
                    <div className="flex items-center gap-2">
                        {isGlobalEditing ? (
                            <>
                                <button
                                    onClick={handleSaveAll}
                                    disabled={isSavingAll}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-200 active:scale-95 disabled:opacity-50"
                                >
                                    {isSavingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Lưu thay đổi
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-bold transition-all active:scale-95"
                                >
                                    Hủy
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsGlobalEditing(true)}
                                className="px-4 py-2 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-600 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95"
                            >
                                <ChevronRight className="w-4 h-4 text-blue-600" />
                                Chỉnh sửa báo giá
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-[13px] overflow-hidden">
                <div className="w-full text-left min-w-0">
                    <div className="hidden md:flex bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 font-bold">
                        <div className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-[60px] text-center">#</div>
                        <div className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-1">Sản phẩm / Dịch vụ</div>
                        <div className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center w-[80px]">ĐVT</div>
                        <div className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right w-[100px]">Số lượng</div>
                        <div className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right w-[140px]">Đơn giá</div>
                        <div className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right w-[160px]">Thành tiền</div>
                        <div className="px-6 py-4 w-[60px]"></div>
                    </div>
                    
                    <div className="flex flex-col md:divide-y divide-slate-50 dark:divide-slate-800 p-4 md:p-0 gap-4 md:gap-0 bg-slate-50/30 md:bg-transparent dark:bg-slate-950/20 md:dark:bg-transparent">
                        {displayItems.map((item) => (
                            <Row 
                                key={item.id} 
                                item={item} 
                                orderId={orderId}
                                isGlobalEditing={isGlobalEditing}
                                editValue={editData[item.id.toString()]}
                                onUpdate={handleUpdateLocal}
                                readOnly={readOnly}
                                token={token}
                            />
                        ))}
                        <div className="bg-white md:bg-slate-50/30 dark:bg-slate-900 md:dark:bg-slate-800/20 font-bold md:border-t-2 border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-end md:items-center px-4 md:px-6 py-4 rounded-xl border border-slate-200/60 md:border-0 md:rounded-none shadow-sm md:shadow-none">
                            <div className="md:flex-1 text-right text-slate-500 font-medium text-[11px] mb-1 md:mb-0 md:mr-4">Tổng cộng các hạng mục đã duyệt:</div>
                            <div className="text-right text-blue-600 dark:text-blue-400 text-xl md:text-lg tabular-nums md:w-[160px]">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                    displayItems
                                        .filter(i => !isItemRejected(i.itemStatus))
                                        .reduce((sum, i) => sum + i.total, 0)
                                )}
                            </div>
                            <div className="hidden md:block w-[60px]"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            {isGlobalEditing && (
                <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl flex items-center gap-3 text-blue-700 dark:text-blue-300 text-sm animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang trong chế độ chỉnh sửa báo giá... vui lòng Lưu sau khi hoàn tất.
                </div>
            )}
        </div>
    );
}

function Row({ 
    item, 
    orderId,
    isGlobalEditing, 
    editValue,
    onUpdate,
    readOnly,
    token
}: { 
    item: OrderDetailItem, 
    orderId: number,
    isGlobalEditing: boolean,
    editValue?: { quantity: string | number; discountPercent: string | number },
    onUpdate: (id: number, field: 'quantity' | 'discountPercent', value: string | number) => void,
    readOnly: boolean,
    token?: string
}) {
    const confirm = useConfirm();
    const workspace = useOrderWorkspaceOptional();
    const router = useRouter();

    const [localStatus, setLocalStatus] = useState(item.itemStatus);
    const [lastServerStatus, setLastServerStatus] = useState(item.itemStatus);

    if (item.itemStatus !== lastServerStatus) {
        setLocalStatus(item.itemStatus);
        setLastServerStatus(item.itemStatus);
    }
    
    const currentStatus = workspace ? item.itemStatus : localStatus;

    const { mutate: updateStatus, isPending: isStatusUpdating } = useUpdateItemStatus();
    const { mutate: removeItem, isPending: isRemoving } = useRemoveOrderItem();

    const isRejected = isItemRejected(currentStatus);
    const isApproved = isItemApproved(currentStatus);
    const isOutOfStock = !item.isService && item.stock <= 0;
    const isInsufficient = !item.isService && item.stock < item.quantity && item.stock > 0;

    const isSale = item.proposedByRole?.toUpperCase().includes('SALE') || 
                  item.proposedByName?.toLowerCase().includes('sale');

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    return (
        <div className={`group flex flex-col md:flex-row transition-all hover:bg-slate-50/80 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-900 md:bg-transparent border border-slate-200/60 dark:border-slate-800 md:border-0 rounded-2xl md:rounded-none overflow-hidden shadow-sm md:shadow-none ${isRejected ? 'opacity-40' : ''} ${(isOutOfStock || isInsufficient) ? 'bg-red-50/30 md:bg-red-50/30 dark:bg-red-900/5' : ''}`}>
            {/* Desktop: Action Checkbox (#) */}
            <div className="hidden md:flex px-6 py-3.5 w-[60px] items-center text-center justify-center shrink-0">
                {!isSale && (
                    <button
                        disabled={readOnly || isOutOfStock || isStatusUpdating}
                        onClick={() => {
                            if (readOnly || isOutOfStock) return;
                            const nextStatus = isItemRejected(currentStatus) ? 'CUSTOMER_APPROVED' : 'CUSTOMER_REJECTED';
                            if (workspace) workspace.updateItemStatusLocal(item.id, nextStatus);
                            updateStatus(
                                { itemId: item.id, status: nextStatus, token, orderId },
                                { onError: () => { if (workspace) workspace.updateItemStatusLocal(item.id, currentStatus); } }
                            );
                        }}
                        title={isOutOfStock ? "Hết hàng trong kho" : isApproved ? "Bỏ duyệt" : "Duyệt hạng mục"}
                        className={`p-1 rounded-md transition-colors ${isOutOfStock ? 'cursor-not-allowed opacity-50' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${isApproved ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-900'} hover:scale-105 shadow-sm`}>
                            {isApproved && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                    </button>
                )}
            </div>

            {/* Product Details Area */}
            <div className="p-4 md:px-6 md:py-3.5 flex-1 min-w-0 border-b border-slate-50 dark:border-slate-800/50 md:border-b-0 shrink-0">
                <div className="flex justify-between items-start mb-2 md:mb-0.5">
                    <div className="flex items-center gap-2 pr-2">
                        <div className="font-bold text-slate-800 dark:text-slate-100 text-[13px] leading-tight break-words" title={item.productName}>
                            {item.productName}
                        </div>
                        {isRejected && (
                            <span className="px-1.5 py-0.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[9px] font-bold rounded shrink-0 ring-1 ring-orange-100 dark:ring-orange-800 whitespace-nowrap">
                                Khách không duyệt
                            </span>
                        )}
                    </div>
                    {/* Mobile Only: Actions area at top right */}
                    <div className="md:hidden flex gap-2 shrink-0">
                        {!isSale && (
                            <button
                                disabled={readOnly || isOutOfStock || isStatusUpdating}
                                onClick={() => {
                                    if (readOnly || isOutOfStock) return;
                                    const nextStatus = isItemRejected(currentStatus) ? 'CUSTOMER_APPROVED' : 'CUSTOMER_REJECTED';
                                    if (workspace) workspace.updateItemStatusLocal(item.id, nextStatus);
                                    updateStatus(
                                        { itemId: item.id, status: nextStatus, token, orderId },
                                        { onError: () => { if (workspace) workspace.updateItemStatusLocal(item.id, currentStatus); } }
                                    );
                                }}
                                className={`p-1 -m-1 rounded transition-colors ${isOutOfStock ? 'opacity-50' : 'active:bg-slate-100 dark:active:bg-slate-800'}`}
                            >
                                <div className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center ${isApproved ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-900'} shadow-sm`}>
                                    {isApproved && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>
                            </button>
                        )}
                        {!readOnly && item.proposedByRole === 'SALE' && (
                            <button
                                onClick={async () => {
                                    const confirmed = await confirm({
                                        title: 'Xóa hạng mục',
                                        message: 'Bạn có chắc muốn xóa mục này khỏi báo giá?',
                                        type: 'danger',
                                        confirmText: 'Xóa'
                                    });
                                    if (!confirmed) return;
                                    removeItem({ orderId, itemId: item.id });
                                }}
                                disabled={isRemoving}
                                className="p-1 -m-1 text-slate-400 hover:text-red-500 active:bg-red-50 dark:active:bg-red-900/20 rounded transition-all"
                            >
                                <Trash2 className="w-[18px] h-[18px]" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mb-1 md:mb-1">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded shrink-0">{item.productCode}</span>
                    <span className={`text-[9px] font-bold px-1 py-0.5 rounded shrink-0 ${item.isService ? 'text-blue-600 bg-blue-50' : 'text-emerald-600 bg-emerald-50'}`}>
                        {item.isService ? 'DỊCH VỤ' : 'PHỤ TÙNG'}
                    </span>
                    {isOutOfStock && (
                        <span className="text-[9px] font-bold px-1 py-0.5 bg-red-100 text-red-600 rounded animate-bounce ring-1 ring-red-200">
                            CẦN ĐẶT HÀNG
                        </span>
                    )}
                    {isInsufficient && (
                        <span className="text-[9px] font-bold px-1 py-0.5 bg-orange-100 text-orange-600 rounded animate-pulse ring-1 ring-orange-200">
                            THIẾU {item.quantity - item.stock} {item.unit || 'món'}
                        </span>
                    )}
                </div>
                {item.proposedByName && (
                    <div className="text-[10px] text-slate-400 italic flex items-center gap-1 mb-1.5 md:mb-1">
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        Đề xuất: {item.proposedByRole === 'AI' ? 'AI Chẩn đoán' : item.proposedByName}
                    </div>
                )}
                {(item.warrantyMonths > 0 || item.warrantyKm > 0) && (
                    <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-blue-500/80 bg-blue-50/50 dark:bg-blue-900/10 w-fit px-1.5 py-0.5 rounded border border-blue-100/50 dark:border-blue-800/30">
                        <ShieldCheck size={10} className="shrink-0" />
                        <span>
                            Bảo hành: {item.warrantyMonths > 0 ? `${item.warrantyMonths}T` : ''} 
                            {item.warrantyMonths > 0 && item.warrantyKm > 0 ? ' / ' : ''}
                            {item.warrantyKm > 0 ? `${item.warrantyKm.toLocaleString()}km` : ''}
                        </span>
                    </div>
                )}
            </div>

            {/* Mobile: 2x2 Grid of details. Desktop: horizontal remaining columns */}
            <div className="grid grid-cols-2 md:flex md:w-[480px] p-4 md:p-0 gap-3 md:gap-0 bg-slate-400/5 dark:bg-slate-800/30 md:bg-transparent shrink-0">
                {/* ĐVT */}
                <div className="flex flex-col md:flex-row md:items-center px-0 md:px-6 py-0 md:py-3.5 md:w-[80px] md:justify-center gap-0.5 md:gap-0">
                    <span className="md:hidden text-[10px] text-slate-400 font-medium tracking-wide uppercase">ĐVT</span>
                    <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100">{item.unit || 'Lần'}</span>
                </div>

                {/* Số lượng */}
                <div className="flex flex-col items-end md:flex-row md:items-center px-0 md:px-6 py-0 md:py-3.5 md:w-[100px] md:justify-end gap-0.5 md:gap-0">
                    <span className="md:hidden text-[10px] text-slate-400 font-medium tracking-wide uppercase">Số lượng</span>
                    {isGlobalEditing && !item.isService ? (
                        <input
                            type="text"
                            inputMode="numeric"
                            value={editValue?.quantity ?? item.quantity}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || /^\d+$/.test(val)) onUpdate(item.id, 'quantity', val);
                            }}
                            className="w-14 h-8 bg-white dark:bg-slate-800 border-2 border-indigo-200 dark:border-indigo-900 rounded-lg text-center text-[13px] font-black text-indigo-600 dark:text-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all tabular-nums shadow-sm"
                        />
                    ) : (
                        <span className="text-[14px] font-black text-slate-800 dark:text-slate-100 tabular-nums">{item.quantity}</span>
                    )}
                </div>

                {/* Đơn giá */}
                <div className="flex flex-col md:flex-row md:items-center px-0 md:px-6 py-0 md:py-3.5 md:w-[140px] md:justify-end gap-0.5 md:gap-0 pt-2 border-t border-slate-200/50 dark:border-slate-800 md:border-t-0 md:pt-0">
                    <span className="md:hidden text-[10px] text-slate-400 font-medium tracking-wide uppercase">Đơn giá</span>
                    <span className="text-[14px] font-medium text-slate-600 dark:text-slate-400 tabular-nums">
                        {formatCurrency(item.unitPrice).replace('₫', '').trim()}
                    </span>
                </div>

                {/* Thành tiền */}
                <div className="flex flex-col items-end md:flex-row md:items-center px-0 md:px-6 py-0 md:py-3.5 md:w-[160px] md:justify-end gap-0.5 md:gap-0 pt-2 border-t border-slate-200/50 dark:border-slate-800 md:border-t-0 md:pt-0">
                    <span className="md:hidden text-[10px] text-slate-400 font-medium tracking-wide uppercase">Thành tiền</span>
                    <span className="text-[14px] font-black text-slate-900 dark:text-white tabular-nums">
                        {formatCurrency(item.total).replace('₫', '').trim()}
                    </span>
                </div>
            </div>

            {/* Desktop: Delete Action (Right aligned) */}
            <div className="hidden md:flex px-6 py-3.5 w-[60px] items-center justify-end shrink-0">
                {!readOnly && item.proposedByRole === 'SALE' && (
                    <button
                        onClick={async () => {
                            const confirmed = await confirm({
                                title: 'Xóa hạng mục',
                                message: 'Bạn có chắc muốn xóa mục này khỏi báo giá?',
                                type: 'danger',
                                confirmText: 'Xóa'
                            });
                            if (!confirmed) return;
                            removeItem({ orderId, itemId: item.id });
                        }}
                        disabled={isRemoving}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all active:scale-90"
                        title="Xóa hạng mục"
                    >
                        <Trash2 className="w-4.5 h-4.5" />
                    </button>
                )}
            </div>
        </div>
    );
}
