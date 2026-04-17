'use client';

import React, { useState, useEffect } from 'react';
import { Search, Command, X, Car, User, FileText, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SaleOmniSearch() {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Keyboard Shortcut (Cmd/Ctrl + K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('omni-search')?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="relative w-full max-w-2xl mx-auto mb-8 z-40">
            <motion.div
                animate={{ 
                    scale: isFocused ? 1.02 : 1,
                    boxShadow: isFocused ? '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' : '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                }}
                className={`
                    relative flex items-center bg-white dark:bg-slate-900 border transition-colors duration-300 rounded-2xl overflow-hidden
                    ${isFocused ? 'border-indigo-500 dark:border-indigo-400' : 'border-slate-200 dark:border-slate-800'}
                `}
            >
                <div className="pl-4 text-slate-400">
                    <Search size={20} />
                </div>
                
                <input
                    id="omni-search"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    placeholder="Tìm biển số xe, tên khách hàng hoặc mã đơn..."
                    className="w-full h-14 px-4 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 placeholder:font-normal"
                    autoComplete="off"
                />

                <div className="pr-4 flex items-center gap-2">
                    {query && (
                        <button 
                            onClick={() => setQuery('')}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400"
                        >
                            <X size={16} />
                        </button>
                    )}
                    <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[10px] font-bold text-slate-400 uppercase tracking-tighter cursor-default">
                        <Command size={10} />
                        <span>K</span>
                    </div>
                </div>
            </motion.div>

            {/* Results Preview (Mockup for now) */}
            <AnimatePresence>
                {isFocused && query.length > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        className="absolute top-16 left-0 right-0 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
                    >
                        <div className="p-2">
                             <div className="px-3 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Gợi ý tìm kiếm</div>
                             
                             {/* Mock Result 1 */}
                             <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-all cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                                        <Car size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">{query.toUpperCase()}</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Xe đang trong xưởng • Toyota Camry</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                             </div>

                             {/* Quick Actions */}
                             <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-900">
                                <div className="flex items-center gap-2 p-3 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all cursor-pointer group text-emerald-600 dark:text-emerald-400">
                                    <FileText size={16} />
                                    <span className="text-[11px] font-bold uppercase tracking-tight">Tạo đơn mới cho "{query}"</span>
                                </div>
                             </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                             <span className="text-[9px] font-medium text-slate-400">Tìm thấy 3 kết quả phù hợp</span>
                             <div className="flex gap-4 text-[10px] font-bold text-slate-400">
                                <span className="flex items-center gap-1">↑↓ Chọn</span>
                                <span className="flex items-center gap-1">↵ Mở</span>
                             </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
