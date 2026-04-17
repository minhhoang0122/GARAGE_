'use client';
 
import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle, Volume2 } from 'lucide-react';
import { markAsRead, markAllAsRead } from '@/actions/notification';
import { useSSEContext } from '@/modules/common/contexts/RealtimeContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
 
type Notification = {
    id: number;
    title: string;
    content: string;
    type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
    link?: string;
    createdAt: Date;
};
 
export default function NotificationBell() {
    const { notifications, loading, setNotifications, fetchNotifications } = useSSEContext();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const readIdsRef = useRef<Set<number>>(new Set());
    const router = useRouter();
 
    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
 
    const handleMarkAsRead = async (id: any, link?: string) => {
        if (!id) return;
        
        console.log(`[NotificationBell] Đang đánh dấu đã đọc ID ${id}...`);
        
        // Optimistic update: Tạm thời ẩn đi để UI mượt mà
        setNotifications((prev: any[]) => prev.filter(n => n.id !== id));

        try {
            const res = await markAsRead(Number(id));
            if (!res.success) {
                console.error(`[NotificationBell] Lỗi khi đánh dấu ID ${id}:`, res.error);
                // Nếu lỗi, lấy lại danh sách gốc từ DB để hiển thị lại thông báo
                await fetchNotifications();
                alert(`Không thể đánh dấu đã đọc: ${res.error}`);
            } else {
                console.log(`[NotificationBell] Đã đánh dấu ID ${id} thành công`);
                // Đồng bộ lại count và danh sách từ server để đảm bảo 100% chính xác sau khi DB đã update
                await fetchNotifications();
            }
            
            if (link) {
                setIsOpen(false);
                router.push(link);
            }
        } catch (error) {
            console.error('[NotificationBell] Lỗi Exception:', error);
            await fetchNotifications();
        }
    };

    const handleMarkAllRead = async () => {
        const ids = notifications.map(n => n.id);
        ids.forEach(id => readIdsRef.current.add(id));
        setNotifications([]);
        try {
            await markAllAsRead();
        } catch (error) {
            ids.forEach(id => readIdsRef.current.delete(id));
            fetchNotifications();
        }
    };

    const handleTestSound = () => {
        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
            audio.volume = 0.5;
            audio.play().catch(err => {
                console.error("[Audio] Playback blocked by browser:", err);
                alert("Vui lòng click vào trang web một lần để cho phép phát âm thanh!");
            });
        } catch (e) {
            console.error("[Audio] Error playing test sound:", e);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'WARNING': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case 'SUCCESS': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case 'ERROR': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg 
                    hover:bg-slate-100 dark:hover:bg-indigo-900/40 
                    transition-colors focus:outline-none"
            >
                <Bell className={`w-5 h-5 ${notifications.length > 0
                    ? 'text-indigo-600 dark:text-indigo-100'
                    : 'text-slate-400 dark:text-indigo-300/60'}`} />
                {notifications.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center 
                        bg-red-500 text-white text-[9px] font-medium rounded-full 
                        border border-white dark:border-slate-900 
                        shadow-sm animate-in zoom-in duration-300">
                        {notifications.length > 99 ? '99+' : notifications.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-premium border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Thông báo</h3>
                            <button
                                onClick={handleTestSound}
                                title="Thử âm thanh thông báo"
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors"
                            >
                                <Volume2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        {notifications.length > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                            >
                                Đánh dấu đã đọc
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {loading && notifications.length === 0 ? (
                            <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Đang tải...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                                <p className="text-sm">Không có thông báo mới</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleMarkAsRead(notification.id, notification.link)}
                                        className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors flex gap-3 items-start ${!notification.link ? 'cursor-default' : ''}`}
                                    >
                                        <div className="mt-0.5 flex-shrink-0">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight mb-1">
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                                {notification.content}
                                            </p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                                                {new Date(notification.createdAt).toLocaleString('vi-VN')}
                                            </p>
                                        </div>
                                        {!notification.link && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMarkAsRead(notification.id);
                                                }}
                                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400"
                                            >
                                                <Check className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
