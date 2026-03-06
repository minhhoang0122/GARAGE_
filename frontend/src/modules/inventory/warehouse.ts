'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

// --- Types ---
export type ExportOrderSummary = {
    id: number;
    plate: string;
    customerName: string;
    createdAt: Date;
    finishedAt: Date | null;
    itemCount: number;
    totalValue: number;
    hasExported: boolean;
};

export type ExportItem = {
    id: number;
    productId: number;
    productCode: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    stockQty: number;
    isExported: boolean;
};

// 1. Get Pending Export Orders (status = CHO_SUA_CHUA)
export async function getPendingExportOrders() {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        if (!token) return [];

        const orders = await api.get(`/warehouse/pending?t=${Date.now()}`, token);

        return orders.map((o: any) => ({
            id: o.id,
            plate: o.plate,
            customerName: o.customerName,
            createdAt: new Date(o.createdAt),
            finishedAt: o.finishedAt ? new Date(o.finishedAt) : null,
            itemCount: o.itemCount,
            totalValue: o.totalValue,
            hasExported: o.hasExported
        }));
    } catch (e) {
        console.error('getPendingExportOrders error', e);
        return [];
    }
}

// 2. Get Order Export Details
export async function getOrderExportDetails(orderId: number) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        if (!token) return null;

        const order = await api.get(`/warehouse/export/${orderId}`, token);
        return {
            id: order.id,
            status: order.status,
            plate: order.plate,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            vehicleBrand: order.vehicleBrand,
            vehicleModel: order.vehicleModel,
            createdAt: new Date(order.createdAt),
            items: order.items, // Matches structure
            hasExported: order.hasExported
        };
    } catch (e) {
        return null;
    }
}

// 3. Confirm Export (Using Java Backend Logic)
export async function confirmExport(orderId: number) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        if (!token) throw new Error('Unauthorized');

        const res = await api.post(`/warehouse/export/${orderId}`, {}, token);

        revalidatePath('/warehouse');
        revalidatePath('/warehouse/export');
        revalidatePath(`/warehouse/export/${orderId}`);
        revalidatePath('/sale');

        return { success: true, exportId: res.exportId };

    } catch (error: any) {
        return { success: false, error: error.message || 'Lỗi xuất kho' };
    }
}

// 4. Get Warehouse Stats
export async function getWarehouseStats() {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        if (!token) return { pendingOrders: 0, lowStockItems: 0, recentExports: 0 };

        return await api.get('/warehouse/stats', token);
    } catch (e) {
        return { pendingOrders: 0, lowStockItems: 0, recentExports: 0 };
    }
}

// 5. Get Low Stock Items
export async function getLowStockItems() {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;

        // We can reuse getProducts or use specific low stock API. 
        // For now, let's filter getProducts as before, OR rely on backend if we add /warehouse/lowstock endpoint.
        // But backend `getProducts` endpoint in WarehouseController calls `warehouseService.getProducts` which supports search.
        // It doesn't strictly filter low stock unless we search.
        // The original logic filtered `p.stock <= p.minStock`.
        // Java `WarehouseService.getDashboardStats` counts them. 
        // But the UI wants the LIST of items.
        // I should probably add `getLowStockProducts` to Controller or just filter on client from all products (bad for large list).
        // Let's use `api.get('/warehouse/products')` and filter, or just `api.get('/products')`.
        // Note: `WarehouseController` has `getProducts`.

        const products = await api.get('/warehouse/products', token || '');

        return products
            .filter((p: any) => !p.isService && p.stock <= (p.minStock || 10))
            .map((p: any) => ({
                id: p.id,
                code: p.code,
                name: p.name,
                stock: p.stock,
                minStock: p.minStock
            }))
            .slice(0, 10);
    } catch (e) {
        console.error("Error fetching low stock:", e);
        return [];
    }
}

// 6. Return Stock (Reverse Logistics)
export async function returnStock(orderId: number, productId: number, quantity: number, reason: string) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        if (!token) throw new Error('Unauthorized');

        await api.post(`/warehouse/return/${orderId}`, {
            productId,
            quantity,
            reason
        }, token);

        revalidatePath('/warehouse');
        revalidatePath(`/warehouse/export/${orderId}`);
        revalidatePath('/sale');
        revalidatePath(`/sale/orders/${orderId}`);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Lỗi hoàn nhập kho' };
    }
}

// 7. Import Stock
export async function importStock(data: {
    supplierName: string;
    note: string;
    items: { productId: number; quantity: number; costPrice: number; vatRate: number }[];
}) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        if (!token) throw new Error('Unauthorized');

        const res = await api.post('/warehouse/import', data, token);

        revalidatePath('/warehouse');
        return { success: true, importId: res.importId };
    } catch (error: any) {
        return { success: false, error: error.message || 'Lỗi nhập kho' };
    }
}

// 8. Adjust Stock (Inventory Check)
export async function adjustStock(productId: number, actualQuantity: number, reason: string) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        if (!token) throw new Error('Unauthorized');

        await api.post('/inventory-check/adjust', {
            productId,
            actualQuantity,
            reason
        }, token);

        revalidatePath('/warehouse');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Lỗi điều chỉnh kho' };
    }
}
