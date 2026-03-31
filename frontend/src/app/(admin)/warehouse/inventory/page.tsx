'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/modules/common/components/layout';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Package, AlertTriangle, Eye, RefreshCw } from 'lucide-react';
import { useInventory } from '@/modules/warehouse/hooks/useWarehouse';
import { AdvancedDataTable } from '../../../../modules/shared/components/ui/AdvancedDataTable';
import { StatusBadge } from '@/modules/shared/components/ui/StatusBadge';
import { Button } from '@/modules/shared/components/ui/button';

export default function WarehouseInventoryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    const { data: products = [], isLoading: loading, refetch } = useInventory(query);

    const lowStockCount = products.filter((p: any) => p.stock <= (p.minStock || 5)).length;

    // Table Columns
    const columns: any[] = [
        {
            header: 'Sản phẩm',
            accessorKey: 'name',
            render: (value: string, row: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{value}</span>
                    <span className="text-[10px] font-mono font-medium text-slate-400 uppercase">{row.code}</span>
                </div>
            )
        },
        {
            header: 'Tồn kho',
            accessorKey: 'stock',
            className: 'text-center font-bold',
            render: (value: number, row: any) => {
                const isLow = value <= (row.minStock || 5);
                return (
                    <div className="flex flex-col items-center">
                        <span className={`text-sm ${isLow ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
                            {value}
                        </span>
                        {isLow && (
                            <span className="text-[9px] text-rose-500 font-bold uppercase tracking-wider">Sắp hết</span>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Đơn vị',
            accessorKey: 'unit',
            className: 'text-center text-xs text-slate-500 uppercase',
            render: () => 'Cái'
        },
        {
            header: 'Đơn giá',
            accessorKey: 'price',
            className: 'text-right font-bold',
            render: (value: number) => (
                <span className="text-slate-900 dark:text-slate-100">
                    {formatCurrency(value)}
                </span>
            )
        },
        {
            header: 'Trạng thái',
            accessorKey: 'stock',
            render: (value: number, row: any) => {
                const isLow = value <= (row.minStock || 5);
                return <StatusBadge status={isLow ? 'LOW_STOCK' : 'AVAILABLE'} />;
            }
        },
        {
            header: '',
            accessorKey: 'id',
            className: 'text-right',
            render: (value: string) => (
                <Link href={`/warehouse/inventory/${value}/batches`}>
                    <button className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all">
                        <Eye className="w-4 h-4" />
                    </button>
                </Link>
            )
        }
    ];

    return (
        <DashboardLayout title="Tồn kho" subtitle="Quản lý chi tiết phụ tùng và vật tư">
            <div className="space-y-6">
                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-premium-sm border border-slate-200/60 dark:border-slate-800 p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng mặt hàng</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{products.length}</p>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-premium-sm border border-slate-200/60 dark:border-slate-800 p-5 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${lowStockCount > 0 ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600'}`}>
                            {lowStockCount > 0 ? <AlertTriangle className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sắp hết hàng</p>
                            <p className={`text-2xl font-black ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>{lowStockCount}</p>
                        </div>
                    </div>
                </div>

                {/* Main Table */}
                <AdvancedDataTable
                    data={products}
                    columns={columns}
                    isLoading={loading}
                    searchPlaceholder="Tìm theo tên hoặc mã sản phẩm..."
                    searchFields={['name', 'code']}
                    onSearch={(val) => {
                        const params = new URLSearchParams(searchParams);
                        if (val) params.set('q', val);
                        else params.delete('q');
                        router.push(`${window.location.pathname}?${params.toString()}`);
                    }}
                    emptyState={{
                        title: 'Kho hàng trống',
                        description: query ? `Không tìm thấy phụ tùng nào khớp với "${query}"` : "Hiện chưa có phụ tùng nào trong kho.",
                        icon: <Package className="w-12 h-12" />
                    }}
                    actionButton={
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => refetch()} 
                            disabled={loading}
                            className="h-9 px-3 gap-2 border-slate-200 dark:border-slate-700 font-bold"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Làm mới
                        </Button>
                    }
                />
            </div>
        </DashboardLayout>
    );
}
