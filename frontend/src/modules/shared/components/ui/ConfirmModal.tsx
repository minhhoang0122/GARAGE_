'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertTriangle, CheckCircle, X, Loader2 } from 'lucide-react';

interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'warning' | 'danger' | 'info';
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within ConfirmProvider');
    }
    return context.confirm;
}

interface ConfirmProviderProps {
    children: ReactNode;
}

export function ConfirmProvider({ children }: ConfirmProviderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setOptions(opts);
            setResolver(() => resolve);
            setIsOpen(true);
        });
    }, []);

    const handleConfirm = () => {
        setIsOpen(false);
        resolver?.(true);
    };

    const handleCancel = () => {
        setIsOpen(false);
        resolver?.(false);
    };

    const typeStyles = {
        warning: {
            icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            button: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'
        },
        danger: {
            icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
            bg: 'bg-red-50 dark:bg-red-900/20',
            button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        },
        info: {
            icon: <CheckCircle className="w-6 h-6 text-blue-500" />,
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            button: 'bg-slate-900 hover:bg-slate-800 focus:ring-slate-500'
        }
    };

    const style = options?.type ? typeStyles[options.type] : typeStyles.warning;

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={handleCancel}
                    />

                    {/* Modal */}
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 slide-in-from-bottom-4 duration-200 overflow-hidden">
                        {/* Header */}
                        <div className={`p-4 ${style.bg} flex items-center gap-3`}>
                            <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                                {style.icon}
                            </div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                                {options?.title || 'Xác nhận'}
                            </h3>
                            <button
                                onClick={handleCancel}
                                className="ml-auto p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700 transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">
                                {options?.message}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="px-6 pb-6 flex gap-3 justify-end">
                            <button
                                onClick={handleCancel}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
                            >
                                {options?.cancelText || 'Hủy'}
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`px-5 py-2.5 rounded-xl text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${style.button}`}
                            >
                                {options?.confirmText || 'Xác nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}
