'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

// --- Types ---
export type OrderDetailItem = {
    id: number;
    productId: number;
    productName: string;
    productCode: string;
    unitPrice: number;
    quantity: number;
    discountAmount: number;
    discountPercent: number;
    total: number;
    isService: boolean;
    itemStatus: string;
    proposedById: number | null;
    proposedByName: string | null;
    proposedByRole: string | null;
    vatRate: number;
    floorPrice: number;
    warrantyMonths: number;
    warrantyKm: number;
};

export type OrderData = {
    id: number;
    status: string;
    plate: string;
    customerName: string;
    phone: string;
    odo: number; // Current vehicle ODO
    receptionOdo: number; // ODO at reception
    items: OrderDetailItem[];
    subTime: Date;
    totalParts: number;
    totalLabor: number;
    totalDiscount: number;
    vat: number;
    grandTotal: number;
    amountPaid: number;
    debt: number;
    paymentMethod: string | null;
    paymentDate: Date | null;
    imageUrl?: string;
    vehicleBrand?: string;
    vehicleModel?: string;
    thoChanDoanId?: number | null;
};

// 1. Get Order Details
export async function getOrder(orderId: number) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        if (!token) return null;

        const order = await api.get(`/sale/orders/${orderId}`, token);

        // Map API response to frontend types
        const items: OrderDetailItem[] = (order.items || []).map((item: any) => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            productCode: item.productCode,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            discountAmount: 0,
            discountPercent: item.discountPercent || 0,
            total: item.totalPrice ?? item.total ?? 0,
            isService: item.type === 'SERVICE' || item.isService || false,
            itemStatus: item.itemStatus || 'KHACH_DONG_Y',
            proposedById: item.proposedById || null,
            proposedByName: item.proposedByName || null,
            proposedByRole: item.proposedByRole || null,
            vatRate: item.vatRate || 10,
            floorPrice: 0,
            warrantyMonths: item.warrantyMonths || 0,
            warrantyKm: item.warrantyKm || 0
        }));
        // Calculate totals from items
        let totalParts = 0;
        let totalLabor = 0;
        items.forEach(item => {
            if (item.isService) {
                totalLabor += item.total || 0;
            } else {
                totalParts += item.total || 0;
            }
        });

        return {
            id: order.id,
            status: order.status,
            plate: order.plateNumber || order.plate,
            customerName: order.customerName,
            phone: order.customerPhone,
            odo: order.vehicleOdo || 0,
            receptionOdo: order.receptionOdo || 0,
            subTime: new Date(order.createdAt),
            items,
            totalParts,
            totalLabor,
            totalDiscount: order.discount || order.totalDiscount || 0,
            vat: order.tax || 0,
            grandTotal: order.finalAmount || (totalParts + totalLabor),
            amountPaid: order.paidAmount || order.amountPaid || 0,
            debt: (order.finalAmount || 0) - (order.paidAmount || order.amountPaid || 0),
            paymentMethod: order.paymentMethod || null,
            paymentDate: order.paymentDate ? new Date(order.paymentDate) : null,
            imageUrl: order.receptionImage,
            vehicleBrand: order.carBrand || order.vehicleBrand,
            vehicleModel: order.carModel || order.vehicleModel,
            thoChanDoanId: order.thoChanDoanId || order.thoChanDoan?.id || null
        };
    } catch (e) {
        console.error('Error fetching order:', e);
        return null;
    }
}

// 2. Search Products
export async function searchProducts(keyword: string) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        // Use generic /products endpoint
        const res = await api.get(`/sale/products?search=${encodeURIComponent(keyword)}`, token as string);

        return res.map((p: any) => ({
            ID: p.id,
            MaHang: p.code,
            TenHang: p.name,
            GiaBanNiemYet: p.price,
            GiaVon: p.costPrice,
            LaDichVu: p.isService,
            SoLuongTon: p.stock
        }));
    } catch (e) { return []; }
}

// 2.1 Get All Products
export async function getAllProducts() {
    return searchProducts('');
}

// 3. Add Item to Order
export async function addItemToOrder(orderId: number, productId: number, quantity: number = 1) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;

        await api.post(`/sale/orders/${orderId}/items`, { productId, quantity }, token);

        revalidatePath(`/sale/orders/${orderId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 4. Update Item
export async function updateOrderItem(itemId: number, data: { quantity?: number, discountPercent?: number, itemStatus?: string }) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;

        // Backend only supports quantity update via simple patch for now. Discount update todo.
        // We use /api/items/{id} as per SaleController
        await api.patch(`/sale/items/${itemId}`, { quantity: data.quantity }, token);

        // We don't have orderId here to revalidate easily unless we pass it.
        // Frontend typically revalidates path.
        // Or we assume the page will refresh.
        // To be safe, UI should call router.refresh().
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 5. Remove Item
export async function removeOrderItem(itemId: number) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;

        await api.delete(`/sale/items/${itemId}`, token);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 6. Submit Quote to Customer
export async function submitToCustomer(orderId: number) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;

        await api.post(`/sale/orders/${orderId}/submit`, {}, token);

        revalidatePath(`/sale/orders/${orderId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 6c. Submit Replenishment Quote (Gửi báo giá bổ sung)
export async function submitReplenishmentQuote(orderId: number) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;

        await api.post(`/sale/orders/${orderId}/submit-replenishment`, {}, token);

        revalidatePath(`/sale/orders/${orderId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 6b. Finalize Order (Approved)
export async function finalizeOrder(orderId: number) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;

        await api.post(`/sale/orders/${orderId}/finalize`, {}, token);

        revalidatePath(`/sale/orders/${orderId}`);
        revalidatePath('/sale');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 8. Cancel Order
export async function cancelOrder(orderId: number, reason: string) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;

        await api.post(`/sale/orders/${orderId}/cancel`, { reason }, token);

        revalidatePath(`/sale/orders/${orderId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 9. Close Order
export async function closeOrder(orderId: number) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;

        await api.post(`/sale/orders/${orderId}/close`, {}, token);

        revalidatePath(`/sale/orders/${orderId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 7. Create Order for Reception
export async function createOrderForReception(receptionId: number) {
    return { success: false, error: "Migration pending: Use Java API" };
}

// 8. Create New Order
export async function createNewOrder(data: any): Promise<{ success: boolean; error?: string; orderId?: number }> {
    return { success: false, error: "Use Reception Flow" };
}

// 10. Create Warranty Order
export async function createWarranty(orderId: number, itemIds: number[], odo: number) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;

        const res = await api.post(`/sale/orders/${orderId}/warranty`, { itemIds, odo }, token);

        revalidatePath('/sale');
        return { success: true, warrantyOrderId: res.warrantyOrderId };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 11. Create Order (Alias)
export async function createOrder(data: any) {
    return createNewOrder(data);
}

// 12. Toggle Item Status
export async function toggleItemStatus(itemId: number, currentStatus: string) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;

        const newStatus = currentStatus === 'KHACH_DONG_Y' ? 'KHACH_TU_CHOI' : 'KHACH_DONG_Y';
        // Using generic patch endpoint or specific status endpoint
        await api.patch(`/sale/items/${itemId}/status`, { status: newStatus }, token);

        revalidatePath('/sale'); // Broad revalidate
        return { success: true };
    } catch (error: any) {
        // If API endpoint doesn't exist, we might need a different approach, 
        // but for now this satisfies the frontend call.
        console.error("Toggle failed", error);
        return { success: false, error: error.message };
    }
}

// 13. Create Product (Quick Create)
export async function createProduct(data: any) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;

        // POST /api/products
        const res = await api.post('/products', data, token);

        return { success: true, data: res };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
