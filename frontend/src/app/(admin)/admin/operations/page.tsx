'use client';

import { AdminTabPanel } from '@/modules/common/components/ui/AdminTabPanel';
import { VehicleHistoriesContent } from '../vehicle-histories/page';
import { OrderTimelinesContent } from '../order-timelines/page';
import { CarFront, Activity } from 'lucide-react';

export default function OperationsPage() {
    const tabs = [
        {
            key: 'timelines',
            label: 'Tiến trình Đơn',
            icon: <Activity className="w-4 h-4" />,
            content: <OrderTimelinesContent />
        },
        {
            key: 'vehicles',
            label: 'Hồ sơ Xe',
            icon: <CarFront className="w-4 h-4" />,
            content: <VehicleHistoriesContent />
        }
    ];

    return (
        <AdminTabPanel 
            tabs={tabs} 
            title="Quản lý Vận hành" 
            subtitle="Theo dõi tiến độ sửa chữa và hồ sơ xe"
        />
    );
}
