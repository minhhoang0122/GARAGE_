package com.gara.modules.service.controller;

import com.gara.dto.ReceptionFormData;
import com.gara.entity.User;
import com.gara.modules.service.repository.RepairOrderRepository;

import com.gara.modules.service.service.ReceptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reception")
public class ReceptionController {

    private final ReceptionService receptionService;
    private final RepairOrderRepository orderRepository;

    public ReceptionController(ReceptionService receptionService, RepairOrderRepository orderRepository) {
        this.receptionService = receptionService;
        this.orderRepository = orderRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAllReceptions() {
        try {
            return ResponseEntity.ok(receptionService.getAllReceptions());
        } catch (Exception e) {
            try (java.io.PrintWriter pw = new java.io.PrintWriter(new java.io.FileWriter("debug_error.log", true))) {
                pw.println("--- Error at " + java.time.LocalDateTime.now() + " ---");
                e.printStackTrace(pw);
                pw.println("------------------------------------------");
            } catch (Exception ex) {
                ex.printStackTrace();
            }
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage(), "type", e.getClass().getSimpleName()));
        }
    }

    @GetMapping("/vehicle")
    public ResponseEntity<?> searchVehicle(@RequestParam String plate) {
        return ResponseEntity.ok(receptionService.searchVehicle(plate));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReceptionById(@PathVariable Integer id) {
        return receptionService.getReceptionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createReception(@RequestBody ReceptionFormData data,
            @AuthenticationPrincipal User user) {
        try {
            Integer receptionId = receptionService.createReception(data, user);

            // Need OrderId to return? Service currently returns ReceptionID.
            // Simplified lookup
            Integer orderId = orderRepository.findByPhieuTiepNhanId(receptionId)
                    .map(o -> o.getId())
                    .orElse(null);

            return ResponseEntity.ok(Map.of("success", true, "receptionId", receptionId, "orderId", orderId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
