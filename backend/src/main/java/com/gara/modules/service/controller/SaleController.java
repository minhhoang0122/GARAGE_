package com.gara.modules.service.controller;

import com.gara.modules.service.service.SaleService;
import com.gara.modules.identity.service.UserService;
import com.gara.dto.*;
import com.gara.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import com.gara.entity.enums.ItemStatus;

@RestController
@RequestMapping("/api/sale")
public class SaleController {

    private static final Logger log = LoggerFactory.getLogger(SaleController.class);
    private final SaleService saleService;
    private final UserService userService;

    public SaleController(SaleService saleService, UserService userService) {
        this.saleService = saleService;
        this.userService = userService;
    }

    private ResponseEntity<?> handleUnauthorized() {
        return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(saleService.getOrders(status));
    }

    @GetMapping("/customers")
    public ResponseEntity<?> getCustomers(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(saleService.searchCustomers(search));
    }

    @PostMapping("/customers")
    public ResponseEntity<?> createCustomer(@RequestBody com.gara.entity.Customer customer) {
        try {
            return ResponseEntity.ok(saleService.createCustomer(customer));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<OrderDetailDTO> getOrderDetails(@PathVariable Integer id) {
        return ResponseEntity.ok(saleService.getOrderDetails(id));
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>> searchProducts(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(saleService.searchProducts(search));
    }

    @PostMapping("/orders/{id}/items")
    public ResponseEntity<?> addItem(@PathVariable Integer id, @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null)
                return handleUnauthorized();

            Integer productId = Integer.parseInt(body.get("productId").toString());
            Integer quantity = Integer.parseInt(body.get("quantity").toString());
            saleService.addItem(id, productId, quantity, user);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PatchMapping("/items/{id}")
    public ResponseEntity<?> updateItem(@PathVariable Integer id, @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null)
                return handleUnauthorized();

            Integer quantity = body.containsKey("quantity") ? Integer.parseInt(body.get("quantity").toString()) : null;
            Double discountPercent = body.containsKey("discountPercent")
                    ? Double.parseDouble(body.get("discountPercent").toString())
                    : null;

            saleService.updateItem(id, quantity, discountPercent, user);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PatchMapping("/items/{id}/status")
    public ResponseEntity<?> updateItemStatus(@PathVariable Integer id, @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null)
                return handleUnauthorized();

            ItemStatus status = ItemStatus.valueOf(body.get("status"));
            saleService.updateItemStatus(id, status, user);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<?> removeItem(@PathVariable Integer id,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null)
                return handleUnauthorized();

            saleService.removeItem(id, user);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/orders/{id}/submit")
    public ResponseEntity<?> submitToCustomer(@PathVariable Integer id,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null)
                return handleUnauthorized();

            saleService.submitToCustomer(id, user);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/orders/{id}/submit-replenishment")
    public ResponseEntity<?> submitReplenishment(@PathVariable Integer id,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null)
                return handleUnauthorized();

            saleService.submitReplenishmentQuote(id, user);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/orders/{id}/finalize")
    public ResponseEntity<?> finalizeOrder(@PathVariable Integer id,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null)
                return handleUnauthorized();

            saleService.finalizeOrder(id, user);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/orders/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Integer id, @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null)
                return handleUnauthorized();

            String reason = body.getOrDefault("reason", "Hủy theo yêu cầu khách hàng");
            saleService.cancelOrder(id, reason, user);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/orders/{id}/deposit")
    public ResponseEntity<?> updateDeposit(@PathVariable Integer id, @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null)
                return handleUnauthorized();

            java.math.BigDecimal amount = new java.math.BigDecimal(body.get("amount").toString());
            saleService.updateDeposit(id, amount, user);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/orders/{id}/close")
    public ResponseEntity<?> closeOrder(@PathVariable Integer id,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null)
                return handleUnauthorized();

            saleService.closeOrder(id, user);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/orders/{id}/warranty")
    public ResponseEntity<?> createWarranty(@PathVariable Integer id, @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null)
                return handleUnauthorized();

            @SuppressWarnings("unchecked")
            java.util.List<Integer> itemIds = (java.util.List<Integer>) body.get("itemIds");
            Integer currentOdo = body.containsKey("odo") ? Integer.parseInt(body.get("odo").toString()) : null;
            Integer warrantyOrderId = saleService.createWarrantyOrder(id, itemIds, currentOdo, user);
            return ResponseEntity.ok(Map.of("success", true, "warrantyOrderId", warrantyOrderId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            return ResponseEntity.ok(saleService.getDashboardStats());
        } catch (Exception e) {
            log.error("Dashboard stats error", e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage(), "type", e.getClass().getSimpleName()));
        }
    }
}
