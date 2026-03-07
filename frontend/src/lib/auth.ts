// NextAuth.js Configuration
// Sử dụng Credentials Provider với database NguoiDung

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { api } from './api';

// Định nghĩa các vai trò
export const VaiTro = {
    ADMIN: 'ADMIN',
    SALE: 'SALE',
    KHO: 'KHO',
    THO_CHAN_DOAN: 'THO_CHAN_DOAN',
    THO_SUA_CHUA: 'THO_SUA_CHUA',
    KE_TOAN: 'KE_TOAN',
} as const;

export type VaiTroType = (typeof VaiTro)[keyof typeof VaiTro];

// Route cho từng vai trò
export const ROLE_ROUTES: Record<string, string> = {
    ADMIN: '/admin',
    SALE: '/sale',
    KHO: '/warehouse',
    THO_CHAN_DOAN: '/mechanic',
    THO_SUA_CHUA: '/mechanic',
    KE_TOAN: '/sale', // Kế toán tạm thời dùng chung với sale
};

// Quyền truy cập routes
export const ROUTE_PERMISSIONS: Record<string, string[]> = {
    '/admin': ['ADMIN'],
    '/sale': ['ADMIN', 'SALE', 'KE_TOAN'],
    '/warehouse': ['ADMIN', 'KHO'],
    '/mechanic': ['THO_CHAN_DOAN', 'THO_SUA_CHUA'],
};

export const { handlers, signIn, signOut, auth } = NextAuth({
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

                    return {
                        id: data.userId.toString(),
                        name: data.fullName,
                        roles: data.roles || [],
                        permissions: data.permissions || [],
                        accessToken: data.token
                    } as any;
                } catch (error) {
                    console.error('Login error:', error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
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
                (session.user as any).roles = token.roles;
                (session.user as any).permissions = token.permissions;
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
