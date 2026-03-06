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
                { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
                { label: 'Dịch vụ & Giá', href: '/admin/services', icon: 'Tag' },
                { label: 'Tài chính', href: '/admin/finance', icon: 'Wallet' },
                { label: 'Khách hàng', href: '/sale/customers', icon: 'Users' },
                { label: 'Nhân sự', href: '/admin/users', icon: 'UserCog' },
                { label: 'Báo cáo', href: '/admin/dashboard', icon: 'BarChart3' },
                { label: 'Cấu hình', href: '/admin/config', icon: 'Settings' },
                { label: 'Nhật ký', href: '/admin/logs', icon: 'History' },
            ],
        },
        {
            title: 'Truy cập nhanh',
            items: [
                { label: 'Bán hàng', href: '/sale', icon: 'ShoppingCart' },
                { label: 'Kho', href: '/warehouse', icon: 'Package' },
            ],
        },
    ],
    SALE: [
        {
            items: [
                { label: 'Dashboard', href: '/sale', icon: 'LayoutDashboard' },
                { label: 'Tiếp nhận xe', href: '/sale/reception', icon: 'Car' },
                { label: 'Báo giá', href: '/sale/quotes', icon: 'FileText' },
                { label: 'Khách hàng', href: '/sale/customers', icon: 'Users' },
                { label: 'Thu ngân', href: '/sale/checkout', icon: 'CreditCard' },
            ],
        },
    ],
    KE_TOAN: [
        {
            items: [
                { label: 'Dashboard', href: '/sale', icon: 'LayoutDashboard' },
                { label: 'Thu ngân', href: '/sale/checkout', icon: 'CreditCard' },
            ],
        },
    ],
    KHO: [
        {
            items: [
                { label: 'Dashboard', href: '/warehouse', icon: 'LayoutDashboard' },
                { label: 'Nhập kho', href: '/warehouse/import', icon: 'PackagePlus' },
                { label: 'Quản lý nhập', href: '/warehouse/import/management', icon: 'ClipboardCheck' },
                { label: 'Xuất kho', href: '/warehouse/export', icon: 'PackageMinus' },
                { label: 'Tồn kho', href: '/warehouse/inventory', icon: 'Boxes' },
                { label: 'Lịch sử', href: '/warehouse/history', icon: 'History' },
            ],
        },
    ],
    THO_CHAN_DOAN: [
        {
            items: [
                { label: 'Dashboard', href: '/mechanic', icon: 'LayoutDashboard' },
                { label: 'Khám xe', href: '/mechanic/inspect', icon: 'ClipboardCheck' },
                { label: 'Danh sách việc', href: '/mechanic/jobs', icon: 'ClipboardList' },
                { label: 'Lịch sử chẩn đoán', href: '/mechanic/history', icon: 'History' },
            ],
        },
    ],
    THO_SUA_CHUA: [
        {
            items: [
                { label: 'Dashboard', href: '/mechanic', icon: 'LayoutDashboard' },
                { label: 'Danh sách việc', href: '/mechanic/jobs', icon: 'ClipboardList' },
                { label: 'Lịch sử sửa', href: '/mechanic/history', icon: 'History' },
            ],
        },
    ],
};

// Tên hiển thị cho vai trò
export const ROLE_DISPLAY_NAMES: Record<string, string> = {
    ADMIN: 'Chủ Gara',
    SALE: 'Nhân viên Bán hàng',
    KHO: 'Nhân viên Kho',
    THO_CHAN_DOAN: 'Thợ Chẩn đoán',
    THO_SUA_CHUA: 'Thợ Sửa chữa',
    KE_TOAN: 'Kế toán',
};
