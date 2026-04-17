import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { API_URL } from "@/lib/api";

export type VaiTroType = 'ADMIN' | 'SALE' | 'KHO' | 'QUAN_LY_XUONG' | 'THO_SUA_CHUA' | 'KHACH_HANG';

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                // Đổi thành username để khớp với field name từ các Form đăng nhập (Admin/Customer)
                username: { label: "Username/Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // Kiểm tra username thay vì email để khớp với Form
                if (!credentials?.username || !credentials?.password) {
                    console.warn("[Auth] Thiếu thông tin đăng nhập:", { 
                        hasUsername: !!credentials?.username, 
                        hasPassword: !!credentials?.password 
                    });
                    return null;
                }

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                try {
                    const loginUrl = `${API_URL}/auth/login`;
                    console.log("[Auth] Đang gọi API tại:", loginUrl);

                    const res = await fetch(loginUrl, {
                        method: "POST",
                        body: JSON.stringify({
                            username: credentials.username, // Backend đã hỗ trợ cả username/email qua field này
                            password: credentials.password
                        }),
                        headers: { "Content-Type": "application/json" },
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    let data: any;
                    try {
                        const text = await res.text();
                        data = text ? JSON.parse(text) : null;
                    } catch (e) {
                        data = null;
                        console.error("[Auth] Lỗi Parse JSON từ Backend");
                    }

                    if (!res.ok) {
                        const errorMsg = data?.error || data?.message || "Không có thông báo lỗi từ hệ thống";
                        console.error("[Auth] Đăng nhập thất bại. Status:", res.status, "Sapo:", errorMsg);
                        return null;
                    }
                    
                    if (data && data.userId) {
                        console.log("[Auth] Đăng nhập thành công cho User ID:", data.userId);
                        
                        // Absolute Role Normalization: Case-insensitive ROLE_ stripping + UPPERCASE conversion
                        const rawRoles = (data.roles || data.vaiTro || []) as any[];
                        const normalizedRoles = (Array.isArray(rawRoles) ? rawRoles : [rawRoles]).map(r => {
                            let roleName = typeof r === 'string' ? r : (r?.name || r?.code || r?.authority || '');
                            if (!roleName) return null;
                            
                            roleName = roleName.toUpperCase();
                            if (roleName.startsWith('ROLE_')) {
                                roleName = roleName.substring(5);
                            }
                            return roleName;
                        }).filter(Boolean) as string[];

                        // Determine primaryRole: Admin always preferred, otherwise first available
                        const primaryRole = normalizedRoles.includes('ADMIN') 
                            ? 'ADMIN' 
                            : (normalizedRoles[0] || 'KHACH_HANG');
                        
                        // Ensure finalRoles is never empty
                        const finalRoles = normalizedRoles.length > 0 ? normalizedRoles : [primaryRole];
                        
                        return {
                            id: data.userId.toString(),
                            name: data.fullName,
                            email: data.email,
                            role: primaryRole,
                            roles: finalRoles,
                            permissions: data.permissions || [],
                            image: data.avatar,
                            accessToken: data.token,
                        };
                    }
                    
                    console.warn("[Auth] Backend trả về thành công nhưng thiếu thông tin User ID", data);
                    return null;
                } catch (error: any) {
                    clearTimeout(timeoutId);
                    if (error.name === 'AbortError') {
                        console.error("[Auth] Lỗi Timeout kết nối tới Backend (10s)");
                    } else {
                        console.error("CRITICAL [auth.ts] Lỗi hệ thống khi Authorize:", error.message || error);
                    }
                    return null;
                }
            },
        }),
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = (user as any).id;
                token.role = (user as any).role;
                token.roles = (user as any).roles;
                token.permissions = (user as any).permissions;
                token.accessToken = (user as any).accessToken;
                token.image = (user as any).image;
            }

            if (trigger === "update" && session?.image) {
                token.image = session.image;
            }

            // Check if backend JWT has expired
            // If so, clear the session so middleware redirects to login on refresh
            if (token.accessToken) {
                try {
                    const payload = JSON.parse(
                        Buffer.from((token.accessToken as string).split('.')[1], 'base64').toString()
                    );
                    const now = Math.floor(Date.now() / 1000);
                    if (payload.exp && payload.exp < now) {
                        console.warn("[Auth] Backend JWT expired, clearing session");
                        return null; // Trả về null để NextAuth xóa session
                    }
                } catch (e) {
                    // If token can't be decoded, it's invalid
                    console.error("[Auth] Cannot decode accessToken, clearing session");
                    return null;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                (session.user as any).roles = token.roles as string[];
                (session.user as any).permissions = token.permissions as string[];
                session.user.image = token.image as string;
                session.accessToken = token.accessToken as string;
            }
            return session;
        },
    },
    session: {
        strategy: 'jwt',
    },
    debug: process.env.NODE_ENV === 'development',
});
