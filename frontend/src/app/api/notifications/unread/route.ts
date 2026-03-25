import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const session = await auth();
    const token = (session?.user as any)?.accessToken;

    if (!token) {
        return NextResponse.json([], { status: 401 });
    }

    try {
        const notifications = await api.get(`/notifications?t=${Date.now()}`, token);
        
        // Map data chuẩn form NotificationBell mong đợi
        const data = (notifications || []).map((n: any) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            type: n.type,
            link: n.link,
            createdAt: n.createdAt
        }));

        return NextResponse.json(data);
    } catch (error) {
        // Silent error to prevent log spam
        return NextResponse.json([], { status: 500 });
    }
}
