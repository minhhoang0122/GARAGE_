// NextAuth.js Configuration
// Sử dụng Credentials Provider với database NguoiDung

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { api, API_URL } from './api';

import { VaiTro, ROLE_ROUTES, ROUTE_PERMISSIONS } from './routes';
export { VaiTro, ROLE_ROUTES, ROUTE_PERMISSIONS };
export type { VaiTroType } from './routes';

export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true,
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                username: { label: 'Tên đăng nhập', type: 'text' },
                password: { label: 'Mật khẩu', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                try {
                    const data = await api.login(
                        credentials.username as string,
                        credentials.password as string
                    );
                    
                    if (!data || !data.token) {
                        return null;
                    }

                    return {
                        id: (data as any).userId?.toString() || (data as any).ID?.toString() || (data as any).id?.toString(),
                        name: data.fullName || data.hoTen || data.HoTen || data.name,
                        roles: data.roles || [],
                        permissions: data.permissions || [],
                        avatar: data.avatar || data.hinhAnh || data.HinhAnh,
                        email: data.email,
                        phone: data.phone || data.soDienThoai || data.SoDienThoai,
                        createdAt: data.createdAt,
                        accessToken: data.token
                    } as any;
                } catch (error: any) {
                    console.error('CRITICAL [auth.ts] Authorize Exception:');
                    console.error('- Message:', error.message);
                    console.error('- Stack:', error.stack?.split('\n')[0]); // Log dòng đầu của stack
                    console.error('- API_URL:', API_URL);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Cho phép âm thầm cập nhật Roles và Permissions qua useSession().update()
            if (trigger === "update" && session) {
                if (session.roles) token.roles = session.roles;
                if (session.permissions) token.permissions = session.permissions;
                if (session.avatar) token.avatar = session.avatar || session.hinhAnh;
                if (session.email) token.email = session.email;
                if (session.phone) token.phone = session.phone || session.soDienThoai;
                if (session.name) token.name = session.name || session.fullName || session.hoTen;
            }

            if (user) {
                token.id = user.id;
                token.roles = (user as any).roles;
                token.permissions = (user as any).permissions;
                token.avatar = (user as any).avatar || (user as any).hinhAnh || (user as any).HinhAnh;
                token.email = (user as any).email;
                token.phone = (user as any).phone || (user as any).soDienThoai || (user as any).SoDienThoai;
                token.name = (user as any).name || (user as any).fullName || (user as any).hoTen;
                token.createdAt = (user as any).createdAt;
                token.accessToken = (user as any).accessToken;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session.user as any).roles = token.roles || [];
                (session.user as any).permissions = token.permissions || [];
                (session.user as any).image = token.avatar as string;
                (session.user as any).email = token.email as string;
                (session.user as any).phone = token.phone as string;
                (session.user as any).createdAt = token.createdAt;
                (session.user as any).accessToken = token.accessToken;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
});
