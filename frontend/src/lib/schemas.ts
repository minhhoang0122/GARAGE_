import { z } from 'zod';

// =============================================
// VALIDATION CONSTANTS
// Centralized limits for consistency across the app
// =============================================
export const VALIDATION_LIMITS = {
    // String lengths
    NAME_MAX: 100,
    USERNAME_MAX: 50,
    PASSWORD_MIN: 6,
    PASSWORD_MAX: 128,
    PHONE_MAX: 15,
    ADDRESS_MAX: 255,
    EMAIL_MAX: 100,
    NOTE_MAX: 1000,
    PLATE_MAX: 15,
    VIN_MAX: 50, // soKhung, soMay
    BRAND_MAX: 50, // nhanHieu, model
    SUPPLIER_MAX: 150,

    // Number ranges
    ODO_MAX: 1_000_000,
    QUANTITY_MAX: 1_000_000,
    PRICE_MAX: 10_000_000_000, // 10 billion VND
    FUEL_MIN: 0,
    FUEL_MAX: 100,
} as const;

// Schema cho Tiếp nhận xe
export const receptionSchema = z.object({
    bienSo: z.string()
        .max(VALIDATION_LIMITS.PLATE_MAX, `Biển số tối đa ${VALIDATION_LIMITS.PLATE_MAX} ký tự`)
        .regex(/^([1-9][0-9][A-Z]-[0-9]{3}\.[0-9]{2})|([1-9][0-9][A-Z]-[0-9]{4})|([1-9][0-9]-[A-Z][0-9]-[0-9]{3}\.[0-9]{2})|([1-9][0-9]-[A-Z][0-9]-[0-9]{4})$/, 'Biển số không đúng định dạng (VD: 30A-123.45 hoặc 29-X1-123.45)'),
    vehicleType: z.enum(['CAR', 'MOTO']),
    odo: z.number().min(0, 'ODO không thể nhỏ hơn 0').max(VALIDATION_LIMITS.ODO_MAX, `ODO tối đa ${VALIDATION_LIMITS.ODO_MAX.toLocaleString('vi-VN')} km`),
    fuel: z.number().min(VALIDATION_LIMITS.FUEL_MIN).max(VALIDATION_LIMITS.FUEL_MAX),
    bodyStatus: z.string().min(1, 'Tình trạng vỏ xe không được để trống').max(VALIDATION_LIMITS.NOTE_MAX, `Tình trạng vỏ xe tối đa ${VALIDATION_LIMITS.NOTE_MAX} ký tự`),
    request: z.string().max(VALIDATION_LIMITS.NOTE_MAX, `Yêu cầu tối đa ${VALIDATION_LIMITS.NOTE_MAX} ký tự`).optional(),
    
    // Thông tin xe mới (nếu chưa tồn tại)
    nhanHieu: z.string().max(VALIDATION_LIMITS.BRAND_MAX, `Nhãn hiệu tối đa ${VALIDATION_LIMITS.BRAND_MAX} ký tự`).optional(),
    model: z.string().max(VALIDATION_LIMITS.BRAND_MAX, `Model tối đa ${VALIDATION_LIMITS.BRAND_MAX} ký tự`).optional(),
    soKhung: z.string().max(VALIDATION_LIMITS.VIN_MAX, `Số khung tối đa ${VALIDATION_LIMITS.VIN_MAX} ký tự`).optional(),
    soMay: z.string().max(VALIDATION_LIMITS.VIN_MAX, `Số máy tối đa ${VALIDATION_LIMITS.VIN_MAX} ký tự`).optional(),
    
    // Thông tin khách hàng mới (nếu chưa tồn tại)
    tenKhach: z.string().min(1, 'Tên khách hàng không được để trống').max(VALIDATION_LIMITS.NAME_MAX, `Tên khách hàng tối đa ${VALIDATION_LIMITS.NAME_MAX} ký tự`),
    sdtKhach: z.string().regex(/^(0|(?:\+84))[0-9]{8,9}$/, 'Số điện thoại không hợp lệ'),
    diaChiKhach: z.string().max(VALIDATION_LIMITS.ADDRESS_MAX, `Địa chỉ tối đa ${VALIDATION_LIMITS.ADDRESS_MAX} ký tự`).optional(),
    emailKhach: z.string().max(VALIDATION_LIMITS.EMAIL_MAX, `Email tối đa ${VALIDATION_LIMITS.EMAIL_MAX} ký tự`).email('Email không hợp lệ').optional().or(z.literal('')),
    
    hinhAnh: z.string().optional(),
});

