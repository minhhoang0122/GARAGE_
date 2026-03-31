'use client';

import * as React from 'react';

// Simple Sheet component - slide-out panel from right side
interface SheetProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in-0 duration-300"
                onClick={() => onOpenChange?.(false)}
            />
            {children}
        </div>
    );
}

interface SheetContentProps {
    side?: 'right' | 'left';
    className?: string;
    children: React.ReactNode;
}

export function SheetContent({ side = 'right', className = '', children }: SheetContentProps) {
    return (
        <div
            className={`fixed inset-y-0 ${side === 'right' ? 'right-0' : 'left-0'} z-50 
            animate-in ${side === 'right' ? 'slide-in-from-right-full' : 'slide-in-from-left-full'} 
            duration-300 ease-out shadow-2xl
            ${className}`}
        >
            {children}
        </div>
    );
}

interface SheetHeaderProps {
    className?: string;
    children: React.ReactNode;
}

export function SheetHeader({ className = '', children }: SheetHeaderProps) {
    return <div className={`${className}`}>{children}</div>;
}

interface SheetTitleProps {
    className?: string;
    children: React.ReactNode;
}

export function SheetTitle({ className = '', children }: SheetTitleProps) {
    return <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>;
}
