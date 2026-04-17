'use client';

import { AdminTabPanel } from '@/modules/common/components/ui/AdminTabPanel';
import { LandingContent } from './landing/page';
import { BlogContent } from './blog/page';
import { AnnouncementsContent } from './announcements/page';
import { Layout, FileText, Bell } from 'lucide-react';

export default function ContentManagementPage() {
    const tabs = [
        {
            key: 'landing',
            label: 'Trang chủ',
            icon: <Layout className="w-4 h-4" />,
            content: <LandingContent />
        },
        {
            key: 'blog',
            label: 'Blog',
            icon: <FileText className="w-4 h-4" />,
            content: <BlogContent />
        },
        {
            key: 'announcements',
            label: 'Thông báo',
            icon: <Bell className="w-4 h-4" />,
            content: <AnnouncementsContent />
        }
    ];

    return (
        <AdminTabPanel 
            tabs={tabs} 
            title="Quản lý Nội dung" 
            subtitle="Tùy chỉnh trang chủ, bài viết blog và thông báo hệ thống"
        />
    );
}
