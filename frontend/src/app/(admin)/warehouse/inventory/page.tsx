'use client';

import { useState, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
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

import { useQuery } from '@tanstack/react-query';

export default function WarehouseInventoryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { data: session } = useSession();
    // @ts-ignore
    const token = session?.user?.accessToken;
    const query = searchParams.get('q') || '';

    const { data: products = [], isLoading: loading, refetch } = useQuery<Product[]>({
        queryKey: ['warehouse', 'products', query],
        queryFn: () => api.get(`/warehouse/products?search=${query}`, token),
        enabled: !!token,
        select: (data) => (data || []).filter((p: Product) => !p.isService)
    });

    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: products.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 56,
        overscan: 5,
    });

    const isFirstLoad = false; // Not needed with useQuery

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
                        <Button variant="outline" type="button" onClick={() => refetch()} disabled={loading}>
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>

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
                        <div 
                            ref={parentRef}
                            className="hidden md:block bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-auto max-h-[calc(100vh-320px)] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800"
                        >
                                <div
                                    style={{
                                        height: `${rowVirtualizer.getTotalSize() + 48}px`,
                                        width: '100%',
                                        position: 'relative',
                                    }}
                                >
                                <table className="w-full border-collapse table-fixed">
                                    <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950 border-b-2 border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-xs w-[120px]">Mã PT</th>
                                            <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-xs">Tên phụ tùng</th>
                                            <th className="text-right p-4 font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-xs w-[120px]">Tồn kho</th>
                                            <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-xs w-[100px]">Đơn vị</th>
                                            <th className="text-right p-4 font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-xs w-[150px]">Giá bán</th>
                                            <th className="p-4 w-[120px]"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                            const product = products[virtualRow.index];
                                            return (
                                                <tr 
                                                    key={product.id} 
                                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: `${virtualRow.size}px`,
                                                        transform: `translateY(${virtualRow.start + 48}px)`,
                                                    }}
                                                >
                                                    <td className="p-4 text-slate-600 dark:text-slate-400 font-mono text-sm font-semibold align-middle truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                                        {product.code}
                                                    </td>
                                                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200 align-middle truncate">
                                                        {product.name}
                                                    </td>
                                                    <td className="p-4 align-middle text-right">
                                                        {product.stock <= (product.minStock || 5) ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-100 dark:border-red-900/50">
                                                                 {product.stock}
                                                            </span>
                                                        ) : (
                                                            <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                                                                {product.stock}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-slate-500 dark:text-slate-400 text-sm align-middle">cái</td>
                                                    <td className="p-4 text-right font-bold font-mono text-slate-800 dark:text-slate-200 align-middle truncate">
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
                                                                <span className="hidden lg:inline">Chi tiết</span>
                                                            </Button>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
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
