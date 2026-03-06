// Type definitions cho NextAuth

import { VaiTroType } from '@/lib/auth';

declare module 'next-auth' {
    interface User {
        id: string;
        name: string;
        role: VaiTroType;
    }

    interface Session {
        user: User;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: VaiTroType;
    }
}
