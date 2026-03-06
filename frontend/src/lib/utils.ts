import { type ClassValue } from "clsx";
import { clsx } from "clsx";

// Simplified cn without tailwind-merge to avoid dependency issues
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

export const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

export const formatDate = (date: Date | string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleString('vi-VN');
};

export function removeAccents(str: string) {
    return str.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
}
