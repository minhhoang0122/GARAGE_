'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/modules/common/components/layout';
import { ArrowLeft, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { useConfirm } from '@/modules/shared/components/ui/ConfirmModal';
import { useOrderDetail, useCreateWarranty } from '@/modules/sale/hooks/useSale';
import { OrderDetailItem } from '@/modules/sale/services/sale';

export default function CreateWarrantyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const orderId = parseInt(id);
    const { data: order, isLoading } = useOrderDetail(orderId);
    const createWarrantyMutation = useCreateWarranty();
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [currentOdo, setCurrentOdo] = useState<number>(0);
    const confirm = useConfirm();

    useEffect(() => {
        if (order) {
            setCurrentOdo(order.odo || 0);
        }
    }, [order]);

    const toggleItem = (itemId: number) => {
        if (selectedItems.includes(itemId)) {
            setSelectedItems(prev => prev.filter(id => id !== itemId));
        } else {
            setSelectedItems(prev => [...prev, itemId]);
        }
    };

    const handleSubmit = async () => {
        if (selectedItems.length === 0) {
            await confirm({ title: 'Thiếu thông tin', message: 'Vui lòng chọn ít nhất 1 sản phẩm để bảo hành', type: 'warning', confirmText: 'OK', cancelText: '' });
            return;
        }

        const confirmed = await confirm({
            title: 'Tạo đơn bảo hành',
            message: 'Xác nhận tạo đơn bảo hành cho các sản phẩm đã chọn?',
            type: 'info',
            confirmText: 'Tạo'
        });
        if (!confirmed) return;

        createWarrantyMutation.mutate(
            { orderId, itemIds: selectedItems, odo: currentOdo },
            {
                onSuccess: (res: any) => {
                    confirm({ title: 'Thành công', message: 'Tạo đơn bảo hành thành công!', type: 'info', confirmText: 'OK', cancelText: '' });
                    router.replace(`/sale/orders/${res.warrantyOrderId}`);
                },
                onError: (err: any) => {
                    confirm({ title: 'Lỗi', message: err.message, type: 'danger', confirmText: 'Đóng', cancelText: '' });
                }
            }
        );
    };

    const isSubmitting = createWarrantyMutation.isPending;

    if (isLoading) return <div className="p-8 text-center">Đang tải...</div>;
    if (!order) return <div className="p-8 text-center text-red-500">Không tìm thấy đơn hàng</div>;

    // Warranty Validation Logic
    const validateWarranty = (item: OrderDetailItem) => {
        if (!order) return { valid: false, reason: 'No order data' };

        const now = new Date();
        const originalOdo = order.receptionOdo || 0;
        const purchaseDate = new Date(order.subTime);

        if (item.warrantyMonths === 0 && item.warrantyKm === 0) {
            return { valid: false, reason: 'Không áp dụng BH' };
        }

        let dateValid = true;
        let dateReason = "";
        if (item.warrantyMonths > 0) {
            const expiryDate = new Date(purchaseDate);
            expiryDate.setMonth(expiryDate.getMonth() + item.warrantyMonths);
            if (now > expiryDate) {
                dateValid = false;
                dateReason = `Hết hạn thời gian (${expiryDate.toLocaleDateString('vi-VN')})`;
            }
        }

        let kmValid = true;
        let kmReason = "";
        if (item.warrantyKm > 0) {
            const maxOdo = originalOdo + item.warrantyKm;
            if (currentOdo > maxOdo) {
                kmValid = false;
                kmReason = `Quá số KM (${currentOdo.toLocaleString()} > ${maxOdo.toLocaleString()})`;
            }
        }

        return {
            valid: dateValid && kmValid,
            reason: !dateValid ? dateReason : (!kmValid ? kmReason : 'Còn bảo hành')
        };
    };

    const eligibleItems = order.items
        .filter((i: OrderDetailItem) => i.itemStatus !== 'KHACH_TU_CHOI')
        .map((item: OrderDetailItem) => ({
            ...item,
            warranty: validateWarranty(item)
        }));

    return (
        <DashboardLayout title="Tạo Bảo Hành" subtitle={`Từ đơn hàng #${orderId}`}>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <Link href={`/sale/orders/${orderId}`} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Quay lại đơn hàng
                    </Link>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-blue-50/50 dark:bg-blue-900/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="w-6 h-6 text-slate-900 dark:text-white mt-1" />
                            <div>
                                <h3 className="font-semibold text-slate-800 dark:text-slate-100">Chọn sản phẩm / dịch vụ cần bảo hành</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Đơn bảo hành sẽ được tạo mới với giá 0đ cho các mục được chọn.
                                </p>
                            </div>
                        </div>

                        {/* ODO Input */}
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700 shadow-sm ">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Số ODO hiện tại</label>
                            <input
                                type="number"
                                value={currentOdo === 0 ? "" : currentOdo}
                                placeholder="0"
                                onChange={(e) => setCurrentOdo(e.target.value === "" ? 0 : parseInt(e.target.value))}
                                className="w-full text-lg font-bold text-slate-900 dark:text-slate-100 bg-transparent outline-none border-b-2 border-slate-200 dark:border-slate-700 focus:border-slate-900 dark:focus:border-white transition-colors"
                            />
                            {Number(currentOdo) < (order?.odo || 0) && (
                                <p className="text-[10px] text-red-500 mt-1">Không được nhỏ hơn ODO cũ ({order?.odo || 0})</p>
                            )}
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {eligibleItems.map((item: any) => {
                            const isSelected = selectedItems.includes(item.id);
                            const isExpired = !item.warranty.valid;

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => !isExpired && toggleItem(item.id)}
                                    className={`p-4 flex items-center justify-between transition-colors ${isExpired ? 'bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed opacity-75' : isSelected ? 'bg-blue-50 dark:bg-blue-900/30 cursor-pointer' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isExpired ? 'border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800' : isSelected ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'border-slate-300 dark:border-slate-600'}`}>
                                            {isSelected && <CheckCircle2 className="w-4 h-4" />}
                                            {isExpired && <AlertCircle className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                                        </div>
                                        <div>
                                            <p className={`font-medium ${isExpired ? 'text-slate-500 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>{item.productName}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {item.productCode} | SL: {item.quantity}
                                                <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${isExpired ? (item.warranty.reason === 'Không áp dụng BH' ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400') : 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400'}`}>
                                                    {item.warranty.reason}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{formatCurrency(item.total)}</p>
                                        {item.warrantyMonths > 0 || item.warrantyKm > 0 ? (
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Chính sách: {item.warrantyMonths}th / {item.warrantyKm.toLocaleString()}km</p>
                                        ) : (
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">Hết hạn hoặc Không áp dụng BH</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 transition-colors">
                        <button
                            onClick={() => router.push(`/sale/orders/${orderId}`)}
                            className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={selectedItems.length === 0 || isSubmitting}
                            className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 dark:bg-white dark:text-slate-900"
                        >
                            {isSubmitting ? 'Đang xử lý...' : 'Tạo Đơn Bảo Hành'}
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
