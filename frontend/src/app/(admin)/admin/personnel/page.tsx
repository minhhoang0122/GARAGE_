'use client';

import { AdminTabPanel } from '@/modules/common/components/ui/AdminTabPanel';
import { UsersContent } from '../users/page';
import { CustomerAccountsContent } from '../customers/accounts/page';
import { UserCog, Users } from 'lucide-react';

export default function PersonnelPage() {
    const tabs = [
        {
            key: 'staff',
            label: 'Nhân sự',
            icon: <UserCog className="w-4 h-4" />,
            content: <UsersContent />
        },
        {
            key: 'customers',
            label: 'Tài khoản khách',
            icon: <Users className="w-4 h-4" />,
            content: <CustomerAccountsContent />
        }
    ];

    return (
        <AdminTabPanel 
            tabs={tabs} 
            title="Quản lý Nhân sự & Khách hàng" 
            subtitle="Điều phối nhân lực và quản lý tài khoản người dùng"
        />
    );
}
