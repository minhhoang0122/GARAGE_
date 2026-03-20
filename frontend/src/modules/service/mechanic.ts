'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

// --- Types ---
export type JobSummary = {
    id: number;
    plate: string;
    customerName: string;
    customerPhone: string;
    vehicleBrand: string;
    vehicleModel: string;
    createdAt: Date;
    totalItems: number;
    completedItems: number;
    status: string;
    claimedById: number | null;
    claimedByName: string | null;
    imageUrl?: string;
};

export type JobItem = {
    id: number;
    productCode: string;
    productName: string;
    isService: boolean;
    quantity: number;
    isCompleted: boolean;
    completedById: number | null;
    completedByName: string | null;
    maxMechanics?: number;
    assignments: Assignment[];
};

export type Assignment = {
    id: number;
    mechanicId: number;
    mechanicName: string;
    percentage: number;
    isMain: boolean;
    status: string;
};

// 1. Get Assigned Jobs (CHO_SUA_CHUA and DANG_SUA status)
export async function getAssignedJobs() {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;

        if (!token) return [];

        const jobs = await api.get('/mechanic/jobs', token);
        // Filter out jobs with 0 items (invalid state for mechanics)
        return (jobs as JobSummary[]).filter(job => job.totalItems > 0);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return [];
    }
}

// --- Mechanic Info (for assignment UI) ---
export type MechanicInfo = {
    id: number;
    hoTen: string;
    chuyenMon: string | null;
    chuyenMonLabel: string;
    capBac: string | null;
    capBacLabel: string;
    soViecDangLam: number;
};

// Get available mechanics with specialty, level, workload
export async function getAvailableMechanics(): Promise<MechanicInfo[]> {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        if (!token) return [];
        return (await api.get('/mechanic/mechanics', token)) as MechanicInfo[];
    } catch (error) {
        console.error('Error fetching mechanics:', error);
        return [];
    }
}

