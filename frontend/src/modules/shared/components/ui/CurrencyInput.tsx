'use client';

import { useState, useCallback, useEffect } from 'react';
import { Input } from './input';

interface CurrencyInputProps {
    value: number | string;
    onChange: (value: number) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    required?: boolean;
    min?: number;
    max?: number;
}

/**
 * Format number to VNĐ style with dot separators
 * Example: 2500000 -> "2.500.000"
 */
function formatCurrency(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value.replace(/\./g, '')) : value;
    if (isNaN(num) || num === 0) return '';
    return num.toLocaleString('vi-VN');
}

/**
 * Parse VNĐ formatted string to number
 * Example: "2.500.000" -> 2500000
 */
function parseCurrency(value: string): number {
    // Remove all dots (thousand separators in Vietnamese)
    const cleaned = value.replace(/\./g, '').replace(/,/g, '');
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? 0 : num;
}

export default function CurrencyInput({
    value,
    onChange,
    placeholder = '0',
    className = '',
    disabled = false,
    required = false,
    min,
    max
}: CurrencyInputProps) {
    const [displayValue, setDisplayValue] = useState<string>('');

    // Sync display value when prop changes, but avoid overriding if it matches (to prevent cursor jumps)
    useEffect(() => {
        const currentParsed = parseCurrency(displayValue);
        const propValue = typeof value === 'string' ? parseCurrency(value) : value;

        if (currentParsed !== propValue) {
            if (propValue > 0) {
                setDisplayValue(formatCurrency(propValue));
            } else if (propValue === 0 && displayValue !== '') {
                // Only clear if prop specifically forces 0 and user didn't just type it (handled by onChange)
                // Actually for "0", we usually want empty string in display unless it's a specific "0" value.
                // But sticking to the existing logic: 0 -> empty string
                setDisplayValue('');
            }
        }
    }, [value]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;

        // Only allow digits and dots
        const cleaned = rawValue.replace(/[^\d]/g, '');

        if (cleaned === '') {
            setDisplayValue('');
            onChange(0);
            return;
        }

        const numValue = parseInt(cleaned, 10);

        // Check min/max
        if (min !== undefined && numValue < min) return;
        if (max !== undefined && numValue > max) return;

        // Format and update
        const formatted = formatCurrency(numValue);
        setDisplayValue(formatted);
        onChange(numValue);
    }, [onChange, min, max]);

    return (
        <div className="relative">
            <Input
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={handleChange}
                placeholder={placeholder}
                className={`text-right font-semibold pr-12 ${className}`}
                disabled={disabled}
                required={required}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium pointer-events-none">
                đ
            </span>
        </div>
    );
}
