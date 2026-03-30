import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Camera, Loader2, User as UserIcon, LogOut, Settings, UserCircle } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileDrawer from './ProfileDrawer';
import AvatarUploadModal from './AvatarUploadModal';
import { usePresence } from '@/hooks/usePresence';
import BaseAvatar from '@/modules/shared/components/common/BaseAvatar';
import { ROLE_DISPLAY_NAMES } from '@/config/menu';

export default function UserAvatar() {
    const { data: session, update } = useSession();
    const [isUploading, setIsUploading] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const menuRef = useRef<HTMLDivElement>(null);

    const user = session?.user;
    const avatarUrl = user?.image;
    const initial = user?.name?.charAt(0).toUpperCase() || 'U';
    const roleName = (user as any)?.vaiTro || (user as any)?.roles?.[0]?.name || (user as any)?.roles?.[0] || 'Chưa xác định';
    const { isOnline } = usePresence();
    const online = isOnline(user?.id || '');

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAvatarClick = () => {
        if (!isUploading) {
            setShowMenu(!showMenu);
        }
    };

    const handleUpload = async (file: File) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'avatars');

        try {
            const uploadRes = await api.upload('/images/upload', formData);
            if (!uploadRes.url) throw new Error('Không nhận được URL ảnh');

            const newAvatarUrl = uploadRes.url;

            await api.patch(`/users/${user?.id}/avatar`, {
                avatar: newAvatarUrl
            });

            await update({
                ...session,
                user: {
                    ...session?.user,
                    image: newAvatarUrl
                },
                avatar: newAvatarUrl
            });

            toast.success('Cập nhật ảnh đại diện thành công');
        } catch (error: any) {
            console.error('Avatar upload error:', error);
            const errorMsg = error.message || (typeof error === 'string' ? error : 'Lỗi khi cập nhật ảnh đại diện');
            toast.error(errorMsg);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="relative pl-1" ref={menuRef}>
            {/* Avatar Button */}
            <div className="relative group">
                <BaseAvatar
                    src={avatarUrl}
                    name={user?.name || 'User'}
                    online={online}
                    size="md"
                    isLoading={isUploading}
                    onClick={handleAvatarClick}
                    active={showMenu}
                />

                {/* Shortcut Camera Icon on Hover */}
                {!isUploading && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsModalOpen(true);
                        }}
                        className="absolute -bottom-1 -right-1 p-1.5 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                        <Camera className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                    </button>
                )}
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {showMenu && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.1, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-[100]"
                    >
                        {/* Header */}
                        <div className="px-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                {user?.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {ROLE_DISPLAY_NAMES[roleName] || roleName}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="py-1">
                            <button 
                                onClick={() => { setShowMenu(false); setIsDrawerOpen(true); }}
                                className="w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors"
                            >
                                <UserCircle className="w-4 h-4" />
                                <span>Hồ sơ của tôi</span>
                            </button>
                            <button
                                onClick={() => { setShowMenu(false); setIsModalOpen(true); }}
                                className="w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors"
                            >
                                <Camera className="w-4 h-4" />
                                <span>Đổi ảnh đại diện</span>
                            </button>
                            <button className="w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors">
                                <Settings className="w-4 h-4" />
                                <span>Cài đặt</span>
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="py-1 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => signOut()}
                                className="w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal & Drawer */}
            <AvatarUploadModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                currentAvatar={avatarUrl}
                onUpload={handleUpload}
            />
            
            <ProfileDrawer 
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onEditAvatar={() => {
                    setIsDrawerOpen(false);
                    setIsModalOpen(true);
                }}
                user={user}
            />
        </div>
    );
}
