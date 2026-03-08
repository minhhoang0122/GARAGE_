package com.gara.modules.inventory.controller;

import com.gara.modules.inventory.service.InventoryReservationService;
import com.gara.modules.inventory.service.WarehouseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.gara.entity.User;
import jakarta.validation.Valid;

import java.util.Map;

@RestController
@RequestMapping("/api/warehouse")
public class WarehouseController {

    private final InventoryReservationService inventoryService;
    private final WarehouseService warehouseService;

    public WarehouseController(InventoryReservationService inventoryService, WarehouseService warehouseService) {
        this.inventoryService = inventoryService;
        this.warehouseService = warehouseService;
    }

    @PostMapping("/reserve/{orderId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'SALE', 'THO_CHAN_DOAN')")
    public ResponseEntity<?> createReservation(@PathVariable Integer orderId,
            @AuthenticationPrincipal User user) {

        try {
            inventoryService.createReservation(orderId, user.getId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/convert/{orderId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'KHO')")
    public ResponseEntity<?> convertReservation(@PathVariable Integer orderId) {
        try {
            boolean result = inventoryService.convertReservation(orderId);
            return ResponseEntity.ok(Map.of("success", true, "converted", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/export/{orderId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'KHO')")
    public ResponseEntity<?> exportOrder(@PathVariable Integer orderId,
            @AuthenticationPrincipal User user) {
        try {
            Integer exportId = warehouseService.exportOrder(orderId, user.getId());
            return ResponseEntity.ok(Map.of("success", true, "exportId", exportId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/release/{orderId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'SALE', 'KHO')")
    public ResponseEntity<?> releaseReservation(@PathVariable Integer orderId, @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        try {
            inventoryService.releaseReservation(orderId, body.getOrDefault("reason", "Manual cleaning"), user.getId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/return/{orderId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'KHO')")
    public ResponseEntity<?> returnStock(@PathVariable Integer orderId, @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user) {
        try {
            Integer productId = (Integer) body.get("productId");
            Integer quantity = (Integer) body.get("quantity");
            String reason = (String) body.get("reason");

            warehouseService.returnStock(orderId, productId, quantity, reason, user.getId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @GetMapping("/pending")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'KHO')")
    public ResponseEntity<?> getPendingExportOrders() {
        return ResponseEntity.ok(warehouseService.getPendingExportOrders());
    }

    @GetMapping("/export/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'KHO', 'SALE', 'THO_SUA_CHUA')")
    public ResponseEntity<?> getOrderExportDetails(@PathVariable Integer id) {
        return ResponseEntity.ok(warehouseService.getOrderExportDetails(id));
    }

    @GetMapping("/export/{id}/slip")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'KHO', 'SALE')")
    public ResponseEntity<?> getExportSlip(@PathVariable Integer id) {
        return ResponseEntity.ok(warehouseService.getExportSlip(id));
    }

    @GetMapping("/stats")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'KHO')")
    public ResponseEntity<?> getDashboardStats() {
        return ResponseEntity.ok(warehouseService.getDashboardStats());
    }

    @GetMapping("/products")
    public ResponseEntity<?> getProducts(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(warehouseService.getProducts(search));
    }

    @GetMapping("/imports")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'KHO', 'MANAGER')")
    public ResponseEntity<?> getAllImports(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(warehouseService.getAllImports(status));
    }

    @PostMapping("/import/{id}/approve")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> approveImport(@PathVariable Integer id, @AuthenticationPrincipal User user) {
        try {
            warehouseService.approveImport(id, user.getId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/import/{id}/reject")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> rejectImport(@PathVariable Integer id, @AuthenticationPrincipal User user) {
        try {
            warehouseService.rejectImport(id, user.getId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/import")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'KHO')")
    public ResponseEntity<?> importStock(@RequestBody @Valid com.gara.dto.ImportRequestDTO req,
            @AuthenticationPrincipal User user) {
        try {
            Integer importId = warehouseService.importStock(req, user.getId());
            return ResponseEntity.ok(Map.of("success", true, "importId", importId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @GetMapping("/history/import")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'KHO')")
    public ResponseEntity<?> getImportHistory() {
        return ResponseEntity.ok(warehouseService.getImportHistory());
    }

    @GetMapping("/import/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'KHO')")
    public ResponseEntity<?> getImportNoteDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(warehouseService.getImportNoteDetail(id));
    }

    @GetMapping("/history/export")
    public ResponseEntity<?> getExportHistory() {
        return ResponseEntity.ok(warehouseService.getExportHistory());
    }

    @GetMapping("/inventory/product/{productId}")
    public ResponseEntity<?> getProduct(@PathVariable Integer productId) {
        return ResponseEntity.ok(warehouseService.getProduct(productId));
    }

    @GetMapping("/inventory/{productId}/batches")
    public ResponseEntity<?> getProductBatches(@PathVariable Integer productId) {
        return ResponseEntity.ok(warehouseService.getProductBatches(productId));
    }

    @GetMapping("/inventory/{productId}/movements")
    public ResponseEntity<?> getProductMovements(@PathVariable Integer productId) {
        return ResponseEntity.ok(warehouseService.getProductMovements(productId));
    }

    @PostMapping("/inventory/batch/{batchId}/dispose")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'KHO')")
    public ResponseEntity<?> disposeBatch(@PathVariable Integer batchId, @AuthenticationPrincipal User user) {
        try {
            warehouseService.disposeBatch(batchId, user.getId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
