import React from 'react';

interface StatCardProps {
    icon: React.ReactNode;
    value: string;
    label: string;
    color?: 'blue' | 'yellow' | 'green' | 'purple' | 'red' | 'slate';
    trend?: string;
}

const THEMES = {
    blue: { border: 'border-l-indigo-500', text: 'text-indigo-600 dark:text-indigo-400', ring: 'border-indigo-100 dark:border-indigo-900/30' },
    yellow: { border: 'border-l-amber-500', text: 'text-amber-500 dark:text-amber-400', ring: 'border-amber-100 dark:border-amber-900/30' },
    green: { border: 'border-l-emerald-500', text: 'text-emerald-500 dark:text-emerald-400', ring: 'border-emerald-100 dark:border-emerald-900/30' },
    purple: { border: 'border-l-purple-600', text: 'text-purple-600 dark:text-purple-400', ring: 'border-purple-100 dark:border-purple-900/30' },
    red: { border: 'border-l-rose-600', text: 'text-rose-600 dark:text-rose-400', ring: 'border-rose-100 dark:border-rose-900/30' },
    slate: { border: 'border-l-slate-900 dark:border-l-slate-400', text: 'text-slate-900 dark:text-slate-100', ring: 'border-slate-100 dark:border-slate-700' },
};

export default function IndustrialStatCard({ icon, value, label, color = 'blue', trend }: StatCardProps) {
    const t = THEMES[color];

    return (
        <div className={`relative bg-white dark:bg-slate-900 rounded-sm p-5 border border-slate-200 dark:border-slate-800 border-l-4 ${t.border} shadow-sm hover:shadow transition-shadow group flex flex-col justify-between h-full min-h-[120px]`}>
            {/* No Blobs. Pure Data. */}

            <div className="flex items-start justify-between mb-2">
                <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1" title={label}>
                        {label}
                    </p>
                    <h3 className="text-2xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white truncate">
                        {value}
                    </h3>
                </div>

                <div className={`w-8 h-8 flex items-center justify-center ${t.text} bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-sm`}>
                    {icon && typeof icon === 'object' ? React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4' } as any) : icon}
                </div>
            </div>

            {trend && (
                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-mono font-medium text-slate-400 truncate">{trend}</span>
                </div>
            )}
        </div>
    );
}
