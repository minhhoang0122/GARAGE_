'use client';
 
import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
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
 
    const handleMarkAsRead = async (id: number, link?: string) => {
        // Optimistic update
        readIdsRef.current.add(id);
        setNotifications((prev: any[]) => prev.filter(n => n.id !== id));
 
        try {
            await markAsRead(id);
            if (link) {
                setIsOpen(false);
                router.push(link);
            }
        } catch (error) {
            // Restore if failed (rare)
            readIdsRef.current.delete(id);
            fetchNotifications();
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
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border border-white dark:border-indigo-950 rounded-full"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-premium border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Thông báo</h3>
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
