import * as GeneratedApi from './generated';

export type ApiControllerName = keyof typeof GeneratedApi;

export interface ApiMetadata {
    name: string;
    factory: string;
    description: string;
}

export const apiControllers: ApiMetadata[] = [
    { name: 'adminCmsApi', factory: 'AdminCmsControllerApiFactory', description: 'Quản lý nội dung CMS Admin' },
    { name: 'auditLogApi', factory: 'AuditLogControllerApiFactory', description: 'Xem nhật ký hệ thống' },
    { name: 'authApi', factory: 'AuthControllerApiFactory', description: 'Xác thực người dùng hệ thống' },
    { name: 'commonApi', factory: 'CommonControllerApiFactory', description: 'Các tiện ích dùng chung' },
    { name: 'customerAuthApi', factory: 'CustomerAuthControllerApiFactory', description: 'Xác thực khách hàng' },
    { name: 'customerApi', factory: 'CustomerControllerApiFactory', description: 'Quản lý thông tin khách hàng' },
    { name: 'debtApi', factory: 'DebtControllerApiFactory', description: 'Quản lý công nợ' },
    { name: 'imageUploadApi', factory: 'ImageUploadControllerApiFactory', description: 'Tải lên hình ảnh' },
    { name: 'inventoryCheckApi', factory: 'InventoryCheckControllerApiFactory', description: 'Kiểm kê kho' },
    { name: 'mechanicApi', factory: 'MechanicControllerApiFactory', description: 'Quản lý kỹ thuật viên' },
    { name: 'notificationApi', factory: 'NotificationControllerApiFactory', description: 'Hệ thống thông báo' },
    { name: 'paymentApi', factory: 'PaymentControllerApiFactory', description: 'Quản lý thanh toán' },
    { name: 'productApi', factory: 'ProductControllerApiFactory', description: 'Quản lý phụ tùng/sản phẩm' },
    { name: 'publicBookingApi', factory: 'PublicBookingControllerApiFactory', description: 'Đặt lịch công khai' },
    { name: 'publicCmsApi', factory: 'PublicCmsControllerApiFactory', description: 'Nội dung CMS công khai' },
    { name: 'publicTrackingApi', factory: 'PublicTrackingControllerApiFactory', description: 'Theo dõi tiến độ sửa chữa công khai' },
    { name: 'receptionApi', factory: 'ReceptionControllerApiFactory', description: 'Tiếp nhận xe và cố vấn dịch vụ' },
    { name: 'reportApi', factory: 'ReportControllerApiFactory', description: 'Báo cáo thống kê' },
    { name: 'saleApi', factory: 'SaleControllerApiFactory', description: 'Quản lý bán hàng' },
    { name: 'sseApi', factory: 'SseControllerApiFactory', description: 'Server-Sent Events' },
    { name: 'supplierApi', factory: 'SupplierControllerApiFactory', description: 'Quản lý nhà cung cấp' },
    { name: 'systemConfigApi', factory: 'SystemConfigControllerApiFactory', description: 'Cấu hình hệ thống' },
    { name: 'transactionApi', factory: 'TransactionControllerApiFactory', description: 'Quản lý giao dịch tài chính' },
    { name: 'userApi', factory: 'UserControllerApiFactory', description: 'Quản lý người dùng hệ thống' },
    { name: 'warehouseApi', factory: 'WarehouseControllerApiFactory', description: 'Quản lý kho hàng' }
];
