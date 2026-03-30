'use client';
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextType {
    showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((type: ToastType, message: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, type, message }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
            case 'warning': return <AlertCircle className="w-5 h-5 text-amber-500" />;
            case 'info': return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getStyles = (type: ToastType) => {
        switch (type) {
            case 'success': return 'border-emerald-100 dark:border-emerald-900 bg-white dark:bg-slate-900 shadow-emerald-500/10';
            case 'error': return 'border-red-100 dark:border-red-900 bg-white dark:bg-slate-900 shadow-red-500/10';
            case 'warning': return 'border-amber-100 dark:border-amber-900 bg-white dark:bg-slate-900 shadow-amber-500/10';
            case 'info': return 'border-blue-100 dark:border-blue-900 bg-white dark:bg-slate-900 shadow-blue-500/10';
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 p-4 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
                            pointer-events-auto flex items-start gap-3 pl-4 pr-10 py-4 w-80 rounded-lg shadow-lg border
                            ${getStyles(toast.type)}
                            animate-in slide-in-from-right-full duration-300 fade-in
                        `}
                    >
                        <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold capitalize text-slate-800 dark:text-slate-100 mb-1">{toast.type === 'info' ? 'Thông báo' : toast.type === 'error' ? 'Lỗi' : toast.type === 'success' ? 'Thành công' : 'Cảnh báo'}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};
