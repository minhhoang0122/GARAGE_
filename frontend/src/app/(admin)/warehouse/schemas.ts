import * as z from 'zod';
import { VALIDATION_LIMITS } from '@/lib/schemas';

export const importItemSchema = z.object({
    product: z.any(),
    quantity: z.number().min(1, 'Số lượng ít nhất là 1').max(VALIDATION_LIMITS.QUANTITY_MAX, `Số lượng tối đa ${VALIDATION_LIMITS.QUANTITY_MAX.toLocaleString('vi-VN')}`),
    costPrice: z.number().min(0, 'Giá vốn không thể âm').max(VALIDATION_LIMITS.PRICE_MAX, `Giá vốn tối đa ${VALIDATION_LIMITS.PRICE_MAX.toLocaleString('vi-VN')} đ`),
    vatRate: z.number().min(0).max(100, 'VAT tối đa 100%'),
    expiryDate: z.string().optional(),
    sellingPrice: z.number().min(0).max(VALIDATION_LIMITS.PRICE_MAX, `Giá bán tối đa ${VALIDATION_LIMITS.PRICE_MAX.toLocaleString('vi-VN')} đ`).optional(),
    updateGlobalPrice: z.boolean(),
});

export const importSchema = z.object({
    supplierId: z.number().optional(),
    supplierName: z.string().min(1, 'Vui lòng chọn hoặc nhập tên nhà cung cấp').max(VALIDATION_LIMITS.SUPPLIER_MAX, `Tên nhà cung cấp tối đa ${VALIDATION_LIMITS.SUPPLIER_MAX} ký tự`),
    note: z.string().max(VALIDATION_LIMITS.NOTE_MAX, `Ghi chú tối đa ${VALIDATION_LIMITS.NOTE_MAX} ký tự`).optional(),
    items: z.array(importItemSchema).min(1, 'Vui lòng thêm ít nhất 1 sản phẩm'),
});

export type ImportSchema = z.infer<typeof importSchema>;
export type ImportItemSchema = z.infer<typeof importItemSchema>;

