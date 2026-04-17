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
    KHACH_HANG: '/',
    CUVAN: '/sale',
    THO: '/mechanic',
};

// Quyền truy cập cho từng tiền tố route
export const ROUTE_PERMISSIONS: Record<string, string[]> = {
    '/admin': ['ADMIN'],
    '/sale': ['ADMIN', 'SALE', 'CUVAN'],
    '/warehouse': ['ADMIN', 'KHO'],
    '/mechanic': ['QUAN_LY_XUONG', 'THO_SUA_CHUA', 'CUVAN', 'THO'],
    '/customer': ['KHACH_HANG'],
};

/**
 * Lấy trang chủ mặc định của người dùng dựa trên danh sách vai trò
 */
export function getHomeRoute(roles: string[]): string {
    console.log("[Route] getHomeRoute called with roles:", roles);
    if (!roles || roles.length === 0) {
        console.warn("[Route] No roles found, returning root '/'");
        return '/';
    }
    
    // Ưu tiên cao nhất cho ADMIN
    if (roles.includes(VaiTro.ADMIN)) {
        console.log("[Route] Role matched: ADMIN ->", ROLE_ROUTES.ADMIN);
        return ROLE_ROUTES.ADMIN;
    }
    
    // Kiểm tra từng vai trò trong danh sách roles của người dùng
    for (const role of roles) {
        if (ROLE_ROUTES[role]) {
            console.log(`[Route] Role matched: ${role} ->`, ROLE_ROUTES[role]);
            return ROLE_ROUTES[role];
        }
    }
    
    console.warn("[Route] No matching role route found in ROLE_ROUTES for roles:", roles);
    return '/';
}
