import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleService } from '../services/vehicle';

export const useVehicles = (filters: any = {}) => {
    return useQuery({
        queryKey: ['vehicles', filters],
        queryFn: () => vehicleService.getVehicles(filters),
    });
};

export const useVehicleDetail = (id: string | number) => {
    return useQuery({
        queryKey: ['vehicles', 'detail', id],
        queryFn: () => vehicleService.getVehicleDetail(id),
        enabled: !!id,
    });
};

export const useSearchVehicle = (plate: string) => {
    return useQuery({
        queryKey: ['vehicles', 'search', plate],
        queryFn: () => vehicleService.searchVehicle(plate),
        enabled: !!plate && plate.length >= 3,
    });
};

export const useCreateVehicle = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: vehicleService.createVehicle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        }
    });
};
