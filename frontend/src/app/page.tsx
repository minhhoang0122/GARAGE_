import { redirect } from 'next/navigation';
import { auth, ROLE_ROUTES, VaiTroType } from '@/lib/auth';

export default async function HomePage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    const role = session.user.role as any;
    const redirectUrl = ROLE_ROUTES[role] || '/login';
    redirect(redirectUrl);
}
