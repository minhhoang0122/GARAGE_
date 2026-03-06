package com.gara.modules.inventory.controller;

import com.gara.modules.inventory.service.WarehouseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.gara.entity.User;

import java.util.Map;

@RestController
@RequestMapping("/api/inventory-check")
public class InventoryCheckController {

    private final WarehouseService warehouseService;

    public InventoryCheckController(WarehouseService warehouseService) {
        this.warehouseService = warehouseService;
    }

    @GetMapping("/products")
    public ResponseEntity<?> getProductsForCheck() {
        return ResponseEntity.ok(warehouseService.getProducts(""));
    }

    @PostMapping("/adjust")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'KHO')")
    public ResponseEntity<?> adjustStock(@RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user) {
        try {
            Integer productId = (Integer) body.get("productId");
            Integer actualQuantity = (Integer) body.get("actualQuantity");
            String reason = (String) body.get("reason");

            warehouseService.adjustStock(productId, actualQuantity, reason, user.getId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
