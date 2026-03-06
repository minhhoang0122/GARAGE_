'use client';

export default function SidebarBg() {
    return (
        <div className="absolute inset-0 z-0 opacity-[0.4] dark:opacity-[0.1] pointer-events-none"
            style={{
                backgroundImage: 'radial-gradient(#cbd5e1 0.5px, transparent 0.5px)',
                backgroundSize: '24px 24px'
            }}>
        </div>
    );
}
