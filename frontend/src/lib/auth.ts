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
                        id: data.userId.toString(),
                        name: data.fullName,
                        roles: data.roles || [],
                        permissions: data.permissions || [],
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
            }

            if (user) {
                token.id = user.id;
                token.roles = (user as any).roles;
                token.permissions = (user as any).permissions;
                token.accessToken = (user as any).accessToken;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session.user as any).roles = token.roles || [];
                (session.user as any).permissions = token.permissions || [];
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
