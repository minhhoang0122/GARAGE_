'use client';

import React from 'react';
import { ChevronUp, ChevronDown, Settings, Eye, EyeOff, Trash2, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditableWrapperProps {
    children: React.ReactNode;
    isEditMode: boolean;
    sectionId: string;
    isActive: boolean;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onToggleActive: () => void;
    onEdit: () => void;
    onDelete?: () => void;
}

export default function EditableWrapper({
    children,
    isEditMode,
    sectionId,
    isActive,
    onMoveUp,
    onMoveDown,
    onToggleActive,
    onEdit,
    onDelete
}: EditableWrapperProps) {
    if (!isEditMode) {
        return <>{children}</>;
    }

    return (
        <div className={`relative group/wrapper border-2 transition-all duration-300 ${isActive ? 'border-transparent hover:border-orange-500/50' : 'border-dashed border-stone-300 grayscale opacity-60'}`}>
            {/* Toolbar Overlay - Centered Floating */}
            <div className="absolute top-0 left-0 right-0 z-40 flex justify-center -translate-y-1/2 opacity-0 group-hover/wrapper:opacity-100 transition-all pointer-events-none group-hover/wrapper:translate-y-[-50%]">
                <div className="bg-[#111] text-white flex items-center gap-1 p-1.5 rounded-full shadow-2xl border border-white/20 pointer-events-auto backdrop-blur-md">
                    <div className="px-4 border-r border-white/10 flex items-center gap-2">
                        <GripVertical size={14} className="text-stone-500 cursor-grab active:cursor-grabbing" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">{sectionId}</span>
                    </div>

                    <div className="flex items-center gap-1 px-1">
                        <ControlButton 
                            onClick={onMoveUp} 
                            icon={<ChevronUp size={16} />} 
                            tooltip="Di chuyển lên"
                        />
                        <ControlButton 
                            onClick={onMoveDown} 
                            icon={<ChevronDown size={16} />} 
                            tooltip="Di chuyển xuống"
                        />
                    </div>

                    <div className="w-[1px] h-4 bg-white/10 mx-1" />

                    <div className="flex items-center gap-1 px-1">
                        <ControlButton 
                            onClick={onEdit} 
                            icon={<Settings size={16} />} 
                            tooltip="Cấu hình Section"
                        />
                        <ControlButton 
                            onClick={onToggleActive} 
                            icon={isActive ? <Eye size={16} /> : <EyeOff size={16} className="text-orange-500 text-glow" />} 
                            tooltip={isActive ? "Tạm ẩn" : "Hiển thị lại"}
                        />
                    </div>

                    {onDelete && (
                        <>
                            <div className="w-[1px] h-4 bg-white/10 mx-1" />
                            <ControlButton 
                                onClick={onDelete} 
                                icon={<Trash2 size={16} />} 
                                variant="danger"
                                tooltip="Gỡ bỏ"
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Inactive State Visual Feedback */}
            {!isActive && (
                <div className="absolute inset-0 bg-stone-100/50 z-10 flex items-center justify-center pointer-events-none backdrop-grayscale-[0.5]">
                    <div className="bg-stone-900 text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl border border-white/10">
                        <EyeOff size={16} className="text-stone-500" /> 
                        Nội dung này đang được ẩn khỏi khách hàng
                    </div>
                </div>
            )}

            {children}
            
            {/* Visual indicator for active editing */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent opacity-0 group-hover/wrapper:opacity-100 transition-opacity" />
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent opacity-0 group-hover/wrapper:opacity-100 transition-opacity" />
        </div>
    );
}

function ControlButton({ 
    onClick, 
    icon, 
    tooltip, 
    variant = 'default' 
}: { 
    onClick: () => void; 
    icon: React.ReactNode; 
    tooltip: string;
    variant?: 'default' | 'danger';
}) {
    return (
        <div className="relative group/btn">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    variant === 'danger' 
                    ? 'hover:bg-red-600 hover:text-white text-stone-400' 
                    : 'hover:bg-orange-600 hover:text-white text-stone-300'
                }`}
            >
                {icon}
            </button>
            <AnimatePresence>
                <motion.div 
                    initial={{ opacity: 0, y: 10, x: '-50%' }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-[#111] text-white text-[10px] font-bold uppercase tracking-wider rounded border border-white/10 whitespace-nowrap opacity-0 group-hover/btn:opacity-100 pointer-events-none shadow-2xl z-50 transition-all"
                >
                    {tooltip}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#111]" />
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
