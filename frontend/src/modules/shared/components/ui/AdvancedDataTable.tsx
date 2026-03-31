'use client';

import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Filter, MoreHorizontal, Download, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/modules/shared/components/ui/table';

export interface Column<T> {
    header: string;
    accessorKey: keyof T | string;
    render?: (value: any, item: T) => React.ReactNode;
    className?: string;
}

interface AdvancedDataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    isLoading?: boolean;
    searchPlaceholder?: string;
    searchFields?: (keyof T | string)[];
    onSearch?: (value: string) => void;
    tabs?: { id: string; label: string }[];
    activeTab?: string;
    onTabChange?: (tabId: string) => void;
    emptyState?: {
        title?: string;
        description?: string;
        icon?: React.ReactNode;
    };
    actionButton?: React.ReactNode;
    className?: string;
}

export function AdvancedDataTable<T extends { id: string | number }>({
    data,
    columns,
    isLoading,
    searchPlaceholder = 'Tìm kiếm...',
    searchFields,
    onSearch,
    tabs,
    activeTab,
    onTabChange,
    emptyState,
    actionButton,
    className
}: AdvancedDataTableProps<T>) {
    const [searchValue, setSearchValue] = useState('');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);
        if (onSearch) onSearch(value);
    };

    // Internal filtering if onSearch is not provided
    const displayData = onSearch ? data : data.filter((item) => {
        if (!searchValue) return true;
        
        const searchTarget = searchFields 
            ? searchFields.map(field => String(item[field as keyof T] || '')).join(' ').toLowerCase()
            : Object.values(item).map(val => String(val || '')).join(' ').toLowerCase();
            
        return searchTarget.includes(searchValue.toLowerCase());
    });

    return (
        <div className={cn("space-y-4", className)}>
            {/* Header section with Tabs and Search */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Tabs / Pills */}
                {tabs && (
                    <div className="flex items-center gap-1 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl w-fit border border-slate-200/60 dark:border-slate-700/50 backdrop-blur-sm overflow-x-auto max-w-full no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange?.(tab.id)}
                                className={cn(
                                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-600/50"
                                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-3 ml-auto w-full lg:w-auto">
                    {/* Search bar */}
                    <div className="relative group flex-1 lg:flex-initial">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            value={searchValue}
                            onChange={handleSearchChange}
                            placeholder={searchPlaceholder}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm w-full lg:w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-premium-sm"
                        />
                    </div>
                    {/* Optional Action Button (e.g. Create New) */}
                    {actionButton}
                </div>
            </div>

            {/* Table section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl md:overflow-hidden shadow-premium-md transition-all">
                
                {/* Mobile View (Cards) */}
                <div className="2xl:hidden flex flex-col gap-4 p-4 bg-slate-50/30 dark:bg-slate-950/20">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 animate-pulse shadow-sm">
                                <div className="h-4 bg-slate-100 dark:bg-slate-800 w-1/3 rounded mb-4"></div>
                                <div className="space-y-3">
                                    <div className="h-3 bg-slate-100 dark:bg-slate-800 w-full rounded"></div>
                                    <div className="h-3 bg-slate-100 dark:bg-slate-800 w-5/6 rounded"></div>
                                </div>
                            </div>
                        ))
                    ) : displayData.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
                                {emptyState?.icon || <Filter className="w-8 h-8" />}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                                {emptyState?.title || 'Không tìm thấy dữ liệu'}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                                {emptyState?.description || 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem kết quả khác.'}
                            </p>
                        </div>
                    ) : (
                        displayData.map((item) => (
                            <div 
                                key={item.id} 
                                className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col gap-3"
                            >
                                {columns.map((col, idx) => {
                                    const content = col.render ? col.render(item[col.accessorKey as keyof T], item) : (item[col.accessorKey as keyof T] as React.ReactNode);
                                    
                                    // Skip empty contents to keep mobile clean
                                    if (content === null || content === undefined || content === '') return null;

                                    return (
                                        <div key={idx} className="flex justify-between items-start gap-3 border-b border-slate-50 dark:border-slate-800/50 pb-3 mb-1 last:border-0 last:pb-0 last:mb-0">
                                            {col.header && (
                                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5 shrink-0 max-w-[40%] break-words">
                                                    {col.header}
                                                </span>
                                            )}
                                            <div className="text-sm flex-1 flex flex-col items-end text-right min-w-0 break-words">
                                                {content}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop View (Table) */}
                <div className="hidden 2xl:block overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-950/20">
                            <TableRow className="hover:bg-transparent border-b border-slate-100 dark:border-slate-800">
                                {columns.map((col, idx) => (
                                    <TableHead 
                                        key={idx} 
                                        className={cn(
                                            "h-12 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-6 whitespace-nowrap",
                                            col.className
                                        )}
                                    >
                                        {col.header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        {columns.map((_, j) => (
                                            <TableCell key={j} className="px-6 py-4">
                                                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full opacity-50" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : displayData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-64 py-12">
                                        <div className="flex flex-col items-center justify-center text-center px-4">
                                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
                                                {emptyState?.icon || <Filter className="w-8 h-8" />}
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                                                {emptyState?.title || 'Không tìm thấy dữ liệu'}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                                                {emptyState?.description || 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem kết quả khác.'}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                displayData.map((item) => (
                                    <TableRow 
                                        key={item.id} 
                                        className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors"
                                    >
                                        {columns.map((col, idx) => (
                                            <TableCell 
                                                key={idx} 
                                                className={cn(
                                                    "px-6 py-4 text-sm font-medium transition-transform duration-300",
                                                    col.className
                                                )}
                                            >
                                                {col.render ? col.render(item[col.accessorKey as keyof T], item) : (item[col.accessorKey as keyof T] as React.ReactNode)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Footer section (Pagination placeholder) */}
                {!isLoading && displayData.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-bold bg-slate-50/30 dark:bg-slate-900/50">
                        <div>Hiển thị {displayData.length} hàng</div>
                        <div className="flex items-center gap-2">
                            <button className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-all shadow-sm" disabled>
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-2">Trang 1</span>
                            <button className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-all shadow-sm" disabled>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