// Assign job to mechanic (Quản đốc chia việc)
export async function assignJob(orderId: number, mechanicId: number) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        if (!session?.user || !token) {
            return { success: false, error: 'Chưa đăng nhập' };
        }
        await api.post(`/mechanic/jobs/${orderId}/assign?mechanicId=${mechanicId}`, {}, token);
        revalidatePath('/mechanic/jobs');
        revalidatePath('/mechanic/assign');
        revalidatePath(`/mechanic/jobs/${orderId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 1.5. Claim Job (Thợ nhận việc)
export async function claimJob(orderId: number) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;

        if (!session?.user || !token) {
            return { success: false, error: 'Chưa đăng nhập' };
        }

        await api.post(`/mechanic/jobs/${orderId}/claim`, {}, token);

        revalidatePath('/mechanic/jobs');
        revalidatePath(`/mechanic/jobs/${orderId}`);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 1.6. Unclaim Job (Hủy nhận việc)
export async function unclaimJob(orderId: number) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;

        if (!session?.user || !token) {
            return { success: false, error: 'Chưa đăng nhập' };
        }

        await api.post(`/mechanic/jobs/${orderId}/unclaim`, {}, token);

        revalidatePath('/mechanic/jobs');
        revalidatePath(`/mechanic/jobs/${orderId}`);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 2. Get Job Details
export type JobDetails = JobSummary & {
    items: JobItem[];
    request: string | null;
    tienCoc: number;
    tongCong: number;
    imageUrl?: string;
};

export async function getJobDetails(orderId: number): Promise<JobDetails | null> {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        if (!token) return null;

        const res = await api.get(`/mechanic/jobs/${orderId}`, token);
        return res as JobDetails;
    } catch (e) {
        return null;
    }
}

// 3. Toggle Item Completion
export async function toggleItemCompletion(itemId: number) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;

        // This endpoint doesn't return completed status, just success.
        // But the UI might expect it.
        // For now, return success: true.
        await api.post(`/mechanic/items/${itemId}/toggle`, {}, token);

        revalidatePath(`/mechanic/jobs`);
        return { success: true, completed: true }; // Dummy completed value, UI should re-render from server or toggle locally
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 4. Complete Job
export async function completeJob(orderId: number) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;

        await api.post(`/mechanic/jobs/${orderId}/complete`, {}, token);

        revalidatePath('/mechanic/jobs');
        revalidatePath(`/mechanic/jobs/${orderId}`);
        revalidatePath(`/sale/orders/${orderId}`);
        revalidatePath('/sale/orders');

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 4b. QC Pass
export async function qcPass(orderId: number) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;

        await api.post(`/mechanic/jobs/${orderId}/qc-pass`, {}, token);

        revalidatePath('/mechanic/jobs');
        revalidatePath(`/mechanic/jobs/${orderId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 4c. QC Fail
export async function qcFail(orderId: number) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;

        await api.post(`/mechanic/jobs/${orderId}/qc-fail`, {}, token);

        revalidatePath('/mechanic/jobs');
        revalidatePath(`/mechanic/jobs/${orderId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 5. Get Mechanic Stats
export async function getMechanicStats() {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        if (!token) return { inProgressJobs: 0, completedToday: 0 };

        const res = await api.get('/mechanic/stats', token);
        return res;
    } catch (e) {
        return { inProgressJobs: 0, completedToday: 0 };
    }
}

// =============== US 4.1: Khám xe & Đề xuất (JAVA API) ===============

// 6. Get Receptions waiting for inspection
export async function getReceptionsToInspect() {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        if (!token) return [];

        const res = await api.get('/mechanic/inspect', token);
        return res;
    } catch (e) {
        return [];
    }
}

// 7. Search Products for Mechanic (Proxy to backend search or use existing)
// For now we keep this simple or move to backend if needed.
// IMPORTANT: User wants STRICT removal of Prisma.
// We should check if we already have a product search API.
// WarehouseService has getProducts.
export async function searchProductsForMechanic(query: string) {
    // Reuse Warehouse/Sale API or create new?
    // Let's assume we use the Common Search or dedicated product search endpoint.
    // For now, let's call the Warehouse API if available or Sale API.
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        const res = await api.get(`/warehouse/products?search=${encodeURIComponent(query)}`, token as string);
        return res;
    } catch (e) { return []; }
}

// 8. Get Reception Details for Inspection
export async function getReceptionForInspect(receptionId: number) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        if (!token) return null;

        const res = await api.get(`/mechanic/inspect/${receptionId}`, token);
        return res;
    } catch (e) {
        return null;
    }
}

// 9. Create/Update Proposal
export type ProposalItem = {
    productId: number;
    quantity: number;
    note?: string;
};

export async function submitProposal(receptionId: number, items: ProposalItem[]): Promise<{ success: boolean; error?: string; items?: any[] }> {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;

        await api.post(`/mechanic/inspect/${receptionId}/proposal`, items, token);

        revalidatePath('/mechanic/inspect');
        revalidatePath(`/mechanic/inspect/${receptionId}`);
        revalidatePath('/sale/quotes'); // Sale will see update

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 10. Remove Item from Proposal
export async function removeItemFromProposal(itemId: number, receptionId: number) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;

        await api.delete(`/mechanic/items/${itemId}`, token);

        revalidatePath(`/mechanic/inspect/${receptionId}`);
        revalidatePath('/sale/orders');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 12. Report Technical Issue (Mid-repair)
export async function reportTechnicalIssue(orderId: number, items: ProposalItem[]) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;

        await api.post(`/mechanic/jobs/${orderId}/report-issue`, items, token);

        revalidatePath(`/mechanic/jobs/${orderId}`);
        revalidatePath('/sale/orders');

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 13. Request Join Task (Party)
export async function requestJoinTask(itemId: number) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        await api.post(`/mechanic/items/${itemId}/join`, {}, token);
        revalidatePath('/mechanic/jobs');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 14. Approve Join Task (Lead)
export async function approveJoinTask(assignmentId: number) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        await api.post(`/mechanic/assignments/${assignmentId}/approve`, {}, token);
        revalidatePath('/mechanic/jobs');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 15. Update Distribution (Lead)
export async function updateTaskDistribution(itemId: number, distribution: Record<number, number>) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        await api.post(`/mechanic/items/${itemId}/distribution`, distribution, token);
        revalidatePath('/mechanic/jobs');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 16. Get Top Products for Mechanic (Suggestions)
export async function getTopProductsForMechanic() {
    // Return top 10 commonly used parts 
    // For now we reuse search with empty query or specific endpoint
    return searchProductsForMechanic('');
}

// 17. Update Item Limit (Lead)
export async function updateItemLimit(itemId: number, limit: number) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        await api.put(`/mechanic/items/${itemId}/max-mechanics-v2?limit=${limit}`, {}, token);
        revalidatePath('/mechanic/jobs');
        revalidatePath(`/mechanic/jobs/[id]`, 'page');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
