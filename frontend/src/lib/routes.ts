// Cấu hình các tuyến đường và quyền truy cập tập trung
export const VaiTro = {
    ADMIN: 'ADMIN',
    SALE: 'SALE',
    KHO: 'KHO',
    QUAN_LY_XUONG: 'QUAN_LY_XUONG',
    THO_SUA_CHUA: 'THO_SUA_CHUA',
    KHACH_HANG: 'KHACH_HANG',
    CUVAN: 'CUVAN',
    THO: 'THO',
} as const;

export type VaiTroType = (typeof VaiTro)[keyof typeof VaiTro];

// Dashboard tương ứng cho từng vai trò
export const ROLE_ROUTES: Record<string, string> = {
    ADMIN: '/admin',
    SALE: '/sale',
    KHO: '/warehouse',
    QUAN_LY_XUONG: '/mechanic',
    THO_SUA_CHUA: '/mechanic',
    KHACH_HANG: '/customer/home',
};

// Quyền truy cập cho từng tiền tố route
export const ROUTE_PERMISSIONS: Record<string, string[]> = {
    '/admin': ['ADMIN'],
    '/sale': ['ADMIN', 'SALE'],
    '/warehouse': ['ADMIN', 'KHO'],
    '/mechanic': ['QUAN_LY_XUONG', 'THO_SUA_CHUA'],
    '/customer': ['KHACH_HANG'],
};

/**
 * Lấy trang chủ mặc định của người dùng dựa trên danh sách vai trò
 */
export function getHomeRoute(roles: string[]): string {
    if (!roles || roles.length === 0) return '/';
    
    // Ưu tiên ADMIN
    if (roles.includes(VaiTro.ADMIN)) return ROLE_ROUTES.ADMIN;
    
    // Theo vai trò đầu tiên có trong danh sách cấu hình
    for (const role of roles) {
        if (ROLE_ROUTES[role]) {
            return ROLE_ROUTES[role];
        }
    }
    
    return '/';
}
