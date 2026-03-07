import { redirect } from 'next/navigation';
import { auth, ROLE_ROUTES, VaiTroType } from '@/lib/auth';

export default async function HomePage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    const roles = (session.user as any).roles || [];

    // Priority for initial redirection
    let redirectUrl = '/login';
    if (roles.includes('ADMIN')) redirectUrl = ROLE_ROUTES.ADMIN;
    else if (roles.includes('SALE')) redirectUrl = ROLE_ROUTES.SALE;
    else if (roles.includes('KHO')) redirectUrl = ROLE_ROUTES.KHO;
    else if (roles.length > 0) redirectUrl = ROLE_ROUTES[roles[0]] || '/login';

    redirect(redirectUrl);
}
