'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_NAMES: Record<string, string> = {
    'sale': 'Bán hàng',
    'reception': 'Tiếp nhận',
    'orders': 'Đơn hàng',
    'warehouse': 'Kho',
    'inventory': 'Tồn kho',
    'import': 'Nhập kho',
    'export': 'Xuất kho',
    'mechanic': 'Kỹ thuật',
    'inspect': 'Kiểm tra',
    'jobs': 'Công việc',
    'customers': 'Khách hàng',
    'checkout': 'Thu ngân',
    'new': 'Tạo mới',
    'warranty': 'Bảo hành',
    'history': 'Lịch sử',
    'report': 'Báo cáo',
    'admin': 'Quản trị',
    'users': 'Người dùng',
    'settings': 'Cài đặt'
};

export default function Breadcrumb() {
    const pathname = usePathname();

    // Split path and remove empty strings
    const paths = pathname.split('/').filter(Boolean);

    if (paths.length === 0) return null;

    return (
        <nav className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-1 animate-in fade-in slide-in-from-left-2 duration-300">
            <Link
                href="/"
                className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1"
            >
                <Home className="w-3 h-3" />
                <span className="sr-only">Trang chủ</span>
            </Link>

            {paths.map((path, index) => {
                const isLast = index === paths.length - 1;
                const href = `/${paths.slice(0, index + 1).join('/')}`;

                // Format name: Check map -> Check if ID (number) -> Capitalize
                let name = ROUTE_NAMES[path];

                if (!name) {
                    // Check if it looks like an ID
                    if (!isNaN(Number(path)) || path.length > 10) {
                        name = `#${path.slice(0, 6)}`;
                    } else {
                        // Capitalize first letter
                        name = path.charAt(0).toUpperCase() + path.slice(1);
                    }
                }

                return (
                    <div key={href} className="flex items-center">
                        <ChevronRight className="w-3 h-3 mx-1 text-slate-400" />
                        {isLast ? (
                            <span className="font-semibold text-slate-700 dark:text-slate-200">
                                {name}
                            </span>
                        ) : (
                            <Link
                                href={href}
                                className="hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                {name}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
