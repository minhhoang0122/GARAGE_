'use client';

import { AdminTabPanel } from '@/modules/common/components/ui/AdminTabPanel';
import { ConfigurationContent } from '../config/page';
import { AuditLogsContent } from '../logs/page';
import { Settings, ShieldCheck } from 'lucide-react';

export default function SystemManagementPage() {
    const tabs = [
        {
            key: 'config',
            label: 'Cấu hình hệ thống',
            icon: <Settings className="w-4 h-4" />,
            content: <ConfigurationContent />
        },
        {
            key: 'audit',
            label: 'Nhật ký vận hành',
            icon: <ShieldCheck className="w-4 h-4" />,
            content: <AuditLogsContent />
        }
    ];

    return (
        <AdminTabPanel 
            tabs={tabs} 
            title="Quản trị hệ thống" 
            subtitle="Cấu hình tham số và giám sát hoạt động"
        />
    );
}
