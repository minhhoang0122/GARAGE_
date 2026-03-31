package com.gara.modules.service.controller;

import com.gara.modules.service.service.VehicleHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/vehicles")
public class VehicleAdminController {

    private final VehicleHistoryService vehicleHistoryService;

    public VehicleAdminController(VehicleHistoryService vehicleHistoryService) {
        this.vehicleHistoryService = vehicleHistoryService;
    }

    /**
     * List all vehicles with maintenance reminder metadata
     * Supports search by license plate
     */
    @GetMapping
    public ResponseEntity<?> listVehicles(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(vehicleHistoryService.getAllVehiclesWithHistory(search));
    }

    /**
     * Get grouped timeline for a specific vehicle
     * Returns service visits with events organized by reception date
     */
    @GetMapping("/{id}/timeline")
    public ResponseEntity<?> getVehicleTimeline(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(vehicleHistoryService.getVehicleTimeline(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
}
