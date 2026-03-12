// Middleware bảo vệ routes theo vai trò
// Admin có thể truy cập sale và warehouse, nhưng KHÔNG thể truy cập mechanic

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ROUTE_PERMISSIONS, ROLE_ROUTES, VaiTroType } from '@/lib/auth';

// Routes không cần đăng nhập
const publicRoutes = ['/login', '/api/auth', '/', '/services', '/tra-cuu', '/booking'];

export default auth((req: any) => {
    const { nextUrl, auth: session } = req;
    const pathname = nextUrl.pathname;

    // Cho phép public routes
    const isPublicRoute = publicRoutes.some((route) => {
        if (route === '/') return pathname === '/';
        return pathname.startsWith(route);
    });

    if (isPublicRoute) {
        // Nếu đã đăng nhập mà truy cập /login, redirect về dashboard
        if (pathname === '/login' && session?.user) {
            const roles = (session.user as any).roles || [];
            // Simple priority for login redirect
            const firstRole = (roles[0] as string) || '';
            const redirectUrl = roles.includes('ADMIN') ? '/admin' : (ROLE_ROUTES[firstRole] || '/');
            return NextResponse.redirect(new URL(redirectUrl, nextUrl));
        }
        return NextResponse.next();
    }

    // Chưa đăng nhập -> redirect về login
    if (!session?.user) {
        const loginUrl = new URL('/login', nextUrl);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    const roles = (session.user as any).roles || [];

    // Kiểm tra quyền truy cập cho từng route prefix
    for (const [routePrefix, allowedRolesArray] of Object.entries(ROUTE_PERMISSIONS)) {
        const allowedRoles = allowedRolesArray as string[];
        if (pathname.startsWith(routePrefix)) {
            const hasAccess = allowedRoles.some((r: string) => (roles as string[]).includes(r));
            if (!hasAccess) {
                // Không có quyền -> redirect về dashboard mặc định của user
                const firstRole = (roles[0] as string) || '';
                const redirectUrl = ROLE_ROUTES[firstRole] || '/';
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
