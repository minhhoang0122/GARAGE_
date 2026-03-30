'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LicensePlateInputProps {
    value: string;
    onChange: (value: string) => void;
    type: 'CAR' | 'MOTO';
    className?: string;
    error?: string;
}

/**
 * Industrial License Plate Input
 * Supports automatic formatting for:
 * - CAR: 30A-123.45 or 30A-1234
 * - MOTO: 29-X1-123.45 or 29-X1-1234
 */
export const LicensePlateInput: React.FC<LicensePlateInputProps> = ({
    value,
    onChange,
    type,
    className,
    error
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const formatPlate = (raw: string, vehicleType: 'CAR' | 'MOTO') => {
        // Build clean string based on position rules
        const input = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
        let clean = '';

        for (let i = 0; i < input.length; i++) {
            const char = input[i];
            const currentPos = clean.length;
            
            if (vehicleType === 'CAR') {
                // CAR: 30A-123.45 (2 Numbers - 1 Letter - Numbers)
                if (currentPos < 2) {
                    if (/[0-9]/.test(char)) clean += char;
                } else if (currentPos === 2) {
                    if (/[A-Z]/.test(char)) clean += char;
                } else {
                    if (/[0-9]/.test(char)) clean += char;
                }
            } else {
                // MOTO: 29-X1-123.45 (2 Numbers - 1 Letter - 1 Number - Numbers)
                if (currentPos < 2) {
                    if (/[0-9]/.test(char)) clean += char;
                } else if (currentPos === 2) {
                    if (/[A-Z]/.test(char)) clean += char;
                } else if (currentPos === 3) {
                    if (/[0-9]/.test(char)) clean += char;
                } else {
                    if (/[0-9]/.test(char)) clean += char;
                }
            }
        }

        if (vehicleType === 'CAR') {
            if (clean.length <= 3) return clean;
            
            let s1 = clean.slice(0, 3);
            let s2 = clean.slice(3);
            
            if (s2.length > 3) {
                return `${s1}-${s2.slice(0, 3)}.${s2.slice(3, 5)}`;
            }
            return `${s1}-${s2}`;
        } else {
            if (clean.length <= 2) return clean;
            
            let s1 = clean.slice(0, 2);
            let rest = clean.slice(2);
            
            if (rest.length <= 2) return `${s1}-${rest}`;
            
            let s2 = rest.slice(0, 2);
            let s3 = rest.slice(2);
            
            if (s3.length > 3) {
                return `${s1}-${s2}-${s3.slice(0, 3)}.${s3.slice(3, 5)}`;
            }
            return `${s1}-${s2}-${s3}`;
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const formatted = formatPlate(rawValue, type);
        onChange(formatted);
    };

    return (
        <div className={cn("relative w-full", className)}>
            <div className={cn(
                "group flex items-center bg-white dark:bg-slate-900 border transition-all duration-100",
                error 
                    ? "border-red-500 bg-red-50/10" 
                    : "border-slate-300 dark:border-slate-700 focus-within:border-slate-900 dark:focus-within:border-slate-100",
                "rounded-lg overflow-hidden"
            )}>
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleInput}
                    placeholder={type === 'CAR' ? "00A-000.00" : "00-X0-000.00"}
                    className={cn(
                        "flex-1 bg-transparent px-4 py-4 text-2xl font-mono font-bold tracking-tight outline-none",
                        "text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-700 uppercase"
                    )}
                />
            </div>

            {error && (
                <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-red-600 tracking-tight">
                    <span className="w-1 h-1 rounded-full bg-red-600" />
                    {error}
                </div>
            )}
        </div>
    );
};
