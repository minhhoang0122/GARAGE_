// Cấu hình các tuyến đường và quyền truy cập tập trung
export const VaiTro = {
    ADMIN: 'ADMIN',
    SALE: 'SALE',
    KHO: 'KHO',
    THO_CHAN_DOAN: 'THO_CHAN_DOAN',
    THO_SUA_CHUA: 'THO_SUA_CHUA',
    KE_TOAN: 'KE_TOAN',
} as const;

export type VaiTroType = (typeof VaiTro)[keyof typeof VaiTro];

// Dashboard tương ứng cho từng vai trò
export const ROLE_ROUTES: Record<string, string> = {
    ADMIN: '/admin',
    SALE: '/sale',
    KHO: '/warehouse',
    THO_CHAN_DOAN: '/mechanic',
    THO_SUA_CHUA: '/mechanic',
    KE_TOAN: '/sale',
};

// Quyền truy cập cho từng tiền tố route
export const ROUTE_PERMISSIONS: Record<string, string[]> = {
    '/admin': ['ADMIN'],
    '/sale': ['ADMIN', 'SALE', 'KE_TOAN'],
    '/warehouse': ['ADMIN', 'KHO'],
    '/mechanic': ['THO_CHAN_DOAN', 'THO_SUA_CHUA'],
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
