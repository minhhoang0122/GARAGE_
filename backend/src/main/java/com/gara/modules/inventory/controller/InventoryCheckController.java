package com.gara.modules.inventory.controller;

import com.gara.entity.User;
import com.gara.modules.identity.service.UserService;
import com.gara.modules.inventory.service.WarehouseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/inventory-check")
public class InventoryCheckController {

    private final WarehouseService warehouseService;
    private final UserService userService;

    public InventoryCheckController(WarehouseService warehouseService, UserService userService) {
        this.warehouseService = warehouseService;
        this.userService = userService;
    }

    @GetMapping("/products")
    public ResponseEntity<?> getProductsForCheck() {
        return ResponseEntity.ok(warehouseService.getProducts(""));
    }

    @PostMapping("/adjust")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'KHO')")
    public ResponseEntity<?> adjustStock(@RequestBody Map<String, Object> body,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null) {
                return ResponseEntity.status(401).build();
            }

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
