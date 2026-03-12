'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { DashboardLayout } from '@/modules/common/components/layout';
import { Button } from '@/modules/shared/components/ui/button';
import { SearchInput } from '@/modules/shared/components/ui/search-input';
import { EmptyState } from '@/modules/shared/components/ui/empty-state';
import { TableSkeleton } from '@/modules/shared/components/ui/table-skeleton';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Search, Package, AlertTriangle, RefreshCw, Eye } from 'lucide-react';

interface Batch {
    id: number;
    importDate: string;
    expiryDate: string;
    initialQty: number;
    remainingQty: number;
    supplier: string;
}

interface Product {
    id: number;
    name: string;
    code: string;
    stock: number;
    price: number;
    isService: boolean;
    minStock: number;
    batches?: Batch[];
}

export default function WarehouseInventoryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { data: session } = useSession();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    async function loadProducts(searchTerm = '') {
        setLoading(true);
        try {
            // @ts-ignore
            const token = session?.user?.accessToken;
            if (!token) return;

            // Use cached API for instant load
            const res = await api.getCached(`/warehouse/products?search=${searchTerm}`, token);
            // Filter only parts (not services)
            setProducts((res || []).filter((p: Product) => !p.isService));
        } catch (error) {
            console.error('Failed to load products', error);
        } finally {
            setLoading(false);
            setIsFirstLoad(false);
        }
    }

    // @ts-ignore
    const searchedToken = session?.user?.accessToken as string;


    // Effect: Reload when URL search params change
    useEffect(() => {
        // @ts-ignore
        if (session?.user?.accessToken) {
            const query = searchParams.get('q') || '';
            loadProducts(query);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, searchParams]);



    const lowStockCount = products.filter(p => p.stock <= (p.minStock || 5)).length;

    return (
        <DashboardLayout title="Tồn kho" subtitle="Danh sách phụ tùng trong kho">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <Package className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Tổng mặt hàng</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{products.length}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Sắp hết hàng</p>
                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{lowStockCount}</p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 transition-colors">
                    <div className="flex gap-4 items-center">
                        <div className="relative flex-1">
                            <SearchInput
                                placeholder="Tìm theo tên hoặc mã sản phẩm..."
                                className="max-w-md"
                            />
                        </div>
                        <Button variant="outline" type="button" onClick={() => loadProducts(searchParams.get('q') || '')} disabled={loading}>
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>

                {/* Products Table */}
                {/* Products Table */}
                {loading ? (
                    <TableSkeleton rows={8} columns={5} />
                ) : products.length === 0 ? (
                    <EmptyState
                        title="Kho hàng trống"
                        description={searchParams.get('q') ? `Không tìm thấy phụ tùng nào với từ khóa "${searchParams.get('q')}"` : "Hiện chưa có phụ tùng nào trong kho."}
                        icon={Package}
                        actionLabel="Nhập kho ngay"
                        onAction={() => router.push('/warehouse/import')}
                    />
                ) : (
                    <>
                        {/* Desktop Table View - Industrial Style */}
                        <div className="hidden md:block bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-x-auto transition-colors">
                            <table className="w-full min-w-[800px]">
                                <thead className="bg-slate-50 dark:bg-slate-950 border-b-2 border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-xs">Mã PT</th>
                                        <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-xs">Tên phụ tùng</th>
                                        <th className="text-right p-4 font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-xs">Tồn kho</th>
                                        <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-xs">Đơn vị</th>
                                        <th className="text-right p-4 font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-xs">Giá bán</th>
                                        <th className="p-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 h-14 transition-colors group">
                                            <td className="p-4 text-slate-600 dark:text-slate-400 font-mono text-sm font-semibold align-middle group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                                {product.code}
                                            </td>
                                            <td className="p-4 font-semibold text-slate-800 dark:text-slate-200 align-middle">
                                                {product.name}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="text-right">
                                                    {product.stock <= (product.minStock || 5) ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-100 dark:border-red-900/50">
                                                            Alert: {product.stock}
                                                        </span>
                                                    ) : (
                                                        <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                                                            {product.stock}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-500 dark:text-slate-400 text-sm align-middle">cái</td>
                                            <td className="p-4 text-right font-bold font-mono text-slate-800 dark:text-slate-200 align-middle">
                                                {formatCurrency(product.price)}
                                            </td>
                                            <td className="p-4 text-center align-middle">
                                                <Link href={`/warehouse/inventory/${product.id}/batches`}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 flex items-center gap-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-medium"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        <span className="hidden lg:inline">Chi tiết lô</span>
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden grid grid-cols-1 gap-3">
                            {products.map((product) => (
                                <div key={product.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 flex gap-4 active:scale-[0.98] transition-transform">
                                    {/* Icon Box */}
                                    <div className={`w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center border ${product.stock <= (product.minStock || 5) ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                        <Package className="w-6 h-6" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base line-clamp-1 mr-2">{product.name}</h3>
                                            <span className="font-bold text-slate-900 dark:text-white text-base whitespace-nowrap">{formatCurrency(product.price)}</span>
                                        </div>

                                        <p className="text-xs font-mono font-bold text-slate-500 mb-2">{product.code}</p>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 mt-1">
                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Đơn vị: Cái</span>
                                            <div className="flex items-center gap-2">
                                                <Link href={`/warehouse/inventory/${product.id}/batches`}>
                                                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-slate-900 dark:text-white px-2 uppercase tracking-wide border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                        <Eye className="w-3 h-3 mr-1" /> Chi tiết
                                                    </Button>
                                                </Link>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tồn:</span>
                                                    {product.stock <= (product.minStock || 5) ? (
                                                        <span className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-black border border-red-200 dark:border-red-800">
                                                            {product.stock}
                                                        </span>
                                                    ) : (
                                                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black border border-slate-200 dark:border-slate-700">
                                                            {product.stock}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout >
    );
}
