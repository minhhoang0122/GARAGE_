import { api } from '@/lib/api';

export interface VehicleHistoryItem {
    id: number;
    licensePlate: string;
    brand: string;
    model: string;
    vin: string;
    currentOdo: number;
    customerName: string;
    customerPhone: string;
    lastServiceDate: string | null;
    nextMaintenanceDate: string | null;
    nextMaintenanceOdo: number | null;
}

export interface ServiceVisit {
    receptionId: number;
    receptionDate: string;
    odo: number;
    request: string;
    orderStatus?: string;
    orderId?: number;
    events: TimelineEvent[];
}

export interface TimelineEvent {
    id: number;
    receptionId: number;
    actionType: string;
    content: string;
    oldValue?: string;
    newValue?: string;
    actorName: string;
    actorRole: string;
    actorId?: number;
    actorAvatar?: string;
    createdAt: string;
    isInternal: boolean;
}

export interface VehicleTimelineResponse {
    vehicle: {
        id: number;
        licensePlate: string;
        brand: string;
        model: string;
        currentOdo: number;
        customerName: string;
        customerPhone: string;
    };
    serviceVisits: ServiceVisit[];
    totalVisits: number;
    nextMaintenanceDate: string | null;
    nextMaintenanceOdo: number | null;
}

export const vehicleHistoryService = {
    getVehicles: async (search?: string): Promise<VehicleHistoryItem[]> => {
        const params = search ? `?search=${encodeURIComponent(search)}` : '';
        return api.get(`/admin/vehicles${params}`);
    },

    getVehicleTimeline: async (vehicleId: number): Promise<VehicleTimelineResponse> => {
        return api.get(`/admin/vehicles/${vehicleId}/timeline`);
    },
};
