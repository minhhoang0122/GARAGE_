'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-300 group active:scale-95 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md"
            title={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
        >
            <div className="relative w-5 h-5 flex items-center justify-center">
                <Sun className={`w-5 h-5 absolute transition-all duration-500 transform ${theme === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'} text-amber-500`} />
                <Moon className={`w-5 h-5 absolute transition-all duration-500 transform ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'} text-blue-400`} />
            </div>
        </button>
    );
}
