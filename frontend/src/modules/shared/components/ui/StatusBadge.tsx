'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
    status: string;
    className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
    // ===== Order Lifecycle (matches backend OrderStatus enum) =====
    'RECEIVED': {
        label: 'Đã tiếp nhận',
        className: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50',
    },
    'WAITING_FOR_DIAGNOSIS': {
        label: 'Chờ chẩn đoán',
        className: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50',
    },
    'QUOTING': {
        label: 'Đang báo giá',
        className: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50',
    },
    'RE_QUOTATION': {
        label: 'Báo giá lại',
        className: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50',
    },
    'WAITING_FOR_CUSTOMER_APPROVAL': {
        label: 'Chờ KH duyệt',
        className: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50',
    },
    'CUSTOMER_REJECTED': {
        label: 'KH từ chối',
        className: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50',
    },
    'APPROVED': {
        label: 'Đã duyệt',
        className: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50',
    },
    'WAITING_FOR_PARTS': {
        label: 'Chờ phụ tùng',
        className: 'bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800/50',
    },
    'IN_PROGRESS': {
        label: 'Đang sửa chữa',
        className: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50',
    },
    'WAITING_FOR_QC': {
        label: 'Chờ nghiệm thu',
        className: 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800/50',
    },
    'WAITING_FOR_PAYMENT': {
        label: 'Chờ thanh toán',
        className: 'bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800/50',
    },
    'COMPLETED': {
        label: 'Hoàn thành',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50',
    },
    'CLOSED': {
        label: 'Đã đóng HĐ',
        className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/50',
    },
    'CANCELLED': {
        label: 'Đã hủy',
        className: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50',
    },
    'SETTLED': {
        label: 'Đã quyết toán',
        className: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700/50',
    },

    // ===== Generic / Utility =====
    'PENDING': {
        label: 'Đang chờ',
        className: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50',
    },
    'SUCCESS': {
        label: 'Thành công',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50',
    },
    'WARNING': {
        label: 'Cảnh báo',
        className: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50',
    },
    'ERROR': {
        label: 'Lỗi',
        className: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50',
    },
    'INFO': {
        label: 'Thông tin',
        className: 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/50',
    },

    // ===== Payment =====
    'PAID': {
        label: 'Đã thanh toán',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50',
    },
    'UNPAID': {
        label: 'Chưa thanh toán',
        className: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50',
    },
    'PARTIAL': {
        label: 'Thanh toán một phần',
        className: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50',
    },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfig[status] || {
        label: status,
        className: 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/50',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors',
                config.className,
                className
            )}
        >
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-60" />
            {config.label}
        </span>
    );
}
