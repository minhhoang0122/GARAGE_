'use client';

import { ReactNode, memo, useState, useCallback, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Loader2, User } from 'lucide-react';

interface BaseAvatarProps {
    id?: string | number; // Thêm id để sinh màu chính xác hơn
    src?: string | null;
    name?: string;
    online?: boolean;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    showBorder?: boolean;
    isLoading?: boolean;
    className?: string;
    showStatus?: boolean;
    onClick?: () => void;
    active?: boolean;
    isUnassigned?: boolean;
}

const getAvatarColor = (name: string, id?: string | number) => {
    const colors = [
        'from-indigo-500 to-blue-600',
        'from-emerald-500 to-teal-600',
        'from-amber-500 to-orange-600',
        'from-rose-500 to-pink-600',
        'from-violet-500 to-purple-600',
        'from-sky-500 to-blue-600',
        'from-cyan-500 to-teal-600',
        'from-fuchsia-500 to-purple-600',
        'from-blue-600 to-indigo-700',
        'from-teal-600 to-emerald-700'
    ];
    
    // Ưu tiên dùng ID để sinh màu bền vững (không thay đổi khi đổi tên)
    const seed = id ? String(id) : (name || 'User');
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const BaseAvatar: React.FC<BaseAvatarProps> = ({ 
    id,
    src, 
    name, 
    online, 
    size = 'md', 
    showBorder = true, 
    isLoading, 
    className = '', 
    showStatus = true,
    onClick,
    active,
    isUnassigned
}) => {
    const avatarColor = getAvatarColor(name || 'User', id);
    
    // Get up to 2 initials correctly
    const initials = useMemo(() => {
        if (!name || name.trim() === '') return 'U';
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return 'U';
        if (parts.length === 1) return parts[0][0].toUpperCase();
        
        // Lấy chữ cái đầu của từ đầu và từ cuối
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }, [name]);

    const sizeClasses = {
        xs: 'h-7 w-7 text-[9px]',
        sm: 'h-8 w-8 text-[10px]',
        md: 'h-9 w-9 md:h-10 md:w-10 text-[13px]',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-xl',
    };

    const statusSize = {
        xs: 'w-2 h-2',
        sm: 'w-2.5 h-2.5',
        md: 'w-3 h-3',
        lg: 'w-3.5 h-3.5',
        xl: 'w-4 h-4',
    };

    const isDefault = isUnassigned || (!src && !name);
    
    const containerStyle = `
        relative ${sizeClasses[size]} rounded-full overflow-hidden 
        ${isLoading ? 'bg-slate-200 dark:bg-slate-800 animate-pulse' : 
          isUnassigned ? 'bg-slate-50 dark:bg-slate-900/50' : `bg-gradient-to-tr ${avatarColor}`}
        flex items-center justify-center text-white font-black tracking-tight
        transition-all duration-300
        ${showBorder ? `border-2 shadow-sm ${active ? 'border-indigo-500 shadow-indigo-500/20' : 
          isUnassigned ? 'border-dashed border-slate-300 dark:border-slate-700' : 'border-white/10 dark:border-slate-800'}` : 'border-none shadow-none'}
        ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
    `;

    return (
        <div className={`relative flex-shrink-0 select-none group/avatar rounded-full ${className}`}>
            <div className={containerStyle} onClick={onClick}>
                {isLoading ? (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                ) : isUnassigned ? (
                    <User className="w-[60%] h-[60%] text-slate-300 dark:text-slate-700" />
                ) : src ? (
                    <div className="relative w-full h-full">
                        <Image 
                            src={src} 
                            alt={name || 'Avatar'} 
                            fill 
                            className="object-cover"
                            sizes="(max-width: 768px) 40px, 64px"
                        />
                    </div>
                ) : (
                    <span className="drop-shadow-sm">{initials}</span>
                )}
            </div>
            
            {showStatus && !isLoading && (
                <div className={`
                    absolute bottom-0 right-0 ${statusSize[size]} rounded-full border-2 border-white dark:border-slate-900 transition-all duration-300 z-10
                    ${online 
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] scale-110' 
                        : 'bg-slate-300 dark:bg-slate-700'}
                    group-hover/avatar:ring-2 group-hover/avatar:ring-white dark:group-hover/avatar:ring-slate-900
                `} />
            )}
        </div>
    );
};


export default BaseAvatar;
