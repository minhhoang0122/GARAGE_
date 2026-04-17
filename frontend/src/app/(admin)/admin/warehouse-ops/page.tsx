'use client';

import { Suspense } from 'react';
import { AdminTabPanel } from '@/modules/common/components/ui/AdminTabPanel';
import { ImportManagementContent } from '../../warehouse/import/management/page';
import { SuppliersContent } from '../../warehouse/suppliers/page';
import { InventoryCheckContent } from '../../warehouse/inventory-check/page';
import { ClipboardCheck, Truck, Boxes, RefreshCw } from 'lucide-react';

export default function WarehouseOpsPage() {
    const tabs = [
        {
            key: 'imports',
            label: 'Duyệt Nhập',
            icon: <ClipboardCheck className="w-4 h-4" />,
            content: <ImportManagementContent />
        },
        {
            key: 'suppliers',
            label: 'Nhà cung cấp',
            icon: <Truck className="w-4 h-4" />,
            content: <SuppliersContent />
        },
        {
            key: 'inventory-check',
            label: 'Kiểm kê kho',
            icon: <Boxes className="w-4 h-4" />,
            content: (
                <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><RefreshCw className="w-8 h-8 animate-spin text-blue-500" /></div>}>
                    <InventoryCheckContent />
                </Suspense>
            )
        }
    ];

    return (
        <AdminTabPanel 
            tabs={tabs} 
            title="Quản lý Kho vận" 
            subtitle="Duyệt nhập hàng, quản lý nhà cung cấp và kiểm kê định kỳ"
        />
    );
}
