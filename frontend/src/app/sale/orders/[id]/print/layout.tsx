import React from 'react';

/**
 * Clean layout for print pages - no sidebar, no navigation
 */
export default function PrintPageLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white p-8 print:p-0">
            {children}
        </div>
    );
}
