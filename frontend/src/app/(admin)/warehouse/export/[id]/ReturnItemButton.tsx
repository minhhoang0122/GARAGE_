'use client';

import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useReturnStock } from '@/modules/warehouse/hooks/useWarehouse';
import { useRouter } from 'next/navigation';
import { useToast } from '@/modules/shared/components/ui/use-toast';

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
    const { toast } = useToast();
    const returnStockMutation = useReturnStock();

    const handleReturn = async () => {
        if (quantity <= 0 || quantity > maxQuantity) return;
        
        returnStockMutation.mutate({ 
            orderId, 
            data: { productId, quantity, reason } 
        }, {
            onSuccess: () => {
                toast({ title: "Thành công", description: 'Hoàn nhập thành công!' });
                setIsOpen(false);
                router.refresh();
            },
            onError: (error: any) => {
                toast({ 
                    title: "Lỗi", 
                    description: error.message || 'Lỗi hoàn trả',
                    variant: "destructive"
                });
            }
        });
    };

    if (disabled) return null;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
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
                                disabled={returnStockMutation.isPending}
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                            >
                                {returnStockMutation.isPending ? 'Đang xử lý...' : 'Xác nhận hoàn nhập'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
