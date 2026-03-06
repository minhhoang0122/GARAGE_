package com.gara.modules.common.service;

import com.gara.dto.SearchResultDTO;
import com.gara.entity.RepairOrder;
import com.gara.entity.Vehicle;
import com.gara.modules.service.repository.RepairOrderRepository;
import com.gara.modules.customer.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CommonService {

    private final RepairOrderRepository orderRepository;
    private final VehicleRepository vehicleRepository;

    public CommonService(RepairOrderRepository orderRepository, VehicleRepository vehicleRepository) {
        this.orderRepository = orderRepository;
        this.vehicleRepository = vehicleRepository;
    }

    public SearchResultDTO globalSearch(String query) {
        String keyword = query.trim();
        if (keyword.length() < 3) {
            return SearchResultDTO.builder().found(false).message("Nhập ít nhất 3 ký tự").build();
        }

        // 1. Search Order by ID
        try {
            int orderId = Integer.parseInt(keyword);
            Optional<RepairOrder> order = orderRepository.findById(orderId);
            if (order.isPresent()) {
                return SearchResultDTO.builder()
                        .found(true)
                        .type("ORDER")
                        .id(order.get().getId())
                        .build();
            }
        } catch (NumberFormatException ignored) {
        }

        // 2. Search Vehicle by Plate (Contains)
        // Taking the first match and checking its latest order
        List<Vehicle> vehicles = vehicleRepository.findByBienSoContaining(keyword);

        if (!vehicles.isEmpty()) {
            Vehicle vehicle = vehicles.get(0);
            // Logic: Find latest order via Reception?
            // Simplified: If vehicle exists, return it.
            // In TS it checked for latest order.

            return SearchResultDTO.builder()
                    .found(true)
                    .type("VEHICLE")
                    .plate(vehicle.getBienSo())
                    .build();
        }

        return SearchResultDTO.builder().found(false).message("Không tìm thấy kết quả").build();
    }
}
