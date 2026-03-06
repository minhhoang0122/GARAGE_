'use client';

import { useEffect } from 'react';

export default function PrintButton() {
    // Auto-trigger print dialog when page loads
    useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // No visible UI needed - print dialog opens automatically
    return null;
}
