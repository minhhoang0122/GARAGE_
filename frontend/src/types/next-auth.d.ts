// Type definitions cho NextAuth

import { VaiTroType } from '@/lib/auth';

declare module 'next-auth' {
    interface User {
        id: string;
        name: string;
        roles: string[];
        permissions: string[];
    }

    interface Session {
        user: User;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        roles: string[];
        permissions: string[];
    }
}
