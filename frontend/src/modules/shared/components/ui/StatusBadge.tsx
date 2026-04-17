'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
    status: string;
    className?: string;
}

import { STATUS_MAPPING } from '@/lib/status';

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = STATUS_MAPPING[status] || {
        label: status,
        badgeClassName: 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/50',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors',
                config.badgeClassName,
                className
            )}
        >
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-60" />
            {config.label}
        </span>
    );
}
