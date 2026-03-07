'use client';

import { OrderDetailItem } from '@/modules/service/order';
import { updateOrderItem, removeOrderItem, toggleItemStatus } from '@/modules/service/order';
import { Trash2, Edit2, Check, X, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConfirm } from '@/modules/shared/components/ui/ConfirmModal';

interface OrderItemsTableProps {
    items: OrderDetailItem[];
    readOnly?: boolean;
}

export default function OrderItemsTable({ items, readOnly = false }: OrderItemsTableProps) {
    if (items.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400">
                <p>Chưa có hạng mục nào trong báo giá.</p>
                <p className="text-sm">Hãy tìm kiếm và thêm phụ tùng hoặc dịch vụ ở trên.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        {!readOnly && <th className="px-4 py-4 w-12 text-center">Duyệt</th>}
                        <th className="px-4 py-4 min-w-[200px]">Mã / Tên hàng</th>
                        <th className="px-4 py-4 w-20 text-center">SL</th>
                        <th className="px-4 py-4 w-32 text-right">Đơn giá</th>
                        <th className="px-4 py-4 w-24 text-center">Giảm (%)</th>
                        <th className="px-4 py-4 w-24 text-center">VAT (%)</th>
                        <th className="px-4 py-4 w-36 text-right">Thành tiền</th>
                        {!readOnly && <th className="px-4 py-4 w-24 text-right"></th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {items.map((item) => (
                        <EditableRow key={item.id} item={item} readOnly={readOnly} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function EditableRow({ item, readOnly }: { item: OrderDetailItem, readOnly: boolean }) {
    const router = useRouter();
    const confirm = useConfirm();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Edit state
    const [quantity, setQuantity] = useState(item.quantity);
    const [discountPercent, setDiscountPercent] = useState(item.discountPercent);

    const isApproved = item.itemStatus === 'KHACH_DONG_Y';
    const isRejected = item.itemStatus === 'KHACH_TU_CHOI';
    const isProposed = item.itemStatus === 'DE_XUAT';

    // Checkbox is checked if Approved. 
    // If Proposed, it is unchecked, but we show special UI
    const isChecked = isApproved;

    // Tính giá sau giảm để cảnh báo giá sàn
    const priceAfterDiscount = item.unitPrice * (1 - discountPercent / 100);
    const isBelowFloor = item.floorPrice > 0 && priceAfterDiscount < item.floorPrice;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateOrderItem(item.id, { quantity, discountPercent });
            setIsEditing(false);
            router.refresh();
        } catch (error) {
            alert('Lỗi cập nhật');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemove = async () => {
        const confirmed = await confirm({
            title: 'Xóa hạng mục',
            message: 'Bạn có chắc muốn xóa mục này khỏi báo giá?',
            type: 'danger',
            confirmText: 'Xóa'
        });
        if (!confirmed) return;

        setIsSaving(true);
        try {
            await removeOrderItem(item.id);
            router.refresh();
        } catch (error) {
            await confirm({ title: 'Lỗi', message: 'Lỗi xóa mục', type: 'danger', confirmText: 'Đóng', cancelText: '' });
            setIsSaving(false);
        }
    };

    const handleToggleApprove = async () => {
        setIsSaving(true);
        const originalStatus = item.itemStatus;
        const optimisticStatus = originalStatus === 'KHACH_DONG_Y' ? 'KHACH_TU_CHOI' : 'KHACH_DONG_Y';

        // Optimistic UI update via router refresh or local state
        item.itemStatus = optimisticStatus;

        try {
            await toggleItemStatus(item.id, originalStatus);
            router.refresh();
        } catch (error) {
            // Revert on failure
            item.itemStatus = originalStatus;
            alert('Lỗi cập nhật');
        } finally {
            setIsSaving(false);
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    return (
        <tr className={`hover:bg-slate-50 dark:hover:bg-slate-800 
            ${isRejected ? 'opacity-50 bg-slate-50 dark:bg-slate-800/50' : ''}
            ${isProposed ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''}
        `}>
            {/* Checkbox Duyệt */}
            {!readOnly && (
                <td className="px-4 py-4 text-center">
                    <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={handleToggleApprove}
                        disabled={isSaving}
                        className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-500 cursor-pointer"
                    />
                </td>
            )}

            {/* Tên hàng */}
            <td className="px-4 py-4">
                <div className={`font-medium ${isRejected ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
                    {item.productName}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{item.productCode}</div>
                <div className="flex gap-1 mt-1">
                    {item.isService && <span className="text-[10px] bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded">Dịch vụ</span>}
                    {isRejected && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Khách từ chối</span>}
                    {isProposed && <span className="text-[10px] bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300 px-1.5 py-0.5 rounded">Phát sinh mới</span>}
                </div>
            </td>

            {/* Số lượng */}
            <td className="px-4 py-4 text-center">
                {isEditing ? (
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-16 border dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                ) : (
                    <span className="font-medium text-slate-800 dark:text-slate-100">{item.quantity}</span>
                )}
            </td>

            {/* Đơn giá */}
            <td className="px-4 py-4 text-right text-slate-600 dark:text-slate-300">
                {formatCurrency(item.unitPrice)}
            </td>

            {/* Giảm giá */}
            <td className="px-4 py-4 text-center">
                {isEditing ? (
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center justify-center gap-1">
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={discountPercent}
                                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                                className={`w-14 border rounded px-1 py-1 text-center focus:ring-2 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white ${isBelowFloor ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
                            />
                            <span className="text-slate-700 dark:text-slate-300">%</span>
                        </div>
                        {isBelowFloor && (
                            <div className="flex items-center gap-1 text-xs text-red-600">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Dưới giá sàn!</span>
                            </div>
                        )}
                    </div>
                ) : (
                    item.discountPercent > 0 ? (
                        <span className="text-red-600 font-medium">-{item.discountPercent}%</span>
                    ) : (
                        <span className="text-slate-400 dark:text-slate-500">-</span>
                    )
                )}
            </td>

            {/* VAT */}
            <td className="px-4 py-4 text-center text-slate-500 dark:text-slate-400">
                {item.vatRate ?? 10}%
            </td>

            {/* Thành tiền */}
            <td className="px-4 py-4 text-right font-semibold text-slate-800 dark:text-slate-100">
                {formatCurrency(item.total)}
                {item.discountAmount > 0 && !isEditing && (
                    <div className="text-xs text-red-500 line-through font-normal">
                        {formatCurrency(item.unitPrice * item.quantity)}
                    </div>
                )}
            </td>

            {/* Actions */}
            {!readOnly && (
                <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"
                                    title="Lưu"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => { setIsEditing(false); setQuantity(item.quantity); setDiscountPercent(item.discountPercent); }}
                                    disabled={isSaving}
                                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                                    title="Hủy"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                                    title="Sửa SL/Giảm giá"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleRemove}
                                    className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                    title="Xóa"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>
                </td>
            )}
        </tr>
    );
}
