'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LayoutContextType {
    title: string;
    subtitle: string;
    isFullWidth: boolean;
    isImmersive: boolean;
    setTitle: (title: string) => void;
    setSubtitle: (subtitle: string) => void;
    setIsFullWidth: (isFullWidth: boolean) => void;
    setIsImmersive: (isImmersive: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [isFullWidth, setIsFullWidth] = useState(false);
    const [isImmersive, setIsImmersive] = useState(false);

    return (
        <LayoutContext.Provider value={{ 
            title, 
            subtitle, 
            isFullWidth, 
            isImmersive,
            setTitle, 
            setSubtitle, 
            setIsFullWidth,
            setIsImmersive 
        }}>
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