// Schema cho Đơn hàng
export const orderSchema = z.object({
    receptionId: z.number(),
    status: z.string().max(50),
    items: z.array(z.object({
        productId: z.number(),
        quantity: z.number().min(1, 'Số lượng ít nhất là 1').max(VALIDATION_LIMITS.QUANTITY_MAX, `Số lượng tối đa ${VALIDATION_LIMITS.QUANTITY_MAX.toLocaleString('vi-VN')}`),
        price: z.number().min(0, 'Giá không thể âm').max(VALIDATION_LIMITS.PRICE_MAX, `Giá tối đa ${VALIDATION_LIMITS.PRICE_MAX.toLocaleString('vi-VN')} đ`),
        note: z.string().max(VALIDATION_LIMITS.NOTE_MAX, `Ghi chú tối đa ${VALIDATION_LIMITS.NOTE_MAX} ký tự`).optional(),
    })),
    notes: z.string().max(VALIDATION_LIMITS.NOTE_MAX, `Ghi chú tối đa ${VALIDATION_LIMITS.NOTE_MAX} ký tự`).optional(),
});

// Schema cho Nhập kho
export const importSchema = z.object({
    supplier: z.string().min(1, 'Vui lòng chọn hoặc nhập tên nhà cung cấp').max(VALIDATION_LIMITS.SUPPLIER_MAX, `Tên nhà cung cấp tối đa ${VALIDATION_LIMITS.SUPPLIER_MAX} ký tự`),
    items: z.array(z.object({
        productId: z.number(),
        quantity: z.number().gt(0, 'Số lượng phải lớn hơn 0').max(VALIDATION_LIMITS.QUANTITY_MAX, `Số lượng tối đa ${VALIDATION_LIMITS.QUANTITY_MAX.toLocaleString('vi-VN')}`),
        costPrice: z.number().min(0, 'Giá vốn không thể âm').max(VALIDATION_LIMITS.PRICE_MAX, `Giá vốn tối đa ${VALIDATION_LIMITS.PRICE_MAX.toLocaleString('vi-VN')} đ`),
        sellingPrice: z.number().min(0).max(VALIDATION_LIMITS.PRICE_MAX, `Giá bán tối đa ${VALIDATION_LIMITS.PRICE_MAX.toLocaleString('vi-VN')} đ`).optional(),
        expiryDate: z.string().optional(),
    })).min(1, 'Phải có ít nhất một mặt hàng nhập kho'),
});

// Schema cho Người dùng
export const userSchema = z.object({
    username: z.string().min(3, 'Tên đăng nhập phải ít nhất 3 ký tự').max(VALIDATION_LIMITS.USERNAME_MAX, `Tên đăng nhập tối đa ${VALIDATION_LIMITS.USERNAME_MAX} ký tự`),
    password: z.string().min(VALIDATION_LIMITS.PASSWORD_MIN, `Mật khẩu phải từ ${VALIDATION_LIMITS.PASSWORD_MIN} ký tự trở lên`).max(VALIDATION_LIMITS.PASSWORD_MAX, `Mật khẩu tối đa ${VALIDATION_LIMITS.PASSWORD_MAX} ký tự`).optional().or(z.literal('')),
    fullName: z.string().min(1, 'Họ tên không được để trống').max(VALIDATION_LIMITS.NAME_MAX, `Họ tên tối đa ${VALIDATION_LIMITS.NAME_MAX} ký tự`),
    phone: z.string().regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ'),
    roleCodes: z.array(z.string()).min(1, 'Phải chọn ít nhất một quyền'),
});

export type ReceptionSchema = z.infer<typeof receptionSchema>;
export type OrderSchema = z.infer<typeof orderSchema>;
export type ImportSchema = z.infer<typeof importSchema>;
export type UserSchema = z.infer<typeof userSchema>;
