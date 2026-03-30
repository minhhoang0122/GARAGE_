import { z } from 'zod';

// Schema cho Tiếp nhận xe
export const receptionSchema = z.object({
    bienSo: z.string().regex(/^([1-9][0-9][A-Z]-[0-9]{3}\.[0-9]{2})|([1-9][0-9][A-Z]-[0-9]{4})|([1-9][0-9]-[A-Z][0-9]-[0-9]{3}\.[0-9]{2})|([1-9][0-9]-[A-Z][0-9]-[0-9]{4})$/, 'Biển số không đúng định dạng (VD: 30A-123.45 hoặc 29-X1-123.45)'),
    vehicleType: z.enum(['CAR', 'MOTO']),
    odo: z.number().min(0, 'ODO không thể nhỏ hơn 0'),
    fuel: z.number().min(0).max(100),
    bodyStatus: z.string().min(1, 'Tình trạng vỏ xe không được để trống'),
    request: z.string().optional(),
    
    // Thông tin xe mới (nếu chưa tồn tại)
    nhanHieu: z.string().optional(),
    model: z.string().optional(),
    soKhung: z.string().optional(),
    soMay: z.string().optional(),
    
    // Thông tin khách hàng mới (nếu chưa tồn tại)
    tenKhach: z.string().min(1, 'Tên khách hàng không được để trống'),
    sdtKhach: z.string().regex(/^(0|(?:\+84))[0-9]{8,9}$/, 'Số điện thoại không hợp lệ'),
    diaChiKhach: z.string().optional(),
    emailKhach: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
    
    hinhAnh: z.string().optional(),
});

// Schema cho Đơn hàng
export const orderSchema = z.object({
    receptionId: z.number(),
    status: z.string(),
    items: z.array(z.object({
        productId: z.number(),
        quantity: z.number().min(1),
        price: z.number().min(0),
        note: z.string().optional(),
    })),
    notes: z.string().optional(),
});

// Schema cho Nhập kho
export const importSchema = z.object({
    supplier: z.string().min(1, 'Vui lòng chọn hoặc nhập tên nhà cung cấp'),
    items: z.array(z.object({
        productId: z.number(),
        quantity: z.number().gt(0, 'Số lượng phải lớn hơn 0'),
        costPrice: z.number().min(0, 'Giá vốn không thể âm'),
        sellingPrice: z.number().optional(),
        expiryDate: z.string().optional(),
    })).min(1, 'Phải có ít nhất một mặt hàng nhập kho'),
});

// Schema cho Người dùng
export const userSchema = z.object({
    username: z.string().min(3, 'Tên đăng nhập phải ít nhất 3 ký tự'),
    password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự trở lên').optional().or(z.literal('')),
    fullName: z.string().min(1, 'Họ tên không được để trống'),
    phone: z.string().regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ'),
    roleCodes: z.array(z.string()).min(1, 'Phải chọn ít nhất một quyền'),
});

export type ReceptionSchema = z.infer<typeof receptionSchema>;
export type OrderSchema = z.infer<typeof orderSchema>;
export type ImportSchema = z.infer<typeof importSchema>;
export type UserSchema = z.infer<typeof userSchema>;
