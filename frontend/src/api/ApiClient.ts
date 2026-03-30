import * as apis from './index';
import { ApiControllerName } from './apiMetadata';

/**
 * ApiClient - Quản lý tập trung các Controller API
 * Giúp truy cập các API instance một cách có cấu trúc
 */
export const ApiClient = {
    adminCms: apis.adminCmsApi,
    auditLog: apis.auditLogApi,
    auth: apis.authApi,
    common: apis.commonApi,
    customerAuth: apis.customerAuthApi,
    customer: apis.customerApi,
    debt: apis.debtApi,
    imageUpload: apis.imageUploadApi,
    inventoryCheck: apis.inventoryCheckApi,
    mechanic: apis.mechanicApi,
    notification: apis.notificationApi,
    payment: apis.paymentApi,
    product: apis.productApi,
    publicBooking: apis.publicBookingApi,
    publicCms: apis.publicCmsApi,
    publicTracking: apis.publicTrackingApi,
    reception: apis.receptionApi,
    report: apis.reportApi,
    sale: apis.saleApi,
    sse: apis.sseApi,
    supplier: apis.supplierApi,
    systemConfig: apis.systemConfigApi,
    transaction: apis.transactionApi,
    user: apis.userApi,
    warehouse: apis.warehouseApi,

    /**
     * Lấy một Controller theo tên (nếu cần dynamic access)
     */
    getController(name: string): any {
        const apiName = name.endsWith('Api') ? name : `${name}Api`;
        return (apis as any)[apiName];
    }
};

export default ApiClient;
