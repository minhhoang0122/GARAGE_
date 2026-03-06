'use client';

import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { returnStock } from '@/modules/inventory/warehouse';
import { useRouter } from 'next/navigation';

interface ReturnItemButtonProps {
    orderId: number;
    productId: number;
    productName: string;
    maxQuantity: number;
    disabled?: boolean;
}

export default function ReturnItemButton({ orderId, productId, productName, maxQuantity, disabled }: ReturnItemButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [reason, setReason] = useState('Thừa không dùng');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleReturn = async () => {
        if (quantity <= 0 || quantity > maxQuantity) return;
        setLoading(true);
        try {
            const res = await returnStock(orderId, productId, quantity, reason);
            if (res.success) {
                setIsOpen(false);
                router.refresh();
            } else {
                alert(res.error || 'Lỗi hoàn trả');
            }
        } catch (e) {
            alert('Lỗi kết nối');
        } finally {
            setLoading(false);
        }
    };

    if (disabled) return null;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors title='Hoàn nhập kho'"
                title="Hoàn nhập hàng thừa"
            >
                <RotateCcw className="w-4 h-4" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">Hoàn nhập linh kiện</h3>
                            <p className="text-sm text-slate-500 mt-1">{productName}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Số lượng hoàn trả (Tối đa: {maxQuantity})
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={maxQuantity}
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Lý do hoàn trả
                                </label>
                                <select
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="Thừa không dùng">Thừa không dùng</option>
                                    <option value="Xuất nhầm mã">Xuất nhầm mã</option>
                                    <option value="Đổi phụ tùng khác">Đổi phụ tùng khác</option>
                                </select>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleReturn}
                                disabled={loading}
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Đang xử lý...' : 'Xác nhận hoàn nhập'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
