'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Calendar, Shield, MapPin, Edit3, Loader2, Camera } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import Portal from '../ui/Portal';
import { usePresence } from '@/hooks/usePresence';
import { ApiClient } from '@/api/ApiClient';
import { ROLE_DISPLAY_NAMES } from '@/config/menu';

interface ProfileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onEditAvatar: () => void;
    user: any;
}

export default function ProfileDrawer({ isOpen, onClose, onEditAvatar, user }: ProfileDrawerProps) {
    const [fullUser, setFullUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && user?.id) {
            fetchFullUser();
        }
    }, [isOpen, user?.id]);

    const fetchFullUser = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const data = await ApiClient.user.getUserById(user.id);
            if (data) {
                setFullUser(data);
            }
        } catch (error) {
            console.error('Error fetching full user profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const { isOnline } = usePresence();

    if (!user) return null;

    const displayUser = fullUser || user;
    const online = isOnline(displayUser?.id);
    const rawRole = displayUser.vaiTro || displayUser.roles?.[0]?.name || displayUser.roles?.[0];
    const roleName = ROLE_DISPLAY_NAMES[rawRole] || rawRole || 'Nhân viên';
    const initial = (displayUser.fullName || displayUser.name || 'U').charAt(0).toUpperCase();
    const joinDate = displayUser.createdAt ? new Date(displayUser.createdAt) : new Date();

    return (
        <AnimatePresence>
            {isOpen && (
                <Portal>
                    <div className="fixed inset-0 z-[99999] overflow-hidden">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                        />

                        {/* Drawer Content */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-950 shadow-[-20px_0_50px_rgba(0,0,0,0.2)] flex flex-col pointer-events-auto border-l border-slate-200 dark:border-slate-800"
                        >
                            {/* Header with Background Pattern */}
                            <div className="relative h-32 bg-indigo-600 overflow-hidden">
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                                <div className="absolute top-6 right-6 z-10">
                                    <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all active:scale-90">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 px-6 -mt-16 relative z-10 pb-10">
                                {/* Profile Info Section */}
                                <div className="flex flex-col items-center">
                                    <button 
                                        onClick={onEditAvatar}
                                        className="relative h-32 w-32 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 shadow-2xl border-4 border-white dark:border-slate-950 group hover:scale-105 transition-transform active:scale-95"
                                    >
                                        {displayUser.avatar || displayUser.image ? (
                                            <Image
                                                src={displayUser.avatar || displayUser.image}
                                                alt={displayUser.fullName || displayUser.name}
                                                fill
                                                className="object-cover"
                                                unoptimized={(displayUser.avatar || displayUser.image).startsWith('http')}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-4xl font-black text-white">
                                                {initial}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Camera className="w-8 h-8 text-white" />
                                        </div>
                                        {isLoading && (
                                            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
                                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                                            </div>
                                        )}
                                    </button>

                                    {/* Online Status Badge */}
                                    <div className="flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                        <div className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                                        <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
                                            {online ? 'Đang trực tuyến' : 'Ngoại tuyến'}
                                        </span>
                                    </div>

                                    <div className="mt-6 text-center">
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                            {displayUser.fullName || displayUser.name}
                                        </h3>
                                        <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20">
                                            <Shield className="w-3.5 h-3.5" />
                                            {roleName}
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={onEditAvatar}
                                        className="mt-8 w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-3 hover:shadow-2xl active:scale-95 transition-all"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        CHỈNH SỬA HỒ SƠ
                                    </button>
                                </div>

                                <div className="mt-10 space-y-10">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Chi tiết tài khoản</h4>
                                            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                                        </div>
                                        
                                        <div className="grid gap-6">
                                            <div className="flex items-start gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                                                    <Mail className="w-5 h-5 text-indigo-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email liên hệ</p>
                                                    {isLoading ? (
                                                        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
                                                    ) : (
                                                        <p className="text-slate-900 dark:text-slate-200 font-bold">{displayUser.email || 'Chưa cập nhật'}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                                                    <Phone className="w-5 h-5 text-indigo-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Số điện thoại</p>
                                                    <p className="text-slate-900 dark:text-slate-200 font-bold">{displayUser.phone || displayUser.soDienThoai || 'Chưa cập nhật'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                                                    <MapPin className="w-5 h-5 text-indigo-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cơ sở làm việc</p>
                                                    <p className="text-slate-900 dark:text-slate-200 font-bold">Hệ thống i-Tech Garage</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                                                    <Calendar className="w-5 h-5 text-indigo-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ngày gia nhập</p>
                                                    {isLoading ? (
                                                        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
                                                    ) : (
                                                        <p className="text-slate-900 dark:text-slate-200 font-bold">
                                                            {displayUser.createdAt ? format(joinDate, 'dd MMMM, yyyy', { locale: vi }) : '-- / -- / ----'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 mt-auto text-center">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
                                    Enterprise System v1.2.4
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </Portal>
            )}
        </AnimatePresence>
    );
}
