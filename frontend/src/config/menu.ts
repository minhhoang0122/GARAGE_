// Menu configuration theo vai trò

import { VaiTroType } from '@/lib/auth';

export interface MenuItem {
    label: string;
    href: string;
    icon: string;
}

export interface MenuGroup {
    title?: string;
    items: MenuItem[];
}

// Menu cho từng vai trò
export const ROLE_MENUS: Record<string, MenuGroup[]> = {
    ADMIN: [
        {
            items: [
                { label: 'Tổng quan', href: '/admin', icon: 'LayoutDashboard' },
                { label: 'Dịch vụ & Giá', href: '/admin/services', icon: 'Tag' },
                { label: 'Tài chính', href: '/admin/finance', icon: 'Wallet' },
                { label: 'Khách hàng', href: '/sale/customers', icon: 'Users' },
                { label: 'Nhà cung cấp', href: '/warehouse/suppliers', icon: 'Truck' },
                { label: 'Tài khoản khách', href: '/admin/customers/accounts', icon: 'Users' },
                { label: 'Nhân sự', href: '/admin/users', icon: 'UserCog' },
                { label: 'Báo cáo', href: '/dashboard', icon: 'BarChart3' },
                { label: 'Cấu hình', href: '/admin/config', icon: 'Settings' },
                { label: 'Nhật ký', href: '/admin/logs', icon: 'History' },
                { label: 'Tiến trình đơn', href: '/admin/order-timelines', icon: 'Activity' },
                { label: 'Hồ sơ Xe', href: '/admin/vehicle-histories', icon: 'CarFront' },
            ],
        },
        {
            title: 'Quản lý Nội dung',
            items: [
                { label: 'Landing Page', href: '/admin/cms/landing', icon: 'Component' },
                { label: 'Bài viết Blog', href: '/admin/cms/blog', icon: 'FileText' },
                { label: 'Thông báo', href: '/admin/cms/announcements', icon: 'Megaphone' },
            ],
        },
    ],
    SALE: [
        {
            items: [
                { label: 'Tổng quan', href: '/sale', icon: 'LayoutDashboard' },
                { label: 'Tiếp nhận xe', href: '/sale/reception', icon: 'Car' },
                { label: 'Đơn hàng', href: '/sale/orders', icon: 'FileText' },
                { label: 'Khách hàng', href: '/sale/customers', icon: 'Users' },
                { label: 'Thu ngân', href: '/sale/checkout', icon: 'CreditCard' },
                { label: 'Bảo hành', href: '/sale/warranty-claims', icon: 'ShieldCheck' },
                { label: 'Lịch hẹn', href: '/sale/bookings', icon: 'ClipboardCheck' },
                { label: 'Hồ sơ Xe', href: '/admin/vehicle-histories', icon: 'CarFront' },
            ],
        },
    ],
    KHO: [
        {
            items: [
                { label: 'Tổng quan', href: '/warehouse', icon: 'LayoutDashboard' },
                { label: 'Nhập kho', href: '/warehouse/import', icon: 'PackagePlus' },
                { label: 'Quản lý nhập', href: '/warehouse/import/management', icon: 'ClipboardCheck' },
                { label: 'Xuất kho', href: '/warehouse/export', icon: 'PackageMinus' },
                { label: 'Tồn kho', href: '/warehouse/inventory', icon: 'Boxes' },
                { label: 'Lịch sử', href: '/warehouse/history', icon: 'History' },
                { label: 'Nhà cung cấp', href: '/warehouse/suppliers', icon: 'Truck' },
            ],
        },
    ],
    QUAN_LY_XUONG: [
        {
            items: [
                { label: 'Tổng quan', href: '/mechanic', icon: 'LayoutDashboard' },
                { label: 'Khám xe', href: '/mechanic/inspect', icon: 'ClipboardCheck' },
                { label: 'Điều phối', href: '/mechanic/assign', icon: 'Wrench' },
                { label: 'Đội thợ', href: '/mechanic/team', icon: 'Users' },
                { label: 'Nghiệm thu', href: '/mechanic/qc', icon: 'ShieldCheck' },
                { label: 'Lịch sử', href: '/mechanic/history', icon: 'History' },
            ],
        },
    ],
    THO_SUA_CHUA: [
        {
            items: [
                { label: 'Việc của tôi', href: '/mechanic/jobs', icon: 'ClipboardList' },
                { label: 'Lịch sử', href: '/mechanic/history', icon: 'History' },
            ],
        },
    ],
};

// Tên hiển thị cho vai trò
export const ROLE_DISPLAY_NAMES: Record<string, string> = {
    ADMIN: 'Quản trị viên',
    SALE: 'Cố vấn dịch vụ',
    KHO: 'Nhân viên Kho',
    QUAN_LY_XUONG: 'Quản đốc xưởng',
    THO_SUA_CHUA: 'Kỹ thuật viên',
    CUVAN: 'Cố vấn dịch vụ',
    THO: 'Kỹ thuật viên',
};
