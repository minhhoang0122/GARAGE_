import { api } from '@/lib/api';

export interface InspectJob {
    id: number;
    plate: string;
    vehicleBrand: string;
    vehicleModel: string;
    customerName: string;
    customerPhone?: string;
    request: string;
    status?: string;
    createdAt: string;
}

export interface RepairJob {
    id: number;
    plate: string;
    vehicleBrand: string;
    vehicleModel: string;
    customerName: string;
    customerPhone?: string;
    totalItems: number;
    completedItems: number;
    status: string;
    claimedById?: number;
    claimedByName?: string;
    progress: number;
    createdAt: string;
}

export interface MechanicStats {
    inProgressJobs: number;
    completedToday: number;
}

export interface Assignment {
    id: number;
    mechanicId: number;
    mechanicName: string;
    isMain: boolean;
    percentage: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
}

export const mechanicService = {
    // Lấy danh sách xe chờ chẩn đoán
    getInspectJobs: async (): Promise<InspectJob[]> => {
        const response = await api.get('/mechanic/inspect');
        return (response || []).map((item: any) => ({
            id: item.id || item.ID,
            plate: item.plate || item.plateNumber || item.BienSo || '',
            vehicleBrand: item.vehicleBrand || item.carBrand || item.HieuXe || '',
            vehicleModel: item.vehicleModel || item.carModel || item.TenDongXe || '',
            customerName: item.customerName || item.customer?.fullName || item.TenKhachHang || '',
            customerPhone: item.customerPhone || item.customer?.phone || item.SoDienThoai || '',
            request: item.request || item.YeuCauCuaKhach || '',
            status: item.status || item.TrangThai || 'TIEP_NHAN',
            createdAt: item.createdAt || item.NgayTiepNhan || new Date().toISOString()
        }));
    },

    // Lấy danh sách xe đang sửa chữa
    getRepairJobs: async (): Promise<RepairJob[]> => {
        const response = await api.get('/mechanic/jobs');
        return (response || []).map((item: any) => {
            const total = item.totalItems || 0;
            const completed = item.completedItems || 0;
            return {
                id: item.id || item.ID,
                plate: item.plate || item.plateNumber || item.BienSo || '',
                vehicleBrand: item.vehicleBrand || item.carBrand || item.HieuXe || '',
                vehicleModel: item.vehicleModel || item.carModel || item.TenDongXe || '',
                customerName: item.customerName || item.customer?.fullName || item.TenKhachHang || '',
                customerPhone: item.customerPhone || item.customer?.phone || item.SoDienThoai || '',
                totalItems: total,
                completedItems: completed,
                status: item.status || item.TrangThai || 'DANG_SUA_CHUA',
                claimedById: item.claimedById || item.NguoiNhanID,
                claimedByName: item.claimedByName || item.claimedBy?.fullName || item.NguoiNhan || '',
                progress: total > 0 ? Math.round((completed / total) * 100) : 0,
                createdAt: item.createdAt || item.NgayBatDau || new Date().toISOString()
            };
        });
    },

    getAssignedJobs: async (): Promise<RepairJob[]> => {
        const jobs = await mechanicService.getRepairJobs();
        return jobs.filter(job => job.totalItems > 0);
    },

    getJobDetails: async (orderId: number): Promise<any> => {
        return api.get(`/mechanic/jobs/${orderId}`);
    },

    // Lấy thống kê hiệu suất thợ
    getStats: async (): Promise<MechanicStats> => {
        const response = await api.get('/mechanic/stats');
        return {
            inProgressJobs: response?.inProgressJobs || 0,
            completedToday: response?.completedToday || 0
        };
    },

    // Mutations
    claimJob: async (orderId: number) => {
        return api.post(`/mechanic/jobs/${orderId}/claim`);
    },

    unclaimJob: async (orderId: number) => {
        return api.post(`/mechanic/jobs/${orderId}/unclaim`);
    },

    toggleItem: async (itemId: number) => {
        return api.post(`/mechanic/items/${itemId}/toggle`);
    },

    completeJob: async (orderId: number) => {
        return api.post(`/mechanic/jobs/${orderId}/complete`);
    },

    qcPass: async (orderId: number) => {
        return api.post(`/mechanic/jobs/${orderId}/qc-pass`);
    },

    qcFail: async (orderId: number) => {
        return api.post(`/mechanic/jobs/${orderId}/qc-fail`);
    },

    // Inspection & Proposals
    getReceptionsToInspect: async () => {
        return api.get('/mechanic/inspect');
    },

    getReceptionForInspect: async (receptionId: number) => {
        return api.get(`/mechanic/inspect/${receptionId}`);
    },

    submitProposal: async (receptionId: number, items: any[]) => {
        return api.post(`/mechanic/inspect/${receptionId}/proposal`, items);
    },

    removeItemFromProposal: async (itemId: number) => {
        return api.delete(`/mechanic/items/${itemId}`);
    },

    // Assignment
    getAvailableMechanics: async () => {
        return api.get('/mechanic/mechanics');
    },

    assignMechanic: async (itemId: number, mechanicId: number) => {
        return api.post(`/mechanic/items/${itemId}/assign-direct?mechanicId=${mechanicId}`);
    },

    approveJoinTask: async (assignmentId: number) => {
        return api.post(`/mechanic/assignments/${assignmentId}/approve`);
    },

    reportTechnicalIssue: async (orderId: number, items: any[]) => {
        return api.post(`/mechanic/jobs/${orderId}/report-issue`, items);
    },

    unassignItem: async (assignmentId: number) => {
        return api.delete(`/mechanic/assignments/${assignmentId}`);
    },

    submitAssignments: async (orderId: number) => {
        return api.post(`/mechanic/jobs/${orderId}/submit-assignments`);
    },

    // Technical Review (QC)
    getTechnicalReviewOrders: async () => {
        return api.get('/mechanic/technical-review');
    },

    confirmTechnicalReview: async (orderId: number, itemIds: number[]) => {
        return api.post(`/mechanic/jobs/${orderId}/confirm-technical`, itemIds);
    },

    // Search
    getTopProductsForMechanic: async () => {
        return api.get('/mechanic/top-products');
    },

    searchProductsForMechanic: async (query: string) => {
        return api.get(`/mechanic/search-products?query=${encodeURIComponent(query)}`);
    },

    requestJoinTask: async (itemId: number) => {
        return api.post(`/mechanic/items/${itemId}/join`, {});
    },

    updateItemLimit: async (itemId: number, limit: number) => {
        return api.put(`/mechanic/items/${itemId}/max-mechanics-v2?limit=${limit}`, {});
    }
};
