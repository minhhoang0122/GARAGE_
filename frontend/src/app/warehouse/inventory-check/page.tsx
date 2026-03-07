'use client';

import { Suspense, useState, useEffect } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { Search, Save, RefreshCw, AlertCircle, CheckCircle2, History } from 'lucide-react';
import { adjustStock } from '@/modules/inventory/warehouse';
import { useConfirm } from '@/modules/shared/components/ui/ConfirmModal';

type Product = {
    id: number;
    code: string;
    name: string;
    price: number;
    stock: number;
    minStock: number;
};

export default function InventoryCheckPage() {
    return (
        <DashboardLayout title="Kiểm kê kho" subtitle="Đối soát tồn kho thực tế và hệ thống">
            <Suspense fallback={<div>Loading...</div>}>
                <InventoryCheckContent />
            </Suspense>
        </DashboardLayout>
    );
}

function InventoryCheckContent() {
    const { data: session } = useSession();
    const token = (session?.user as any)?.accessToken;

    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Editing state
    const [actuals, setActuals] = useState<Record<number, number>>({});
    const [reasons, setReasons] = useState<Record<number, string>>({});
    const [processingId, setProcessingId] = useState<number | null>(null);
    const confirm = useConfirm();

    useEffect(() => {
        if (!token) return;
        loadProducts();
    }, [token]);

    const loadProducts = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/inventory-check/products', token);
            // API returns ProductDTO list
            // Backend Controller: warehouseService.getProducts("")
            // returns ProductDTO { id, code, name, stock, ... }
            setProducts(res);
            setFilteredProducts(res);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Lỗi tải dữ liệu sản phẩm' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const lower = searchTerm.toLowerCase();
        const filtered = products.filter(p =>
            p.code.toLowerCase().includes(lower) ||
            p.name.toLowerCase().includes(lower)
        );
        setFilteredProducts(filtered);
    }, [searchTerm, products]);

    const handleActualChange = (id: number, val: string) => {
        const num = parseInt(val);
        if (isNaN(num)) return;
        setActuals(prev => ({ ...prev, [id]: num }));
    };

    const handleReasonChange = (id: number, val: string) => {
        setReasons(prev => ({ ...prev, [id]: val }));
    };

    const handleAdjust = async (p: Product) => {
        const actual = actuals[p.id];
        const reason = reasons[p.id];

        if (actual === undefined || actual === p.stock) {
            setMessage({ type: 'error', text: 'Số lượng thực tế chưa thay đổi' });
            return;
        }

        if (!reason || reason.trim().length < 5) {
            setMessage({ type: 'error', text: 'Vui lòng nhập lý do điều chỉnh (tối thiểu 5 ký tự)' });
            return;
        }

        const confirmed = await confirm({
            title: 'Điều chỉnh tồn kho',
            message: `Xác nhận điều chỉnh tồn kho cho ${p.code}?\n\nHệ thống: ${p.stock}\nThực tế: ${actual}\nLý do: ${reason}`,
            type: 'warning',
            confirmText: 'Xác nhận'
        });
        if (!confirmed) return;

        setProcessingId(p.id);
        setMessage(null);

        const res = await adjustStock(p.id, actual, reason);

        if (res.success) {
            setMessage({ type: 'success', text: `Đã cập nhật tồn kho cho ${p.name}` });
            // Update local state
            const updated = products.map(prod => prod.id === p.id ? { ...prod, stock: actual } : prod);
            setProducts(updated);
            // Clear inputs
            setActuals(prev => {
                const n = { ...prev };
                delete n[p.id];
                return n;
            });
            setReasons(prev => {
                const n = { ...prev };
                delete n[p.id];
                return n;
            });
        } else {
            setMessage({ type: 'error', text: res.error || 'Lỗi điều chỉnh' });
        }
        setProcessingId(null);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm phụ tùng (Mã, Tên)..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm text-slate-900 dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button
                    onClick={loadProducts}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span className="text-sm font-medium">Tải lại</span>
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-3">Mã VT</th>
                                <th className="px-6 py-3">Tên Phụ Tùng</th>
                                <th className="px-6 py-3 text-center w-32">Tồn Hệ Thống</th>
                                <th className="px-6 py-3 text-center w-32">Tồn Thực Tế</th>
                                <th className="px-6 py-3 w-64">Lý Do Điều Chỉnh</th>
                                <th className="px-6 py-3 text-right w-32">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading...</td></tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-500">Không tìm thấy phụ tùng nào</td></tr>
                            ) : (
                                filteredProducts.map(p => {
                                    const actual = actuals[p.id];
                                    const reason = reasons[p.id] || '';
                                    const diff = actual !== undefined ? actual - p.stock : 0;
                                    const hasDiff = diff !== 0 && actual !== undefined;
                                    const isProcessing = processingId === p.id;

                                    return (
                                        <tr key={p.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${hasDiff ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                                            <td className="px-6 py-3 font-medium text-slate-700 dark:text-slate-300">{p.code}</td>
                                            <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{p.name}</td>
                                            <td className="px-6 py-3 text-center font-bold text-slate-700 dark:text-slate-200">{p.stock}</td>
                                            <td className="px-6 py-3">
                                                <input
                                                    type="number"
                                                    className={`w-full text-center px-2 py-1 border rounded-lg focus:ring-2 focus:outline-none dark:bg-slate-800 dark:text-white ${hasDiff ? 'border-amber-500 ring-amber-200 dark:border-amber-700' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'}`}
                                                    placeholder={p.stock.toString()}
                                                    value={actual !== undefined ? actual : ''}
                                                    onChange={(e) => handleActualChange(p.id, e.target.value)}
                                                />
                                                {hasDiff && (
                                                    <div className={`text-xs mt-1 font-bold text-center ${diff > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                        {diff > 0 ? '+' : ''}{diff}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-3">
                                                <input
                                                    type="text"
                                                    className="w-full px-2 py-1 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                    placeholder="Nhập lý do..."
                                                    value={reason}
                                                    onChange={(e) => handleReasonChange(p.id, e.target.value)}
                                                    disabled={!hasDiff}
                                                />
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <button
                                                    onClick={() => handleAdjust(p)}
                                                    disabled={!hasDiff || !reason || isProcessing}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${hasDiff && reason
                                                        ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                                                        : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {isProcessing ? 'Lưu...' : 'Cập nhật'}
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
