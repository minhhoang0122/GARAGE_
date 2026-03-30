import * as z from 'zod';

export const importItemSchema = z.object({
    product: z.any(),
    quantity: z.number().min(1, 'Số lượng ít nhất là 1'),
    costPrice: z.number().min(0, 'Giá vốn không thể âm'),
    vatRate: z.number(),
    expiryDate: z.string().optional(),
    sellingPrice: z.number().optional(),
    updateGlobalPrice: z.boolean(),
});

export const importSchema = z.object({
    supplierId: z.number().optional(),
    supplierName: z.string().min(1, 'Vui lòng chọn hoặc nhập tên nhà cung cấp'),
    note: z.string().optional(),
    items: z.array(importItemSchema).min(1, 'Vui lòng thêm ít nhất 1 sản phẩm'),
});

export type ImportSchema = z.infer<typeof importSchema>;
export type ImportItemSchema = z.infer<typeof importItemSchema>;
