'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LayoutContextType {
    title: string;
    subtitle: string;
    setTitle: (title: string) => void;
    setSubtitle: (subtitle: string) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');

    return (
        <LayoutContext.Provider value={{ title, subtitle, setTitle, setSubtitle }}>
            {children}
        </LayoutContext.Provider>
    );
}

export function useLayoutContext() {
    const context = useContext(LayoutContext);
    if (context === undefined) {
        throw new Error('useLayoutContext must be used within a LayoutProvider');
    }
    return context;
}
