package com.gara.modules.service.service;

import com.gara.dto.VehicleHistoryDTO;
import com.gara.entity.Reception;
import com.gara.entity.ReceptionTimeline;
import com.gara.entity.Vehicle;
import com.gara.modules.customer.repository.VehicleRepository;
import com.gara.modules.reception.repository.ReceptionRepository;
import com.gara.modules.service.repository.ReceptionTimelineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class VehicleHistoryService {

    // Maintenance reminder constants
    private static final int MAINTENANCE_INTERVAL_KM = 5000;
    private static final int MAINTENANCE_INTERVAL_MONTHS = 6;

    private final VehicleRepository vehicleRepository;
    private final ReceptionRepository receptionRepository;
    private final ReceptionTimelineRepository timelineRepository;

    public VehicleHistoryService(VehicleRepository vehicleRepository,
                                  ReceptionRepository receptionRepository,
                                  ReceptionTimelineRepository timelineRepository) {
        this.vehicleRepository = vehicleRepository;
        this.receptionRepository = receptionRepository;
        this.timelineRepository = timelineRepository;
    }

    /**
     * Get all vehicles with enriched history metadata for listing page
     */
    @Transactional(readOnly = true)
    public List<VehicleHistoryDTO> getAllVehiclesWithHistory(String search) {
        List<Vehicle> vehicles;
        if (search != null && !search.isBlank()) {
            vehicles = vehicleRepository.findByLicensePlateContaining(search.toUpperCase().trim());
        } else {
            vehicles = vehicleRepository.findAll();
        }

        return vehicles.stream().map(this::buildVehicleHistoryDTO).collect(Collectors.toList());
    }

    /**
     * Get grouped timeline for a specific vehicle, organized by reception (service visit)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getVehicleTimeline(Integer vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe với ID: " + vehicleId));

        List<ReceptionTimeline> allEvents = timelineRepository.findByReception_Vehicle_IdOrderByCreatedAtDesc(vehicleId);

        // Group events by receptionId for visual separation
        Map<Integer, List<Map<String, Object>>> groupedTimeline = new LinkedHashMap<>();

        for (ReceptionTimeline event : allEvents) {
            Integer receptionId = event.getReceptionId();
            groupedTimeline.computeIfAbsent(receptionId, k -> new ArrayList<>()).add(mapTimelineEvent(event));
        }

        // Build response with reception metadata for each group
        List<Map<String, Object>> serviceVisits = new ArrayList<>();
        for (Map.Entry<Integer, List<Map<String, Object>>> entry : groupedTimeline.entrySet()) {
            Map<String, Object> visit = new LinkedHashMap<>();
            visit.put("receptionId", entry.getKey());

            // Get reception info
            receptionRepository.findById(entry.getKey()).ifPresent(reception -> {
                visit.put("receptionDate", reception.getReceptionDate());
                visit.put("odo", reception.getOdo());
                visit.put("request", reception.getPreliminaryRequest());
                if (reception.getRepairOrder() != null) {
                    visit.put("orderStatus", reception.getRepairOrder().getStatus());
                    visit.put("orderId", reception.getRepairOrder().getId());
                }
            });

            visit.put("events", entry.getValue());
            serviceVisits.add(visit);
        }

        // Vehicle summary
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("vehicle", Map.of(
                "id", vehicle.getId(),
                "licensePlate", vehicle.getLicensePlate(),
                "brand", vehicle.getBrand() != null ? vehicle.getBrand() : "",
                "model", vehicle.getModel() != null ? vehicle.getModel() : "",
                "currentOdo", vehicle.getCurrentOdo() != null ? vehicle.getCurrentOdo() : 0,
                "customerName", vehicle.getCustomer() != null ? vehicle.getCustomer().getFullName() : "",
                "customerPhone", vehicle.getCustomer() != null ? vehicle.getCustomer().getPhone() : ""
        ));
        result.put("serviceVisits", serviceVisits);
        result.put("totalVisits", serviceVisits.size());

        // Maintenance reminder calculation
        VehicleHistoryDTO dto = buildVehicleHistoryDTO(vehicle);
        result.put("nextMaintenanceDate", dto.nextMaintenanceDate());
        result.put("nextMaintenanceOdo", dto.nextMaintenanceOdo());

        return result;
    }

    // --- Private helpers ---

    private VehicleHistoryDTO buildVehicleHistoryDTO(Vehicle vehicle) {
        // Find last service date from receptions
        List<Reception> receptions = receptionRepository.findByVehicleLicensePlateOrderByReceptionDateDesc(
                vehicle.getLicensePlate());

        LocalDateTime lastServiceDate = null;
        Integer lastServiceOdo = null;

        if (!receptions.isEmpty()) {
            Reception lastReception = receptions.get(0);
            lastServiceDate = lastReception.getReceptionDate();
            lastServiceOdo = lastReception.getOdo();
        }

        // Calculate next maintenance
        LocalDateTime nextMaintenanceDate = null;
        Integer nextMaintenanceOdo = null;

        if (lastServiceDate != null) {
            nextMaintenanceDate = lastServiceDate.plusMonths(MAINTENANCE_INTERVAL_MONTHS);
        }
        if (lastServiceOdo != null) {
            nextMaintenanceOdo = lastServiceOdo + MAINTENANCE_INTERVAL_KM;
        } else if (vehicle.getCurrentOdo() != null && vehicle.getCurrentOdo() > 0) {
            nextMaintenanceOdo = vehicle.getCurrentOdo() + MAINTENANCE_INTERVAL_KM;
        }

        return VehicleHistoryDTO.builder()
                .id(vehicle.getId())
                .licensePlate(vehicle.getLicensePlate())
                .brand(vehicle.getBrand() != null ? vehicle.getBrand() : "")
                .model(vehicle.getModel() != null ? vehicle.getModel() : "")
                .vin(vehicle.getVin())
                .currentOdo(vehicle.getCurrentOdo() != null ? vehicle.getCurrentOdo() : 0)
                .customerName(vehicle.getCustomer() != null ? vehicle.getCustomer().getFullName() : "")
                .customerPhone(vehicle.getCustomer() != null ? vehicle.getCustomer().getPhone() : "")
                .lastServiceDate(lastServiceDate)
                .nextMaintenanceDate(nextMaintenanceDate)
                .nextMaintenanceOdo(nextMaintenanceOdo)
                .build();
    }

    private Map<String, Object> mapTimelineEvent(ReceptionTimeline event) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", event.getId());
        map.put("receptionId", event.getReceptionId());
        map.put("actionType", event.getActionType());
        map.put("content", event.getContent());
        map.put("oldValue", event.getOldValue());
        map.put("newValue", event.getNewValue());
        map.put("actorName", event.getActorName());
        map.put("actorRole", event.getActorRole());
        map.put("actorId", event.getActorId());
        map.put("actorAvatar", event.getActorAvatar());
        map.put("createdAt", event.getCreatedAt());
        map.put("isInternal", event.getIsInternal());
        return map;
    }
}
