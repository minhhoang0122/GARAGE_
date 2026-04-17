// Proxy bảo vệ routes theo vai trò
// Admin có thể truy cập sale và warehouse, nhưng KHÔNG thể truy cập mechanic

import { NextResponse } from 'next/server';
import { auth } from './lib/auth';
import { ROUTE_PERMISSIONS, ROLE_ROUTES, getHomeRoute } from './lib/routes';

// Routes không cần đăng nhập
const publicRoutes = ['/login', '/api/auth', '/', '/services', '/tra-cuu', '/booking', '/customer/login', '/customer/register', '/admin/login', '/blog', '/announcements', '/api/public/cms'];

export const proxy = auth((req: any) => {
    const { nextUrl, auth: session } = req;
    const pathname = nextUrl.pathname;

    // Cho phép public routes
    const isPublicRoute = publicRoutes.some((route) => {
        if (route === '/') return pathname === '/';
        return pathname.startsWith(route);
    });

    if (isPublicRoute) {
        // Nếu đã đăng nhập mà truy cập các trang login, redirect về dashboard
        const loginPaths = ['/login', '/customer/login', '/admin/login'];
        if (loginPaths.includes(pathname) && session?.user) {
            const roles = (session.user as any).roles || [];
            const redirectUrl = getHomeRoute(roles);
            return NextResponse.redirect(new URL(redirectUrl, nextUrl));
        }
        return NextResponse.next();
    }

    // Chưa đăng nhập hoặc session rỗng (lỗi token) -> redirect về login
    const isValidUser = !!session?.user?.email || !!session?.user?.role || (session?.user as any)?.roles?.length > 0;
    
    if (!session?.user || !isValidUser) {
        const loginUrl = new URL('/login', nextUrl);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    const userSession = session?.user as any;
    const roles = Array.isArray(userSession?.roles) 
        ? userSession.roles 
        : (userSession?.role ? [userSession.role] : []);

    // Kiểm tra quyền truy cập cho từng route prefix
    for (const [routePrefix, allowedRolesArray] of Object.entries(ROUTE_PERMISSIONS)) {
        const allowedRoles = allowedRolesArray as string[];
        if (pathname.startsWith(routePrefix)) {
            const hasAccess = allowedRoles.some((r: string) => roles.includes(r));
            if (!hasAccess) {
                // Không có quyền -> redirect về dashboard mặc định của user
                const redirectUrl = getHomeRoute(roles);
                return NextResponse.redirect(new URL(redirectUrl, nextUrl));
            }
            break;
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico
         * - public files
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
