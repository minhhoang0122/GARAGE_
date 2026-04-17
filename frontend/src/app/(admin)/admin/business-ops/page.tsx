'use client';

import { AdminTabPanel } from '@/modules/common/components/ui/AdminTabPanel';
import { FinanceContent } from '../finance/page';
import { ServicesContent } from '../services/page';
import { DebtsContent } from '../debts/page';
import { DollarSign, BadgePercent, Landmark } from 'lucide-react';

export default function BusinessOpsPage() {
    const tabs = [
        {
            key: 'finance',
            label: 'Quản lý Tài chính',
            icon: <DollarSign className="w-4 h-4" />,
            content: <FinanceContent />
        },
        {
            key: 'debts',
            label: 'Quản lý Công nợ',
            icon: <Landmark className="w-4 h-4" />,
            content: <DebtsContent />
        },
        {
            key: 'services',
            label: 'Bảng giá dịch vụ',
            icon: <BadgePercent className="w-4 h-4" />,
            content: <ServicesContent />
        }
    ];

    return (
        <AdminTabPanel 
            tabs={tabs} 
            title="Quản lý Kinh doanh" 
            subtitle="Theo dõi doanh thu, chi phí và quản lý dịch vụ"
        />
    );
}
