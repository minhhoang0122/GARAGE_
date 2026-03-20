package com.gara.modules.inventory.controller;

import com.gara.modules.inventory.service.InventoryReservationService;
import com.gara.modules.inventory.service.WarehouseService;
import com.gara.modules.identity.service.UserService;
import com.gara.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.Map;

@RestController
@RequestMapping("/api/warehouse")
public class WarehouseController {

    private final InventoryReservationService inventoryService;
    private final WarehouseService warehouseService;
    private final UserService userService;

    public WarehouseController(InventoryReservationService inventoryService,
            WarehouseService warehouseService,
            UserService userService) {
        this.inventoryService = inventoryService;
        this.warehouseService = warehouseService;
        this.userService = userService;
    }

    private ResponseEntity<?> handleUnauthorized() {
        return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
    }

    @PostMapping("/reserve/{orderId}")
    public ResponseEntity<?> createReservation(@PathVariable Integer orderId,
            @AuthenticationPrincipal Object principal) {
        User user = userService.getCurrentUser();
        if (user == null)
            return handleUnauthorized();
        try {
            inventoryService.createReservation(orderId, user.getId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/export/{orderId}")
    public ResponseEntity<?> exportOrder(@PathVariable Integer orderId,
            @AuthenticationPrincipal Object principal) {
        User user = userService.getCurrentUser();
        if (user == null)
            return handleUnauthorized();
        try {
            Integer exportId = warehouseService.exportOrder(orderId, user.getId());
            return ResponseEntity.ok(Map.of("success", true, "exportId", exportId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/release/{orderId}")
    public ResponseEntity<?> releaseReservation(@PathVariable Integer orderId, @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Object principal) {
        User user = userService.getCurrentUser();
        if (user == null)
            return handleUnauthorized();
        try {
            inventoryService.releaseReservation(orderId, body.getOrDefault("reason", "Manual cleaning"), user.getId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/import/{id}/approve")
    public ResponseEntity<?> approveImport(@PathVariable Integer id, @AuthenticationPrincipal Object principal) {
        User user = userService.getCurrentUser();
        if (user == null)
            return handleUnauthorized();
        try {
            warehouseService.approveImport(id, user.getId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/import")
    public ResponseEntity<?> importStock(@RequestBody @Valid com.gara.dto.ImportRequestDTO req,
            @AuthenticationPrincipal Object principal) {
        User user = userService.getCurrentUser();
        if (user == null)
            return handleUnauthorized();
        try {
            Integer importId = warehouseService.importStock(req, user.getId());
            return ResponseEntity.ok(Map.of("success", true, "importId", importId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    // Other endpoints remain the same as they don't use @AuthenticationPrincipal
    // directly
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingExportOrders() {
        return ResponseEntity.ok(warehouseService.getPendingExportOrders());
    }

    @GetMapping("/export/{id}")
    public ResponseEntity<?> getOrderExportDetails(@PathVariable Integer id) {
        return ResponseEntity.ok(warehouseService.getOrderExportDetails(id));
    }

    @GetMapping("/products")
    public ResponseEntity<?> getProducts(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(warehouseService.getProducts(search));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getWarehouseStats() {
        return ResponseEntity.ok(warehouseService.getDashboardStats());
    }

    @GetMapping("/imports")
    public ResponseEntity<?> getImports(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(warehouseService.getAllImports(status));
    }

    @GetMapping("/history/import")
    public ResponseEntity<?> getImportHistory() {
        return ResponseEntity.ok(warehouseService.getImportHistory());
    }

    @GetMapping("/history/export")
    public ResponseEntity<?> getExportHistory() {
        return ResponseEntity.ok(warehouseService.getExportHistory());
    }

    @GetMapping("/import/{id}")
    public ResponseEntity<?> getImportDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(warehouseService.getImportNoteDetail(id));
    }

    @GetMapping("/inventory/product/{id}")
    public ResponseEntity<?> getProductDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(warehouseService.getProduct(id));
    }

    @GetMapping("/inventory/{productId}/batches")
    public ResponseEntity<?> getProductBatches(@PathVariable Integer productId) {
        return ResponseEntity.ok(warehouseService.getProductBatches(productId));
    }

    @GetMapping("/inventory/{productId}/movements")
    public ResponseEntity<?> getProductMovements(@PathVariable Integer productId) {
        return ResponseEntity.ok(warehouseService.getProductMovements(productId));
    }

    @PostMapping("/import/{id}/reject")
    public ResponseEntity<?> rejectImport(@PathVariable Integer id, @AuthenticationPrincipal Object principal) {
        User user = userService.getCurrentUser();
        if (user == null)
            return handleUnauthorized();
        try {
            warehouseService.rejectImport(id, user.getId());
            return ResponseEntity.ok(Map.of("message", "Đã từ chối phiếu nhập kho"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/inventory/batch/{batchId}/dispose")
    public ResponseEntity<?> disposeBatch(@PathVariable Integer batchId) {
        User user = userService.getCurrentUser();
        if (user == null)
            return handleUnauthorized();
        try {
            warehouseService.disposeBatch(batchId, user.getId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
