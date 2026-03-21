'use client';

import { OrderDetailItem, updateOrderItem, removeOrderItem, toggleItemStatus } from '@/modules/service/order';
import { Trash2, Check, X, ChevronRight, Save, Loader2, ShieldCheck } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useConfirm } from '@/modules/shared/components/ui/ConfirmModal';
import { useToast } from '@/contexts/ToastContext';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import { useOrderWorkspaceOptional } from './OrderWorkspaceProvider';

interface OrderItemsTableProps {
    items: OrderDetailItem[];
    orderId: number;
    readOnly?: boolean;
    token?: string;
}

/**
 * OrderItemsTable Ver 3.0 - Pixel Perfect & Global Edit
 * - Giao diện rộng rãi (min-w-1200px) đảm bảo không bị "nuốt" cột.
 * - Chế độ chỉnh sửa tập trung (Global Edit) giúp quản lý báo giá chuyên nghiệp.
 * - Cột Xóa Sticky với hiệu ứng Glassmorphism tinh tế.
 */
export default function OrderItemsTable({ items: serverItems, orderId, readOnly = false, token }: OrderItemsTableProps) {
    const workspace = useOrderWorkspaceOptional();
    const displayItems = workspace ? workspace.items : serverItems;
    const router = useRouter();
    const confirm = useConfirm();
    const { showToast } = useToast();
    const [isGlobalEditing, setIsGlobalEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Chứa dữ liệu thay đổi tạm thời: { [itemId]: { quantity, discountPercent } }
    const [editData, setEditData] = useState<Record<string, { quantity: number; discountPercent: number }>>({});

    const handleUpdateLocal = (id: number, field: 'quantity' | 'discountPercent', value: number) => {
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
        setIsSaving(true);
        try {
            const updatePromises = Object.entries(editData).map(([id, data]) => 
                updateOrderItem(Number(id), data)
            );
            await Promise.all(updatePromises);
            showToast('success', 'Đã lưu tất cả thay đổi');
            setIsGlobalEditing(false);
            setEditData({});
            router.refresh();
        } catch (error) {
            showToast('error', 'Có lỗi khi lưu thay đổi hàng loạt');
        } finally {
            setIsSaving(false);
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
            {/* Toolbar Heading */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-blue-600 rounded-full" />
                    <h2 className="text-[15px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        Hạng mục dịch vụ
                        <span className="text-sm font-normal text-slate-400 lowercase italic">({displayItems.length} món)</span>
                    </h2>
                </div>
                
                {!readOnly && (
                    <div className="flex items-center gap-2">
                        {isGlobalEditing ? (
                            <>
                                <button
                                    onClick={handleSaveAll}
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-200 active:scale-95 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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

            {/* Table Container - Extreme Space Optimization */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-[13px]">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="data-table w-full text-left min-w-[850px] table-fixed">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="w-[50px] px-4 py-3.5 !text-center">
                                    <div className="w-3 h-3 rounded border border-slate-300 dark:border-slate-600 mx-auto" />
                                </th>
                                <th className="pl-6 pr-4 py-3.5 text-[10px] font-black text-slate-400 uppercase !text-left">Hạng mục</th>
                                <th className="w-[70px] px-4 py-3.5 !text-right text-[10px] font-black text-slate-400 uppercase">SL</th>
                                <th className="w-[150px] px-4 py-3.5 !text-right text-[10px] font-black text-slate-400 uppercase">Đơn giá</th>
                                <th className="w-[180px] px-4 py-3.5 !text-right text-[10px] font-black text-slate-400 uppercase">Thành tiền</th>
                                <th className="w-[80px] px-4 py-3.5 !text-center text-[10px] font-black text-slate-400 uppercase">Xóa</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
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
                        </tbody>
                    </table>
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
    editValue?: { quantity: number; discountPercent: number },
    onUpdate: (id: number, field: 'quantity' | 'discountPercent', value: number) => void,
    readOnly: boolean,
    token?: string
}) {
    const router = useRouter();
    const confirm = useConfirm();
    const { showToast } = useToast();
    const workspace = useOrderWorkspaceOptional();

    const [localStatus, setLocalStatus] = useState(item.itemStatus);
    const [lastServerStatus, setLastServerStatus] = useState(item.itemStatus);

    // Đồng bộ lại local status MỘT CÁCH THÔNG MINH:
    // Chỉ cập nhật localStatus khi thực sự server trả về dữ liệu MỚI (khác với lần cuối cùng chúng ta biết)
    if (item.itemStatus !== lastServerStatus) {
        setLocalStatus(item.itemStatus);
        setLastServerStatus(item.itemStatus);
    }
    
    // Sửa dụng status từ Context nếu có
    const currentStatus = workspace ? item.itemStatus : localStatus;

    const abortRef = useRef<AbortController | null>(null);

    const isRejected = currentStatus === 'KHACH_TU_CHOI';
    const isApproved = currentStatus !== 'KHACH_TU_CHOI'; // Hiển thị checked cho cả DE_XUAT và KHACH_DONG_Y

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    return (
        <tr className={`group transition-all hover:bg-slate-50/80 dark:hover:bg-slate-800/50 ${isRejected ? 'opacity-40' : ''}`}>
            {/* 1. Tuyển chọn */}
            <td className="px-4 py-3.5 w-[50px] text-center">
                <button
                    disabled={readOnly}
                    onClick={() => {
                        if (readOnly) return;
                        
                        // 1. UI update NGAY LẬP TỨC 
                        const prevStatus = currentStatus;
                        const nextStatus = currentStatus === 'KHACH_TU_CHOI' ? 'KHACH_DONG_Y' : 'KHACH_TU_CHOI';
                        
                        // Cập nhật Workspace Context hoặc Local State fallback
                        if (workspace) {
                            workspace.updateItemStatusLocal(item.id, nextStatus);
                        } else {
                            setLocalStatus(nextStatus);
                        }
                        
                        // Cập nhật mốc server giả định trước để lúc render nó không bị đè về trạng thái cũ 
                        // trong khi chờ router.refresh() (đợi ~500ms -> 1s).
                        setLastServerStatus(nextStatus);

                        // 2. Hủy request cũ nếu click quá nhanh
                        if (abortRef.current) {
                            abortRef.current.abort();
                        }
                        const controller = new AbortController();
                        abortRef.current = controller;
 
                        // 3. Chuẩn bị hàm gọi API cập nhật
                        if (!token) {
                            showToast('error', 'Phiên làm việc hết hạn. Vui lòng tải lại trang.');
                            if (workspace) workspace.updateItemStatusLocal(item.id, prevStatus);
                            else setLocalStatus(prevStatus);
                            setLastServerStatus(prevStatus);
                            return;
                        }

                        const executeUpdate = async () => {
                            try {
                                await api.patch(`/sale/items/${item.id}/status`, { status: nextStatus }, token, controller.signal);
                            } catch (err: any) {
                                if (err.name === 'AbortError') return;
                                
                                // Lỗi thật: Rollback
                                if (workspace) {
                                    workspace.updateItemStatusLocal(item.id, prevStatus);
                                } else {
                                    setLocalStatus(prevStatus);
                                }
                                setLastServerStatus(prevStatus);
                                showToast('error', 'Đồng bộ trạng thái thất bại');
                                throw err; // Re-throw để startCalculation biết là fail
                            }
                        };

                        // 4. Nếu có workspace context, uỷ quyền cho workspace hiển thị loading ở Summary và refresh state
                        if (workspace) {
                            workspace.startCalculation(executeUpdate);
                        } else {
                            // Fallback khi không có workspace
                            executeUpdate().catch(() => {});
                        }
                    }}
                    title={isApproved ? "Bỏ duyệt" : "Duyệt hạng mục"}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                >
                    <div 
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 
                        ${isApproved ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'}
                        hover:scale-105 shadow-sm`}
                    >
                        {isApproved ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                    </div>
                </button>
            </td>

            {/* 2. Thông tin */}
            <td className="pl-6 pr-4 py-3.5 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <div className="font-bold text-slate-800 dark:text-slate-100 text-[13px] leading-tight truncate max-w-[240px]" title={item.productName}>
                        {item.productName}
                    </div>
                    {isRejected && (
                        <span className="px-1.5 py-0.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[9px] font-black uppercase rounded shrink-0 ring-1 ring-orange-100 dark:ring-orange-800">
                            Khách không duyệt
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1.5 overflow-hidden mb-1">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded uppercase shrink-0">{item.productCode}</span>
                    <span className={`text-[9px] font-bold px-1 py-0.5 rounded uppercase shrink-0 ${item.isService ? 'text-blue-600 bg-blue-50' : 'text-emerald-600 bg-emerald-50'}`}>
                        {item.isService ? 'DV' : 'PT'}
                    </span>
                </div>
                {item.proposedByName && (
                    <div className="text-[10px] text-slate-400 italic flex items-center gap-1 mb-1">
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
            </td>

            {/* 3. Số lượng */}
            <td className="px-4 py-3.5 w-[70px] text-right">
                {isGlobalEditing ? (
                    <div className="flex justify-end">
                        <input
                            type="number"
                            min="1"
                            value={editValue?.quantity ?? item.quantity}
                            onChange={(e) => onUpdate(item.id, 'quantity', Number(e.target.value))}
                            className="w-12 h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-center text-[13px] font-black text-blue-600 focus:border-blue-500 outline-none transition-all tabular-nums"
                        />
                    </div>
                ) : (
                    <span className="text-[14px] font-black text-slate-800 dark:text-slate-100 tabular-nums">{item.quantity}</span>
                )}
            </td>

            {/* 4. Đơn giá */}
            <td className="px-4 py-3.5 w-[150px] text-right">
                <span className="text-[14px] font-medium text-slate-600 dark:text-slate-400 tabular-nums">
                    {formatCurrency(item.unitPrice).replace('₫', '').trim()}
                </span>
            </td>

            {/* 5. Giảm giá & 6. VAT (Hidden in Phase 9) */}
            {/* <td className="px-2 py-4 text-center">
                {isGlobalEditing ? (
                    <div className="relative inline-block">
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={editValue?.discountPercent ?? item.discountPercent}
                            onChange={(e) => onUpdate(item.id, 'discountPercent', Number(e.target.value))}
                            className="w-12 h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-center text-[13px] font-bold text-red-600 focus:border-red-500 outline-none transition-all"
                        />
                    </div>
                ) : (
                    item.discountPercent > 0 ? (
                        <span className="px-1.5 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded text-[10px] font-black tabular-nums">
                            -{item.discountPercent}%
                        </span>
                    ) : (
                        <span className="text-slate-200 dark:text-slate-800">—</span>
                    )
                )}
            </td>

            <td className="px-2 py-4 text-center text-[12px] text-slate-400 tabular-nums font-medium">
                {item.vatRate || 10}%
            </td> */}

            {/* 7. Thành tiền */}
            <td className="px-4 py-3.5 w-[180px] text-right">
                <span className="text-[15px] font-black text-slate-900 dark:text-white tabular-nums">
                    {formatCurrency(item.total).replace('₫', '').trim()}
                </span>
            </td>

            {/* 8. Action Xóa */}
            <td className="px-4 py-3.5 w-[80px] text-center">
                {!readOnly && (
                    <button
                        onClick={async () => {
                            const confirmed = await confirm({
                                title: 'Xóa hạng mục',
                                message: 'Bạn có chắc muốn xóa mục này khỏi báo giá?',
                                type: 'danger',
                                confirmText: 'Xóa'
                            });
                            if (!confirmed) return;
                            try {
                                await removeOrderItem(item.id);
                                showToast('success', 'Đã xóa hạng mục');
                                router.refresh();
                            } catch (e) {
                                showToast('error', 'Lỗi khi xóa hạng mục');
                            }
                        }}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all active:scale-90"
                        title="Xóa hạng mục"
                    >
                        <Trash2 className="w-4.5 h-4.5" />
                    </button>
                )}
            </td>
        </tr>
    );
}