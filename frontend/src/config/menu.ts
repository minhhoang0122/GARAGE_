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
            title: 'Hệ thống Quản trị',
            items: [
                { label: 'Tổng quan', href: '/admin/overview', icon: 'LayoutDashboard' },
                { label: 'Kinh doanh', href: '/admin/business-ops', icon: 'DollarSign' },
                { label: 'Khách hàng', href: '/sale/customers', icon: 'Users' },
            ],
        },
        {
            title: 'Vận hành & Kho',
            items: [
                { label: 'Vận hành', href: '/admin/operations', icon: 'Activity' },
                { label: 'Kho vận', href: '/admin/warehouse-ops', icon: 'Boxes' },
                { label: 'Nhân sự', href: '/admin/personnel', icon: 'UserCog' },
            ],
        },
        {
            title: 'Tài nguyên',
            items: [
                { label: 'Nội dung CMS', href: '/admin/cms', icon: 'Component' },
                { label: 'Hệ thống', href: '/admin/system', icon: 'Settings' },
            ],
        },
    ],
    SALE: [
        {
            items: [
                { label: 'Khoang Bán hàng', href: '/sale', icon: 'ShoppingCart' },
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
                { label: 'Kiểm kê kho', href: '/warehouse/inventory-check', icon: 'ClipboardSignature' },
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
