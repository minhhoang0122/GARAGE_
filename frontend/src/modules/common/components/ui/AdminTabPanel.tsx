'use client';

import { useState, ReactNode } from 'react';

export interface TabItem {
    key: string;
    label: string;
    icon?: ReactNode;
    content: ReactNode;
}

interface AdminTabPanelProps {
    tabs: TabItem[];
    defaultTab?: string;
    title?: string;
    subtitle?: string;
}

/**
 * Reusable tabbed panel for merged admin pages.
 * Renders horizontal tab navigation + content area without DashboardLayout wrapper.
 */
export function AdminTabPanel({ tabs, defaultTab, title, subtitle }: AdminTabPanelProps) {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.key || '');

    const currentTab = tabs.find(t => t.key === activeTab) || tabs[0];

    return (
        <div className="space-y-6">
            {(title || subtitle) && (
                <div className="mb-8">
                    {title && <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{title}</h1>}
                    {subtitle && <p className="text-slate-500 dark:text-slate-400">{subtitle}</p>}
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-x-auto scrollbar-none">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`
                            flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200
                            ${activeTab === tab.key
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-slate-700'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
                            }
                        `}
                    >
                        {tab.icon && <span className="w-4 h-4 flex-shrink-0">{tab.icon}</span>}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in duration-200">
                {currentTab?.content}
            </div>
        </div>
    );
}
