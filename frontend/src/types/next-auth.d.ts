import NextAuth, { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    /**
     * Trả về khi gọi `useSession`, `auth()`, v.v.
     */
    interface Session {
        user: {
            id: string
            role: string
            roles: string[]
            image?: string | null
        } & DefaultSession["user"]
        accessToken?: string
    }

    /**
     * Cấu trúc User trả về từ callback `authorize`
     */
    interface User extends DefaultUser {
        id: string
        role: string
        accessToken: string
        image?: string | null
    }
}

declare module "next-auth/jwt" {
    /**
     * Trả về trong callback `jwt` và `session` khi dùng JWT strategy
     */
    interface JWT {
        id: string
        role: string
        roles: string[]
        accessToken: string
        image?: string | null
    }
}
