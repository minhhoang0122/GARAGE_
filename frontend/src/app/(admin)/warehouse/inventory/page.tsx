'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { DashboardLayout } from '@/modules/common/components/layout';
import { Button } from '@/modules/shared/components/ui/button';
import { SearchInput } from '@/modules/shared/components/ui/search-input';
import { EmptyState } from '@/modules/shared/components/ui/empty-state';
import { TableSkeleton } from '@/modules/shared/components/ui/table-skeleton';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Search, Package, AlertTriangle, RefreshCw, Eye } from 'lucide-react';
import { useInventory } from '@/modules/warehouse/hooks/useWarehouse';
import { Product } from '@/modules/warehouse/services/warehouse';

export default function WarehouseInventoryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const query = searchParams.get('q') || '';


    const { data: products = [], isLoading: loading, refetch } = useInventory(query);

    const parentRef = useRef<HTMLDivElement>(null);

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
                        {/* Desktop Table View - Standard Clean Industrial Style */}
                        <div 
                            ref={parentRef}
                            className="hidden md:block bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
                        >
                            <table className="w-full border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <tr className="text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 transition-colors">
                                        <th className="px-4 py-3 w-16 text-center">Ảnh</th>
                                        <th className="px-4 py-3">Thông tin linh kiện</th>
                                        <th className="px-4 py-3 w-28 text-center">Tồn kho</th>
                                        <th className="px-4 py-3 w-32">Trạng thái</th>
                                        <th className="px-4 py-3 w-28 text-right">Đơn giá</th>
                                        <th className="px-4 py-3 w-24 text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {products.map((product) => (
                                        <tr 
                                            key={product.id} 
                                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors group"
                                        >
                                            <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-xs font-medium align-middle">
                                                {product.code}
                                            </td>
                                            <td className="p-4 font-semibold text-slate-800 dark:text-slate-100 align-middle">
                                                <div className="flex flex-col">
                                                    <span className="truncate max-w-[300px]">{product.name}</span>
                                                    {product.stock <= (product.minStock || 5) && (
                                                        <span className="text-[10px] text-red-500 font-bold mt-0.5">Sắp hết hàng</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <span className={`font-mono font-bold text-sm ${product.stock <= (product.minStock || 5) ? 'text-red-600 dark:text-red-400 underline decoration-red-500/30' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-500 dark:text-slate-400 text-xs font-medium align-middle uppercase tracking-wide">cái</td>
                                            <td className="p-4 text-right font-bold font-mono text-slate-900 dark:text-slate-100 align-middle">
                                                {formatCurrency(product.price)}
                                            </td>
                                            <td className="p-4 text-center align-middle">
                                                <Link href={`/warehouse/inventory/${product.id}/batches`}>
                                                    <button className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
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
