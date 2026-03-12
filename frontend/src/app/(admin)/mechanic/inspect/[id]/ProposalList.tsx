'use client';

import { useState, useEffect } from 'react';
import { Package, Wrench, Trash2, Send, Loader2, CheckCircle2 } from 'lucide-react';
import ProductSearchMechanic from './ProductSearchMechanic';
import { submitProposal, removeItemFromProposal } from '@/modules/service/mechanic';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { useConfirm } from '@/modules/shared/components/ui/ConfirmModal';

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
};

type SavedItem = {
    id: number;
    productId: number;
    productCode: string;
    productName: string;
    quantity: number;
    isService: boolean;
};

interface ProposalListProps {
    receptionId: number;
    initialItems: SavedItem[];
}

export default function ProposalList({ receptionId, initialItems }: ProposalListProps) {
    const [items, setItems] = useState<ProposalItem[]>([]);
    const [savedItems, setSavedItems] = useState<SavedItem[]>(initialItems);
    const [submitting, setSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const router = useRouter();
    const { showToast } = useToast();
    const confirm = useConfirm();

    // Sync state with props when router.refresh() completes
    useEffect(() => {
        setSavedItems(initialItems);
    }, [initialItems]);

    const handleAddProduct = (product: Product) => {
        // Kiểm tra đã có trong danh sách mới chưa
        const existingIndex = items.findIndex(i => i.product.id === product.id);
        if (existingIndex >= 0) {
            const newItems = [...items];
            newItems[existingIndex].quantity += 1;
            setItems(newItems);
            return;
        }
        setItems([...items, { product, quantity: 1 }]);
    };

    const handleUpdateQuantity = (index: number, quantity: number) => {
        if (quantity <= 0) {
            handleRemoveItem(index);
            return;
        }
        const newItems = [...items];
        newItems[index].quantity = quantity;
        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleRemoveSavedItem = async (itemId: number) => {
        const confirmed = await confirm({
            title: 'Xóa hạng mục',
            message: 'Bạn có chắc muốn xóa hạng mục này?',
            type: 'danger',
            confirmText: 'Xóa'
        });
        if (!confirmed) return;

        setIsDeleting(itemId);
        // Optimistic delete
        const previousSaved = [...savedItems];
        setSavedItems(savedItems.filter(i => i.id !== itemId));

        try {
            const result = await removeItemFromProposal(itemId, receptionId);
            if (result.success) {
                showToast('success', 'Đã xóa hạng mục thành công');
                router.refresh();
            } else {
                setSavedItems(previousSaved); // Rollback
                showToast('error', 'Lỗi: ' + result.error);
            }
        } catch (error) {
            setSavedItems(previousSaved); // Rollback
            showToast('error', 'Lỗi hệ thống');
        } finally {
            setIsDeleting(null);
        }
    };

    const handleSubmit = async () => {
        if (items.length === 0) {
            showToast('warning', 'Vui lòng thêm ít nhất 1 hạng mục đề xuất');
            return;
        }

        setSubmitting(true);
        try {
            const result = await submitProposal(
                receptionId,
                items.map(i => ({ productId: i.product.id, quantity: i.quantity }))
            );

            if (result.success) {
                // Update with Real Data from Server immediately
                if (result.items) {
                    // Need to cast or ensure type match
                    const newItems = result.items as SavedItem[];
                    setSavedItems(newItems);
                } else {
                    // Fallback
                    router.refresh();
                }

                setItems([]);
                showToast('success', 'Đã gửi đề xuất thành công!');

                router.refresh();
            } else {
                showToast('error', 'Lỗi: ' + result.error);
            }
        } catch (error: any) {
            showToast('error', 'Lỗi hệ thống');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* 1. Danh sách đã đề xuất (Đã lưu) */}
            {savedItems.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-emerald-50/50">
                        <h3 className="font-semibold text-emerald-800 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            Đã đề xuất ({savedItems.length})
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[700px]">
                            <tbody className="divide-y divide-slate-100">
                                {savedItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-slate-800">{item.productName}</p>
                                            <p className="text-sm text-slate-500">{item.productCode}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${item.isService ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {item.isService ? <Wrench className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                                                {item.isService ? 'Dịch vụ' : 'Phụ tùng'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center font-medium">
                                            SL: {item.quantity}
                                        </td>
                                        <td className="px-6 py-4 text-center w-20">
                                            <button
                                                onClick={() => handleRemoveSavedItem(item.id)}
                                                disabled={isDeleting === item.id}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                title="Xóa"
                                            >
                                                {isDeleting === item.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 2. Form thêm mới */}
            <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-3">Thêm hạng mục mới</h3>
                    <ProductSearchMechanic onSelect={handleAddProduct} />
                </div>

                {/* Danh sách đang soạn */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800">
                            Đề xuất mới ({items.length})
                        </h3>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || items.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-95 dark:bg-white dark:text-slate-900"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" /> Gửi đề xuất
                                </>
                            )}
                        </button>
                    </div>

                    {items.length === 0 ? (
                        <div className="px-6 py-12 text-center text-slate-500">
                            <p className="text-sm">Chọn phụ tùng/dịch vụ ở trên để thêm vào danh sách này</p>
                        </div>
                    ) : (
                        <table className="w-full min-w-[800px]">
                            <tbody className="divide-y divide-slate-100">
                                {items.map((item, index) => (
                                    <tr key={item.product.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-slate-800">{item.product.name}</p>
                                            <p className="text-sm text-slate-500">{item.product.code}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${item.product.isService ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {item.product.isService ? 'Dịch vụ' : 'Phụ tùng'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleUpdateQuantity(index, parseInt(e.target.value) || 0)}
                                                className="w-16 border border-slate-300 rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleRemoveItem(index)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
