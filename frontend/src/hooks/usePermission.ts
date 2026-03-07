'use client';

import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

/**
 * Hook to check if the current user has specific permissions or roles.
 */
export function usePermission() {
    const { data: session } = useSession();

    const permissions = useMemo(() => {
        return (session?.user as any)?.permissions || [];
    }, [session]);

    const roles = useMemo(() => {
        return (session?.user as any)?.roles || [];
    }, [session]);

    const hasPermission = (permissionCode: string) => {
        if (roles.includes('ADMIN')) return true;
        return permissions.includes(permissionCode);
    };

    const hasAnyPermission = (permissionCodes: string[]) => {
        if (roles.includes('ADMIN')) return true;
        return permissionCodes.some(code => permissions.includes(code));
    };

    const hasRole = (roleName: string) => {
        return roles.includes(roleName);
    };

    const isAdmin = roles.includes('ADMIN');

    return {
        permissions,
        roles,
        hasPermission,
        hasAnyPermission,
        hasRole,
        isAdmin,
        isLoading: !session && session !== null
    };
}
