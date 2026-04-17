'use client';

import { AdminTabPanel } from '@/modules/common/components/ui/AdminTabPanel';
import { DashboardContent } from '../page';
import { ReportsContent } from '../../dashboard/page';
import { LayoutDashboard, BarChart3 } from 'lucide-react';

export default function OverviewPage() {
    const tabs = [
        {
            key: 'dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard className="w-4 h-4" />,
            content: <DashboardContent />
        },
        {
            key: 'reports',
            label: 'Báo cáo chi tiết',
            icon: <BarChart3 className="w-4 h-4" />,
            content: <ReportsContent />
        }
    ];

    return (
        <AdminTabPanel 
            tabs={tabs} 
            title="Tổng quan hệ thống" 
            subtitle="Theo dõi chỉ số kinh doanh và báo cáo hoạt động"
        />
    );
}
