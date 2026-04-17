import { 
    AdminCmsControllerApiFactory,
    AuditLogControllerApiFactory,
    AuthControllerApiFactory,
    CommonControllerApiFactory,
    CustomerAuthControllerApiFactory,
    CustomerControllerApiFactory,
    DebtControllerApiFactory,
    ImageUploadControllerApiFactory,
    InventoryCheckControllerApiFactory,
    MechanicControllerApiFactory,
    NotificationControllerApiFactory,
    PaymentControllerApiFactory,
    ProductControllerApiFactory,
    PublicBookingControllerApiFactory,
    PublicCmsControllerApiFactory,
    PublicTrackingControllerApiFactory,
    ReceptionControllerApiFactory,
    ReportControllerApiFactory,
    SaleControllerApiFactory,
    SseControllerApiFactory,
    SupplierControllerApiFactory,
    SystemConfigControllerApiFactory,
    TransactionControllerApiFactory,
    UserControllerApiFactory,
    WarehouseControllerApiFactory,
    Configuration
} from './generated';
import { axiosInstance, API_URL } from '@/lib/api';

// Cấu hình Base Path đồng bộ với lib/api
const config = new Configuration({
    basePath: API_URL
});

// Wrapper để ép kiểu axios instance từ lib/api về standard AxiosInstance
const apiAxiosWrapper: any = axiosInstance;

export const adminCmsApi = AdminCmsControllerApiFactory(config, '', apiAxiosWrapper);
export const auditLogApi = AuditLogControllerApiFactory(config, '', apiAxiosWrapper);
export const authApi = AuthControllerApiFactory(config, '', apiAxiosWrapper);
export const commonApi = CommonControllerApiFactory(config, '', apiAxiosWrapper);
export const customerAuthApi = CustomerAuthControllerApiFactory(config, '', apiAxiosWrapper);
export const customerApi = CustomerControllerApiFactory(config, '', apiAxiosWrapper);
export const debtApi = DebtControllerApiFactory(config, '', apiAxiosWrapper);
export const imageUploadApi = ImageUploadControllerApiFactory(config, '', apiAxiosWrapper);
export const inventoryCheckApi = InventoryCheckControllerApiFactory(config, '', apiAxiosWrapper);
export const mechanicApi = MechanicControllerApiFactory(config, '', apiAxiosWrapper);
export const notificationApi = NotificationControllerApiFactory(config, '', apiAxiosWrapper);
export const paymentApi = PaymentControllerApiFactory(config, '', apiAxiosWrapper);
export const productApi = ProductControllerApiFactory(config, '', apiAxiosWrapper);
export const publicBookingApi = PublicBookingControllerApiFactory(config, '', apiAxiosWrapper);
export const publicCmsApi = PublicCmsControllerApiFactory(config, '', apiAxiosWrapper);
export const publicTrackingApi = PublicTrackingControllerApiFactory(config, '', apiAxiosWrapper);
export const receptionApi = ReceptionControllerApiFactory(config, '', apiAxiosWrapper);
export const reportApi = ReportControllerApiFactory(config, '', apiAxiosWrapper);
export const saleApi = SaleControllerApiFactory(config, '', apiAxiosWrapper);
export const sseApi = SseControllerApiFactory(config, '', apiAxiosWrapper);
export const supplierApi = SupplierControllerApiFactory(config, '', apiAxiosWrapper);
export const systemConfigApi = SystemConfigControllerApiFactory(config, '', apiAxiosWrapper);
export const transactionApi = TransactionControllerApiFactory(config, '', apiAxiosWrapper);
export const userApi = UserControllerApiFactory(config, '', apiAxiosWrapper);
export const warehouseApi = WarehouseControllerApiFactory(config, '', apiAxiosWrapper);

export * from './generated';
export * from './apiMetadata';

/**
 * ApiClient - Quản lý tập trung các Controller API
 * Giúp truy cập các API instance một cách có cấu trúc
 */
export const ApiClient = {
    adminCms: adminCmsApi,
    auditLog: auditLogApi,
    auth: authApi,
    common: commonApi,
    customerAuth: customerAuthApi,
    customer: customerApi,
    debt: debtApi,
    imageUpload: imageUploadApi,
    inventoryCheck: inventoryCheckApi,
    mechanic: mechanicApi,
    notification: notificationApi,
    payment: paymentApi,
    product: productApi,
    publicBooking: publicBookingApi,
    publicCms: publicCmsApi,
    publicTracking: publicTrackingApi,
    reception: receptionApi,
    report: reportApi,
    sale: saleApi,
    sse: sseApi,
    supplier: supplierApi,
    systemConfig: systemConfigApi,
    transaction: transactionApi,
    user: userApi,
    warehouse: warehouseApi,

    /**
     * Lấy một Controller theo tên (nếu cần dynamic access)
     */
    getController(name: string): any {
        const apiName = name.endsWith('Api') ? name : `${name}Api`;
        return (this as any)[apiName];
    }
};

export default ApiClient;

